import React, { useState, useRef, useEffect } from 'react';
import { askCornerAI } from '../services/api';

const PROMPT_SUGGESTIONS = [
  "Can Jadeja finish this with 10 needed off 2 balls?",
  "What is Dhoni's strategy right now?",
  "Why is Mohit Sharma bowling the final over?",
  "What was the key turning point so far?",
];

export default function AskCornerChat({ currentDelivery, externalPrompt }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: "Vanakkam! I'm your Corner Assistant for this IPL Final chase. Ask me about Dhoni's tactics, Sir Jadeja's chances, or the match situation.",
      timestamp: 'Match Start',
      provider: 'Assistant',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (questionText = inputText) => {
    const query = (questionText || '').trim();
    if (!query || isLoading) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    const matchContext = currentDelivery
      ? `Over ${currentDelivery.over_display}, Score: ${currentDelivery.score_after}, ${currentDelivery.runs_needed} runs needed in ${currentDelivery.balls_remaining} balls. Striker: ${currentDelivery.batsman}.`
      : 'IPL Final 2023 CSK vs GT';

    try {
      const data = await askCornerAI(query, matchContext);
      const botMsg = {
        id: Date.now() + 1,
        sender: 'bot',
        text: data.response || "Whistle Podu! Keep the faith in Yellow!",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        provider: data.provider || 'AI',
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      const errorMsg = {
        id: Date.now() + 1,
        sender: 'bot',
        text: "Connection paused, but CSK is still in the fight! Ask again anytime.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        provider: 'Offline Fallback',
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // Trigger when parent passes an externalPrompt (e.g. from WhatIfScenarios)
  useEffect(() => {
    if (externalPrompt) {
      handleSend(externalPrompt);
    }
  }, [externalPrompt]);

  return (
    <div className="bg-[#111827] rounded-xl border border-slate-800 p-4 sm:p-5 flex flex-col justify-between h-full">
      {/* Header */}
      <div className="border-b border-slate-800 pb-3 mb-3">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h2 className="text-xs uppercase font-bold text-slate-300 tracking-wider">
              Ask Corner
            </h2>
            <div className="text-[11px] text-slate-400">
              Match intelligence & fan context (AWS Lambda + Gemini)
            </div>
          </div>
          <span className="text-[10px] text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800 font-mono">
            Live
          </span>
        </div>

        {/* Suggestion Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1 pb-0.5 no-scrollbar text-xs">
          {PROMPT_SUGGESTIONS.map((prompt, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSend(prompt)}
              disabled={isLoading}
              className="text-[11px] whitespace-nowrap px-2.5 py-1 rounded bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1 my-1 max-h-64 sm:max-h-72 text-xs">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${
              msg.sender === 'user' ? 'items-end' : 'items-start'
            }`}
          >
            <div className="text-[10px] text-slate-500 mb-1 px-1">
              {msg.sender === 'user' ? 'You' : 'Corner Assistant'} • {msg.timestamp}
            </div>

            <div
              className={`max-w-[85%] rounded-lg px-3.5 py-2.5 leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-amber-400 text-slate-950 font-medium'
                  : 'bg-slate-900 text-slate-200 border border-slate-800'
              }`}
            >
              <p className="whitespace-pre-line">{msg.text}</p>
              {msg.provider && msg.sender === 'bot' && (
                <div className="text-[9px] text-slate-500 mt-1.5 font-mono">
                  via {msg.provider}
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="text-xs text-amber-300/80 italic py-1 px-2">
            Thinking...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="mt-3 pt-2 border-t border-slate-800 flex items-center gap-2"
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Ask a question about the match or tactics..."
          disabled={isLoading}
          className="flex-1 bg-slate-900 text-xs sm:text-sm text-slate-100 placeholder-slate-500 rounded-lg px-3 py-2 border border-slate-800 focus:outline-none focus:border-amber-400 transition-colors"
        />
        <button
          type="submit"
          disabled={isLoading || !inputText.trim()}
          className="bg-amber-400 hover:bg-amber-300 disabled:opacity-40 disabled:pointer-events-none text-slate-950 px-4 py-2 rounded-lg font-bold text-xs transition-colors shrink-0"
        >
          Send
        </button>
      </form>
    </div>
  );
}
