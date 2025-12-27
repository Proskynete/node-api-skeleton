import { metrics } from "@shared/infrastructure/observability/metrics/PrometheusMetrics";
import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

/**
 * Prometheus Metrics Route
 * Provides endpoint for scraping application metrics
 */
export function registerMetricsRoute(app: FastifyInstance): void {
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
    async (_request: FastifyRequest, reply: FastifyReply) => {
      reply.header("Content-Type", metrics.register.contentType);
      return metrics.register.metrics();
    }
  );
}
