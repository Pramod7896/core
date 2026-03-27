// models/rolePagePermission.model.js
import { DataTypes } from "sequelize";

export default (sequelize) => {
  return sequelize.define(
    "RolePagePermission",
    {
      role_page_permission_id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },

      role_fid: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: { model: "roles", key: "role_id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      page_fid: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: { model: "pages", key: "page_id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },

      can_view: { type: DataTypes.BOOLEAN, defaultValue: true },
      can_create: { type: DataTypes.BOOLEAN, defaultValue: false },
      can_edit: { type: DataTypes.BOOLEAN, defaultValue: false },
      can_delete: { type: DataTypes.BOOLEAN, defaultValue: false },

      role_page_permission_status: {
        type: DataTypes.STRING,
        defaultValue: "active",
      },

      created_by: { type: DataTypes.BIGINT, allowNull: true },
      updated_by: { type: DataTypes.BIGINT, allowNull: true },

      created_timestamp: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
      updated_timestamp: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    },
    {
      tableName: "role_page_permissions",
      timestamps: false,
      indexes: [
        { fields: ["role_fid"] },
        { fields: ["page_fid"] },
        { unique: true, fields: ["role_fid", "page_fid"] },
      ],
    },
  );
};
