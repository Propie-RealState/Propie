import { z } from 'zod';

export const UserRoleSchema =
  z.enum([
    'OWNER',
    'AGENT',
    'CLIENT',
    'ADMIN',
  ]);

export type UserRole =
  z.infer<
    typeof UserRoleSchema
  >;

/** Public registration — ADMIN must never be accepted via API. */
export const RegisterableUserRoleSchema =
  z.enum([
    'OWNER',
    'AGENT',
    'CLIENT',
  ]);

export type RegisterableUserRole =
  z.infer<
    typeof RegisterableUserRoleSchema
  >;