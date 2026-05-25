import { z } from "zod";

export const createAgentApplicationSchema = z.object({
  propertyId: z.string().uuid(),
  message: z.string().max(2000).optional().nullable(),
});

export const updateAgentApplicationStatusSchema = z.object({
  status: z.enum(["ACCEPTED", "REJECTED"]),
});

export type CreateAgentApplicationInput = z.infer<
  typeof createAgentApplicationSchema
>;

export type UpdateAgentApplicationStatusInput = z.infer<
  typeof updateAgentApplicationStatusSchema
>;
