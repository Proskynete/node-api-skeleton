import swagger from "@fastify/swagger";
import { env } from "@shared/infrastructure/config/environment";
import { FastifyInstance } from "fastify";
import fp from "fastify-plugin";

async function swaggerPluginInternal(fastify: FastifyInstance): Promise<void> {
  await fastify.register(swagger, {
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
}

export const swaggerPlugin = fp(swaggerPluginInternal);
