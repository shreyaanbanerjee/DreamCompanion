import React from 'react';
import { playTick } from '../utils/audioFx';

const KEY_MOMENTS = [
  {
    ballIndex: 1,
    over: "13.1",
    label: "Rayudu Blitz (6)",
    note: "Rayudu launches Mohit over long-off to initiate the counter-attack",
    color: "text-amber-400 border-amber-400/30 hover:bg-amber-400/10",
  },
  {
    ballIndex: 4,
    over: "13.4",
    label: "Rayudu Out (W)",
    note: "Caught & bowled! Mohit breaks the partnership",
    color: "text-rose-400 border-rose-400/30 hover:bg-rose-400/10",
  },
  {
    ballIndex: 5,
    over: "13.5",
    label: "Dhoni 0(1) Duck",
    note: "Silence in Ahmedabad as Thala departs first ball! Win% drops to 24%",
    color: "text-rose-400 border-rose-400/30 hover:bg-rose-400/10",
  },
  {
    ballIndex: 10,
    over: "14.4",
    label: "10 off 2 Balls",
    note: "Peak pressure: CSK win probability drops to just 5%",
    color: "text-sky-400 border-sky-400/30 hover:bg-sky-400/10",
  },
  {
    ballIndex: 11,
    over: "14.5",
    label: "Jadeja's Six",
    note: "Clutch! Straight six over Mohit's head (+49% Win Delta shift)",
    color: "text-amber-400 border-amber-400/30 hover:bg-amber-400/10",
  },
  {
    ballIndex: 12,
    over: "14.6",
    label: "Title Winning Four",
    note: "Jadeja clips past short fine leg! CSK win 5th IPL title!",
    color: "text-emerald-400 border-emerald-400/30 hover:bg-emerald-400/10",
  },
];

export default function KeyMomentsBar({
  currentBallIndex,
  onJumpToMoment,
  onAutoPlayHighlights,
  isAutoPlaying,
}) {
  return (
    <div className="bg-[#111827] rounded-xl border border-slate-800 p-3 sm:px-4 sm:py-3 text-xs">
      {/* Title & Autoplay button */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2 pb-2 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase font-bold text-slate-300 tracking-wider">
            Key Match Moments
          </span>
          <span className="text-[10px] text-amber-400 font-mono bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
            One-Click Jumps
          </span>
        </div>

        <button
          type="button"
          onClick={() => {
            playTick();
            onAutoPlayHighlights?.();
          }}
          className={`px-3 py-1 rounded-lg text-[11px] font-bold font-mono transition-all flex items-center gap-1.5 ${
            isAutoPlaying
              ? 'bg-rose-500 hover:bg-rose-400 text-white'
              : 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-sm'
          }`}
          title="Auto-play the 12-ball climax at fast forward speed with stadium audio"
        >
          <span>{isAutoPlaying ? '⏹ Pause Highlights' : '▶ 30s Highlights Reel'}</span>
        </button>
      </div>

      {/* Quick jump pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        <span className="text-[11px] text-slate-500 font-medium shrink-0">
          Jump to:
        </span>
        {KEY_MOMENTS.map((moment) => {
          const isActive = currentBallIndex === moment.ballIndex;
          return (
            <button
              key={moment.ballIndex}
              type="button"
              onClick={() => {
                playTick();
                onJumpToMoment?.(moment.ballIndex);
              }}
              className={`px-2.5 py-1 rounded-lg border text-[11px] whitespace-nowrap transition-all font-mono ${
                isActive
                  ? 'bg-slate-800 text-white border-white ring-1 ring-white font-bold'
                  : `bg-slate-900/90 ${moment.color}`
              }`}
              title={moment.note}
            >
              <span className="text-slate-400 mr-1.5">{moment.over}</span>
              <span>{moment.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
