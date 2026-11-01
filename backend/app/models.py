"""Pydantic V2 models for DreamCompanion match data, simulation state, and WebSocket messages."""

from typing import List, Optional, Literal
from pydantic import BaseModel, Field


class BatsmanStat(BaseModel):
    name: str = Field(description="Name of the batsman")
    runs: int = Field(default=0, ge=0, description="Runs scored by the batsman")
    balls: int = Field(default=0, ge=0, description="Balls faced")
    fours: int = Field(default=0, ge=0, description="Boundary fours hit")
    sixes: int = Field(default=0, ge=0, description="Sixes hit")
    on_strike: bool = Field(default=False, description="Whether currently on strike")


class BowlerStat(BaseModel):
    name: str = Field(description="Name of the bowler")
    overs: str = Field(description="Overs bowled, e.g. '2.4'")
    maidens: int = Field(default=0, ge=0, description="Maiden overs")
    runs: int = Field(default=0, ge=0, description="Runs conceded")
    wickets: int = Field(default=0, ge=0, description="Wickets taken")


class DeliveryUpdate(BaseModel):
    ball_index: int = Field(description="1-based sequence index")
    over_display: str = Field(description="Formatted over, e.g. '14.5'")
    over_number: int = Field(description="Completed overs count")
    ball_in_over: int = Field(description="Ball index within current over (1-6)")
    batsman: str = Field(description="Striker name")
    non_striker: str = Field(description="Non-striker name")
    bowler: str = Field(description="Current bowler name")
    runs_scored: int = Field(description="Runs on this delivery")
    is_wicket: bool = Field(default=False, description="Whether delivery resulted in wicket")
    dismissal: Optional[str] = Field(default=None, description="Dismissal info if wicket fell")
    extra: int = Field(default=0, description="Extras conceded")
    score_after: str = Field(description="Score string after ball, e.g. '167/5'")
    target: int = Field(description="Target runs to chase")
    runs_needed: int = Field(description="Remaining runs needed for victory")
    balls_remaining: int = Field(description="Balls remaining in match")
    crr: float = Field(description="Current Run Rate")
    rrr: float = Field(description="Required Run Rate")
    emotional_index: int = Field(ge=0, le=100, description="ECG tension / win probability swing (0-100)")
    fan_bpm: int = Field(description="Estimated fan heart rate BPM")
    is_milestone: bool = Field(default=False, description="Boundary, wicket, or milestone flag")
    milestone_type: str = Field(description="Type: SIX, FOUR, WICKET, SINGLE, DOT, MATCH_WINNER")
    ai_commentary: str = Field(description="Pre-generated dynamic AI commentary")
    batsmen: List[BatsmanStat] = Field(description="Active batsmen statistics")
    bowler_stats: BowlerStat = Field(description="Current bowler figures")


class MatchInfo(BaseModel):
    id: str
    title: str
    subtitle: str
    venue: str
    date: str
    revised_target: int
    total_overs: int
    match_situation: str


class SimulatorState(BaseModel):
    status: Literal["idle", "running", "paused", "completed"] = "idle"
    current_index: int = 0
    total_balls: int = 0
    interval_seconds: float = 5.0
    latest_delivery: Optional[DeliveryUpdate] = None

