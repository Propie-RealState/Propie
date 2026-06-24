import {
  USER_ROLES,
  type UserRoleCode,
} from '@/constants/roles';

/** Roles assignable to end users (ADMIN excluded). */
export const OPERATIONAL_ROLES = [
  USER_ROLES.CLIENT,
  USER_ROLES.OWNER,
  USER_ROLES.AGENT,
] as const;

export type OperationalRole =
  (typeof OPERATIONAL_ROLES)[number];

export function isAdmin(
  role: string | null | undefined,
): role is typeof USER_ROLES.ADMIN {
  return role === USER_ROLES.ADMIN;
}

export function isOperationalRole(
  role: string,
): role is OperationalRole {
  return (OPERATIONAL_ROLES as readonly string[]).includes(role);
}

/**
 * ADMIN hierarchically inherits every operational role.
 * Admin-only checks (allowedRoles = [ADMIN]) do not grant access to other roles.
 */
export function hasRole(
  userRole: string,
  requiredRole: string,
): boolean {
  if (userRole === requiredRole) {
    return true;
  }

  if (isAdmin(userRole) && isOperationalRole(requiredRole)) {
    return true;
  }

  return false;
}

export function hasAnyRole(
  userRole: string,
  allowedRoles: readonly string[],
): boolean {
  if (allowedRoles.includes(userRole)) {
    return true;
  }

  if (
    isAdmin(userRole)
    && allowedRoles.some((role) => isOperationalRole(role))
  ) {
    return true;
  }

  return false;
}

/** Default operational scope when ADMIN performs role-scoped queries. */
export function resolveScopedOperationalRole(
  role: string | null | undefined,
): OperationalRole | null {
  if (!role) {
    return null;
  }

  if (isOperationalRole(role)) {
    return role;
  }

  if (isAdmin(role)) {
    return USER_ROLES.OWNER;
  }

  return null;
}

/**
 * ADMIN has read-only access to any resource for moderation/support.
 * Does NOT grant write access (send, edit, delete, join as participant).
 */
export function canAdminRead(
  role: string | null | undefined,
): boolean {
  return isAdmin(role);
}

export function canPublish(userRole: string): boolean {
  return hasAnyRole(userRole, [
    USER_ROLES.OWNER,
    USER_ROLES.AGENT,
  ]);
}

export function isAuthenticatedUserRole(
  userRole: string,
): userRole is UserRoleCode {
  return hasAnyRole(userRole, [
    ...OPERATIONAL_ROLES,
    USER_ROLES.ADMIN,
  ]);
}
