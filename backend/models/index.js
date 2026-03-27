import { sequelize } from "../config/database.js";

import EnterprizeModel from "./enterprize.model.js";
import UserModel from "./user.model.js";
import RoleModel from "./role.model.js";
import PermissionModel from "./permission.model.js";
import UserRoleModel from "./userRole.model.js";
import RolePermissionModel from "./rolePermission.model.js";

import PageModel from "./page.model.js";
import RolePagePermissionModel from "./rolePagePermission.model.js";

import AuditLogModel from "./auditLog.model.js";
import UserSessionModel from "./userSession.model.js";
import LoginHistoryModel from "./loginHistory.model.js";

import OTPVerificationModel from "./otpVerification.model.js";

import FieldConfigurationModel from "./fieldConfiguration.model.js";

import UserFileModel from "./user_files.model.js"; // ✅ NEW MODEL
import CustomerModel from "./customer.model.js";
import SidebarMenuOrderModel from "./sidebarMenuOrder.model.js";

// ================= INITIALIZE =================

const Enterprize = EnterprizeModel(sequelize);

const User = UserModel(sequelize);

const Role = RoleModel(sequelize);

const Permission = PermissionModel(sequelize);

const UserRole = UserRoleModel(sequelize);

const RolePermission = RolePermissionModel(sequelize);

const Page = PageModel(sequelize);

const RolePagePermission = RolePagePermissionModel(sequelize);

const AuditLog = AuditLogModel(sequelize);

const UserSession = UserSessionModel(sequelize);

const LoginHistory = LoginHistoryModel(sequelize);

const OTPVerification = OTPVerificationModel(sequelize);

const FieldConfiguration = FieldConfigurationModel(sequelize);

const UserFile = UserFileModel(sequelize); // ✅ INITIALIZED
const Customer = CustomerModel(sequelize);
const SidebarMenuOrder = SidebarMenuOrderModel(sequelize);

// ================= RELATIONS =================

// =====================================================
// ENTERPRIZE RELATIONS
// =====================================================

Enterprize.hasMany(User, {
  foreignKey: "enterprize_fid",
  constraints: false,
});

User.belongsTo(Enterprize, {
  foreignKey: "enterprize_fid",
  constraints: false,
});

Enterprize.hasMany(Role, {
  foreignKey: "enterprize_fid",
  constraints: false,
});

Role.belongsTo(Enterprize, {
  foreignKey: "enterprize_fid",
  constraints: false,
});

Enterprize.hasMany(Page, {
  foreignKey: "enterprize_fid",
  constraints: false,
});

Page.belongsTo(Enterprize, {
  foreignKey: "enterprize_fid",
  constraints: false,
});

// ✅ NEW

Enterprize.hasMany(UserFile, {
  foreignKey: "enterprize_fid",
  constraints: false,
});

UserFile.belongsTo(Enterprize, {
  foreignKey: "enterprize_fid",
  constraints: false,
});

Enterprize.hasMany(Customer, {
  foreignKey: "enterprize_fid",
  constraints: false,
});

Customer.belongsTo(Enterprize, {
  foreignKey: "enterprize_fid",
  constraints: false,
});

// =====================================================
// USER ROLE RELATIONS
// =====================================================

User.belongsToMany(Role, {
  through: UserRole,

  foreignKey: "user_fid",
  constraints: false,
});

Role.belongsToMany(User, {
  through: UserRole,

  foreignKey: "role_fid",
  constraints: false,
});

// =====================================================
// PERMISSION RELATIONS
// =====================================================

Role.belongsToMany(Permission, {
  through: RolePermission,

  foreignKey: "role_fid",
  constraints: false,
});

Permission.belongsToMany(Role, {
  through: RolePermission,

  foreignKey: "permission_fid",
  constraints: false,
});

// =====================================================
// PAGE PERMISSION
// =====================================================

Role.belongsToMany(Page, {
  through: RolePagePermission,

  foreignKey: "role_fid",
  constraints: false,
});

Page.belongsToMany(Role, {
  through: RolePagePermission,

  foreignKey: "page_fid",
  constraints: false,
});

RolePagePermission.belongsTo(Role, {
  foreignKey: "role_fid",
  constraints: false,
});

RolePagePermission.belongsTo(Page, {
  foreignKey: "page_fid",
  constraints: false,
});

Role.hasMany(RolePagePermission, {
  foreignKey: "role_fid",
  constraints: false,
});

Page.hasMany(RolePagePermission, {
  foreignKey: "page_fid",
  constraints: false,
});

// =====================================================
// AUDIT LOG
// =====================================================

User.hasMany(AuditLog, {
  foreignKey: "user_fid",
  constraints: false,
});

AuditLog.belongsTo(User, {
  foreignKey: "user_fid",
  constraints: false,
});

Enterprize.hasMany(AuditLog, {
  foreignKey: "enterprize_fid",
  constraints: false,
});

AuditLog.belongsTo(Enterprize, {
  foreignKey: "enterprize_fid",
  constraints: false,
});

// =====================================================
// USER SESSION
// =====================================================

UserSession.belongsTo(LoginHistory, {
  foreignKey: "login_history_fid",

  as: "loginHistory",
  constraints: false,
});

LoginHistory.hasMany(UserSession, {
  foreignKey: "login_history_fid",

  as: "sessions",
  constraints: false,
});

User.hasMany(UserSession, {
  foreignKey: "user_fid",

  as: "sessions",
  constraints: false,
});

UserSession.belongsTo(User, {
  foreignKey: "user_fid",

  as: "user",
  constraints: false,
});

Enterprize.hasMany(UserSession, {
  foreignKey: "enterprize_fid",
  as: "sessions",
  constraints: false,
});

UserSession.belongsTo(Enterprize, {
  foreignKey: "enterprize_fid",
  as: "enterprize",
  constraints: false,
});

User.hasMany(LoginHistory, {
  foreignKey: "user_fid",
  as: "loginHistory",
  constraints: false,
});

LoginHistory.belongsTo(User, {
  foreignKey: "user_fid",
  as: "user",
  constraints: false,
});

// =====================================================
// OTP
// =====================================================

User.hasMany(OTPVerification, {
  foreignKey: "user_fid",

  as: "otps",
  constraints: false,
});

OTPVerification.belongsTo(User, {
  foreignKey: "user_fid",

  as: "user",
  constraints: false,
});

// =====================================================
// USER FILE RELATIONS (VERY IMPORTANT)
// =====================================================

// User → Files

User.hasMany(UserFile, {
  foreignKey: "user_fid",
  constraints: false,
});

UserFile.belongsTo(User, {
  foreignKey: "user_fid",
  constraints: false,
});

UserFile.belongsTo(UserFile, {
  foreignKey: "parent_id",
  as: "parent",
  constraints: false,
});

UserFile.hasMany(UserFile, {
  foreignKey: "parent_id",
  as: "children",
  constraints: false,
});

// =====================================================
// SIDEBAR MENU ORDER RELATIONS
// =====================================================

User.hasMany(SidebarMenuOrder, {
  foreignKey: "user_fid",
  constraints: false,
});

SidebarMenuOrder.belongsTo(User, {
  foreignKey: "user_fid",
  constraints: false,
});


// =====================================================
// EXPORT
// =====================================================

export {
  sequelize,
  Enterprize,
  User,
  Role,
  Permission,
  UserRole,
  RolePermission,
  Page,
  RolePagePermission,
  AuditLog,
  UserSession,
  LoginHistory,
  OTPVerification,
  FieldConfiguration,
  UserFile, // ✅ NEW EXPORT
  Customer,
  SidebarMenuOrder,
};
