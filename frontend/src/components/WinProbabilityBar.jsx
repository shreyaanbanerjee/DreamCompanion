import React from 'react';

/**
 * Win Probability Forecaster & Delta Meter.
 * Broadcast-style real-time win predictor for CSK vs GT.
 */
export default function WinProbabilityBar({ delivery }) {
  if (!delivery) return null;

  const cskProb = Math.min(Math.max(delivery.win_prob_csk ?? 50, 0), 100);
  const gtProb = Math.min(Math.max(delivery.win_prob_gt ?? (100 - cskProb), 0), 100);
  const delta = delivery.win_prob_delta ?? 0;

  const getDeltaBadge = () => {
    if (delta > 0) {
      return (
        <span className="text-emerald-400 font-mono font-bold text-[11px] bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
          ▲ +{delta}% CSK Shift
        </span>
      );
    }
    if (delta < 0) {
      return (
        <span className="text-rose-400 font-mono font-bold text-[11px] bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
          ▼ {delta}% CSK Shift
        </span>
      );
    }
    return (
      <span className="text-slate-400 font-mono text-[11px] bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">
        Neutral Equilibrium
      </span>
    );
  };

  return (
    <div className="bg-slate-900/90 rounded-lg p-3 border border-slate-800 mb-4">
      {/* Header labels */}
      <div className="flex items-center justify-between text-xs mb-2">
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            Win Probability
          </span>
          {getDeltaBadge()}
        </div>

        <div className="text-[11px] font-mono text-slate-400">
          Live AI Win Engine
        </div>
      </div>

      {/* Percentage numbers */}
      <div className="flex items-center justify-between mb-1.5 font-mono text-sm font-bold">
        <div className="flex items-center gap-1.5 text-amber-300">
          <span className="w-2 h-2 rounded-full bg-amber-400" />
          <span>CSK {cskProb}%</span>
        </div>
        <div className="flex items-center gap-1.5 text-sky-400">
          <span>GT {gtProb}%</span>
          <span className="w-2 h-2 rounded-full bg-sky-400" />
        </div>
      </div>

      {/* Split Probability Bar */}
      <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden flex">
        <div
          className="h-full bg-amber-400 transition-all duration-500 ease-out"
          style={{ width: `${cskProb}%` }}
          title={`CSK Win Probability: ${cskProb}%`}
        />
        <div
          className="h-full bg-sky-500 transition-all duration-500 ease-out"
          style={{ width: `${gtProb}%` }}
          title={`GT Win Probability: ${gtProb}%`}
        />
      </div>

      {/* Dynamic Tactical Subtitle */}
      <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between">
        <span>
          {delivery.runs_needed <= 0
            ? 'Match Finished: Chennai Super Kings win the IPL 2023 title!'
            : `${delivery.runs_needed} runs required from ${delivery.balls_remaining} deliveries`}
        </span>
        <span className="font-mono text-[10px] text-slate-500">
          Over {delivery.over_display}
        </span>
      </div>
    </div>
  );
}
