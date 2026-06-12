ALTER TABLE property_commercialization
  ADD COLUMN IF NOT EXISTS commercialization_mode TEXT NOT NULL DEFAULT 'WITH_AGENTS';

UPDATE property_commercialization
SET commercialization_mode = 'WITH_AGENTS'
WHERE commercialization_mode IS NULL
   OR commercialization_mode NOT IN ('WITH_AGENTS', 'WITHOUT_INTERMEDIARIES');

UPDATE property_commercialization
SET commercialization_mode = 'WITHOUT_INTERMEDIARIES'
WHERE commercialization_type = 'DIRECT';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'property_commercialization_mode_check'
  ) THEN
    ALTER TABLE property_commercialization
      ADD CONSTRAINT property_commercialization_mode_check
      CHECK (commercialization_mode IN ('WITH_AGENTS', 'WITHOUT_INTERMEDIARIES'));
  END IF;
END $$;
