import React from 'react';

/**
 * Broadcast Shot Visualizer & Pitch Radar.
 * Displays field trajectory, release speed, shot name, and landing zone.
 */
export default function ShotVisualizer({ delivery }) {
  if (!delivery) return null;

  const width = 220;
  const height = 220;
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = 95;

  const angleDeg = delivery.shot_angle_deg ?? 0;
  // Convert polar angle to radians (0 = straight up / long-off / sightscreen)
  const angleRad = ((angleDeg - 90) * Math.PI) / 180;
  const distRatio = Math.min(Math.max((delivery.shot_distance_m || 20) / 105, 0.15), 0.98);
  const targetX = centerX + Math.cos(angleRad) * (radius * distRatio);
  const targetY = centerY + Math.sin(angleRad) * (radius * distRatio);

  const getTrajectoryColor = () => {
    if (delivery.is_wicket) return '#F43F5E'; // Rose
    if (delivery.runs_scored === 6) return '#FACC15'; // Amber
    if (delivery.runs_scored === 4) return '#34D399'; // Emerald
    if (delivery.runs_scored === 0) return '#64748B'; // Slate
    return '#38BDF8'; // Sky
  };

  const color = getTrajectoryColor();

  return (
    <div className="bg-slate-900/80 rounded-lg p-3 border border-slate-800 flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between text-xs mb-2 border-b border-slate-800 pb-1.5">
        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
          Field Radar • Ball Trajectory
        </span>
        <span className="font-mono text-[10px] text-slate-400">
          {delivery.ball_speed_kph ? `${delivery.ball_speed_kph} km/h` : '135 km/h'}
        </span>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-3">
        {/* SVG Wagon Wheel / Ground Radar */}
        <div className="relative w-36 h-36 shrink-0">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
            {/* Outer boundary rope */}
            <circle
              cx={centerX}
              cy={centerY}
              r={radius}
              fill="#0B132B"
              stroke="#1E293B"
              strokeWidth="2"
            />

            {/* Subtle grass rings */}
            <circle
              cx={centerX}
              cy={centerY}
              r={radius * 0.75}
              fill="none"
              stroke="#1E293B"
              strokeWidth="1"
              strokeDasharray="3 3"
            />

            {/* 30-yard inner circle */}
            <circle
              cx={centerX}
              cy={centerY}
              r={radius * 0.52}
              fill="none"
              stroke="#334155"
              strokeWidth="1.2"
              strokeDasharray="4 3"
            />

            {/* Pitch rectangle */}
            <rect
              x={centerX - 5}
              y={centerY - 16}
              width={10}
              height={32}
              fill="#1E293B"
              stroke="#475569"
              strokeWidth="1"
              rx="1"
            />

            {/* Stumps / Batsman crease dot */}
            <circle cx={centerX} cy={centerY + 10} r="2" fill="#FACC15" />

            {/* Shot trajectory line */}
            {delivery.shot_distance_m > 0 && (
              <>
                <line
                  x1={centerX}
                  y1={centerY + 10}
                  x2={targetX}
                  y2={targetY}
                  stroke={color}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  className="transition-all duration-300"
                />
                <circle
                  cx={targetX}
                  cy={targetY}
                  r="3.5"
                  fill={color}
                  className="transition-all duration-300"
                />
              </>
            )}

            {/* Pitch contact label */}
            <text
              x={centerX}
              y={height - 6}
              textAnchor="middle"
              fill="#64748B"
              fontSize="8"
              fontFamily="monospace"
            >
              Narendra Modi Stadium
            </text>
          </svg>
        </div>

        {/* Shot Telemetry Details */}
        <div className="flex-1 w-full space-y-1.5 text-xs">
          <div>
            <div className="text-[10px] text-slate-500 uppercase font-mono">Shot Execution</div>
            <div className="font-semibold text-slate-200">
              {delivery.shot_name || 'Standard Delivery'}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px] font-mono pt-1">
            <div className="bg-slate-950/60 p-1.5 rounded border border-slate-800/80">
              <span className="text-[9px] text-slate-500 block uppercase">Zone</span>
              <span className="text-amber-300 font-medium truncate block">
                {delivery.shot_zone || 'Pitch'}
              </span>
            </div>

            <div className="bg-slate-950/60 p-1.5 rounded border border-slate-800/80">
              <span className="text-[9px] text-slate-500 block uppercase">Distance</span>
              <span className="text-white font-medium block">
                {delivery.shot_distance_m ? `${delivery.shot_distance_m}m` : '0m'}
              </span>
            </div>
          </div>

          {delivery.is_milestone && (
            <div className="pt-0.5">
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-amber-400/10 text-amber-300 border border-amber-400/30">
                Key Event: {delivery.milestone_type}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
