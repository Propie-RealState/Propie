import { db } from "../../../database/client";

export async function findAgentStatsRepository(agentId: string) {
  const result = await db.query(
    `
    SELECT
      COALESCE(rs.total_reviews, 0)::int AS total_reviews,
      COALESCE(rs.average_rating, 0)::float AS average_rating,
      COALESCE(wp.total_worked, 0)::int AS total_worked_properties,
      COALESCE(wp.active_count, 0)::int AS active_properties,
      COALESCE(wp.completed_count, 0)::int AS completed_properties
    FROM (SELECT $1::uuid AS agent_id) base
    LEFT JOIN (
      SELECT
        target_user_id,
        COUNT(*)::int AS total_reviews,
        ROUND(AVG(rating)::numeric, 1)::float AS average_rating
      FROM user_reviews
      GROUP BY target_user_id
    ) rs ON rs.target_user_id = base.agent_id
    LEFT JOIN (
      SELECT
        agent_id,
        COUNT(*)::int AS total_worked,
        COUNT(*) FILTER (WHERE is_active = true)::int AS active_count,
        COUNT(*) FILTER (WHERE is_active = false)::int AS completed_count
      FROM property_assignments
      GROUP BY agent_id
    ) wp ON wp.agent_id = base.agent_id
    `,
    [agentId],
  );
  return result.rows[0] ?? null;
}

type CreateProfileInput = {
  userId: string;

  firstName?: string;
  lastName?: string;

  phone?: string;
  location?: string;

  avatarUrl?: string;

  dni?: string;
  birth_date?: string;
  nationality?: string;
  cuit_cuil?: string;
  address?: string;
  bio?: string;
};

export async function createProfile(data: CreateProfileInput) {
  const result = await db.query(
    `
    INSERT INTO profiles (
      user_id,
      first_name,
      last_name,
      phone,
      location,
      avatar_url,
      dni,
      birth_date,
      nationality,
      cuit_cuil,
      address,
      bio
    )
    VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12
    )
    RETURNING *
    `,
    [
      data.userId,

      data.firstName || null,
      data.lastName || null,

      data.phone || null,
      data.location || null,

      data.avatarUrl || null,

      data.dni || null,
      data.birth_date || null,
      data.nationality || null,
      data.cuit_cuil || null,
      data.address || null,
      data.bio || null,
    ],
  );

  return result.rows[0];
}

export async function findProfileByUserId(userId: string) {
  const result = await db.query(
    `
      SELECT *
      FROM profiles
      WHERE user_id = $1
    `,
    [userId],
  );

  return result.rows[0];
}

export async function updateProfile(
  userId: string,
  data: {
    phone?: string;
    location?: string;
    bio?: string;
  },
) {
  const sets: string[] = [];
  const values: unknown[] = [];
  let paramIndex = 1;

  if (data.phone !== undefined) {
    sets.push(`phone = $${paramIndex++}`);
    values.push(data.phone || null);
  }

  if (data.location !== undefined) {
    sets.push(`location = $${paramIndex++}`);
    values.push(data.location || null);
  }

  if (data.bio !== undefined) {
    sets.push(`bio = $${paramIndex++}`);
    values.push(data.bio || null);
  }

  if (sets.length === 0) {
    return findProfileByUserId(userId);
  }

  sets.push("updated_at = now()");
  values.push(userId);

  const result = await db.query(
    `
      UPDATE profiles
      SET ${sets.join(", ")}
      WHERE user_id = $${paramIndex}
      RETURNING *
    `,
    values,
  );

  return result.rows[0];
}
