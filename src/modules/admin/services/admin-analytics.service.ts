import {
  getOverviewMetrics,
  getRegistrationsOverTime,
  getUsersByRole,
  getPropertiesPublishedOverTime,
  getPropertyStatusCounts,
  getApplicationFunnel,
} from "../repositories/admin-analytics.repository";
import {
  getExecutiveSummary,
  getOwnerMetrics,
  getAgentMetrics,
  getActiveAgentsCount,
  getPropertyStatusBreakdown,
  getPropertyOperationBreakdown,
  getPublicationMetrics,
  getConversationMetrics,
  getVisitMetrics,
  getFavoriteMetrics,
  getMarketplaceHealth,
  getRegistrationsOverTime as getBIRegistrationsOverTime,
} from "../repositories/admin-bi.repository";

type DateRange = { from: string; to: string };

export type HealthPeriod = "7d" | "30d" | "90d";

export function parseHealthPeriod(period: string): DateRange & { days: number } {
  const days = period === "7d" ? 7 : period === "90d" ? 90 : 30;
  const to = new Date();
  const from = new Date(to.getTime() - days * 24 * 60 * 60 * 1000);
  return { from: from.toISOString(), to: to.toISOString(), days };
}

export async function getAdminOverviewService(range: DateRange) {
  return getOverviewMetrics(range);
}

export async function getAdminUsersService(range: DateRange) {
  const [registrations, byRole] = await Promise.all([
    getRegistrationsOverTime(range),
    getUsersByRole(),
  ]);

  return { registrations, byRole };
}

export async function getAdminPropertiesService(range: DateRange) {
  const [published, statusCounts] = await Promise.all([
    getPropertiesPublishedOverTime(range),
    getPropertyStatusCounts(),
  ]);

  return { published, statusCounts };
}

export async function getAdminAgentsService() {
  return getApplicationFunnel();
}

export async function getAdminBIService(period: HealthPeriod) {
  const range = parseHealthPeriod(period);

  const [
    executive,
    usersByRole,
    owners,
    agents,
    activeAgents,
    propertyStatus,
    propertyOperations,
    publication,
    conversations,
    visits,
    favorites,
    marketplaceHealth,
    registrations,
  ] = await Promise.all([
    getExecutiveSummary(range),
    getUsersByRole(),
    getOwnerMetrics(),
    getAgentMetrics(),
    getActiveAgentsCount(range),
    getPropertyStatusBreakdown(),
    getPropertyOperationBreakdown(),
    getPublicationMetrics(),
    getConversationMetrics(range),
    getVisitMetrics(),
    getFavoriteMetrics(),
    getMarketplaceHealth(range),
    getBIRegistrationsOverTime(range),
  ]);

  return {
    period,
    range,
    executive,
    users: { byRole: usersByRole },
    owners,
    agents: { ...agents, activeInPeriod: activeAgents },
    properties: {
      statusBreakdown: propertyStatus,
      operationBreakdown: propertyOperations,
      publication,
    },
    conversations,
    visits,
    favorites,
    marketplaceHealth,
    registrations,
  };
}
