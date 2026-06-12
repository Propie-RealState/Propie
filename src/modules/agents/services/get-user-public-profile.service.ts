import { getAgentPropertyStatsRepository } from "../repositories/agent-property-stats.repository";
import { getAgentPublicProfileRepository } from "../repositories/agent-public-profile.repository";
import { getUserPublicProfileRepository } from "../repositories/get-user-public-profile.repository";

export async function getUserPublicProfileService(userId: string) {
  const row = await getUserPublicProfileRepository(userId);

  if (!row) {
    return null;
  }

  const agentStats =
    row.role === "AGENT"
      ? await getAgentPropertyStatsRepository(userId)
      : {
          total_worked_properties: 0,
          active_properties: 0,
          completed_properties: 0,
        };

  return {
    id: row.id,
    role: row.role,
    first_name: row.first_name,
    last_name: row.last_name,
    avatar_url: row.avatar_url,
    bio: row.bio,
    location: row.location,
    member_since: row.member_since,
    total_reviews: row.total_reviews,
    average_rating: row.average_rating,
    rating_distribution: {
      five: row.five_stars,
      four: row.four_stars,
      three: row.three_stars,
      two: row.two_stars,
      one: row.one_star,
    },
    total_worked_properties: agentStats.total_worked_properties,
    active_properties:
      row.role === "AGENT"
        ? agentStats.active_properties
        : row.owner_active_properties,
    completed_properties: agentStats.completed_properties,
  };
}

export async function getAgentPublicProfileService(agentId: string) {
  return getAgentPublicProfileRepository(agentId);
}
