import { HealthCheck, ReadinessResponse } from "@shared/types/http-responses";
import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

/**
 * Health Check Routes
 * Provides liveness and readiness endpoints for Kubernetes-style health checks
 */

export function registerHealthRoutes(app: FastifyInstance): void {
  // Liveness probe - indicates if the application is alive
  app.get(
    "/health/live",
    {
      schema: {
        description: "Liveness probe - checks if application is alive",
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
    async (_request: FastifyRequest, reply: FastifyReply) => {
      return reply.status(200).send({
        status: "alive",
        timestamp: new Date().toISOString(),
      });
    }
  );

  // Readiness probe - indicates if the application is ready to serve traffic
  app.get(
    "/health/ready",
    {
      schema: {
        description: "Readiness probe - checks if application is ready",
        tags: ["Health"],
        response: {
          200: {
            type: "object",
            properties: {
              status: { type: "string" },
              checks: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    name: { type: "string" },
                    status: { type: "string" },
                    responseTime: { type: "number" },
                    message: { type: "string" },
                  },
                },
              },
              timestamp: { type: "string" },
            },
          },
          503: {
            type: "object",
            properties: {
              status: { type: "string" },
              checks: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    name: { type: "string" },
                    status: { type: "string" },
                    responseTime: { type: "number" },
                    message: { type: "string" },
                  },
                },
              },
              timestamp: { type: "string" },
            },
          },
        },
      },
    },
    async (_request: FastifyRequest, reply: FastifyReply) => {
      const checks: HealthCheck[] = [];
      const startTime = Date.now();

      // Check 1: Memory usage
      const memUsage = process.memoryUsage();
      const heapUsedMB = Math.round(memUsage.heapUsed / 1024 / 1024);
      const heapTotalMB = Math.round(memUsage.heapTotal / 1024 / 1024);
      const memCheck: HealthCheck = {
        name: "memory",
        status:
          memUsage.heapUsed < memUsage.heapTotal * 0.9
            ? "healthy"
            : "unhealthy",
        responseTime: Date.now() - startTime,
        message: `Heap used: ${heapUsedMB}MB / ${heapTotalMB}MB`,
      };
      checks.push(memCheck);

      // Future: Add more checks here (database, Redis, external services, etc.)
      // Example:
      // const dbCheck: HealthCheck = {
      //   name: "database",
      //   status: await checkDatabase() ? "healthy" : "unhealthy",
      //   responseTime: Date.now() - startTime,
      //   message: "Database connection OK"
      // };
      // checks.push(dbCheck);

      const allHealthy = checks.every((c) => c.status === "healthy");
      const statusCode = allHealthy ? 200 : 503;

      const response: ReadinessResponse = {
        status: allHealthy ? "ready" : "not ready",
        checks,
        timestamp: new Date().toISOString(),
      };

      return reply.status(statusCode).send(response);
    }
  );

  // Legacy /health endpoint for backward compatibility
  app.get(
    "/health",
    {
      schema: {
        description: "Legacy health check endpoint (alias for /health/live)",
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
    async (_request: FastifyRequest, reply: FastifyReply) => {
      return reply.status(200).send({
        status: "ok",
        timestamp: new Date().toISOString(),
      });
    }
  );
}
