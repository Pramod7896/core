import * as allModels from "../models/index.js";
import { logger } from "../config/logger.js";
import { createAuditLog } from "./auditLog.service.js";
import { PAGE_CRUD_AUDIT_MESSAGES } from "../constant/auditLog.constants.js";
import bcrypt from "bcrypt";
import { AppError } from "../middlewares/error.middleware.js";
import { modelFieldMapping } from "../utils/modelFieldMapping.js";

const { FieldConfiguration } = allModels;

const hasAttribute = (Model, field) => Boolean(Model?.rawAttributes?.[field]);

const getAuditRecordIdentifier = (modelName, record) => {
  if (!record) return null;
  const normalized = String(modelName || "").trim().toUpperCase();
  const meta = modelFieldMapping[normalized];

  const preferredField =
    normalized === "USER"
      ? "user_email"
      : normalized === "ENTERPRIZE"
        ? "enterprize_name"
        : normalized === "ROLE"
          ? "role_name"
          : meta?.titleField;

  if (preferredField) {
    const value = record.get ? record.get(preferredField) : record[preferredField];
    if (value !== undefined && value !== null && String(value).trim().length) {
      return String(value).trim();
    }
  }

  const pk =
    meta?.primaryKey ||
    (record.get ? Object.keys(record.constructor?.primaryKeys || {})[0] : null) ||
    null;

  if (pk) {
    const value = record.get ? record.get(pk) : record[pk];
    if (value !== undefined && value !== null && String(value).trim().length) {
      return String(value).trim();
    }
  }

  return null;
};

const getPrimaryKeyField = (Model) => {
  const pkFromPrimaryKeys = Object.keys(Model?.primaryKeys || {})[0];
  if (pkFromPrimaryKeys) return pkFromPrimaryKeys;

  const pkFromAttributes = Object.keys(Model?.rawAttributes || {}).find(
    (attr) => Model.rawAttributes[attr]?.primaryKey,
  );
  return pkFromAttributes || "id";
};

const resolveModelByTable = (tableName) => {
  const target = String(tableName || "").toLowerCase();
  return Object.values(allModels).find(
    (m) => m?.tableName && String(m.tableName).toLowerCase() === target,
  );
};

const getEnterprizeFilter = (user, Model) => {
  if (user?.is_super_admin) return {};

  if (
    hasAttribute(Model, "enterprize_fid") &&
    user?.enterprize_id !== undefined
  ) {
    return { enterprize_fid: user.enterprize_id };
  }

  if (
    String(Model?.tableName || "").toLowerCase() === "enterprizes" &&
    hasAttribute(Model, "enterprize_id") &&
    user?.enterprize_id !== undefined
  ) {
    return { enterprize_id: user.enterprize_id };
  }

  return {};
};

const getViewerRoleLevel = (user) =>
  user?.is_super_admin ? Number.MAX_SAFE_INTEGER : Number(user?.max_role_level ?? 0);

const normalizeToIdList = (value) => {
  if (value === undefined || value === null || value === "") return [];
  if (Array.isArray(value)) return value.filter((v) => v !== undefined && v !== null && v !== "");
  return [value];
};

const assertRoleIdsWithinViewerLevel = async ({ user, roleIds }) => {
  const viewerRoleLevel = getViewerRoleLevel(user);

  const numericRoleIds = roleIds.map((id) => Number(id)).filter((id) => Number.isFinite(id));
  if (numericRoleIds.length === 0) return;

  const roles = await allModels.Role.findAll({
    where: {
      role_id: numericRoleIds,
      role_status: "active",
      ...(user?.is_super_admin ? {} : { enterprize_fid: user.enterprize_id }),
    },
    attributes: ["role_id", "role_level", "enterprize_fid"],
    raw: true,
  });

  if (roles.length !== numericRoleIds.length) {
    throw new AppError("Invalid role selection", 400, "PAGE_CRUD");
  }

  const exceeds = roles.some((r) => Number(r.role_level ?? 0) > viewerRoleLevel);
  if (exceeds) {
    throw new AppError("Forbidden: role level exceeds your access", 403, "PAGE_CRUD");
  }
};

