import { GreetingController } from "@contexts/greetings/infrastructure/http/v1/controllers/GreetingController";
import { container } from "@shared/infrastructure/config/dependency-injection/container";
import { FastifyInstance } from "fastify";

/**
 * Greeting Routes (Fastify v1)
 * Registers all greeting endpoints with OpenAPI schemas
 */
export async function greetingRoutes(fastify: FastifyInstance) {
  const controller =
    container.resolve<GreetingController>("greetingController");

  fastify.get("/greetings", {
    schema: {
      description: "Get greeting message",
      tags: ["Greetings"],
      response: {
        200: {
          type: "object",
          properties: {
            message: { type: "string" },
          },
          required: ["message"],
        },
      },
    },
    handler: controller.handle.bind(controller),
  });
}
