export type ClientProfile = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  location: string | null;
  address: string | null;
  dni: string | null;
  birth_date: string | null;
  nationality: string | null;
  cuit_cuil: string | null;
  bio: string | null;
  avatar_url: string | null;
  created_at: string | null;
};

export function mapProfileRow(
  row: Record<string, unknown> | null | undefined,
): ClientProfile | undefined {
  if (!row) {
    return undefined;
  }

  return {
    id: String(row.id),
    first_name: (row.first_name as string) ?? null,
    last_name: (row.last_name as string) ?? null,
    phone: (row.phone as string) ?? null,
    location: (row.location as string) ?? null,
    address: (row.address as string) ?? null,
    dni: (row.dni as string) ?? null,
    birth_date: row.birth_date
      ? String(row.birth_date).slice(0, 10)
      : null,
    nationality: (row.nationality as string) ?? null,
    cuit_cuil: (row.cuit_cuil as string) ?? null,
    bio: (row.bio as string) ?? null,
    avatar_url: (row.avatar_url as string) ?? null,
    created_at: row.created_at ? String(row.created_at) : null,
  };
}

export function buildAuthUserPayload(
  user: { id: string; email: string; role: string },
  profileRow: Record<string, unknown> | null | undefined,
) {
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    profile: mapProfileRow(profileRow),
  };
}
