"""FastAPI WebSocket simulator server for DreamCompanion: Corner Edition."""

import asyncio
import json
import logging
from contextlib import asynccontextmanager
from pathlib import Path
import sys
from typing import Set, Dict, Any

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Add lambda_ask_corner to sys.path for unified local execution
sys.path.append(str(Path(__file__).resolve().parent.parent.parent / "lambda_ask_corner"))
try:
    from dotenv import load_dotenv
    load_dotenv(Path(__file__).resolve().parent.parent.parent / ".env")
except ImportError:
    pass

try:
    from handler import lambda_handler
except ImportError:
    lambda_handler = None

from app.simulator import MatchSimulator
from app.models import MatchInfo, SimulatorState, DeliveryUpdate

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("dreamcompanion.simulator")

simulator = MatchSimulator()


class ConnectionManager:
    """Manages active WebSocket connections and broadcasts."""

    def __init__(self):
        self.active_connections: Set[WebSocket] = set()

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.add(websocket)
        logger.info("Client connected. Total clients: %d", len(self.active_connections))

    def disconnect(self, websocket: WebSocket):
        self.active_connections.discard(websocket)
        logger.info("Client disconnected. Remaining: %d", len(self.active_connections))

    async def broadcast(self, message: Dict[str, Any]):
        for connection in list(self.active_connections):
            try:
                await connection.send_json(message)
            except Exception as e:
                logger.warning("Failed to send to client, removing: %s", e)
                self.active_connections.discard(connection)


manager = ConnectionManager()
sim_task: asyncio.Task = None
is_loop_running = False


async def simulation_loop():
    """Background loop that ticks deliveries when the simulator status is running."""
    global is_loop_running
    is_loop_running = True
    try:
        while True:
            if simulator.status == "running":
                delivery = simulator.step()
                if delivery:
                    await manager.broadcast({
                        "type": "ball_update",
                        "data": delivery.model_dump(),
                        "state": simulator.get_state().model_dump(),
                    })
                else:
                    await manager.broadcast({
                        "type": "match_completed",
                        "message": "Match simulation completed! CSK wins the IPL 2023 trophy!",
                        "state": simulator.get_state().model_dump(),
                    })
            await asyncio.sleep(simulator.interval_seconds)
    except asyncio.CancelledError:
        logger.info("Simulation loop cancelled.")
    finally:
        is_loop_running = False


@asynccontextmanager
async def lifespan(app: FastAPI):
    global sim_task
    sim_task = asyncio.create_task(simulation_loop())
    yield
    if sim_task:
        sim_task.cancel()
        try:
            await sim_task
        except asyncio.CancelledError:
            pass


app = FastAPI(
    title="DreamCompanion Simulator API",
    description="Mock-Live Cricket Match Simulator & WebSocket Feed",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health_check():
    """Health check endpoint for AWS App Runner and container probes."""
    return {"status": "ok", "service": "DreamCompanion Simulator v1.0"}


@app.get("/api/match-info", response_model=MatchInfo)
def get_match_info():
    """Retrieve match information and metadata."""
    return simulator.match_info


@app.get("/api/state", response_model=SimulatorState)
def get_simulator_state():
    """Retrieve current simulator state."""
    return simulator.get_state()


@app.get("/api/deliveries")
def get_all_deliveries():
    """Retrieve the full list of match deliveries."""
    return simulator.deliveries


class ControlRequest(BaseModel):
    action: str
    interval: float = 5.0


@app.post("/ask")
async def ask_corner_endpoint(request: Request):
    """Direct route to Ask Corner AI chat service (mirrors AWS Lambda behavior)."""
    if not lambda_handler:
        raise HTTPException(status_code=500, detail="Ask Corner handler not loaded")
    body = await request.json()
    event = {
        "httpMethod": "POST",
        "body": json.dumps(body),
    }
    result = lambda_handler(event, None)
    return json.loads(result["body"])


@app.post("/api/simulator/control")
async def control_simulator(request: ControlRequest):
    """Control the match simulation via REST."""
    action = request.action.lower()
    last_delivery = None

    if action == "start":
        simulator.resume()
    elif action == "pause":
        simulator.pause()
    elif action == "reset":
        simulator.reset()
    elif action == "step":
        last_delivery = simulator.step()
    elif action == "set_interval":
        simulator.set_interval(request.interval)
    else:
        raise HTTPException(status_code=400, detail=f"Unknown action: {action}")

    state = simulator.get_state()
    event_payload = {
        "type": f"control_{action}",
        "state": state.model_dump(),
        "delivery": last_delivery.model_dump() if last_delivery else None,
    }
    await manager.broadcast(event_payload)

    return event_payload


@app.websocket("/ws/simulator")
async def websocket_simulator_endpoint(websocket: WebSocket):
    """WebSocket endpoint pushing ball-by-ball updates and accepting controls."""
    await manager.connect(websocket)

    # Send initial welcome and state snapshot
    await websocket.send_json({
        "type": "init",
        "match_info": simulator.match_info.model_dump(),
        "state": simulator.get_state().model_dump(),
    })

    try:
        while True:
            text_data = await websocket.receive_text()
            try:
                data = json.loads(text_data)
                action = data.get("action", "").lower()

                if action == "start":
                    simulator.resume()
                    await manager.broadcast({
                        "type": "control_start",
                        "state": simulator.get_state().model_dump(),
                    })
                elif action == "pause":
                    simulator.pause()
                    await manager.broadcast({
                        "type": "control_pause",
                        "state": simulator.get_state().model_dump(),
                    })
                elif action == "reset":
                    simulator.reset()
                    await manager.broadcast({
                        "type": "control_reset",
                        "state": simulator.get_state().model_dump(),
                    })
                elif action == "step":
                    deliv = simulator.step()
                    if deliv:
                        await manager.broadcast({
                            "type": "ball_update",
                            "data": deliv.model_dump(),
                            "state": simulator.get_state().model_dump(),
                        })
                elif action == "set_interval":
                    interval = float(data.get("interval", 5.0))
                    simulator.set_interval(interval)
                    await manager.broadcast({
                        "type": "control_set_interval",
                        "interval": simulator.interval_seconds,
                    })
            except json.JSONDecodeError:
                await websocket.send_json({"type": "error", "message": "Invalid JSON format."})
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        logger.error("WebSocket exception: %s", e)
        manager.disconnect(websocket)

