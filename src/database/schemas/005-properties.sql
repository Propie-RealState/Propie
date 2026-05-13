-- =============================================================================
-- properties
-- =============================================================================

CREATE TABLE IF NOT EXISTS properties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    owner_id UUID NOT NULL,

    title TEXT NOT NULL,
    description TEXT,

    property_type TEXT NOT NULL,
    operation_type TEXT NOT NULL,

    price NUMERIC(12,2) NOT NULL,

    bedrooms INTEGER,
    bathrooms INTEGER,

    area_m2 NUMERIC(10,2),

    is_published BOOLEAN NOT NULL DEFAULT true,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT fk_properties_owner
        FOREIGN KEY (owner_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_properties_owner_id
ON properties (owner_id);

CREATE INDEX IF NOT EXISTS idx_properties_type
ON properties (property_type);

CREATE INDEX IF NOT EXISTS idx_properties_operation
ON properties (operation_type);

CREATE INDEX IF NOT EXISTS idx_properties_price
ON properties (price);

CREATE INDEX IF NOT EXISTS idx_properties_published
ON properties (is_published);