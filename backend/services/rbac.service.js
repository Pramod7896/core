import { Role, Page, RolePagePermission, UserRole, Enterprize } from "../models/index.js";
import { Op } from "sequelize";
import { AppError } from "../middlewares/error.middleware.js";

import { createAuditLog } from "./auditLog.service.js";

import { logger } from "../config/logger.js";

import { RBAC_LOG_MESSAGES } from "../constant/logMessages.js";

/**
==================================================
GET USER RBAC
==================================================
*/

export const getUserRBACService = async (req) => {
  try {
    const userId = req.user.user_id;

    const isSuperAdmin = req.user.is_super_admin;

    const selectedRoleId = req.query.roleId;

    /**
      SUPER ADMIN
      */

    if (isSuperAdmin) {
      const roles = await Role.findAll({
        where: {
          role_status: "active",
        },

        attributes: ["role_id", "role_name"],

        order: [["role_name", "ASC"]],
      });

      const pages = await Page.findAll({
        where: {
          is_active: true,
        },

        include: [
          {
            model: RolePagePermission,

            where: selectedRoleId
              ? {
                  role_fid: selectedRoleId,
                }
              : undefined,

            required: false,
          },
        ],

        order: [["page_name", "ASC"]],
      });

      const formattedPages = pages.map((page) => {
        const perm = page.RolePagePermissions?.[0];

        if (!selectedRoleId) {
          return {
            page_id: page.page_id,

            page_name: page.page_name,

            page_route: page.page_route,

            model_name: page.model_name,

            page_api: page.page_api,

            can_view: true,

            can_create: true,

            can_edit: true,

            can_delete: true,
          };
        }

        return {
          page_id: page.page_id,

          page_name: page.page_name,

          page_route: page.page_route,

          model_name: page.model_name,

          page_api: page.page_api,

          can_view: perm?.can_view || false,

          can_create: perm?.can_create || false,

          can_edit: perm?.can_edit || false,

          can_delete: perm?.can_delete || false,
        };
      });

      return {
        roles,
        pages: formattedPages,
      };
    }

    /**
      NORMAL USER
      */

    const userRoles = await UserRole.findAll({
      where: {
        user_fid: userId,
      },

      attributes: ["role_fid"],
    });

    const roleIds = userRoles.map((r) => r.role_fid);

    const permissions = await RolePagePermission.findAll({
      where: {
        role_fid: roleIds,
      },

      include: [
        {
          model: Page,

          where: {
            is_active: true,
            enterprize_fid: req.user.enterprize_id,
          },
        },
      ],
    });

    const pages = permissions.map((p) => ({
      page_id: p.Page.page_id,

      page_name: p.Page.page_name,

      page_route: p.Page.page_route,

      model_name: p.Page.model_name,

      page_api: p.Page.page_api,

      can_view: p.can_view,

      can_create: p.can_create,

      can_edit: p.can_edit,

      can_delete: p.can_delete,
    }));

    return {
      roles: [],
      pages,
    };
  } catch (error) {
    logger.error(RBAC_LOG_MESSAGES.RBAC_FETCH_ERROR, error);

    throw error;
  }
};

/**
==================================================
UPDATE PAGE PERMISSION
AUTO CREATE IF NOT EXIST
==================================================
*/

export const updatePagePermissionService = async (
  req,
  roleId,
  pageId,
  permissions,
) => {
  try {
    const userId = req.user.user_id;

    const enterprizeId = req.user.enterprize_id;

    const ip = req.ip;

    let permission = await RolePagePermission.findOne({
      where: {
        role_fid: roleId,

        page_fid: pageId,
      },
    });

    if (!permission) {
      permission = await RolePagePermission.create({
        role_fid: roleId,

        page_fid: pageId,

        can_view: permissions.can_view ?? false,

        can_create: permissions.can_create ?? false,

        can_edit: permissions.can_edit ?? false,

        can_delete: permissions.can_delete ?? false,

        created_by: userId,
      });
    } else {
      await permission.update({
        ...permissions,
        updated_by: userId,
      });
    }

    const roleRow = await Role.findOne({
      where: {
        role_id: roleId,
        ...(req.user?.is_super_admin ? {} : { enterprize_fid: enterprizeId }),
      },
      attributes: ["role_name"],
      raw: true,
    });

    const pageRow = await Page.findOne({
      where: {
        page_id: pageId,
        ...(req.user?.is_super_admin ? {} : { enterprize_fid: enterprizeId }),
      },
      attributes: ["page_name"],
      raw: true,
    });

    await createAuditLog({
      user_fid: userId,

      enterprize_fid: enterprizeId,

      action: "PAGE_PERMISSION_UPDATED",
      description: (() => {
        const actor = req.user?.user_email || req.user?.user_name || String(userId);
        const roleName = roleRow?.role_name;
        const pageName = pageRow?.page_name;

        const flags = [];
        for (const k of ["can_view", "can_create", "can_edit", "can_delete"]) {
          if (permissions?.[k] !== undefined) flags.push(`${k}=${Boolean(permissions[k])}`);
        }

        const rolePart = roleName ? `role '${roleName}'` : `roleId=${roleId}`;
        const pagePart = pageName ? `page '${pageName}'` : `pageId=${pageId}`;
        const flagPart = flags.length ? ` (${flags.join(", ")})` : "";

        return `User '${actor}' updated permissions for ${rolePart} on ${pagePart}${flagPart}.`;
      })(),

      ip,

      status: "success",
    });

    return permission;
  } catch (error) {
    logger.error(RBAC_LOG_MESSAGES.PAGE_PERMISSION_UPDATE_ERROR, error);

    throw error;
  }
};

/**
 * ==========================================
 * GET ENTERPRIZES (SCOPED)
 * ==========================================
 */

export const getEnterprizesService = async (req) => {
  const user = req.user || {};

  return await Enterprize.findAll({
    where: {
      enterprize_status: "active",
      ...(user.is_super_admin ? {} : { enterprize_id: user.enterprize_id }),
    },
    attributes: ["enterprize_id", "enterprize_name"],
    order: [["enterprize_name", "ASC"]],
  });
};

/**
 * ==========================================
 * GET ROLES BY ENTERPRIZE (SCOPED + ROLE LEVEL)
 * ==========================================
 */

export const getRolesByEnterprizeService = async (req, enterprizeId) => {
  const user = req.user || {};

  if (!user.is_super_admin) {
    if (
      user.enterprize_id === undefined ||
      String(user.enterprize_id) !== String(enterprizeId)
    ) {
      throw new AppError("Forbidden: enterprize mismatch", 403, "RBAC");
    }
  }

  const viewerRoleLevel = user.is_super_admin
    ? Number.MAX_SAFE_INTEGER
    : Number(user.max_role_level ?? 0);

  return await Role.findAll({
    where: {
      enterprize_fid: enterprizeId,
      role_status: "active",
      ...(user.is_super_admin ? {} : { role_level: { [Op.lte]: viewerRoleLevel } }),
    },
    attributes: ["role_id", "role_name", "role_level"],
    order: [["role_name", "ASC"]],
  });
};
