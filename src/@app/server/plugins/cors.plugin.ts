import fastifyCors from "@fastify/cors";
import { env } from "@shared/infrastructure/config/environment";
import { FastifyInstance } from "fastify";

export async function corsPlugin(fastify: FastifyInstance): Promise<void> {
  // Parse allowed origins from comma-separated string
  let allowedOrigins: boolean | string[];

  if (env.NODE_ENV === "production") {
    // In production, use restricted origins from environment variable
    const originsString: string = env.ALLOWED_ORIGINS;
    const originsArray: string[] = originsString.split(",");
    allowedOrigins = originsArray.map((origin) => origin.trim());
  } else {
    // In development/test, allow all origins
    allowedOrigins = true;
  }

  await fastify.register(fastifyCors, {
    origin: allowedOrigins,
    credentials: true,
  });
}
