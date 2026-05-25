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

    lat:
      z.number()
        .min(-90)
        .max(90)
        .optional(),

    lng:
      z.number()
        .min(-180)
        .max(180)
        .optional(),
  }).superRefine((value, ctx) => {
    const hasLat =
      value.lat !== undefined;

    const hasLng =
      value.lng !== undefined;

    if (hasLat !== hasLng) {
      ctx.addIssue({
        code:
          "custom",
        path:
          hasLat
            ? ["lng"]
            : ["lat"],
        message:
          "lat and lng must be provided together",
      });
    }
  });

export type UpdatePropertyLocationInput =
  z.infer<
    typeof UpdatePropertyLocationSchema
  >;
