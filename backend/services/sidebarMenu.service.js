import { SidebarMenuOrder } from "../models/index.js";

const normalizeRoleName = (role) => String(role || "").trim().toLowerCase();

const normalizeOrder = (order) => {
  if (!Array.isArray(order)) return [];
  const result = [];
  const seen = new Set();
  for (const value of order) {
    const id = String(value || "").trim();
    if (!id) continue;
    if (seen.has(id)) continue;
    seen.add(id);
    result.push(id);
    if (result.length >= 200) break;
  }
  return result;
};

export const getSidebarMenuOrderService = async (req, role) => {
  const roleName = normalizeRoleName(role);
  if (!roleName) return [];

  const record = await SidebarMenuOrder.findOne({
    where: {
      user_fid: req.user.user_id,
      role_name: roleName,
    },
  });

  return Array.isArray(record?.menu_order) ? record.menu_order : [];
};

export const updateSidebarMenuOrderService = async (req, role, order) => {
  const roleName = normalizeRoleName(role);
  if (!roleName) {
    const err = new Error("role is required");
    err.status = 400;
    throw err;
  }

  const normalized = normalizeOrder(order);

  const existing = await SidebarMenuOrder.findOne({
    where: {
      user_fid: req.user.user_id,
      role_name: roleName,
    },
  });

  if (existing) {
    await existing.update({
      menu_order: normalized,
      updated_timestamp: new Date(),
    });
    return existing;
  }

  const created = await SidebarMenuOrder.create({
    user_fid: req.user.user_id,
    role_name: roleName,
    menu_order: normalized,
    created_timestamp: new Date(),
    updated_timestamp: new Date(),
  });

  return created;
};
