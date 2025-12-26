import { z } from "zod";

/**
 * Standard Error Response Schema
 * Used across all API endpoints for consistent error responses
 */
export const ErrorResponseSchema = z.object({
  error: z.string(),
  message: z.string(),
  code: z.string().optional(),
  requestId: z.string().optional(),
});

export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;
