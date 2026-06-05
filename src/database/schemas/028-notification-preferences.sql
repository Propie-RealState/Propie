-- =============================================================================
-- notification preferences (geo alerts + per-type toggles)
-- =============================================================================

CREATE TABLE IF NOT EXISTS notification_preferences (
    user_id UUID PRIMARY KEY,

    nearby_enabled BOOLEAN NOT NULL DEFAULT true,
    favorites_enabled BOOLEAN NOT NULL DEFAULT true,
    messages_enabled BOOLEAN NOT NULL DEFAULT true,
    agent_applications_enabled BOOLEAN NOT NULL DEFAULT true,

    latitude NUMERIC(10, 7),
    longitude NUMERIC(10, 7),
    coordinates GEOGRAPHY(POINT, 4326),

    radius_meters INTEGER NOT NULL DEFAULT 5000
        CHECK (radius_meters > 0 AND radius_meters <= 100000),

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT fk_notification_preferences_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_notification_preferences_coordinates
ON notification_preferences
USING GIST (coordinates)
WHERE coordinates IS NOT NULL AND nearby_enabled = true;
