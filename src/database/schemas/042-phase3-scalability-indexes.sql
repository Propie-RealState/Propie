-- Phase 3 scalability indexes (additive only — safe to re-run).
-- Rationale documented per index; each targets a query that shows up
-- on hot read paths (explore list, map covers, property detail, favorites).

-- Explore / "my properties" list join: pi.property_id = p.id AND pi.is_cover = true.
-- A partial index keeps only cover rows, so the cover lookup is a single
-- index probe per property instead of scanning all images for that property.
CREATE INDEX IF NOT EXISTS idx_property_images_cover
ON property_images (property_id)
WHERE is_cover = true;

-- Property detail media subquery + map cover LATERAL both read a property's
-- images ordered by (display_order, created_at). This composite lets Postgres
-- return them pre-sorted without a separate sort step.
CREATE INDEX IF NOT EXISTS idx_property_images_property_order
ON property_images (property_id, display_order, created_at);

-- Property detail "agents" subquery and getMyProperties EXISTS both filter
-- agent_applications by (property_id, status = 'ACCEPTED'). Composite avoids
-- intersecting two single-column bitmaps.
CREATE INDEX IF NOT EXISTS idx_agent_applications_property_status
ON agent_applications (property_id, status);

-- Favorites listing is ordered by created_at DESC per user. Composite serves
-- both the user filter and the ORDER BY from one index (keyset-pagination ready).
CREATE INDEX IF NOT EXISTS idx_property_favorites_user_created
ON property_favorites (user_id, created_at DESC);
