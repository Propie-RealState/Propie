import { db } from "@/database/client";

type PeriodRange = { from: string; to: string };

// ─── Users & Roles ──────────────────────────────────────────

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

export async function getOwnerMetrics() {
  const result = await db.query<{
    total_owners: number;
    with_published: number;
    without_published: number;
    with_assigned_agents: number;
    self_managed: number;
    avg_properties_per_owner: number;
  }>(
    `
      WITH owners AS (
        SELECT id FROM users WHERE role = 'OWNER' AND is_active = true
      ),
      owner_props AS (
        SELECT owner_id, COUNT(*)::int AS prop_count,
          BOOL_OR(published_at IS NOT NULL) AS has_published
        FROM properties
        GROUP BY owner_id
      ),
      owners_with_agents AS (
        SELECT DISTINCT p.owner_id
        FROM properties p
        INNER JOIN property_assignments pa
          ON pa.property_id = p.id AND pa.is_active = true
      ),
      self_managed_owners AS (
        SELECT DISTINCT p.owner_id
        FROM properties p
        WHERE p.published_at IS NOT NULL
          AND NOT EXISTS (
            SELECT 1 FROM property_assignments pa
            WHERE pa.property_id = p.id AND pa.is_active = true
          )
      )
      SELECT
        (SELECT COUNT(*)::int FROM owners) AS total_owners,
        (SELECT COUNT(*)::int FROM owners o
          INNER JOIN owner_props op ON op.owner_id = o.id
          WHERE op.has_published) AS with_published,
        (SELECT COUNT(*)::int FROM owners o
          LEFT JOIN owner_props op ON op.owner_id = o.id
          WHERE op.owner_id IS NULL OR NOT op.has_published) AS without_published,
        (SELECT COUNT(*)::int FROM owners o
          INNER JOIN owners_with_agents owa ON owa.owner_id = o.id) AS with_assigned_agents,
        (SELECT COUNT(*)::int FROM owners o
          INNER JOIN self_managed_owners smo ON smo.owner_id = o.id) AS self_managed,
        COALESCE((
          SELECT ROUND(AVG(op.prop_count)::numeric, 1)
          FROM owner_props op
          INNER JOIN owners o ON o.id = op.owner_id
        ), 0)::float AS avg_properties_per_owner
    `,
    [],
  );
  return result.rows[0];
}

export async function getAgentMetrics() {
  const result = await db.query<{
    total_agents: number;
    with_assignments: number;
    without_assignments: number;
    with_active_publications: number;
    without_active_publications: number;
  }>(
    `
      WITH agents AS (
        SELECT id FROM users WHERE role = 'AGENT' AND is_active = true
      ),
      assigned AS (
        SELECT DISTINCT agent_id FROM property_assignments WHERE is_active = true
      ),
      publishing AS (
        SELECT DISTINCT publisher_id AS agent_id
        FROM properties
        WHERE publisher_type = 'AGENT'
          AND published_at IS NOT NULL
          AND status = 'ACTIVE'
      )
      SELECT
        (SELECT COUNT(*)::int FROM agents) AS total_agents,
        (SELECT COUNT(*)::int FROM agents a
          INNER JOIN assigned asn ON asn.agent_id = a.id) AS with_assignments,
        (SELECT COUNT(*)::int FROM agents a
          LEFT JOIN assigned asn ON asn.agent_id = a.id
          WHERE asn.agent_id IS NULL) AS without_assignments,
        (SELECT COUNT(*)::int FROM agents a
          INNER JOIN publishing pub ON pub.agent_id = a.id) AS with_active_publications,
        (SELECT COUNT(*)::int FROM agents a
          LEFT JOIN publishing pub ON pub.agent_id = a.id
          WHERE pub.agent_id IS NULL) AS without_active_publications
    `,
    [],
  );
  return result.rows[0];
}

export async function getActiveAgentsCount(range: PeriodRange) {
  const result = await db.query<{ count: number }>(
    `
      SELECT COUNT(*)::int AS count
      FROM (
        SELECT publisher_id AS agent_id
        FROM properties
        WHERE publisher_type = 'AGENT'
          AND published_at >= $1 AND published_at <= $2
        UNION
        SELECT pcm.sender_id
        FROM property_conversation_messages pcm
        INNER JOIN users u ON u.id = pcm.sender_id AND u.role = 'AGENT'
        WHERE pcm.created_at >= $1 AND pcm.created_at <= $2
          AND pcm.deleted_at IS NULL
        UNION
        SELECT pv.agent_id
        FROM property_visits pv
        WHERE pv.agent_id IS NOT NULL
          AND pv.created_at >= $1 AND pv.created_at <= $2
      ) active_agents
    `,
    [range.from, range.to],
  );
  return result.rows[0].count;
}

