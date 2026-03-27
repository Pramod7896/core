const safeQuery = async (queryInterface, sql, { transaction } = {}) => {
  try {
    await queryInterface.sequelize.query(sql, { transaction });
  } catch (err) {
    // Intentionally ignore for idempotency (duplicate_object, missing, etc.)
  }
};

const getColumnType = async (queryInterface, tableName, columnName) => {
  const [rows] = await queryInterface.sequelize.query(
    `
      SELECT data_type
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = $1
        AND column_name = $2
      LIMIT 1;
    `,
    { bind: [tableName, columnName] },
  );

  return rows?.[0]?.data_type || null;
};

const safeAlterToBigint = async (
  queryInterface,
  tableName,
  columnName,
  { transaction } = {},
) => {
  const type = await getColumnType(queryInterface, tableName, columnName);
  if (!type) return;
  if (type === "bigint") return;

  // Covers integer/smallint, etc. This is a safe widening conversion for IDs.
  await safeQuery(
    queryInterface,
    `ALTER TABLE "${tableName}" ALTER COLUMN "${columnName}" TYPE BIGINT USING "${columnName}"::bigint;`,
    { transaction },
  );
};

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
    // ignore
  }
};

const safeChangeColumnNullability = async (
  queryInterface,
  tableName,
  columnName,
  { allowNull },
  { transaction } = {},
) => {
  try {
    const desc = await queryInterface.describeTable(tableName, { transaction });
    if (!desc?.[columnName]) return;
    await queryInterface.changeColumn(
      tableName,
      columnName,
      { ...desc[columnName], allowNull },
      { transaction },
    );
  } catch (err) {
    // ignore
  }
};

