-- Soft delete for properties (owner-only). No DELETED lifecycle status.

ALTER TABLE properties
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ NULL,
  ADD COLUMN IF NOT EXISTS deleted_by UUID NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_properties_deleted_by'
  ) THEN
    ALTER TABLE properties
      ADD CONSTRAINT fk_properties_deleted_by
        FOREIGN KEY (deleted_by)
        REFERENCES users(id)
        ON DELETE SET NULL;
  END IF;
END $$;

-- No partial index in v1: active inventory already filters by status/published_at;
-- deleted rows are rare; deleted_at IS NULL is a cheap residual predicate.
