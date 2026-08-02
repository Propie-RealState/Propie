import { z } from "zod";

import { registerApiLimits } from "@/shared/registration";

const L = registerApiLimits;

/** Digits-only phone — matches register FE product policy; limits from shared API constants. */
const phoneSchema = z
  .string()
  .regex(/^\d+$/)
  .min(L.phone.min)
  .max(L.phone.max);

export const UpdateProfileSchema = z.object({
  phone: z.union([z.literal(""), phoneSchema]).optional(),

  location: z
    .union([
      z.literal(""),
      z.string().min(L.location.min).max(L.location.max),
    ])
    .optional(),

  bio: z.string().max(L.bio.max).optional(),
});

export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>;