const addAuditColumnsIfPresent = (
  payload,
  Model,
  user,
  now,
  isCreate = false,
) => {
  const nextPayload = { ...payload };

  if (
    hasAttribute(Model, "enterprize_fid") &&
    user?.enterprize_id !== undefined &&
    (nextPayload.enterprize_fid === undefined ||
      nextPayload.enterprize_fid === null ||
      nextPayload.enterprize_fid === "")
  ) {
    nextPayload.enterprize_fid = user.enterprize_id;
  }

  if (
    isCreate &&
    hasAttribute(Model, "created_by") &&
    user?.user_id !== undefined
  ) {
    nextPayload.created_by = user.user_id;
  }
  if (hasAttribute(Model, "updated_by") && user?.user_id !== undefined) {
    nextPayload.updated_by = user.user_id;
  }

  if (isCreate && hasAttribute(Model, "created_timestamp")) {
    nextPayload.created_timestamp = now;
  }
  if (hasAttribute(Model, "updated_timestamp")) {
    nextPayload.updated_timestamp = now;
  }

  return nextPayload;
};

const inferSourceKey = (RelationModel, parentModelName, parentPrimaryKey) => {
  if (!RelationModel) return null;

  const candidates = [];
  if (parentModelName) {
    candidates.push(`${String(parentModelName).toLowerCase()}_fid`);
  }

  if (parentPrimaryKey?.endsWith("_id")) {
    candidates.push(parentPrimaryKey.replace(/_id$/, "_fid"));
  }

  for (const candidate of candidates) {
    if (hasAttribute(RelationModel, candidate)) return candidate;
  }

  return null;
};

const splitDataByTargetTable = async (modelName, data) => {
  const Model = allModels[modelName];
  const mainTableName = String(Model.tableName || "").toLowerCase();

  const fieldConfigs = await FieldConfiguration.findAll({
    where: { model_name: String(modelName).toLowerCase() },
    raw: true,
  });

  const configByFieldName = new Map();
  const relationMeta = {};
  for (const field of fieldConfigs) {
    configByFieldName.set(field.field_name, field);

    if (
      field.target_table &&
      String(field.target_table).toLowerCase() !== mainTableName
    ) {
      const table = String(field.target_table).toLowerCase();
      if (!relationMeta[table]) {
        relationMeta[table] = { sourceKey: null };
      }
      if (!relationMeta[table].sourceKey && field.source_key) {
        relationMeta[table].sourceKey = field.source_key;
      }
    }
  }

  const mainData = {};
  const relationData = {};

  for (const [key, value] of Object.entries(data || {})) {
    const field = configByFieldName.get(key);
    const targetTable = field?.target_table
      ? String(field.target_table).toLowerCase()
      : null;

    if (targetTable && targetTable !== mainTableName) {
      relationData[targetTable] = relationData[targetTable] || {};
      relationData[targetTable][key] = value;
    } else {
      mainData[key] = value;
    }
  }

  return { mainData, relationData, relationMeta };
};

const hashPasswordFields = async (Model, data) => {
  const hashedData = { ...data };
  for (const attr of Object.keys(Model.rawAttributes || {})) {
    if (attr.toLowerCase().includes("password") && data[attr]) {
      const salt = await bcrypt.genSalt(10);
      hashedData[attr] = await bcrypt.hash(data[attr], salt);
    }
  }
  return hashedData;
};

const convertFilesToPaths = (data) => {
  const normalized = { ...data };

  for (const [key, value] of Object.entries(normalized)) {
    if (
      value &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      value.path
    ) {
      normalized[key] = value.path;
      continue;
    }

    if (Array.isArray(value)) {
      const pathValues = value
        .map((item) => {
          if (item && typeof item === "object" && item.path) return item.path;
          return item;
        })
        .filter((item) => item !== undefined && item !== null);

      if (pathValues.length === 1) normalized[key] = pathValues[0];
      else normalized[key] = pathValues;
    }
  }

  return normalized;
};

