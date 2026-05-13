-- =============================================================================
-- sessions
-- =============================================================================

CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL,

    refresh_token_hash TEXT NOT NULL UNIQUE,

    ip_address TEXT,

    user_agent TEXT,

    expires_at TIMESTAMPTZ NOT NULL,

    is_revoked BOOLEAN NOT NULL DEFAULT false,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT fk_sessions_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);



-- =============================================================================
-- indexes
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_sessions_user_id
ON sessions (user_id);

CREATE INDEX IF NOT EXISTS idx_sessions_expires_at
ON sessions (expires_at);

CREATE INDEX IF NOT EXISTS idx_sessions_is_revoked
ON sessions (is_revoked);

CREATE INDEX IF NOT EXISTS idx_sessions_created_at
ON sessions (created_at DESC);