import { z } from "zod";

// Explore listing pagination query.
//   - No params            → full array (legacy, current default).
//   - `offset` present      → legacy LIMIT/OFFSET array (deprecated, temporary).
//   - `cursor` and/or `limit` (no offset) → keyset envelope (preferred).
export const ExplorePaginationSchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).optional(),
  offset: z.coerce.number().int().min(0).optional(),
  cursor: z.string().min(1).optional(),
});

export type ExplorePaginationInput = z.infer<typeof ExplorePaginationSchema>;
