import { GreetingController } from "@contexts/greetings/infrastructure/http/v2/controllers/GreetingController";
import { container } from "@shared/infrastructure/config/dependency-injection/container";
import { FastifyInstance } from "fastify";

/**
 * Greeting Routes (Fastify v2)
 * Registers all greeting endpoints with OpenAPI schemas for v2
 */
export function greetingRoutes(fastify: FastifyInstance): void {
  const controller = container.resolve<GreetingController>(
    "greetingControllerV2"
  );

  fastify.get("/greetings", {
    schema: {
      description: "Get greeting message with timestamp and version (v2)",
      tags: ["Greetings"],
      response: {
        200: {
          type: "object",
          properties: {
            message: { type: "string" },
            timestamp: { type: "string", format: "date-time" },
            version: { type: "string" },
          },
          required: ["message", "timestamp", "version"],
        },
      },
    },
    handler: controller.handle.bind(controller),
  });
}
