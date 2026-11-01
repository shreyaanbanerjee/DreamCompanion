import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import Scoreboard from './components/Scoreboard';
import FanECG from './components/FanECG';
import AskCornerChat from './components/AskCornerChat';
import MatchControls from './components/MatchControls';
import { SimulatorSocketManager } from './services/websocket';
import { INITIAL_MATCH_INFO, INITIAL_DELIVERY } from './constants/fallbackData';

export default function App() {
  const [matchInfo, setMatchInfo] = useState(INITIAL_MATCH_INFO);
  const [currentDelivery, setCurrentDelivery] = useState(INITIAL_DELIVERY);
  const [ballHistory, setBallHistory] = useState([INITIAL_DELIVERY]);
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [simulatorStatus, setSimulatorStatus] = useState('idle');
  const [currentInterval, setCurrentInterval] = useState(5.0);

  const socketManagerRef = useRef(null);

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
            setCurrentDelivery(msg.state.latest_delivery);
            setBallHistory((prev) => [...prev, msg.state.latest_delivery]);
          }
        }
      } else if (msg.type === 'ball_update') {
        if (msg.data) {
          setCurrentDelivery(msg.data);
          setBallHistory((prev) => {
            // Avoid duplicate pushes
            if (prev.length > 0 && prev[prev.length - 1].ball_index === msg.data.ball_index) {
              return prev;
            }
            return [...prev, msg.data];
          });
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
    };
  }, []);

  const handleStart = () => {
    socketManagerRef.current?.start();
  };

  const handlePause = () => {
    socketManagerRef.current?.pause();
  };

  const handleReset = () => {
    socketManagerRef.current?.reset();
    setCurrentDelivery(INITIAL_DELIVERY);
    setBallHistory([INITIAL_DELIVERY]);
  };

  const handleStep = () => {
    socketManagerRef.current?.step();
  };

  const handleSpeedChange = (interval) => {
    setCurrentInterval(interval);
    socketManagerRef.current?.setInterval(interval);
  };

  return (
    <div className="min-h-screen bg-[#070C18] text-slate-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Top Header */}
      <Header
        matchInfo={matchInfo}
        connectionStatus={connectionStatus}
        simulatorStatus={simulatorStatus}
      />

      {/* Main Responsive Canvas */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 lg:p-8 space-y-5">
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
          />
        </section>

        {/* TOP HALF: Live Cricket Scoreboard */}
        <section aria-label="Match Scoreboard">
          <Scoreboard
            delivery={currentDelivery}
            matchInfo={matchInfo}
            recentBalls={ballHistory}
          />
        </section>

        {/* BOTTOM HALF: Split Screen - Ask Corner AI Chat & Real-Time Fan ECG */}
        <section aria-label="Interactive Corner & ECG" className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-stretch">
          {/* Bottom Left: Live "Ask Corner" Chat */}
          <div className="h-full">
            <AskCornerChat currentDelivery={currentDelivery} />
          </div>

          {/* Bottom Right: Dynamic Fan ECG Graph */}
          <div className="h-full">
            <FanECG
              history={ballHistory}
              currentDelivery={currentDelivery}
            />
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-csk-border/50 py-4 px-6 text-center text-xs text-slate-500 bg-csk-dark/80">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            DreamCompanion: Corner Edition • AWS Amplify (Frontend) • AWS App Runner (FastAPI WS) • AWS API Gateway & Lambda (Ask Corner)
          </div>
          <div className="text-amber-400 font-medium">
            Whistle Podu 🦁💛
          </div>
        </div>
      </footer>
    </div>
  );
}

