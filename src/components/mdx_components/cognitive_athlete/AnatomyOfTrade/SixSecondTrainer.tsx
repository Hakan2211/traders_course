
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Heart,
  Activity,
  AlertTriangle,
  Brain,
  CheckCircle,
  XCircle,
  Play,
  RefreshCcw,
  ShieldAlert,
  Wind,
} from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, YAxis } from 'recharts';

// --- Types ---

type GameState =
  | 'idle'
  | 'running'
  | 'crash'
  | 'breathing'
  | 'success'
  | 'failed';

interface ChartDataPoint {
  time: number;
  value: number;
}

// --- Constants ---

const INITIAL_PRICE = 150;
const BREATH_DURATION_MS = 4000; // 4 seconds to hold
const PANIC_THRESHOLD_MS = 3000; // Time user has to react before "fail" if they don't start breathing (optional logic, mostly purely reactive here)

const SixSecondTrainer: React.FC = () => {
  // --- State ---
  const [gameState, setGameState] = useState<GameState>('idle');
  const [data, setData] = useState<ChartDataPoint[]>([]);
  const [heartRate, setHeartRate] = useState(70);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('');
  const [tunnelVisionOpacity, setTunnelVisionOpacity] = useState(0);

  // --- Refs ---
  const intervalRef = useRef<number | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const breathingStartTimeRef = useRef<number | null>(null);
  const isSpaceHeld = useRef(false);

  // --- Helpers ---

  // Generate initial chart data
  const generateInitialData = () => {
    const arr = [];
    let val = INITIAL_PRICE;
    for (let i = 0; i < 50; i++) {
      val = val + (Math.random() - 0.5) * 2;
      arr.push({ time: i, value: val });
    }
    return arr;
  };

  // Sound effect simulation (visual pulse)
  const triggerHaptic = () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate)
      navigator.vibrate(50);
  };

  // --- Game Loop Logic ---

  const startGame = () => {
    setGameState('running');
    setData(generateInitialData());
    setHeartRate(75);
    setProgress(0);
    setTunnelVisionOpacity(0);
    setMessage('Monitoring market conditions...');

    if (intervalRef.current) clearInterval(intervalRef.current);

    // Normal market movement
    intervalRef.current = window.setInterval(() => {
      setData((prev) => {
        const last = prev[prev.length - 1];
        const change = (Math.random() - 0.45) * 1.5; // Slight upward bias
        const newValue = last.value + change;
        return [...prev.slice(1), { time: last.time + 1, value: newValue }];
      });
    }, 100);

    // Random crash trigger between 3s and 8s
    const crashTime = Math.random() * 5000 + 3000;
    setTimeout(() => {
      triggerCrash();
    }, crashTime);
  };

  const triggerCrash = () => {
    // Only trigger if we are still in running state (user hasn't quit)
    setGameState((prev) => {
      if (prev !== 'running') return prev;

      if (intervalRef.current) clearInterval(intervalRef.current);

      // Dramatic visual crash
      triggerHaptic();
      setHeartRate(140);
      setTunnelVisionOpacity(0.8);
      setMessage('CRASH DETECTED! ADRENALINE SPIKE!');

      // Update chart to show massive drop
      setData((prev) => {
        const last = prev[prev.length - 1];
        const crashPoints = [];
        let val = last.value;
        for (let i = 0; i < 5; i++) {
          val -= Math.random() * 5 + 5; // Huge drops
          crashPoints.push({ time: last.time + i + 1, value: val });
        }
        return [...prev.slice(5), ...crashPoints];
      });

      return 'crash';
    });
  };

  const handlePanicClick = () => {
    if (gameState === 'crash' || gameState === 'breathing') {
      setGameState('failed');
      setHeartRate(160);
      setTunnelVisionOpacity(1);
    }
  };

  const handleSuccess = () => {
    setGameState('success');
    setHeartRate(72);
    setTunnelVisionOpacity(0);
    setMessage('Intervention Successful. Executive Function Restored.');
    triggerHaptic();
  };

  // --- Input Handlers (Spacebar / Touch) ---

  const startBreathing = useCallback(() => {
    if (gameState !== 'crash' && gameState !== 'breathing') return;

    setGameState('breathing');
    isSpaceHeld.current = true;
    breathingStartTimeRef.current = Date.now();

    // Animation loop for breathing progress
    const animateBreath = () => {
      if (!isSpaceHeld.current) return;

      const now = Date.now();
      const start = breathingStartTimeRef.current || now;
      const elapsed = now - start;
      const pct = Math.min((elapsed / BREATH_DURATION_MS) * 100, 100);

      setProgress(pct);

      // Dynamic feedback during breathing
      if (pct < 100) {
        // Lower heart rate visually as progress increases
        setHeartRate(140 - Math.floor((pct / 100) * 60));
        // Fade tunnel vision
        setTunnelVisionOpacity(0.8 - (pct / 100) * 0.8);

        animationFrameRef.current = requestAnimationFrame(animateBreath);
      } else {
        handleSuccess();
      }
    };

    animationFrameRef.current = requestAnimationFrame(animateBreath);
  }, [gameState]);

  const stopBreathing = useCallback(() => {
    if (gameState !== 'breathing') return;

    isSpaceHeld.current = false;
    if (animationFrameRef.current)
      cancelAnimationFrame(animationFrameRef.current);

    // If released too early, punish the player by resetting progress and spiking HR back up
    if (progress < 100) {
      setGameState('crash'); // Go back to full panic
      setProgress(0);
      setHeartRate(140);
      setTunnelVisionOpacity(0.8);
      setMessage('INTERVENTION FAILED. AMYGDALA RE-ENGAGING.');
    }
  }, [gameState, progress]);

  // Keyboard Listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !e.repeat) {
        startBreathing();
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        stopBreathing();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (animationFrameRef.current)
        cancelAnimationFrame(animationFrameRef.current);
    };
  }, [startBreathing, stopBreathing]);

  // --- Render Helpers ---

  const getTunnelVisionStyle = () => ({
    background: `radial-gradient(circle, transparent 40%, rgba(220, 38, 38, ${tunnelVisionOpacity}) 90%)`,
    pointerEvents: 'none' as const,
  });

  return (
    <div className="w-full bg-slate-950 rounded-xl border border-slate-800 shadow-2xl overflow-hidden relative">
      {/* Header / HUD */}
      <div className="bg-slate-900/80 backdrop-blur-sm p-4 border-b border-slate-800 flex justify-between items-center relative z-20">
        <div className="flex items-center space-x-3">
          <div
            className={`p-2 rounded-lg ${
              gameState === 'crash' || gameState === 'breathing'
                ? 'bg-red-500/20 text-red-400 animate-pulse'
                : 'bg-slate-800 text-slate-400'
            }`}
          >
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 uppercase tracking-wider font-bold">
              Bio-Monitor
            </div>
            <div className="flex items-center space-x-2">
              <Heart
                className={`w-4 h-4 ${
                  heartRate > 100
                    ? 'text-red-500 fill-red-500 animate-panic'
                    : 'text-emerald-500'
                }`}
              />
              <span
                className={`font-mono font-bold text-lg ${
                  heartRate > 100 ? 'text-red-400' : 'text-emerald-400'
                }`}
              >
                {heartRate}{' '}
                <span className="text-xs font-normal text-slate-500">BPM</span>
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Status Indicator */}
          <div className="px-3 py-1 rounded-full bg-slate-900 border border-slate-700 text-xs font-mono">
            {gameState === 'idle' && (
              <span className="text-slate-400">READY</span>
            )}
            {gameState === 'running' && (
              <span className="text-emerald-400 animate-pulse">
                LIVE MARKET
              </span>
            )}
            {gameState === 'crash' && (
              <span className="text-red-500 font-bold animate-pulse">
                CRASH DETECTED
              </span>
            )}
            {gameState === 'breathing' && (
              <span className="text-yellow-400 font-bold">INTERVENING...</span>
            )}
            {gameState === 'success' && (
              <span className="text-emerald-400 font-bold">STABLE</span>
            )}
            {gameState === 'failed' && (
              <span className="text-red-600 font-bold">HIJACKED</span>
            )}
          </div>
        </div>
      </div>

      {/* Main Game Area */}
      <div className="relative h-[500px] w-full bg-slate-950 group select-none">
        {/* The Chart */}
        <div className="absolute inset-0 z-0 opacity-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor={
                      gameState === 'crash' || gameState === 'failed'
                        ? '#ef4444'
                        : '#10b981'
                    }
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="95%"
                    stopColor={
                      gameState === 'crash' || gameState === 'failed'
                        ? '#ef4444'
                        : '#10b981'
                    }
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <YAxis domain={['auto', 'auto']} hide />
              <Area
                type="monotone"
                dataKey="value"
                stroke={
                  gameState === 'crash' || gameState === 'failed'
                    ? '#ef4444'
                    : '#10b981'
                }
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorValue)"
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Tunnel Vision Overlay */}
        <div
          className="absolute inset-0 z-10 transition-all duration-300 ease-out"
          style={getTunnelVisionStyle()}
        />

        {/* Start Screen */}
        {gameState === 'idle' && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-sm p-6 text-center">
            <ShieldAlert className="w-16 h-16 text-emerald-500 mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">
              The 6-Second Intervention
            </h2>
            <p className="text-slate-400 max-w-md mb-6">
              Simulate an Amygdala Hijack. When the market crashes, fight the
              urge to panic.
            </p>
            <div className="bg-slate-900 p-4 rounded-lg border border-slate-700 text-left mb-8 max-w-sm w-full">
              <h3 className="text-sm font-bold text-slate-300 mb-2 uppercase tracking-wider">
                Instructions
              </h3>
              <ul className="space-y-2 text-sm text-slate-400">
                <li className="flex items-center">
                  <span className="w-2 h-2 rounded-full bg-red-500 mr-2"></span>
                  Wait for the Red Candle trigger.
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 rounded-full bg-slate-500 mr-2"></span>
                  Do NOT click the "Panic Sell" button.
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></span>
                  INSTEAD: <strong>Hold SPACEBAR</strong> (or "Breathe" button)
                  for 4 seconds to regain control.
                </li>
              </ul>
            </div>
            <button
              onClick={startGame}
              className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-8 rounded-full transition-all hover:scale-105 active:scale-95 shadow-lg shadow-emerald-900/20"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>Start Simulation</span>
            </button>
          </div>
        )}

        {/* Panic / Crash State UI */}
        {(gameState === 'crash' || gameState === 'breathing') && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center">
            {/* The "Trap" Button */}
            <button
              onClick={handlePanicClick}
              className={`
                        mb-12 transform transition-all duration-75
                        ${
                          gameState === 'breathing'
                            ? 'scale-90 opacity-50 blur-sm grayscale'
                            : 'scale-110 opacity-100 animate-panic'
                        }
                        bg-red-600 hover:bg-red-500 text-white font-black py-4 px-12 rounded-lg 
                        shadow-[0_0_50px_rgba(220,38,38,0.5)] border-4 border-red-400
                        text-2xl tracking-widest uppercase
                    `}
            >
              PANIC SELL
            </button>

            {/* The Intervention Prompt */}
            <div className="absolute bottom-10 w-full flex flex-col items-center">
              <div className="text-slate-300 font-mono text-sm mb-2 opacity-80 uppercase tracking-widest">
                {gameState === 'breathing'
                  ? 'Keep Holding...'
                  : 'Intervention Protocol'}
              </div>

              {/* Desktop Prompt */}
              <div className="hidden md:flex flex-col items-center space-y-2">
                <div
                  className={`
                            relative overflow-hidden
                            w-64 h-16 rounded-lg border-2 flex items-center justify-center font-bold text-lg transition-all
                            ${
                              gameState === 'breathing'
                                ? 'bg-emerald-900/50 border-emerald-500 text-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.3)]'
                                : 'bg-slate-800/50 border-slate-600 text-slate-400'
                            }
                        `}
                >
                  {/* Progress Bar Background */}
                  <div
                    className="absolute left-0 top-0 bottom-0 bg-emerald-600/30 transition-all duration-75 ease-linear"
                    style={{ width: `${progress}%` }}
                  />
                  <span className="relative z-10 flex items-center space-x-2">
                    <Wind className="w-5 h-5" />
                    <span>HOLD SPACEBAR</span>
                  </span>
                </div>
              </div>

              {/* Mobile Prompt */}
              <button
                className="md:hidden w-64 h-20 bg-slate-800 rounded-xl border-2 border-slate-600 active:border-emerald-500 active:bg-emerald-900/30 flex items-center justify-center relative overflow-hidden"
                onTouchStart={(e) => {
                  e.preventDefault();
                  startBreathing();
                }}
                onTouchEnd={(e) => {
                  e.preventDefault();
                  stopBreathing();
                }}
                onMouseDown={startBreathing}
                onMouseUp={stopBreathing}
                onMouseLeave={stopBreathing}
              >
                <div
                  className="absolute left-0 top-0 bottom-0 bg-emerald-600/30 transition-all duration-75 ease-linear"
                  style={{ width: `${progress}%` }}
                />
                <span className="relative z-10 font-bold text-white flex items-center space-x-2">
                  <Wind className="w-5 h-5" />
                  <span>HOLD TO BREATHE</span>
                </span>
              </button>
            </div>
          </div>
        )}

        {/* Success State */}
        {gameState === 'success' && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-slate-900/90 backdrop-blur p-8 text-center animate-in fade-in duration-500">
            <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mb-6">
              <Brain className="w-10 h-10 text-emerald-400" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">
              Amygdala Override Complete
            </h2>
            <p className="text-slate-400 max-w-md mb-8">
              You successfully created the 6-second gap. Your Cortisol is
              dropping. Your Prefrontal Cortex is back online.
            </p>

            <button className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-8 rounded-lg shadow-lg flex items-center space-x-2 mx-auto transition-transform hover:-translate-y-1">
              <CheckCircle className="w-5 h-5" />
              <span>CHECK TRADING PLAN</span>
            </button>

            <button
              onClick={startGame}
              className="mt-6 text-slate-500 hover:text-white text-sm flex items-center space-x-1"
            >
              <RefreshCcw className="w-3 h-3" />
              <span>Re-run Simulation</span>
            </button>
          </div>
        )}

        {/* Failed State */}
        {gameState === 'failed' && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-red-950/90 backdrop-blur p-8 text-center animate-in fade-in duration-300">
            <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center mb-6 border-2 border-red-500/50">
              <XCircle className="w-10 h-10 text-red-500" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">
              Hijack Complete
            </h2>
            <p className="text-red-200 max-w-md mb-8">
              You reacted to the fear. You sold at the bottom. Your amygdala
              made the decision, not your strategy.
            </p>

            <button
              onClick={startGame}
              className="bg-slate-100 hover:bg-white text-slate-900 font-bold py-3 px-8 rounded-lg shadow-lg flex items-center space-x-2 mx-auto transition-transform hover:-translate-y-1"
            >
              <RefreshCcw className="w-5 h-5" />
              <span>Try Again</span>
            </button>
            <p className="mt-4 text-xs text-red-400/60 uppercase tracking-widest">
              Repetition builds resilience
            </p>
          </div>
        )}
      </div>

      {/* Footer / Context */}
      <div className="bg-slate-900 p-4 border-t border-slate-800 text-xs text-slate-500 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>Neuroplasticity Engine: Active</span>
        </div>
        <div>V 1.0.4</div>
      </div>
    </div>
  );
};

export default SixSecondTrainer;
