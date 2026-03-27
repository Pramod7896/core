import winston from "winston";
import fs from "fs";

// Create logs directory if it doesn't exist
if (!fs.existsSync("logs")) {
  fs.mkdirSync("logs");
}

export const logger = winston.createLogger({
  level: "debug", // capture debug, info, warn, error
  format: winston.format.combine(
    winston.format.colorize(), // color in console
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.printf(({ timestamp, level, message }) => `[${timestamp}] ${level}: ${message}`)
  ),
  transports: [
    // Console transport for debugging
    new winston.transports.Console({
      level: "debug", // show debug logs in console
    }),

    // File transport for all logs
    new winston.transports.File({
      filename: "logs/combined.log",
      level: "debug",
    }),

    // File transport for error logs
    new winston.transports.File({
      filename: "logs/error.log",
      level: "error",
    }),
  ],
});

// Optional: make sure unhandled exceptions are logged
logger.exceptions.handle(
  new winston.transports.File({ filename: "logs/exceptions.log" }),
  new winston.transports.Console({ level: "error" })
);
