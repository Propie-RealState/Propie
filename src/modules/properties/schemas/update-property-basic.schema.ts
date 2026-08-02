import { z } from "zod";

import { CreatePropertySchema } from "./create-property.schema";
import { PropertyCurrencySchema } from "./property-currency.schema";

export const updatePropertyBasicSchema = z.object({
  title: z.string().min(1).max(255),

  description: z.string().max(5000),

  price: z.number().finite().nonnegative(),

  currency: PropertyCurrencySchema,

  bedrooms: z.number().finite().nonnegative(),

  bathrooms: z.number().finite().nonnegative(),

  areaM2: z.number().finite().nonnegative(),

  propertyType: CreatePropertySchema.shape.propertyType,

  operationType: CreatePropertySchema.shape.listingType,
});

export type UpdatePropertyBasicInput = z.infer<
  typeof updatePropertyBasicSchema
>;
