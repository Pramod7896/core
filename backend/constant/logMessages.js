export const AUTH_LOG_MESSAGES = {
  LOGIN_SUCCESS: "Login Success User=%s Session=%s RequestId=%s",

  LOGIN_FAILED: "Login Failed Username=%s Reason=%s RequestId=%s",

  LOGIN_CONTROLLER_SUCCESS:
    "Login Controller Success User=%s Enterprize=%s RequestId=%s",

  LOGIN_CONTROLLER_FAILED: "Login Controller Failed RequestId=%s Reason=%s",

  LOGOUT: "Logout Success | User ID: %s | Request ID: %s",
  LOGOUT_FAILED: "Logout Failed | User ID: %s | Error: %s | Request ID: %s",
  LOGIN_CONTROLLER_SUCCESS:
    "Login Controller Success User=%s Enterprize=%s RequestId=%s",

  LOGOUT_CONTROLLER_FAILED: "Logout Controller Failed RequestId=%s Reason=%s",

  REFRESH_TOKEN: "Refresh Token Success | User ID: %s | Request ID: %s",
  REFRESH_TOKEN_FAILED:
    "Refresh Token Failed | User ID: %s | Error: %s | Request ID: %s",
  REFRESH_TOKEN_CONTROLLER_FAILED:
    "Refresh Token Controller Failed RequestId=%s Reason=%s",

  FORGOT_PASSWORD: "Forgot Password OTP sent | User ID: %s | Request ID: %s",
  FORGOT_PASSWORD_FAILED:
    "Forgot Password OTP failed | User ID: %s | Error: %s | Request ID: %s",
  FORGOT_PASSWORD_CONTROLLER_FAILED:
    "Forgot Password Controller Failed RequestId=%s Reason=%s",

  VERIFY_OTP: "OTP Verified | User ID: %s | Request ID: %s",
  VERIFY_OTP_FAILED:
    "OTP Verification Failed | User ID: %s | Error: %s | Request ID: %s",
  VERIFY_OTP_CONTROLLER_FAILED:
    "Verify OTP Controller Failed RequestId=%s Reason=%s",

  RESET_PASSWORD: "Password Reset Success | User ID: %s | Request ID: %s",
  RESET_PASSWORD_FAILED:
    "Password Reset Failed | User ID: %s | Error: %s | Request ID: %s",
  RESET_PASSWORD_CONTROLLER_FAILED:
    "Reset Password Controller Failed RequestId=%s Reason=%s",
};

export const AUTH_MIDDLEWARE_LOG_MESSAGES = {
  TOKEN_MISSING: "Auth Failed Token Missing RequestId=%s",

  TOKEN_INVALID: "Auth Failed Invalid Token RequestId=%s Reason=%s",

  SESSION_INVALID: "Auth Failed Session Invalid Session=%s RequestId=%s",

  TOKEN_MISMATCH: "Auth Failed Token Mismatch Session=%s RequestId=%s",

  TOKEN_EXPIRED: "Auth Failed Token Expired Session=%s RequestId=%s",

  USER_INVALID: "Auth Failed User Invalid User=%s RequestId=%s",

  AUTH_SUCCESS: "Auth Success User=%s Session=%s RequestId=%s",
};

export const RBAC_LOG_MESSAGES = {
  RBAC_UNAUTHORIZED: "RBAC Failed Unauthorized RequestId=%s",

  RBAC_NO_ROLES: "RBAC Failed No Roles User=%s RequestId=%s",

  RBAC_NO_ACTIVE_ROLES:
    "RBAC Failed No Active Roles User=%s Enterprize=%s RequestId=%s",

  RBAC_NO_PERMISSIONS: "RBAC Failed No Permissions User=%s RequestId=%s",

  RBAC_FORBIDDEN: "RBAC Forbidden User=%s Resource=%s Action=%s RequestId=%s",

  RBAC_SUCCESS: "RBAC Success User=%s Resource=%s Action=%s RequestId=%s",

  ROLE_CREATED: "ROLE CREATED → RoleID=%s",

  ROLE_UPDATED: "ROLE UPDATED → RoleID=%s",

  ROLE_DELETED: "ROLE DELETED → RoleID=%s",

  PAGE_PERMISSION_UPDATED: "PAGE PERMISSION UPDATED → RoleID=%s PageID=%s",

  USER_ROLE_ASSIGNED: "USER ROLE ASSIGNED → UserID=%s RoleID=%s",
};

export const PAGE_LOG_MESSAGES = {
  PAGE_FETCH_SUCCESS:
    "User %d fetched data for page '%s' successfully (requestId: %s)",
  PAGE_FETCH_FAILED:
    "Page fetch failed for user %d on page '%s' with error: %s (requestId: %s)",
};

export const PAGE_CRUD_LOG_MESSAGES = {
  CREATE_SUCCESS: "CREATE SUCCESS | user=%s model=%s requestId=%s",

  CREATE_FAILED: "CREATE FAILED | user=%s model=%s error=%s requestId=%s",

  UPDATE_SUCCESS: "UPDATE SUCCESS | user=%s model=%s id=%s requestId=%s",

  UPDATE_FAILED: "UPDATE FAILED | user=%s model=%s id=%s error=%s requestId=%s",

  DELETE_SUCCESS: "DELETE SUCCESS | user=%s model=%s id=%s requestId=%s",

  DELETE_FAILED: "DELETE FAILED | user=%s model=%s id=%s error=%s requestId=%s",
};
