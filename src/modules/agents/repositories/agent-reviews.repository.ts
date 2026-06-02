import { db } from "@/database/client";

export type CreateAgentReviewInput = {
  agentId: string;
  reviewerUserId: string;
  propertyId: string;
  rating: number;
  comment: string | null;
};

export async function createAgentReviewRepository(
  input: CreateAgentReviewInput,
) {
  const result = await db.query(
    `
    INSERT INTO agent_reviews (
      agent_id,
      reviewer_user_id,
      property_id,
      rating,
      comment
    )
    VALUES ($1, $2, $3, $4, $5)
    ON CONFLICT (reviewer_user_id, agent_id, property_id)
    DO UPDATE SET
      rating = EXCLUDED.rating,
      comment = EXCLUDED.comment
    RETURNING *
    `,
    [
      input.agentId,
      input.reviewerUserId,
      input.propertyId,
      input.rating,
      input.comment,
    ],
  );
  return result.rows[0];
}

export async function getAgentReviewsRepository(input: {
  agentId: string;
  limit: number;
  offset: number;
}) {
  const result = await db.query(
    `
    SELECT
      ar.id,
      ar.rating,
      ar.comment,
      ar.created_at,
      ar.property_id,
      p.title AS property_title,
      pr.first_name AS reviewer_first_name,
      pr.last_name AS reviewer_last_name,
      pr.avatar_url AS reviewer_avatar_url
    FROM agent_reviews ar
    INNER JOIN users u ON u.id = ar.reviewer_user_id
    LEFT JOIN profiles pr ON pr.user_id = u.id
    LEFT JOIN properties p ON p.id = ar.property_id
    WHERE ar.agent_id = $1
    ORDER BY ar.created_at DESC
    LIMIT $2 OFFSET $3
    `,
    [input.agentId, input.limit, input.offset],
  );
  return result.rows;
}

export async function canUserReviewAgentRepository(input: {
  reviewerUserId: string;
  agentId: string;
  propertyId: string;
}): Promise<boolean> {
  const result = await db.query(
    `
    SELECT 1
    FROM property_assignments pa
    INNER JOIN properties p ON p.id = pa.property_id
    WHERE pa.property_id = $3
      AND pa.is_active = true
      AND (
        (pa.agent_id = $1 AND p.owner_id = $2)
        OR
        (p.owner_id = $1 AND pa.agent_id = $2)
      )
    LIMIT 1
    `,
    [input.agentId, input.reviewerUserId, input.propertyId],
  );
  return result.rows.length > 0;
}
