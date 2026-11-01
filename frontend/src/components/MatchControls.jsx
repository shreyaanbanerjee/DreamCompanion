import React from 'react';
import { Play, Pause, RotateCcw, FastForward, Clock } from 'lucide-react';

export default function MatchControls({
  status,
  onStart,
  onPause,
  onReset,
  onStep,
  onSpeedChange,
  currentInterval = 5.0,
}) {
  const isRunning = status === 'running';

  return (
    <div className="bg-csk-card/90 border border-csk-border rounded-2xl p-3 sm:px-6 sm:py-3.5 shadow-xl flex flex-wrap items-center justify-between gap-4">
      {/* Primary Action Buttons */}
      <div className="flex items-center gap-2">
        {!isRunning ? (
          <button
            onClick={onStart}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-csk-yellow text-slate-950 font-bold text-xs sm:text-sm hover:bg-amber-400 tactile-btn shadow-lg shadow-amber-500/25"
          >
            <Play className="w-4 h-4 fill-slate-950" />
            <span>{status === 'paused' ? 'Resume Match' : 'Start Match'}</span>
          </button>
        ) : (
          <button
            onClick={onPause}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold text-xs sm:text-sm hover:bg-amber-500/30 tactile-btn"
          >
            <Pause className="w-4 h-4 fill-amber-300" />
            <span>Pause</span>
          </button>
        )}

        <button
          onClick={onStep}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-csk-navy text-slate-200 border border-csk-border hover:bg-csk-border font-medium text-xs sm:text-sm tactile-btn"
          title="Deliver single ball manually"
        >
          <FastForward className="w-3.5 h-3.5" />
          <span>Next Ball</span>
        </button>

        <button
          onClick={onReset}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-csk-navy text-slate-400 hover:text-slate-200 border border-csk-border hover:bg-csk-border font-medium text-xs sm:text-sm tactile-btn"
          title="Reset match simulation"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </div>

      {/* Speed Multiplier & Cadence */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-slate-400 flex items-center gap-1 font-medium hidden sm:flex">
          <Clock className="w-3.5 h-3.5 text-csk-yellow" />
          <span>Simulation Speed:</span>
        </span>

        <div className="flex items-center p-1 rounded-xl bg-csk-navy border border-csk-border text-xs font-mono">
          <button
            onClick={() => onSpeedChange(5.0)}
            className={`px-2.5 py-1 rounded-lg transition-colors tactile-btn ${
              currentInterval === 5.0
                ? 'bg-csk-yellow text-slate-950 font-bold shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            1x (5s)
          </button>
          <button
            onClick={() => onSpeedChange(2.5)}
            className={`px-2.5 py-1 rounded-lg transition-colors tactile-btn ${
              currentInterval === 2.5
                ? 'bg-csk-yellow text-slate-950 font-bold shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            2x (2.5s)
          </button>
          <button
            onClick={() => onSpeedChange(1.0)}
            className={`px-2.5 py-1 rounded-lg transition-colors tactile-btn ${
              currentInterval === 1.0
                ? 'bg-csk-yellow text-slate-950 font-bold shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            5x (1s)
          </button>
        </div>
      </div>
    </div>
  );
}

