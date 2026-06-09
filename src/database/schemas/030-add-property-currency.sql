-- =============================================================================
-- Add currency to properties
-- =============================================================================

ALTER TABLE properties
  ADD COLUMN IF NOT EXISTS currency TEXT NOT NULL DEFAULT 'USD';

ALTER TABLE properties
  DROP CONSTRAINT IF EXISTS chk_properties_currency;

ALTER TABLE properties
  ADD CONSTRAINT chk_properties_currency
  CHECK (currency IN ('USD', 'ARS'));

CREATE INDEX IF NOT EXISTS idx_properties_currency
ON properties (currency);
