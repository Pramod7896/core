import * as allModels from "../models/index.js";
import { modelFieldMapping } from "../utils/modelFieldMapping.js";
import { Page, FieldConfiguration } from "../models/index.js";

import { logger } from "../config/logger.js";
import { createAuditLog } from "./auditLog.service.js";
import { PAGE_AUDIT_LOG_MESSAGES } from "../constant/auditLog.constants.js";
import { PAGE_LOG_MESSAGES } from "../constant/logMessages.js";

import util from "util";
import { Op, fn, col, where as sqlWhere } from "sequelize";

/**
 * =====================================================
 * ENTERPRIZE FILTER
 * =====================================================
 */
const getEnterprizeFilter = (user, Model) => {
  if (user?.is_super_admin) return {};

  // Standard tenant FK
  if (Model?.rawAttributes?.enterprize_fid && user?.enterprize_id !== undefined) {
    return { enterprize_fid: user.enterprize_id };
  }

  // Enterprize table itself is tenant-owned for normal admins
  if (
    String(Model?.tableName || "").toLowerCase() === "enterprizes" &&
    Model?.rawAttributes?.enterprize_id &&
    user?.enterprize_id !== undefined
  ) {
    return { enterprize_id: user.enterprize_id };
  }

  return {};
};

const shouldApplyRoleVisibility = (user) => !user?.is_super_admin;

const getRoleLevel = (user) => Number(user?.max_role_level ?? 0);

const getReferenceModelWhere = (user, RefModel) => {
  const where = getEnterprizeFilter(user, RefModel);
  const applyRoleVisibility = shouldApplyRoleVisibility(user);
  const viewerRoleLevel = getRoleLevel(user);

  if (applyRoleVisibility && RefModel?.rawAttributes?.role_level) {
    where.role_level = { [Op.lte]: viewerRoleLevel };
  }

  if (applyRoleVisibility && RefModel?.rawAttributes?.is_super_admin) {
    where.is_super_admin = { [Op.not]: true };
  }

  return where;
};

const getDefaultOrder = (Model, primaryKey) => {
  const attributes = Model?.rawAttributes || {};
  const order = [];

  if (attributes.updated_timestamp) order.push(["updated_timestamp", "DESC"]);
  if (attributes.updatedAt) order.push(["updatedAt", "DESC"]);
  if (attributes.created_timestamp) order.push(["created_timestamp", "DESC"]);
  if (attributes.createdAt) order.push(["createdAt", "DESC"]);

  if (primaryKey && attributes[primaryKey]) {
    order.push([primaryKey, "DESC"]);
  }

  if (order.length === 0) {
    const fallbackKey = Object.keys(attributes)[0];
    if (fallbackKey) order.push([fallbackKey, "DESC"]);
  }

  return order;
};

const isEnterpriseField = (field = {}) => {
  const name = String(field.name || field.field_name || "").toLowerCase();
  const label = String(field.label || field.field_label || "").toLowerCase();
  return (
    name.includes("enterprise") ||
    name.includes("enterprize") ||
    label.includes("enterprise") ||
    label.includes("enterprize")
  );
};

const orderFormFields = (fields = []) => {
  const enterpriseSelect = [];
  const otherSelects = [];
  const nonSelects = [];

  fields.forEach((field) => {
    if (field.type !== "select") {
      nonSelects.push(field);
      return;
    }

    if (isEnterpriseField(field)) {
      enterpriseSelect.push(field);
      return;
    }

    otherSelects.push(field);
  });

  return [...enterpriseSelect, ...otherSelects, ...nonSelects];
};

/**
 * =====================================================
 * GET PAGE DATA SERVICE (FULL DYNAMIC RELATION SUPPORT)
 * =====================================================
 */
