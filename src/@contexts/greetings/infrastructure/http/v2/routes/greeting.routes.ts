import { GreetingResponseSchema } from "@contexts/greetings/application/v2/dtos/GreetingResponseDto";
import { GreetingController } from "@contexts/greetings/infrastructure/http/v2/controllers/GreetingController";
import { container } from "@shared/infrastructure/config/dependency-injection/container";
import { ErrorResponseSchema } from "@shared/infrastructure/http/schemas/ErrorResponseSchema";
import { FastifyInstance } from "fastify";
import { zodToJsonSchema } from "zod-to-json-schema";

/**
 * Greeting Routes (Fastify v2)
 * Registers all greeting endpoints with Zod-based validation schemas for v2
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
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
        200: zodToJsonSchema(GreetingResponseSchema as any, {
          target: "openApi3",
          $refStrategy: "none",
        }),
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
        400: zodToJsonSchema(ErrorResponseSchema as any, {
          target: "openApi3",
          $refStrategy: "none",
        }),
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
        500: zodToJsonSchema(ErrorResponseSchema as any, {
          target: "openApi3",
          $refStrategy: "none",
        }),
      },
    },
    handler: controller.handle.bind(controller),
  });
}
