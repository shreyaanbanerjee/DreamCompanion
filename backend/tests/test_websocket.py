import json
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_websocket_connection_and_init():
    with client.websocket_connect("/ws/simulator") as websocket:
        init_data = websocket.receive_json()
        assert init_data["type"] == "init"
        assert "match_info" in init_data
        assert "state" in init_data
        assert init_data["match_info"]["id"] == "ipl_2023_final"


def test_websocket_step_and_reset():
    with client.websocket_connect("/ws/simulator") as websocket:
        # Read init message
        websocket.receive_json()

        # Send step
        websocket.send_text(json.dumps({"action": "step"}))
        step_response = websocket.receive_json()
        assert step_response["type"] == "ball_update"
        assert "data" in step_response
        assert step_response["data"]["ball_index"] == 1
        assert "shot_name" in step_response["data"]
        assert "win_prob_csk" in step_response["data"]

        # Send reset
        websocket.send_text(json.dumps({"action": "reset"}))
        reset_response = websocket.receive_json()
        assert reset_response["type"] == "control_reset"
        assert reset_response["state"]["current_index"] == 0


def test_websocket_speed_interval():
    with client.websocket_connect("/ws/simulator") as websocket:
        websocket.receive_json()

        # Set speed
        websocket.send_text(json.dumps({"action": "set_interval", "interval": 1.5}))
        interval_response = websocket.receive_json()
        assert interval_response["type"] == "control_set_interval"
        assert interval_response["interval"] == 1.5


def test_websocket_invalid_json():
    with client.websocket_connect("/ws/simulator") as websocket:
        websocket.receive_json()
        websocket.send_text("this-is-not-json")
        err_response = websocket.receive_json()
        assert err_response["type"] == "error"
