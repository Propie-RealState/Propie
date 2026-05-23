import { z } from "zod";

const LatitudeSchema =
  z.coerce
    .number()
    .min(-90)
    .max(90);

const LongitudeSchema =
  z.coerce
    .number()
    .min(-180)
    .max(180);

const MapFiltersSchema =
  z.object({
    operationType:
      z.string().min(1).optional(),

    propertyType:
      z.string().min(1).optional(),

    minPrice:
      z.coerce.number().nonnegative().optional(),

    maxPrice:
      z.coerce.number().nonnegative().optional(),
  });

export const PropertyMapQuerySchema =
  MapFiltersSchema.extend({
    nelat:
      LatitudeSchema,

    nelng:
      LongitudeSchema,

    swlat:
      LatitudeSchema,

    swlng:
      LongitudeSchema,

    zoom:
      z.coerce
        .number()
        .min(1)
        .max(22),
  }).superRefine((value, ctx) => {
    if (value.nelat <= value.swlat) {
      ctx.addIssue({
        code:
          "custom",
        path:
          ["nelat"],
        message:
          "nelat must be greater than swlat",
      });
    }

    if (value.nelng <= value.swlng) {
      ctx.addIssue({
        code:
          "custom",
        path:
          ["nelng"],
        message:
          "nelng must be greater than swlng",
      });
    }

    if (
      value.minPrice !== undefined &&
      value.maxPrice !== undefined &&
      value.minPrice > value.maxPrice
    ) {
      ctx.addIssue({
        code:
          "custom",
        path:
          ["minPrice"],
        message:
          "minPrice must be lower than maxPrice",
      });
    }
  });

export const NearbyPropertiesQuerySchema =
  MapFiltersSchema.extend({
    lat:
      LatitudeSchema,

    lng:
      LongitudeSchema,

    radius:
      z.coerce
        .number()
        .positive()
        .max(100000)
        .default(5000),

    limit:
      z.coerce
        .number()
        .int()
        .min(1)
        .max(100)
        .default(50),

    offset:
      z.coerce
        .number()
        .int()
        .min(0)
        .default(0),
  }).superRefine((value, ctx) => {
    if (
      value.minPrice !== undefined &&
      value.maxPrice !== undefined &&
      value.minPrice > value.maxPrice
    ) {
      ctx.addIssue({
        code:
          "custom",
        path:
          ["minPrice"],
        message:
          "minPrice must be lower than maxPrice",
      });
    }
  });

export type PropertyMapQueryInput =
  z.infer<
    typeof PropertyMapQuerySchema
  >;

export type NearbyPropertiesQueryInput =
  z.infer<
    typeof NearbyPropertiesQuerySchema
  >;
