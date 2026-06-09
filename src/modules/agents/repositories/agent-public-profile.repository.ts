import { db } from "@/database/client";
import { getAgentPropertyStatsRepository } from "./agent-property-stats.repository";

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
      COALESCE(rs.average_rating, 0)::float AS average_rating
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
    WHERE u.id = $1
      AND u.role = 'AGENT'
    `,
    [agentId],
  );

  const profile = result.rows[0];

  if (!profile) {
    return null;
  }

  const stats = await getAgentPropertyStatsRepository(agentId);

  return {
    ...profile,
    ...stats,
  };
}
