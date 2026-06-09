-- =============================================================================
-- Allow multiple active agent assignments per property
-- =============================================================================

DROP INDEX IF EXISTS idx_property_assignments_unique_active;

CREATE UNIQUE INDEX IF NOT EXISTS idx_property_assignments_unique_active_agent
ON property_assignments (property_id, agent_id)
WHERE is_active = true;
