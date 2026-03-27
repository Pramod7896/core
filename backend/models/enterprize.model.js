// models/enterprize.model.js
import { DataTypes } from "sequelize";

export default (sequelize) =>
  sequelize.define(
    "Enterprize",
    {
      enterprize_id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },

      enterprize_name: { type: DataTypes.STRING, allowNull: false },
      enterprize_address_1: DataTypes.STRING,
      enterprize_address_2: DataTypes.STRING,
      enterprize_city: DataTypes.STRING,
      enterprize_state: DataTypes.STRING,
      enterprize_zip_code: DataTypes.STRING,
      enterprize_country: DataTypes.STRING,
      enterprize_logo: DataTypes.STRING,
      enterprize_theme: DataTypes.STRING,

      enterprize_phone_1: DataTypes.STRING,
      enterprize_phone_2: DataTypes.STRING,
      enterprize_mobile_1: DataTypes.STRING,
      enterprize_mobile_2: DataTypes.STRING,

      enterprize_email_1: DataTypes.STRING,
      enterprize_email_2: DataTypes.STRING,

      contact_person_name: DataTypes.STRING,
      contact_person_phone: DataTypes.STRING,
      contact_person_email: DataTypes.STRING,
      contact_person_mobile: DataTypes.STRING,
      contact_person_designation: DataTypes.STRING,

      alt_contact_person_name: DataTypes.STRING,
      alt_contact_person_phone: DataTypes.STRING,
      alt_contact_person_email: DataTypes.STRING,
      alt_contact_person_mobile: DataTypes.STRING,
      alt_contact_person_designation: DataTypes.STRING,

      /* Mandatory Fields */
      enterprize_status: { type: DataTypes.STRING, defaultValue: "active" },
      created_by: DataTypes.BIGINT,
      updated_by: DataTypes.BIGINT,
      created_timestamp: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
      updated_timestamp: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    },
    {
      tableName: "enterprizes",
      timestamps: false,
      indexes: [{ fields: ["enterprize_status"] }],
    }
  );
