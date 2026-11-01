#!/usr/bin/env bash
# ==============================================================================
# DreamCompanion: Corner Edition - Automated AWS Deployment Script
# ==============================================================================
set -euo pipefail

# ANSI Color codes for clean terminal output
BOLD="\033[1m"
GREEN="\033[0;32m"
YELLOW="\033[0;33m"
CYAN="\033[0;36m"
RED="\033[0;31m"
RESET="\033[0m"

# Ensure /opt/homebrew/bin is in PATH for macOS environments
export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo -e "${BOLD}${CYAN}==================================================================${RESET}"
echo -e "${BOLD}${YELLOW}   🏏 DreamCompanion: Corner Edition - AWS Cloud Deployment   ${RESET}"
echo -e "${BOLD}${CYAN}==================================================================${RESET}\n"

# Load .env file if present
if [ -f "$SCRIPT_DIR/.env" ]; then
  echo -e "  → Loading API keys and configuration from .env..."
  set -a
  source "$SCRIPT_DIR/.env"
  set +a
fi

# ------------------------------------------------------------------------------
# 1. Verify Local Prerequisites & AWS Credentials
# ------------------------------------------------------------------------------
echo -e "${BOLD}[1/5] Verifying toolchain & AWS CLI credentials...${RESET}"

for cmd in aws node npm python3 docker; do
  if ! command -v "$cmd" &>/dev/null; then
    echo -e "${RED}Error: Required command '$cmd' is not installed or not in PATH.${RESET}"
    exit 1
  fi
done

echo -e "  ✓ Node.js $(node -v)"
echo -e "  ✓ npm $(npm -v)"
echo -e "  ✓ Python $(python3 --version | awk '{print $2}')"
echo -e "  ✓ Docker $(docker --version | awk '{print $3}' | tr -d ',')"

# Check AWS Caller Identity using local credentials
echo -e "  → Checking AWS CLI credentials..."
if ! AWS_IDENTITY=$(aws sts get-caller-identity --output json 2>&1); then
  echo -e "${RED}Error: AWS CLI credentials check failed.${RESET}"
  echo "$AWS_IDENTITY"
  echo -e "\nPlease run ${CYAN}aws configure${RESET} or set ${CYAN}AWS_ACCESS_KEY_ID${RESET} / ${CYAN}AWS_SECRET_ACCESS_KEY${RESET}."
  exit 1
fi

AWS_ACCOUNT_ID=$(echo "$AWS_IDENTITY" | grep -o '"Account": "[^"]*' | cut -d'"' -f4)
AWS_REGION=${AWS_REGION:-$(aws configure get region || echo "us-east-1")}
AWS_REGION=${AWS_REGION:-us-east-1}

echo -e "  ${GREEN}✓ Authenticated to AWS Account:${RESET} ${BOLD}${AWS_ACCOUNT_ID}${RESET} in ${BOLD}${AWS_REGION}${RESET}"

# ------------------------------------------------------------------------------
# 2. Run Local Verification & Unit Tests
# ------------------------------------------------------------------------------
echo -e "\n${BOLD}[2/5] Running pre-flight automated test suites...${RESET}"

# Set up virtual environment if needed
if [ ! -d ".venv" ]; then
  echo -e "  → Creating Python virtualenv (.venv)..."
  python3 -m venv .venv
  .venv/bin/pip install --quiet --upgrade pip
  .venv/bin/pip install --quiet -r backend/requirements.txt
fi

echo -e "  → Running Backend Simulator tests..."
PYTHONPATH=backend .venv/bin/pytest backend/tests/ -q
echo -e "  ${GREEN}✓ Backend tests passed (10/10)${RESET}"

echo -e "  → Running 'Ask Corner' Lambda tests..."
PYTHONPATH=lambda_ask_corner .venv/bin/pytest lambda_ask_corner/test_handler.py -q
echo -e "  ${GREEN}✓ Lambda handler tests passed (5/5)${RESET}"

# ------------------------------------------------------------------------------
# 3. Build React Frontend Artifacts
# ------------------------------------------------------------------------------
echo -e "\n${BOLD}[3/5] Building React + Vite frontend bundle...${RESET}"
cd frontend
if [ ! -d "node_modules" ]; then
  echo -e "  → Installing frontend packages..."
  npm ci --silent
fi
npm run build
cd "$SCRIPT_DIR"
echo -e "  ${GREEN}✓ Frontend production bundle created in frontend/dist${RESET}"

# ------------------------------------------------------------------------------
# 4. Bootstrap CDK (if not already bootstrapped)
# ------------------------------------------------------------------------------
echo -e "\n${BOLD}[4/5] Preparing AWS CDK environment...${RESET}"
cd infra

if [ ! -d "node_modules" ]; then
  echo -e "  → Installing CDK infrastructure dependencies..."
  npm ci --silent
fi

echo -e "  → Checking AWS CDK bootstrap for ${AWS_ACCOUNT_ID}/${AWS_REGION}..."
npx cdk bootstrap "aws://${AWS_ACCOUNT_ID}/${AWS_REGION}" --require-approval never

# ------------------------------------------------------------------------------
# 5. Deploy Infrastructure to AWS
# ------------------------------------------------------------------------------
echo -e "\n${BOLD}[5/5] Deploying DreamCompanionStack to AWS Cloud...${RESET}"
echo -e "  This provisions:"
echo -e "    1. AWS Amplify App (React Frontend)"
echo -e "    2. AWS App Runner Service (FastAPI WebSocket Simulator)"
echo -e "    3. AWS Lambda + API Gateway (Ask Corner AI Chat)"

npx cdk deploy --require-approval never \
  --outputs-file "$SCRIPT_DIR/cdk-outputs.json"

cd "$SCRIPT_DIR"

echo -e "\n${BOLD}${GREEN}==================================================================${RESET}"
echo -e "${BOLD}${GREEN}   🎉 DreamCompanion: Corner Edition Successfully Deployed!      ${RESET}"
echo -e "${BOLD}${GREEN}==================================================================${RESET}\n"

if [ -f "cdk-outputs.json" ]; then
  echo -e "${BOLD}Deployed AWS Endpoints:${RESET}"
  cat cdk-outputs.json
fi

echo -e "\n${CYAN}To run the prototype locally at any time:${RESET}"
echo -e "  1. Backend:  ${BOLD}source .venv/bin/activate && uvicorn app.main:app --app-dir backend --port 8000 --reload${RESET}"
echo -e "  2. Frontend: ${BOLD}cd frontend && npm run dev${RESET}\n"

