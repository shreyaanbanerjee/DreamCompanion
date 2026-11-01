import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import GuideBanner from './components/GuideBanner';
import Scoreboard from './components/Scoreboard';
import FanECG from './components/FanECG';
import AskCornerChat from './components/AskCornerChat';
import MatchControls from './components/MatchControls';
import WhatIfScenarios from './components/WhatIfScenarios';
import { SimulatorSocketManager } from './services/websocket';
import { INITIAL_MATCH_INFO, INITIAL_DELIVERY, ALL_DELIVERIES } from './constants/fallbackData';
import { playBatCrack, playWicketSound, playChampionshipChime } from './utils/audioFx';

export default function App() {
  const [matchInfo, setMatchInfo] = useState(INITIAL_MATCH_INFO);
  const [currentDelivery, setCurrentDelivery] = useState(INITIAL_DELIVERY);
  const [ballHistory, setBallHistory] = useState([INITIAL_DELIVERY]);
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [simulatorStatus, setSimulatorStatus] = useState('idle');
  const [currentInterval, setCurrentInterval] = useState(5.0);
  const [isGuideOpen, setIsGuideOpen] = useState(true);
  const [scenarioPrompt, setScenarioPrompt] = useState(null);

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
      } else if (msg.type === 'control_start') {
        setSimulatorStatus('running');
      } else if (msg.type === 'control_pause') {
        setSimulatorStatus('paused');
      } else if (msg.type === 'control_reset') {
        setSimulatorStatus('idle');
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
      // Standalone Cloud Simulator Engine
      setSimulatorStatus('running');
      if (clientTimerRef.current) clearInterval(clientTimerRef.current);

      // If at start, push first ball immediately
      if (clientIndexRef.current === 0 && currentDelivery.ball_index === 0) {
        advanceClientStep();
      }

      clientTimerRef.current = setInterval(() => {
        advanceClientStep();
      }, currentInterval * 1000);
    }
  };

  const handlePause = () => {
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
      if (simulatorStatus === 'running') {
        if (clientTimerRef.current) clearInterval(clientTimerRef.current);
        clientTimerRef.current = setInterval(() => {
          advanceClientStep();
        }, interval * 1000);
      }
    }
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
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 lg:p-8 space-y-5">
        {/* Evaluator Instructions & Product Guide */}
        <GuideBanner
          isOpen={isGuideOpen}
          onClose={() => setIsGuideOpen(false)}
        />

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

        {/* TOP HALF: Live Cricket Scoreboard */}
        <section aria-label="Match Scoreboard">
          <Scoreboard
            delivery={currentDelivery}
            matchInfo={matchInfo}
            recentBalls={ballHistory}
            onResetToLive={() => setCurrentDelivery(ballHistory[ballHistory.length - 1])}
          />
        </section>

        {/* BOTTOM HALF: Split Screen - Ask Corner AI Chat & Real-Time Fan ECG */}
        <section aria-label="Interactive Corner & ECG" className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-stretch">
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
