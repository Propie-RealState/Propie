import { db } from "@/database/client";

export async function listFavoritePropertyIdsRepository(
  userId: string,
) {
  const result = await db.query(
    `
      SELECT property_id
      FROM property_favorites
      WHERE user_id = $1
      ORDER BY created_at DESC
    `,
    [userId],
  );

  return result.rows.map((row) => row.property_id as string);
}

export async function addFavoriteRepository(input: {
  userId: string;
  propertyId: string;
}) {
  const result = await db.query(
    `
      INSERT INTO property_favorites (
        user_id,
        property_id
      )
      VALUES ($1, $2)
      ON CONFLICT (user_id, property_id)
      DO UPDATE SET created_at = property_favorites.created_at
      RETURNING property_id
    `,
    [input.userId, input.propertyId],
  );

  return result.rows[0]?.property_id ?? null;
}

export async function removeFavoriteRepository(input: {
  userId: string;
  propertyId: string;
}) {
  const result = await db.query(
    `
      DELETE FROM property_favorites
      WHERE user_id = $1
        AND property_id = $2
      RETURNING property_id
    `,
    [input.userId, input.propertyId],
  );

  return result.rows[0]?.property_id ?? null;
}

export async function isFavoriteRepository(input: {
  userId: string;
  propertyId: string;
}) {
  const result = await db.query(
    `
      SELECT 1
      FROM property_favorites
      WHERE user_id = $1
        AND property_id = $2
      LIMIT 1
    `,
    [input.userId, input.propertyId],
  );

  return result.rowCount !== null && result.rowCount > 0;
}

export async function syncFavoritesRepository(input: {
  userId: string;
  propertyIds: string[];
}) {
  if (input.propertyIds.length === 0) {
    return [];
  }

  const values: unknown[] = [input.userId];
  const placeholders = input.propertyIds.map((propertyId, index) => {
    values.push(propertyId);
    return `($1, $${index + 2})`;
  });

  const result = await db.query(
    `
      INSERT INTO property_favorites (
        user_id,
        property_id
      )
      SELECT $1, p.id
      FROM (VALUES ${input.propertyIds.map((_, i) => `($${i + 2}::uuid)`).join(", ")}) AS v(id)
      JOIN properties p ON p.id = v.id
      ON CONFLICT (user_id, property_id) DO NOTHING
      RETURNING property_id
    `,
    values,
  );

  return result.rows.map((row) => row.property_id as string);
}
