import { z } from "zod";

export const GreetingRequestSchema = z.object({
  customMessage: z.string().min(1).max(200).optional(),
});

export type GreetingRequestDto = z.infer<typeof GreetingRequestSchema>;
