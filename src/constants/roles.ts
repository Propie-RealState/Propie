/**
 * System roles persisted in `users.role`.
 * Guest is NOT a role — it is the absence of an authenticated session.
 */
export const USER_ROLES = {
  CLIENT: 'CLIENT',
  OWNER: 'OWNER',
  AGENT: 'AGENT',
} as const;

export type UserRoleCode =
  (typeof USER_ROLES)[keyof typeof USER_ROLES];

export const PUBLISHER_ROLES: UserRoleCode[] = [
  USER_ROLES.OWNER,
  USER_ROLES.AGENT,
];

export const PROPERTY_MANAGER_ROLES: UserRoleCode[] = [
  USER_ROLES.OWNER,
  USER_ROLES.AGENT,
];
