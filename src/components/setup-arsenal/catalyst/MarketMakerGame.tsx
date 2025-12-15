
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GameState, Particle, PricePoint } from '../types';
import {
  Play,
  RotateCcw,
  TrendingDown,
  Users,
  DollarSign,
  AlertTriangle,
  Info,
} from 'lucide-react';

const TOTAL_GAME_TIME_SECONDS = 30; // Represents 9:30 AM to 10:30 AM
const FPS = 60;
const INITIAL_PRICE = 100;
const CANVAS_HEIGHT = 300;
const CANVAS_WIDTH = 600;

const MarketMakerGame: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.IDLE);
  const [supportLevel, setSupportLevel] = useState<number>(50); // 0-100 slider
  const [currentTime, setCurrentTime] = useState<number>(0); // 0 to TOTAL_GAME_TIME_SECONDS
  const [currentPrice, setCurrentPrice] = useState<number>(INITIAL_PRICE);
  const [trappedTraders, setTrappedTraders] = useState<number>(0);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [priceHistory, setPriceHistory] = useState<PricePoint[]>([
    { time: 0, price: INITIAL_PRICE },
  ]);
  const [message, setMessage] = useState<string>('Waiting for market open...');

  // Refs for loop logic to avoid closure staleness
  const requestRef = useRef<number>();
  const startTimeRef = useRef<number>(0);
  const priceHistoryRef = useRef<PricePoint[]>([
    { time: 0, price: INITIAL_PRICE },
  ]);
  const trappedTradersRef = useRef<number>(0);
  const supportLevelRef = useRef<number>(50);
  const particlesRef = useRef<Particle[]>([]);

  // Sound effect refs (simulated visual for now)
  const isCrashing = useRef<boolean>(false);

  // Sync state for render
  useEffect(() => {
    supportLevelRef.current = supportLevel;
  }, [supportLevel]);

  const startGame = () => {
    setGameState(GameState.PLAYING);
    setCurrentTime(0);
    setTrappedTraders(0);
    trappedTradersRef.current = 0;
    setCurrentPrice(INITIAL_PRICE);
    setPriceHistory([{ time: 0, price: INITIAL_PRICE }]);
    priceHistoryRef.current = [{ time: 0, price: INITIAL_PRICE }];
    particlesRef.current = [];
    setParticles([]);
    startTimeRef.current = performance.now();
    isCrashing.current = false;
    setMessage('Market Open! Stabilize price to lure buyers.');

    cancelAnimationFrame(requestRef.current!);
    requestRef.current = requestAnimationFrame(gameLoop);
  };

  const gameLoop = (timestamp: number) => {
    const elapsed = (timestamp - startTimeRef.current) / 1000; // Seconds

    if (elapsed >= TOTAL_GAME_TIME_SECONDS) {
      finishGame();
      return;
    }

    // 1. Calculate Price Physics
    // The "Natural" direction is DOWN (selling pressure after a gap up)
    // The "Support" (Slider) pushes it UP.
    // We add noise for realism.

    const timeProgress = elapsed / TOTAL_GAME_TIME_SECONDS; // 0 to 1
    const lastPrice =
      priceHistoryRef.current[priceHistoryRef.current.length - 1].price;

    // Selling pressure increases as time goes on (people get impatient)
    const sellingPressure = 0.5 + timeProgress * 1.5;

    // Buying pressure comes from the slider (0-100)
    // 50 is neutral-ish, <50 drops, >50 pumps
    const supportStrength = supportLevelRef.current / 50;

    // Random noise
    const volatility = (Math.random() - 0.5) * 1.5;

    let delta = supportStrength * 0.8 - sellingPressure + volatility;

    // Hard crash at the end (The "Rug Pull" or 10:30 fade)
    if (elapsed > TOTAL_GAME_TIME_SECONDS * 0.85) {
      delta -= 3.0; // Massive dump
      if (!isCrashing.current) {
        isCrashing.current = true;
        setMessage('10:30 AM: THE UNLOAD BEGINS!');
      }
    }

    let newPrice = Math.max(10, lastPrice + delta); // Don't go below 10

    // 2. Trapped Traders Logic
    // If price is relatively stable (flat) or slowly rising, traders enter.
    // If price drops fast, traders panic.
    const priceChange = Math.abs(newPrice - lastPrice);
    const isStable = priceChange < 1.0 && newPrice > INITIAL_PRICE * 0.9;

    if (isStable && !isCrashing.current) {
      // More traders enter when stable at highs
      if (Math.random() > 0.8) {
        trappedTradersRef.current += 1;
        // Spawn particle
        particlesRef.current.push({
          id: Math.random(),
          x: CANVAS_WIDTH, // Start from right
          y: Math.random() * CANVAS_HEIGHT,
          vx: -2 - Math.random() * 2, // Move left
          vy: (Math.random() - 0.5) * 2,
          color: '#4ade80', // Green
        });
      }
    }

    // Update particles
    particlesRef.current = particlesRef.current
      .map((p) => ({
        ...p,
        x: p.x + p.vx,
        y: p.y + p.vy,
      }))
      .filter((p) => p.x > 0); // Remove when off screen

    // Update Refs
    priceHistoryRef.current.push({ time: elapsed, price: newPrice });

    // Update State (throttled slightly visually, but React handles 60fps okay for small DOM)
    setCurrentTime(elapsed);
    setCurrentPrice(newPrice);
    setTrappedTraders(trappedTradersRef.current);
    setParticles([...particlesRef.current]);

    // Keep history manageable for rendering
    if (priceHistoryRef.current.length > 300) {
      // Simplify curve if needed, but for 30s at 60fps = 1800 points.
      // We'll just render all for smoothness or subsample in the render function.
    }

    requestRef.current = requestAnimationFrame(gameLoop);
  };

  const finishGame = () => {
    setGameState(GameState.FINISHED);
    cancelAnimationFrame(requestRef.current!);
    setMessage('Market Closed.');
  };

  const formatTime = (seconds: number) => {
    const startHour = 9;
    const startMinute = 30;
    const totalMinutesToAdd = Math.floor(
      (seconds / TOTAL_GAME_TIME_SECONDS) * 60
    );

    let hour = startHour + Math.floor((startMinute + totalMinutesToAdd) / 60);
    let minute = (startMinute + totalMinutesToAdd) % 60;

    return `${hour}:${minute.toString().padStart(2, '0')} AM`;
  };

  // Convert price history to SVG path
  const getSvgPath = () => {
    if (priceHistoryRef.current.length === 0) return '';

    const maxPrice = Math.max(
      ...priceHistoryRef.current.map((p) => p.price),
      120
    );
    const minPrice = Math.min(
      ...priceHistoryRef.current.map((p) => p.price),
      80
    );
    const range = maxPrice - minPrice || 1;

    // Scale X to fit current time window or full game time
    const points = priceHistoryRef.current.map((p, i) => {
      const x = (p.time / TOTAL_GAME_TIME_SECONDS) * CANVAS_WIDTH;
      // Invert Y because SVG 0 is top
      const normalizedPrice = (p.price - minPrice) / range;
      const y = CANVAS_HEIGHT - normalizedPrice * (CANVAS_HEIGHT - 20) - 10;
      return `${x},${y}`;
    });

    return `M ${points.join(' L ')}`;
  };

  // Calculate Performance Score
  const getScoreGrade = () => {
    if (trappedTraders > 100)
      return { grade: 'A', text: 'Master Market Maker' };
    if (trappedTraders > 70) return { grade: 'B', text: 'Institutional Pro' };
    if (trappedTraders > 40) return { grade: 'C', text: 'Rookie Distributor' };
    return { grade: 'D', text: 'Got Squeezed' };
  };

  return (
    <div className="flex flex-col w-full bg-slate-900 text-white p-6 relative">
      {/* HUD */}
      <div className="flex justify-between items-center mb-6 bg-slate-800 p-4 rounded-lg border border-slate-700">
        <div className="flex items-center space-x-4">
          <div className="text-left">
            <p className="text-xs text-slate-400 uppercase tracking-wider">
              Time
            </p>
            <p className="text-2xl font-mono text-blue-400 font-bold">
              {formatTime(currentTime)}
            </p>
          </div>
          <div className="h-8 w-px bg-slate-600"></div>
          <div className="text-left">
            <p className="text-xs text-slate-400 uppercase tracking-wider">
              Stock Price
            </p>
            <p
              className={`text-2xl font-mono font-bold ${
                currentPrice < INITIAL_PRICE ? 'text-red-400' : 'text-green-400'
              }`}
            >
              ${currentPrice.toFixed(2)}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-end">
          <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">
            Late Buyers Trapped
          </p>
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-green-500" />
            <span className="text-3xl font-bold text-green-400">
              {trappedTraders}
            </span>
          </div>
        </div>
      </div>

      {/* Main Chart Area */}
      <div className="relative bg-black rounded-lg border border-slate-700 overflow-hidden mb-6 h-[500px] shadow-inner">
        {/* Grid Lines */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="absolute w-full h-px bg-slate-500"
              style={{ top: `${i * 25}%` }}
            ></div>
          ))}
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="absolute h-full w-px bg-slate-500"
              style={{ left: `${i * 16.6}%` }}
            ></div>
          ))}
        </div>

        {/* Dynamic Chart Line */}
        <svg
          className="absolute inset-0 w-full h-full"
          preserveAspectRatio="none"
          viewBox={`0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`}
        >
          <path
            d={getSvgPath()}
            fill="none"
            stroke={currentPrice < INITIAL_PRICE ? '#f87171' : '#4ade80'}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Area fill */}
          <path
            d={`${getSvgPath()} L ${
              (currentTime / TOTAL_GAME_TIME_SECONDS) * CANVAS_WIDTH
            },${CANVAS_HEIGHT} L 0,${CANVAS_HEIGHT} Z`}
            fill={
              currentPrice < INITIAL_PRICE
                ? 'rgba(248, 113, 113, 0.1)'
                : 'rgba(74, 222, 128, 0.1)'
            }
            stroke="none"
          />
        </svg>

        {/* Particles (Retail Traders) */}
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.8)]"
            style={{
              left: `${(p.x / CANVAS_WIDTH) * 100}%`,
              top: p.y,
              width: '4px',
              height: '4px',
              opacity: 0.8,
            }}
          />
        ))}

        {/* Current Price Indicator */}
        <div
          className="absolute right-0 flex items-center"
          style={{
            top: `${Math.min(
              100,
              Math.max(0, 100 - ((currentPrice - 80) / 40) * 100)
            )}%`,
            transform: 'translateY(-50%)',
          }}
        >
          <div className="w-full border-t border-dashed border-white opacity-50 absolute right-0"></div>
          <div className="bg-white text-black text-[10px] font-bold px-1 py-0.5 rounded-l shadow-lg z-10">
            ${currentPrice.toFixed(2)}
          </div>
        </div>

        {/* Overlays */}
        {gameState === GameState.IDLE && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center p-8 text-center z-20">
            <AlertTriangle className="w-12 h-12 text-yellow-400 mb-4" />
            <h2 className="text-2xl font-bold mb-2">Mission: The 10:30 Trap</h2>
            <p className="text-slate-300 mb-6 max-w-md">
              You are a Market Maker. The stock has gapped up on weak news. Your
              goal is to{' '}
              <span className="text-yellow-400">unload your inventory</span> to
              retail traders.
              <br />
              <br />
              <strong>Strategy:</strong> Keep the price steady (flat) to induce
              FOMO. If it drops too fast, they won't buy. If it spikes too high,
              you can't sell.
              <br />
              <br />
              Wait for the <span className="text-red-400">10:30 AM Flush</span>.
            </p>
            <button
              onClick={startGame}
              className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-3 px-8 rounded-full transition-all transform hover:scale-105"
            >
              <Play className="w-5 h-5" /> Start Trading Session
            </button>
          </div>
        )}

        {gameState === GameState.FINISHED && (
          <div className="absolute inset-0 bg-slate-900/95 flex flex-col items-center justify-center p-8 text-center z-20 animate-fade-in">
            <div className="text-4xl font-bold mb-2 text-white">
              {getScoreGrade().grade}
            </div>
            <h2 className="text-xl font-bold text-yellow-400 mb-4">
              {getScoreGrade().text}
            </h2>

            <div className="bg-slate-800 p-6 rounded-lg mb-6 w-full max-w-md border border-slate-700">
              <div className="flex justify-between mb-2">
                <span className="text-slate-400">Retail Traders Trapped:</span>
                <span className="text-green-400 font-bold">
                  {trappedTraders}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Closing Price:</span>
                <span className="text-red-400 font-bold">
                  ${currentPrice.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="bg-blue-900/30 border border-blue-500/30 p-4 rounded text-sm text-blue-200 mb-6 max-w-md text-left flex gap-3">
              <Info className="w-10 h-10 flex-shrink-0 text-blue-400" />
              <p>
                <strong>Lesson:</strong> Notice how holding the price "Flat"
                attracted the most buyers? This is why the "Gap Up Short" setup
                waits for the 10:30 AM breakdown. The flat period is a trap.
              </p>
            </div>

            <button
              onClick={startGame}
              className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 px-6 rounded-full transition-all"
            >
              <RotateCcw className="w-4 h-4" /> Replay Scenario
            </button>
          </div>
        )}
      </div>

      {/* Control Panel */}
      <div
        className={`transition-opacity duration-500 ${
          gameState === GameState.IDLE ? 'opacity-50 blur-sm' : 'opacity-100'
        }`}
      >
        <div className="flex flex-col space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-sm font-bold text-slate-300 flex items-center gap-2">
              <TrendingDown className="w-4 h-4" />
              Market Maker Bid Strength (Artificial Support)
            </label>
            <span
              className={`text-sm font-mono ${
                supportLevel > 80 ? 'text-red-400' : 'text-blue-400'
              }`}
            >
              {supportLevel > 80
                ? 'OVERHEATED'
                : supportLevel < 20
                ? 'COLLAPSING'
                : 'STABLE'}
            </span>
          </div>

          <input
            type="range"
            min="0"
            max="100"
            value={supportLevel}
            onChange={(e) => setSupportLevel(Number(e.target.value))}
            disabled={gameState !== GameState.PLAYING}
            className="w-full h-4 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-yellow-500 hover:accent-yellow-400"
          />
          <div className="flex justify-between text-xs text-slate-500 uppercase font-bold">
            <span>Remove Support (Crash)</span>
            <span>Hold Flat (Trap)</span>
            <span>Pump (Expensive)</span>
          </div>
        </div>

        {/* Message Ticker */}
        <div className="mt-6 bg-black/40 p-3 rounded border-l-4 border-yellow-500 font-mono text-sm text-yellow-100 flex items-center animate-pulse">
          <span className="mr-2">{'>>>'}</span> {message}
        </div>
      </div>
    </div>
  );
};

export default MarketMakerGame;
