-- Phase 3 keyset pagination support (additive only — safe to re-run).
--
-- The explore listing orders by (created_at DESC, id DESC) and the cursor
-- predicate is a row-value comparison on the same key. This partial composite
-- index covers both the ordering and the visibility filter, so the keyset
-- scan can walk the index in order instead of sorting the full published set.
CREATE INDEX IF NOT EXISTS idx_properties_explore_keyset
ON properties (created_at DESC, id DESC)
WHERE published_at IS NOT NULL
  AND status IN ('ACTIVE', 'PAUSED', 'RESERVED');
