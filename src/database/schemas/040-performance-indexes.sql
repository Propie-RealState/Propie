-- Phase 1 performance indexes (do not modify historical migrations).

-- Replace stale partial index that targeted status = 'PUBLISHED' (removed in 035).
DROP INDEX IF EXISTS idx_properties_published_geo_filters;

CREATE INDEX IF NOT EXISTS idx_properties_active_geo_filters
ON properties (
  operation_type,
  property_type,
  price,
  status
)
WHERE published_at IS NOT NULL
  AND status IN ('ACTIVE', 'PAUSED', 'RESERVED');

CREATE INDEX IF NOT EXISTS idx_properties_published_at
ON properties (published_at DESC)
WHERE published_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_property_amenities_property_id
ON property_amenities (property_id);
