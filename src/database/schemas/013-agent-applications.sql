-- =============================================================================
-- agent applications
-- =============================================================================

CREATE TABLE IF NOT EXISTS agent_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    property_id UUID NOT NULL,

    agent_id UUID NOT NULL,

    message TEXT,

    status TEXT NOT NULL DEFAULT 'PENDING',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT fk_agent_applications_property
        FOREIGN KEY (property_id)
        REFERENCES properties(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_agent_applications_agent
        FOREIGN KEY (agent_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT chk_agent_application_status
        CHECK (
            status IN (
                'PENDING',
                'ACCEPTED',
                'REJECTED',
                'CANCELLED'
            )
        )
);



-- =============================================================================
-- indexes
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_agent_applications_property_id
ON agent_applications (property_id);

CREATE INDEX IF NOT EXISTS idx_agent_applications_agent_id
ON agent_applications (agent_id);

CREATE INDEX IF NOT EXISTS idx_agent_applications_status
ON agent_applications (status);

CREATE INDEX IF NOT EXISTS idx_agent_applications_created_at
ON agent_applications (created_at DESC);



-- =============================================================================
-- prevent duplicate active applications
-- =============================================================================

CREATE UNIQUE INDEX IF NOT EXISTS idx_agent_applications_unique_pending
ON agent_applications (
    property_id,
    agent_id
)
WHERE status = 'PENDING';