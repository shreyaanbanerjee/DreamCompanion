import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import GuideBanner from './components/GuideBanner';
import Scoreboard from './components/Scoreboard';
import FanECG from './components/FanECG';
import AskCornerChat from './components/AskCornerChat';
import MatchControls from './components/MatchControls';
import WhatIfScenarios from './components/WhatIfScenarios';
import KeyMomentsBar from './components/KeyMomentsBar';
import { SimulatorSocketManager } from './services/websocket';
import { INITIAL_MATCH_INFO, INITIAL_DELIVERY, ALL_DELIVERIES } from './constants/fallbackData';
import { playBatCrack, playWicketSound, playChampionshipChime, setAudioEnabled } from './utils/audioFx';

export default function App() {
  const [matchInfo, setMatchInfo] = useState(INITIAL_MATCH_INFO);
  const [currentDelivery, setCurrentDelivery] = useState(INITIAL_DELIVERY);
  const [ballHistory, setBallHistory] = useState([INITIAL_DELIVERY]);
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [simulatorStatus, setSimulatorStatus] = useState('idle');
  const [currentInterval, setCurrentInterval] = useState(5.0);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [scenarioPrompt, setScenarioPrompt] = useState(null);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);

  // Client-side fallback simulation index
  const clientIndexRef = useRef(0);
  const clientTimerRef = useRef(null);
  const socketManagerRef = useRef(null);

  // Audio trigger helper
  const triggerAudioForDelivery = (d) => {
    if (!d) return;
    if (d.runs_needed <= 0 && d.ball_index > 0) {
      playChampionshipChime();
    } else if (d.is_wicket) {
      playWicketSound();
    } else if (d.runs_scored === 6) {
      playBatCrack(true);
    } else if (d.runs_scored === 4) {
      playBatCrack(false);
    }
  };

  // Push delivery to state and audio
  const applyDelivery = (delivery) => {
    setCurrentDelivery(delivery);
    setBallHistory((prev) => {
      if (prev.length > 0 && prev[prev.length - 1].ball_index === delivery.ball_index) {
        return prev;
      }
      return [...prev, delivery];
    });
    triggerAudioForDelivery(delivery);
  };

  useEffect(() => {
    const socket = new SimulatorSocketManager();
    socketManagerRef.current = socket;

    socket.onStatusChange((status) => {
      setConnectionStatus(status);
    });

    socket.onMessage((msg) => {
      if (msg.type === 'init') {
        if (msg.match_info) setMatchInfo(msg.match_info);
        if (msg.state) {
          setSimulatorStatus(msg.state.status);
          if (msg.state.latest_delivery) {
            applyDelivery(msg.state.latest_delivery);
          }
        }
      } else if (msg.type === 'ball_update') {
        if (msg.data) {
          applyDelivery(msg.data);
        }
        if (msg.state) {
          setSimulatorStatus(msg.state.status);
        }
      } else if (msg.type === 'match_completed') {
        setSimulatorStatus('completed');
        setIsAutoPlaying(false);
      } else if (msg.type === 'control_start') {
        setSimulatorStatus('running');
      } else if (msg.type === 'control_pause') {
        setSimulatorStatus('paused');
        setIsAutoPlaying(false);
      } else if (msg.type === 'control_reset') {
        setSimulatorStatus('idle');
        setIsAutoPlaying(false);
        setCurrentDelivery(INITIAL_DELIVERY);
        setBallHistory([INITIAL_DELIVERY]);
      } else if (msg.type === 'control_set_interval') {
        setCurrentInterval(msg.interval);
      }
    });

    socket.connect();

    return () => {
      socket.disconnect();
      if (clientTimerRef.current) clearInterval(clientTimerRef.current);
    };
  }, []);

  // Client-side simulation step
  const advanceClientStep = () => {
    const nextIdx = clientIndexRef.current + 1;
    if (nextIdx < ALL_DELIVERIES.length) {
      clientIndexRef.current = nextIdx;
      applyDelivery(ALL_DELIVERIES[nextIdx]);
    } else {
      setSimulatorStatus('completed');
      setIsAutoPlaying(false);
      if (clientTimerRef.current) {
        clearInterval(clientTimerRef.current);
        clientTimerRef.current = null;
      }
    }
  };

  // Playback control handlers
  const handleStart = () => {
    if (connectionStatus === 'connected') {
      socketManagerRef.current?.start();
    } else {
      setSimulatorStatus('running');
      if (clientTimerRef.current) clearInterval(clientTimerRef.current);

      if (clientIndexRef.current === 0 && currentDelivery.ball_index === 0) {
        advanceClientStep();
      }

      clientTimerRef.current = setInterval(() => {
        advanceClientStep();
      }, currentInterval * 1000);
    }
  };

  const handlePause = () => {
    setIsAutoPlaying(false);
    if (connectionStatus === 'connected') {
      socketManagerRef.current?.pause();
    } else {
      setSimulatorStatus('paused');
      if (clientTimerRef.current) {
        clearInterval(clientTimerRef.current);
        clientTimerRef.current = null;
      }
    }
  };

  const handleReset = () => {
    setIsAutoPlaying(false);
    if (connectionStatus === 'connected') {
      socketManagerRef.current?.reset();
    } else {
      setSimulatorStatus('idle');
      clientIndexRef.current = 0;
      if (clientTimerRef.current) {
        clearInterval(clientTimerRef.current);
        clientTimerRef.current = null;
      }
    }
    setCurrentDelivery(INITIAL_DELIVERY);
    setBallHistory([INITIAL_DELIVERY]);
  };

  const handleStep = () => {
    if (connectionStatus === 'connected') {
      socketManagerRef.current?.step();
    } else {
      advanceClientStep();
    }
  };

  const handleSpeedChange = (interval) => {
    setCurrentInterval(interval);
    if (connectionStatus === 'connected') {
      socketManagerRef.current?.setInterval(interval);
    } else {
      if (simulatorStatus === 'running' || isAutoPlaying) {
        if (clientTimerRef.current) clearInterval(clientTimerRef.current);
        clientTimerRef.current = setInterval(() => {
          advanceClientStep();
        }, interval * 1000);
      }
    }
  };

  // Quick jump to key moment
  const handleJumpToMoment = (ballIndex) => {
    if (ballIndex < 1 || ballIndex > ALL_DELIVERIES.length) return;
    clientIndexRef.current = ballIndex - 1;
    const targetDelivery = ALL_DELIVERIES[ballIndex - 1];
    const newHistory = [INITIAL_DELIVERY, ...ALL_DELIVERIES.slice(0, ballIndex)];
    setCurrentDelivery(targetDelivery);
    setBallHistory(newHistory);
    triggerAudioForDelivery(targetDelivery);
  };

  // Auto-play 30s Highlights Reel
  const handleAutoPlayHighlights = () => {
    if (isAutoPlaying) {
      handlePause();
      return;
    }

    // Enable audio automatically for demo
    setAudioEnabled(true);
    setIsAutoPlaying(true);
    setSimulatorStatus('running');

    // If at the end, restart from beginning
    if (clientIndexRef.current >= ALL_DELIVERIES.length - 1) {
      clientIndexRef.current = 0;
      setCurrentDelivery(ALL_DELIVERIES[0]);
      setBallHistory([INITIAL_DELIVERY, ALL_DELIVERIES[0]]);
      triggerAudioForDelivery(ALL_DELIVERIES[0]);
    }

    if (clientTimerRef.current) clearInterval(clientTimerRef.current);

    // Fast-forward 1.2s per ball
    clientTimerRef.current = setInterval(() => {
      advanceClientStep();
    }, 1200);
  };

  const handleScenarioSelect = (prompt) => {
    setScenarioPrompt(prompt);
  };

  const isCloudFallback = connectionStatus !== 'connected';

  return (
    <div className="min-h-screen bg-[#070C18] text-slate-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Top Header */}
      <Header
        matchInfo={matchInfo}
        connectionStatus={connectionStatus}
        simulatorStatus={simulatorStatus}
        onToggleGuide={() => setIsGuideOpen((prev) => !prev)}
        isGuideOpen={isGuideOpen}
      />

      {/* Main Responsive Canvas */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 lg:p-8 space-y-4 sm:space-y-5">
        {/* Recruiter Quick-Start Banner */}
        <div className="bg-slate-900/90 border border-amber-400/30 rounded-xl p-3 sm:px-4 sm:py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="bg-amber-400 text-slate-950 font-bold px-2 py-0.5 rounded text-[10px] font-mono">
              Evaluator Quick-Start
            </span>
            <span className="text-slate-200 font-medium text-xs">
              Experience the 2023 IPL Final Climax (CSK vs GT):
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-slate-400 text-[11px] font-mono">
            <button
              onClick={handleAutoPlayHighlights}
              className="bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 border border-amber-400/40 px-2.5 py-1 rounded font-bold transition-colors"
            >
              1. {isAutoPlaying ? '⏹ Pause Reel' : '▶ 30s Highlights'}
            </button>
            <span className="text-slate-600 hidden sm:inline">➔</span>
            <span className="bg-slate-800/80 px-2 py-1 rounded text-slate-300">
              2. Inspect Shot Radar & Win Delta
            </span>
            <span className="text-slate-600 hidden sm:inline">➔</span>
            <span className="bg-slate-800/80 px-2 py-1 rounded text-slate-300">
              3. Ask Corner AI
            </span>
          </div>
        </div>

        {/* Evaluator Instructions & Product Guide */}
        <GuideBanner
          isOpen={isGuideOpen}
          onClose={() => setIsGuideOpen(false)}
        />

        {/* Quick Highlights & Key Moments Bar */}
        <section aria-label="Key Match Moments">
          <KeyMomentsBar
            currentBallIndex={currentDelivery.ball_index}
            onJumpToMoment={handleJumpToMoment}
            onAutoPlayHighlights={handleAutoPlayHighlights}
            isAutoPlaying={isAutoPlaying}
          />
        </section>

        {/* Simulator Control Toolbar */}
        <section aria-label="Simulator Controls">
          <MatchControls
            status={simulatorStatus}
            onStart={handleStart}
            onPause={handlePause}
            onReset={handleReset}
            onStep={handleStep}
            onSpeedChange={handleSpeedChange}
            currentInterval={currentInterval}
            isCloudFallback={isCloudFallback}
          />
        </section>

        {/* TOP HALF: Live Cricket Scoreboard with Shot Radar & Scrubber */}
        <section aria-label="Match Scoreboard">
          <Scoreboard
            delivery={currentDelivery}
            matchInfo={matchInfo}
            recentBalls={ballHistory}
            onResetToLive={() => setCurrentDelivery(ballHistory[ballHistory.length - 1])}
          />
        </section>

        {/* BOTTOM HALF: Split Screen - Ask Corner AI Chat & Real-Time Fan ECG */}
        <section aria-label="Interactive Corner & ECG" className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 items-stretch">
          {/* Bottom Left: Live "Ask Corner" Chat */}
          <div className="h-full">
            <AskCornerChat
              currentDelivery={currentDelivery}
              externalPrompt={scenarioPrompt}
            />
          </div>

          {/* Bottom Right: Dynamic Fan ECG Graph */}
          <div className="h-full">
            <FanECG
              history={ballHistory}
              currentDelivery={currentDelivery}
            />
          </div>
        </section>

        {/* INNOVATION SECTION: What-If Tactical Scenario Explorer */}
        <section aria-label="What-If Tactical Scenarios">
          <WhatIfScenarios onSelectScenario={handleScenarioSelect} />
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-3 px-6 text-center text-xs text-slate-500 bg-[#0B0F19]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            DreamCompanion: Corner Edition • Live Sports Companion Prototype
          </div>
          <div className="text-slate-400 font-mono text-[11px]">
            FastAPI • React • Web Audio • AWS Architecture
          </div>
        </div>
      </footer>
    </div>
  );
}
