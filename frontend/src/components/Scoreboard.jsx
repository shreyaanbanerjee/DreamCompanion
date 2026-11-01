import React, { useState } from 'react';
import WinProbabilityBar from './WinProbabilityBar';
import ShotVisualizer from './ShotVisualizer';
import { playTick } from '../utils/audioFx';

export default function Scoreboard({
  delivery,
  matchInfo,
  recentBalls = [],
  onResetToLive,
}) {
  const [inspectedBall, setInspectedBall] = useState(null);

  if (!delivery) return null;

  // Active ball being displayed (either inspected or current live delivery)
  const displayDelivery = inspectedBall || delivery;

  const getBallStyle = (b) => {
    const isSelected = displayDelivery.ball_index === b.ball_index;
    const borderStyle = isSelected ? 'ring-2 ring-white ring-offset-2 ring-offset-[#111827]' : '';

    if (b.is_wicket) return `bg-rose-600 text-white font-bold ${borderStyle}`;
    if (b.runs_scored === 6) return `bg-amber-400 text-slate-950 font-black ${borderStyle}`;
    if (b.runs_scored === 4) return `bg-emerald-400 text-slate-950 font-bold ${borderStyle}`;
    if (b.runs_scored === 0) return `bg-slate-800 text-slate-400 ${borderStyle}`;
    return `bg-slate-700 text-slate-200 font-semibold ${borderStyle}`;
  };

  const getBallLabel = (b) => {
    if (b.is_wicket) return 'W';
    if (b.runs_scored === 0) return '•';
    return b.runs_scored.toString();
  };

  const strikeRate = (runs, balls) => (balls > 0 ? ((runs / balls) * 100).toFixed(1) : '0.0');
  const isMatchWon = displayDelivery.runs_needed <= 0 && displayDelivery.ball_index > 0;

  const handleBallClick = (ball) => {
    playTick();
    if (inspectedBall && inspectedBall.ball_index === ball.ball_index) {
      setInspectedBall(null);
    } else {
      setInspectedBall(ball);
    }
  };

  const handleReturnToLive = () => {
    playTick();
    setInspectedBall(null);
    onResetToLive?.();
  };

  return (
    <div className="bg-[#111827] rounded-xl border border-slate-800 p-4 sm:p-5">
      {/* Top Meta Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3 mb-4 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-200">
            {matchInfo?.subtitle || 'Chennai Super Kings vs Gujarat Titans'}
          </span>
          <span className="text-slate-500">•</span>
          <span className="text-slate-400">Target: <strong className="text-white">{displayDelivery.target}</strong> (15 ov, DLS)</span>
        </div>

        <div className="flex items-center gap-4 text-slate-400 font-mono text-[11px]">
          <div>CRR: <span className="text-white font-semibold">{displayDelivery.crr.toFixed(2)}</span></div>
          <div>RRR: <span className={`font-semibold ${displayDelivery.rrr > 20 ? 'text-rose-400 font-bold' : 'text-amber-300'}`}>{displayDelivery.rrr.toFixed(2)}</span></div>
        </div>
      </div>

      {/* Replay / Scrubber Status Banner */}
      {inspectedBall && (
        <div className="mb-4 bg-amber-400/10 border border-amber-400/30 rounded-lg p-2.5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-amber-300 font-semibold">
              Scrubber Active: Inspecting Over {inspectedBall.over_display} ({inspectedBall.runs_scored} runs{inspectedBall.is_wicket ? ', Wicket' : ''})
            </span>
          </div>
          <button
            onClick={handleReturnToLive}
            className="px-2.5 py-1 rounded bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold transition-colors text-[11px]"
          >
            Return to Live ➔
          </button>
        </div>
      )}

      {/* Main Score & Equation Header */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center mb-4">
        {/* Score Display */}
        <div className="md:col-span-7 flex flex-wrap items-baseline gap-3">
          <span className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            CSK
          </span>
          <span className="text-4xl sm:text-5xl font-black text-amber-400 font-mono tracking-tight">
            {displayDelivery.score_after}
          </span>
          <span className="text-sm font-medium text-slate-400 font-mono">
            ({displayDelivery.over_display} / 15 ov)
          </span>
        </div>

        {/* Target Equation */}
        <div className="md:col-span-5 flex md:justify-end">
          <div className={`px-4 py-2.5 rounded-lg border text-right w-full sm:w-auto ${
            isMatchWon
              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300 font-bold'
              : 'bg-slate-900 border-slate-800 text-slate-200'
          }`}>
            <div className="text-[10px] uppercase tracking-wider text-slate-400 mb-0.5">
              {isMatchWon ? 'Result' : 'Match Equation'}
            </div>
            {isMatchWon ? (
              <div className="text-sm font-bold text-emerald-400">
                CSK WON BY 5 WICKETS
              </div>
            ) : (
              <div className="text-base font-bold font-mono">
                <span className="text-amber-300">{displayDelivery.runs_needed}</span> runs in{' '}
                <span className="text-white">{displayDelivery.balls_remaining}</span> balls
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Win Probability Forecaster */}
      <WinProbabilityBar delivery={displayDelivery} />

      {/* Recent Deliveries Time Machine Pills */}
      <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1 text-xs">
        <span className="text-slate-400 text-[11px] shrink-0 font-medium mr-1">
          Scrubber ({recentBalls.length}):
        </span>
        {recentBalls.length === 0 ? (
          <span className="text-slate-500 italic text-xs">Waiting for first delivery...</span>
        ) : (
          recentBalls.map((b, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleBallClick(b)}
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-mono transition-transform hover:scale-110 active:scale-95 ${getBallStyle(b)}`}
              title={`Ball ${b.over_display}: ${b.runs_scored} runs (${b.milestone_type || 'NORMAL'}). Click to inspect!`}
            >
              {getBallLabel(b)}
            </button>
          ))
        )}
      </div>

      {/* Championship Climax Victory Card */}
      {isMatchWon && (
        <div className="mb-4 bg-gradient-to-r from-amber-500/20 via-emerald-500/20 to-amber-500/20 border border-amber-400/50 rounded-xl p-3.5 text-center">
          <div className="text-xs uppercase font-extrabold tracking-widest text-amber-300">
            TATA IPL 2023 Champions
          </div>
          <div className="text-lg sm:text-xl font-black text-white my-1">
            CHENNAI SUPER KINGS WIN 5TH TITLE!
          </div>
          <p className="text-xs text-slate-300 max-w-xl mx-auto">
            Ravindra Jadeja scripts history with 6 and 4 off the final 2 balls off Mohit Sharma! Pure Yellow Army euphoria in Ahmedabad!
          </p>
        </div>
      )}

      {/* Batting, Bowling & Field Radar Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 text-xs font-mono mb-4">
        {/* Batters & Bowler: 7 cols */}
        <div className="lg:col-span-7 space-y-3">
          {/* Batters */}
          <div className="bg-slate-900/80 rounded-lg p-3 border border-slate-800">
            <div className="text-[11px] font-semibold text-slate-400 mb-2 font-sans flex items-center justify-between border-b border-slate-800 pb-1">
              <span>Batting</span>
              <span>R (B) • 4s • 6s • SR</span>
            </div>
            <div className="space-y-1">
              {displayDelivery.batsmen && displayDelivery.batsmen.map((bat, idx) => (
                <div
                  key={idx}
                  className={`flex items-center justify-between py-1 px-1.5 rounded ${
                    bat.on_strike ? 'bg-amber-400/10 text-white font-medium' : 'text-slate-300'
                  }`}
                >
                  <div className="font-sans">
                    {bat.name} {bat.on_strike && <span className="text-amber-400">*</span>}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-white">{bat.runs} <span className="text-slate-400 font-normal">({bat.balls})</span></span>
                    <span className="text-slate-400">{bat.fours}</span>
                    <span className="text-amber-300">{bat.sixes}</span>
                    <span className="text-slate-400 text-right min-w-[36px]">{strikeRate(bat.runs, bat.balls)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bowler */}
          <div className="bg-slate-900/80 rounded-lg p-3 border border-slate-800">
            <div className="text-[11px] font-semibold text-slate-400 mb-2 font-sans flex items-center justify-between border-b border-slate-800 pb-1">
              <span>Bowling</span>
              <span>O • M • R • W • ECO</span>
            </div>
            {displayDelivery.bowler_stats ? (
              <div className="flex items-center justify-between py-1 px-1.5 text-white">
                <div className="font-medium font-sans">{displayDelivery.bowler_stats.name}</div>
                <div className="flex items-center gap-3 text-slate-300">
                  <span>{displayDelivery.bowler_stats.overs}</span>
                  <span className="text-slate-500">{displayDelivery.bowler_stats.maidens}</span>
                  <span className="text-slate-200">{displayDelivery.bowler_stats.runs}</span>
                  <span className="font-bold text-amber-300">{displayDelivery.bowler_stats.wickets}</span>
                  <span className="text-slate-400 text-right min-w-[36px]">
                    {(displayDelivery.bowler_stats.runs / (parseFloat(displayDelivery.bowler_stats.overs) || 1)).toFixed(1)}
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-slate-500 py-1">No bowler active</div>
            )}
          </div>
        </div>

        {/* Shot Radar & Wagon Wheel: 5 cols */}
        <div className="lg:col-span-5 flex flex-col justify-stretch">
          <ShotVisualizer delivery={displayDelivery} />
        </div>
      </div>

      {/* Live Commentary Feed */}
      <div className="bg-slate-900/60 rounded-lg p-3 border border-slate-800 text-xs">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">
            Live Commentary
          </span>
          {displayDelivery.is_milestone && (
            <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-400 text-slate-950 font-bold uppercase">
              {displayDelivery.milestone_type}
            </span>
          )}
        </div>
        <p className="text-slate-200 leading-relaxed font-sans text-xs sm:text-sm">
          {displayDelivery.ai_commentary || 'Waiting for next ball...'}
        </p>
      </div>
    </div>
  );
}
