import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "DreamCompanion" in data["service"]


def test_match_info_endpoint():
    response = client.get("/api/match-info")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == "ipl_2023_final"
    assert data["revised_target"] == 171


def test_simulator_state_endpoint():
    response = client.get("/api/state")
    assert response.status_code == 200
    data = response.json()
    assert "status" in data
    assert "current_index" in data
    assert "total_balls" in data


def test_control_endpoint():
    # Reset first
    res = client.post("/api/simulator/control", json={"action": "reset"})
    assert res.status_code == 200
    assert res.json()["state"]["current_index"] == 0

    # Step one delivery
    res = client.post("/api/simulator/control", json={"action": "step"})
    assert res.status_code == 200
    assert res.json()["state"]["current_index"] == 1
    assert res.json()["delivery"]["ball_index"] == 1

    # Reset again
    res = client.post("/api/simulator/control", json={"action": "reset"})
    assert res.status_code == 200
    assert res.json()["state"]["current_index"] == 0

    # Invalid action
    res = client.post("/api/simulator/control", json={"action": "invalid_action"})
    assert res.status_code == 400


def test_deliveries_endpoint():
    response = client.get("/api/deliveries")
    assert response.status_code == 200
    deliveries = response.json()
    assert len(deliveries) == 12
    for d in deliveries:
        assert "shot_name" in d
        assert "win_prob_csk" in d


def test_ask_endpoint_local():
    response = client.post("/ask", json={"question": "What is Dhoni's strategy?"})
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "response" in data


def test_ask_endpoint_empty_and_invalid():
    # Empty question
    res_empty = client.post("/ask", json={"question": ""})
    assert res_empty.status_code == 400

    # Missing question key
    res_no_q = client.post("/ask", json={"match_context": "test"})
    assert res_no_q.status_code == 400

    # Invalid non-dict JSON body
    res_non_dict = client.post("/ask", content="12345", headers={"Content-Type": "application/json"})
    assert res_non_dict.status_code == 400

    # Empty raw body
    res_raw_empty = client.post("/ask", content="", headers={"Content-Type": "application/json"})
    assert res_raw_empty.status_code == 400

    # Oversized payload (>64KB)
    huge_body = {"question": "x" * 70000}
    res_huge = client.post("/ask", json=huge_body)
    assert res_huge.status_code == 413


def test_control_interval_bounds():
    # Interval below min clamped to 0.2
    res_low = client.post("/api/simulator/control", json={"action": "set_interval", "interval": 0.05})
    assert res_low.status_code == 200
    assert res_low.json()["state"]["interval_seconds"] == 0.2

    # Interval above max clamped to 60.0
    res_high = client.post("/api/simulator/control", json={"action": "set_interval", "interval": 120.0})
    assert res_high.status_code == 200
    assert res_high.json()["state"]["interval_seconds"] == 60.0

    # Normal interval
    res_norm = client.post("/api/simulator/control", json={"action": "set_interval", "interval": 3.0})
    assert res_norm.status_code == 200
    assert res_norm.json()["state"]["interval_seconds"] == 3.0

    # Reset back to default
    client.post("/api/simulator/control", json={"action": "set_interval", "interval": 5.0})


def test_control_all_actions():
    # Start
    res_start = client.post("/api/simulator/control", json={"action": "start"})
    assert res_start.status_code == 200
    assert res_start.json()["state"]["status"] == "running"

    # Pause
    res_pause = client.post("/api/simulator/control", json={"action": "pause"})
    assert res_pause.status_code == 200
    assert res_pause.json()["state"]["status"] == "paused"

    # Reset
    res_reset = client.post("/api/simulator/control", json={"action": "reset"})
    assert res_reset.status_code == 200
    assert res_reset.json()["state"]["status"] == "idle"

