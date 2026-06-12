import type { PoolClient } from "pg";

import { db } from "@/database/client";

import type { PropertyVisitRow } from "@/database/types/property-visits";

const VISIT_SELECT_FIELDS = `
  id,
  property_id,
  conversation_id,
  client_id,
  agent_id,
  created_by,
  status,
  scheduled_at,
  duration_minutes,
  notes,
  cancelled_reason,
  metadata,
  confirmed_at,
  completed_at,
  cancelled_at,
  created_at,
  updated_at
`;

export async function findVisitByIdRepository(
  visitId: string,
  client?: PoolClient,
): Promise<PropertyVisitRow | null> {
  const executor = client ?? db;

  const result = await executor.query<PropertyVisitRow>(
    `
      SELECT ${VISIT_SELECT_FIELDS}
      FROM property_visits
      WHERE id = $1
      LIMIT 1
    `,
    [visitId],
  );

  return result.rows[0] ?? null;
}

export async function insertVisitRepository(
  input: {
    propertyId: string;
    conversationId: string | null;
    clientId: string;
    agentId: string | null;
    createdBy: string;
    scheduledAt: string;
    durationMinutes: number;
    notes: string | null;
    metadata?: Record<string, unknown>;
  },
  client?: PoolClient,
) {
  const executor = client ?? db;

  const result = await executor.query<PropertyVisitRow>(
    `
      INSERT INTO property_visits (
        property_id,
        conversation_id,
        client_id,
        agent_id,
        created_by,
        scheduled_at,
        duration_minutes,
        notes,
        metadata
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING ${VISIT_SELECT_FIELDS}
    `,
    [
      input.propertyId,
      input.conversationId,
      input.clientId,
      input.agentId,
      input.createdBy,
      input.scheduledAt,
      input.durationMinutes,
      input.notes,
      JSON.stringify(input.metadata ?? {}),
    ],
  );

  return result.rows[0];
}

export async function updateVisitRepository(
  input: {
    visitId: string;
    status?: PropertyVisitRow["status"];
    scheduledAt?: string;
    durationMinutes?: number;
    notes?: string | null;
    cancelledReason?: string | null;
    metadata?: Record<string, unknown>;
    confirmedAt?: string | null;
    completedAt?: string | null;
    cancelledAt?: string | null;
  },
  client?: PoolClient,
) {
  const executor = client ?? db;
  const sets: string[] = ["updated_at = now()"];
  const params: unknown[] = [input.visitId];
  let paramIndex = 2;

  const addSet = (column: string, value: unknown) => {
    sets.push(`${column} = $${paramIndex}`);
    params.push(value);
    paramIndex += 1;
  };

  if (input.status !== undefined) {
    addSet("status", input.status);
  }

  if (input.scheduledAt !== undefined) {
    addSet("scheduled_at", input.scheduledAt);
  }

  if (input.durationMinutes !== undefined) {
    addSet("duration_minutes", input.durationMinutes);
  }

  if (input.notes !== undefined) {
    addSet("notes", input.notes);
  }

  if (input.cancelledReason !== undefined) {
    addSet("cancelled_reason", input.cancelledReason);
  }

  if (input.metadata !== undefined) {
    addSet("metadata", JSON.stringify(input.metadata));
  }

  if (input.confirmedAt !== undefined) {
    addSet("confirmed_at", input.confirmedAt);
  }

  if (input.completedAt !== undefined) {
    addSet("completed_at", input.completedAt);
  }

  if (input.cancelledAt !== undefined) {
    addSet("cancelled_at", input.cancelledAt);
  }

  const result = await executor.query<PropertyVisitRow>(
    `
      UPDATE property_visits
      SET ${sets.join(", ")}
      WHERE id = $1
      RETURNING ${VISIT_SELECT_FIELDS}
    `,
    params,
  );

  return result.rows[0] ?? null;
}

export async function listVisitsRepository(input: {
  userId: string;
  role: "CLIENT" | "OWNER" | "AGENT";
  segment: "today" | "upcoming" | "calendar";
  from?: string;
  to?: string;
}) {
  const conditions: string[] = [];
  const params: unknown[] = [input.userId];
  let paramIndex = 2;

  if (input.role === "CLIENT") {
    conditions.push(`pv.client_id = $1`);
  } else if (input.role === "AGENT") {
    conditions.push(`pv.agent_id = $1`);
  } else {
    conditions.push(`
      EXISTS (
        SELECT 1
        FROM properties p
        WHERE p.id = pv.property_id
          AND p.owner_id = $1
      )
    `);
  }

  const now = new Date();
  const todayStart = new Date(now);
  todayStart.setUTCHours(0, 0, 0, 0);
  const todayEnd = new Date(now);
  todayEnd.setUTCHours(23, 59, 59, 999);

  if (input.segment === "today") {
    conditions.push(`pv.scheduled_at >= $${paramIndex}`);
    params.push(todayStart.toISOString());
    paramIndex += 1;
    conditions.push(`pv.scheduled_at <= $${paramIndex}`);
    params.push(todayEnd.toISOString());
    paramIndex += 1;
    conditions.push(`pv.status IN ('SCHEDULED', 'CONFIRMED', 'RESCHEDULED')`);
  } else if (input.segment === "upcoming") {
    conditions.push(`pv.scheduled_at >= $${paramIndex}`);
    params.push(now.toISOString());
    paramIndex += 1;
    conditions.push(`pv.status IN ('SCHEDULED', 'CONFIRMED', 'RESCHEDULED')`);
  } else {
    if (input.from) {
      conditions.push(`pv.scheduled_at >= $${paramIndex}`);
      params.push(input.from);
      paramIndex += 1;
    }

    if (input.to) {
      conditions.push(`pv.scheduled_at <= $${paramIndex}`);
      params.push(input.to);
      paramIndex += 1;
    }
  }

  const result = await db.query<PropertyVisitRow>(
    `
      SELECT ${VISIT_SELECT_FIELDS.split(",").map((field) => `pv.${field.trim()}`).join(", ")}
      FROM property_visits pv
      WHERE ${conditions.join(" AND ")}
      ORDER BY pv.scheduled_at ASC
    `,
    params,
  );

  return result.rows;
}

