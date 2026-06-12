import { db } from "@/database/client";

import type { PropertyEventType } from "../types/property-event.types";

export async function insertPropertyEventRepository(input: {
  propertyId: string;
  actorId: string | null;
  eventType: PropertyEventType;
  payload?: Record<string, unknown>;
}) {
  const result = await db.query(
    `
      INSERT INTO property_events (
        property_id,
        actor_id,
        event_type,
        payload
      )
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `,
    [
      input.propertyId,
      input.actorId,
      input.eventType,
      JSON.stringify(input.payload ?? {}),
    ],
  );

  return result.rows[0];
}

export async function listPropertyEventsRepository(propertyId: string) {
  const result = await db.query(
    `
      SELECT
        id,
        property_id,
        actor_id,
        event_type,
        payload,
        created_at
      FROM property_events
      WHERE property_id = $1
      ORDER BY created_at ASC
    `,
    [propertyId],
  );

  return result.rows;
}
