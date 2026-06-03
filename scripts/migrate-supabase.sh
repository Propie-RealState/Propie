#!/usr/bin/env bash

# =============================================================================
# migrate-supabase.sh
# Runs all SQL migration files against the Supabase database.
#
# Usage:
#   ./scripts/migrate-supabase.sh          # run all files
#   ./scripts/migrate-supabase.sh 023      # run files >= 023
#   ./scripts/migrate-supabase.sh --dry-run
# =============================================================================

set -e

# ── Colors ────────────────────────────────────────────────────────────────────
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

echo ""
echo -e "${CYAN}==================================="
echo "   PROPIE — SUPABASE MIGRATION"
echo -e "===================================${NC}"
echo ""

# ── Parse args ────────────────────────────────────────────────────────────────
FROM_FILE=""
DRY_RUN=false

for arg in "$@"; do
  if [ "$arg" = "--dry-run" ]; then
    DRY_RUN=true
  elif [[ "$arg" =~ ^[0-9]+$ ]]; then
    FROM_FILE="$arg"
  fi
done

# ── Load .env ─────────────────────────────────────────────────────────────────
if [ -f .env ]; then
  set -a
  # shellcheck disable=SC1091
  source .env
  set +a
fi

if [ -z "$DEPLOY_DATABASE_URL" ]; then
  echo -e "${RED}❌  DEPLOY_DATABASE_URL not set in .env${NC}"
  echo ""
  echo "Add to .env:"
  echo "  DEPLOY_DATABASE_URL=postgresql://user:pass@host:5432/db"
  exit 1
fi

# ── Check psql ────────────────────────────────────────────────────────────────
if ! command -v psql &> /dev/null; then
  echo -e "${RED}❌  psql not found.${NC}"
  echo ""
  echo "Install the PostgreSQL client:"
  echo "  • macOS:   brew install libpq && brew link libpq --force"
  echo "  • Ubuntu:  sudo apt install postgresql-client"
  echo "  • Windows: https://www.postgresql.org/download/windows/"
  exit 1
fi

# ── SSL for Supabase ──────────────────────────────────────────────────────────
export PGSSLMODE=require

# ── Collect files ─────────────────────────────────────────────────────────────
SCHEMA_PATH="src/database/schemas"
ALL_FILES=$(find "$SCHEMA_PATH" -name "*.sql" | sort)

if [ -n "$FROM_FILE" ]; then
  echo -e "  ${YELLOW}Filtering files >= ${FROM_FILE}...${NC}"
  FILES=""
  for f in $ALL_FILES; do
    basename=$(basename "$f")
    if [[ "$basename" > "${FROM_FILE}" || "$basename" == "${FROM_FILE}"* ]]; then
      FILES="$FILES $f"
    fi
  done
else
  FILES="$ALL_FILES"
fi

TOTAL=$(echo "$FILES" | tr ' ' '\n' | grep -c '\.sql$' || true)

echo -e "  Target DB:  ${CYAN}Supabase${NC}"
echo -e "  Files:      ${CYAN}${TOTAL}${NC}"
if [ "$DRY_RUN" = true ]; then
  echo -e "  Mode:       ${YELLOW}DRY RUN (no changes)${NC}"
fi
echo ""

# ── Run migrations ────────────────────────────────────────────────────────────
SUCCESS=0
FAILED=0

for file in $FILES; do
  label=$(basename "$file")
  printf "  %-50s" "$label"

  if [ "$DRY_RUN" = true ]; then
    echo -e "${YELLOW}(skip)${NC}"
    SUCCESS=$((SUCCESS + 1))
    continue
  fi

  if output=$(psql "$DEPLOY_DATABASE_URL" -f "$file" --quiet 2>&1); then
    echo -e "${GREEN}✓${NC}"
    SUCCESS=$((SUCCESS + 1))
  else
    echo -e "${RED}✗ FAILED${NC}"
    echo ""
    echo -e "${RED}  Error:${NC}"
    echo "$output" | sed 's/^/    /'
    echo ""
    FAILED=$((FAILED + 1))
  fi
done

# ── Summary ───────────────────────────────────────────────────────────────────
echo ""
echo -e "${CYAN}===================================${NC}"

if [ "$FAILED" -eq 0 ]; then
  echo -e "${GREEN}  ✓ ${SUCCESS} archivos aplicados correctamente${NC}"
else
  echo -e "${GREEN}  ✓ ${SUCCESS} ok${NC}  ${RED}✗ ${FAILED} fallidos${NC}"
fi

echo -e "${CYAN}===================================${NC}"
echo ""
