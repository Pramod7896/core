import bcrypt from "bcrypt";
import util from "util";

import {
  User,
  Enterprize,
  Role,
  Permission,
  UserRole,
  RolePermission,
  Page,
  RolePagePermission,
  UserSession,
  LoginHistory,
  OTPVerification,
} from "../models/index.js";

import { generateAccessToken, generateRefreshToken } from "../utils/jwt.js";
import { getClientIp, getIpLocation, getDeviceType } from "../utils/iputils.js";
import { sendOTPEmail } from "../utils/mailer.js";

import { logger } from "../config/logger.js";
import { AUTH_LOG_MESSAGES } from "../constant/logMessages.js";
import { createAuditLog } from "./auditLog.service.js";
import crypto from "crypto";

import { Sequelize, Op, fn, col, literal } from "sequelize";

/**
 * ==========================================
 * ENTERPRIZE LOGIN SERVICE
 * ==========================================
 */
export const loginService = async (req, { user_name, user_password }) => {
  let user = null;
  const ip = getClientIp(req);
  const device = getDeviceType(req);

  try {
    // STEP 1: Find User by username OR email
    user = await User.findOne({
      where: {
        user_status: "active",
        // Sequelize OR condition
        [Op.or]: [{ user_name }, { user_email: user_name }],
      },
      include: [
        { model: Enterprize, attributes: ["enterprize_id", "enterprize_name"] },
      ],
    });

    if (!user) throw new Error("Invalid username or password");

    // STEP 2: Verify Password
    const isMatch = await bcrypt.compare(user_password, user.user_password);
    if (!isMatch) throw new Error("Invalid username or password");

    // STEP 3: IP Location
    const location = await getIpLocation(ip);

    // STEP 4: Login History
    const loginHistory = await LoginHistory.create({
      user_fid: user.user_id,
      user_email: user.user_email,

      ip_address: ip,

      city: location?.city,
      region_name: location?.region,
      region_code: location?.region_code,

      country: location?.country,
      country_code: location?.country_code,

      zip: location?.postal,

      latitude: location?.latitude,
      longitude: location?.longitude,

      isp: location?.org,

      device,

      is_active: true,
      created_by: user.user_id,
    });

    // STEP 5: Session Create
    const session = await UserSession.create({
      user_fid: user.user_id,
      enterprize_fid: user.enterprize_fid,

      login_history_fid: loginHistory.login_history_id,

      access_token: "temp",
      refresh_token: "temp",

      ip_address: ip,
      device_info: device,

      is_active: true,

      created_by: user.user_id,
    });

    // STEP 6: Generate Tokens
    const accessToken = generateAccessToken({
      user_id: user.user_id,
      enterprize_id: user.enterprize_fid,
      session_id: session.session_id,
      is_super_admin: user.is_super_admin,
      
    });

    const refreshToken = generateRefreshToken({
      user_id: user.user_id,
      enterprize_id: user.enterprize_fid,
      session_id: session.session_id,
      is_super_admin: user.is_super_admin,
    });

    // STEP 7: Expiry
    const accessExpiry = new Date(Date.now() + 15 * 60 * 1000);
    const refreshExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    // STEP 8: Update Session
    await session.update({
      access_token: accessToken,
      refresh_token: refreshToken,

      access_expires_at: accessExpiry,
      refresh_expires_at: refreshExpiry,

      updated_by: user.user_id,
    });

    // STEP 9: Roles
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

    // STEP 10: API Permissions
    const rolePermissions = await RolePermission.findAll({
      where: {
        role_fid: roleIds,
        role_permission_status: "active",
      },
    });

    const permissionIds = rolePermissions.map((p) => p.permission_fid);

    const permissionData = await Permission.findAll({
      where: {
        permission_id: permissionIds,
        permission_status: "active",
      },
    });

    const permissions = permissionData.map((p) => ({
      resource: p.permission_resource,
      action: p.permission_action,
    }));

    // STEP 11: Page Permissions
    let pages = [];

    if (user.is_super_admin) {
      const allPages = await Page.findAll({
        where: { is_active: true },
      });

      pages = allPages.map((p) => ({
        page_id: p.page_id,
        page_name: p.page_name,
        page_route: p.page_route,
        page_icon: p.page_icon,
        model_name: p.model_name,
        page_api: p.page_api,

        can_view: true,
        can_create: true,
        can_edit: true,
        can_delete: true,
      }));
    } else {
      const rolePagePermissions = await RolePagePermission.findAll({
        where: {
          role_fid: roleIds,
          role_page_permission_status: "active",
        },

        include: [
          {
            model: Page,

            attributes: [
              "page_id",
              "page_name",
              "page_route",
              "page_icon",
              "model_name",
              "page_api",
              "is_active",
            ],

            where: { is_active: true, enterprize_fid: user.enterprize_fid },
          },
        ],
      });

      pages = rolePagePermissions.map((rp) => ({
        page_id: rp.Page.page_id,
        page_name: rp.Page.page_name,
        page_route: rp.Page.page_route,
        page_icon: rp.Page.page_icon,
        model_name: rp.Page.model_name,
        page_api: rp.Page.page_api,

        can_view: rp.can_view,
        can_create: rp.can_create,
        can_edit: rp.can_edit,
        can_delete: rp.can_delete,
      }));
    }

    // STEP 12: Audit Log Success
    await createAuditLog({
      user_fid: user.user_id,
      enterprize_fid: user.enterprize_fid,

      action: "LOGIN_SUCCESS",

      description: `User '${user.user_email || user.user_name}' logged in successfully${
        user.Enterprize?.enterprize_name
          ? ` to enterprize '${user.Enterprize.enterprize_name}'`
          : ""
      }.`,

      ip,

      status: "success",

      created_by: user.user_id,
    });

    // STEP 13: Logger
    logger.info(
      util.format(
        AUTH_LOG_MESSAGES.LOGIN_SUCCESS,

        user.user_id,
        session.session_id,
        req.requestId,
      ),
    );

    // STEP 14: Return Response
    return {
      user: {
        id: user.user_id,
        name: user.user_fullname,

        is_super_admin: user.is_super_admin,

        email: user.user_email,

        enterprize_id: user.enterprize_fid,

        enterprize_name: user.Enterprize?.enterprize_name,
      },

      roles,

      permissions,

      pages,

      session_id: session.session_id,

      accessToken,

      refreshToken,
    };
  } catch (error) {
    await createAuditLog({
      user_fid: user?.user_id || null,

      enterprize_fid: user?.enterprize_fid || null,

      action: "LOGIN_FAILED",

      description: `Login failed for user '${user_name}'. Error: ${error.message}.`,

      ip,

      status: "failed",

      created_by: user?.user_id || null,
    });

    logger.error(
      util.format(
        AUTH_LOG_MESSAGES.LOGIN_FAILED,

        user_name,
        error.message,
        req.requestId,
      ),
    );

    throw error;
  }
};

