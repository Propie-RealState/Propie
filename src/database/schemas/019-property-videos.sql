CREATE TABLE IF NOT EXISTS property_videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,

  video_url TEXT NOT NULL,

  display_order INTEGER NOT NULL DEFAULT 0,

  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_property_videos_property_id
ON property_videos(property_id);

CREATE INDEX IF NOT EXISTS idx_property_videos_display_order
ON property_videos(display_order);