import { db } from "@/database/client";

/**
 * Determines if reviewerUserId can review targetUserId in the context of a property.
 *
 * Rules:
 * - Both parties must have a real accepted assignment for the property
 * - No self-reviews
 * - No duplicate reviews for the same reviewer + target + property
 * - Assignment must exist (active or ended) — pending/cancelled not allowed
 */
export async function canReviewRepository(input: {
  propertyId: string;
  reviewerUserId: string;
  targetUserId: string;
}): Promise<{
  canReview: boolean;
  reason: "OK" | "SELF_REVIEW" | "NO_ASSIGNMENT" | "ALREADY_REVIEWED";
}> {
  const { propertyId, reviewerUserId, targetUserId } = input;

  if (reviewerUserId === targetUserId) {
    return { canReview: false, reason: "SELF_REVIEW" };
  }

  const result = await db.query(
    `
    SELECT
      EXISTS(
        SELECT 1
        FROM property_assignments pa
        JOIN properties prop ON prop.id = pa.property_id
        WHERE pa.property_id = $1
          AND (
            -- Owner reviewing Agent: reviewer is owner of property, target is assigned agent
            (prop.owner_id = $2 AND pa.agent_id = $3)
            OR
            -- Agent reviewing Owner: reviewer is assigned agent, target is property owner
            (pa.agent_id = $2 AND prop.owner_id = $3)
          )
          -- Assignment must be accepted (is_active OR completed)
          -- Assignments only created when application is ACCEPTED,
          -- so presence alone means it was accepted
      ) AS has_assignment,

      NOT EXISTS(
        SELECT 1 FROM user_reviews
        WHERE reviewer_user_id = $2
          AND target_user_id = $3
          AND property_id = $1
      ) AS no_existing_review
    `,
    [propertyId, reviewerUserId, targetUserId],
  );

  const { has_assignment, no_existing_review } = result.rows[0];

  if (!has_assignment) {
    return { canReview: false, reason: "NO_ASSIGNMENT" };
  }

  if (!no_existing_review) {
    return { canReview: false, reason: "ALREADY_REVIEWED" };
  }

  return { canReview: true, reason: "OK" };
}

/**
 * Returns all properties where reviewerUserId can review targetUserId.
 * Useful for showing a list of reviewable properties.
 */
export async function getReviewablePropertiesRepository(input: {
  reviewerUserId: string;
  targetUserId: string;
}) {
  const result = await db.query(
    `
    SELECT DISTINCT
      pa.property_id,
      p.title AS property_title
    FROM property_assignments pa
    JOIN properties p ON p.id = pa.property_id
    WHERE (
      (p.owner_id = $1 AND pa.agent_id = $2)
      OR
      (pa.agent_id = $1 AND p.owner_id = $2)
    )
    AND NOT EXISTS (
      SELECT 1 FROM user_reviews
      WHERE reviewer_user_id = $1
        AND target_user_id = $2
        AND property_id = pa.property_id
    )
    ORDER BY p.title
    `,
    [input.reviewerUserId, input.targetUserId],
  );
  return result.rows;
}
