import { db } from "@/database/client";

export type AgentPropertyStats = {
  total_worked_properties: number;
  active_properties: number;
  completed_properties: number;
};

/**
 * Agent property stats aligned with "Mis propiedades":
 * owned listings plus properties where the agent was enabled (ACCEPTED).
 * - Trabajadas: all managed properties (draft, published, paused, archived)
 * - Activas: published only
 * - Cerradas: paused/archived
 */
export async function getAgentPropertyStatsRepository(
  agentId: string,
): Promise<AgentPropertyStats> {
  const result = await db.query(
    `
      WITH agent_properties AS (
        SELECT DISTINCT
          p.id,
          p.status
        FROM properties p
        WHERE p.owner_id = $1
          OR EXISTS (
            SELECT 1
            FROM agent_applications aa
            WHERE aa.property_id = p.id
              AND aa.agent_id = $1
              AND aa.status = 'ACCEPTED'
          )
      )
      SELECT
        COUNT(*)::int AS total_worked_properties,
        COUNT(*) FILTER (WHERE status = 'PUBLISHED')::int AS active_properties,
        COUNT(*) FILTER (WHERE status IN ('PAUSED', 'ARCHIVED'))::int AS completed_properties
      FROM agent_properties
    `,
    [agentId],
  );

  const row = result.rows[0];

  return {
    total_worked_properties: row?.total_worked_properties ?? 0,
    active_properties: row?.active_properties ?? 0,
    completed_properties: row?.completed_properties ?? 0,
  };
}