// ─── Properties ─────────────────────────────────────────────

export async function getPropertyStatusBreakdown() {
  const result = await db.query<{ status: string; count: number }>(
    `
      SELECT
        CASE
          WHEN published_at IS NULL THEN 'UNPUBLISHED'
          ELSE status
        END AS status,
        COUNT(*)::int AS count
      FROM properties
      GROUP BY 1
      ORDER BY count DESC
    `,
    [],
  );
  return result.rows;
}

export async function getPropertyOperationBreakdown() {
  const result = await db.query<{ operation_type: string; count: number }>(
    `
      SELECT operation_type, COUNT(*)::int AS count
      FROM properties
      GROUP BY operation_type
      ORDER BY count DESC
    `,
    [],
  );
  return result.rows;
}

export async function getPublicationMetrics() {
  const result = await db.query<{
    published: number;
    unpublished: number;
    publication_rate: number;
  }>(
    `
      SELECT
        COUNT(*) FILTER (WHERE published_at IS NOT NULL)::int AS published,
        COUNT(*) FILTER (WHERE published_at IS NULL)::int AS unpublished,
        CASE
          WHEN COUNT(*) = 0 THEN 0
          ELSE ROUND(
            100.0 * COUNT(*) FILTER (WHERE published_at IS NOT NULL) / COUNT(*),
            1
          )
        END::float AS publication_rate
      FROM properties
    `,
    [],
  );
  return result.rows[0];
}

// ─── Conversations ──────────────────────────────────────────

export async function getConversationMetrics(range: PeriodRange) {
  const result = await db.query<{
    total: number;
    client_conversations: number;
    internal_conversations: number;
    with_messages: number;
    without_messages: number;
    unanswered: number;
    avg_messages_per_conversation: number;
    active_30d: number;
  }>(
    `
      WITH msg_counts AS (
        SELECT conversation_id, COUNT(*)::int AS msg_count
        FROM property_conversation_messages
        WHERE deleted_at IS NULL
        GROUP BY conversation_id
      ),
      thirty_days_ago AS (
        SELECT ($1::timestamptz - interval '30 days') AS ts
      )
      SELECT
        (SELECT COUNT(*)::int FROM property_conversations) AS total,
        (SELECT COUNT(*)::int FROM property_conversations
          WHERE conversation_type = 'PROPERTY_CLIENT') AS client_conversations,
        (SELECT COUNT(*)::int FROM property_conversations
          WHERE conversation_type = 'PROPERTY_INTERNAL') AS internal_conversations,
        (SELECT COUNT(*)::int FROM property_conversations pc
          WHERE EXISTS (
            SELECT 1 FROM property_conversation_messages m
            WHERE m.conversation_id = pc.id AND m.deleted_at IS NULL
          )) AS with_messages,
        (SELECT COUNT(*)::int FROM property_conversations pc
          WHERE NOT EXISTS (
            SELECT 1 FROM property_conversation_messages m
            WHERE m.conversation_id = pc.id AND m.deleted_at IS NULL
          )) AS without_messages,
        (SELECT COUNT(*)::int FROM msg_counts WHERE msg_count = 1) AS unanswered,
        COALESCE((
          SELECT ROUND(AVG(msg_count)::numeric, 1) FROM msg_counts
        ), 0)::float AS avg_messages_per_conversation,
        (SELECT COUNT(*)::int FROM property_conversations
          WHERE last_message_at >= (SELECT ts FROM thirty_days_ago)) AS active_30d
    `,
    [range.to],
  );
  return result.rows[0];
}

// ─── Visits ─────────────────────────────────────────────────

export async function getVisitMetrics() {
  const result = await db.query<{
    scheduled: number;
    confirmed: number;
    completed: number;
    cancelled: number;
    rescheduled: number;
    completion_rate: number | null;
  }>(
    `
      SELECT
        COUNT(*) FILTER (WHERE status = 'SCHEDULED')::int AS scheduled,
        COUNT(*) FILTER (WHERE status = 'CONFIRMED')::int AS confirmed,
        COUNT(*) FILTER (WHERE status = 'COMPLETED')::int AS completed,
        COUNT(*) FILTER (WHERE status = 'CANCELLED')::int AS cancelled,
        COUNT(*) FILTER (WHERE status = 'RESCHEDULED')::int AS rescheduled,
        CASE
          WHEN COUNT(*) FILTER (WHERE status = 'CONFIRMED') = 0 THEN NULL
          ELSE ROUND(
            100.0 * COUNT(*) FILTER (WHERE status = 'COMPLETED')
            / COUNT(*) FILTER (WHERE status = 'CONFIRMED'),
            1
          )
        END::float AS completion_rate
      FROM property_visits
    `,
    [],
  );
  return result.rows[0];
}

