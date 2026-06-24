/**
 * System roles persisted in `users.role`.
 * Guest is NOT a role — it is the absence of an authenticated session.
 */
export const USER_ROLES = {
  CLIENT: 'CLIENT',
  OWNER: 'OWNER',
  AGENT: 'AGENT',
  ADMIN: 'ADMIN',
} as const;

export type UserRoleCode =
  (typeof USER_ROLES)[keyof typeof USER_ROLES];

/** Roles selectable during public registration — ADMIN is excluded. */
export const REGISTERABLE_USER_ROLES: UserRoleCode[] = [
  USER_ROLES.CLIENT,
  USER_ROLES.OWNER,
  USER_ROLES.AGENT,
];

export type RegisterableUserRoleCode =
  (typeof REGISTERABLE_USER_ROLES)[number];

export const PUBLISHER_ROLES: UserRoleCode[] = [
  USER_ROLES.OWNER,
  USER_ROLES.AGENT,
];

export const PROPERTY_MANAGER_ROLES: UserRoleCode[] = [
  USER_ROLES.OWNER,
  USER_ROLES.AGENT,
];
