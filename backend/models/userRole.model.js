// models/userRole.model.js
import { DataTypes } from "sequelize";

export default (sequelize) =>
  sequelize.define(
    "UserRole",
    {
      user_role_id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },

      user_fid: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: { model: "users", key: "user_id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      role_fid: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: { model: "roles", key: "role_id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },

      user_role_status: { type: DataTypes.STRING, defaultValue: "active" },
      created_by: { type: DataTypes.BIGINT, allowNull: true },
      updated_by: { type: DataTypes.BIGINT, allowNull: true },
      created_timestamp: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
      updated_timestamp: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    },
    {
      tableName: "user_roles",
      timestamps: false,
      indexes: [
        { fields: ["user_fid"] },
        { fields: ["role_fid"] },
        { unique: true, fields: ["user_fid", "role_fid"] },
      ],
    }
  );
