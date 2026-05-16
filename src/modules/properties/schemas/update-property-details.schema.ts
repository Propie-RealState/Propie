import { z }
from "zod";

export const UpdatePropertyDetailsSchema =
  z.object({
    bedrooms:
      z.number()
        .int()
        .min(0),

    bathrooms:
      z.number()
        .int()
        .min(0),

    areaM2:
      z.number()
        .positive(),
  });

export type UpdatePropertyDetailsInput =
  z.infer<
    typeof UpdatePropertyDetailsSchema
  >;