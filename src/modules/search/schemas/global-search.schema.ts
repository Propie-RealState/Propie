import { z } from "zod";

export const GlobalSearchQuerySchema =
  z.object({
    q: z
      .string()
      .trim()
      .min(1)
      .max(120),

    limit: z.coerce
      .number()
      .int()
      .min(1)
      .max(20)
      .default(8),
  });

export type GlobalSearchQueryInput =
  z.infer<typeof GlobalSearchQuerySchema>;
