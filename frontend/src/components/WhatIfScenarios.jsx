import React from 'react';
import { playTick } from '../utils/audioFx';

const SCENARIOS = [
  {
    title: "Mohit's Length Ball on 14.5",
    prompt: "Why did Mohit Sharma bowl a straight length delivery on 14.5 after nailing four consecutive yorkers?",
    tag: "Tactics",
  },
  {
    title: "What if Jadeja took a single?",
    prompt: "What if Jadeja took a single on 14.5 leaving Shivam Dube to score 9 off the final ball?",
    tag: "Simulation",
  },
  {
    title: "Dhoni's Dugout Masterplan",
    prompt: "What was MS Dhoni's strategy and dugout advice before the final 2 overs with 38 required?",
    tag: "Captaincy",
  },
  {
    title: "DLS Target Breakdown",
    prompt: "Explain how the DLS method reset CSK's target to 171 in 15 overs and affected the Required Run Rate.",
    tag: "DLS Analytics",
  },
];

export default function WhatIfScenarios({ onSelectScenario }) {
  return (
    <div className="bg-[#111827] rounded-xl border border-slate-800 p-4 sm:p-5">
      <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
        <div>
          <h2 className="text-xs uppercase font-bold text-slate-300 tracking-wider">
            What-If Tactical Scenarios
          </h2>
          <div className="text-[11px] text-slate-400">
            Explore alternative outcomes and strategic analysis with Ask Corner AI
          </div>
        </div>
        <span className="text-[10px] text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20 font-mono">
          Interactive
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        {SCENARIOS.map((item, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => {
              playTick();
              onSelectScenario?.(item.prompt);
            }}
            className="text-left p-3 rounded-lg bg-slate-900/90 hover:bg-slate-800/90 border border-slate-800 hover:border-amber-400/40 transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 bg-amber-400/10 px-1.5 py-0.2 rounded">
                  {item.tag}
                </span>
                <span className="text-[10px] text-slate-500 group-hover:text-amber-300 transition-colors">
                  Ask AI ➔
                </span>
              </div>
              <div className="text-xs font-semibold text-slate-200 group-hover:text-white transition-colors">
                {item.title}
              </div>
            </div>
            <div className="text-[11px] text-slate-400 mt-2 line-clamp-2 leading-relaxed">
              "{item.prompt}"
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

