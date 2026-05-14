#!/usr/bin/env bash

set -e

# =========================================
# CONFIG
# =========================================

WEB_PORT=5173
API_PORT=3000
DB_PORT=5432

DB_USER=propie
DB_NAME=propie_db

POSTGRES_CONTAINER=propie-postgres

# =========================================
# UI
# =========================================

print_header () {
  echo ""
  echo "==================================="
  echo "      PROPIE DEV STARTER"
  echo "==================================="
  echo ""
}

print_success () {
  echo ""
  echo "==================================="
  echo "       PROPIE RUNNING"
  echo "==================================="
  echo ""
  echo "Frontend: http://localhost:$WEB_PORT"
  echo "Backend:  http://localhost:$API_PORT"
  echo "DB:       localhost:$DB_PORT"
  echo ""
}

# =========================================
# KILL PORT
# =========================================

kill_port () {
  PORT=$1

  PID=$(
    netstat -ano |
    grep ":$PORT" |
    grep LISTENING |
    awk '{print $5}' |
    head -n 1
  )

  if [ ! -z "$PID" ]; then
    echo "Killing process on port $PORT (PID $PID)"

    taskkill //F //PID $PID > /dev/null 2>&1 || true
  fi
}

# =========================================
# CLEAN PORTS
# =========================================

clean_ports () {
  echo "Checking ports..."

  kill_port $WEB_PORT
  kill_port $API_PORT
  kill_port $DB_PORT

  echo "Ports cleaned"
  echo ""
}

# =========================================
# START POSTGRES
# =========================================

start_postgres () {
  echo "Starting postgres..."

  docker compose up -d postgres

  echo ""

  echo "Waiting for postgres..."

  until docker exec \
    $POSTGRES_CONTAINER \
    pg_isready \
    -U $DB_USER \
    -d $DB_NAME \
    > /dev/null 2>&1
  do
    echo "Postgres not ready yet..."

    sleep 1
  done

  echo "Postgres ready"
  echo ""
}

# =========================================
# SETUP DATABASE
# =========================================

setup_database () {
  echo "Running database setup..."

  npm run db:setup

  echo ""
}

# =========================================
# START BACKEND
# =========================================

start_backend () {
  echo "Starting backend..."

  npm run dev &

  BACK_PID=$!

  echo "Backend PID: $BACK_PID"
  echo ""
}

# =========================================
# START FRONTEND
# =========================================

start_frontend () {
  echo "Starting frontend..."

  cd web

  npm run dev &

  FRONT_PID=$!

  echo "Frontend PID: $FRONT_PID"

  cd ..

  echo ""
}

# =========================================
# MAIN
# =========================================

print_header

clean_ports

start_postgres

setup_database

start_backend

start_frontend

print_success

wait