#!/usr/bin/env bash

set -e

echo ""
echo "==================================="
echo "        PROPIE DB SETUP"
echo "==================================="
echo ""

CONTAINER_NAME=propie-postgres

if [ "$(docker ps -q -f name=$CONTAINER_NAME)" = "" ]; then
  echo "Postgres container is not running"
  exit 1
fi

DB_USER=propie
DB_NAME=propie_db

SCHEMA_PATH=src/database/schemas

echo "Running database schemas..."
echo ""

for file in $(find $SCHEMA_PATH -name "*.sql" | sort)
do
  echo "Executing: $file"

  docker exec -i $CONTAINER_NAME psql \
    -U $DB_USER \
    -d $DB_NAME \
    < "$file"

  echo ""
done

echo "==================================="
echo "      DATABASE READY"
echo "==================================="
echo ""