/**
 * ==========================================
 * LOGOUT SERVICE
 * ==========================================
 */
export const logoutService = async (req, refreshToken) => {
  const ip = getClientIp(req);

  let session = null;
  let logoutUser = null;

  try {
    // Find session
    session = await UserSession.findOne({
      where: { refresh_token: refreshToken, is_active: true },
    });

    if (!session) throw new Error("Session not found");

    // Deactivate session
    await session.update({
      is_active: false,
      updated_by: session.user_fid,
    });

    // Audit log - success
    logoutUser = await User.findOne({
      where: { user_id: session.user_fid },
      include: [{ model: Enterprize, attributes: ["enterprize_id", "enterprize_name"] }],
    });

    await createAuditLog({
      user_fid: session.user_fid,
      enterprize_fid: session.enterprize_fid || null,
      action: "LOGOUT",
      description: `User '${logoutUser?.user_email || session.user_fid}' logged out successfully from session '${session.session_id}'${
        logoutUser?.Enterprize?.enterprize_name
          ? ` (enterprize '${logoutUser.Enterprize.enterprize_name}')`
          : ""
      }.`,
      ip,
      status: "success",
      created_by: session.user_fid,
    });

    // Logger - success
    logger.info(
      util.format(AUTH_LOG_MESSAGES.LOGOUT, session.user_fid, req.requestId),
    );

    return { message: "Logged out successfully" };
  } catch (error) {
    // Audit log - failed
    await createAuditLog({
      user_fid: session?.user_fid || null,
      enterprize_fid: session?.enterprize_fid || null,
      action: "LOGOUT_FAILED",
      description: `Failed logout attempt for user '${
        logoutUser?.user_email || session?.user_fid || "unknown"
      }' (session '${session?.session_id || "unknown"}'): ${error.message}.`,
      ip,
      status: "failed",
      created_by: session?.user_fid || null,
    });

    // Logger - failed
    logger.error(
      util.format(
        AUTH_LOG_MESSAGES.LOGOUT_FAILED,
        session?.user_fid || "unknown",
        error.message,
        req.requestId,
      ),
    );

    throw error;
  }
};

