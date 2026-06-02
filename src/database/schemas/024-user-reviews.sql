-- =============================================================================
-- user_reviews  —  bidirectional review system (owner ↔ agent)
-- Replaces agent_reviews conceptually. agent_reviews kept for reference.
-- =============================================================================

CREATE TABLE IF NOT EXISTS user_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Who is being reviewed
  target_user_id UUID NOT NULL,

  -- Who is writing the review
  reviewer_user_id UUID NOT NULL,

  -- Property that created the relationship context
  property_id UUID NOT NULL,

  -- Role of the reviewer at time of review
  reviewer_role TEXT NOT NULL CHECK (reviewer_role IN ('OWNER', 'AGENT', 'CLIENT')),

  -- Role of the person being reviewed
  target_role TEXT NOT NULL CHECK (target_role IN ('OWNER', 'AGENT', 'CLIENT')),

  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),

  comment TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT fk_user_reviews_target
    FOREIGN KEY (target_user_id) REFERENCES users(id) ON DELETE CASCADE,

  CONSTRAINT fk_user_reviews_reviewer
    FOREIGN KEY (reviewer_user_id) REFERENCES users(id) ON DELETE CASCADE,

  CONSTRAINT fk_user_reviews_property
    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,

  -- No self-reviews
  CONSTRAINT no_self_review
    CHECK (target_user_id != reviewer_user_id),

  -- One review per reviewer per target per property
  CONSTRAINT uq_review_per_relationship
    UNIQUE (reviewer_user_id, target_user_id, property_id)
);



-- =============================================================================
-- indexes
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_user_reviews_target
ON user_reviews (target_user_id);

CREATE INDEX IF NOT EXISTS idx_user_reviews_reviewer
ON user_reviews (reviewer_user_id);

CREATE INDEX IF NOT EXISTS idx_user_reviews_property
ON user_reviews (property_id);

CREATE INDEX IF NOT EXISTS idx_user_reviews_target_role
ON user_reviews (target_user_id, target_role);

CREATE INDEX IF NOT EXISTS idx_user_reviews_created_at
ON user_reviews (created_at DESC);
