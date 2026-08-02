import { z } from "zod";

export const SyncFavoritesSchema = z.object({
  propertyIds: z.array(z.string().uuid()),
});

export type SyncFavoritesInput = z.infer<typeof SyncFavoritesSchema>;
