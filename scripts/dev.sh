#!/usr/bin/env bash

set -e

echo ""
echo "==================================="
echo "      PROPIE DEV STARTER"
echo "==================================="
echo ""

# =========================================
# PORTS
# =========================================

WEB_PORT=5173
API_PORT=3000
DB_PORT=5432

# =========================================
# KILL PORT
# =========================================

kill_port () {
  PORT=$1

  PID=$(netstat -ano | grep ":$PORT" | grep LISTENING | awk '{print $5}' | head -n 1)

  if [ ! -z "$PID" ]; then
    echo "Killing process on port $PORT (PID $PID)"
    taskkill //F //PID $PID > /dev/null 2>&1 || true
  fi
}

# =========================================
# FREE PORTS
# =========================================

echo "Checking ports..."

kill_port $WEB_PORT
kill_port $API_PORT
kill_port $DB_PORT

echo "Ports cleaned"
echo ""

# =========================================
# START DATABASE
# =========================================

echo "Starting postgres..."

docker compose up -d postgres

echo ""

# =========================================
# START BACKEND
# =========================================

echo "Starting backend..."

npm run dev &

BACK_PID=$!

echo "Backend PID: $BACK_PID"

echo ""

# =========================================
# START FRONTEND
# =========================================

echo "Starting frontend..."

cd web

npm run dev &

WEB_PID=$!

echo "Frontend PID: $WEB_PID"

echo ""

# =========================================
# READY
# =========================================

echo "==================================="
echo "    PROPIE RUNNING"
echo "==================================="
echo ""
echo "Frontend: http://localhost:$WEB_PORT"
echo "Backend:  http://localhost:$API_PORT"
echo "DB:       localhost:$DB_PORT"
echo ""

wait