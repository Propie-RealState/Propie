-- publisher ownership + lifecycle statuses

ALTER TABLE properties
  ADD COLUMN IF NOT EXISTS publisher_id UUID,
  ADD COLUMN IF NOT EXISTS publisher_type TEXT;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_properties_publisher'
  ) THEN
    ALTER TABLE properties
      ADD CONSTRAINT fk_properties_publisher
        FOREIGN KEY (publisher_id)
        REFERENCES users(id)
        ON DELETE SET NULL;
  END IF;
END $$;

UPDATE properties SET status = 'ACTIVE' WHERE status = 'PUBLISHED';
UPDATE properties SET status = 'FINALIZED' WHERE status = 'ARCHIVED';
UPDATE properties SET status = 'ACTIVE' WHERE status = 'DRAFT';

UPDATE properties
SET
  publisher_id = owner_id,
  publisher_type = 'OWNER'
WHERE published_at IS NOT NULL
  AND publisher_id IS NULL;

CREATE INDEX IF NOT EXISTS idx_properties_publisher_id
ON properties (publisher_id);

CREATE INDEX IF NOT EXISTS idx_properties_publisher_type
ON properties (publisher_type);
