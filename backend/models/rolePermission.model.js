// models/rolePermission.model.js
import { DataTypes } from "sequelize";

export default (sequelize) =>
  sequelize.define(
    "RolePermission",
    {
      role_permission_id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },

      role_fid: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: { model: "roles", key: "role_id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      permission_fid: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: { model: "permissions", key: "permission_id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },

      role_permission_status: { type: DataTypes.STRING, defaultValue: "active" },
      created_by: { type: DataTypes.BIGINT, allowNull: true },
      updated_by: { type: DataTypes.BIGINT, allowNull: true },
      created_timestamp: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
      updated_timestamp: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    },
    {
      tableName: "role_permissions",
      timestamps: false,
      indexes: [
        { fields: ["role_fid"] },
        { fields: ["permission_fid"] },
        { unique: true, fields: ["role_fid", "permission_fid"] },
      ],
    }
  );
