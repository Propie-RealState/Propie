CREATE TABLE IF NOT EXISTS property_locations (
    property_id UUID PRIMARY KEY,

    country TEXT,
    province TEXT,
    city TEXT,
    neighborhood TEXT,

    address TEXT,

    latitude NUMERIC(10,7),
    longitude NUMERIC(10,7),

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT fk_property_locations_property
        FOREIGN KEY (property_id)
        REFERENCES properties(id)
        ON DELETE CASCADE
);