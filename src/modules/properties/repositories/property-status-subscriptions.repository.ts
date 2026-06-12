import { db } from "@/database/client";

export async function upsertPropertyStatusSubscriptionRepository(input: {
  propertyId: string;
  userId: string;
}) {
  const result = await db.query(
    `
      INSERT INTO property_status_subscriptions (
        property_id,
        user_id
      )
      VALUES ($1, $2)
      ON CONFLICT (property_id, user_id)
      DO UPDATE SET notified_at = NULL
      RETURNING *
    `,
    [input.propertyId, input.userId],
  );

  return result.rows[0];
}

export async function findPendingStatusSubscriptionUserIdsRepository(
  propertyId: string,
) {
  const result = await db.query<{ user_id: string }>(
    `
      SELECT user_id
      FROM property_status_subscriptions
      WHERE property_id = $1
        AND notified_at IS NULL
    `,
    [propertyId],
  );

  return result.rows.map((row) => row.user_id);
}

export async function markStatusSubscriptionsNotifiedRepository(
  propertyId: string,
) {
  await db.query(
    `
      UPDATE property_status_subscriptions
      SET notified_at = now()
      WHERE property_id = $1
        AND notified_at IS NULL
    `,
    [propertyId],
  );
}
