import { FastifyInstance } from "fastify";

/**
 * Health Check Routes
 * Provides health and readiness endpoints for monitoring
 */
export async function registerHealthRoutes(
  app: FastifyInstance
): Promise<void> {
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
}
