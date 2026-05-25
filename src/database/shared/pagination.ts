import { z } from 'zod';



// ========================================================
// PAGINATION INPUT
// ========================================================

export const PaginationSchema =
  z.object({
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

export type PaginationInput =
  z.infer<typeof PaginationSchema>;



// ========================================================
// PAGINATION META
// ========================================================

export const PaginationMetaSchema =
  z.object({
    total: z.number(),

    limit: z.number(),

    offset: z.number(),

    hasMore: z.boolean(),
  });

export type PaginationMeta =
  z.infer<
    typeof PaginationMetaSchema
  >;



// ========================================================
// PAGINATED RESPONSE
// ========================================================

export const createPaginatedResponseSchema =
  <T extends z.ZodTypeAny>(
    itemSchema: T
  ) =>
    z.object({
      items: z.array(itemSchema),

      meta:
        PaginationMetaSchema,
    });



// ========================================================
// PAGINATION QUERY
// ========================================================

export const PaginationQuerySchema =
  PaginationSchema.extend({
    sortBy: z
      .string()
      .optional(),

    sortOrder: z
      .enum([
        'asc',
        'desc',
      ])
      .default('desc'),
  });

export type PaginationQuery =
  z.infer<
    typeof PaginationQuerySchema
  >;