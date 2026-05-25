CREATE TABLE property_commercialization (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  property_id UUID NOT NULL
    REFERENCES properties(id)
    ON DELETE CASCADE,

  commercialization_type TEXT NOT NULL,

  manual_approval BOOLEAN NOT NULL DEFAULT false,

  allow_chat BOOLEAN NOT NULL DEFAULT true,

  shared_calendar BOOLEAN NOT NULL DEFAULT false,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE(property_id)
);