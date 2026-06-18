import { db } from "../../../database/client";
import { getAgentPropertyStatsRepository } from "../../agents/repositories/agent-property-stats.repository";

export async function findAgentStatsRepository(agentId: string) {
  const result = await db.query(
    `
    SELECT
      COALESCE(rs.total_reviews, 0)::int AS total_reviews,
      COALESCE(rs.average_rating, 0)::float AS average_rating
    FROM (SELECT $1::uuid AS agent_id) base
    LEFT JOIN (
      SELECT
        target_user_id,
        COUNT(*)::int AS total_reviews,
        ROUND(AVG(rating)::numeric, 1)::float AS average_rating
      FROM user_reviews
      GROUP BY target_user_id
    ) rs ON rs.target_user_id = base.agent_id
    `,
    [agentId],
  );

  const reviewStats = result.rows[0];
  const propertyStats = await getAgentPropertyStatsRepository(agentId);

  return {
    total_reviews: reviewStats?.total_reviews ?? 0,
    average_rating: reviewStats?.average_rating ?? 0,
    ...propertyStats,
  };
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

export async function updateAvatarUrl(userId: string, avatarUrl: string) {
  const result = await db.query(
    `
      UPDATE profiles
      SET avatar_url = $1,
          updated_at = now()
      WHERE user_id = $2
      RETURNING *
    `,
    [avatarUrl, userId],
  );
  return result.rows[0];
}

export async function updateProfile(
  userId: string,
  data: {
    phone?: string;
    location?: string;
    bio?: string;
    first_name?: string;
    last_name?: string;
    nationality?: string;
    birth_date?: string;
    experience?: unknown;
    certifications?: unknown;
    education?: unknown;
    agent_profile_banner_dismissed?: boolean;
  },
) {
  const sets: string[] = [];
  const values: unknown[] = [];
  let paramIndex = 1;

  const assign = (column: string, value: unknown) => {
    sets.push(`${column} = $${paramIndex++}`);
    values.push(value);
  };

  const assignJson = (column: string, value: unknown) => {
    sets.push(`${column} = $${paramIndex++}::jsonb`);
    values.push(JSON.stringify(value ?? null));
  };

  if (data.phone !== undefined) assign("phone", data.phone || null);
  if (data.location !== undefined) assign("location", data.location || null);
  if (data.bio !== undefined) assign("bio", data.bio || null);
  if (data.first_name !== undefined) assign("first_name", data.first_name || null);
  if (data.last_name !== undefined) assign("last_name", data.last_name || null);
  if (data.nationality !== undefined) assign("nationality", data.nationality || null);
  if (data.birth_date !== undefined) assign("birth_date", data.birth_date || null);
  if (data.experience !== undefined) assignJson("experience", data.experience);
  if (data.certifications !== undefined) assignJson("certifications", data.certifications);
  if (data.education !== undefined) assignJson("education", data.education);
  if (data.agent_profile_banner_dismissed !== undefined) {
    assign("agent_profile_banner_dismissed", data.agent_profile_banner_dismissed);
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
