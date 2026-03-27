// models/role.model.js
import { DataTypes } from "sequelize";

export default (sequelize) =>
  sequelize.define(
    "Role",
    {
      role_id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },

      enterprize_fid: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: { model: "enterprizes", key: "enterprize_id" },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },

      role_name: { type: DataTypes.STRING, allowNull: false },

      role_level: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },

      role_status: { type: DataTypes.STRING, defaultValue: "active" },
      created_by: { type: DataTypes.BIGINT, allowNull: true },
      updated_by: { type: DataTypes.BIGINT, allowNull: true },
      created_timestamp: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
      updated_timestamp: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    },
    {
      tableName: "roles",
      timestamps: false,
      indexes: [
        { fields: ["enterprize_fid"] },
        { fields: ["role_status"] },
        { fields: ["role_level"] },
        { unique: true, fields: ["enterprize_fid", "role_name"] },
      ],
    }
  );
