import express from "express";
import helmet from "helmet";
import cors from "cors";

import { config } from "./config/config.js";
import { connectDB } from "./config/database.js";
import { logger } from "./config/logger.js";

import { requestLogger } from "./middlewares/requestLogger.middleware.js";
import { requestContextMiddleware } from "./middlewares/requestContext.middleware.js";
import { auditTrail } from "./middlewares/auditTrail.middleware.js";
import { errorHandler } from "./middlewares/error.middleware.js";
import { notFound } from "./middlewares/notFound.middleware.js";

import v1Routes from "./routes/v1/index.js";

import authRoutes from "./routes/v1/auth.routes.js";
import pageRoutes from "./routes/v1/page.route.js";
import pageCRUDRoutes from "./routes/v1/pageCRUD.route.js";
import rbacRoutes from "./routes/v1/rbac.route.js";
import sidebarMenuRoutes from "./routes/v1/sidebarMenu.route.js";

import seedSuperAdmin from "./seeders/initialSuperAdmin.seed.js";

import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

/**
 * ========================================
 * TRUST PROXY
 * ========================================
 */
app.set("trust proxy", true);

/**
 * ========================================
 * SECURITY MIDDLEWARE
 * ========================================
 * If Images are not loading in production, check if helmet is blocking them and adjust the configuration accordingly.
 */

app.use(
  helmet({
    // allow serving uploaded assets to the frontend
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
);

app.use(
  cors({
    origin: (origin, cb) => {
      const configured = String(process.env.CORS_ORIGINS || "")
        .split(",")
        .map((o) => o.trim())
        .filter(Boolean);

      // Allow non-browser clients (curl, server-to-server)
      if (!origin) return cb(null, true);

      // Development default: allow all unless explicitly restricted
      if (config.nodeEnv === "development" && configured.length === 0) {
        return cb(null, true);
      }

      if (configured.includes(origin)) return cb(null, true);
      return cb(new Error("Not allowed by CORS"), false);
    },
    credentials: true,
  }),
);

/**
 * ========================================
 * BODY PARSING
 * ========================================
 */
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

/**
 * ========================================
 * REQUEST LOGGER
 * ========================================
 */
app.use(requestLogger);
app.use(requestContextMiddleware);
app.use(auditTrail);

/**
 * ========================================
 * SERVE UPLOADS / STATIC FILES
 * ========================================
 */
// Serve static files with CORS headers
// Serve uploads folder with CORS headers
app.use(
  "/uploads",
  cors({ origin: true, credentials: true }), // allow frontend origin
  express.static(path.join(process.cwd(), "uploads")),
);

/**
 * ========================================
 * HEALTH CHECK
 * ========================================
 */
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is healthy",
  });
});

/**
 * ========================================
 * AUTH ROUTES
 * ========================================
 */
app.use("/api/v1/auth", authRoutes);

/**
 * ========================================
 * PAGE DATA ROUTES
 * ========================================
 */
app.use("/api/v1/pages", pageRoutes);

/**
 * ========================================
 * PAGE CRUD ROUTES
 * ========================================
 */
app.use("/api/v1/page-crud", pageCRUDRoutes);

/**
 * ========================================
 * RBAC ROUTES
 * ========================================
 */
app.use("/api/v1/rbac", rbacRoutes);

/**
 * ========================================
 * SIDEBAR MENU ROUTES
 * ========================================
 */
app.use("/api/v1/sidebar-menu", sidebarMenuRoutes);

/**
 * ========================================
 * OTHER V1 ROUTES
 * ========================================
 */
app.use("/api/v1", v1Routes);

/**
 * ========================================
 * NOT FOUND HANDLER
 * ========================================
 */
app.use(notFound);

/**
 * ========================================
 * GLOBAL ERROR HANDLER
 * ========================================
 */
app.use(errorHandler);

/**
 * ========================================
 * START SERVER
 * ========================================
 */
const startServer = async () => {
  try {
    await connectDB();

    /**
     * OPTIONAL SUPERADMIN SEED
     */
    if (process.env.RUN_SEEDS_ON_START === "true") {
      await seedSuperAdmin();
    }

    app.listen(config.port, () => {
      logger.info(`Server running on port ${config.port}`);
      logger.info(`Environment: ${config.nodeEnv}`);
      logger.info(`Health check: http://localhost:${config.port}/health`);
      logger.info(
        `Uploads folder served at: http://localhost:${config.port}/uploads`,
      );
    });
  } catch (error) {
    logger.error("Server start failed:", error);
    process.exit(1);
  }
};

startServer();

/**
 * ========================================
 * GRACEFUL SHUTDOWN
 * ========================================
 */
process.on("SIGINT", () => {
  logger.info("Server shutting down...");
  process.exit();
});

process.on("SIGTERM", () => {
  logger.info("SIGTERM received. Closing server...");
  process.exit();
});
