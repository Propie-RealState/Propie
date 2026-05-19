import { z } from "zod";

export const updatePropertyAmenitiesSchema =
  z.object({

    amenities:
      z.array(
        z.string()
      ),
  });

export type UpdatePropertyAmenitiesInput =
  z.infer<
    typeof updatePropertyAmenitiesSchema
  >;