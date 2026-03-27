import { sequelize } from "../config/database.js";
import { logger } from "../config/logger.js";
import { runMigrations } from "../db/migrationsRunner.js";

runMigrations({ sequelize, logger })
  .then(() => process.exit(0))
  .catch((err) => {
    logger.error(`[MIGRATE] Failed: ${err.message}`);
    process.exit(1);
  });
