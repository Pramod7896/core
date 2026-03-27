// models/loginHistory.model.js
import { DataTypes } from "sequelize";

export default (sequelize) =>
  sequelize.define(
    "LoginHistory",
    {
      login_history_id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },
      user_fid: {
        type: DataTypes.BIGINT,
        allowNull: true,
        references: { model: "users", key: "user_id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      user_email: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      ip_address: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      city: { type: DataTypes.TEXT, allowNull: true },
      region_name: { type: DataTypes.TEXT, allowNull: true },
      region_code: { type: DataTypes.TEXT, allowNull: true },
      zip: { type: DataTypes.TEXT, allowNull: true },
      country: { type: DataTypes.TEXT, allowNull: true },
      country_code: { type: DataTypes.TEXT, allowNull: true },
      isp: { type: DataTypes.TEXT, allowNull: true },
      device: { type: DataTypes.TEXT, allowNull: true },
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: true,
      },
      login_token: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      latitude: { type: DataTypes.FLOAT, allowNull: true },
      longitude: { type: DataTypes.FLOAT, allowNull: true },
      created_by: { type: DataTypes.BIGINT, allowNull: true },
      updated_by: { type: DataTypes.BIGINT, allowNull: true },
    },
    {
      tableName: "login_history",
      timestamps: true,
      createdAt: "created_timestamp",
      updatedAt: "updated_timestamp",
      underscored: true,
      id: false,
      indexes: [{ fields: ["user_fid"] }, { fields: ["user_email"] }],
    }
  );
