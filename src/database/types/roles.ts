import type {
  RegisterableUserRoleCode,
  UserRoleCode,
} from "@/constants/roles";

/** Persisted `users.role` value. */
export type UserRole = UserRoleCode;

/** Roles accepted by public registration (excludes ADMIN). */
export type RegisterableUserRole = RegisterableUserRoleCode;
