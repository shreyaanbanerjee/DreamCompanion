# DreamCompanion: Corner Edition

A sports tech artifact providing a real-time, synchronized cricket experience. The prototype features a split-screen interface displaying a live-updating scorecard, a dynamic "Fan ECG" biometric monitor, a WebSocket match simulator, and a live "Ask Corner" AI companion powered by AWS Lambda and API Gateway.

---

## Architecture Overview

```mermaid
flowchart TD
    User["Cricket Fan (Browser)"]

    subgraph Frontend ["React Web App (AWS Amplify)"]
        Scoreboard["Live Cricket Scoreboard"]
        ECG["Dynamic Fan ECG Line Graph"]
        Chat["'Ask Corner' AI Chat UI"]
        Controls["Simulator Controls (Start / Pause / Reset)"]
    end

    subgraph Backend ["Mock Simulator (AWS App Runner)"]
        FastAPI["FastAPI WebSocket Server (/ws/simulator)"]
        MatchData[("Historical Match Data JSON\n(IPL Final 2023 Thriller)")]
    end

    subgraph ChatService ["AI Chat Service (AWS API Gateway + Lambda)"]
        APIGW["HTTP API Gateway (POST /ask)"]
        Lambda["Python 3.11 Lambda Function"]
        LorePack[("CSK Fan Lore Pack\n(Whistle Podu Knowledge Base)")]
        LLM["Anthropic Claude / Gemini API"]
    end

    User <-->|User Interaction| Frontend
    Scoreboard <-->|WebSocket: 5s Ball Updates| FastAPI
    ECG <-->|Real-time Tension & BPM| FastAPI
    Controls -->|Start / Pause / Reset| FastAPI
    FastAPI --> MatchData

    Chat -->|HTTP POST Prompt| APIGW
    APIGW --> Lambda
    Lambda --> LorePack
    Lambda --> LLM
    LLM --> Lambda
    Lambda -->|Contextual Fan Commentary| Chat
```

---

## Directory Structure

```text
DreamCompanion/
├── frontend/                     # React 18 + Vite + TailwindCSS application
│   ├── src/
│   │   ├── components/
│   │   │   ├── Scoreboard.jsx    # Top half: Cricket scorecard (runs, overs, wickets, ball capsules)
│   │   │   ├── FanECG.jsx        # Bottom right: Real-time SVG dynamic ECG heartbeat & tension graph
│   │   │   ├── AskCornerChat.jsx # Bottom left: "Ask Corner" AI chat with Fan Lore Pack
│   │   │   ├── MatchControls.jsx # Play, Pause, Reset, Speed multipliers (1x, 2x, 5x)
│   │   │   └── Header.jsx        # App header & live WebSocket status indicator
│   │   ├── services/
│   │   │   ├── websocket.js      # WebSocket client with auto-reconnect
│   │   │   └── api.js            # HTTP client for API Gateway /ask endpoint
│   │   ├── constants/
│   │   │   └── fallbackData.js   # Initial state baseline data
│   │   ├── App.jsx               # Split-screen responsive layout
│   │   ├── main.jsx              # Application bootstrap
│   │   └── index.css             # Tailwind base & tactile interaction styles
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── amplify.yml               # AWS Amplify Hosting build specification
├── backend/                      # Python FastAPI Match Simulator
│   ├── app/
│   │   ├── main.py               # FastAPI entrypoint, WebSocket /ws/simulator, CORS, health probe
│   │   ├── simulator.py          # State machine iterating ball-by-ball
│   │   ├── models.py             # Pydantic V2 schemas (DeliveryUpdate, MatchInfo, SimulatorState)
│   │   └── data/
│   │       └── match_data.json   # 2023 IPL Final ball-by-ball dataset with AI commentary
│   ├── tests/
│   │   ├── test_simulator.py     # Simulator state progression tests
│   │   └── test_api.py           # REST endpoints and health check tests
│   ├── Dockerfile                # Container definition for AWS App Runner
│   ├── requirements.txt
│   └── .dockerignore
├── lambda_ask_corner/            # Live "Ask Corner" AI Chat Lambda
│   ├── handler.py                # Lambda handler, CORS parser, LLM router (Claude/Gemini/Fallback)
│   ├── fan_lore.py               # Chennai Super Kings Fan Lore Pack knowledge base
│   ├── test_handler.py           # Lambda unit test suite
│   └── requirements.txt
├── infra/                        # AWS CDK v2 Infrastructure as Code (TypeScript)
│   ├── bin/
│   │   └── dream-companion.ts    # CDK App entrypoint
│   ├── lib/
│   │   └── dream-companion-stack.ts # CDK Stack (Amplify, App Runner, API Gateway, Lambda)
│   ├── package.json
│   ├── tsconfig.json
│   └── cdk.json
├── sam/                          # Alternative AWS SAM template
│   └── template.yaml
├── scripts/
│   ├── run_local.sh              # Run frontend and backend concurrently for local testing
│   └── test_all.sh               # Run all test suites and synth checks
├── deploy.sh                     # Automated one-click AWS CLI deployment script
└── README.md
```