/**
 * ==========================================
 * REFRESH TOKEN SERVICE
 * ==========================================
 */
export const refreshTokenService = async (req, refreshToken) => {
  const ip = getClientIp(req);
  let session = null;

  try {
    if (!refreshToken) throw new Error("No refresh token provided");

    // STEP 1: Find active session
    session = await UserSession.findOne({ where: { refresh_token: refreshToken, is_active: true } });
    if (!session) throw new Error("Invalid refresh token");

    // STEP 2: Fetch user from user_fid
    const user = await User.findOne({
      where: { user_id: session.user_fid, user_status: "active" },
      include: [{ model: Enterprize, attributes: ["enterprize_id", "enterprize_name"] }],
    });
    if (!user) throw new Error("User not found for session");

    // STEP 3: Generate new access token
    const accessToken = generateAccessToken({
      user_id: user.user_id,
      enterprize_id: user.enterprize_fid,
      session_id: session.session_id,
      is_super_admin: user.is_super_admin,
    });

    const accessExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 min
    await session.update({ access_token: accessToken, access_expires_at: accessExpiry });

    // STEP 4: Roles
    const userRoles = await UserRole.findAll({ where: { user_fid: user.user_id, user_role_status: "active" } });
    const roleIds = userRoles.map(r => r.role_fid);
    const rolesData = await Role.findAll({ where: { role_id: roleIds, role_status: "active" } });
    const roles = rolesData.map(r => r.role_name);

    // STEP 5: Permissions
    const rolePermissions = await RolePermission.findAll({ where: { role_fid: roleIds, role_permission_status: "active" } });
    const permissionIds = rolePermissions.map(p => p.permission_fid);
    const permissionData = await Permission.findAll({ where: { permission_id: permissionIds, permission_status: "active" } });
    const permissions = permissionData.map(p => ({ resource: p.permission_resource, action: p.permission_action }));

    // STEP 6: Page Permissions
    let pages = [];
    if (user.is_super_admin) {
      const allPages = await Page.findAll({ where: { is_active: true } });
      pages = allPages.map(p => ({
        page_id: p.page_id,
        page_name: p.page_name,
        page_route: p.page_route,
        page_icon: p.page_icon,
        model_name: p.model_name,
        page_api: p.page_api,
        can_view: true,
        can_create: true,
        can_edit: true,
        can_delete: true,
      }));
    } else {
      const rolePagePermissions = await RolePagePermission.findAll({
        where: { role_fid: roleIds, role_page_permission_status: "active" },

        include: [
          {
            model: Page,
            attributes: [
              "page_id",
              "page_name",
              "page_route",
              "page_icon",
              "model_name",
              "page_api",
              "is_active",
            ],
            where: {
              is_active: true,
              enterprize_fid: user.enterprize_fid,
            },
          },
        ],
      });

      pages = rolePagePermissions.map((rp) => ({
        page_id: rp.Page.page_id,
        page_name: rp.Page.page_name,
        page_route: rp.Page.page_route,
        page_icon: rp.Page.page_icon,
        model_name: rp.Page.model_name,
        page_api: rp.Page.page_api,

        can_view: rp.can_view,
        can_create: rp.can_create,
        can_edit: rp.can_edit,
        can_delete: rp.can_delete,
      }));
    }

    // STEP 7: Audit log
    await createAuditLog({
      user_fid: user.user_id,
      enterprize_fid: user.enterprize_fid || null,
      action: "REFRESH_TOKEN",
      description: `Access token refreshed successfully for user '${user.user_email || user.user_id}'${
        user.Enterprize?.enterprize_name
          ? ` (enterprize '${user.Enterprize.enterprize_name}')`
          : ""
      }.`,
      ip,
      status: "success",
      created_by: user.user_id,
    });
    logger.info(util.format(AUTH_LOG_MESSAGES.REFRESH_TOKEN, user.user_id, req.requestId));

    // STEP 8: Return full session info
    return {
      user: {
        id: user.user_id,
        name: user.user_fullname,
        is_super_admin: user.is_super_admin,
        email: user.user_email,
        enterprize_id: user.enterprize_fid,
        enterprize_name: user.Enterprize?.enterprize_name,
      },
      roles,
      permissions,
      pages,
      session_id: session.session_id,
      accessToken,
      refreshToken, // keep existing refresh token
    };
  } catch (error) {
    await createAuditLog({
      user_fid: session?.user_fid || null,
      enterprize_fid: session?.enterprize_fid || null,
      action: "REFRESH_TOKEN_FAILED",
      description: `Failed to refresh access token for user '${
        user?.user_email || session?.user_fid || "unknown"
      }': ${error.message}.`,
      ip,
      status: "failed",
      created_by: session?.user_fid || null,
    });
    logger.error(util.format(AUTH_LOG_MESSAGES.REFRESH_TOKEN_FAILED, session?.user_fid || "unknown", error.message, req.requestId));
    throw error;
  }
};


