import React from 'react';

export default function GuideBanner({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="bg-[#111827] border border-slate-700/80 rounded-xl p-4 sm:p-5 mb-5 text-xs text-slate-300 transition-all">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 mb-3">
        <div className="flex items-center gap-2">
          <span className="font-bold text-white text-sm">Product Guide & Instructions</span>
          <span className="text-[10px] text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded font-mono">
            Evaluator Mode
          </span>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 font-mono text-[11px]"
        >
          Close
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-[11px]">
        <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
          <div className="font-semibold text-white mb-1 flex items-center justify-between">
            <span>1. Match Simulation</span>
            <span className="text-[10px] text-amber-400 font-mono">Dual-Engine</span>
          </div>
          <p className="text-slate-400 leading-relaxed">
            Click <strong className="text-amber-400">Start Match</strong>. Runs via FastAPI WebSockets locally or instant Cloud Engine on AWS Amplify. Ball-by-ball updates push every 5s with 1x, 2x, and 5x speeds.
          </p>
        </div>

        <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
          <div className="font-semibold text-white mb-1 flex items-center justify-between">
            <span>2. Win Predictor & Scrubber</span>
            <span className="text-[10px] text-sky-400 font-mono">Interactive</span>
          </div>
          <p className="text-slate-400 leading-relaxed">
            Dynamic CSK vs GT Win Probability bar with per-ball delta swings. Click any ball in the <strong className="text-white">Scrubber</strong> to inspect historical commentary, batsmen, and field status!
          </p>
        </div>

        <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
          <div className="font-semibold text-white mb-1 flex items-center justify-between">
            <span>3. Ask Corner & What-Ifs</span>
            <span className="text-[10px] text-emerald-400 font-mono">AWS Lambda</span>
          </div>
          <p className="text-slate-400 leading-relaxed">
            Chat backed by AWS Lambda + Gemini 3.5 Flash. Click the <strong className="text-white">What-If Scenarios</strong> below to explore alternative tactics (Jadeja single, DLS target analysis, Dhoni's plan).
          </p>
        </div>

        <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
          <div className="font-semibold text-white mb-1 flex items-center justify-between">
            <span>4. Web Audio & ECG</span>
            <span className="text-[10px] text-rose-400 font-mono">Real-Time</span>
          </div>
          <p className="text-slate-400 leading-relaxed">
            Toggle <strong className="text-amber-300">Audio: ON</strong> to hear synthesized stadium bat cracks on 4s/6s, wicket thuds, and crowd roars. The Fan ECG tracks heartbeat and yellow army tension.
          </p>
        </div>
      </div>
    </div>
  );
}
