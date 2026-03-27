import { logger } from "../../config/logger.js";

/**
 * ==========================================
 * LOGIN VALIDATION
 * ==========================================
 */
export const validateLogin = (req, res, next) => {
  const { user_name, user_password } = req.body;

  if (!user_name || !user_password) {
    logger.warn(`LOGIN VALIDATION FAILED | requestId=${req.requestId}`);

    return res.status(400).json({
      success: false,
      message: "Username and password required",
    });
  }

  next();
};

/**
 * ==========================================
 * LOGOUT VALIDATION
 * ==========================================
 */
export const validateLogout = (req, res, next) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    logger.warn(`LOGOUT VALIDATION FAILED | requestId=${req.requestId}`);

    return res.status(400).json({
      success: false,
      message: "Refresh token is required",
    });
  }

  next();
};

/**
 * ==========================================
 * REFRESH TOKEN VALIDATION
 * ==========================================
 */
export const validateRefreshToken = (req, res, next) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    logger.warn(`REFRESH TOKEN VALIDATION FAILED | requestId=${req.requestId}`);

    return res.status(400).json({
      success: false,
      message: "Refresh token is required",
    });
  }

  next();
};

/**
 * ==========================================
 * FORGOT PASSWORD VALIDATION
 * ==========================================
 */
export const validateForgotPassword = (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    logger.warn(`FORGOT PASSWORD VALIDATION FAILED | requestId=${req.requestId}`);

    return res.status(400).json({
      success: false,
      message: "Email is required",
    });
  }

  next();
};

/**
 * ==========================================
 * VERIFY OTP VALIDATION
 * ==========================================
 */
export const validateVerifyOtp = (req, res, next) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    logger.warn(`VERIFY OTP VALIDATION FAILED | requestId=${req.requestId}`);

    return res.status(400).json({
      success: false,
      message: "Email and OTP are required",
    });
  }

  next();
};

/**
 * ==========================================
 * RESET PASSWORD VALIDATION
 * ==========================================
 */
export const validateResetPassword = (req, res, next) => {
  const { newPassword, confirmPassword, resetToken } = req.body;

  if (!newPassword || !confirmPassword || !resetToken) {
    logger.warn(`RESET PASSWORD VALIDATION FAILED | requestId=${req.requestId}`);

    return res.status(400).json({
      success: false,
      message: "New password, confirm password, and reset token are required",
    });
  }

  if (newPassword !== confirmPassword) {
    logger.warn(`RESET PASSWORD MISMATCH | requestId=${req.requestId}`);

    return res.status(400).json({
      success: false,
      message: "New password and confirm password do not match",
    });
  }

  next();
};
