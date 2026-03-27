// models/user.model.js
import { DataTypes } from "sequelize";

export default (sequelize) =>
  sequelize.define(
    "User",
    {
      user_id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },

      enterprize_fid: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          model: "enterprizes",
          key: "enterprize_id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },

      user_profile_pic: DataTypes.STRING,
      user_fullname: { type: DataTypes.STRING, allowNull: false },
      user_name: { type: DataTypes.STRING, allowNull: false },
      user_email: { type: DataTypes.STRING, allowNull: false },
      user_password: { type: DataTypes.STRING, allowNull: false },

      /* ✅ ADD THIS FIELD */
      is_super_admin: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },

      /* Mandatory Fields */
      user_status: {
        type: DataTypes.STRING,
        defaultValue: "active",
      },
      created_by: { type: DataTypes.BIGINT, allowNull: true },
      updated_by: { type: DataTypes.BIGINT, allowNull: true },
      created_timestamp: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      updated_timestamp: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "users",
      timestamps: false,
      indexes: [
        { fields: ["enterprize_fid"] },
        { fields: ["user_status"] },
        { unique: true, fields: ["enterprize_fid", "user_name"] },
        { unique: true, fields: ["enterprize_fid", "user_email"] },
      ],
    }
  );
