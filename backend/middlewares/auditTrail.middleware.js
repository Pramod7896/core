import { logger } from "../config/logger.js";
import { createAuditLog } from "../services/auditLog.service.js";
import { Enterprize, Page, Role, User } from "../models/index.js";
import * as allModels from "../models/index.js";
import { modelFieldMapping } from "../utils/modelFieldMapping.js";

const CACHE_TTL_MS = 5 * 60 * 1000;

const makeCache = () => new Map();
const cacheGet = (cache, key) => {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.at > CACHE_TTL_MS) {
    cache.delete(key);
    return null;
  }
  return entry.value;
};
const cacheSet = (cache, key, value) => {
  cache.set(key, { value, at: Date.now() });
  return value;
};

const caches = {
  userIdentifier: makeCache(),
  enterprizeName: makeCache(),
  roleName: makeCache(),
  pageName: makeCache(),
  modelRecordIdentifier: makeCache(),
};

const safeString = (value) => {
  const str = String(value ?? "").trim();
  return str.length ? str : null;
};

const shouldSkipAudit = (req) => {
  if (!req) return true;

  const path = String(req.originalUrl || req.url || "").split("?")[0];

  if (req.method === "OPTIONS" || req.method === "HEAD") return true;
  if (path === "/health" || path === "/api/v1/health") return true;
  if (path.startsWith("/uploads")) return true;

  return false;
};

const resolveUserIdentifier = async (userId) => {
  const numericId = Number(userId);
  if (!Number.isFinite(numericId)) return null;

  const cached = cacheGet(caches.userIdentifier, numericId);
  if (cached) return cached;

  const user = await User.findOne({
    where: { user_id: numericId },
    attributes: ["user_id", "user_email", "user_fullname", "user_name"],
    raw: true,
  });

  if (!user) return cacheSet(caches.userIdentifier, numericId, null);

  return cacheSet(
    caches.userIdentifier,
    numericId,
    user.user_email || user.user_fullname || user.user_name || String(numericId),
  );
};

const resolveEnterprizeName = async (enterprizeId) => {
  const numericId = Number(enterprizeId);
  if (!Number.isFinite(numericId)) return null;

  const cached = cacheGet(caches.enterprizeName, numericId);
  if (cached) return cached;

  const ent = await Enterprize.findOne({
    where: { enterprize_id: numericId },
    attributes: ["enterprize_id", "enterprize_name"],
    raw: true,
  });

  return cacheSet(caches.enterprizeName, numericId, ent?.enterprize_name || null);
};

const resolveRoleName = async (roleId) => {
  const numericId = Number(roleId);
  if (!Number.isFinite(numericId)) return null;

  const cached = cacheGet(caches.roleName, numericId);
  if (cached) return cached;

  const role = await Role.findOne({
    where: { role_id: numericId },
    attributes: ["role_id", "role_name"],
    raw: true,
  });

  return cacheSet(caches.roleName, numericId, role?.role_name || null);
};

const resolvePageName = async (pageId) => {
  const numericId = Number(pageId);
  if (!Number.isFinite(numericId)) return null;

  const cached = cacheGet(caches.pageName, numericId);
  if (cached) return cached;

  const page = await Page.findOne({
    where: { page_id: numericId },
    attributes: ["page_id", "page_name"],
    raw: true,
  });

  return cacheSet(caches.pageName, numericId, page?.page_name || null);
};

const getModelMeta = (modelName) => {
  const key = String(modelName || "").trim().toUpperCase();
  if (!key) return null;
  return modelFieldMapping[key] || null;
};

const getPreferredIdentifierField = (modelName, meta) => {
  const normalized = String(modelName || "").trim().toLowerCase();
  if (normalized === "user") return "user_email";
  if (normalized === "enterprize") return "enterprize_name";
  if (normalized === "role") return "role_name";
  if (normalized === "page") return "page_name";
  return meta?.titleField || null;
};

const resolveModelRecordIdentifier = async ({
  modelName,
  id,
  enterprizeId,
  isSuperAdmin,
}) => {
  let Model = allModels[modelName];
  if (!Model) {
    const wanted = String(modelName || "").trim().toLowerCase();
    if (wanted) {
      const matchKey = Object.keys(allModels).find(
        (k) => String(k).toLowerCase() === wanted,
      );
      if (matchKey) Model = allModels[matchKey];
    }
  }
  if (!Model) return null;

  const numericId = Number(id);
  if (!Number.isFinite(numericId)) return null;

  const cacheKey = `${String(modelName)}:${numericId}:${isSuperAdmin ? "sa" : enterprizeId ?? "na"}`;
  const cached = cacheGet(caches.modelRecordIdentifier, cacheKey);
  if (cached) return cached;

  const meta = getModelMeta(modelName);
  const identifierField = getPreferredIdentifierField(modelName, meta);
  const attributes = identifierField ? [identifierField] : undefined;

  const pkField =
    meta?.primaryKey || Object.keys(Model.primaryKeys || {})[0] || null;
  if (!pkField) return cacheSet(caches.modelRecordIdentifier, cacheKey, null);

  const where = { [pkField]: numericId };

  // enforce tenant boundary if possible (best-effort)
  if (
    !isSuperAdmin &&
    enterprizeId !== undefined &&
    enterprizeId !== null &&
    Object.prototype.hasOwnProperty.call(Model.rawAttributes || {}, "enterprize_fid")
  ) {
    where.enterprize_fid = enterprizeId;
  }

  const row = await Model.findOne({ where, attributes, raw: true });

  const value = identifierField ? safeString(row?.[identifierField]) : null;
  return cacheSet(caches.modelRecordIdentifier, cacheKey, value);
};

