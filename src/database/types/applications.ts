import { z } from 'zod';



// ========================================================
// APPLICATION STATUS
// ========================================================

export const ApplicationStatusSchema =
  z.enum([
    'PENDING',
    'ACCEPTED',
    'REJECTED',
    'CANCELLED',
  ]);

export type ApplicationStatus =
  z.infer<
    typeof ApplicationStatusSchema
  >;



// ========================================================
// AGENT APPLICATION
// ========================================================

export const AgentApplicationSchema =
  z.object({
    id: z.string().uuid(),

    propertyId: z.string().uuid(),

    agentId: z.string().uuid(),

    message: z
      .string()
      .max(2000)
      .nullable(),

    status:
      ApplicationStatusSchema,

    createdAt: z
      .string()
      .datetime(),

    updatedAt: z
      .string()
      .datetime(),
  });

export type AgentApplication =
  z.infer<
    typeof AgentApplicationSchema
  >;



// ========================================================
// CREATE APPLICATION
// ========================================================

export const CreateApplicationSchema =
  z.object({
    propertyId: z
      .string()
      .uuid(),

    message: z
      .string()
      .max(2000)
      .nullable()
      .optional(),
  });

export type CreateApplicationInput =
  z.infer<
    typeof CreateApplicationSchema
  >;



// ========================================================
// UPDATE APPLICATION STATUS
// ========================================================

export const UpdateApplicationStatusSchema =
  z.object({
    status:
      ApplicationStatusSchema,
  });

export type UpdateApplicationStatusInput =
  z.infer<
    typeof UpdateApplicationStatusSchema
  >;



// ========================================================
// ACCEPT APPLICATION
// ========================================================

export const AcceptApplicationSchema =
  z.object({
    applicationId: z
      .string()
      .uuid(),
  });

export type AcceptApplicationInput =
  z.infer<
    typeof AcceptApplicationSchema
  >;



// ========================================================
// REJECT APPLICATION
// ========================================================

export const RejectApplicationSchema =
  z.object({
    applicationId: z
      .string()
      .uuid(),

    reason: z
      .string()
      .max(1000)
      .nullable()
      .optional(),
  });

export type RejectApplicationInput =
  z.infer<
    typeof RejectApplicationSchema
  >;



// ========================================================
// CANCEL APPLICATION
// ========================================================

export const CancelApplicationSchema =
  z.object({
    applicationId: z
      .string()
      .uuid(),
  });

export type CancelApplicationInput =
  z.infer<
    typeof CancelApplicationSchema
  >;



// ========================================================
// PROPERTY ASSIGNMENT
// ========================================================

export const PropertyAssignmentSchema =
  z.object({
    id: z.string().uuid(),

    propertyId: z.string().uuid(),

    agentId: z.string().uuid(),

    assignedBy: z.string().uuid(),

    isActive: z.boolean(),

    assignedAt: z
      .string()
      .datetime(),

    endedAt: z
      .string()
      .datetime()
      .nullable(),

    createdAt: z
      .string()
      .datetime(),
  });

export type PropertyAssignment =
  z.infer<
    typeof PropertyAssignmentSchema
  >;



// ========================================================
// CREATE PROPERTY ASSIGNMENT
// ========================================================

export const CreatePropertyAssignmentSchema =
  z.object({
    propertyId: z
      .string()
      .uuid(),

    agentId: z
      .string()
      .uuid(),
  });

export type CreatePropertyAssignmentInput =
  z.infer<
    typeof CreatePropertyAssignmentSchema
  >;



// ========================================================
// END PROPERTY ASSIGNMENT
// ========================================================

export const EndPropertyAssignmentSchema =
  z.object({
    assignmentId: z
      .string()
      .uuid(),
  });

export type EndPropertyAssignmentInput =
  z.infer<
    typeof EndPropertyAssignmentSchema
  >;



// ========================================================
// APPLICATION SEARCH
// ========================================================

export const ApplicationSearchSchema =
  z.object({
    propertyId: z
      .string()
      .uuid()
      .optional(),

    agentId: z
      .string()
      .uuid()
      .optional(),

    status:
      ApplicationStatusSchema.optional(),

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

export type ApplicationSearchInput =
  z.infer<
    typeof ApplicationSearchSchema
  >;



// ========================================================
// PROPERTY ASSIGNMENT SEARCH
// ========================================================

export const PropertyAssignmentSearchSchema =
  z.object({
    propertyId: z
      .string()
      .uuid()
      .optional(),

    agentId: z
      .string()
      .uuid()
      .optional(),

    isActive: z
      .boolean()
      .optional(),

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

export type PropertyAssignmentSearchInput =
  z.infer<
    typeof PropertyAssignmentSearchSchema
  >;