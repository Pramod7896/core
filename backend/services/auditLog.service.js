// services/auditLog.service.js
import { AuditLog } from "../models/index.js"; // assuming you have index.js exporting all models
import { getRequestContext } from "../utils/requestContext.js";

export const createAuditLog = async ({
  user_fid,
  enterprize_fid,
  action,
  description,
  ip,
  status = "active",
  created_by,
  entity,
  entity_id,
}) => {
  const created = await AuditLog.create({
    user_fid,
    enterprize_fid,
    audit_log_action: action,
    audit_log_description: description,
    audit_log_ip: ip,
    audit_log_status: status,
    ...(entity !== undefined ? { entity } : {}),
    ...(entity_id !== undefined ? { entity_id } : {}),
    created_by,
    updated_by: created_by,
  });

  const ctx = getRequestContext();
  if (ctx) ctx.auditLogged = true;

  return created;
};
