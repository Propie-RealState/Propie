-- =============================================================================
-- notifications
-- =============================================================================

CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL,

    type TEXT NOT NULL,

    title TEXT NOT NULL,
    body TEXT NOT NULL,

    entity_type TEXT,
    entity_id UUID,

    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,

    read_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT fk_notifications_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id
ON notifications (user_id);

CREATE INDEX IF NOT EXISTS idx_notifications_user_unread
ON notifications (user_id, created_at DESC)
WHERE read_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_notifications_user_created_at
ON notifications (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_type
ON notifications (type);

CREATE INDEX IF NOT EXISTS idx_notifications_entity
ON notifications (entity_type, entity_id);
