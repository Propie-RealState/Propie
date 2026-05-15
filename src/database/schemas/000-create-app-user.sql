-- =============================================================================
-- create application user for agente (least-privilege DB role)
-- =============================================================================

\if :{?app_password}

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_user WHERE usename = 'agente_app_user'
  ) THEN

    CREATE USER agente_app_user
    WITH PASSWORD :'app_password';

    RAISE NOTICE 'user agente_app_user created successfully';

  ELSE

    RAISE NOTICE 'user agente_app_user already exists, skipping';

  END IF;
END
$$;

\else

\warn 'ERROR: Missing required variable app_password'
\quit

\endif


GRANT CONNECT ON DATABASE propie_db TO agente_app_user;

GRANT USAGE ON SCHEMA public TO agente_app_user;

GRANT SELECT, INSERT, UPDATE, DELETE
ON ALL TABLES IN SCHEMA public
TO agente_app_user;

GRANT USAGE, SELECT
ON ALL SEQUENCES IN SCHEMA public
TO agente_app_user;
