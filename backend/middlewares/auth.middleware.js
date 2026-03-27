import util from "util";

import { verifyAccessToken } from "../utils/jwt.js";

import {
  User,
  UserSession,
  UserRole,
  Role,
  RolePermission,
  Permission,
} from "../models/index.js";

import { logger } from "../config/logger.js";

import { AUTH_MIDDLEWARE_LOG_MESSAGES } from "../constant/logMessages.js";

/**
 * ==========================================
 * ENTERPRIZE AUTH MIDDLEWARE
 * ==========================================
 */
export const authenticate = async (req, res, next) => {
  try {
    /**
     * STEP 1: Extract Token
     */
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      logger.warn(
        util.format(
          AUTH_MIDDLEWARE_LOG_MESSAGES.TOKEN_MISSING,

          req.requestId,
        ),
      );

      return res.status(401).json({
        success: false,

        message: "Access token required",
      });
    }

    const token = authHeader.split(" ")[1];

    /**
     * STEP 2: Verify Token
     */
    const decoded = verifyAccessToken(token);

    /**
     * STEP 3: Check Session
     */
    const session = await UserSession.findOne({
      where: {
        session_id: decoded.session_id,

        is_active: true,
      },
    });

    if (!session) {
      logger.warn(
        util.format(
          AUTH_MIDDLEWARE_LOG_MESSAGES.SESSION_INVALID,

          decoded.session_id,

          req.requestId,
        ),
      );

      return res.status(401).json({
        success: false,

        message: "Session invalid",
      });
    }

    /**
     * STEP 4: Token Match
     */
    if (session.access_token !== token) {
      logger.warn(
        util.format(
          AUTH_MIDDLEWARE_LOG_MESSAGES.TOKEN_MISMATCH,

          session.session_id,

          req.requestId,
        ),
      );

      return res.status(401).json({
        success: false,

        message: "Token mismatch",
      });
    }

    /**
     * STEP 5: Expiry
     */
    if (new Date() > session.access_expires_at) {
      await session.update({
        is_active: false,

        session_end_timestamp: new Date(),
      });

      logger.warn(
        util.format(
          AUTH_MIDDLEWARE_LOG_MESSAGES.TOKEN_EXPIRED,

          session.session_id,

          req.requestId,
        ),
      );

      return res.status(401).json({
        success: false,

        message: "Token expired",
      });
    }

    /**
     * STEP 6: User
     */
    const user = await User.findOne({
      where: {
        user_id: decoded.user_id,

        user_status: "active",
      },
    });

    if (!user) {
      logger.warn(
        util.format(
          AUTH_MIDDLEWARE_LOG_MESSAGES.USER_INVALID,

          decoded.user_id,

          req.requestId,
        ),
      );

      return res.status(401).json({
        success: false,

        message: "User inactive",
      });
    }

    /**
     * STEP 7: Roles
     */
    const userRoles = await UserRole.findAll({
      where: {
        user_fid: user.user_id,

        user_role_status: "active",
      },
    });

    const roleIds = userRoles.map((r) => r.role_fid);

    const rolesData = await Role.findAll({
      where: {
        role_id: roleIds,

        role_status: "active",
      },
    });

    const roles = rolesData.map((r) => r.role_name);
    const roleLevels = rolesData.map((r) => Number(r.role_level ?? 0));
    const maxRoleLevel = user.is_super_admin
      ? Number.MAX_SAFE_INTEGER
      : roleLevels.length
        ? Math.max(...roleLevels)
        : 0;

    /**
     * STEP 8: Permissions
     */
    const rolePermissions = await RolePermission.findAll({
      where: {
        role_fid: roleIds,

        role_permission_status: "active",
      },
    });

    const permissionIds = rolePermissions.map((p) => p.permission_fid);

    const permissionsData = await Permission.findAll({
      where: {
        permission_id: permissionIds,

        permission_status: "active",
      },
    });

    const permissions = permissionsData.map((p) => ({
      resource: p.permission_resource,

      action: p.permission_action,
    }));

    /**
     * STEP 9: Attach user
     */
    req.user = {
      // common aliases to reduce cross-module mismatches
      id: user.user_id,
      user_id: user.user_id,

      user_name: user.user_name,
      user_fullname: user.user_fullname,
      user_email: user.user_email,

      enterprize_id: user.enterprize_fid,

      is_super_admin: user.is_super_admin,

      session_id: session.session_id,

      roleIds,
      role_ids: roleIds,

      roles,
      role_levels: roleLevels,
      max_role_level: maxRoleLevel,

      permissions,
    };

    /**
     * STEP 10: SUCCESS LOG
     */
    logger.info(
      util.format(
        AUTH_MIDDLEWARE_LOG_MESSAGES.AUTH_SUCCESS,

        user.user_id,

        session.session_id,

        req.requestId,
      ),
    );

    next();
  } catch (error) {
    logger.error(
      util.format(
        AUTH_MIDDLEWARE_LOG_MESSAGES.TOKEN_INVALID,

        req.requestId,

        error.message,
      ),
    );

    return res.status(401).json({
      success: false,

      message: "Invalid or expired token",
    });
  }
};
