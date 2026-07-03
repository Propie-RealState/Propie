-- Content hashes enable idempotent property media uploads (retry-safe).

ALTER TABLE property_images
  ADD COLUMN IF NOT EXISTS content_hash TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_property_images_property_content_hash
  ON property_images (property_id, content_hash)
  WHERE content_hash IS NOT NULL;

ALTER TABLE property_videos
  ADD COLUMN IF NOT EXISTS content_hash TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_property_videos_property_content_hash
  ON property_videos (property_id, content_hash)
  WHERE content_hash IS NOT NULL;
