import { z } from "zod";

import { RegisterableUserRoleSchema } from "@/database/types/roles";

// ========================================================
// ENUMS
// ========================================================

export const RegisterRoleSchema = RegisterableUserRoleSchema;

export const MainGoalSchema = z.enum(["PUBLISH", "EXPLORE"]);

// ========================================================
// REGISTER
// ========================================================

export const RegisterSchema = z.object({
  role: RegisterRoleSchema,

  firstName: z.string().min(2).max(100),

  lastName: z.string().min(2).max(100),

  email: z.string().email(),

  password: z.string().min(8).max(100),

  dni: z.string().min(7).max(12),

  birthDate: z.string(),

  nationality: z.string().min(2).max(100),

  cuitCuil: z.string().min(10).max(15),

  address: z.string().min(5).max(255),

  location: z.string().min(2).max(255).optional(),

  phone: z.string().min(8).max(20).optional(),

  bio: z.string().max(300).optional(),

  mainGoal: z.enum(["PUBLISH", "EXPLORE"]),

  profilePhoto: z.string().nullable().optional(),
});

// ========================================================
// TYPES
// ========================================================

export type RegisterInput = z.infer<typeof RegisterSchema>;
