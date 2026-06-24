-- =============================================================================
-- ADMIN role (internal-only; never assignable via registration)
-- =============================================================================

INSERT INTO roles (code)
VALUES ('ADMIN')
ON CONFLICT (code) DO NOTHING;

ALTER TABLE users
  DROP CONSTRAINT IF EXISTS users_role_check;

ALTER TABLE users
  ADD CONSTRAINT users_role_check
  CHECK (role IN ('CLIENT', 'OWNER', 'AGENT', 'ADMIN'));
