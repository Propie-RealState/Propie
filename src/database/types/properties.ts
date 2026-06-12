import { z } from 'zod';



// ========================================================
// PROPERTY TYPE
// ========================================================

export const PropertyTypeSchema = z.enum([
  'HOUSE',
  'APARTMENT',
  'LAND',
  'ROOM',
]);

export type PropertyType =
  z.infer<typeof PropertyTypeSchema>;



// ========================================================
// OPERATION TYPE
// ========================================================

export const OperationTypeSchema = z.enum([
  'SALE',
  'RENT',
  'TEMPORARY',
]);

export type OperationType =
  z.infer<typeof OperationTypeSchema>;



// ========================================================
// PROPERTY STATUS
// ========================================================

export const PropertyStatusSchema = z.enum([
  'ACTIVE',
  'PAUSED',
  'RESERVED',
  'FINALIZED',
]);

export type PropertyStatus =
  z.infer<typeof PropertyStatusSchema>;



// ========================================================
// PROPERTY CURRENCY
// ========================================================

export const PropertyCurrencySchema = z.enum([
  'USD',
  'ARS',
]);

export type PropertyCurrency =
  z.infer<typeof PropertyCurrencySchema>;



// ========================================================
// PROPERTY IMAGE
// ========================================================

export const PropertyImageSchema = z.object({
  id: z.string().uuid(),

  propertyId: z.string().uuid(),

  imageUrl: z.string().url(),

  isCover: z.boolean(),

  createdAt: z.string().datetime(),
});

export type PropertyImage =
  z.infer<typeof PropertyImageSchema>;



// ========================================================
// PROPERTY LOCATION
// ========================================================

export const PropertyLocationSchema = z.object({
  propertyId: z.string().uuid(),

  country: z.string(),

  city: z.string(),

  address: z.string().nullable(),

  latitude: z.number(),

  longitude: z.number(),

  createdAt: z.string().datetime(),
});

export type PropertyLocation =
  z.infer<typeof PropertyLocationSchema>;



// ========================================================
// CORE PROPERTY
// ========================================================

export const PropertySchema = z.object({
  id: z.string().uuid(),

  ownerId: z.string().uuid(),

  publisherId: z.string().uuid().nullable(),

  publisherType: z.enum(['OWNER', 'AGENT']).nullable(),

  publishedAt: z.string().datetime().nullable(),

  title: z
    .string()
    .min(5)
    .max(255),

  description: z
    .string()
    .max(5000)
    .nullable(),

  propertyType: PropertyTypeSchema,

  operationType: OperationTypeSchema,

  status: PropertyStatusSchema,

  price: z.number().positive(),

  currency: PropertyCurrencySchema.default('USD'),

  bedrooms: z
    .number()
    .int()
    .nullable(),

  bathrooms: z
    .number()
    .int()
    .nullable(),

  areaM2: z
    .number()
    .positive()
    .nullable(),

  isPublished: z.boolean(),

  createdAt: z.string().datetime(),

  updatedAt: z.string().datetime(),
});

export type Property =
  z.infer<typeof PropertySchema>;



// ========================================================
// PUBLIC PROPERTY
// ========================================================

export const PublicPropertySchema =
  PropertySchema.pick({
    id: true,

    title: true,

    propertyType: true,

    operationType: true,

    price: true,

    currency: true,

    bedrooms: true,

    bathrooms: true,

    areaM2: true,

    createdAt: true,
  });

export type PublicProperty =
  z.infer<typeof PublicPropertySchema>;



// ========================================================
// PROPERTY CARD
// ========================================================

export const PropertyCardSchema =
  PublicPropertySchema.extend({
    coverImage: z
      .string()
      .url()
      .nullable(),

    city: z.string(),

    latitude: z.number(),

    longitude: z.number(),
  });

export type PropertyCard =
  z.infer<typeof PropertyCardSchema>;



// ========================================================
// PROPERTY DETAILS
// ========================================================

export const PropertyDetailsSchema =
  PropertySchema.extend({
    location: PropertyLocationSchema,

    images: z.array(
      PropertyImageSchema
    ),
  });

export type PropertyDetails =
  z.infer<typeof PropertyDetailsSchema>;



// ========================================================
// CREATE PROPERTY
// ========================================================

export const CreatePropertySchema =
  z.object({
    title: z
      .string()
      .min(5)
      .max(255),

    description: z
      .string()
      .max(5000)
      .nullable()
      .optional(),

    propertyType:
      PropertyTypeSchema,

    operationType:
      OperationTypeSchema,

    price: z.number().positive(),

    bedrooms: z
      .number()
      .int()
      .nullable()
      .optional(),

    bathrooms: z
      .number()
      .int()
      .nullable()
      .optional(),

    areaM2: z
      .number()
      .positive()
      .nullable()
      .optional(),

    location: z.object({
      country: z.string(),

      city: z.string(),

      address: z
        .string()
        .nullable()
        .optional(),

      latitude: z.number(),

      longitude: z.number(),
    }),

    images: z.array(
      z.string().url()
    ),
  });

export type CreatePropertyInput =
  z.infer<typeof CreatePropertySchema>;



// ========================================================
// UPDATE PROPERTY
// ========================================================

export const UpdatePropertySchema =
  z.object({
    title: z
      .string()
      .min(5)
      .max(255)
      .optional(),

    description: z
      .string()
      .max(5000)
      .nullable()
      .optional(),

    propertyType:
      PropertyTypeSchema.optional(),

    operationType:
      OperationTypeSchema.optional(),

    status:
      PropertyStatusSchema.optional(),

    price: z
      .number()
      .positive()
      .optional(),

    bedrooms: z
      .number()
      .int()
      .nullable()
      .optional(),

    bathrooms: z
      .number()
      .int()
      .nullable()
      .optional(),

    areaM2: z
      .number()
      .positive()
      .nullable()
      .optional(),

    isPublished:
      z.boolean().optional(),
  });

export type UpdatePropertyInput =
  z.infer<typeof UpdatePropertySchema>;



// ========================================================
// PROPERTY SEARCH
// ========================================================

export const PropertySearchSchema =
  z.object({
    query: z
      .string()
      .optional(),

    propertyType:
      PropertyTypeSchema.optional(),

    operationType:
      OperationTypeSchema.optional(),

    city: z
      .string()
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

    bedrooms: z
      .coerce
      .number()
      .int()
      .optional(),

    bathrooms: z
      .coerce
      .number()
      .int()
      .optional(),

    limit: z
      .coerce
      .number()
      .int()
      .min(1)
      .max(100)
      .default(20),

    offset: z
      .coerce
      .number()
      .int()
      .min(0)
      .default(0),
  });

export type PropertySearchInput =
  z.infer<typeof PropertySearchSchema>;



// ========================================================
// PROPERTY EXPLORE RESPONSE
// ========================================================

export const PropertyExploreResponseSchema =
  z.object({
    items: z.array(
      PropertyCardSchema
    ),

    total: z.number(),

    limit: z.number(),

    offset: z.number(),
  });

export type PropertyExploreResponse =
  z.infer<
    typeof PropertyExploreResponseSchema
  >;