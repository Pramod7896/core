import util from "util";
import { logger } from "../config/logger.js";
import { AUTH_LOG_MESSAGES } from "../constant/logMessages.js";

import {
  loginService,
  logoutService,
  refreshTokenService,
  forgotPasswordService,
  verifyOtpService,
  resetPasswordService,
} from "../services/auth.service.js";

/**
 * ==========================================
 * LOGIN CONTROLLER
 * ==========================================
 */
export const loginController = async (req, res, next) => {
  try {
    const { user_name, user_password } = req.body;

    const result = await loginService(req, { user_name, user_password });

    logger.info(
      util.format(
        AUTH_LOG_MESSAGES.LOGIN_CONTROLLER_SUCCESS,
        result.user.id,
        result.user.enterprize_id,
        req.requestId,
      ),
    );

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: result,
    });
  } catch (error) {
    logger.error(
      util.format(
        AUTH_LOG_MESSAGES.LOGIN_CONTROLLER_FAILED,
        req.requestId,
        error.message,
      ),
    );
    next(error);
  }
};

/**
 * ==========================================
 * LOGOUT CONTROLLER
 * ==========================================
 */
export const logoutController = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    const result = await logoutService(req, refreshToken);

    return res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    logger.error(
      util.format(
        AUTH_LOG_MESSAGES.LOGOUT_CONTROLLER_FAILED,
        req.requestId,
        error.message,
      ),
    );
    next(error);
  }
};

/**
 * ==========================================
 * REFRESH TOKEN CONTROLLER
 * ==========================================
 */
export const refreshTokenController = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    const result = await refreshTokenService(req, refreshToken);

    return res.status(200).json({
      success: true,
      message: "Access token refreshed",
      data: result,
    });
  } catch (error) {
    logger.error(
      util.format(
        AUTH_LOG_MESSAGES.REFRESH_TOKEN_CONTROLLER_FAILED,
        req.requestId,
        error.message,
      ),
    );
    next(error);
  }
};

/**
 * ==========================================
 * FORGOT PASSWORD CONTROLLER
 * ==========================================
 */
export const forgotPasswordController = async (req, res, next) => {
  try {
    const { email } = req.body;

    const result = await forgotPasswordService(req, email);

    return res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    logger.error(
      util.format(
        AUTH_LOG_MESSAGES.FORGOT_PASSWORD_CONTROLLER_FAILED,
        req.requestId,
        error.message,
      ),
    );
    next(error);
  }
};

/**
 * ==========================================
 * VERIFY OTP CONTROLLER
 * ==========================================
 */
export const verifyOtpController = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    const result = await verifyOtpService(req, { email, otp });

    return res.status(200).json({
      success: true,
      message: result.message,
      resetToken: result.resetToken, // returned for password reset
    });
  } catch (error) {
    logger.error(
      util.format(
        AUTH_LOG_MESSAGES.VERIFY_OTP_CONTROLLER_FAILED,
        req.requestId,
        error.message,
      ),
    );
    next(error);
  }
};

/**
 * ==========================================
 * RESET PASSWORD CONTROLLER
 * ==========================================
 */
export const resetPasswordController = async (req, res, next) => {
  try {
    const { newPassword, confirmPassword, resetToken } = req.body;

    const result = await resetPasswordService(req, {
      newPassword,
      confirmPassword,
      resetToken,
    });

    return res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    logger.error(
      util.format(
        AUTH_LOG_MESSAGES.RESET_PASSWORD_CONTROLLER_FAILED,
        req.requestId,
        error.message,
      ),
    );
    next(error);
  }
};
