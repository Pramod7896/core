// models/sidebarMenuOrder.model.js
import { DataTypes } from "sequelize";

export default (sequelize) => {
  return sequelize.define(
    "SidebarMenuOrder",
    {
      sidebar_menu_order_id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },

      user_fid: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },

      role_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      menu_order: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: [],
      },

      created_timestamp: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
      updated_timestamp: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    },
    {
      tableName: "sidebar_menu_orders",
      timestamps: false,
      indexes: [{ unique: true, fields: ["user_fid", "role_name"] }],
    },
  );
};

