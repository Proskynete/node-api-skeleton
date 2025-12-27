import fastifyRateLimit from "@fastify/rate-limit";
import { env } from "@shared/infrastructure/config/environment";
import { FastifyInstance } from "fastify";
import fp from "fastify-plugin";

async function rateLimitPluginInternal(
  fastify: FastifyInstance
): Promise<void> {
  await fastify.register(fastifyRateLimit, {
    global: true,
    max: env.RATE_LIMIT_MAX,
    timeWindow: env.RATE_LIMIT_TIME_WINDOW,
    cache: 10000,
    allowList: [],
    skipOnError: true,
    addHeadersOnExceeding: {
      "x-ratelimit-limit": true,
      "x-ratelimit-remaining": true,
      "x-ratelimit-reset": true,
    },
    addHeaders: {
      "x-ratelimit-limit": true,
      "x-ratelimit-remaining": true,
      "x-ratelimit-reset": true,
      "retry-after": true,
    },
    errorResponseBuilder: (_request, context) => ({
      error: "Too Many Requests",
      message: `Rate limit exceeded. Please try again in ${Math.ceil(context.ttl / 1000)} seconds.`,
      statusCode: 429,
      limit: context.max,
      remaining: 0,
      retryAfter: Math.ceil(context.ttl / 1000),
    }),
  });
}

export const rateLimitPlugin = fp(rateLimitPluginInternal);
