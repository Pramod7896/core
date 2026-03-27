// models/permission.model.js
import { DataTypes } from "sequelize";

export default (sequelize) =>
  sequelize.define(
    "Permission",
    {
      permission_id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },

      permission_resource: { type: DataTypes.STRING, allowNull: false },
      permission_action: { type: DataTypes.STRING, allowNull: false },

      permission_status: { type: DataTypes.STRING, defaultValue: "active" },
      created_by: { type: DataTypes.BIGINT, allowNull: true },
      updated_by: { type: DataTypes.BIGINT, allowNull: true },
      created_timestamp: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
      updated_timestamp: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    },
    {
      tableName: "permissions",
      timestamps: false,
      indexes: [
        { fields: ["permission_status"] },
        { unique: true, fields: ["permission_resource", "permission_action"] },
      ],
    }
  );
