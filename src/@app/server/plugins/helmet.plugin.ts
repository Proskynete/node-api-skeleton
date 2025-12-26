import fastifyHelmet from "@fastify/helmet";
import { env } from "@shared/infrastructure/config/environment";
import { FastifyInstance } from "fastify";

export async function helmetPlugin(fastify: FastifyInstance): Promise<void> {
  await fastify.register(fastifyHelmet, {
    contentSecurityPolicy:
      env.NODE_ENV === "production"
        ? {
            directives: {
              defaultSrc: ["'self'"],
              styleSrc: ["'self'", "'unsafe-inline'"],
              scriptSrc: ["'self'"],
              imgSrc: ["'self'", "data:", "https:"],
              connectSrc: ["'self'"],
              fontSrc: ["'self'"],
              objectSrc: ["'none'"],
              mediaSrc: ["'self'"],
              frameSrc: ["'none'"],
            },
          }
        : false, // Disable CSP in development for easier debugging
  });
}
