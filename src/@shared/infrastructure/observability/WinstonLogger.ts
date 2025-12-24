import { ILogger } from "@shared/infrastructure/observability/ILogger";
import winston from "winston";

/**
 * Winston Logger Implementation
 * Implements ILogger interface for structured logging
 * Used across all contexts via dependency injection
 */
export class WinstonLogger implements ILogger {
  private logger: winston.Logger;

  constructor(level = "info") {
    this.logger = winston.createLogger({
      level,
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.printf(({ level, message, timestamp, ...meta }) => {
              const metaStr =
                Object.keys(meta).length > 0
                  ? JSON.stringify(meta, null, 2)
                  : "";
              return `${timestamp} [${level}]: ${message} ${metaStr}`;
            })
          ),
        }),
      ],
    });
  }

  info(message: string, meta?: object): void {
    this.logger.info(message, meta);
  }

  error(message: string, error?: Error, meta?: object): void {
    this.logger.error(message, {
      error: error?.message,
      stack: error?.stack,
      ...meta,
    });
  }

  warn(message: string, meta?: object): void {
    this.logger.warn(message, meta);
  }

  debug(message: string, meta?: object): void {
    this.logger.debug(message, meta);
  }
}
