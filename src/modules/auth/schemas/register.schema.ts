import { z } from "zod";

import { registerApiLimits } from "@/shared/registration";

import { RegisterableUserRoleSchema } from "./roles.schema";

// ========================================================
// REGISTER
// ========================================================

const L = registerApiLimits;

export const RegisterRoleSchema = RegisterableUserRoleSchema;

export const RegisterSchema = z.object({
  role: RegisterRoleSchema,

  firstName: z.string().min(L.firstName.min).max(L.firstName.max),

  lastName: z.string().min(L.lastName.min).max(L.lastName.max),

  email: z.string().email().max(L.email.max),

  password: z.string().min(L.password.min).max(L.password.max),

  dni: z.string().min(L.dni.min).max(L.dni.max),

  birthDate: z.string(),

  nationality: z.string().min(L.nationality.min).max(L.nationality.max),

  cuitCuil: z.string().min(L.cuitCuil.min).max(L.cuitCuil.max),

  address: z.string().min(L.address.min).max(L.address.max),

  location: z.string().min(L.location.min).max(L.location.max).optional(),

  phone: z.string().min(L.phone.min).max(L.phone.max).optional(),

  bio: z.string().max(L.bio.max).optional(),

  mainGoal: z.enum(registerApiLimits.mainGoals),

  profilePhoto: z.string().nullable().optional(),
});

// ========================================================
// TYPES
// ========================================================

export type RegisterInput = z.infer<typeof RegisterSchema>;
