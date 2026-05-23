import { z } from "zod";

export const SearchAddressQuerySchema =
  z.object({
    query:
      z.string()
        .trim()
        .min(3),

    limit:
      z.coerce
        .number()
        .int()
        .min(1)
        .max(8)
        .default(5),
  });

export type SearchAddressQueryInput =
  z.infer<
    typeof SearchAddressQuerySchema
  >;
