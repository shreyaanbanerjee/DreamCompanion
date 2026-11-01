import React, { useMemo } from 'react';

export default function FanECG({ history = [], currentDelivery }) {
  const emotionalIndex = currentDelivery?.emotional_index ?? 50;

  const getTensionStatus = (val) => {
    if (val >= 90) return { label: 'Climax / Match Point', color: '#EF4444' };
    if (val >= 75) return { label: 'High Tension', color: '#F59E0B' };
    if (val >= 60) return { label: 'Building Momentum', color: '#3B82F6' };
    return { label: 'Steady State', color: '#10B981' };
  };

  const status = getTensionStatus(emotionalIndex);

  const width = 500;
  const height = 180;
  const padding = 24;

  const pointsData = useMemo(() => {
    if (!history || history.length === 0) {
      return [
        { x: padding, y: height / 2, label: '13.0', val: 50 },
        { x: width - padding, y: height / 2, label: '14.6', val: 50 },
      ];
    }

    const visibleHistory = history.slice(-14);
    const stepX = (width - padding * 2) / Math.max(visibleHistory.length - 1, 1);

    return visibleHistory.map((item, idx) => {
      const x = padding + idx * stepX;
      const val = item.emotional_index ?? 50;
      const y = height - padding - ((val / 100) * (height - padding * 2));
      return {
        x,
        y,
        label: item.over_display || `${idx + 1}`,
        val,
        runs: item.runs_scored,
        wicket: item.is_wicket,
      };
    });
  }, [history]);

  const polylinePoints = pointsData.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const areaPath = pointsData.length > 0
    ? `M ${pointsData[0].x},${height - padding} ` +
      pointsData.map((p) => `L ${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ') +
      ` L ${pointsData[pointsData.length - 1].x},${height - padding} Z`
    : '';

  const lastPoint = pointsData[pointsData.length - 1];

  return (
    <div className="bg-[#111827] rounded-xl border border-slate-800 p-4 sm:p-5 flex flex-col justify-between h-full">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-xs uppercase font-bold text-slate-300 tracking-wider">
              Match Momentum & Tension Index
            </h2>
            <div className="text-[11px] text-slate-400">
              Live sentiment tracking per delivery
            </div>
          </div>

          <div className="text-right">
            <span className="text-lg font-bold font-mono text-white">
              {emotionalIndex}%
            </span>
            <div className="text-[10px] font-semibold tracking-wide uppercase" style={{ color: status.color }}>
              {status.label}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mb-3">
          <div
            className="h-full rounded-full transition-all duration-300 ease-out"
            style={{ width: `${emotionalIndex}%`, backgroundColor: status.color }}
          />
        </div>
      </div>

      {/* SVG Waveform Area */}
      <div className="w-full bg-slate-900/80 rounded-lg border border-slate-800 p-2 my-2">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-36 sm:h-44 overflow-visible"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="tensionGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={status.color} stopOpacity="0.25" />
              <stop offset="100%" stopColor={status.color} stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Neutral 50% line */}
          <line
            x1={padding}
            y1={height - padding - (0.5 * (height - padding * 2))}
            x2={width - padding}
            y2={height - padding - (0.5 * (height - padding * 2))}
            stroke="#1F2937"
            strokeDasharray="3 3"
            strokeWidth="1"
          />

          {/* Area Fill */}
          {areaPath && <path d={areaPath} fill="url(#tensionGradient)" />}

          {/* Stroke Line */}
          {polylinePoints && (
            <polyline
              fill="none"
              stroke={status.color}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={polylinePoints}
            />
          )}

          {/* Data Points */}
          {pointsData.map((pt, i) => (
            <g key={i}>
              <circle
                cx={pt.x}
                cy={pt.y}
                r={pt.wicket ? 4 : pt.runs >= 4 ? 3.5 : 2}
                fill={pt.wicket ? '#EF4444' : pt.runs >= 4 ? '#10B981' : status.color}
                stroke="#111827"
                strokeWidth="1"
              />
              <text
                x={pt.x}
                y={height - 6}
                fill="#6B7280"
                fontSize="9"
                fontFamily="monospace"
                textAnchor="middle"
              >
                {pt.label}
              </text>
            </g>
          ))}

          {/* Latest Point Indicator */}
          {lastPoint && (
            <circle
              cx={lastPoint.x}
              cy={lastPoint.y}
              r="4.5"
              fill={status.color}
              stroke="#FFFFFF"
              strokeWidth="1.5"
            />
          )}
        </svg>

        <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono px-2 pt-1 border-t border-slate-800">
          <span>Boundary spike: Green • Wicket dip: Red</span>
          <span>Timeline (Overs)</span>
        </div>
      </div>

      <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1">
        <span>Current Phase: Death Overs (13-15)</span>
        <span className="font-mono text-slate-500">CSK Chase</span>
      </div>
    </div>
  );
}
