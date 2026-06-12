import type { PoolClient } from "pg";

import { db } from "@/database/client";

import type { PropertyVisitEventRow } from "@/database/types/property-visits";

import type { VisitActorRole, VisitEventType } from "../types/visit.types";

export async function insertVisitEventRepository(
  input: {
    visitId: string;
    actorId: string | null;
    actorRole: VisitActorRole | null;
    eventType: VisitEventType;
    payload?: Record<string, unknown>;
  },
  client?: PoolClient,
) {
  const executor = client ?? db;

  const result = await executor.query<PropertyVisitEventRow>(
    `
      INSERT INTO property_visit_events (
        visit_id,
        actor_id,
        actor_role,
        event_type,
        payload
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING
        id,
        visit_id,
        actor_id,
        actor_role,
        event_type,
        payload,
        created_at
    `,
    [
      input.visitId,
      input.actorId,
      input.actorRole,
      input.eventType,
      JSON.stringify(input.payload ?? {}),
    ],
  );

  return result.rows[0];
}

export async function listVisitEventsRepository(visitId: string) {
  const result = await db.query<PropertyVisitEventRow>(
    `
      SELECT
        id,
        visit_id,
        actor_id,
        actor_role,
        event_type,
        payload,
        created_at
      FROM property_visit_events
      WHERE visit_id = $1
      ORDER BY created_at ASC
    `,
    [visitId],
  );

  return result.rows;
}
