import fastifyHelmet from "@fastify/helmet";
import { FastifyInstance } from "fastify";

export async function helmetPlugin(fastify: FastifyInstance): Promise<void> {
  await fastify.register(fastifyHelmet, {
    contentSecurityPolicy: false, // Disable for Swagger UI
  });
}