export const createDynamicRecordService = async (req, { model_name, data }) => {
  const user = req.user;
  const ip = req.ip;
  const now = new Date();

  try {
    const Model = allModels[model_name];
    if (!Model) throw new Error(`Invalid model: ${model_name}`);

    data = convertFilesToPaths(data);

    const { mainData, relationData, relationMeta } =
      await splitDataByTargetTable(model_name, data);

    let createPayload = addAuditColumnsIfPresent(
      mainData,
      Model,
      user,
      now,
      true,
    );

    // Enforce tenant ownership regardless of client payload for non-superadmins.
    if (!user?.is_super_admin && hasAttribute(Model, "enterprize_fid")) {
      createPayload.enterprize_fid = user.enterprize_id;
    }
    if (
      !user?.is_super_admin &&
      String(Model?.tableName || "").toLowerCase() === "enterprizes" &&
      hasAttribute(Model, "enterprize_id")
    ) {
      // Prevent cross-enterprize creation/management by normal admins.
      throw new AppError("Forbidden: enterprize management is restricted", 403, "PAGE_CRUD");
    }

    // Role/user visibility rules
    if (!user?.is_super_admin && String(model_name).toLowerCase() === "role") {
      const roleLevel = Number(createPayload.role_level ?? 0);
      if (roleLevel > getViewerRoleLevel(user)) {
        throw new AppError("Forbidden: role level exceeds your access", 403, "PAGE_CRUD");
      }
    }

    if (!user?.is_super_admin && String(model_name).toLowerCase() === "user") {
      if (createPayload.is_super_admin === true) {
        throw new AppError("Forbidden: cannot create superadmin users", 403, "PAGE_CRUD");
      }
    }

    createPayload = await hashPasswordFields(Model, createPayload);

    const createdRecord = await Model.create(createPayload);
    const parentPrimaryKey = getPrimaryKeyField(Model);
    const parentId = createdRecord.get
      ? createdRecord.get(parentPrimaryKey)
      : createdRecord[parentPrimaryKey];

    for (const [table, payload] of Object.entries(relationData)) {
      const RelationModel = resolveModelByTable(table);
      if (!RelationModel) {
        logger.warn(`[SERVICE] Relation model missing for table='${table}'`);
        continue;
      }

      // Role assignment restrictions for admins (User -> user_roles -> Role)
      if (
        !user?.is_super_admin &&
        String(model_name).toLowerCase() === "user" &&
        String(RelationModel?.tableName || "").toLowerCase() === "user_roles"
      ) {
        const roleIds = normalizeToIdList(payload.role_fid);
        await assertRoleIdsWithinViewerLevel({ user, roleIds });
      }

      const configuredSourceKey = relationMeta[table]?.sourceKey;
      const sourceKey =
        configuredSourceKey ||
        inferSourceKey(RelationModel, model_name, parentPrimaryKey);

      let relationPayload = { ...payload };
      if (sourceKey) {
        relationPayload[sourceKey] = parentId;
      }

      relationPayload = addAuditColumnsIfPresent(
        relationPayload,
        RelationModel,
        user,
        now,
        true,
      );

      await RelationModel.create(relationPayload);
      logger.debug(`[SERVICE] Created relation record in table='${table}'`);
    }

    await createAuditLog({
      user_fid: user.user_id,
      enterprize_fid: user.enterprize_id,
      action: "CREATE",
      description: (() => {
        const recordIdentifier = getAuditRecordIdentifier(model_name, createdRecord);
        const base = PAGE_CRUD_AUDIT_MESSAGES.CREATE_SUCCESS.replace(
          "{username}",
          user.user_email || user.user_name,
        ).replace("{model}", model_name);
        return recordIdentifier ? `${base} ('${recordIdentifier}')` : base;
      })(),
      ip,
      status: "success",
      created_by: user.user_id,
    });

    logger.info(
      `[SERVICE] Created record for model=${model_name}, userId=${user.user_id}`,
    );
    return createdRecord;
  } catch (error) {
    logger.error(
      `[SERVICE] Error in createDynamicRecordService: ${error.message}`,
    );
    throw error;
  }
};

