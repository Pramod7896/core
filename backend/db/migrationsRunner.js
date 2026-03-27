import fs from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const defaultMigrationsDir = path.resolve(__dirname, "..", "migrations");

const ensureMetaTable = async (sequelize, { transaction } = {}) => {
  await sequelize.query(
    `
      CREATE TABLE IF NOT EXISTS "SequelizeMeta" (
        name VARCHAR(255) PRIMARY KEY
      );
    `,
    { transaction },
  );
};

const getAppliedMigrations = async (sequelize) => {
  const [rows] = await sequelize.query(`SELECT name FROM "SequelizeMeta";`);
  return new Set(rows.map((r) => r.name));
};

const listMigrationFiles = (migrationsDir) => {
  if (!fs.existsSync(migrationsDir)) return [];
  return fs
    .readdirSync(migrationsDir)
    .filter((f) => f.endsWith(".js"))
    .sort();
};

export const runMigrations = async ({
  sequelize,
  logger = console,
  migrationsDir = defaultMigrationsDir,
} = {}) => {
  if (!sequelize) throw new Error("sequelize is required");

  await sequelize.authenticate();
  await ensureMetaTable(sequelize);

  const applied = await getAppliedMigrations(sequelize);
  const files = listMigrationFiles(migrationsDir);

  for (const file of files) {
    if (applied.has(file)) continue;

    const fullPath = path.join(migrationsDir, file);
    const mod = await import(pathToFileURL(fullPath).toString());
    const migration = mod?.default || mod;

    if (typeof migration?.up !== "function") {
      throw new Error(`Migration ${file} is missing an up() function`);
    }

    logger.info?.(`[MIGRATE] Applying ${file}`);
    await sequelize.transaction(async (transaction) => {
      await migration.up(sequelize.getQueryInterface(), sequelize.constructor, {
        transaction,
      });
      await sequelize.query(`INSERT INTO "SequelizeMeta"(name) VALUES ($1);`, {
        bind: [file],
        transaction,
      });
    });
    logger.info?.(`[MIGRATE] Applied ${file}`);
  }

  logger.info?.("[MIGRATE] All migrations are up to date");
};

