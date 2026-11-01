import React, { useState } from 'react';
import { toggleAudio, getAudioEnabled, playTick } from '../utils/audioFx';

export default function MatchControls({
  status,
  onStart,
  onPause,
  onReset,
  onStep,
  onSpeedChange,
  currentInterval = 5.0,
  isCloudFallback = false,
}) {
  const [soundActive, setSoundActive] = useState(getAudioEnabled());
  const isRunning = status === 'running';

  const handleAudioToggle = () => {
    const next = toggleAudio();
    setSoundActive(next);
    if (next) playTick();
  };

  return (
    <div className="bg-[#111827] border border-slate-800 rounded-xl p-3 sm:px-4 sm:py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
      {/* Playback Controls */}
      <div className="flex items-center gap-2">
        {!isRunning ? (
          <button
            onClick={() => {
              playTick();
              onStart();
            }}
            className="px-3.5 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold transition-colors"
          >
            {status === 'paused' ? 'Resume' : 'Start Match'}
          </button>
        ) : (
          <button
            onClick={() => {
              playTick();
              onPause();
            }}
            className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 font-semibold border border-amber-400/30 transition-colors"
          >
            Pause
          </button>
        )}

        <button
          onClick={() => {
            playTick();
            onStep();
          }}
          className="px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium transition-colors"
        >
          Next Ball
        </button>

        <button
          onClick={() => {
            playTick();
            onReset();
          }}
          className="px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700 transition-colors"
        >
          Reset
        </button>
      </div>

      {/* Speed & Audio Controls */}
      <div className="flex items-center gap-3">
        {/* Speed Controls */}
        <div className="flex items-center gap-1.5 text-slate-400">
          <span className="text-[11px] font-medium hidden sm:inline">Speed:</span>
          <div className="flex items-center bg-slate-900 rounded-lg p-0.5 border border-slate-800 font-mono text-[11px]">
            <button
              onClick={() => {
                playTick();
                onSpeedChange(5.0);
              }}
              className={`px-2.5 py-1 rounded transition-colors ${
                currentInterval === 5.0 ? 'bg-slate-800 text-amber-300 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              1x (5s)
            </button>
            <button
              onClick={() => {
                playTick();
                onSpeedChange(2.5);
              }}
              className={`px-2.5 py-1 rounded transition-colors ${
                currentInterval === 2.5 ? 'bg-slate-800 text-amber-300 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              2x (2.5s)
            </button>
            <button
              onClick={() => {
                playTick();
                onSpeedChange(1.0);
              }}
              className={`px-2.5 py-1 rounded transition-colors ${
                currentInterval === 1.0 ? 'bg-slate-800 text-amber-300 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              5x (1s)
            </button>
          </div>
        </div>

        {/* Audio FX Toggle */}
        <button
          type="button"
          onClick={handleAudioToggle}
          className={`px-2.5 py-1 rounded border text-[11px] font-mono transition-colors ${
            soundActive
              ? 'bg-amber-400/20 text-amber-300 border-amber-400/40 font-bold'
              : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
          }`}
          title="Toggle Web Audio sound effects (bat crack, crowd swell, wicket impact)"
        >
          Audio: {soundActive ? 'ON' : 'OFF'}
        </button>

        {/* Source Badge */}
        <div className="hidden lg:flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-900 border border-slate-800 font-mono text-[10px] text-slate-400">
          <span className={`w-1.5 h-1.5 rounded-full ${isCloudFallback ? 'bg-sky-400' : 'bg-emerald-400'}`} />
          <span>{isCloudFallback ? 'Cloud Engine' : 'FastAPI Stream'}</span>
        </div>
      </div>
    </div>
  );
}
