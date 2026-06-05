-- =============================================================================
-- property favorites (server-side persistence for notification targeting)
-- =============================================================================

CREATE TABLE IF NOT EXISTS property_favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL,
    property_id UUID NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT fk_property_favorites_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_property_favorites_property
        FOREIGN KEY (property_id)
        REFERENCES properties(id)
        ON DELETE CASCADE,

    CONSTRAINT uq_property_favorites_user_property
        UNIQUE (user_id, property_id)
);

CREATE INDEX IF NOT EXISTS idx_property_favorites_user_id
ON property_favorites (user_id);

CREATE INDEX IF NOT EXISTS idx_property_favorites_property_id
ON property_favorites (property_id);

CREATE INDEX IF NOT EXISTS idx_property_favorites_created_at
ON property_favorites (created_at DESC);