/**
 * ==========================================
 * FORGOT PASSWORD SERVICE
 * ==========================================
 */
export const forgotPasswordService = async (req, email) => {
  const ip = getClientIp(req);
  let user = null;

  try {
    // STEP 1: Find user
    user = await User.findOne({
      where: { user_email: email, user_status: "active" },
    });

    if (!user) throw new Error("User not found");

    // STEP 2: Generate OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    const expireMinutes = Number(process.env.OTP_EXPIRE_MINUTES) || 10;
    const expires = new Date(Date.now() + expireMinutes * 60 * 1000);

    // STEP 3: Save OTP in DB
    await OTPVerification.create({
      user_fid: user.user_id,
      otp_code: otp,
      expires_timestamp: expires,
      created_by: user.user_id,
    });

    // STEP 4: Send OTP email (non-blocking)
    await sendOTPEmail(user.user_email, otp, user.user_name);

    // STEP 5: Audit log - success
    await createAuditLog({
      user_fid: user.user_id,
      enterprize_fid: user.enterprize_fid,
      action: "FORGOT_PASSWORD",
      description: `Password reset OTP sent successfully to user '${user.user_email || email}'.`,
      ip,
      status: "success",
      created_by: user.user_id,
    });

    // STEP 6: Logger - success
    logger.info(
      util.format(
        AUTH_LOG_MESSAGES.FORGOT_PASSWORD,
        user.user_id,
        req.requestId,
      ),
    );

    // STEP 7: Return response
    return { message: "OTP sent successfully to your email" };
  } catch (error) {
    // STEP 8: Audit log - failed
    await createAuditLog({
      user_fid: user?.user_id || null,
      enterprize_fid: user?.enterprize_fid || null,
      action: "FORGOT_PASSWORD_FAILED",
      description: `Failed to send password reset OTP to user '${
        email || user?.user_email || user?.user_id || "unknown"
      }': ${error.message}.`,
      ip,
      status: "failed",
      created_by: user?.user_id || null,
    });

    // STEP 9: Logger - failed
    logger.error(
      util.format(
        AUTH_LOG_MESSAGES.FORGOT_PASSWORD_FAILED,
        user?.user_id || "unknown",
        error.message,
        req.requestId,
      ),
    );

    throw error;
  }
};

/**
 * ==========================================
 * VERIFY OTP SERVICE (with Reset Token)
 * ==========================================
 */
