export type AppUserRole = 'CLIENT' | 'OWNER' | 'AGENT' | 'ADMIN';

const OPERATIONAL_ROLES = ['CLIENT', 'OWNER', 'AGENT'] as const;

export type OperationalRole = (typeof OPERATIONAL_ROLES)[number];

export function isGuest(user: { role: string } | null | undefined): boolean {
  return !user;
}

export function isAdminRole(
  role: string | null | undefined,
): role is 'ADMIN' {
  return role === 'ADMIN';
}

function isOperationalRole(
  role: string,
): role is OperationalRole {
  return (OPERATIONAL_ROLES as readonly string[]).includes(role);
}

/** ADMIN inherits every operational role; admin-only checks stay exclusive. */
export function hasRole(
  userRole: string,
  requiredRole: string,
): boolean {
  if (userRole === requiredRole) {
    return true;
  }

  if (isAdminRole(userRole) && isOperationalRole(requiredRole)) {
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
    isAdminRole(userRole)
    && allowedRoles.some((role) => isOperationalRole(role))
  ) {
    return true;
  }

  return false;
}

/** Exact DB role (no hierarchy) — use for UI persona when roles are mutually exclusive. */
export function isExactRole(
  role: string | null | undefined,
  expected: OperationalRole | 'ADMIN',
): boolean {
  return role === expected;
}

/** ADMIN may use owner-facing surfaces. */
export function actsAsOwner(
  role: string | null | undefined,
): boolean {
  return isExactRole(role, 'OWNER') || isAdminRole(role);
}

/** ADMIN may use agent-facing surfaces. */
export function actsAsAgent(
  role: string | null | undefined,
): boolean {
  return isExactRole(role, 'AGENT') || isAdminRole(role);
}

/** ADMIN may use client-facing surfaces. */
export function actsAsClient(
  role: string | null | undefined,
): boolean {
  return isExactRole(role, 'CLIENT') || isAdminRole(role);
}

export function isClientRole(
  role: string | null | undefined,
): boolean {
  return hasRole(role ?? '', 'CLIENT');
}

export function isOwnerRole(
  role: string | null | undefined,
): boolean {
  return hasRole(role ?? '', 'OWNER');
}

export function isAgentRole(
  role: string | null | undefined,
): boolean {
  return hasRole(role ?? '', 'AGENT');
}

/** Can create or manage property listings (owner/agent flows). */
export function canPublishProperties(
  role: string | null | undefined,
): boolean {
  return hasAnyRole(role ?? '', ['OWNER', 'AGENT']);
}

/** Registered user capabilities (not guest). */
export function isAuthenticatedRole(
  role: string | null | undefined,
): boolean {
  return hasAnyRole(role ?? '', [...OPERATIONAL_ROLES, 'ADMIN']);
}

/** Footer / shell navigation audience (guest is not a DB role). */
export type NavAudience = 'guest' | 'client' | 'publisher';

export function getNavAudience(
  user: { role: string } | null | undefined,
): NavAudience {
  if (!user) {
    return 'guest';
  }

  if (canPublishProperties(user.role)) {
    return 'publisher';
  }

  return 'client';
}
