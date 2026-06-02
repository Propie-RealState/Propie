import { db } from "@/database/client";

export async function getAgentPublicProfileRepository(agentId: string) {
  const result = await db.query(
    `
    SELECT
      u.id,
      pr.first_name,
      pr.last_name,
      pr.avatar_url,
      pr.bio,
      pr.location,
      pr.created_at AS member_since,
      COALESCE(rs.total_reviews, 0)::int AS total_reviews,
      COALESCE(rs.average_rating, 0)::float AS average_rating,
      COALESCE(wp.total_worked, 0)::int AS total_worked_properties,
      COALESCE(wp.active_count, 0)::int AS active_properties,
      COALESCE(wp.completed_count, 0)::int AS completed_properties
    FROM users u
    LEFT JOIN profiles pr ON pr.user_id = u.id
    LEFT JOIN (
      SELECT
        target_user_id,
        COUNT(*)::int AS total_reviews,
        ROUND(AVG(rating)::numeric, 1)::float AS average_rating
      FROM user_reviews
      GROUP BY target_user_id
    ) rs ON rs.target_user_id = u.id
    LEFT JOIN (
      SELECT
        agent_id,
        COUNT(*)::int AS total_worked,
        COUNT(*) FILTER (WHERE is_active = true)::int AS active_count,
        COUNT(*) FILTER (WHERE is_active = false)::int AS completed_count
      FROM property_assignments
      GROUP BY agent_id
    ) wp ON wp.agent_id = u.id
    WHERE u.id = $1
      AND u.role = 'AGENT'
    `,
    [agentId],
  );
  return result.rows[0] ?? null;
}
