-- =============================================================================
-- property conversation types (CLIENT + INTERNAL unification)
-- =============================================================================

ALTER TABLE property_conversations
  ADD COLUMN IF NOT EXISTS conversation_type TEXT NOT NULL DEFAULT 'PROPERTY_CLIENT'
    CHECK (conversation_type IN ('PROPERTY_CLIENT', 'PROPERTY_INTERNAL'));

ALTER TABLE property_conversations
  ALTER COLUMN client_id DROP NOT NULL;

ALTER TABLE property_conversations
  ADD COLUMN IF NOT EXISTS internal_agent_id UUID NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'fk_pc_internal_agent'
  ) THEN
    ALTER TABLE property_conversations
      ADD CONSTRAINT fk_pc_internal_agent
        FOREIGN KEY (internal_agent_id) REFERENCES users(id) ON DELETE SET NULL;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'chk_pc_type_participants'
  ) THEN
    ALTER TABLE property_conversations
      ADD CONSTRAINT chk_pc_type_participants CHECK (
        (
          conversation_type = 'PROPERTY_CLIENT'
          AND client_id IS NOT NULL
          AND internal_agent_id IS NULL
        )
        OR (
          conversation_type = 'PROPERTY_INTERNAL'
          AND client_id IS NULL
          AND internal_agent_id IS NOT NULL
        )
      );
  END IF;
END $$;

DROP INDEX IF EXISTS idx_pc_unique_property_client;

CREATE UNIQUE INDEX IF NOT EXISTS idx_pc_unique_property_client
ON property_conversations (property_id, client_id)
WHERE conversation_type = 'PROPERTY_CLIENT' AND client_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_pc_unique_property_internal
ON property_conversations (property_id, internal_agent_id)
WHERE conversation_type = 'PROPERTY_INTERNAL' AND internal_agent_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_pc_internal_agent_id
ON property_conversations (internal_agent_id)
WHERE internal_agent_id IS NOT NULL;
