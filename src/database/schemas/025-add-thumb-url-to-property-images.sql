-- =============================================================================
-- Add thumb_url to property_images
-- Stores the 400px WebP thumbnail URL alongside the full-size image_url.
-- Nullable so existing rows are unaffected.
-- =============================================================================

ALTER TABLE property_images
  ADD COLUMN IF NOT EXISTS thumb_url TEXT;
