import { z } from 'zod';

import {
  UserRoleSchema,
} from './roles';



// ========================================================
// SHARED
// ========================================================

const normalizeEmail = () =>
  z
    .string()
    .email()
    .max(255)
    .transform((value) =>
      value.toLowerCase().trim()
    );



// ========================================================
// USER STATUS
// ========================================================

export const UserStatusSchema = z.enum([
  'ACTIVE',
  'INACTIVE',
  'SUSPENDED',
]);

export type UserStatus =
  z.infer<typeof UserStatusSchema>;



// ========================================================
// CORE USER
// ========================================================

export const UserSchema = z.object({
  id: z.string().uuid(),

  firstName: z
    .string()
    .min(2)
    .max(100),

  lastName: z
    .string()
    .min(2)
    .max(100),

  email: normalizeEmail(),

  phone: z
    .string()
    .max(30)
    .nullable(),

  avatarUrl: z
    .string()
    .url()
    .nullable(),

  bio: z
    .string()
    .max(1000)
    .nullable(),

  role: UserRoleSchema,

  status: UserStatusSchema,

  isVerified: z.boolean(),

  createdAt: z.string().datetime(),

  updatedAt: z.string().datetime(),
});

export type User =
  z.infer<typeof UserSchema>;



// ========================================================
// PUBLIC USER
// ========================================================

export const PublicUserSchema =
  UserSchema.pick({
    id: true,

    firstName: true,

    lastName: true,

    avatarUrl: true,

    role: true,
  });

export type PublicUser =
  z.infer<typeof PublicUserSchema>;



// ========================================================
// USER PROFILE
// ========================================================

export const UserProfileSchema =
  UserSchema.pick({
    id: true,

    firstName: true,

    lastName: true,

    avatarUrl: true,

    bio: true,

    role: true,

    createdAt: true,
  });

export type UserProfile =
  z.infer<typeof UserProfileSchema>;



// ========================================================
// UPDATE USER
// ========================================================

export const UpdateUserSchema =
  z.object({
    firstName: z
      .string()
      .min(2)
      .max(100)
      .optional(),

    lastName: z
      .string()
      .min(2)
      .max(100)
      .optional(),

    phone: z
      .string()
      .max(30)
      .nullable()
      .optional(),

    avatarUrl: z
      .string()
      .url()
      .nullable()
      .optional(),

    bio: z
      .string()
      .max(1000)
      .nullable()
      .optional(),
  });

export type UpdateUserInput =
  z.infer<typeof UpdateUserSchema>;



// ========================================================
// AGENT PROFILE
// ========================================================

export const AgentProfileSchema =
  PublicUserSchema.extend({
    rating: z
      .number()
      .min(0)
      .max(5)
      .default(0),

    completedDeals: z
      .number()
      .int()
      .default(0),

    activeProperties: z
      .number()
      .int()
      .default(0),

    about: z
      .string()
      .max(2000)
      .nullable(),
  });

export type AgentProfile =
  z.infer<typeof AgentProfileSchema>;



// ========================================================
// OWNER PROFILE
// ========================================================

export const OwnerProfileSchema =
  PublicUserSchema.extend({
    publishedProperties: z
      .number()
      .int()
      .default(0),
  });

export type OwnerProfile =
  z.infer<typeof OwnerProfileSchema>;



// ========================================================
// USER SEARCH
// ========================================================

export const UserSearchSchema =
  z.object({
    query: z.string().optional(),

    role: UserRoleSchema.optional(),

    city: z.string().optional(),

    limit: z.coerce
      .number()
      .int()
      .min(1)
      .max(100)
      .default(20),

    offset: z.coerce
      .number()
      .int()
      .min(0)
      .default(0),
  });

export type UserSearchInput =
  z.infer<typeof UserSearchSchema>;