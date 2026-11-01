"""Match simulator state machine for DreamCompanion."""

import json
from pathlib import Path
from typing import List, Optional, Dict, Any
from app.models import DeliveryUpdate, MatchInfo, SimulatorState


class MatchSimulator:
    """Manages the playback of historical ball-by-ball match data."""

    def __init__(self, data_file_path: Optional[str] = None):
        if data_file_path:
            path = Path(data_file_path)
        else:
            path = Path(__file__).parent / "data" / "match_data.json"

        with open(path, "r", encoding="utf-8") as f:
            raw_data = json.load(f)

        self.match_info = MatchInfo(**raw_data["match_info"])
        self.deliveries: List[DeliveryUpdate] = [
            DeliveryUpdate(**d) for d in raw_data["deliveries"]
        ]
        self.total_balls = len(self.deliveries)
        self.current_index = 0
        self.status = "idle"
        self.interval_seconds = 5.0

    def get_latest_delivery(self) -> Optional[DeliveryUpdate]:
        if self.current_index == 0 or not self.deliveries:
            return None
        return self.deliveries[self.current_index - 1]

    def step(self) -> Optional[DeliveryUpdate]:
        """Advance one delivery. Return the DeliveryUpdate or None if finished."""
        if self.current_index >= self.total_balls:
            self.status = "completed"
            return None

        delivery = self.deliveries[self.current_index]
        self.current_index += 1
        self.status = "completed" if self.current_index >= self.total_balls else "running"
        return delivery

    def reset(self) -> None:
        """Reset match simulation back to ball 0."""
        self.current_index = 0
        self.status = "idle"

    def pause(self) -> None:
        """Pause running simulation."""
        if self.status == "running":
            self.status = "paused"

    def resume(self) -> None:
        """Resume paused or idle simulation."""
        if self.current_index < self.total_balls:
            self.status = "running"
        else:
            self.status = "completed"

    def set_interval(self, seconds: float) -> None:
        """Set interval between pushed deliveries."""
        self.interval_seconds = max(0.5, float(seconds))

    def get_state(self) -> SimulatorState:
        """Return snapshot of simulator state."""
        return SimulatorState(
            status=self.status,
            current_index=self.current_index,
            total_balls=self.total_balls,
            interval_seconds=self.interval_seconds,
            latest_delivery=self.get_latest_delivery(),
        )