export const verifyOtpService = async (req, { email, otp }) => {
  const ip = getClientIp(req);
  let user = null;

  try {
    // STEP 1: Find user
    user = await User.findOne({
      where: { user_email: email, user_status: "active" },
    });

    if (!user) throw new Error("User not found");

    // STEP 2: Find OTP record
    const otpRecord = await OTPVerification.findOne({
      where: { user_fid: user.user_id, otp_code: otp },
      order: [["created_timestamp", "DESC"]],
    });

    if (!otpRecord) throw new Error("Invalid OTP");

    // STEP 3: Check expiration
    if (otpRecord.expires_timestamp < new Date()) {
      throw new Error("OTP expired");
    }

    // STEP 4: Mark OTP as used / delete
    await otpRecord.destroy();

    // STEP 5: Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex"); // secure 64-char hex
    const resetTokenExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // STEP 6: Save reset token in OTPVerification table (or separate table)
    await OTPVerification.create({
      user_fid: user.user_id,
      otp_code: resetToken,
      expires_timestamp: resetTokenExpires,
      created_by: user.user_id,
    });

    // STEP 7: Audit log - success
    await createAuditLog({
      user_fid: user.user_id,
      enterprize_fid: user.enterprize_fid,
      action: "VERIFY_OTP",
      description: `OTP verified successfully for user '${user.user_email || email}'.`,
      ip,
      status: "success",
      created_by: user.user_id,
    });

    // STEP 8: Logger - success
    logger.info(
      util.format(AUTH_LOG_MESSAGES.VERIFY_OTP, user.user_id, req.requestId),
    );

    // STEP 9: Return reset token to frontend
    return {
      message: "OTP verified successfully",
      resetToken, // frontend will use this to call resetPasswordService
    };
  } catch (error) {
    // STEP 10: Audit log - failed
    await createAuditLog({
      user_fid: user?.user_id || null,
      enterprize_fid: user?.enterprize_fid || null,
      action: "VERIFY_OTP_FAILED",
      description: `OTP verification failed for user '${
        email || user?.user_email || user?.user_id || "unknown"
      }': ${error.message}.`,
      ip,
      status: "failed",
      created_by: user?.user_id || null,
    });

    // STEP 11: Logger - failed
    logger.error(
      util.format(
        AUTH_LOG_MESSAGES.VERIFY_OTP_FAILED,
        user?.user_id || "unknown",
        error.message,
        req.requestId,
      ),
    );

    throw error;
  }
};

/**
 * ==========================================
 * RESET PASSWORD SERVICE (using Reset Token)
 * ==========================================
 */
export const resetPasswordService = async (
  req,
  { newPassword, confirmPassword, resetToken },
) => {
  const ip = getClientIp(req);
  let user = null;

  try {
    if (!resetToken) throw new Error("Reset token missing");

    // STEP 1: Find reset token record
    const tokenRecord = await OTPVerification.findOne({
      where: { otp_code: resetToken },
      order: [["created_timestamp", "DESC"]],
    });

    if (!tokenRecord) throw new Error("Invalid or expired reset token");

    // STEP 2: Check token expiration
    if (tokenRecord.expires_timestamp < new Date()) {
      throw new Error("Reset token expired");
    }

    // STEP 3: Find user
    user = await User.findOne({
      where: { user_id: tokenRecord.user_fid, user_status: "active" },
    });

    if (!user) throw new Error("User not found");

    // STEP 4: Confirm passwords match
    if (newPassword !== confirmPassword)
      throw new Error("Passwords do not match");

    // STEP 5: Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // STEP 6: Update user password
    await user.update({
      user_password: hashedPassword,
      updated_by: user.user_id,
    });

    // STEP 7: Delete reset token
    await tokenRecord.destroy();

    // STEP 8: Audit log - success
    await createAuditLog({
      user_fid: user.user_id,
      enterprize_fid: user.enterprize_fid,
      action: "RESET_PASSWORD",
      description: `Password reset successfully for user '${user.user_email || user.user_id}'.`,
      ip,
      status: "success",
      created_by: user.user_id,
    });

    // STEP 9: Logger - success
    logger.info(
      util.format(
        AUTH_LOG_MESSAGES.RESET_PASSWORD,
        user.user_id,
        req.requestId,
      ),
    );

    return { message: "Password reset successfully" };
  } catch (error) {
    // STEP 10: Audit log - failed
    await createAuditLog({
      user_fid: user?.user_id || null,
      enterprize_fid: user?.enterprize_fid || null,
      action: "RESET_PASSWORD_FAILED",
      description: `Failed password reset for user '${
        user?.user_email || user?.user_id || "unknown"
      }': ${error.message}.`,
      ip,
      status: "failed",
      created_by: user?.user_id || null,
    });

    // STEP 11: Logger - failed
    logger.error(
      util.format(
        AUTH_LOG_MESSAGES.RESET_PASSWORD_FAILED,
        user?.user_id || "unknown",
        error.message,
        req.requestId,
      ),
    );

    throw error;
  }
};
