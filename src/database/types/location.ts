import { z } from 'zod';



// ========================================================
// COORDINATES
// ========================================================

export const CoordinatesSchema = z.object({
  latitude: z
    .number()
    .min(-90)
    .max(90),

  longitude: z
    .number()
    .min(-180)
    .max(180),
});

export type Coordinates =
  z.infer<typeof CoordinatesSchema>;



// ========================================================
// GEO POINT
// ========================================================

export const GeoPointSchema =
  CoordinatesSchema.extend({
    srid: z
      .number()
      .default(4326),
  });

export type GeoPoint =
  z.infer<typeof GeoPointSchema>;



// ========================================================
// COUNTRY
// ========================================================

export const CountrySchema = z.object({
  code: z
    .string()
    .length(2),

  name: z
    .string()
    .min(2)
    .max(100),
});

export type Country =
  z.infer<typeof CountrySchema>;



// ========================================================
// CITY
// ========================================================

export const CitySchema = z.object({
  name: z
    .string()
    .min(2)
    .max(100),

  state: z
    .string()
    .max(100)
    .nullable()
    .optional(),

  countryCode: z
    .string()
    .length(2),
});

export type City =
  z.infer<typeof CitySchema>;



// ========================================================
// PROPERTY LOCATION
// ========================================================

export const PropertyLocationSchema =
  z.object({
    propertyId: z
      .string()
      .uuid(),

    country: z
      .string()
      .min(2)
      .max(100),

    city: z
      .string()
      .min(2)
      .max(100),

    address: z
      .string()
      .max(255)
      .nullable(),

    coordinates:
      CoordinatesSchema,

    createdAt: z
      .string()
      .datetime(),
  });

export type PropertyLocation =
  z.infer<
    typeof PropertyLocationSchema
  >;



// ========================================================
// MAP BOUNDS
// ========================================================

export const MapBoundsSchema =
  z.object({
    north: z
      .number()
      .min(-90)
      .max(90),

    south: z
      .number()
      .min(-90)
      .max(90),

    east: z
      .number()
      .min(-180)
      .max(180),

    west: z
      .number()
      .min(-180)
      .max(180),
  });

export type MapBounds =
  z.infer<typeof MapBoundsSchema>;



// ========================================================
// NEARBY SEARCH
// ========================================================

export const NearbySearchSchema =
  z.object({
    coordinates:
      CoordinatesSchema,

    radiusMeters: z
      .number()
      .positive()
      .max(50000),

    limit: z.coerce
      .number()
      .int()
      .min(1)
      .max(100)
      .default(20),

    offset: z.coerce
      .number()
      .int()
      .min(0)
      .default(0),
  });

export type NearbySearchInput =
  z.infer<
    typeof NearbySearchSchema
  >;



// ========================================================
// EXPLORE MAP QUERY
// ========================================================

export const ExploreMapQuerySchema =
  z.object({
    bounds:
      MapBoundsSchema,

    propertyType: z
      .enum([
        'HOUSE',
        'APARTMENT',
        'LAND',
        'ROOM',
      ])
      .optional(),

    operationType: z
      .enum([
        'SALE',
        'RENT',
        'TEMPORARY',
      ])
      .optional(),

    minPrice: z
      .coerce
      .number()
      .positive()
      .optional(),

    maxPrice: z
      .coerce
      .number()
      .positive()
      .optional(),

    limit: z.coerce
      .number()
      .int()
      .min(1)
      .max(100)
      .default(50),
  });

export type ExploreMapQuery =
  z.infer<
    typeof ExploreMapQuerySchema
  >;



// ========================================================
// MAP MARKER
// ========================================================

export const MapMarkerSchema =
  z.object({
    propertyId: z
      .string()
      .uuid(),

    title: z.string(),

    price: z.number(),

    propertyType: z.enum([
      'HOUSE',
      'APARTMENT',
      'LAND',
      'ROOM',
    ]),

    operationType: z.enum([
      'SALE',
      'RENT',
      'TEMPORARY',
    ]),

    coverImage: z
      .string()
      .url()
      .nullable(),

    coordinates:
      CoordinatesSchema,
  });

export type MapMarker =
  z.infer<typeof MapMarkerSchema>;



// ========================================================
// REVERSE GEOCODE
// ========================================================

export const ReverseGeocodeSchema =
  CoordinatesSchema;

export type ReverseGeocodeInput =
  z.infer<
    typeof ReverseGeocodeSchema
  >;



// ========================================================
// GEOCODE ADDRESS
// ========================================================

export const GeocodeAddressSchema =
  z.object({
    country: z.string(),

    city: z.string(),

    address: z.string(),
  });

export type GeocodeAddressInput =
  z.infer<
    typeof GeocodeAddressSchema
  >;