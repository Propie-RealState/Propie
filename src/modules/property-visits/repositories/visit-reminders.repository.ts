import type { PoolClient } from "pg";

import { db } from "@/database/client";

import type { PropertyVisitReminderRow } from "@/database/types/property-visits";

export async function deleteVisitRemindersRepository(
  visitId: string,
  client?: PoolClient,
) {
  const executor = client ?? db;

  await executor.query(
    `
      DELETE FROM property_visit_reminders
      WHERE visit_id = $1
    `,
    [visitId],
  );
}

export async function insertVisitRemindersRepository(
  input: {
    visitId: string;
    scheduledAt: string;
    offsetsMinutes: readonly number[];
  },
  client?: PoolClient,
) {
  const executor = client ?? db;
  const scheduledAtMs = new Date(input.scheduledAt).getTime();
  const rows: PropertyVisitReminderRow[] = [];

  for (const offsetMinutes of input.offsetsMinutes) {
    const remindAt = new Date(
      scheduledAtMs - offsetMinutes * 60 * 1000,
    ).toISOString();

    const result = await executor.query<PropertyVisitReminderRow>(
      `
        INSERT INTO property_visit_reminders (
          visit_id,
          offset_minutes,
          remind_at
        )
        VALUES ($1, $2, $3)
        ON CONFLICT (visit_id, offset_minutes)
        DO UPDATE SET
          remind_at = EXCLUDED.remind_at,
          sent_at = NULL
        RETURNING
          id,
          visit_id,
          offset_minutes,
          remind_at,
          sent_at,
          created_at
      `,
      [input.visitId, offsetMinutes, remindAt],
    );

    if (result.rows[0]) {
      rows.push(result.rows[0]);
    }
  }

  return rows;
}

export async function findDueVisitRemindersRepository(limit = 100) {
  const result = await db.query<PropertyVisitReminderRow>(
    `
      SELECT
        id,
        visit_id,
        offset_minutes,
        remind_at,
        sent_at,
        created_at
      FROM property_visit_reminders
      WHERE sent_at IS NULL
        AND remind_at <= now()
      ORDER BY remind_at ASC
      LIMIT $1
    `,
    [limit],
  );

  return result.rows;
}

export async function markVisitReminderSentRepository(
  reminderId: string,
  client?: PoolClient,
) {
  const executor = client ?? db;

  await executor.query(
    `
      UPDATE property_visit_reminders
      SET sent_at = now()
      WHERE id = $1
    `,
    [reminderId],
  );
}
