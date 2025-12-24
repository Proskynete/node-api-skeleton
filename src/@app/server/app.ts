import { registerHealthRoutes } from "@app/server/health";
import { loadRoutes } from "@app/server/loaders/route-loader";
import { errorHandler } from "@app/server/middlewares/errorHandler";
import { corsPlugin } from "@app/server/plugins/cors.plugin";
import { helmetPlugin } from "@app/server/plugins/helmet.plugin";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import { env } from "@shared/infrastructure/config/environment";
import Fastify, { FastifyInstance } from "fastify";

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

  // Auto-load routes from all contexts (scans @contexts/*/infrastructure/http/v*/routes/)
  await loadRoutes(app);

  // Error handler (must be last)
  app.setErrorHandler(errorHandler);

  return app;
}
