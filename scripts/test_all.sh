#!/usr/bin/env bash
set -euo pipefail
export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$SCRIPT_DIR"

echo "=== 1. Testing Backend Simulator ==="
PYTHONPATH=backend .venv/bin/pytest backend/tests/ -v

echo "=== 2. Testing Lambda Ask Corner ==="
PYTHONPATH=lambda_ask_corner .venv/bin/pytest lambda_ask_corner/test_handler.py -v

echo "=== 3. Testing Frontend Unit & Integrity Tests ==="
cd frontend && npm test && cd "$SCRIPT_DIR"

echo "=== 4. Testing Frontend Production Build ==="
cd frontend && npm run build && cd "$SCRIPT_DIR"

echo "=== 5. Synthesizing AWS CDK CloudFormation Stack ==="
cd infra && npx cdk synth > /dev/null && cd "$SCRIPT_DIR"

echo "=== 6. Testing AI Prompt Response Quality & Factuality ==="
PYTHONPATH=lambda_ask_corner .venv/bin/python scripts/evaluate_ai_prompts.py

echo "✓ ALL TESTS AND SYNTHESIS PASSED SUCCESSFULLY!"

