#!/usr/bin/env bash
set -euo pipefail
export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$SCRIPT_DIR"

echo "=== 1. Testing Backend Simulator ==="
PYTHONPATH=backend .venv/bin/pytest backend/tests/ -v

echo "=== 2. Testing Lambda Ask Corner ==="
PYTHONPATH=lambda_ask_corner .venv/bin/pytest lambda_ask_corner/test_handler.py -v

echo "=== 3. Testing Frontend Production Build ==="
cd frontend && npm run build && cd "$SCRIPT_DIR"

echo "=== 4. Synthesizing AWS CDK CloudFormation Stack ==="
cd infra && npx cdk synth > /dev/null && cd "$SCRIPT_DIR"

echo "✓ ALL TESTS AND SYNTHESIS PASSED SUCCESSFULLY!"

