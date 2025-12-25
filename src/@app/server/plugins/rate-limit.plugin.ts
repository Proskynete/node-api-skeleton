import fastifyRateLimit from "@fastify/rate-limit";
import { env } from "@shared/infrastructure/config/environment";
import { FastifyInstance } from "fastify";

export async function rateLimitPlugin(app: FastifyInstance): Promise<void> {
  await app.register(fastifyRateLimit, {
    global: true, // Apply to all routes
    max: env.RATE_LIMIT_MAX, // Maximum requests per time window
    timeWindow: env.RATE_LIMIT_TIME_WINDOW, // Time window in milliseconds
    cache: 10000, // Maximum number of clients to track
    allowList: [], // No IP exemptions (even localhost for consistent testing)
    skipOnError: true, // Don't apply rate limit if there's an error
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
