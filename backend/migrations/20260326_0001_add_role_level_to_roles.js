const safeAddColumn = async (
  queryInterface,
  tableName,
  columnName,
  definition,
  { transaction } = {},
) => {
  try {
    const desc = await queryInterface.describeTable(tableName, { transaction });
    if (desc?.[columnName]) return;
    await queryInterface.addColumn(tableName, columnName, definition, {
      transaction,
    });
  } catch (err) {
    // ignore (idempotency / best-effort)
  }
};

const safeQuery = async (queryInterface, sql, { transaction } = {}) => {
  try {
    await queryInterface.sequelize.query(sql, { transaction });
  } catch (err) {
    // ignore
  }
};

export default {
  async up(queryInterface, Sequelize, { transaction } = {}) {
    await safeAddColumn(
      queryInterface,
      "roles",
      "role_level",
      {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      { transaction },
    );

    // Backfill in case existing rows have NULL (older manual schemas).
    await safeQuery(
      queryInterface,
      `UPDATE "roles" SET "role_level" = 0 WHERE "role_level" IS NULL;`,
      { transaction },
    );
  },

  async down(queryInterface, Sequelize, { transaction } = {}) {
    try {
      const desc = await queryInterface.describeTable("roles", { transaction });
      if (!desc?.role_level) return;
      await queryInterface.removeColumn("roles", "role_level", { transaction });
    } catch (err) {
      // ignore
    }
  },
};

