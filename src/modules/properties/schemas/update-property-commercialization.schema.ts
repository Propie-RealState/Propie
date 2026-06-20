import { z } from "zod";

export const updatePropertyCommercializationSchema = z.object({
  commercializationType: z.enum(["AGENTS", "DIRECT"]),
});

export type UpdatePropertyCommercializationInput = z.infer<
  typeof updatePropertyCommercializationSchema
>;
