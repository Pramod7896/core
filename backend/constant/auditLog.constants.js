// constants/auditLog.constants.js
export const AUDIT_LOG_MESSAGES = {
  LOGIN_SUCCESS: "User {username} logged in successfully",
  LOGIN_FAILED: "Login failed for username: {username}. Error: {error}",
  USER_CREATED: "User {username} was created",
  USER_UPDATED: "User {username} was updated",
  USER_DELETED: "User {username} was deleted",
  ROLE_ASSIGNED: "Role {role} assigned to user {username}",
  PERMISSION_UPDATED: "Permission {permission} updated for role {role}",
  LOGOUT: "User logged out successfully from session '{sessionId}'",
  LOGOUT_FAILED: "Failed logout attempt for user '{userId}': {error}",
  REFRESH_TOKEN: "Access token refreshed successfully for user '{userId}'",
  REFRESH_TOKEN_FAILED:
    "Failed to refresh access token for user '{userId}': {error}",
  FORGOT_PASSWORD: "Password reset OTP sent successfully to user '{userId}'",
  FORGOT_PASSWORD_FAILED:
    "Failed to send password reset OTP for user '{userId}': {error}",
  VERIFY_OTP: "OTP verified successfully for user '{userId}'",
  VERIFY_OTP_FAILED: "OTP verification failed for user '{userId}': {error}",
  RESET_PASSWORD: "Password reset successfully for user '{userId}'",
  RESET_PASSWORD_FAILED: "Failed password reset for user '{userId}': {error}",

  // =========================
  // RBAC ROLE
  // =========================

  ROLE_CREATED: "Role '{role}' created",

  ROLE_UPDATED: "Role '{role}' updated",

  ROLE_DELETED: "Role '{role}' deleted",

  // =========================
  // USER ROLE
  // =========================

  USER_ROLE_ASSIGNED: "Role '{role}' assigned to user '{username}'",

  USER_ROLE_REMOVED: "Role '{role}' removed from user '{username}'",

  // =========================
  // PAGE PERMISSION
  // =========================

  PAGE_PERMISSION_GRANTED:
    "Permissions granted on page '{page}' to role '{role}'",

  PAGE_PERMISSION_UPDATED:
    "Permissions updated on page '{page}' for role '{role}'",

  PAGE_PERMISSION_REMOVED:
    "Permissions removed on page '{page}' from role '{role}'",

  // =========================
  // PERMISSION
  // =========================

  PERMISSION_GRANTED: "Permission '{permission}' granted to role '{role}'",

  PERMISSION_REVOKED: "Permission '{permission}' revoked from role '{role}'",
  // add more as needed
};

export const PAGE_AUDIT_LOG_MESSAGES = {
  PAGE_FETCH_SUCCESS:
    "User '{username}' fetched data for page '{page}' successfully",
  PAGE_FETCH_FAILED:
    "User '{username}' failed to fetch data for page '{page}' with error: {error}",
};

export const PAGE_CRUD_AUDIT_MESSAGES = {
  CREATE_SUCCESS: "User {username} created record in {model}",

  CREATE_FAILED: "User {username} failed to create record in {model}: {error}",

  UPDATE_SUCCESS: "User {username} updated record in {model}",

  UPDATE_FAILED: "User {username} failed to update record in {model}: {error}",

  DELETE_SUCCESS: "User {username} deleted record in {model}",

  DELETE_FAILED: "User {username} failed to delete record in {model}: {error}",
};
