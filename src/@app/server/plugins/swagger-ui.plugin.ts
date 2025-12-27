import swaggerUi from "@fastify/swagger-ui";
import { FastifyInstance } from "fastify";
import fp from "fastify-plugin";

async function swaggerUiPluginInternal(
  fastify: FastifyInstance
): Promise<void> {
  await fastify.register(swaggerUi, {
    routePrefix: "/docs",
    uiConfig: {
      docExpansion: "list",
      deepLinking: false,
    },
    staticCSP: true,
  });
}

export const swaggerUiPlugin = fp(swaggerUiPluginInternal);
