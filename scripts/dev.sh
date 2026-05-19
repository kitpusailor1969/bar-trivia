#!/bin/bash
set -e
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PB="$ROOT/pocketbase/pocketbase"

[ ! -f "$PB" ] && echo "Run ./scripts/setup.sh first." && exit 1

echo "Starting PocketBase on :8090..."
"$PB" serve \
  --dir="$ROOT/pocketbase/pb_data" \
  --hooksDir="$ROOT/pocketbase/pb_hooks" \
  --migrationsDir="$ROOT/pocketbase/pb_migrations" &
PB_PID=$!

echo "Starting Vite on :5173..."
cd "$ROOT/frontend" && npm run dev &
VITE_PID=$!

trap "kill $PB_PID $VITE_PID 2>/dev/null; exit" INT TERM
wait
