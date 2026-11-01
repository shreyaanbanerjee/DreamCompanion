import json
import pytest
from pathlib import Path
from app.models import DeliveryUpdate, MatchInfo, SimulatorState


def test_match_data_file_integrity():
    data_path = Path(__file__).resolve().parents[1] / "app" / "data" / "match_data.json"
    assert data_path.exists(), "match_data.json must exist"

    with open(data_path, "r") as f:
        data = json.load(f)

    assert "match_info" in data
    assert "deliveries" in data

    match_info = MatchInfo(**data["match_info"])
    assert match_info.id == "ipl_2023_final"
    assert match_info.revised_target == 171
    assert match_info.total_overs == 15

    deliveries = data["deliveries"]
    assert len(deliveries) == 12, "Must contain exactly 12 climax deliveries (13.1 to 14.6)"

    for idx, d in enumerate(deliveries, start=1):
        parsed = DeliveryUpdate(**d)
        assert parsed.ball_index == idx
        assert 0 <= parsed.emotional_index <= 100
        assert 0 <= parsed.win_prob_csk <= 100
        assert 0 <= parsed.win_prob_gt <= 100
        assert parsed.win_prob_csk + parsed.win_prob_gt == 100, f"Win probabilities must sum to 100 on ball {idx}"

        # Verify shot telemetry
        assert parsed.shot_name is not None and len(parsed.shot_name) > 0
        assert parsed.shot_zone is not None and len(parsed.shot_zone) > 0
        assert 0 <= parsed.shot_angle_deg <= 360
        assert parsed.shot_distance_m >= 0
        assert parsed.ball_speed_kph is None or 110.0 <= parsed.ball_speed_kph <= 155.0


def test_match_progression_logic():
    data_path = Path(__file__).resolve().parents[1] / "app" / "data" / "match_data.json"
    with open(data_path, "r") as f:
        deliveries = json.load(f)["deliveries"]

    # First ball should be 13.1
    assert deliveries[0]["over_display"] == "13.1"
    assert deliveries[0]["runs_needed"] == 32

    # Sixth ball should be 13.6
    assert deliveries[5]["over_display"] == "13.6"

    # Seventh ball should be 14.1
    assert deliveries[6]["over_display"] == "14.1"

    # Final ball 14.6 should achieve target
    final_ball = deliveries[11]
    assert final_ball["over_display"] == "14.6"
    assert final_ball["runs_needed"] <= 0
    assert final_ball["win_prob_csk"] == 100
    assert final_ball["win_prob_gt"] == 0
