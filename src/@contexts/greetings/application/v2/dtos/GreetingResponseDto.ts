import { z } from "zod";

/**
 * Greeting Response DTO for API v2
 * Enhanced version with timestamp and version information
 */
export const GreetingResponseSchema = z.object({
  message: z.string().min(1),
  timestamp: z.string().datetime(),
  version: z.string(),
});

export type GreetingResponseDto = z.infer<typeof GreetingResponseSchema>;
