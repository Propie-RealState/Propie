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
SET coordinates =
  ST_SetSRID(
    ST_MakePoint(
      longitude::double precision,
      latitude::double precision
    ),
    4326
  )::geography
WHERE coordinates IS NULL
  AND latitude IS NOT NULL
  AND longitude IS NOT NULL
  AND latitude BETWEEN -90 AND 90
  AND longitude BETWEEN -180 AND 180;



-- =============================================================================
-- geospatial indexes
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_property_locations_coordinates_geography
ON property_locations
USING GIST (coordinates)
WHERE coordinates IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_property_locations_coordinates_geometry
ON property_locations
USING GIST ((coordinates::geometry))
WHERE coordinates IS NOT NULL;



-- =============================================================================
-- map filter indexes
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_properties_published_geo_filters
ON properties (
  status,
  operation_type,
  property_type,
  price
)
WHERE status = 'PUBLISHED';

CREATE INDEX IF NOT EXISTS idx_property_locations_city_province
ON property_locations (
  city,
  province
);
