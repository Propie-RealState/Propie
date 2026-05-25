import { z }
from "zod";

export const UpdatePropertyDetailsSchema =
  z.object({

    title:
      z.string(),

    description:
      z.string(),

    price:
      z.number(),

    bedrooms:
      z.number(),

    bathrooms:
      z.number(),

    areaM2:
      z.number(),
  });

export type UpdatePropertyDetailsInput =
  z.infer<
    typeof UpdatePropertyDetailsSchema
  >;