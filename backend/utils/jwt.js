import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRY = process.env.JWT_EXPIRY || "15m";

const REFRESH_SECRET = process.env.REFRESH_SECRET;
const REFRESH_EXPIRY = process.env.REFRESH_EXPIRY || "7d";

/**
 * Generate Access Token
 */
export const generateAccessToken = (session) => {
  return jwt.sign(
    {
      user_id: session.user_id,
      enterprize_id: session.enterprize_id,
      session_id: session.session_id,

      // ✅ ADD THIS
      is_super_admin: session.is_super_admin,

      token_type: "access",
    },
    JWT_SECRET,
    {
      expiresIn: JWT_EXPIRY,
      issuer: "enterprize-saas",
      audience: "enterprize-users",
    }
  );
};

/**
 * Generate Refresh Token
 */
export const generateRefreshToken = (session) => {
  return jwt.sign(
    {
      user_id: session.user_id,
      enterprize_id: session.enterprize_id,
      session_id: session.session_id,

      // ✅ ADD THIS
      is_super_admin: session.is_super_admin,

      token_type: "refresh",
    },
    REFRESH_SECRET,
    {
      expiresIn: REFRESH_EXPIRY,
      issuer: "enterprize-saas",
      audience: "enterprize-users",
    }
  );
};

/**
 * Verify Access Token
 */
export const verifyAccessToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};

/**
 * Verify Refresh Token
 */
export const verifyRefreshToken = (token) => {
  return jwt.verify(token, REFRESH_SECRET);
};
