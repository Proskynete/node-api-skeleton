import { registerHealthRoutes } from "@app/server/health";
import { onRequestHook } from "@app/server/hooks/onRequest";
import { onResponseHook } from "@app/server/hooks/onResponse";
import { loadRoutes } from "@app/server/loaders/route-loader";
import { registerMetricsRoute } from "@app/server/metrics";
import { errorHandler } from "@app/server/middlewares/errorHandler";
import { corsPlugin } from "@app/server/plugins/cors.plugin";
import { helmetPlugin } from "@app/server/plugins/helmet.plugin";
import { rateLimitPlugin } from "@app/server/plugins/rate-limit.plugin";
import { swaggerPlugin } from "@app/server/plugins/swagger.plugin";
import { swaggerUiPlugin } from "@app/server/plugins/swagger-ui.plugin";
import { env } from "@shared/infrastructure/config/environment";
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
  await app.register(rateLimitPlugin);
  await app.register(swaggerPlugin);
  await app.register(swaggerUiPlugin);

  // Register hooks for Prometheus metrics
  app.addHook("onRequest", onRequestHook);
  app.addHook("onResponse", onResponseHook);

  // Register routes
  registerMetricsRoute(app);
  registerHealthRoutes(app);

  // Auto-load routes from all contexts (scans @contexts/*/infrastructure/http/v*/routes/)
  await loadRoutes(app);

  // Error handler (must be last)
  app.setErrorHandler(errorHandler);

  return app;
}
