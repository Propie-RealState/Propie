#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SCHEMA_PATH="$ROOT_DIR/src/database/schemas"
ENV_FILE="$ROOT_DIR/.env"

echo ""
echo "==================================="
echo "      PROPIE SUPABASE DB SETUP"
echo "==================================="
echo ""

if [ -f "$ENV_FILE" ]; then
  set -a
  # shellcheck disable=SC1090
  source "$ENV_FILE"
  set +a
fi

DATABASE_URL="${DEPLOY_DATABASE_URL:-${DATABASE_URL:-}}"

if [ -z "$DATABASE_URL" ]; then
  echo "Missing DEPLOY_DATABASE_URL in .env or environment"
  exit 1
fi

if ! command -v psql > /dev/null 2>&1; then
  echo "psql is required to run this script."
  echo "Install PostgreSQL client tools, then run again."
  exit 1
fi

echo "Running schemas against Supabase..."
echo ""

for file in $(find "$SCHEMA_PATH" -name "*.sql" | sort)
do
  filename="$(basename "$file")"

  if [ "$filename" = "000-create-app-user.sql" ]; then
    echo "Skipping: $filename (local Docker-only role script)"
    echo ""
    continue
  fi

  echo "Executing: $filename"

  psql "$DATABASE_URL" \
    -v ON_ERROR_STOP=1 \
    -f "$file"

  echo ""
done

echo "==================================="
echo "       SUPABASE DATABASE READY"
echo "==================================="
echo ""
