-- =============================================================================
-- add postgis coordinates to property locations
-- =============================================================================

ALTER TABLE property_locations
ADD COLUMN IF NOT EXISTS coordinates
GEOGRAPHY(POINT, 4326);



-- =============================================================================
-- populate coordinates from existing latitude/longitude
-- =============================================================================

UPDATE property_locations
SET coordinates = ST_SetSRID(
    ST_MakePoint(
        longitude,
        latitude
    ),
    4326
)::geography
WHERE coordinates IS NULL;



-- =============================================================================
-- make coordinates required
-- =============================================================================

ALTER TABLE property_locations
ALTER COLUMN coordinates
SET NOT NULL;



-- =============================================================================
-- indexes
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_property_locations_coordinates
ON property_locations
USING GIST (coordinates);