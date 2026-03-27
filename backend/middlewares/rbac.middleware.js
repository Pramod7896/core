// middlewares/rbac.middleware.js

import { UserRole, Role, RolePermission, Permission } from "../models/index.js";

import { AppError } from "./error.middleware.js";

/**
 * ENTERPRIZE RBAC MIDDLEWARE
 *
 * Checks:
 * user → user_roles → roles → role_permissions → permissions
 *
 */
export const rbac = (resource, action) => {
  return async (req, res, next) => {
    try {
      const userId = req.user?.user_id;
      const enterprizeId = req.user?.enterprize_id;

      if (!userId) throw new AppError("Unauthorized", 401, "RBAC");

      /**
       * STEP 1: Get User Roles
       */
      const userRoles = await UserRole.findAll({
        where: {
          user_fid: userId,
          user_role_status: "active",
        },
      });

      if (!userRoles.length)
        throw new AppError("No roles assigned", 403, "RBAC");

      const roleIds = userRoles.map((r) => r.role_fid);

      /**
       * STEP 2: Get Roles
       */
      const roles = await Role.findAll({
        where: {
          role_id: roleIds,
          enterprize_fid: enterprizeId,
          role_status: "active",
        },
      });

      if (!roles.length) throw new AppError("No active roles", 403, "RBAC");

      const activeRoleIds = roles.map((r) => r.role_id);

      /**
       * STEP 3: Get Role Permissions
       */
      const rolePermissions = await RolePermission.findAll({
        where: {
          role_fid: activeRoleIds,
          role_permission_status: "active",
        },
      });

      if (!rolePermissions.length)
        throw new AppError("No permissions assigned", 403, "RBAC");

      const permissionIds = rolePermissions.map((p) => p.permission_fid);

      /**
       * STEP 4: Get Permissions
       */
      const permissions = await Permission.findAll({
        where: {
          permission_id: permissionIds,
          permission_status: "active",
        },
      });

      /**
       * Attach permissions to request
       */
      req.permissions = permissions;

      /**
       * STEP 5: Check permission
       */
      const allowed = permissions.some(
        (p) =>
          p.permission_resource === resource && p.permission_action === action,
      );

      if (!allowed)
        throw new AppError(`Forbidden: ${resource}:${action}`, 403, "RBAC");

      next();
    } catch (error) {
      next(error);
    }
  };
};
