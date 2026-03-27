import { Sequelize } from "sequelize";
import { config } from "./config.js";
import { logger } from "./logger.js";
import { runMigrations } from "../db/migrationsRunner.js";

export const sequelize = new Sequelize(
  config.db.name,
  config.db.user,
  config.db.password,
  {
    host: config.db.host,
    port: config.db.port,
    dialect: "postgres",
    logging: false,
  },
);

export const connectDB = async () => {
  try {
    await sequelize.authenticate();

    console.log("✅ Database connected");
    logger.info("Database connected successfully");

    /**
     * ✅ Schema management
     *
     * sequelize.sync({ alter: true }) is convenient, but on Postgres it can emit
     * invalid ALTER statements (commonly around FKs / REFERENCES) and crash on
     * subsequent startups. To keep dev startups repeatable, we default to
     * migrations and only run sync-alter when explicitly enabled.
     */
    const isDevelopment = config.nodeEnv === "development";
    const shouldSyncAlter = process.env.DB_SYNC_ALTER === "true";

    if (shouldSyncAlter) {
      await sequelize.sync({ alter: true });
      console.log("✅ Models synced (DB_SYNC_ALTER=true)");
      logger.info("Models synced using sequelize.sync()");
    }

    const runMigrationsEnv = process.env.RUN_MIGRATIONS;
    const shouldRunMigrations =
      runMigrationsEnv === "true" ||
      (isDevelopment &&
        runMigrationsEnv !== "false" &&
        // Avoid running both at startup unless explicitly requested
        !shouldSyncAlter);

    if (shouldRunMigrations) {
      await runMigrations({ sequelize, logger });
    }
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);

    logger.error({
      message: "Database connection failed",
      error: error.message,
      stack: error.stack,
    });

    process.exit(1);
  }
};
