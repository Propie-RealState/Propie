import { z } from "zod";

export const CreateReviewSchema = z.object({
  propertyId: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(1000).nullable().optional(),
});

export type CreateReviewInput = z.infer<typeof CreateReviewSchema>;