export const getPageDataService = async (req, res) => {
  const user = req.user || {};
  const requestId = req.requestId || "N/A";

  try {
    const { page_code } = req.query;
    if (!page_code)
      return res.status(400).json({ error: "Page code required" });

    /**
     * =====================================================
     * PAGE META
     * =====================================================
     */
    const normalizedPageCode = String(page_code).trim();
    const normalizedPageCodeLower = normalizedPageCode.toLowerCase();

    const pageRow = await Page.findOne({
      where: {
        [Op.and]: [
          sqlWhere(fn("lower", col("model_name")), normalizedPageCodeLower),
          { is_active: true },
          { page_status: "active" },
          ...(user?.is_super_admin
            ? []
            : [{ enterprize_fid: user.enterprize_id }]),
        ],
      },
      raw: true,
    });

    if (!pageRow) return res.status(404).json({ error: "Page not found" });

    /**
     * =====================================================
     * STATIC CONFIG
     * =====================================================
     */
    const config = modelFieldMapping[pageRow.model_name.toUpperCase()];
    if (!config) return res.status(404).json({ error: "Page config missing" });

    /**
     * =====================================================
     * TARGET MODEL
     * =====================================================
     */

    logger.debug(`All model names: ${Object.keys(allModels).join(", ")}`);
    logger.debug(` model name from frontend: ${pageRow.model_name}`);

    const TargetModel = allModels[pageRow.model_name];
    if (!TargetModel) return res.status(404).json({ error: "Model missing" });

    const primaryKey = Object.keys(TargetModel.primaryKeys)[0] || "id";

    /**
     * =====================================================
     * FETCH MAIN DATA
     * =====================================================
     */
    const whereCondition = getEnterprizeFilter(user, TargetModel);
    const applyRoleVisibility = shouldApplyRoleVisibility(user);
    const viewerRoleLevel = getRoleLevel(user);

    let data = await TargetModel.findAll({
      where: {
        ...whereCondition,
        ...(applyRoleVisibility && TargetModel?.rawAttributes?.role_level
          ? { role_level: { [Op.lte]: viewerRoleLevel } }
          : {}),
        ...(applyRoleVisibility && TargetModel?.rawAttributes?.is_super_admin
          ? { is_super_admin: { [Op.not]: true } }
          : {}),
      },
      order: getDefaultOrder(TargetModel, primaryKey),
      raw: true,
    });

    // Extra: role-level visibility for users requires joining through roles.
    if (
      applyRoleVisibility &&
      String(TargetModel?.tableName || "").toLowerCase() === "users" &&
      TargetModel?.rawAttributes?.user_id
    ) {
      const userIds = data.map((row) => row.user_id).filter(Boolean);

      if (userIds.length > 0) {
        const [rows] = await allModels.sequelize.query(
          `
            SELECT ur.user_fid AS user_id, COALESCE(MAX(r.role_level), 0) AS max_role_level
            FROM "user_roles" ur
            JOIN "roles" r ON r.role_id = ur.role_fid
            WHERE ur.user_fid = ANY($1)
              AND ur.user_role_status = 'active'
              AND r.role_status = 'active'
            GROUP BY ur.user_fid;
          `,
          { bind: [userIds] },
        );

        const maxRoleByUserId = new Map(
          (rows || []).map((r) => [Number(r.user_id), Number(r.max_role_level)]),
        );

        data = data.filter((row) => {
          const userId = Number(row.user_id);
          const level = maxRoleByUserId.get(userId) ?? 0;
          return level <= viewerRoleLevel;
        });
      }
    }

    /**
     * =====================================================
     * FETCH FIELD CONFIG
     * =====================================================
     */
    const fieldConfigs = await FieldConfiguration.findAll({
      where: { model_name: pageRow.model_name.toLowerCase() },
      raw: true,
    });

    /**
     * =====================================================
     * PROCESS RELATIONS DYNAMICALLY
     * =====================================================
     */
    const mainTableName = String(TargetModel.tableName || "").toLowerCase();

    for (const field of fieldConfigs) {
      if (!field.reference_model) continue;

      const RefModel = allModels[field.reference_model];
      if (!RefModel) continue;

      const RelationModel = Object.values(allModels).find(
        (m) => m.tableName === field.target_table,
      );

      const fieldTargetTable = String(field.target_table || "").toLowerCase();
      const isRelationField =
        Boolean(field.source_key && field.target_key) &&
        Boolean(fieldTargetTable) &&
        fieldTargetTable !== mainTableName;

      for (const row of data) {
        /**
         * =====================================================
         * CASE 1: DIRECT FOREIGN KEY
         * Example:
         * user.enterprize_fid → enterprize.enterprize_id
         * =====================================================
         */
        if (
          row[field.field_name] !== undefined &&
          row[field.field_name] !== null &&
          row[field.field_name] !== "" &&
          !isRelationField
        ) {
          const ref = await RefModel.findOne({
            where: {
              [field.reference_key]: row[field.field_name],
            },
            raw: true,
          });

          row[field.reference_label] = ref?.[field.reference_label] || null;
        } else if (isRelationField && RelationModel) {

        /**
         * =====================================================
         * CASE 2: RELATION TABLE (DYNAMIC)
         * Example:
         * user → user_roles → roles
         * =====================================================
         */
          // ✅ SAFETY CHECK
          if (!field.source_key || !field.target_key) {
            logger.warn(
              `Relation config missing source_key or target_key for field: ${field.field_name}`,
            );
            continue;
          }

          // Step 1: Find relation record dynamically
          const relation = await RelationModel.findOne({
            where: {
              [field.source_key]: row[primaryKey],
            },
            raw: true,
          });

          if (!relation) continue;

          // Step 2: Extract target id dynamically
          const targetId = relation[field.target_key];

          if (!targetId) continue;

          // attach foreign key value
          row[field.field_name] = targetId;

          // Step 3: Fetch reference label
          const ref = await RefModel.findOne({
            where: {
              [field.reference_key]: targetId,
            },
            raw: true,
          });

          row[field.reference_label] = ref?.[field.reference_label] || null;
        }
      }
    }

    /**
     * =====================================================
     * FILTER TABLE COLUMNS
     * =====================================================
     */
    data = data.map((row) => {
      const filtered = {};
      config.columns.forEach((col) => {
        filtered[col.key] = row[col.key];
      });
      fieldConfigs.forEach((field) => {
        if (row[field.field_name] !== undefined)
          filtered[field.field_name] = row[field.field_name];
        if (field.reference_label)
          filtered[field.reference_label] = row[field.reference_label];
      });
      return filtered;
    });

    /**
     * =====================================================
     * BUILD FORM CONFIG
     * =====================================================
     */
    let formConfig = [...config.form];
    for (const field of fieldConfigs) {
      if (field.input_type === "select") {
        const RefModel = allModels[field.reference_model];
        if (!RefModel) continue;
        const options = await RefModel.findAll({
          where: getReferenceModelWhere(user, RefModel),
          raw: true,
        });
        formConfig.push({
          name: field.field_name,
          label: field.field_label,
          type: "select",
          required: field.is_required,
          options: options.map((o) => ({
            label: o[field.reference_label],
            value: o[field.reference_key],
          })),
        });
      } else {
        formConfig.push({
          name: field.field_name,
          label: field.field_label,
          type: field.input_type,
          required: field.is_required,
        });
      }
    }
    formConfig = orderFormFields(formConfig);

    /**
     * =====================================================
     * BUILD STATS (3 CARDS, PAGE ICON, NO SUMMARY)
     * =====================================================
     */
    let stats_data = [];
    const statusField = TargetModel.rawAttributes[
      `${pageRow.model_name.toLowerCase()}_status`
    ]
      ? `${pageRow.model_name.toLowerCase()}_status`
      : TargetModel.rawAttributes["status"]
        ? "status"
        : null;

    if (statusField) {
      const total = data.length;
      const active = data.filter(
        (d) => d[statusField] === "active" || d[statusField] === true,
      ).length;
      const inactive = total - active;
      const pageIcon = pageRow.page_icon || null;

      // send a single stats card with overall total and summary info
      stats_data.push({
        title: pageRow.page_name || pageRow.model_name,
        icon: pageIcon,
        value: total,
        summary: [
          { label: "Active", value: active },
          { label: "Inactive", value: inactive },
        ],
      });
    }

    /**
     * =====================================================
     * RESPONSE
     * =====================================================
     */
    const response = {
      [pageRow.model_name]: {
        title: pageRow.page_name,
        code: pageRow.model_name,
        page_route: pageRow.page_route,
        model_name: pageRow.model_name,
        primaryKey,
        api: pageRow.page_api,
        stats: config.stats,
        stats_data, // ✅ Added stats cards
        columns: config.columns,
        form: formConfig,
        data,
      },
    };

    /**
     * =====================================================
     * AUDIT LOG
     * =====================================================
     */
    await createAuditLog({
      user_fid: user.user_id,
      enterprize_fid: user.enterprize_id,
      action: "PAGE_FETCH_SUCCESS",
      description: PAGE_AUDIT_LOG_MESSAGES.PAGE_FETCH_SUCCESS.replace(
        "{username}",
        user.user_email || user.user_name,
      ).replace("{page}", pageRow.page_name),
      ip: req.ip,
      status: "success",
      created_by: user.user_id,
    });

    logger.info(
      util.format(
        PAGE_LOG_MESSAGES.PAGE_FETCH_SUCCESS,
        user.user_id,
        pageRow.page_name,
        requestId,
      ),
    );

    res.json(response);
  } catch (err) {
    logger.error(err);
    res.status(500).json({ error: err.message });
  }
};
