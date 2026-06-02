export type AgentStats = {
  average_rating: number;
  total_reviews: number;
  total_worked_properties: number;
  active_properties: number;
  completed_properties: number;
};

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
  // Agent reputation stats (only present for AGENT role)
  average_rating?: number;
  total_reviews?: number;
  total_worked_properties?: number;
  active_properties?: number;
  completed_properties?: number;
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
  statsRow?: Record<string, unknown> | null,
) {
  const profile = mapProfileRow(profileRow);

  if (profile && statsRow) {
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      profile: {
        ...profile,
        average_rating: (statsRow.average_rating as number) ?? 0,
        total_reviews: (statsRow.total_reviews as number) ?? 0,
        total_worked_properties: (statsRow.total_worked_properties as number) ?? 0,
        active_properties: (statsRow.active_properties as number) ?? 0,
        completed_properties: (statsRow.completed_properties as number) ?? 0,
      },
    };
  }

  return {
    id: user.id,
    email: user.email,
    role: user.role,
    profile,
  };
}