export default {
  async up(queryInterface, Sequelize, { transaction } = {}) {
    // =====================================================
    // 1) Align ID/FK types to BIGINT (enterprise baseline)
    // =====================================================
    await safeAlterToBigint(queryInterface, "enterprizes", "enterprize_id", {
      transaction,
    });

    await safeAlterToBigint(queryInterface, "users", "user_id", { transaction });
    await safeAlterToBigint(queryInterface, "users", "enterprize_fid", {
      transaction,
    });

    await safeAlterToBigint(queryInterface, "roles", "role_id", { transaction });
    await safeAlterToBigint(queryInterface, "roles", "enterprize_fid", {
      transaction,
    });

    await safeAlterToBigint(queryInterface, "pages", "page_id", { transaction });
    await safeAlterToBigint(queryInterface, "pages", "enterprize_fid", {
      transaction,
    });

    await safeAlterToBigint(queryInterface, "permissions", "permission_id", {
      transaction,
    });

    await safeAlterToBigint(queryInterface, "user_roles", "user_role_id", {
      transaction,
    });
    await safeAlterToBigint(queryInterface, "user_roles", "user_fid", {
      transaction,
    });
    await safeAlterToBigint(queryInterface, "user_roles", "role_fid", {
      transaction,
    });

    await safeAlterToBigint(
      queryInterface,
      "role_permissions",
      "role_permission_id",
      { transaction },
    );
    await safeAlterToBigint(queryInterface, "role_permissions", "role_fid", {
      transaction,
    });
    await safeAlterToBigint(
      queryInterface,
      "role_permissions",
      "permission_fid",
      { transaction },
    );

    await safeAlterToBigint(
      queryInterface,
      "role_page_permissions",
      "role_page_permission_id",
      { transaction },
    );
    await safeAlterToBigint(
      queryInterface,
      "role_page_permissions",
      "role_fid",
      { transaction },
    );
    await safeAlterToBigint(
      queryInterface,
      "role_page_permissions",
      "page_fid",
      { transaction },
    );

    await safeAlterToBigint(queryInterface, "audit_logs", "audit_log_id", {
      transaction,
    });
    await safeAlterToBigint(queryInterface, "audit_logs", "user_fid", {
      transaction,
    });
    await safeAlterToBigint(queryInterface, "audit_logs", "enterprize_fid", {
      transaction,
    });

    await safeAlterToBigint(
      queryInterface,
      "field_configurations",
      "field_config_id",
      { transaction },
    );
    await safeAlterToBigint(
      queryInterface,
      "field_configurations",
      "enterprize_fid",
      { transaction },
    );

    await safeAlterToBigint(queryInterface, "customers", "customer_id", {
      transaction,
    });
    await safeAlterToBigint(queryInterface, "customers", "enterprize_fid", {
      transaction,
    });

    await safeAlterToBigint(queryInterface, "login_history", "login_history_id", {
      transaction,
    });
    await safeAlterToBigint(queryInterface, "login_history", "user_fid", {
      transaction,
    });

    await safeAlterToBigint(queryInterface, "otp_verifications", "otp_verification_id", {
      transaction,
    });
    await safeAlterToBigint(queryInterface, "otp_verifications", "user_fid", {
      transaction,
    });

    await safeAlterToBigint(queryInterface, "user_files", "user_files_id", {
      transaction,
    });
    await safeAlterToBigint(queryInterface, "user_files", "user_fid", {
      transaction,
    });
    await safeAlterToBigint(queryInterface, "user_files", "enterprize_fid", {
      transaction,
    });
    await safeAlterToBigint(queryInterface, "user_files", "parent_id", {
      transaction,
    });

    await safeAlterToBigint(queryInterface, "user_sessions", "session_id", {
      transaction,
    });
    await safeAlterToBigint(queryInterface, "user_sessions", "user_fid", {
      transaction,
    });
    await safeAlterToBigint(queryInterface, "user_sessions", "login_history_fid", {
      transaction,
    });

    // =====================================================
    // 2) Add missing tenancy column to sessions (needed by app)
    // =====================================================
    await safeAddColumn(
      queryInterface,
      "user_sessions",
      "enterprize_fid",
      {
        type: Sequelize.BIGINT,
        allowNull: true,
      },
      { transaction },
    );

    await safeQuery(
      queryInterface,
      `
        UPDATE "user_sessions" us
        SET "enterprize_fid" = u."enterprize_fid"
        FROM "users" u
        WHERE us."user_fid" = u."user_id"
          AND us."enterprize_fid" IS NULL;
      `,
      { transaction },
    );

    await safeChangeColumnNullability(
      queryInterface,
      "user_sessions",
      "enterprize_fid",
      { allowNull: false },
      { transaction },
    );

    // =====================================================
    // 3) Constraints & indexes (best-effort; ignore duplicates)
    // =====================================================
    // Foreign Keys
    await safeQuery(
      queryInterface,
      `ALTER TABLE "users" ADD CONSTRAINT "fk_users_enterprize" FOREIGN KEY ("enterprize_fid") REFERENCES "enterprizes" ("enterprize_id") ON UPDATE CASCADE ON DELETE RESTRICT;`,
      { transaction },
    );
    await safeQuery(
      queryInterface,
      `ALTER TABLE "roles" ADD CONSTRAINT "fk_roles_enterprize" FOREIGN KEY ("enterprize_fid") REFERENCES "enterprizes" ("enterprize_id") ON UPDATE CASCADE ON DELETE RESTRICT;`,
      { transaction },
    );
    await safeQuery(
      queryInterface,
      `ALTER TABLE "pages" ADD CONSTRAINT "fk_pages_enterprize" FOREIGN KEY ("enterprize_fid") REFERENCES "enterprizes" ("enterprize_id") ON UPDATE CASCADE ON DELETE SET NULL;`,
      { transaction },
    );
    await safeQuery(
      queryInterface,
      `ALTER TABLE "customers" ADD CONSTRAINT "fk_customers_enterprize" FOREIGN KEY ("enterprize_fid") REFERENCES "enterprizes" ("enterprize_id") ON UPDATE CASCADE ON DELETE RESTRICT;`,
      { transaction },
    );

    await safeQuery(
      queryInterface,
      `ALTER TABLE "user_roles" ADD CONSTRAINT "fk_user_roles_user" FOREIGN KEY ("user_fid") REFERENCES "users" ("user_id") ON UPDATE CASCADE ON DELETE CASCADE;`,
      { transaction },
    );
    await safeQuery(
      queryInterface,
      `ALTER TABLE "user_roles" ADD CONSTRAINT "fk_user_roles_role" FOREIGN KEY ("role_fid") REFERENCES "roles" ("role_id") ON UPDATE CASCADE ON DELETE CASCADE;`,
      { transaction },
    );

    await safeQuery(
      queryInterface,
      `ALTER TABLE "role_permissions" ADD CONSTRAINT "fk_role_permissions_role" FOREIGN KEY ("role_fid") REFERENCES "roles" ("role_id") ON UPDATE CASCADE ON DELETE CASCADE;`,
      { transaction },
    );
    await safeQuery(
      queryInterface,
      `ALTER TABLE "role_permissions" ADD CONSTRAINT "fk_role_permissions_permission" FOREIGN KEY ("permission_fid") REFERENCES "permissions" ("permission_id") ON UPDATE CASCADE ON DELETE CASCADE;`,
      { transaction },
    );

    await safeQuery(
      queryInterface,
      `ALTER TABLE "role_page_permissions" ADD CONSTRAINT "fk_role_page_permissions_role" FOREIGN KEY ("role_fid") REFERENCES "roles" ("role_id") ON UPDATE CASCADE ON DELETE CASCADE;`,
      { transaction },
    );
    await safeQuery(
      queryInterface,
      `ALTER TABLE "role_page_permissions" ADD CONSTRAINT "fk_role_page_permissions_page" FOREIGN KEY ("page_fid") REFERENCES "pages" ("page_id") ON UPDATE CASCADE ON DELETE CASCADE;`,
      { transaction },
    );

    await safeQuery(
      queryInterface,
      `ALTER TABLE "audit_logs" ADD CONSTRAINT "fk_audit_logs_user" FOREIGN KEY ("user_fid") REFERENCES "users" ("user_id") ON UPDATE CASCADE ON DELETE SET NULL;`,
      { transaction },
    );
    await safeQuery(
      queryInterface,
      `ALTER TABLE "audit_logs" ADD CONSTRAINT "fk_audit_logs_enterprize" FOREIGN KEY ("enterprize_fid") REFERENCES "enterprizes" ("enterprize_id") ON UPDATE CASCADE ON DELETE SET NULL;`,
      { transaction },
    );

    await safeQuery(
      queryInterface,
      `ALTER TABLE "login_history" ADD CONSTRAINT "fk_login_history_user" FOREIGN KEY ("user_fid") REFERENCES "users" ("user_id") ON UPDATE CASCADE ON DELETE SET NULL;`,
      { transaction },
    );

    await safeQuery(
      queryInterface,
      `ALTER TABLE "otp_verifications" ADD CONSTRAINT "fk_otp_verifications_user" FOREIGN KEY ("user_fid") REFERENCES "users" ("user_id") ON UPDATE CASCADE ON DELETE CASCADE;`,
      { transaction },
    );

    await safeQuery(
      queryInterface,
      `ALTER TABLE "user_files" ADD CONSTRAINT "fk_user_files_user" FOREIGN KEY ("user_fid") REFERENCES "users" ("user_id") ON UPDATE CASCADE ON DELETE CASCADE;`,
      { transaction },
    );
    await safeQuery(
      queryInterface,
      `ALTER TABLE "user_files" ADD CONSTRAINT "fk_user_files_enterprize" FOREIGN KEY ("enterprize_fid") REFERENCES "enterprizes" ("enterprize_id") ON UPDATE CASCADE ON DELETE RESTRICT;`,
      { transaction },
    );
    await safeQuery(
      queryInterface,
      `ALTER TABLE "user_files" ADD CONSTRAINT "fk_user_files_parent" FOREIGN KEY ("parent_id") REFERENCES "user_files" ("user_files_id") ON UPDATE CASCADE ON DELETE SET NULL;`,
      { transaction },
    );

    await safeQuery(
      queryInterface,
      `ALTER TABLE "user_sessions" ADD CONSTRAINT "fk_user_sessions_user" FOREIGN KEY ("user_fid") REFERENCES "users" ("user_id") ON UPDATE CASCADE ON DELETE CASCADE;`,
      { transaction },
    );
    await safeQuery(
      queryInterface,
      `ALTER TABLE "user_sessions" ADD CONSTRAINT "fk_user_sessions_enterprize" FOREIGN KEY ("enterprize_fid") REFERENCES "enterprizes" ("enterprize_id") ON UPDATE CASCADE ON DELETE RESTRICT;`,
      { transaction },
    );
    await safeQuery(
      queryInterface,
      `ALTER TABLE "user_sessions" ADD CONSTRAINT "fk_user_sessions_login_history" FOREIGN KEY ("login_history_fid") REFERENCES "login_history" ("login_history_id") ON UPDATE CASCADE ON DELETE SET NULL;`,
      { transaction },
    );

    // Indexes / uniques
    await safeQuery(
      queryInterface,
      `CREATE UNIQUE INDEX IF NOT EXISTS "ux_user_roles_user_role" ON "user_roles" ("user_fid","role_fid");`,
      { transaction },
    );
    await safeQuery(
      queryInterface,
      `CREATE UNIQUE INDEX IF NOT EXISTS "ux_role_permissions_role_perm" ON "role_permissions" ("role_fid","permission_fid");`,
      { transaction },
    );
    await safeQuery(
      queryInterface,
      `CREATE UNIQUE INDEX IF NOT EXISTS "ux_role_page_permissions_role_page" ON "role_page_permissions" ("role_fid","page_fid");`,
      { transaction },
    );

    await safeQuery(
      queryInterface,
      `CREATE UNIQUE INDEX IF NOT EXISTS "ux_permissions_resource_action" ON "permissions" ("permission_resource","permission_action");`,
      { transaction },
    );

    await safeQuery(
      queryInterface,
      `CREATE UNIQUE INDEX IF NOT EXISTS "ux_roles_enterprize_name" ON "roles" ("enterprize_fid","role_name");`,
      { transaction },
    );

    await safeQuery(
      queryInterface,
      `CREATE UNIQUE INDEX IF NOT EXISTS "ux_pages_enterprize_route" ON "pages" ("enterprize_fid","page_route");`,
      { transaction },
    );
    await safeQuery(
      queryInterface,
      `CREATE UNIQUE INDEX IF NOT EXISTS "ux_pages_enterprize_name" ON "pages" ("enterprize_fid","page_name");`,
      { transaction },
    );
    await safeQuery(
      queryInterface,
      `CREATE UNIQUE INDEX IF NOT EXISTS "ux_pages_enterprize_model" ON "pages" ("enterprize_fid","model_name");`,
      { transaction },
    );

    await safeQuery(
      queryInterface,
      `CREATE UNIQUE INDEX IF NOT EXISTS "ux_users_enterprize_username" ON "users" ("enterprize_fid","user_name");`,
      { transaction },
    );
    await safeQuery(
      queryInterface,
      `CREATE UNIQUE INDEX IF NOT EXISTS "ux_users_enterprize_email" ON "users" ("enterprize_fid","user_email");`,
      { transaction },
    );

    await safeQuery(
      queryInterface,
      `CREATE UNIQUE INDEX IF NOT EXISTS "ux_user_sessions_refresh_token" ON "user_sessions" ("refresh_token");`,
      { transaction },
    );
    await safeQuery(
      queryInterface,
      `CREATE INDEX IF NOT EXISTS "idx_user_sessions_user_active" ON "user_sessions" ("user_fid","is_active");`,
      { transaction },
    );
    await safeQuery(
      queryInterface,
      `CREATE INDEX IF NOT EXISTS "idx_user_sessions_enterprize" ON "user_sessions" ("enterprize_fid");`,
      { transaction },
    );
  },

  async down(queryInterface, Sequelize, { transaction } = {}) {
    // Best-effort rollback of constraints/indexes only (type widening is not reverted).
    const drops = [
      `DROP INDEX IF EXISTS "ux_user_sessions_refresh_token";`,
      `DROP INDEX IF EXISTS "idx_user_sessions_user_active";`,
      `DROP INDEX IF EXISTS "idx_user_sessions_enterprize";`,

      `DROP INDEX IF EXISTS "ux_users_enterprize_username";`,
      `DROP INDEX IF EXISTS "ux_users_enterprize_email";`,
      `DROP INDEX IF EXISTS "ux_pages_enterprize_model";`,
      `DROP INDEX IF EXISTS "ux_pages_enterprize_name";`,
      `DROP INDEX IF EXISTS "ux_pages_enterprize_route";`,
      `DROP INDEX IF EXISTS "ux_roles_enterprize_name";`,
      `DROP INDEX IF EXISTS "ux_permissions_resource_action";`,
      `DROP INDEX IF EXISTS "ux_role_page_permissions_role_page";`,
      `DROP INDEX IF EXISTS "ux_role_permissions_role_perm";`,
      `DROP INDEX IF EXISTS "ux_user_roles_user_role";`,

      `ALTER TABLE "user_sessions" DROP CONSTRAINT IF EXISTS "fk_user_sessions_login_history";`,
      `ALTER TABLE "user_sessions" DROP CONSTRAINT IF EXISTS "fk_user_sessions_enterprize";`,
      `ALTER TABLE "user_sessions" DROP CONSTRAINT IF EXISTS "fk_user_sessions_user";`,

      `ALTER TABLE "user_files" DROP CONSTRAINT IF EXISTS "fk_user_files_parent";`,
      `ALTER TABLE "user_files" DROP CONSTRAINT IF EXISTS "fk_user_files_enterprize";`,
      `ALTER TABLE "user_files" DROP CONSTRAINT IF EXISTS "fk_user_files_user";`,

      `ALTER TABLE "otp_verifications" DROP CONSTRAINT IF EXISTS "fk_otp_verifications_user";`,
      `ALTER TABLE "login_history" DROP CONSTRAINT IF EXISTS "fk_login_history_user";`,

      `ALTER TABLE "audit_logs" DROP CONSTRAINT IF EXISTS "fk_audit_logs_enterprize";`,
      `ALTER TABLE "audit_logs" DROP CONSTRAINT IF EXISTS "fk_audit_logs_user";`,

      `ALTER TABLE "role_page_permissions" DROP CONSTRAINT IF EXISTS "fk_role_page_permissions_page";`,
      `ALTER TABLE "role_page_permissions" DROP CONSTRAINT IF EXISTS "fk_role_page_permissions_role";`,

      `ALTER TABLE "role_permissions" DROP CONSTRAINT IF EXISTS "fk_role_permissions_permission";`,
      `ALTER TABLE "role_permissions" DROP CONSTRAINT IF EXISTS "fk_role_permissions_role";`,

      `ALTER TABLE "user_roles" DROP CONSTRAINT IF EXISTS "fk_user_roles_role";`,
      `ALTER TABLE "user_roles" DROP CONSTRAINT IF EXISTS "fk_user_roles_user";`,

      `ALTER TABLE "customers" DROP CONSTRAINT IF EXISTS "fk_customers_enterprize";`,
      `ALTER TABLE "pages" DROP CONSTRAINT IF EXISTS "fk_pages_enterprize";`,
      `ALTER TABLE "roles" DROP CONSTRAINT IF EXISTS "fk_roles_enterprize";`,
      `ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "fk_users_enterprize";`,
    ];

    for (const sql of drops) {
      await safeQuery(queryInterface, sql, { transaction });
    }
  },
};

