import { z } from "zod";

export const UpdatePropertyBasicSchema =
  z.object({
    title:
      z.string().min(5),

    description:
      z.string().min(20),

    price:
      z.number().positive(),
  });

export type UpdatePropertyBasicInput =
  z.infer<
    typeof UpdatePropertyBasicSchema
  >;