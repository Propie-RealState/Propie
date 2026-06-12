import { db } from "@/database/client";

export type CreateUserReviewInput = {
  targetUserId: string;
  reviewerUserId: string;
  propertyId: string;
  reviewerRole: "OWNER" | "AGENT" | "CLIENT";
  targetRole: "OWNER" | "AGENT" | "CLIENT";
  rating: number;
  comment: string | null;
};

export async function createUserReviewRepository(input: CreateUserReviewInput) {
  const result = await db.query(
    `
    INSERT INTO user_reviews (
      target_user_id,
      reviewer_user_id,
      property_id,
      reviewer_role,
      target_role,
      rating,
      comment
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    ON CONFLICT (reviewer_user_id, target_user_id, property_id)
    DO UPDATE SET
      rating = EXCLUDED.rating,
      comment = EXCLUDED.comment
    RETURNING *
    `,
    [
      input.targetUserId,
      input.reviewerUserId,
      input.propertyId,
      input.reviewerRole,
      input.targetRole,
      input.rating,
      input.comment,
    ],
  );
  return result.rows[0];
}

export async function getUserReviewsRepository(input: {
  targetUserId: string;
  limit: number;
  offset: number;
}) {
  const result = await db.query(
    `
    SELECT
      ur.id,
      ur.rating,
      ur.comment,
      ur.created_at,
      ur.property_id,
      ur.reviewer_role,
      ur.target_role,
      p.title AS property_title,
      pr.first_name AS reviewer_first_name,
      pr.last_name AS reviewer_last_name,
      prp.avatar_url AS reviewer_avatar_url
    FROM user_reviews ur
    INNER JOIN users rv ON rv.id = ur.reviewer_user_id
    LEFT JOIN profiles pr ON pr.user_id = rv.id
    LEFT JOIN profiles prp ON prp.user_id = rv.id
    LEFT JOIN properties p ON p.id = ur.property_id
    WHERE ur.target_user_id = $1
    ORDER BY ur.created_at DESC
    LIMIT $2 OFFSET $3
    `,
    [input.targetUserId, input.limit, input.offset],
  );
  return result.rows;
}
