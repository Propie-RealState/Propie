import { z } from "zod";

export const CreatePropertySchema = z.object({
  propertyType: z.enum([
    "HOUSE",
    "APARTMENT",
    "LAND",
    "COMMERCIAL",
    "OFFICE",
  ]),

  listingType: z.enum([
    "SALE",
    "RENT",
    "TEMPORARY",
  ]),
});

export type CreatePropertyInput =
  z.infer<typeof CreatePropertySchema>;

/** Datos del body + owner autenticado (no viene en el request body). */
export type CreatePropertyServiceInput =
  CreatePropertyInput & {
    ownerId: string;
  };