import { z } from "zod";

/**
 * Greeting Request DTO for API v2
 * Same as v1 - optional custom message
 */
export const GreetingRequestSchema = z.object({
  customMessage: z.string().min(1).max(200).optional(),
});

export type GreetingRequestDto = z.infer<typeof GreetingRequestSchema>;
