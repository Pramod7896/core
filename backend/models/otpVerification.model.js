import { DataTypes } from 'sequelize';

export default (sequelize) =>
  sequelize.define(
    'OTPVerification',
    {
      otp_verification_id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true
      },
      user_fid: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: { model: "users", key: "user_id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      otp_code: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      expires_timestamp: {
        type: DataTypes.DATE,
        allowNull: false
      },
      created_by: {
        type: DataTypes.BIGINT
      },
      created_timestamp: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      },
      updated_by: {
        type: DataTypes.BIGINT
      },
      updated_timestamp: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      }
    },
    {
      tableName: 'otp_verifications',
      timestamps: true,
      createdAt: 'created_timestamp',
      updatedAt: 'updated_timestamp',
      underscored: true,
      id: false
      ,
      indexes: [
        { fields: ["user_fid"] },
        { fields: ["otp_code"] },
        { fields: ["expires_timestamp"] },
      ],
    }
  );