---

## Component Details

### 1. Frontend (React + Vite + TailwindCSS)
- **Top Half (Scoreboard)**:
  - Displays match status (CSK chasing 171 in 15 overs, DLS thriller).
  - Live scores, current run rate (CRR), required run rate (RRR), active batsmen stats with striker indicator, bowler figures, and recent deliveries capsules.
  - Live AI Commentary stream banner with milestone badges (`SIX`, `FOUR`, `WICKET`, `MATCH_WINNER`).
- **Bottom Half (Split-Screen)**:
  - **Left - Ask Corner Chat**: Live chat interface with quick question chips ("Can Sir Jadeja finish this?", "What is Thala Dhoni's strategy?", "Why Mohit Sharma?"). Sends user questions to the AWS Lambda API and returns tactical fan responses.
  - **Right - Dynamic Fan ECG**: Real-time SVG waveform monitor tracking emotional intensity ($0-100\%$) and estimated fan heart rate ($80-182\text{ BPM}$). Reflects boundary spikes, wicket crashes, and climax surges.
- **Simulator Controls**: Start, Pause, Reset, Step (single delivery), and simulation speed toggles ($1\times$ at $5\text{s}$, $2\times$ at $2.5\text{s}$, $5\times$ at $1\text{s}$).

### 2. Mock-Live Simulator Backend (Python FastAPI + AWS App Runner)
- **Data Source**: `backend/app/data/match_data.json` contains delivery-by-delivery data from the 2023 IPL Final climax (Overs 13.1 to 14.6) with pre-generated AI commentary, batsman/bowler figures, and biometric tension metrics.
- **WebSocket Protocol** (`/ws/simulator`):
  - On connection, sends an `init` payload with match metadata and current simulator state.
  - When the client sends `{"action": "start"}`, iterates through deliveries every 5 seconds (configurable) and broadcasts `ball_update` events to all connected clients.
  - Accepts `pause`, `reset`, `step`, and `set_interval` commands.
- **Health Check**: `GET /health` returns HTTP 200 for AWS App Runner container health checks.

### 3. "Ask Corner" Chat Service (AWS API Gateway + AWS Lambda)
- **Handler**: `lambda_ask_corner/handler.py`
- **Logic**: Receives HTTP `POST /ask` with `{"question": "...", "match_context": "..."}`.
- **Fan Lore Pack**: Injects `fan_lore.py` containing CSK history, MS Dhoni's leadership, Ravindra Jadeja's clutch record, and Ahmedabad final context.
- **LLM Integration**:
  - Connects to **Anthropic Claude API** if `ANTHROPIC_API_KEY` is provided.
  - Connects to **Google Gemini API** if `GEMINI_API_KEY` is provided.
  - Built-in **Fan Lore Engine fallback** generates contextual answers matching prompt keywords if external keys are not set, ensuring the application runs without external API dependencies.

---

## Quickstart: Local Development

Run the entire application locally in two minutes:

### 1. Run Automated Test Suite
```bash
./scripts/test_all.sh
```
This runs:
- 10 Backend tests (`backend/tests/`)
- 5 Lambda tests (`lambda_ask_corner/test_handler.py`)
- Frontend production build verification
- AWS CDK CloudFormation stack synthesis