const getActionCode = (req) => {
  const path = String(req.originalUrl || req.url || "").split("?")[0];
  const method = String(req.method || "").toUpperCase();

  if (path.startsWith("/api/v1/page-crud/")) {
    if (path.endsWith("/create")) return "PAGE_CRUD_CREATE";
    if (path.endsWith("/update")) return "PAGE_CRUD_UPDATE";
    if (path.endsWith("/delete")) return "PAGE_CRUD_DELETE";
    if (path.endsWith("/change-status")) return "PAGE_CRUD_CHANGE_STATUS";
  }

  if (path.startsWith("/api/v1/rbac/")) {
    if (path.endsWith("/update-permission")) return "RBAC_UPDATE_PERMISSION";
    if (path.endsWith("/my-rbac")) return "RBAC_FETCH";
    if (path.startsWith("/api/v1/rbac/roles/")) return "RBAC_LIST_ROLES";
    if (path.endsWith("/enterprizes")) return "RBAC_LIST_ENTERPRIZES";
  }

  if (path.startsWith("/api/v1/pages/") && path.endsWith("/get-page-data")) {
    return "PAGE_FETCH";
  }

  if (path.startsWith("/api/v1/auth/")) {
    if (path.endsWith("/login")) return "AUTH_LOGIN";
    if (path.endsWith("/logout")) return "AUTH_LOGOUT";
    if (path.endsWith("/refresh-token")) return "AUTH_REFRESH_TOKEN";
    if (path.endsWith("/forgot-password")) return "AUTH_FORGOT_PASSWORD";
    if (path.endsWith("/verify-otp")) return "AUTH_VERIFY_OTP";
    if (path.endsWith("/reset-password")) return "AUTH_RESET_PASSWORD";
  }

  return `HTTP_${method}`;
};

const getActionSentence = ({
  actionCode,
  method,
  path,
  modelName,
  recordIdentifier,
  extra,
}) => {
  const component = path?.startsWith("/api/v1/") ? path.split("/").slice(0, 4).join("/") : path;

  if (actionCode === "PAGE_CRUD_CREATE") {
    return `created a new ${modelName} record${recordIdentifier ? ` ('${recordIdentifier}')` : ""}${extra ? ` (${extra})` : ""} via ${component}`;
  }
  if (actionCode === "PAGE_CRUD_UPDATE") {
    return `updated a ${modelName} record${recordIdentifier ? ` ('${recordIdentifier}')` : ""}${extra ? ` (${extra})` : ""} via ${component}`;
  }
  if (actionCode === "PAGE_CRUD_DELETE") {
    return `deleted a ${modelName} record${recordIdentifier ? ` ('${recordIdentifier}')` : ""} via ${component}`;
  }
  if (actionCode === "PAGE_CRUD_CHANGE_STATUS") {
    return `changed status of a ${modelName} record${recordIdentifier ? ` ('${recordIdentifier}')` : ""}${extra ? ` (${extra})` : ""} via ${component}`;
  }
  if (actionCode === "RBAC_UPDATE_PERMISSION") {
    return `updated RBAC page permissions${extra ? ` (${extra})` : ""} via ${component}`;
  }
  if (actionCode === "PAGE_FETCH") {
    return `fetched page data via ${component}`;
  }

  return `performed ${method} on ${path}`;
};

const redactKeys = new Set([
  "password",
  "user_password",
  "newPassword",
  "confirmPassword",
  "refreshToken",
  "access_token",
  "resetToken",
  "otp",
]);

const summarizeUpdatedFields = (body) => {
  if (!body || typeof body !== "object") return null;
  const keys = Object.keys(body).filter((k) => !redactKeys.has(k));
  if (keys.length === 0) return null;
  // keep it short
  const shown = keys.slice(0, 6);
  return `fields: ${shown.join(", ")}${keys.length > shown.length ? ", ..." : ""}`;
};

const normalizeModelNameFromReq = (req) => {
  const raw = req?.body?.model_name ?? req?.body?.modelName ?? req?.query?.model_name;
  return safeString(raw);
};

const getIdFromReq = (req) => {
  const raw = req?.body?.id ?? req?.body?.record_id ?? req?.params?.id ?? req?.query?.id;
  const str = safeString(raw);
  return str;
};

