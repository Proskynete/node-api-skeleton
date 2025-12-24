import fastifyCors from "@fastify/cors";
import { FastifyInstance } from "fastify";

export async function corsPlugin(fastify: FastifyInstance): Promise<void> {
  await fastify.register(fastifyCors, {
    origin: true, // Allow all origins in development
    credentials: true,
  });
}
