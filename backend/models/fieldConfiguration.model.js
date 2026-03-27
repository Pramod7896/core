// models/fieldConfiguration.model.js

import { DataTypes } from "sequelize";

export default (sequelize) =>
  sequelize.define(
    "FieldConfiguration",
    {
      field_config_id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },

      model_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      field_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      field_label: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      input_type: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: "text, select, multiselect, checkbox",
      },

      reference_model: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      reference_key: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      reference_label: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      source_key: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: "Relation table column referencing source model",
      },

      target_key: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: "Relation table column referencing reference model",
      },

      // ✅ NEW FIELD (IMPORTANT)
      target_table: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: "Which table this field belongs to (users, user_roles etc)",
      },

      is_required: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },

      enterprize_fid: {
        type: DataTypes.BIGINT,
        allowNull: true,
        references: { model: "enterprizes", key: "enterprize_id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },

      created_by: {
        type: DataTypes.BIGINT,
      },

      updated_by: {
        type: DataTypes.BIGINT,
      },

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
      tableName: "field_configurations",
      timestamps: false,
      indexes: [
        { fields: ["enterprize_fid"] },
        { fields: ["model_name"] },
        { fields: ["target_table"] },
      ],
    },
  );
