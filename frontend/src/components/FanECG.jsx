import React, { useMemo } from 'react';
import { Activity, Heart, Zap, TrendingUp, AlertTriangle } from 'lucide-react';

export default function FanECG({ history = [], currentDelivery }) {
  // Safe defaults
  const emotionalIndex = currentDelivery?.emotional_index ?? 50;
  const fanBpm = currentDelivery?.fan_bpm ?? 95;

  // Determine alert category & color
  const getIntensityLevel = (val) => {
    if (val >= 90) return { label: 'CRITICAL HYPERVENTILATION', color: '#FF2E54', bg: 'bg-rose-500/20', text: 'text-rose-400', stroke: '#FF2E54' };
    if (val >= 75) return { label: 'HIGH TENSION SURGE', color: '#FDB913', bg: 'bg-amber-500/20', text: 'text-amber-400', stroke: '#FDB913' };
    if (val >= 60) return { label: 'ELEVATED EXCITEMENT', color: '#0084FF', bg: 'bg-blue-500/20', text: 'text-blue-400', stroke: '#0084FF' };
    return { label: 'STEADY BASELINE', color: '#00E676', bg: 'bg-emerald-500/20', text: 'text-emerald-400', stroke: '#00E676' };
  };

  const intensity = getIntensityLevel(emotionalIndex);

  // SVG Chart Dimensions
  const width = 500;
  const height = 180;
  const padding = 28;

  // Generate SVG Points from history array
  const pointsData = useMemo(() => {
    if (!history || history.length === 0) {
      // Baseline flat ECG pulse
      return [
        { x: padding, y: height / 2, label: '0.0', val: 50 },
        { x: width - padding, y: height / 2, label: '0.0', val: 50 },
      ];
    }

    const maxItems = Math.min(history.length, 14);
    const visibleHistory = history.slice(-maxItems);
    const stepX = (width - padding * 2) / Math.max(visibleHistory.length - 1, 1);

    return visibleHistory.map((item, idx) => {
      const x = padding + idx * stepX;
      // Invert Y: 100 index -> top (padding), 0 index -> bottom (height - padding)
      const val = item.emotional_index ?? 50;
      const y = height - padding - ((val / 100) * (height - padding * 2));
      return {
        x,
        y,
        label: item.over_display || `${idx + 1}`,
        val,
        milestone: item.milestone_type,
        isMilestone: item.is_milestone,
        runs: item.runs_scored,
        wicket: item.is_wicket,
      };
    });
  }, [history]);

  // Construct SVG Polyline path string
  const polylinePoints = pointsData.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');

  // Construct closed area path for glowing gradient fill underneath
  const areaPath = pointsData.length > 0
    ? `M ${pointsData[0].x},${height - padding} ` +
      pointsData.map((p) => `L ${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ') +
      ` L ${pointsData[pointsData.length - 1].x},${height - padding} Z`
    : '';

  const lastPoint = pointsData[pointsData.length - 1];

  return (
    <div className="bg-csk-card rounded-2xl border border-csk-border/80 shadow-2xl p-4 sm:p-5 flex flex-col justify-between h-full relative overflow-hidden">
      {/* Background Cardiograph Grid Lines */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
        }}
      />

      {/* Top Header Bar */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-lg ${intensity.bg}`}>
              <Activity className="w-4 h-4" style={{ color: intensity.color }} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
                FAN ECG & BIOMETRIC MONITOR
              </h2>
              <div className="text-[11px] text-slate-400 font-medium">
                Live Yellow Army Emotional Index
              </div>
            </div>
          </div>

          {/* Real-time Heart Rate Counter */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-csk-navy/80 border border-csk-border">
            <Heart
              className="w-5 h-5 text-rose-500 fill-rose-500 animate-pulse"
              style={{
                animationDuration: `${Math.max(0.35, 60 / fanBpm).toFixed(2)}s`,
              }}
            />
            <div className="text-right">
              <div className="text-base font-extrabold font-mono-numbers leading-none text-white">
                {fanBpm} <span className="text-[10px] text-slate-400 font-sans font-normal">BPM</span>
              </div>
              <div className="text-[9px] uppercase font-bold tracking-wider" style={{ color: intensity.color }}>
                {intensity.label}
              </div>
            </div>
          </div>
        </div>

        {/* Tension Meter Bar */}
        <div className="space-y-1 mb-3">
          <div className="flex justify-between text-[11px] font-mono-numbers">
            <span className="text-slate-400">Emotional Intensity</span>
            <span className="font-bold" style={{ color: intensity.color }}>
              {emotionalIndex} / 100%
            </span>
          </div>
          <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-csk-border/50">
            <div
              className="h-full rounded-full transition-all duration-500 ease-out"
              style={{
                width: `${emotionalIndex}%`,
                backgroundColor: intensity.color,
                boxShadow: `0 0 10px ${intensity.color}`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Real-Time SVG Waveform Display */}
      <div className="relative w-full bg-slate-950/70 rounded-xl border border-csk-border/70 p-2 my-2 overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-36 sm:h-44 overflow-visible"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="ecgGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={intensity.color} stopOpacity="0.35" />
              <stop offset="100%" stopColor={intensity.color} stopOpacity="0.0" />
            </linearGradient>
            <filter id="ecgGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor={intensity.color} />
            </filter>
          </defs>

          {/* Reference baseline line */}
          <line
            x1={padding}
            y1={height - padding - ((50 / 100) * (height - padding * 2))}
            x2={width - padding}
            y2={height - padding - ((50 / 100) * (height - padding * 2))}
            stroke="#1E2D4A"
            strokeDasharray="4 4"
            strokeWidth="1"
          />

          {/* High tension danger line at 80% */}
          <line
            x1={padding}
            y1={height - padding - ((80 / 100) * (height - padding * 2))}
            x2={width - padding}
            y2={height - padding - ((80 / 100) * (height - padding * 2))}
            stroke="#FF2E54"
            strokeOpacity="0.3"
            strokeDasharray="2 4"
            strokeWidth="1"
          />

          {/* Gradient Fill under graph */}
          {areaPath && <path d={areaPath} fill="url(#ecgGradient)" />}

          {/* Main ECG Stroke Line */}
          {polylinePoints && (
            <polyline
              fill="none"
              stroke={intensity.stroke}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#ecgGlow)"
              points={polylinePoints}
            />
          )}

          {/* Deliveries Points & Event Markers */}
          {pointsData.map((pt, i) => {
            const isLatest = i === pointsData.length - 1;
            return (
              <g key={i}>
                {/* Node circle */}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={pt.wicket || pt.runs >= 4 ? 4.5 : isLatest ? 4 : 2.5}
                  fill={pt.wicket ? '#FF2E54' : pt.runs === 6 ? '#FFD700' : pt.runs === 4 ? '#00E676' : intensity.color}
                  stroke="#070C18"
                  strokeWidth="1.5"
                />

                {/* Over label on bottom axis */}
                <text
                  x={pt.x}
                  y={height - 8}
                  fill="#64748B"
                  fontSize="9"
                  fontFamily="JetBrains Mono, monospace"
                  textAnchor="middle"
                >
                  {pt.label}
                </text>
              </g>
            );
          })}

          {/* Animated Playhead Ping on Latest Point */}
          {lastPoint && (
            <g>
              <circle
                cx={lastPoint.x}
                cy={lastPoint.y}
                r="7"
                fill="none"
                stroke={intensity.color}
                strokeWidth="2"
                className="animate-ping"
              />
            </g>
          )}
        </svg>

        {/* Legend pills */}
        <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono-numbers px-2 pt-1 border-t border-slate-900">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" /> 4s
            <span className="w-2 h-2 rounded-full bg-amber-400 inline-block ml-1" /> 6s
            <span className="w-2 h-2 rounded-full bg-rose-500 inline-block ml-1" /> Wkt
          </span>
          <span className="text-slate-500 font-sans">Real-time Ball Synchronized</span>
        </div>
      </div>

      {/* Bottom Insights Footnote */}
      <div className="text-[11px] text-slate-400 bg-csk-navy/40 p-2.5 rounded-xl border border-csk-border/40 flex items-center justify-between">
        <span className="flex items-center gap-1.5 font-medium">
          <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
          Climax Swing: <strong className="text-white">{emotionalIndex >= 90 ? 'Extreme Palpitations' : 'High Voltage'}</strong>
        </span>
        <span className="font-mono text-slate-500 text-[10px]">
          Target: 171
        </span>
      </div>
    </div>
  );
}

