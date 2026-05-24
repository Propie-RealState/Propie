export type AppUserRole = 'CLIENT' | 'OWNER' | 'AGENT';

export function isGuest(user: { role: string } | null | undefined): boolean {
  return !user;
}

export function isClientRole(
  role: string | null | undefined,
): boolean {
  return role === 'CLIENT';
}

export function isOwnerRole(
  role: string | null | undefined,
): boolean {
  return role === 'OWNER';
}

export function isAgentRole(
  role: string | null | undefined,
): boolean {
  return role === 'AGENT';
}

/** Can create or manage property listings (owner/agent flows). */
export function canPublishProperties(
  role: string | null | undefined,
): boolean {
  return role === 'OWNER' || role === 'AGENT';
}

/** Registered user capabilities (not guest). */
export function isAuthenticatedRole(
  role: string | null | undefined,
): boolean {
  return (
    role === 'CLIENT' ||
    role === 'OWNER' ||
    role === 'AGENT'
  );
}

/** Footer / shell navigation audience (guest is not a DB role). */
export type NavAudience = 'guest' | 'client' | 'publisher';

export function getNavAudience(
  user: { role: string } | null | undefined,
): NavAudience {
  if (!user) {
    return 'guest';
  }

  if (isClientRole(user.role)) {
    return 'client';
  }

  return 'publisher';
}
