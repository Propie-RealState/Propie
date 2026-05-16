import { z } from "zod";

export const UpdatePropertyLocationSchema =
  z.object({
    country:
      z.string().min(2),

    province:
      z.string().min(2),

    city:
      z.string().min(2),

    neighborhood:
      z.string().min(2),

    address:
      z.string().min(5),
  });

export type UpdatePropertyLocationInput =
  z.infer<
    typeof UpdatePropertyLocationSchema
  >;