export async function countVisitsByStatusRepository(input: {
  userId: string;
  role: "OWNER" | "AGENT";
  status?: PropertyVisitRow["status"];
  from?: string;
  to?: string;
}) {
  const conditions: string[] = [];
  const params: unknown[] = [input.userId];
  let paramIndex = 2;

  if (input.role === "AGENT") {
    conditions.push(`pv.agent_id = $1`);
  } else {
    conditions.push(`
      EXISTS (
        SELECT 1
        FROM properties p
        WHERE p.id = pv.property_id
          AND p.owner_id = $1
      )
    `);
  }

  if (input.status) {
    conditions.push(`pv.status = $${paramIndex}`);
    params.push(input.status);
    paramIndex += 1;
  }

  if (input.from) {
    conditions.push(`pv.created_at >= $${paramIndex}`);
    params.push(input.from);
    paramIndex += 1;
  }

  if (input.to) {
    conditions.push(`pv.created_at <= $${paramIndex}`);
    params.push(input.to);
    paramIndex += 1;
  }

  const result = await db.query<{ count: string }>(
    `
      SELECT COUNT(*)::text AS count
      FROM property_visits pv
      WHERE ${conditions.join(" AND ")}
    `,
    params,
  );

  return Number(result.rows[0]?.count ?? 0);
}

export async function countVisitsByPropertyRepository(input: {
  userId: string;
  role: "OWNER" | "AGENT";
  from?: string;
  to?: string;
}) {
  const conditions: string[] = [];
  const params: unknown[] = [input.userId];
  let paramIndex = 2;

  if (input.role === "AGENT") {
    conditions.push(`pv.agent_id = $1`);
  } else {
    conditions.push(`
      EXISTS (
        SELECT 1
        FROM properties p
        WHERE p.id = pv.property_id
          AND p.owner_id = $1
      )
    `);
  }

  if (input.from) {
    conditions.push(`pv.created_at >= $${paramIndex}`);
    params.push(input.from);
    paramIndex += 1;
  }

  if (input.to) {
    conditions.push(`pv.created_at <= $${paramIndex}`);
    params.push(input.to);
    paramIndex += 1;
  }

  const result = await db.query<{
    property_id: string;
    property_title: string | null;
    count: string;
  }>(
    `
      SELECT
        pv.property_id,
        p.title AS property_title,
        COUNT(*)::text AS count
      FROM property_visits pv
      INNER JOIN properties p
        ON p.id = pv.property_id
      WHERE ${conditions.join(" AND ")}
      GROUP BY pv.property_id, p.title
      ORDER BY COUNT(*) DESC
    `,
    params,
  );

  return result.rows.map((row) => ({
    propertyId: row.property_id,
    propertyTitle: row.property_title,
    count: Number(row.count),
  }));
}

export async function countVisitsByAgentRepository(input: {
  ownerId: string;
  from?: string;
  to?: string;
}) {
  const conditions = [
    `
      EXISTS (
        SELECT 1
        FROM properties p
        WHERE p.id = pv.property_id
          AND p.owner_id = $1
      )
    `,
    `pv.agent_id IS NOT NULL`,
  ];
  const params: unknown[] = [input.ownerId];
  let paramIndex = 2;

  if (input.from) {
    conditions.push(`pv.created_at >= $${paramIndex}`);
    params.push(input.from);
    paramIndex += 1;
  }

  if (input.to) {
    conditions.push(`pv.created_at <= $${paramIndex}`);
    params.push(input.to);
    paramIndex += 1;
  }

  const result = await db.query<{
    agent_id: string;
    agent_name: string | null;
    count: string;
  }>(
    `
      SELECT
        pv.agent_id,
        NULLIF(TRIM(CONCAT(u.first_name, ' ', u.last_name)), '') AS agent_name,
        COUNT(*)::text AS count
      FROM property_visits pv
      INNER JOIN users u
        ON u.id = pv.agent_id
      WHERE ${conditions.join(" AND ")}
      GROUP BY pv.agent_id, u.first_name, u.last_name
      ORDER BY COUNT(*) DESC
    `,
    params,
  );

  return result.rows.map((row) => ({
    agentId: row.agent_id,
    agentName: row.agent_name,
    count: Number(row.count),
  }));
}