export const updateDynamicRecordService = async (
  req,
  { model_name, primaryKey, id, data },
) => {
  const user = req.user;
  const now = new Date();

  try {
    const Model = allModels[model_name];
    if (!Model) throw new Error(`Model not found: ${model_name}`);

    data = convertFilesToPaths(data);

    const { mainData, relationData, relationMeta } =
      await splitDataByTargetTable(model_name, data);

    let updatePayload = addAuditColumnsIfPresent(
      mainData,
      Model,
      user,
      now,
      false,
    );

    // Enforce tenant ownership regardless of client payload for non-superadmins.
    if (!user?.is_super_admin && hasAttribute(Model, "enterprize_fid")) {
      updatePayload.enterprize_fid = user.enterprize_id;
    }

    if (
      !user?.is_super_admin &&
      String(Model?.tableName || "").toLowerCase() === "enterprizes" &&
      hasAttribute(Model, "enterprize_id")
    ) {
      // Non-superadmins may only update their own enterprize row (enforced by getEnterprizeFilter).
    }

    // Prevent updating superadmin users and prevent elevating flags/levels.
    if (!user?.is_super_admin && String(model_name).toLowerCase() === "user") {
      if (updatePayload.is_super_admin !== undefined) {
        delete updatePayload.is_super_admin;
      }

      const existing = await Model.findOne({
        where: { [primaryKey]: id, ...getEnterprizeFilter(user, Model) },
        attributes: ["is_super_admin"],
        raw: true,
      });

      if (existing?.is_super_admin) {
        throw new AppError("Forbidden: cannot modify superadmin users", 403, "PAGE_CRUD");
      }
    }

    if (!user?.is_super_admin && String(model_name).toLowerCase() === "role") {
      if (updatePayload.role_level !== undefined) {
        const roleLevel = Number(updatePayload.role_level ?? 0);
        if (roleLevel > getViewerRoleLevel(user)) {
          throw new AppError("Forbidden: role level exceeds your access", 403, "PAGE_CRUD");
        }
      }
    }

    updatePayload = await hashPasswordFields(Model, updatePayload);

    await Model.update(updatePayload, {
      where: { [primaryKey]: id, ...getEnterprizeFilter(user, Model) },
    });

    for (const [table, payload] of Object.entries(relationData)) {
      const RelationModel = resolveModelByTable(table);
      if (!RelationModel) {
        logger.warn(`[SERVICE] Relation model missing for table='${table}'`);
        continue;
      }

      // Role assignment restrictions for admins (User -> user_roles -> Role)
      if (
        !user?.is_super_admin &&
        String(model_name).toLowerCase() === "user" &&
        String(RelationModel?.tableName || "").toLowerCase() === "user_roles"
      ) {
        const roleIds = normalizeToIdList(payload.role_fid);
        await assertRoleIdsWithinViewerLevel({ user, roleIds });
      }

      const configuredSourceKey = relationMeta[table]?.sourceKey;
      const sourceKey =
        configuredSourceKey ||
        inferSourceKey(RelationModel, model_name, primaryKey);

      if (!sourceKey) {
        logger.warn(
          `[SERVICE] Missing source key for relation table='${table}' and model='${model_name}'`,
        );
        continue;
      }

      let relationUpdatePayload = addAuditColumnsIfPresent(
        payload,
        RelationModel,
        user,
        now,
        false,
      );

      relationUpdatePayload = await hashPasswordFields(
        RelationModel,
        relationUpdatePayload,
      );

      const relationWhere = {
        [sourceKey]: id,
        ...getEnterprizeFilter(user, RelationModel),
      };

      const [updatedCount] = await RelationModel.update(relationUpdatePayload, {
        where: relationWhere,
      });

      if (updatedCount === 0) {
        const createPayload = addAuditColumnsIfPresent(
          { ...payload, [sourceKey]: id },
          RelationModel,
          user,
          now,
          true,
        );
        await RelationModel.create(createPayload);
      }
    }

    logger.info(
      `[SERVICE] updateDynamicRecordService completed for model=${model_name}, id=${id}`,
    );
    return true;
  } catch (error) {
    logger.error(
      `[SERVICE] Error in updateDynamicRecordService for model=${model_name}, id=${id}, error=${error.message}`,
    );
    throw error;
  }
};

