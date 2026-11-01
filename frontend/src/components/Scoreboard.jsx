import React from 'react';
import { Flame, Sparkles, ChevronRight, AlertCircle, Award } from 'lucide-react';

export default function Scoreboard({ delivery, matchInfo, recentBalls = [] }) {
  if (!delivery) return null;

  const getBallBadgeStyle = (b) => {
    if (b.is_wicket) return 'bg-rose-600/90 text-white font-bold ring-2 ring-rose-400/50';
    if (b.runs_scored === 6) return 'bg-amber-500 text-slate-950 font-black ring-2 ring-amber-300 shadow-lg shadow-amber-500/30';
    if (b.runs_scored === 4) return 'bg-emerald-500 text-slate-950 font-black ring-2 ring-emerald-300 shadow-md shadow-emerald-500/20';
    if (b.runs_scored === 0) return 'bg-slate-800 text-slate-400 font-medium';
    return 'bg-blue-900/60 text-blue-200 font-semibold border border-blue-500/30';
  };

  const getBallText = (b) => {
    if (b.is_wicket) return 'W';
    if (b.runs_scored === 0) return '•';
    return b.runs_scored.toString();
  };

  const strikeRate = (runs, balls) => (balls > 0 ? ((runs / balls) * 100).toFixed(1) : '0.0');

  const isFinalBalls = delivery.balls_remaining <= 6 && delivery.balls_remaining > 0;
  const isMatchWon = delivery.runs_needed <= 0 && delivery.ball_index > 0;

  return (
    <div className="bg-csk-card rounded-2xl border border-csk-border/80 shadow-2xl p-4 sm:p-6 overflow-hidden relative">
      {/* Subtle background glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

      {/* Top Meta Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-csk-border/50 pb-3 mb-4 text-xs">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full bg-amber-400/15 text-amber-300 font-bold border border-amber-400/30 uppercase tracking-wider text-[11px]">
            IPL Final Thriller
          </span>
          <span className="text-slate-400">Target: <strong className="text-white">{delivery.target}</strong> in 15 ov (DLS)</span>
        </div>

        <div className="flex items-center gap-4 text-slate-400 font-mono-numbers">
          <div>CRR: <span className="text-white font-semibold">{delivery.crr.toFixed(2)}</span></div>
          <div>RRR: <span className={`font-semibold ${delivery.rrr > 20 ? 'text-rose-400 font-bold animate-pulse' : 'text-amber-300'}`}>{delivery.rrr.toFixed(2)}</span></div>
        </div>
      </div>

      {/* Main Score & Equation Centerpiece */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center mb-6">
        {/* Teams & Score */}
        <div className="lg:col-span-7 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-csk-navy/60 p-4 rounded-xl border border-csk-border/60">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold text-csk-yellow uppercase tracking-wider">Batting 2nd</span>
              <span className="text-slate-500">•</span>
              <span className="text-xs text-slate-300 font-medium">{matchInfo?.venue || "Ahmedabad"}</span>
            </div>
            <div className="flex items-baseline gap-3">
              <span className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                CSK
              </span>
              <span className="text-4xl sm:text-5xl font-black text-csk-yellow font-mono-numbers tracking-tight">
                {delivery.score_after}
              </span>
              <span className="text-sm sm:text-base font-medium text-slate-400 font-mono-numbers">
                ({delivery.over_display} / 15 ov)
              </span>
            </div>
          </div>

          {/* Equation Box */}
          <div className={`px-4 py-3 rounded-lg border text-right sm:min-w-[190px] ${
            isMatchWon
              ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
              : isFinalBalls
              ? 'bg-rose-500/15 border-rose-500/40 text-rose-300'
              : 'bg-csk-card border-csk-border text-slate-200'
          }`}>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-0.5">
              {isMatchWon ? 'Result' : 'Required to Win'}
            </div>
            {isMatchWon ? (
              <div className="text-sm font-bold text-emerald-400 flex items-center justify-end gap-1">
                <Award className="w-4 h-4" />
                CSK WON BY 5 WKTS!
              </div>
            ) : (
              <div className="text-base sm:text-lg font-black font-mono-numbers tracking-tight">
                <span className="text-csk-yellow">{delivery.runs_needed}</span> runs in{' '}
                <span className="text-white">{delivery.balls_remaining}</span> balls
              </div>
            )}
          </div>
        </div>

        {/* Recent Deliveries Capsules */}
        <div className="lg:col-span-5 flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Recent Deliveries</span>
            <span className="font-mono text-[11px] text-slate-500">Over {delivery.over_number + 1}</span>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto py-1">
            {recentBalls.length === 0 ? (
              <div className="text-xs text-slate-500 italic">Deliveries will appear here as simulation progresses</div>
            ) : (
              recentBalls.slice(-8).map((b, idx) => (
                <div
                  key={idx}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm transition-all duration-200 font-mono-numbers ${getBallBadgeStyle(b)}`}
                  title={`${b.over_display}: ${b.batsman} - ${b.runs_scored} runs ${b.is_wicket ? `(WICKET: ${b.dismissal})` : ''}`}
                >
                  {getBallText(b)}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Tables: Batsmen & Bowler Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono-numbers mb-4">
        {/* Batsmen on crease */}
        <div className="bg-csk-navy/40 rounded-xl p-3 border border-csk-border/50">
          <div className="text-[11px] uppercase tracking-wider font-semibold text-slate-400 mb-2 font-sans flex items-center justify-between">
            <span>Batters</span>
            <span>R (B) • 4s • 6s • SR</span>
          </div>
          <div className="space-y-1.5">
            {delivery.batsmen && delivery.batsmen.map((bat, idx) => (
              <div
                key={idx}
                className={`flex items-center justify-between py-1 px-2 rounded-lg transition-colors ${
                  bat.on_strike ? 'bg-amber-400/10 text-white font-medium border-l-2 border-csk-yellow' : 'text-slate-300'
                }`}
              >
                <div className="flex items-center gap-1.5 font-sans">
                  <span>{bat.name}</span>
                  {bat.on_strike && <span className="text-csk-yellow font-bold text-sm">*</span>}
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-white">{bat.runs} <span className="text-slate-400 font-normal">({bat.balls})</span></span>
                  <span className="text-slate-400">{bat.fours}</span>
                  <span className="text-amber-400 font-semibold">{bat.sixes}</span>
                  <span className="text-slate-300 font-mono text-[11px] min-w-[36px] text-right">{strikeRate(bat.runs, bat.balls)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Current Bowler */}
        <div className="bg-csk-navy/40 rounded-xl p-3 border border-csk-border/50">
          <div className="text-[11px] uppercase tracking-wider font-semibold text-slate-400 mb-2 font-sans flex items-center justify-between">
            <span>Current Bowler</span>
            <span>O • M • R • W • ECO</span>
          </div>
          {delivery.bowler_stats ? (
            <div className="flex items-center justify-between py-1 px-2 rounded-lg bg-csk-card/80 text-white">
              <div className="font-medium font-sans">{delivery.bowler_stats.name}</div>
              <div className="flex items-center gap-3 text-slate-300">
                <span>{delivery.bowler_stats.overs}</span>
                <span className="text-slate-500">{delivery.bowler_stats.maidens}</span>
                <span className="text-rose-300">{delivery.bowler_stats.runs}</span>
                <span className="font-bold text-amber-300">{delivery.bowler_stats.wickets}</span>
                <span className="text-slate-400 font-mono text-[11px] min-w-[36px] text-right">
                  {(delivery.bowler_stats.runs / (parseFloat(delivery.bowler_stats.overs) || 1)).toFixed(1)}
                </span>
              </div>
            </div>
          ) : (
            <div className="text-slate-500 py-1">No bowler stats available</div>
          )}
        </div>
      </div>

      {/* AI Commentary Stream Bar */}
      <div className="bg-gradient-to-r from-blue-950/40 via-csk-card to-amber-950/30 rounded-xl p-3 border border-amber-500/20 flex items-start gap-3 relative">
        <div className="p-2 rounded-lg bg-amber-500/20 text-amber-300 shrink-0 mt-0.5">
          <Sparkles className="w-4 h-4" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold text-amber-400 tracking-wider uppercase font-sans">
              AI Match Commentary
            </span>
            {delivery.is_milestone && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-csk-yellow text-slate-950 font-black uppercase tracking-wide">
                {delivery.milestone_type}
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans">
            {delivery.ai_commentary || "Waiting for next delivery..."}
          </p>
        </div>
      </div>
    </div>
  );
}

