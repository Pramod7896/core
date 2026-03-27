// models/auditLog.model.js
import { DataTypes } from "sequelize";

export default (sequelize) =>
  sequelize.define(
    "AuditLog",
    {
      audit_log_id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },

      user_fid: {
        type: DataTypes.BIGINT,
        allowNull: true,
        references: { model: "users", key: "user_id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      enterprize_fid: {
        type: DataTypes.BIGINT,
        allowNull: true,
        references: { model: "enterprizes", key: "enterprize_id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },

      audit_log_action: { type: DataTypes.STRING, allowNull: true },
      audit_log_description: { type: DataTypes.TEXT, allowNull: true },
      audit_log_ip: { type: DataTypes.STRING, allowNull: true },

       // ✅ NEW COLUMN
      entity: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      // ✅ NEW COLUMN
      entity_id: { type: DataTypes.BIGINT, allowNull: true },

      audit_log_status: { type: DataTypes.STRING, defaultValue: "active" },
      created_by: { type: DataTypes.BIGINT, allowNull: true },
      updated_by: { type: DataTypes.BIGINT, allowNull: true },
      created_timestamp: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
      updated_timestamp: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    },
    {
      tableName: "audit_logs",
      timestamps: false,
      indexes: [
        { fields: ["enterprize_fid"] },
        { fields: ["user_fid"] },
        { fields: ["created_timestamp"] },
      ],
    }
  );
