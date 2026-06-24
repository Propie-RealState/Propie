-- =============================================================================
-- roles
-- =============================================================================

CREATE TABLE IF NOT EXISTS roles (
    id SMALLSERIAL PRIMARY KEY,

    code TEXT NOT NULL UNIQUE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO roles (code)
VALUES
    ('OWNER'),
    ('AGENT'),
    ('CLIENT'),
    ('ADMIN')
ON CONFLICT (code) DO NOTHING;