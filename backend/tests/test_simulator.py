import pytest
from app.simulator import MatchSimulator
from app.models import DeliveryUpdate


def test_match_simulator_loads_data():
    sim = MatchSimulator()
    assert sim.total_balls > 0
    assert sim.match_info.id == "ipl_2023_final"
    assert sim.match_info.revised_target == 171


def test_match_simulator_initial_state():
    sim = MatchSimulator()
    assert sim.status == "idle"
    assert sim.current_index == 0
    assert sim.get_latest_delivery() is None


def test_match_simulator_step_advance():
    sim = MatchSimulator()
    delivery = sim.step()
    assert delivery is not None
    assert isinstance(delivery, DeliveryUpdate)
    assert delivery.ball_index == 1
    assert sim.current_index == 1
    assert sim.status == "running"


def test_match_simulator_reach_completion():
    sim = MatchSimulator()
    for _ in range(sim.total_balls):
        delivery = sim.step()
    
    assert sim.status == "completed"
    assert sim.current_index == sim.total_balls
    # Stepping when completed should return None
    assert sim.step() is None


def test_match_simulator_reset():
    sim = MatchSimulator()
    sim.step()
    sim.step()
    assert sim.current_index == 2
    sim.reset()
    assert sim.current_index == 0
    assert sim.status == "idle"
    assert sim.get_latest_delivery() is None


def test_match_simulator_pause_resume():
    sim = MatchSimulator()
    sim.step()
    sim.pause()
    assert sim.status == "paused"
    sim.resume()
    assert sim.status == "running"

