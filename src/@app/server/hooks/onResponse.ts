import { metrics } from "@shared/infrastructure/observability/metrics/PrometheusMetrics";
import { FastifyReply, FastifyRequest } from "fastify";

export function onResponseHook(
  request: FastifyRequest,
  reply: FastifyReply,
  done: () => void
): void {
  const route = request.routeOptions?.url ?? "unknown";
  const version = route.split("/")[2] ?? "unknown"; // /api/v1/... -> v1
  const duration = reply.elapsedTime / 1000; // ms to seconds

  metrics.httpRequestDuration.observe(
    {
      method: request.method,
      route,
      status_code: reply.statusCode,
      version,
    },
    duration
  );

  metrics.httpRequestTotal.inc({
    method: request.method,
    route,
    status_code: reply.statusCode,
    version,
  });

  metrics.httpRequestsInProgress.dec({ method: request.method, route });

  done();
}
