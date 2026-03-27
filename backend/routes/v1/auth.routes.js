import express from "express";
import {
  loginController,
  logoutController,
  refreshTokenController,
  forgotPasswordController,
  verifyOtpController,
  resetPasswordController,
} from "../../controllers/auth.controller.js";

import {
  validateLogin,
  validateLogout,
  validateRefreshToken,
  validateForgotPassword,
  validateVerifyOtp,
  validateResetPassword,
} from "../../middlewares/validations/auth.validation.js";

// import { loginRateLimiter } from "../../middlewares/rateLimit.middleware.js";

const router = express.Router();

// ============================
// LOGIN
// ============================
router.post(
  "/login",
  // loginRateLimiter,
  validateLogin,
  loginController
);

// ============================
// LOGOUT
// ============================
router.post(
  "/logout",
  validateLogout,
  logoutController
);

// ============================
// REFRESH TOKEN
// ============================
router.post(
  "/refresh-token",
  validateRefreshToken,
  refreshTokenController
);

// ============================
// FORGOT PASSWORD
// ============================
router.post(
  "/forgot-password",
  validateForgotPassword,
  forgotPasswordController
);

// ============================
// VERIFY OTP
// ============================
router.post(
  "/verify-otp",
  validateVerifyOtp,
  verifyOtpController
);

// ============================
// RESET PASSWORD
// ============================
router.post(
  "/reset-password",
  validateResetPassword,
  resetPasswordController
);

export default router;
