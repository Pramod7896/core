// models/user_files.model.js
import { DataTypes } from "sequelize";

export default (sequelize) =>
  sequelize.define(
    "UserFile",
    {
      user_files_id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },

      // Foreign keys
      user_fid: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: { model: "users", key: "user_id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },

      enterprize_fid: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: { model: "enterprizes", key: "enterprize_id" },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },

      // ✅ New field → For Folder Structure
      parent_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
        defaultValue: null,
        comment: "Parent folder/file ID. Null = root level",
        references: { model: "user_files", key: "user_files_id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },

      // ✅ Type → file / folder
      item_type: {
        type: DataTypes.ENUM("file", "folder"),
        allowNull: false,
        defaultValue: "file",
      },

      // ✅ Folder/File Name
      user_files_name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },

      // ✅ File Path (null for folders)
      user_files_path: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },

      // ✅ File Extension (null for folders)
      file_extension: {
        type: DataTypes.STRING(10),
        allowNull: true,
      },

      // ✅ File Size (in bytes, null for folders)
      file_size: {
        type: DataTypes.BIGINT,
        allowNull: true,
      },

      // ✅ File Hash (optional)
      file_hash: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: "Optional hash of the file for integrity check",
      },

      // ✅ Type of file (image/doc/media/folder)
      file_type: {
        type: DataTypes.ENUM("image", "doc", "media", "folder"),
        allowNull: false,
        defaultValue: "doc",
      },

      // ✅ Category → profile/document/shared/etc.
      file_category: {
        type: DataTypes.ENUM("profile", "document", "shared", "folder"),
        allowNull: false,
        defaultValue: "document",
      },

      // ✅ Move tracking
      old_path: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },

      // ✅ Status
      user_files_status: {
        type: DataTypes.ENUM("0", "1"), // 0 = inactive, 1 = active
        defaultValue: "1",
      },

      created_by: {
        type: DataTypes.BIGINT,
        allowNull: true,
      },
      updated_by: {
        type: DataTypes.BIGINT,
        allowNull: true,
      },
    },
    {
      tableName: "user_files",
      timestamps: true,
      createdAt: "created_timestamp",
      updatedAt: "updated_timestamp",
      underscored: true,
      indexes: [
        { fields: ["enterprize_fid"] },
        { fields: ["user_fid"] },
        { fields: ["parent_id"] },
        { fields: ["item_type"] },
        { fields: ["file_type"] },
      ],
    }
  );
