import { logger } from "../config/logger.js";
import { v4 as uuidv4 } from "uuid";

export const requestLogger = (req, res, next) => {
  const start = Date.now();
  const requestId = uuidv4();

  req.requestId = requestId;

  res.on("finish", () => {
    const responseTime = Date.now() - start;
    const userId = req.user?.user_id || req.user?.id || "anonymous";

    const logMessage =
      `[${new Date().toISOString()}] ` +
      `[${req.method}] ` +
      `[${req.originalUrl}] ` +
      `[${res.statusCode}] ` +
      `[${responseTime}ms] ` +
      `[${req.ip}] ` +
      `[${userId}]`;

    logger.info(logMessage);
  });

  next();
};
