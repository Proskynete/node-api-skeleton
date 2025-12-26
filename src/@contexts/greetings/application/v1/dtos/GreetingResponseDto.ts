import { z } from "zod";

export const GreetingResponseSchema = z.object({
  message: z.string().min(1),
});

export type GreetingResponseDto = z.infer<typeof GreetingResponseSchema>;
