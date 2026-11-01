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

