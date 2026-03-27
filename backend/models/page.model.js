// models/page.model.js
import { DataTypes } from "sequelize";

export default (sequelize) => {
  return sequelize.define(
    "Page",
    {
      page_id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },

      enterprize_fid: {
        type: DataTypes.BIGINT,
        allowNull: true,
        references: { model: "enterprizes", key: "enterprize_id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },

      page_name: { type: DataTypes.STRING, allowNull: false },
      page_route: { type: DataTypes.STRING, allowNull: false },

      // ⭐ Replace page_code with model_name
      model_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      // ⭐ Add page_api
      page_api: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      page_icon: { type: DataTypes.STRING, allowNull: true },

      is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
      page_status: { type: DataTypes.STRING, defaultValue: "active" },

      // ✅ Change to INTEGER
      created_by: { type: DataTypes.BIGINT, allowNull: true },
      updated_by: { type: DataTypes.BIGINT, allowNull: true },

      created_timestamp: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
      updated_timestamp: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    },
    {
      tableName: "pages",
      timestamps: false,
      indexes: [
        { fields: ["enterprize_fid"] },
        { fields: ["is_active"] },
        { fields: ["page_status"] },
        { unique: true, fields: ["enterprize_fid", "page_route"] },
        { unique: true, fields: ["enterprize_fid", "page_name"] },
        { unique: true, fields: ["enterprize_fid", "model_name"] },
      ],
    },
  );
};
