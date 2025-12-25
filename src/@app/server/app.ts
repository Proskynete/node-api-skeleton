import { registerHealthRoutes } from "@app/server/health";
import { onRequestHook } from "@app/server/hooks/onRequest";
import { onResponseHook } from "@app/server/hooks/onResponse";
import { loadRoutes } from "@app/server/loaders/route-loader";
import { errorHandler } from "@app/server/middlewares/errorHandler";
import { corsPlugin } from "@app/server/plugins/cors.plugin";
import { helmetPlugin } from "@app/server/plugins/helmet.plugin";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import { env } from "@shared/infrastructure/config/environment";
import { metrics } from "@shared/infrastructure/observability/metrics/PrometheusMetrics";
import Fastify, { FastifyInstance } from "fastify";

export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({
    logger: {
      level: env.LOG_LEVEL,
      // Only use pino-pretty in development
      ...(env.NODE_ENV === "development" && {
        transport: {
          target: "pino-pretty",
          options: {
            translateTime: "HH:MM:ss Z",
            ignore: "pid,hostname",
          },
        },
      }),
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
        {
          name: "Health",
          description: "Health check endpoints",
        },
        {
          name: "Metrics",
          description: "Prometheus metrics endpoint",
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

  // Register hooks for Prometheus metrics
  app.addHook("onRequest", onRequestHook);
  app.addHook("onResponse", onResponseHook);

  // Metrics endpoint
  app.get(
    "/metrics",
    {
      schema: {
        description: "Prometheus metrics endpoint",
        tags: ["Metrics"],
        response: {
          200: {
            type: "string",
            description: "Prometheus metrics in text format",
          },
        },
      },
    },
    async (_request, reply) => {
      reply.header("Content-Type", metrics.register.contentType);
      return metrics.register.metrics();
    }
  );

  // Health check routes
  await registerHealthRoutes(app);

  // Auto-load routes from all contexts (scans @contexts/*/infrastructure/http/v*/routes/)
  await loadRoutes(app);

  // Error handler (must be last)
  app.setErrorHandler(errorHandler);

  return app;
}
