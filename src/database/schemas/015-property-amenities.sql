CREATE TABLE property_amenities (

  id UUID PRIMARY KEY
  DEFAULT gen_random_uuid(),

  property_id UUID NOT NULL
  REFERENCES properties(id)
  ON DELETE CASCADE,

  amenity TEXT NOT NULL,

  created_at TIMESTAMPTZ NOT NULL
  DEFAULT now()
);