import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, MessageSquare, Loader2, HelpCircle } from 'lucide-react';
import { askCornerAI } from '../services/api';

const QUICK_PROMPTS = [
  "Can Sir Jadeja finish this with 10 needed off 2 balls?",
  "What is Thala Dhoni's strategy right now?",
  "Why is Mohit Sharma bowling the final over?",
  "What was the biggest turning point so far?",
];

export default function AskCornerChat({ currentDelivery }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: "Vanakkam! I'm your 'Ask Corner' AI Companion. Ask me anything about this thrilling IPL final chase, Dhoni's tactics, or Sir Jadeja's chances! Whistle Podu!",
      timestamp: 'Just now',
      provider: 'CSK Lore Pack',
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
      ? `Over ${currentDelivery.over_display}, Score: ${currentDelivery.score_after}, ${currentDelivery.runs_needed} needed in ${currentDelivery.balls_remaining} balls. Batting: ${currentDelivery.batsman}.`
      : 'IPL Final 2023 CSK vs GT';

    try {
      const data = await askCornerAI(query, matchContext);
      const botMsg = {
        id: Date.now() + 1,
        sender: 'bot',
        text: data.response || "Whistle Podu! Keep the faith in Yellow!",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        provider: data.provider || 'Lambda AI',
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error('Chat error:', err);
      const errorMsg = {
        id: Date.now() + 1,
        sender: 'bot',
        text: "Whistle Podu! My connection had a hiccup, but Sir Jadeja and Thala Dhoni have our backs no matter what! Ask again anytime.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        provider: 'Fallback Engine',
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-csk-card rounded-2xl border border-csk-border/80 shadow-2xl p-4 sm:p-5 flex flex-col justify-between h-full relative overflow-hidden">
      {/* Top Header */}
      <div className="border-b border-csk-border/60 pb-3 mb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-csk-yellow/15 text-csk-yellow">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-wide flex items-center gap-1.5">
                ASK CORNER AI CHAT
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-400/20 text-csk-yellow font-semibold">
                  AWS Lambda
                </span>
              </h2>
              <p className="text-[11px] text-slate-400 font-medium">
                Live Cricket Tactician & Whistle Podu Fan Lore
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-slate-400 bg-csk-navy/80 px-2.5 py-1 rounded-full border border-csk-border">
            <Sparkles className="w-3 h-3 text-csk-yellow" />
            <span>AI Online</span>
          </div>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-2.5 pb-0.5 no-scrollbar">
          {QUICK_PROMPTS.map((prompt, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSend(prompt)}
              disabled={isLoading}
              className="text-[11px] whitespace-nowrap px-2.5 py-1 rounded-lg bg-csk-navy hover:bg-csk-border text-slate-300 hover:text-white border border-csk-border/60 tactile-btn"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1 my-1 max-h-64 sm:max-h-72">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-2.5 ${
              msg.sender === 'user' ? 'flex-row-reverse' : ''
            }`}
          >
            {/* Avatar */}
            <div
              className={`w-7 h-7 rounded-lg shrink-0 flex items-center justify-center text-xs font-bold ${
                msg.sender === 'user'
                  ? 'bg-csk-yellow text-slate-950 shadow-sm'
                  : 'bg-csk-navy border border-amber-500/30 text-amber-300'
              }`}
            >
              {msg.sender === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
            </div>

            {/* Bubble Content */}
            <div
              className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-xs sm:text-[13px] leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-csk-yellow text-slate-950 font-medium rounded-tr-sm'
                  : 'bg-csk-navy/90 text-slate-200 border border-csk-border rounded-tl-sm shadow-md'
              }`}
            >
              <p>{msg.text}</p>
              <div
                className={`text-[9px] mt-1 flex items-center justify-between gap-3 ${
                  msg.sender === 'user' ? 'text-amber-950/70 font-semibold' : 'text-slate-400'
                }`}
              >
                <span>{msg.timestamp}</span>
                {msg.provider && <span className="uppercase text-[8px] font-mono tracking-wider opacity-80">{msg.provider}</span>}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-amber-300 italic py-1 px-3 bg-csk-navy/60 rounded-xl border border-csk-border w-fit">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-csk-yellow" />
            <span>Consulting Fan Lore Pack & AI model...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="mt-3 pt-2 border-t border-csk-border/60 flex items-center gap-2"
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Ask about Dhoni's tactics, Jadeja, or the chase..."
          disabled={isLoading}
          className="flex-1 bg-csk-navy text-xs sm:text-sm text-slate-100 placeholder-slate-500 rounded-xl px-3.5 py-2.5 border border-csk-border focus:outline-none focus:border-csk-yellow focus:ring-1 focus:ring-csk-yellow transition-all"
        />
        <button
          type="submit"
          disabled={isLoading || !inputText.trim()}
          className="bg-csk-yellow text-slate-950 hover:bg-amber-400 disabled:opacity-40 disabled:pointer-events-none p-2.5 rounded-xl font-bold flex items-center justify-center tactile-btn shadow-md shadow-amber-500/20"
          title="Send query"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </button>
      </form>
    </div>
  );
}

