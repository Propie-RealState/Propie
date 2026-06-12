import { z } from "zod";

export const updatePropertyCommercializationSchema = z.object({
  commercializationType: z.enum(["AGENTS", "DIRECT"]),
  manualApproval: z.boolean(),
});

export type UpdatePropertyCommercializationInput = z.infer<
  typeof updatePropertyCommercializationSchema
>;
