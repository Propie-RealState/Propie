-- =============================================================================
-- agent_reviews
-- =============================================================================

CREATE TABLE IF NOT EXISTS agent_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  agent_id UUID NOT NULL,

  reviewer_user_id UUID NOT NULL,

  property_id UUID NOT NULL,

  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),

  comment TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT fk_agent_reviews_agent
    FOREIGN KEY (agent_id)
    REFERENCES users(id)
    ON DELETE CASCADE,

  CONSTRAINT fk_agent_reviews_reviewer
    FOREIGN KEY (reviewer_user_id)
    REFERENCES users(id)
    ON DELETE CASCADE,

  CONSTRAINT fk_agent_reviews_property
    FOREIGN KEY (property_id)
    REFERENCES properties(id)
    ON DELETE CASCADE,

  -- One review per reviewer per agent per property
  CONSTRAINT uq_agent_review_per_property
    UNIQUE (reviewer_user_id, agent_id, property_id)
);



-- =============================================================================
-- indexes
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_agent_reviews_agent_id
ON agent_reviews (agent_id);

CREATE INDEX IF NOT EXISTS idx_agent_reviews_reviewer
ON agent_reviews (reviewer_user_id);

CREATE INDEX IF NOT EXISTS idx_agent_reviews_property
ON agent_reviews (property_id);

CREATE INDEX IF NOT EXISTS idx_agent_reviews_created_at
ON agent_reviews (created_at DESC);
