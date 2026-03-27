import api from "./api";

/**
 * ============================================
 * GET RBAC
 * backend reads: req.query.roleId
 * ============================================
 */
export const getRBACAPI = (roleId = "") =>
  api.get("/rbac/my-rbac", {
    params: { roleId },
  });

/**
 * ============================================
 * UPDATE PAGE PERMISSION
 * backend expects flat structure
 * ============================================
 */
export const updatePermissionAPI = (data) =>
  api.put("/rbac/update-permission", {
    role_id: data.role_id,
    page_id: data.page_id,
    can_view: data.can_view,
    can_create: data.can_create,
    can_edit: data.can_edit,
    can_delete: data.can_delete,
  });

/**
 * ============================================
 * GET ENTERPRIZES (scoped for non-superadmin)
 * ============================================
 */
export const getEnterprizesAPI = () => api.get("/rbac/enterprizes");

/**
 * ============================================
 * GET ROLES BY ENTERPRIZE (scoped + role_level)
 * ============================================
 */
export const getRolesByEnterprizeAPI = (enterprizeId) =>
  api.get(`/rbac/roles/${enterprizeId}`);
