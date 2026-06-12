import { db } from "@/database/client";

import {
  countVisitsByAgentRepository,
  countVisitsByPropertyRepository,
  countVisitsByStatusRepository,
} from "../repositories/visits.repository";
import type { VisitAnalytics } from "../types/visit.types";

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

  const role = result.rows[0]?.role;

  if (role !== "OWNER" && role !== "AGENT") {
    return null;
  }

  return role;
}

export async function visitAnalyticsService(input: {
  userId: string;
  from?: string;
  to?: string;
}): Promise<VisitAnalytics> {
  const role = await getUserRole(input.userId);

  if (!role) {
    throw new Error("FORBIDDEN");
  }

  const scopeRole = role as "OWNER" | "AGENT";

  const [created, completed, cancelled] = await Promise.all([
    countVisitsByStatusRepository({
      userId: input.userId,
      role: scopeRole,
      from: input.from,
      to: input.to,
    }),
    countVisitsByStatusRepository({
      userId: input.userId,
      role: scopeRole,
      status: "COMPLETED",
      from: input.from,
      to: input.to,
    }),
    countVisitsByStatusRepository({
      userId: input.userId,
      role: scopeRole,
      status: "CANCELLED",
      from: input.from,
      to: input.to,
    }),
  ]);

  const byProperty = await countVisitsByPropertyRepository({
    userId: input.userId,
    role: scopeRole,
    from: input.from,
    to: input.to,
  });

  const byAgent = role === "OWNER"
    ? await countVisitsByAgentRepository({
        ownerId: input.userId,
        from: input.from,
        to: input.to,
      })
    : [];

  const conversionRate = created > 0
    ? Number((completed / created).toFixed(4))
    : null;

  return {
    created,
    completed,
    cancelled,
    byProperty,
    byAgent,
    conversionRate,
  };
}
