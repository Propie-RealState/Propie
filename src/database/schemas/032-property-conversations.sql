-- =============================================================================
-- property conversations
-- =============================================================================

CREATE TABLE IF NOT EXISTS property_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    property_id UUID NOT NULL,
    client_id UUID NOT NULL,

    status TEXT NOT NULL DEFAULT 'OPEN'
        CHECK (status IN ('OPEN', 'ARCHIVED', 'CLOSED')),

    assigned_agent_id UUID NULL,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    lead_score NUMERIC(5,2) NULL,

    last_message_at TIMESTAMPTZ NULL,
    last_message_preview TEXT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT fk_pc_property
        FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
    CONSTRAINT fk_pc_client
        FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_pc_assigned_agent
        FOREIGN KEY (assigned_agent_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_pc_unique_property_client
ON property_conversations (property_id, client_id);

CREATE INDEX IF NOT EXISTS idx_pc_property_id
ON property_conversations (property_id);

CREATE INDEX IF NOT EXISTS idx_pc_client_id
ON property_conversations (client_id);

CREATE INDEX IF NOT EXISTS idx_pc_last_message_at
ON property_conversations (last_message_at DESC NULLS LAST);

CREATE TABLE IF NOT EXISTS property_conversation_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    conversation_id UUID NOT NULL,
    sender_id UUID NOT NULL,

    sender_role TEXT NOT NULL
        CHECK (sender_role IN ('CLIENT', 'OWNER', 'AGENT')),
    content_type TEXT NOT NULL DEFAULT 'TEXT'
        CHECK (content_type IN ('TEXT', 'SYSTEM')),
    body TEXT NOT NULL,

    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    edited_at TIMESTAMPTZ NULL,
    deleted_at TIMESTAMPTZ NULL,

    CONSTRAINT fk_pcm_conversation
        FOREIGN KEY (conversation_id)
        REFERENCES property_conversations(id) ON DELETE CASCADE,
    CONSTRAINT fk_pcm_sender
        FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_pcm_conversation_created
ON property_conversation_messages (conversation_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_pcm_sender_id
ON property_conversation_messages (sender_id);

CREATE TABLE IF NOT EXISTS property_conversation_participant_states (
    conversation_id UUID NOT NULL,
    user_id UUID NOT NULL,

    unread_count INTEGER NOT NULL DEFAULT 0,
    last_read_at TIMESTAMPTZ NULL,
    last_read_message_id UUID NULL,

    participant_role TEXT NOT NULL
        CHECK (participant_role IN ('CLIENT', 'OWNER', 'AGENT')),
    revoked_at TIMESTAMPTZ NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    PRIMARY KEY (conversation_id, user_id),

    CONSTRAINT fk_pcps_conversation
        FOREIGN KEY (conversation_id)
        REFERENCES property_conversations(id) ON DELETE CASCADE,
    CONSTRAINT fk_pcps_user
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_pcps_last_read_message
        FOREIGN KEY (last_read_message_id)
        REFERENCES property_conversation_messages(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_pcps_user_unread
ON property_conversation_participant_states (user_id, unread_count)
WHERE unread_count > 0 AND revoked_at IS NULL;
