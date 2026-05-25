import { z } from "zod";

export const updatePropertyBasicSchema = z.object({
  title: z.string(),

  description: z.string(),

  price: z.number(),

  bedrooms: z.number(),

  bathrooms: z.number(),

  areaM2: z.number(),
  
  propertyType: z.string(),

  operationType: z.string(),
});

export type UpdatePropertyBasicInput = z.infer<
  typeof updatePropertyBasicSchema
>;
