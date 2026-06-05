import { db } from "@/database/client";

import type { CreateNotificationInput } from "../types/notification.types";
import {
  buildNotificationValues,
  mapNotificationRow,
} from "../utils/map-notification";

export async function createNotificationRepository(
  input: CreateNotificationInput,
) {
  const result = await db.query(
    `
      INSERT INTO notifications (
        user_id,
        type,
        title,
        body,
        entity_type,
        entity_id,
        metadata
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb)
      RETURNING *
    `,
    buildNotificationValues(input),
  );

  return mapNotificationRow(result.rows[0]);
}

export async function createNotificationsRepository(
  inputs: CreateNotificationInput[],
) {
  if (inputs.length === 0) {
    return [];
  }

  const values: unknown[] = [];
  const placeholders = inputs.map((input, index) => {
    const offset = index * 7;
    values.push(
      input.userId,
      input.type,
      input.title,
      input.body,
      input.entityType ?? null,
      input.entityId ?? null,
      JSON.stringify(input.metadata ?? {}),
    );

    return `($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5}, $${offset + 6}, $${offset + 7}::jsonb)`;
  });

  const result = await db.query(
    `
      INSERT INTO notifications (
        user_id,
        type,
        title,
        body,
        entity_type,
        entity_id,
        metadata
      )
      VALUES ${placeholders.join(", ")}
      RETURNING *
    `,
    values,
  );

  return result.rows.map(mapNotificationRow);
}

export async function listNotificationsRepository(input: {
  userId: string;
  limit: number;
  offset: number;
  unreadOnly?: boolean;
}) {
  const values: unknown[] = [input.userId];
  const filters = ["user_id = $1"];

  if (input.unreadOnly) {
    filters.push("read_at IS NULL");
  }

  values.push(input.limit);
  const limitParam = values.length;

  values.push(input.offset);
  const offsetParam = values.length;

  const result = await db.query(
    `
      SELECT *
      FROM notifications
      WHERE ${filters.join(" AND ")}
      ORDER BY created_at DESC
      LIMIT $${limitParam}
      OFFSET $${offsetParam}
    `,
    values,
  );

  return result.rows.map(mapNotificationRow);
}

export async function countNotificationsRepository(input: {
  userId: string;
  unreadOnly?: boolean;
}) {
  const values: unknown[] = [input.userId];
  const filters = ["user_id = $1"];

  if (input.unreadOnly) {
    filters.push("read_at IS NULL");
  }

  const result = await db.query(
    `
      SELECT COUNT(*)::int AS count
      FROM notifications
      WHERE ${filters.join(" AND ")}
    `,
    values,
  );

  return result.rows[0]?.count ?? 0;
}

export async function markNotificationReadRepository(input: {
  notificationId: string;
  userId: string;
}) {
  const result = await db.query(
    `
      UPDATE notifications
      SET read_at = COALESCE(read_at, now())
      WHERE id = $1
        AND user_id = $2
      RETURNING *
    `,
    [input.notificationId, input.userId],
  );

  const row = result.rows[0];
  return row ? mapNotificationRow(row) : null;
}

export async function markAllNotificationsReadRepository(
  userId: string,
) {
  const result = await db.query(
    `
      UPDATE notifications
      SET read_at = now()
      WHERE user_id = $1
        AND read_at IS NULL
      RETURNING id
    `,
    [userId],
  );

  return result.rowCount ?? 0;
}

export async function findUsersNearPropertyRepository(input: {
  propertyId: string;
  excludeUserId?: string;
}) {
  const values: unknown[] = [input.propertyId];
  const exclusions = ["np.user_id != p.owner_id"];

  if (input.excludeUserId) {
    values.push(input.excludeUserId);
    exclusions.push(`np.user_id != $${values.length}`);
  }

  const result = await db.query(
    `
      SELECT DISTINCT np.user_id
      FROM notification_preferences np
      INNER JOIN property_locations pl
        ON pl.property_id = $1
      INNER JOIN properties p
        ON p.id = pl.property_id
      WHERE np.nearby_enabled = true
        AND np.coordinates IS NOT NULL
        AND pl.coordinates IS NOT NULL
        AND ST_DWithin(
          np.coordinates,
          pl.coordinates,
          np.radius_meters
        )
        AND ${exclusions.join(" AND ")}
    `,
    values,
  );

  return result.rows.map((row) => row.user_id as string);
}

export async function findFavoriteUserIdsByPropertyRepository(
  propertyId: string,
) {
  const result = await db.query(
    `
      SELECT pf.user_id
      FROM property_favorites pf
      LEFT JOIN notification_preferences np
        ON np.user_id = pf.user_id
      WHERE pf.property_id = $1
        AND COALESCE(np.favorites_enabled, true) = true
    `,
    [propertyId],
  );

  return result.rows.map((row) => row.user_id as string);
}

export async function getNotificationPreferencesRepository(
  userId: string,
) {
  const result = await db.query(
    `
      SELECT *
      FROM notification_preferences
      WHERE user_id = $1
      LIMIT 1
    `,
    [userId],
  );

  return result.rows[0] ?? null;
}

export async function upsertNotificationPreferencesRepository(input: {
  userId: string;
  nearbyEnabled?: boolean;
  favoritesEnabled?: boolean;
  messagesEnabled?: boolean;
  agentApplicationsEnabled?: boolean;
  latitude?: number;
  longitude?: number;
  radiusMeters?: number;
}) {
  const result = await db.query(
    `
      INSERT INTO notification_preferences (
        user_id,
        nearby_enabled,
        favorites_enabled,
        messages_enabled,
        agent_applications_enabled,
        latitude,
        longitude,
        coordinates,
        radius_meters
      )
      VALUES (
        $1,
        COALESCE($2, true),
        COALESCE($3, true),
        COALESCE($4, true),
        COALESCE($5, true),
        $6,
        $7,
        CASE
          WHEN $6 IS NOT NULL AND $7 IS NOT NULL THEN
            ST_SetSRID(
              ST_MakePoint($7::double precision, $6::double precision),
              4326
            )::geography
          ELSE NULL
        END,
        COALESCE($8, 5000)
      )
      ON CONFLICT (user_id)
      DO UPDATE SET
        nearby_enabled = COALESCE($2, notification_preferences.nearby_enabled),
        favorites_enabled = COALESCE($3, notification_preferences.favorites_enabled),
        messages_enabled = COALESCE($4, notification_preferences.messages_enabled),
        agent_applications_enabled = COALESCE(
          $5,
          notification_preferences.agent_applications_enabled
        ),
        latitude = COALESCE($6, notification_preferences.latitude),
        longitude = COALESCE($7, notification_preferences.longitude),
        coordinates = CASE
          WHEN $6 IS NOT NULL AND $7 IS NOT NULL THEN
            ST_SetSRID(
              ST_MakePoint($7::double precision, $6::double precision),
              4326
            )::geography
          WHEN $6 IS NULL AND $7 IS NULL THEN
            notification_preferences.coordinates
          ELSE
            notification_preferences.coordinates
        END,
        radius_meters = COALESCE($8, notification_preferences.radius_meters),
        updated_at = now()
      RETURNING *
    `,
    [
      input.userId,
      input.nearbyEnabled ?? null,
      input.favoritesEnabled ?? null,
      input.messagesEnabled ?? null,
      input.agentApplicationsEnabled ?? null,
      input.latitude ?? null,
      input.longitude ?? null,
      input.radiusMeters ?? null,
    ],
  );

  return result.rows[0];
}
