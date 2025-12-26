import { metrics } from "@shared/infrastructure/observability/metrics/PrometheusMetrics";
import { FastifyReply, FastifyRequest } from "fastify";

export function onRequestHook(
  request: FastifyRequest,
  _reply: FastifyReply,
  done: () => void
): void {
  const route = request.routeOptions?.url ?? "unknown";
  metrics.httpRequestsInProgress.inc({ method: request.method, route });
  done();
}
