import Fastify, { FastifyInstance } from "fastify";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";

import { env } from "@shared/infrastructure/config/environment";
import { corsPlugin } from "@app/server/plugins/cors.plugin";
import { helmetPlugin } from "@app/server/plugins/helmet.plugin";
import { errorHandler } from "@app/server/middlewares/errorHandler";
import { registerHealthRoutes } from "@app/server/health";
import { greetingRoutes as v1GreetingRoutes } from "@contexts/greetings/infrastructure/http/v1/routes/greeting.routes";
import { greetingRoutes as v2GreetingRoutes } from "@contexts/greetings/infrastructure/http/v2/routes/greeting.routes";

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
        version: "2.0.0",
      },
      servers: [
        {
          url: `http://localhost:${env.PORT}`,
          description: "Development",
        },
      ],
      tags: [
        {
          name: "Greetings",
          description: "Greeting endpoints (v1 and v2 available)",
        },
      ],
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

  // Health check routes
  await registerHealthRoutes(app);

  // Register v1 routes
  await app.register(v1GreetingRoutes, { prefix: "/api/v1" });

  // Register v2 routes
  await app.register(v2GreetingRoutes, { prefix: "/api/v2" });

  // Error handler (must be last)
  app.setErrorHandler(errorHandler);

  return app;
}
