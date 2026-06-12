import { z } from "zod";

import { PropertyStatusSchema } from "@/database/types/properties";

export const UpdatePropertyStatusSchema = z.object({
  status: PropertyStatusSchema,
});

export type UpdatePropertyStatusInput = z.infer<
  typeof UpdatePropertyStatusSchema
>;
