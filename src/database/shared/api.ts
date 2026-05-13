import { z } from 'zod';



// ========================================================
// API ERROR CODE
// ========================================================

export const ApiErrorCodeSchema =
  z.enum([
    'VALIDATION_ERROR',

    'UNAUTHORIZED',

    'FORBIDDEN',

    'NOT_FOUND',

    'CONFLICT',

    'RATE_LIMITED',

    'INTERNAL_SERVER_ERROR',

    'PROPERTY_NOT_FOUND',

    'APPLICATION_NOT_FOUND',

    'USER_NOT_FOUND',

    'EMAIL_ALREADY_EXISTS',

    'INVALID_CREDENTIALS',

    'PROPERTY_ALREADY_ASSIGNED',
  ]);

export type ApiErrorCode =
  z.infer<
    typeof ApiErrorCodeSchema
  >;



// ========================================================
// API ERROR
// ========================================================

export const ApiErrorSchema =
  z.object({
    code:
      ApiErrorCodeSchema,

    message: z.string(),

    statusCode: z.number(),

    details: z
      .unknown()
      .optional(),
  });

export type ApiError =
  z.infer<typeof ApiErrorSchema>;



// ========================================================
// API SUCCESS RESPONSE
// ========================================================

export const createApiSuccessResponseSchema =
  <T extends z.ZodTypeAny>(
    dataSchema: T
  ) =>
    z.object({
      success: z.literal(true),

      data: dataSchema,
    });



// ========================================================
// API ERROR RESPONSE
// ========================================================

export const ApiErrorResponseSchema =
  z.object({
    success: z.literal(false),

    error: ApiErrorSchema,
  });

export type ApiErrorResponse =
  z.infer<
    typeof ApiErrorResponseSchema
  >;



// ========================================================
// API MESSAGE RESPONSE
// ========================================================

export const ApiMessageResponseSchema =
  z.object({
    success: z.literal(true),

    message: z.string(),
  });

export type ApiMessageResponse =
  z.infer<
    typeof ApiMessageResponseSchema
  >;



// ========================================================
// API ID RESPONSE
// ========================================================

export const ApiIdResponseSchema =
  z.object({
    success: z.literal(true),

    data: z.object({
      id: z.string().uuid(),
    }),
  });

export type ApiIdResponse =
  z.infer<
    typeof ApiIdResponseSchema
  >;



// ========================================================
// API HEALTH RESPONSE
// ========================================================

export const ApiHealthResponseSchema =
  z.object({
    success: z.literal(true),

    data: z.object({
      status: z.literal('ok'),

      timestamp:
        z.string().datetime(),
    }),
  });

export type ApiHealthResponse =
  z.infer<
    typeof ApiHealthResponseSchema
  >;