// ─── Favorites ────────────────────────────────────────────

export type TopFavoritedProperty = {
  property_id: string;
  title: string | null;
  favorite_count: number;
};

export async function getFavoriteMetrics() {
  const totals = await db.query<{
    total_favorites: number;
    unique_users: number;
  }>(
    `
      SELECT
        COUNT(*)::int AS total_favorites,
        COUNT(DISTINCT user_id)::int AS unique_users
      FROM property_favorites
    `,
    [],
  );

  const top = await db.query<TopFavoritedProperty>(
    `
      SELECT
        pf.property_id,
        p.title,
        COUNT(*)::int AS favorite_count
      FROM property_favorites pf
      LEFT JOIN properties p ON p.id = pf.property_id
      GROUP BY pf.property_id, p.title
      ORDER BY favorite_count DESC
      LIMIT 5
    `,
    [],
  );

  return {
    ...totals.rows[0],
    top_properties: top.rows,
  };
}

// ─── Marketplace Health ─────────────────────────────────────

export async function getMarketplaceHealth(range: PeriodRange) {
  const result = await db.query<{
    active_owners: number;
    active_agents: number;
    active_properties: number;
    active_conversations: number;
    completed_visits: number;
    new_registrations: number;
  }>(
    `
      SELECT
        (
          SELECT COUNT(DISTINCT owner_id)::int
          FROM (
            SELECT owner_id FROM properties
            WHERE published_at >= $1 AND published_at <= $2
            UNION
            SELECT owner_id FROM properties
            WHERE created_at >= $1 AND created_at <= $2
          ) t
        ) AS active_owners,
        (
          SELECT COUNT(*)::int
          FROM (
            SELECT publisher_id AS agent_id FROM properties
            WHERE publisher_type = 'AGENT'
              AND published_at >= $1 AND published_at <= $2
            UNION
            SELECT pcm.sender_id FROM property_conversation_messages pcm
            INNER JOIN users u ON u.id = pcm.sender_id AND u.role = 'AGENT'
            WHERE pcm.created_at >= $1 AND pcm.created_at <= $2
              AND pcm.deleted_at IS NULL
            UNION
            SELECT pv.agent_id FROM property_visits pv
            WHERE pv.agent_id IS NOT NULL
              AND pv.created_at >= $1 AND pv.created_at <= $2
          ) active_agents
        ) AS active_agents,
        (
          SELECT COUNT(*)::int FROM properties
          WHERE published_at IS NOT NULL
            AND updated_at >= $1 AND updated_at <= $2
        ) AS active_properties,
        (
          SELECT COUNT(*)::int FROM property_conversations
          WHERE last_message_at >= $1 AND last_message_at <= $2
        ) AS active_conversations,
        (
          SELECT COUNT(*)::int FROM property_visits
          WHERE status = 'COMPLETED'
            AND completed_at >= $1 AND completed_at <= $2
        ) AS completed_visits,
        (
          SELECT COUNT(*)::int FROM users
          WHERE is_active = true
            AND created_at >= $1 AND created_at <= $2
        ) AS new_registrations
    `,
    [range.from, range.to],
  );
  return result.rows[0];
}

// ─── Executive Summary ──────────────────────────────────────

export async function getExecutiveSummary(range: PeriodRange) {
  const result = await db.query<{
    total_users: number;
    total_properties: number;
    total_conversations: number;
    total_visits: number;
    new_registrations: number;
    active_properties: number;
  }>(
    `
      SELECT
        (SELECT COUNT(*)::int FROM users WHERE is_active = true) AS total_users,
        (SELECT COUNT(*)::int FROM properties) AS total_properties,
        (SELECT COUNT(*)::int FROM property_conversations) AS total_conversations,
        (SELECT COUNT(*)::int FROM property_visits) AS total_visits,
        (SELECT COUNT(*)::int FROM users
          WHERE is_active = true AND created_at >= $1 AND created_at <= $2
        ) AS new_registrations,
        (SELECT COUNT(*)::int FROM properties
          WHERE published_at IS NOT NULL AND status = 'ACTIVE'
        ) AS active_properties
    `,
    [range.from, range.to],
  );
  return result.rows[0];
}

export async function getRegistrationsOverTime(range: PeriodRange) {
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
