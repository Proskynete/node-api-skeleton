import Fastify, { FastifyInstance } from "fastify";

import { env } from "@shared/infrastructure/config/environment";
import { corsPlugin } from "@shared/infrastructure/http/shared/plugins/cors.plugin";
import { helmetPlugin } from "@shared/infrastructure/http/shared/plugins/helmet.plugin";

export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({
    logger: {
      level: env.LOG_LEVEL,
      transport: {
        target: "pino-pretty",
        options: {
          translateTime: "HH:MM:ss Z",
          ignore: "pid,hostname",
        },
      },
    },
  });

  // Register plugins
  await app.register(corsPlugin);
  await app.register(helmetPlugin);

  // Health check endpoint
  app.get("/health", async () => {
    return { status: "ok", timestamp: new Date().toISOString() };
  });

  return app;
}