### 2. Start Both Services Locally
```bash
./scripts/run_local.sh
```
This launches:
- **FastAPI Simulator**: `http://localhost:8000` (WebSocket at `ws://localhost:8000/ws/simulator`)
- **React Frontend**: `http://localhost:3000`

Open `http://localhost:3000` in your browser and click **Start Match**.

---

## AWS Deployment Instructions

The project provides automated deployment using **AWS CDK (TypeScript)**.

### Prerequisites
1. **AWS CLI** configured locally with credentials:
   ```bash
   aws sts get-caller-identity
   ```
2. **Docker** running locally (for App Runner container packaging).
3. **Node.js 18+** and **Python 3.10+**.

### One-Click Deployment

Run the deployment script from the project root:

```bash
./deploy.sh
```

The script performs the following sequence:
1. Validates AWS CLI credentials and active account ID.
2. Runs all unit tests.
3. Builds the React production bundle (`frontend/dist`).
4. Bootstraps the AWS CDK environment (`cdk bootstrap`).
5. Synthesizes and deploys `DreamCompanionStack`:
   - Builds and pushes the FastAPI Docker container to AWS ECR.
   - Deploys the container to **AWS App Runner** with public HTTPS/WSS access.
   - Deploys the Python 3.11 **Lambda function** and **HTTP API Gateway**.
   - Provisions the **AWS Amplify App** hosting the frontend.
6. Outputs the live AWS URLs:
   - **Frontend URL**: `https://main.<app-id>.amplifyapp.com`
   - **WebSocket Simulator**: `wss://<service-id>.<region>.awsapprunner.com/ws/simulator`
   - **Ask Corner API**: `https://<api-id>.execute-api.<region>.amazonaws.com/ask`

### Manual CDK Deployment Commands

If you prefer running individual commands manually:

```bash
# 1. Install infrastructure dependencies
cd infra
npm install

# 2. Bootstrap CDK in your account (first-time only)
npx cdk bootstrap

# 3. Deploy the stack
npx cdk deploy --require-approval never
```

To configure Anthropic or Gemini API keys for the Lambda function during deployment:
```bash
export GEMINI_API_KEY="your-gemini-key"
# or
export ANTHROPIC_API_KEY="your-anthropic-key"

npx cdk deploy --require-approval never
```

### Alternative: AWS SAM Deployment

If you prefer using AWS SAM:

```bash
cd sam
sam build
sam deploy --guided
```

---

## API & WebSocket Reference

### WebSocket Feed (`/ws/simulator`)

#### Client to Server Commands
```json
{ "action": "start" }
{ "action": "pause" }
{ "action": "reset" }
{ "action": "step" }
{ "action": "set_interval", "interval": 2.5 }
```

#### Server to Client Ball Update (`ball_update`)
```json
{
  "type": "ball_update",
  "data": {
    "ball_index": 11,
    "over_display": "14.5",
    "batsman": "Ravindra Jadeja",
    "bowler": "Mohit Sharma",
    "runs_scored": 6,
    "score_after": "167/5",
    "runs_needed": 4,
    "balls_remaining": 1,
    "emotional_index": 96,
    "fan_bpm": 174,
    "milestone_type": "SIX",
    "ai_commentary": "OH MY GOODNESS! SIX STRAIGHT DOWN THE GROUND!..."
  },
  "state": {
    "status": "running",
    "current_index": 11,
    "total_balls": 12
  }
}
```

### Live Chat API (`POST /ask`)

#### Request
```bash
curl -X POST "https://<api-id>.execute-api.us-east-1.amazonaws.com/ask" \
  -H "Content-Type: application/json" \
  -d '{
    "question": "Can Sir Jadeja hit 10 runs off 2 balls?",
    "match_context": "Over 14.4, Score: 161/5, 10 needed in 2 balls"
  }'
```

#### Response
```json
{
  "success": true,
  "response": "Never doubt Sir Ravindra Jadeja! Needing 10 off 2 balls with Mohit firing yorkers is where legends are forged. Look for the straight drive or the fine tickle past short fine leg. Whistle Podu!",
  "provider": "fan_lore_engine",
  "persona": "CSK Corner Companion (Whistle Podu Edition)"
}
```
