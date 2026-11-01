import React from 'react';

export default function Header({ matchInfo, connectionStatus, simulatorStatus, onToggleGuide, isGuideOpen }) {
  const isConnected = connectionStatus === 'connected';
  const isRunning = simulatorStatus === 'running';

  return (
    <header className="border-b border-slate-800 bg-[#0B0F19]/90 backdrop-blur sticky top-0 z-40 px-4 sm:px-6 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand & Match Details */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white text-base tracking-tight">DreamCompanion</span>
            <span className="text-[11px] font-semibold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
              Corner Edition
            </span>
          </div>
          <span className="text-slate-600 hidden sm:inline">|</span>
          <span className="text-xs text-slate-400 hidden sm:inline">
            {matchInfo?.title || 'TATA IPL 2023 Final'} • {matchInfo?.subtitle || 'CSK vs GT'}
          </span>
        </div>

        {/* Status Indicators & Guide Toggle */}
        <div className="flex items-center gap-3 text-xs">
          <button
            onClick={onToggleGuide}
            className={`px-2.5 py-1 rounded text-[11px] font-medium border transition-colors ${
              isGuideOpen
                ? 'bg-amber-400 text-slate-950 border-amber-400 font-bold'
                : 'bg-slate-800 text-slate-300 hover:text-white border-slate-700'
            }`}
          >
            Instructions & Guide
          </button>

          <div className="flex items-center gap-1.5 text-slate-300">
            <span
              className={`w-2 h-2 rounded-full ${
                isConnected
                  ? 'bg-emerald-400'
                  : 'bg-sky-400'
              }`}
            />
            <span className="text-slate-400 text-[11px]">
              {isConnected
                ? (isRunning ? 'FastAPI Streaming' : 'FastAPI Ready')
                : (isRunning ? 'Cloud Sim Active' : 'Cloud Sim Ready')}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
