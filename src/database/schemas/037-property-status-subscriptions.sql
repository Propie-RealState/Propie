CREATE TABLE IF NOT EXISTS property_status_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL,
  user_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  notified_at TIMESTAMPTZ,

  CONSTRAINT fk_property_status_subscriptions_property
    FOREIGN KEY (property_id)
    REFERENCES properties(id)
    ON DELETE CASCADE,

  CONSTRAINT fk_property_status_subscriptions_user
    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE,

  CONSTRAINT uq_property_status_subscriptions
    UNIQUE (property_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_property_status_subscriptions_property
ON property_status_subscriptions (property_id)
WHERE notified_at IS NULL;
