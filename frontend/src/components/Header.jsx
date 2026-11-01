import React from 'react';
import { Radio, Activity, Trophy, ShieldAlert, Sparkles } from 'lucide-react';

export default function Header({ matchInfo, connectionStatus, simulatorStatus }) {
  const getStatusColor = (status) => {
    switch (status) {
      case 'connected':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'connecting':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'error':
      case 'disconnected':
      default:
        return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
    }
  };

  return (
    <header className="border-b border-csk-border bg-csk-dark/95 backdrop-blur sticky top-0 z-40 px-4 lg:px-8 py-3">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Brand & Crest */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-csk-yellow to-amber-500 flex items-center justify-center shadow-lg shadow-amber-500/20 text-slate-950 font-black text-xl">
            DC
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                DreamCompanion
                <span className="text-xs px-2 py-0.5 rounded-full bg-csk-yellow/15 text-csk-yellow border border-csk-yellow/30 font-semibold tracking-wide">
                  CORNER EDITION
                </span>
              </h1>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              Live Cricket Tech Companion & Real-Time Fan ECG
            </p>
          </div>
        </div>

        {/* Center: Match Banner */}
        <div className="hidden lg:flex items-center gap-3 px-4 py-1.5 rounded-lg bg-csk-card/80 border border-csk-border/60">
          <Trophy className="w-4 h-4 text-csk-yellow" />
          <div className="text-xs">
            <span className="font-semibold text-slate-200">{matchInfo?.title || "IPL 2023 Grand Final"}</span>
            <span className="text-slate-500 mx-2">•</span>
            <span className="text-amber-400 font-medium">{matchInfo?.subtitle || "CSK vs GT"}</span>
          </div>
        </div>

        {/* Status Indicators */}
        <div className="flex items-center gap-2 self-end md:self-auto">
          {/* Simulator status pill */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-medium border bg-csk-card border-csk-border text-slate-300">
            <span className={`w-2 h-2 rounded-full ${simulatorStatus === 'running' ? 'bg-amber-400 animate-ping' : 'bg-slate-500'}`} />
            <span className="uppercase text-[11px] tracking-wider">{simulatorStatus || 'idle'}</span>
          </div>

          {/* WebSocket status pill */}
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-colors ${getStatusColor(connectionStatus)}`}>
            <Radio className={`w-3.5 h-3.5 ${connectionStatus === 'connected' ? 'animate-pulse' : ''}`} />
            <span className="capitalize">{connectionStatus}</span>
          </div>
        </div>
      </div>
    </header>
  );
}

