import { db } from "@/database/client";

type DateRange = { from: string; to: string };

// ─── KPI Overview ───────────────────────────────────────────

export async function getOverviewMetrics(range: DateRange) {
  const result = await db.query<{
    total_users: number;
    new_users: number;
    total_properties: number;
    active_properties: number;
    total_agents: number;
    approved_agents: number;
    total_applications: number;
    accepted_applications: number;
    total_conversations: number;
    total_messages: number;
    total_visits: number;
  }>(
    `
      SELECT
        (SELECT COUNT(*)::int FROM users WHERE is_active = true) AS total_users,
        (SELECT COUNT(*)::int FROM users WHERE is_active = true AND created_at >= $1 AND created_at <= $2) AS new_users,
        (SELECT COUNT(*)::int FROM properties) AS total_properties,
        (SELECT COUNT(*)::int FROM properties WHERE published_at IS NOT NULL AND status = 'ACTIVE') AS active_properties,
        (SELECT COUNT(*)::int FROM users WHERE role = 'AGENT' AND is_active = true) AS total_agents,
        (SELECT COUNT(DISTINCT agent_id)::int FROM agent_applications WHERE status = 'ACCEPTED') AS approved_agents,
        (SELECT COUNT(*)::int FROM agent_applications) AS total_applications,
        (SELECT COUNT(*)::int FROM agent_applications WHERE status = 'ACCEPTED') AS accepted_applications,
        (SELECT COUNT(*)::int FROM property_conversations) AS total_conversations,
        (SELECT COUNT(*)::int FROM property_conversation_messages) AS total_messages,
        (SELECT COUNT(*)::int FROM property_visits) AS total_visits
    `,
    [range.from, range.to],
  );

  return result.rows[0];
}

// ─── Users Over Time ────────────────────────────────────────

export type DailyCount = { date: string; count: number };

export async function getRegistrationsOverTime(range: DateRange): Promise<DailyCount[]> {
  const result = await db.query<{ date: string; count: number }>(
    `
      SELECT
        date_trunc('day', created_at)::date::text AS date,
        COUNT(*)::int AS count
      FROM users
      WHERE created_at >= $1 AND created_at <= $2
      GROUP BY date_trunc('day', created_at)
      ORDER BY date
    `,
    [range.from, range.to],
  );

  return result.rows;
}

export async function getUsersByRole() {
  const result = await db.query<{ role: string; count: number }>(
    `
      SELECT role, COUNT(*)::int AS count
      FROM users
      WHERE is_active = true
      GROUP BY role
      ORDER BY count DESC
    `,
    [],
  );

  return result.rows;
}

// ─── Properties Over Time ───────────────────────────────────

export async function getPropertiesPublishedOverTime(range: DateRange): Promise<DailyCount[]> {
  const result = await db.query<{ date: string; count: number }>(
    `
      SELECT
        date_trunc('day', published_at)::date::text AS date,
        COUNT(*)::int AS count
      FROM properties
      WHERE published_at IS NOT NULL
        AND published_at >= $1 AND published_at <= $2
      GROUP BY date_trunc('day', published_at)
      ORDER BY date
    `,
    [range.from, range.to],
  );

  return result.rows;
}

export async function getPropertyStatusCounts() {
  const result = await db.query<{ status: string; count: number }>(
    `
      SELECT status, COUNT(*)::int AS count
      FROM properties
      GROUP BY status
      ORDER BY count DESC
    `,
    [],
  );

  return result.rows;
}

// ─── Agent Applications ─────────────────────────────────────

export async function getApplicationFunnel() {
  const result = await db.query<{ status: string; count: number }>(
    `
      SELECT status, COUNT(*)::int AS count
      FROM agent_applications
      GROUP BY status
      ORDER BY
        CASE status
          WHEN 'PENDING' THEN 1
          WHEN 'ACCEPTED' THEN 2
          WHEN 'REJECTED' THEN 3
          WHEN 'CANCELLED' THEN 4
        END
    `,
    [],
  );

  return result.rows;
}
