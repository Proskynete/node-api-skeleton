import Fastify, { FastifyInstance } from "fastify";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";

import { env } from "@shared/infrastructure/config/environment";
import { corsPlugin } from "@shared/infrastructure/http/shared/plugins/cors.plugin";
import { helmetPlugin } from "@shared/infrastructure/http/shared/plugins/helmet.plugin";
import { errorHandler } from "@shared/infrastructure/http/middlewares/errorHandler";
import { greetingRoutes as v1GreetingRoutes } from "@contexts/greetings/infrastructure/http/v1/routes/greeting.routes";

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
    requestIdLogLabel: "requestId",
    disableRequestLogging: false,
  });

  // Register plugins
  await app.register(corsPlugin);
  await app.register(helmetPlugin);

  // Swagger configuration
  await app.register(swagger, {
    openapi: {
      info: {
        title: "Node API Skeleton",
        description:
          "API with Hexagonal + Onion + Screaming Architecture using Fastify",
        version: "1.0.0",
      },
      servers: [
        {
          url: `http://localhost:${env.PORT}`,
          description: "Development",
        },
      ],
      tags: [{ name: "Greetings", description: "Greeting endpoints" }],
    },
  });

  await app.register(swaggerUi, {
    routePrefix: "/docs",
    uiConfig: {
      docExpansion: "list",
      deepLinking: false,
    },
    staticCSP: true,
  });

  // Health check endpoint
  app.get(
    "/health",
    {
      schema: {
        description: "Health check endpoint",
        tags: ["Health"],
        response: {
          200: {
            type: "object",
            properties: {
              status: { type: "string" },
              timestamp: { type: "string" },
            },
          },
        },
      },
    },
    async () => ({
      status: "ok",
      timestamp: new Date().toISOString(),
    })
  );

  // Register v1 routes
  await app.register(v1GreetingRoutes, { prefix: "/api/v1" });

  // Error handler (must be last)
  app.setErrorHandler(errorHandler);

  return app;
}
