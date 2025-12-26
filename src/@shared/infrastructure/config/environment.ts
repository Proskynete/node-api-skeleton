import "dotenv/config";

import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z.coerce.number().int().positive().default(3000),
  BASE_URL: z.string().default("/api"),
  LOG_LEVEL: z
    .enum(["error", "warn", "info", "http", "verbose", "debug", "silly"])
    .default("info"),
  // Rate Limiting
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(100),
  RATE_LIMIT_TIME_WINDOW: z.coerce.number().int().positive().default(60000), // 1 minute in ms
  // JWT Authentication
  JWT_SECRET: z
    .string()
    .min(32)
    .default("change-me-in-production-use-at-least-32-characters"),
  JWT_EXPIRES_IN: z.string().default("1h"),
  // CORS Configuration
  ALLOWED_ORIGINS: z
    .string()
    .default("http://localhost:3000,http://localhost:3001"),
});

export type Environment = z.infer<typeof envSchema>;

function validateEnvironment(): Environment {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("❌ Invalid environment variables:");
      for (const issue of error.issues) {
        const path = issue.path.join(".");
        const message = issue.message;
        console.error(`  - ${path}: ${message}`);
      }
      process.exit(1);
    }
    throw error;
  }
}

export const env = validateEnvironment();
