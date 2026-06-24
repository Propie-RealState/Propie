import { apiFetch } from "../../../../lib/api";

export type HealthPeriod = "7d" | "30d" | "90d";

export type RoleCount = { role: string; count: number };
export type StatusCount = { status: string; count: number };
export type OperationCount = { operation_type: string; count: number };
export type DailyCount = { date: string; count: number };
export type TopFavoritedProperty = {
  property_id: string;
  title: string | null;
  favorite_count: number;
};

export type AdminBIData = {
  period: HealthPeriod;
  range: { from: string; to: string; days?: number };
  executive: {
    total_users: number;
    total_properties: number;
    total_conversations: number;
    total_visits: number;
    new_registrations: number;
    active_properties: number;
  };
  users: { byRole: RoleCount[] };
  owners: {
    total_owners: number;
    with_published: number;
    without_published: number;
    with_assigned_agents: number;
    self_managed: number;
    avg_properties_per_owner: number;
  };
  agents: {
    total_agents: number;
    with_assignments: number;
    without_assignments: number;
    with_active_publications: number;
    without_active_publications: number;
    activeInPeriod: number;
  };
  properties: {
    statusBreakdown: StatusCount[];
    operationBreakdown: OperationCount[];
    publication: {
      published: number;
      unpublished: number;
      publication_rate: number;
    };
  };
  conversations: {
    total: number;
    client_conversations: number;
    internal_conversations: number;
    with_messages: number;
    without_messages: number;
    unanswered: number;
    avg_messages_per_conversation: number;
    active_30d: number;
  };
  visits: {
    scheduled: number;
    confirmed: number;
    completed: number;
    cancelled: number;
    rescheduled: number;
    completion_rate: number | null;
  };
  favorites: {
    total_favorites: number;
    unique_users: number;
    top_properties: TopFavoritedProperty[];
  };
  marketplaceHealth: {
    active_owners: number;
    active_agents: number;
    active_properties: number;
    active_conversations: number;
    completed_visits: number;
    new_registrations: number;
  };
  registrations: DailyCount[];
};

export async function fetchAdminBI(period: HealthPeriod = "30d"): Promise<AdminBIData> {
  const response = await apiFetch(`/admin/analytics/bi?period=${period}`);
  return response.data;
}

export function getRoleCount(byRole: RoleCount[], role: string): number {
  return byRole.find((r) => r.role === role)?.count ?? 0;
}