export const deleteDynamicRecordService = async (
  req,
  { model_name, primaryKey, id },
) => {
  const user = req.user;

  try {
    const Model = allModels[model_name];
    if (!Model) throw new Error(`Model not found: ${model_name}`);

    if (
      !user?.is_super_admin &&
      String(model_name).toLowerCase() === "user"
    ) {
      const existing = await Model.findOne({
        where: { [primaryKey]: id, ...getEnterprizeFilter(user, Model) },
        attributes: ["is_super_admin"],
        raw: true,
      });

      if (existing?.is_super_admin) {
        throw new AppError("Forbidden: cannot delete superadmin users", 403, "PAGE_CRUD");
      }
    }

    const mainTableName = String(Model.tableName || "").toLowerCase();
    const fieldConfigs = await FieldConfiguration.findAll({
      where: { model_name: String(model_name).toLowerCase() },
      raw: true,
    });

    const relationTableToSourceKey = {};
    for (const field of fieldConfigs) {
      if (!field.target_table) continue;
      const table = String(field.target_table).toLowerCase();
      if (table === mainTableName) continue;
      if (!relationTableToSourceKey[table] && field.source_key) {
        relationTableToSourceKey[table] = field.source_key;
      }
    }

    for (const [table, configuredSourceKey] of Object.entries(
      relationTableToSourceKey,
    )) {
      const RelationModel = resolveModelByTable(table);
      if (!RelationModel) continue;

      const sourceKey =
        configuredSourceKey ||
        inferSourceKey(RelationModel, model_name, primaryKey);
      if (!sourceKey) continue;

      await RelationModel.destroy({
        where: {
          [sourceKey]: id,
          ...getEnterprizeFilter(user, RelationModel),
        },
      });
    }

    await Model.destroy({
      where: { [primaryKey]: id, ...getEnterprizeFilter(user, Model) },
    });

    logger.info(`[SERVICE] Deleted record for model=${model_name}, id=${id}`);
    return true;
  } catch (error) {
    logger.error(
      `[SERVICE] Error in deleteDynamicRecordService: ${error.message}`,
    );
    throw error;
  }
};

export const changeStatusService = async (
  req,
  { model_name, primaryKey, id, status },
) => {
  const user = req.user;
  const now = new Date();

  try {
    const Model = allModels[model_name];
    if (!Model) throw new Error(`Model not found: ${model_name}`);

    const modelStatusField = `${String(model_name).toLowerCase()}_status`;
    const statusField = hasAttribute(Model, modelStatusField)
      ? modelStatusField
      : hasAttribute(Model, "status")
        ? "status"
        : null;

    if (!statusField) {
      throw new Error(`No status field found for model: ${model_name}`);
    }

    const statusPayload = addAuditColumnsIfPresent(
      { [statusField]: status },
      Model,
      user,
      now,
      false,
    );

    await Model.update(statusPayload, {
      where: { [primaryKey]: id, ...getEnterprizeFilter(user, Model) },
    });

    logger.info(
      `[SERVICE] Changed status for model=${model_name}, id=${id} to ${status}`,
    );
    return true;
  } catch (error) {
    logger.error(`[SERVICE] Error in changeStatusService: ${error.message}`);
    throw error;
  }
};