export const auditTrail = (req, res, next) => {
  if (shouldSkipAudit(req)) return next();

  const startAt = Date.now();
  const path = String(req.originalUrl || req.url || "").split("?")[0];
  const method = String(req.method || "").toUpperCase();

  const originalJson = res.json.bind(res);
  const originalSend = res.send.bind(res);

  res.locals.__audit = res.locals.__audit || {};

  res.json = (body) => {
    res.locals.__audit.responseBody = body;
    return originalJson(body);
  };

  res.send = (body) => {
    res.locals.__audit.responseBody = body;
    return originalSend(body);
  };

  res.on("finish", () => {
    const ctx = req.requestContext;
    if (ctx?.auditLogged) return;

    const durationMs = Date.now() - startAt;
    const statusCode = res.statusCode;
    const outcome = statusCode < 400 ? "success" : "failed";

    const responseBody = res.locals.__audit?.responseBody;

    void (async () => {
      try {
        const userId = req.user?.user_id ?? req.user?.id ?? null;
        const enterprizeId =
          req.user?.enterprize_id ??
          req.user?.enterprize_fid ??
          req.body?.enterprize_fid ??
          req.body?.enterprize_id ??
          req.params?.enterprizeId ??
          req.params?.enterprize_id ??
          null;

        const actor =
          safeString(req.user?.user_email) ||
          safeString(responseBody?.data?.user?.email) ||
          safeString(req.body?.email) ||
          safeString(req.body?.user_email) ||
          safeString(req.body?.user_name) ||
          (userId ? (await resolveUserIdentifier(userId)) : null) ||
          "anonymous";

        const enterprizeName =
          safeString(req.user?.enterprize_name) ||
          safeString(responseBody?.data?.user?.enterprize_name) ||
          (enterprizeId ? await resolveEnterprizeName(enterprizeId) : null);

        const actionCode = getActionCode(req);

        let modelName = null;
        let recordIdentifier = null;
        let extra = null;

        if (actionCode.startsWith("PAGE_CRUD_")) {
          modelName = normalizeModelNameFromReq(req);
          const id = getIdFromReq(req);

          if (modelName) {
            const identifier = await resolveModelRecordIdentifier({
              modelName,
              id,
              enterprizeId,
              isSuperAdmin: Boolean(req.user?.is_super_admin),
            });
            recordIdentifier = identifier;
          }

          if (actionCode === "PAGE_CRUD_UPDATE") {
            extra = summarizeUpdatedFields(req.body);
          }
          if (actionCode === "PAGE_CRUD_CHANGE_STATUS") {
            extra = safeString(req.body?.status) ? `status=${req.body.status}` : null;
          }
        }

        if (actionCode === "RBAC_UPDATE_PERMISSION") {
          const roleId = req.body?.roleId ?? req.body?.role_id ?? req.body?.role_fid;
          const pageId = req.body?.pageId ?? req.body?.page_id ?? req.body?.page_fid;

          const roleName = roleId ? await resolveRoleName(roleId) : null;
          const pageName = pageId ? await resolvePageName(pageId) : null;

          const flags = [];
          if (req.body?.permissions && typeof req.body.permissions === "object") {
            const p = req.body.permissions;
            for (const k of ["can_view", "can_create", "can_edit", "can_delete"]) {
              if (p[k] !== undefined) flags.push(`${k}=${Boolean(p[k])}`);
            }
          }

          extra = [
            roleName ? `role='${roleName}'` : roleId ? `roleId=${roleId}` : null,
            pageName ? `page='${pageName}'` : pageId ? `pageId=${pageId}` : null,
            flags.length ? flags.join(", ") : null,
          ]
            .filter(Boolean)
            .join("; ");
        }

        const actionSentence = getActionSentence({
          actionCode,
          method,
          path,
          modelName: modelName || "record",
          recordIdentifier,
          extra,
        });

        const parts = [];
        parts.push(`User '${actor}' ${actionSentence}.`);
        if (enterprizeName) parts.push(`Enterprize: '${enterprizeName}'.`);
        parts.push(`Outcome: ${outcome} (HTTP ${statusCode}) in ${durationMs}ms.`);
        if (req.requestId) parts.push(`RequestId: ${req.requestId}.`);

        // Try to include a concise backend message (if any)
        const backendMessage =
          safeString(responseBody?.message) ||
          safeString(responseBody?.error) ||
          safeString(responseBody?.data?.message);
        if (backendMessage && backendMessage.length <= 180) {
          parts.push(`Result: ${backendMessage}.`);
        }

        const description = parts.join(" ");

        await createAuditLog({
          user_fid: userId,
          enterprize_fid: enterprizeId,
          action: actionCode,
          description,
          ip: req.ip,
          status: outcome,
          created_by: userId,
        });
      } catch (error) {
        logger.error(`[AUDIT] Failed to write audit log: ${error.message}`);
      }
    })();
  });

  next();
};
