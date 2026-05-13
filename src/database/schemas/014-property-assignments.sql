-- =============================================================================
-- property assignments
-- =============================================================================

CREATE TABLE IF NOT EXISTS property_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    property_id UUID NOT NULL,

    agent_id UUID NOT NULL,

    assigned_by UUID NOT NULL,

    is_active BOOLEAN NOT NULL DEFAULT true,

    assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    ended_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT fk_property_assignments_property
        FOREIGN KEY (property_id)
        REFERENCES properties(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_property_assignments_agent
        FOREIGN KEY (agent_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_property_assignments_assigned_by
        FOREIGN KEY (assigned_by)
        REFERENCES users(id)
        ON DELETE CASCADE
);



-- =============================================================================
-- indexes
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_property_assignments_property_id
ON property_assignments (property_id);

CREATE INDEX IF NOT EXISTS idx_property_assignments_agent_id
ON property_assignments (agent_id);

CREATE INDEX IF NOT EXISTS idx_property_assignments_active
ON property_assignments (is_active);

CREATE INDEX IF NOT EXISTS idx_property_assignments_assigned_at
ON property_assignments (assigned_at DESC);



-- =============================================================================
-- one active assignment per property
-- =============================================================================

CREATE UNIQUE INDEX IF NOT EXISTS idx_property_assignments_unique_active
ON property_assignments (property_id)
WHERE is_active = true;