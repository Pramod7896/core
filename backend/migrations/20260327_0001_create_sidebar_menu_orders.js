const safeCreateTable = async (
  queryInterface,
  tableName,
  definition,
  { transaction } = {},
) => {
  try {
    await queryInterface.describeTable(tableName, { transaction });
    return;
  } catch (err) {
    // table does not exist
  }

  try {
    await queryInterface.createTable(tableName, definition, { transaction });
  } catch (err) {
    // ignore (idempotency / best-effort)
  }
};

const safeAddIndex = async (
  queryInterface,
  tableName,
  fields,
  options,
  { transaction } = {},
) => {
  try {
    await queryInterface.addIndex(tableName, fields, { ...options, transaction });
  } catch (err) {
    // ignore
  }
};

export default {
  async up(queryInterface, Sequelize, { transaction } = {}) {
    await safeCreateTable(
      queryInterface,
      "sidebar_menu_orders",
      {
        sidebar_menu_order_id: {
          type: Sequelize.BIGINT,
          primaryKey: true,
          autoIncrement: true,
        },

        user_fid: {
          type: Sequelize.BIGINT,
          allowNull: false,
        },

        role_name: {
          type: Sequelize.STRING,
          allowNull: false,
        },

        menu_order: {
          type: Sequelize.JSONB,
          allowNull: false,
          defaultValue: [],
        },

        created_timestamp: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
        },

        updated_timestamp: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
        },
      },
      { transaction },
    );

    await safeAddIndex(
      queryInterface,
      "sidebar_menu_orders",
      ["user_fid", "role_name"],
      { unique: true, name: "sidebar_menu_orders_user_role_unique" },
      { transaction },
    );
  },

  async down(queryInterface, Sequelize, { transaction } = {}) {
    try {
      await queryInterface.dropTable("sidebar_menu_orders", { transaction });
    } catch (err) {
      // ignore
    }
  },
};

