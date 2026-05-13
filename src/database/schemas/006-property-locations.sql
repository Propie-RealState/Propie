-- =============================================================================
-- property locations
-- =============================================================================

CREATE TABLE IF NOT EXISTS property_locations (
    property_id UUID PRIMARY KEY,

    country TEXT NOT NULL,
    city TEXT NOT NULL,

    address TEXT,

    latitude NUMERIC(10,7) NOT NULL,
    longitude NUMERIC(10,7) NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT fk_property_locations_property
        FOREIGN KEY (property_id)
        REFERENCES properties(id)
        ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_property_locations_city
ON property_locations (city);

CREATE INDEX IF NOT EXISTS idx_property_locations_coordinates
ON property_locations (latitude, longitude);