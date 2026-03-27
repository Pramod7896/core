import { DataTypes } from "sequelize";

export default (sequelize) =>
  sequelize.define(
    "Customer",
    {
      customer_id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },

      enterprize_fid: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: { model: "enterprizes", key: "enterprize_id" },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },

      customer_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      customer_contact_number: DataTypes.STRING,
      customer_email: DataTypes.STRING,
      customer_address: DataTypes.STRING,

      customer_agency_name: DataTypes.STRING,
      customer_agency_contact_number: DataTypes.STRING,
      customer_agency_address: DataTypes.STRING,
      customer_agenecy_designation: DataTypes.STRING,
      customer_agency_alternate_contact_number: DataTypes.STRING,
      customer_agency_alternate_name: DataTypes.STRING,
      customer_agency_alternate_email: DataTypes.STRING,

      customer_status: {
        type: DataTypes.STRING,
        defaultValue: "active",
      },
      created_by: DataTypes.BIGINT,
      updated_by: DataTypes.BIGINT,
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
      tableName: "customers",
      timestamps: false,
      indexes: [
        { fields: ["enterprize_fid"] },
        { fields: ["customer_status"] },
      ],
    }
  );
