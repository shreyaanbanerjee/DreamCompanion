# Backend Simulator Agent Guidelines (`backend/`)

This directory houses the Python FastAPI match simulator and WebSocket broadcast server.

---

## 1. Concrete Commands

```bash
# Run simulator unit tests
PYTHONPATH=backend .venv/bin/pytest backend/tests/ -v

# Run FastAPI simulator locally with hot-reloading
PYTHONPATH=backend .venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

# Test health check endpoint
curl -s http://localhost:8000/health

# Test local Ask Corner proxy
curl -s -X POST http://localhost:8000/ask -H "Content-Type: application/json" -d '{"question": "hi"}'
```

---

## 2. Architecture & Simulator Logic

- **Data Source**: `backend/app/data/match_data.json` contains historical delivery telemetry for the 2023 IPL Final climax (Overs 13.1 to 14.6).
- **State Machine**: Managed by `MatchSimulator` in `app/simulator.py`. States: `idle`, `running`, `paused`, `completed`.
- **WebSocket Protocol**: `/ws/simulator`
  - Accepts incoming JSON actions: `start`, `pause`, `reset`, `step`, `set_interval`.
  - Broadcasts `ball_update` events every interval (default 5.0 seconds).
  - Handles client disconnections gracefully without crashing the loop.
- **Data Validation**: Enforced strictly through Pydantic V2 models (`DeliveryUpdate`, `MatchInfo`, `SimulatorState`).

---

## 3. Container & Cloud Deployment

- Containerized via `Dockerfile` using `python:3.11-slim`.
- Exposes port `8000` with container health probe on `GET /health`.
- App Runner depends on `GET /health` returning HTTP 200 within 5 seconds.

---

## 4. Boundaries & Permissions

- **Autonomous**: Editing routes, simulator logic, models, adding test cases, running pytest.
- **Restricted**: Deleting historical data entries in `match_data.json` or changing the `/health` contract without updating the CDK stack.

