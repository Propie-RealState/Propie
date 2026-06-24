import { db } from "@/database/client";

import { resolveScopedOperationalRole } from "@/utils/authorization";

import { listVisitsRepository } from "../repositories/visits.repository";
import type { VisitListSegment } from "../types/visit.types";
import { mapVisitRow } from "../utils/map-visit";

async function getUserRole(userId: string) {
  const result = await db.query<{ role: string }>(
    `
      SELECT role
      FROM users
      WHERE id = $1
      LIMIT 1
    `,
    [userId],
  );

  return resolveScopedOperationalRole(result.rows[0]?.role);
}

export async function listVisitsService(input: {
  userId: string;
  segment: VisitListSegment;
  from?: string;
  to?: string;
}) {
  const role = await getUserRole(input.userId);

  if (!role) {
    throw new Error("FORBIDDEN");
  }

  const rows = await listVisitsRepository({
    userId: input.userId,
    role,
    segment: input.segment,
    from: input.from,
    to: input.to,
  });

  return rows.map(mapVisitRow);
}
