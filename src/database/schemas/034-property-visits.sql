-- =============================================================================
-- property visits (calendar & scheduling)
-- =============================================================================

CREATE TABLE IF NOT EXISTS property_visits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    property_id UUID NOT NULL,
    conversation_id UUID NULL,
    client_id UUID NOT NULL,
    agent_id UUID NULL,
    created_by UUID NOT NULL,

    status TEXT NOT NULL DEFAULT 'SCHEDULED'
        CHECK (status IN (
            'SCHEDULED',
            'CONFIRMED',
            'COMPLETED',
            'CANCELLED',
            'RESCHEDULED'
        )),

    scheduled_at TIMESTAMPTZ NOT NULL,
    duration_minutes INTEGER NOT NULL DEFAULT 30
        CHECK (duration_minutes BETWEEN 5 AND 480),

    notes TEXT NULL,
    cancelled_reason TEXT NULL,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,

    confirmed_at TIMESTAMPTZ NULL,
    completed_at TIMESTAMPTZ NULL,
    cancelled_at TIMESTAMPTZ NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT fk_pv_property
        FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
    CONSTRAINT fk_pv_conversation
        FOREIGN KEY (conversation_id)
        REFERENCES property_conversations(id) ON DELETE SET NULL,
    CONSTRAINT fk_pv_client
        FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_pv_agent
        FOREIGN KEY (agent_id) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_pv_created_by
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_pv_property_scheduled
ON property_visits (property_id, scheduled_at);

CREATE INDEX IF NOT EXISTS idx_pv_client_scheduled
ON property_visits (client_id, scheduled_at);

CREATE INDEX IF NOT EXISTS idx_pv_agent_scheduled
ON property_visits (agent_id, scheduled_at);

CREATE INDEX IF NOT EXISTS idx_pv_conversation_id
ON property_visits (conversation_id);

CREATE INDEX IF NOT EXISTS idx_pv_active_scheduled
ON property_visits (scheduled_at)
WHERE status IN ('SCHEDULED', 'CONFIRMED', 'RESCHEDULED');

-- =============================================================================
-- visit activity history
-- =============================================================================

CREATE TABLE IF NOT EXISTS property_visit_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    visit_id UUID NOT NULL,
    actor_id UUID NULL,

    actor_role TEXT NULL
        CHECK (actor_role IN ('CLIENT', 'OWNER', 'AGENT')),

    event_type TEXT NOT NULL
        CHECK (event_type IN (
            'CREATED',
            'CONFIRMED',
            'RESCHEDULED',
            'CANCELLED',
            'COMPLETED'
        )),

    payload JSONB NOT NULL DEFAULT '{}'::jsonb,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT fk_pve_visit
        FOREIGN KEY (visit_id)
        REFERENCES property_visits(id) ON DELETE CASCADE,
    CONSTRAINT fk_pve_actor
        FOREIGN KEY (actor_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_pve_visit_created
ON property_visit_events (visit_id, created_at ASC);

-- =============================================================================
-- visit reminders (24h / 2h / 30m before)
-- =============================================================================

CREATE TABLE IF NOT EXISTS property_visit_reminders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    visit_id UUID NOT NULL,

    offset_minutes INTEGER NOT NULL,
    remind_at TIMESTAMPTZ NOT NULL,
    sent_at TIMESTAMPTZ NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT fk_pvr_visit
        FOREIGN KEY (visit_id)
        REFERENCES property_visits(id) ON DELETE CASCADE,
    CONSTRAINT uq_pvr_visit_offset
        UNIQUE (visit_id, offset_minutes)
);

CREATE INDEX IF NOT EXISTS idx_pvr_due
ON property_visit_reminders (remind_at)
WHERE sent_at IS NULL;
