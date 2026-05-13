import { z } from 'zod';

export const UserRoleSchema =
  z.enum([
    'OWNER',
    'AGENT',
    'CLIENT',
  ]);

export type UserRole =
  z.infer<
    typeof UserRoleSchema
  >;