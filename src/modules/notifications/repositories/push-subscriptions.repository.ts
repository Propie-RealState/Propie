import { db } from "@/database/client";

export type PushSubscriptionRow = {
  id: string;
  user_id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  user_agent: string | null;
  platform: string | null;
  created_at: string;
  updated_at: string;
};

export async function upsertPushSubscriptionRepository(input: {
  userId: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  userAgent?: string | null;
  platform?: string | null;
}) {
  const result = await db.query(
    `
      INSERT INTO push_subscriptions (
        user_id,
        endpoint,
        p256dh,
        auth,
        user_agent,
        platform
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (user_id, endpoint)
      DO UPDATE SET
        p256dh = EXCLUDED.p256dh,
        auth = EXCLUDED.auth,
        user_agent = EXCLUDED.user_agent,
        platform = EXCLUDED.platform,
        updated_at = now()
      RETURNING *
    `,
    [
      input.userId,
      input.endpoint,
      input.p256dh,
      input.auth,
      input.userAgent ?? null,
      input.platform ?? null,
    ],
  );

  return result.rows[0] as PushSubscriptionRow;
}

export async function deletePushSubscriptionRepository(input: {
  userId: string;
  endpoint: string;
}) {
  const result = await db.query(
    `
      DELETE FROM push_subscriptions
      WHERE user_id = $1
        AND endpoint = $2
    `,
    [input.userId, input.endpoint],
  );

  return result.rowCount ?? 0;
}

export async function deletePushSubscriptionByIdRepository(id: string) {
  const result = await db.query(
    `
      DELETE FROM push_subscriptions
      WHERE id = $1
    `,
    [id],
  );

  return result.rowCount ?? 0;
}

export async function findPushSubscriptionsByUserRepository(
  userId: string,
) {
  const result = await db.query(
    `
      SELECT *
      FROM push_subscriptions
      WHERE user_id = $1
      ORDER BY updated_at DESC
    `,
    [userId],
  );

  return result.rows as PushSubscriptionRow[];
}

export async function findPushSubscriptionsByUserIdsRepository(
  userIds: string[],
) {
  if (userIds.length === 0) {
    return [];
  }

  const result = await db.query(
    `
      SELECT *
      FROM push_subscriptions
      WHERE user_id = ANY($1::uuid[])
    `,
    [userIds],
  );

  return result.rows as PushSubscriptionRow[];
}
