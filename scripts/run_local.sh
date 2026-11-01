#!/usr/bin/env bash
# Run both FastAPI backend and Vite frontend locally for development and demos.
set -euo pipefail
export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$SCRIPT_DIR"

cleanup() {
  echo -e "\nShutting down local servers..."
  kill $(jobs -p) 2>/dev/null || true
}
trap cleanup EXIT

echo "Starting FastAPI Simulator on http://localhost:8000 (ws://localhost:8000/ws/simulator)..."
PYTHONPATH=backend .venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload &
BACKEND_PID=$!

echo "Starting Vite Frontend on http://localhost:3000..."
cd frontend && npm run dev &
FRONTEND_PID=$!

wait

