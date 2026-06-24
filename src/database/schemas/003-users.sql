-- =============================================================================
-- users
-- =============================================================================

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,

    email TEXT NOT NULL UNIQUE,
    phone TEXT,

    password_hash TEXT NOT NULL,

    role TEXT NOT NULL DEFAULT 'CLIENT' CHECK (role IN ('CLIENT', 'OWNER', 'AGENT', 'ADMIN')),

    avatar_url TEXT,

    is_verified BOOLEAN NOT NULL DEFAULT false,
    is_active BOOLEAN NOT NULL DEFAULT true,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    
);

CREATE INDEX IF NOT EXISTS idx_users_email
ON users (email);

CREATE INDEX IF NOT EXISTS idx_users_created_at
ON users (created_at DESC);