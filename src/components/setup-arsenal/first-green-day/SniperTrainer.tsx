
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  RotateCcw,
  Crosshair,
  AlertTriangle,
  CheckCircle,
  XCircle,
  TrendingUp,
} from 'lucide-react';
import DailyChart from './DailyChart';

type GameState = 'idle' | 'running' | 'finished';
type Scenario = 'bullish' | 'bearish';

const SniperTrainer: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>('idle');
  const [scenario, setScenario] = useState<Scenario>('bullish');
  const [, setTime] = useState(0); // 0 to 100 progress
  const [displayTime, setDisplayTime] = useState('09:30:00');
  const [price, setPrice] = useState(5.0);
  const [candleOpen] = useState(5.0);
  const [candleHigh, setCandleHigh] = useState(5.0);
  const [candleLow, setCandleLow] = useState(5.0);
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);
  const [showStopLoss, setShowStopLoss] = useState(false);

  // Animation Refs
  const requestRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const DURATION = 5000; // 5 seconds for the simulation

  const resetGame = () => {
    setGameState('idle');
    setTime(0);
    setDisplayTime('09:30:00');
    setPrice(5.0);
    setCandleHigh(5.0);
    setCandleLow(5.0);
    setFeedback(null);
    setShowStopLoss(false);
    // Randomize scenario next run
    setScenario(Math.random() > 0.5 ? 'bullish' : 'bearish');
  };

  const startGame = () => {
    resetGame();
    setGameState('running');
    setFeedback({
      type: 'info',
      message: 'Market Open! Wait for the candle to close...',
    });
    startTimeRef.current = performance.now();
    requestRef.current = requestAnimationFrame(animate);
  };

  const animate = (timestamp: number) => {
    if (!startTimeRef.current) startTimeRef.current = timestamp;
    const elapsed = timestamp - startTimeRef.current;
    const progress = Math.min(elapsed / DURATION, 1);

    setTime(progress * 100);

    // Calculate simulated time 9:30:00 -> 9:35:00
    const totalSeconds = Math.floor(progress * 300); // 300 seconds = 5 mins
    const minutes = 30 + Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    setDisplayTime(`09:${minutes}:${seconds.toString().padStart(2, '0')}`);

    // Simulate Price Action based on Scenario
    // Using sine waves + noise to make it look organic
    let currentPrice = 5.0;
    const noise = (Math.random() - 0.5) * 0.05;

    if (scenario === 'bullish') {
      // Dip then Rip
      if (progress < 0.3) {
        // Drop phase
        currentPrice = 5.0 - progress * 0.5 + noise; // Drop to ~4.85
      } else {
        // Rise phase
        currentPrice = 4.85 + (progress - 0.3) * 0.8 + noise; // Rise to ~5.40
      }
    } else {
      // Pop then Drop (Trap)
      if (progress < 0.4) {
        // Rise phase
        currentPrice = 5.0 + progress * 0.4 + noise; // Rise to ~5.16
      } else {
        // Drop phase
        currentPrice = 5.16 - (progress - 0.4) * 1.0 + noise; // Drop to ~4.60
      }
    }

    setPrice(currentPrice);
    setCandleHigh((prev) => Math.max(prev, currentPrice));
    setCandleLow((prev) => Math.min(prev, currentPrice));

    if (progress < 1) {
      requestRef.current = requestAnimationFrame(animate);
    } else {
      setGameState('finished');
      const finalMessage =
        scenario === 'bullish'
          ? 'Candle closed Green. Setup valid?'
          : 'Candle closed Red. Setup valid?';
      setFeedback({ type: 'info', message: finalMessage });
    }
  };

  const handleBuy = () => {
    if (gameState === 'idle') return;

    if (gameState === 'running') {
      // Early entry attempt
      cancelAnimationFrame(requestRef.current!);
      setGameState('finished');
      setFeedback({
        type: 'error',
        message:
          'TOO EARLY! You must wait for the 5-minute candle to close to confirm the bounce.',
      });
      return;
    }

    if (gameState === 'finished') {
      if (scenario === 'bullish') {
        if (price >= candleOpen) {
          setFeedback({
            type: 'success',
            message:
              'ENTRY VALID! Nice patience. The candle closed GREEN. Stop loss set at the low of the day.',
          });
          setShowStopLoss(true);
        } else {
          // Edge case: Scene was bullish but closed red (shouldn't happen with current logic but good to handle)
          setFeedback({
            type: 'error',
            message: 'FAIL: Candle closed RED. Wait for green.',
          });
        }
      } else {
        // Bearish scenario
        setFeedback({
          type: 'error',
          message:
            'FAIL: Don\'t fight weakness! The candle closed RED. This is a "falling knife".',
        });
      }
    }
  };

  // Derived styles for candle
  const isGreen = price >= candleOpen;
  const candleColor = isGreen ? 'bg-green-500' : 'bg-red-500';
  const candleWickColor = isGreen ? 'bg-green-500' : 'bg-red-500';

  // Scaling for display (mapping price range to pixels)
  // Assuming visible range $4.50 to $5.50
  const MIN_Y = 4.5;
  const MAX_Y = 5.5;
  const RANGE = MAX_Y - MIN_Y;
  const CONTAINER_HEIGHT = 300; // px

  const getY = (p: number) => {
    return CONTAINER_HEIGHT - ((p - MIN_Y) / RANGE) * CONTAINER_HEIGHT;
  };

  const openY = getY(candleOpen);
  const currentY = getY(price);
  const highY = getY(candleHigh);
  const lowY = getY(candleLow);

  const bodyTop = Math.min(openY, currentY);
  const bodyHeight = Math.abs(openY - currentY) || 1; // min 1px
  const wickTop = highY;
  const wickHeight = Math.abs(highY - lowY) || 1;

  return (
    <div className="bg-gray-950 text-gray-100 rounded-xl shadow-2xl border border-gray-800 overflow-hidden font-sans my-8">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 p-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2 text-white">
            <Crosshair className="text-yellow-400" />
            First Green Day{' '}
            <span className="text-gray-500 font-normal text-lg">
              / Execution Trainer
            </span>
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Goal: Wait for the first 5-minute candle to close GREEN.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-xs text-gray-500 uppercase tracking-wider">
              Current Time
            </div>
            <div
              className={`text-2xl font-mono font-bold ${
                gameState === 'running' ? 'text-yellow-400' : 'text-gray-300'
              }`}
            >
              {displayTime}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 lg:divide-x divide-gray-800">
        {/* Left: Context */}
        <div className="p-6 bg-gray-900/50 flex flex-col gap-6">
          <div>
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" /> Setup Context
            </h2>
            <DailyChart />
          </div>

          <div className="space-y-4 text-sm text-gray-300">
            <div className="bg-gray-800/50 p-3 rounded border border-gray-700">
              <strong className="text-yellow-400 block mb-1">Scenario:</strong>
              Stock is down 60% after a parabolic run. RSI is &lt; 20. Volume
              was huge yesterday (capitulation).
            </div>
            <div className="bg-gray-800/50 p-3 rounded border border-gray-700">
              <strong className="text-green-400 block mb-1">Mission:</strong>
              Wait for the 9:30 AM open. Do NOT buy if the candle is red. Buy
              ONLY if the first 5-min candle closes green.
            </div>
          </div>
        </div>

        {/* Right: Action Area */}
        <div className="col-span-2 p-6 relative bg-gradient-to-b from-gray-900 to-gray-950 flex flex-col items-center justify-center">
          {/* Intraday Chart Area */}
          <div className="relative w-full max-w-md h-[300px] bg-gray-900 border border-gray-800 rounded-lg mb-8 shadow-inner overflow-hidden">
            {/* Grid */}
            <div className="absolute inset-0 opacity-10 pointer-events-none">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="w-full h-px bg-gray-500 absolute"
                  style={{ top: `${i * 25}%` }}
                ></div>
              ))}
            </div>

            {/* Price Label Helper */}
            <div className="absolute right-2 top-2 text-xs text-gray-500 font-mono">
              ${price.toFixed(2)}
            </div>

            {/* The Candle */}
            <div className="absolute left-1/2 transform -translate-x-1/2 w-8 h-full">
              {/* Wick */}
              <motion.div
                className={`absolute w-1 left-1/2 -translate-x-1/2 ${candleWickColor}`}
                style={{ top: wickTop, height: wickHeight }}
              />
              {/* Body */}
              <motion.div
                className={`absolute w-8 rounded-sm ${candleColor} border border-black/20`}
                style={{ top: bodyTop, height: bodyHeight }}
              />

              {/* Stop Loss Indicator (Visual Feedback) */}
              <AnimatePresence>
                {showStopLoss && (
                  <motion.div
                    initial={{ opacity: 0, scaleX: 0 }}
                    animate={{ opacity: 1, scaleX: 1 }}
                    className="absolute w-32 left-1/2 -translate-x-1/2 border-b-2 border-red-500 border-dashed flex items-center justify-center"
                    style={{ top: lowY }}
                  >
                    <span className="text-[10px] text-red-500 bg-gray-900 px-1 mt-4 whitespace-nowrap">
                      STOP LOSS (${candleLow.toFixed(2)})
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Watermark */}
            <div className="absolute bottom-2 left-2 text-gray-700 font-mono text-xs font-bold pointer-events-none select-none">
              5 MIN CHART
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col items-center gap-6 w-full max-w-md">
            {/* Feedback Message Area */}
            <div className="h-14 flex items-center justify-center w-full">
              <AnimatePresence mode="wait">
                {feedback && (
                  <motion.div
                    key={feedback.message}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold border ${
                      feedback.type === 'success'
                        ? 'bg-green-500/10 border-green-500/50 text-green-400'
                        : feedback.type === 'error'
                        ? 'bg-red-500/10 border-red-500/50 text-red-400'
                        : 'bg-blue-500/10 border-blue-500/50 text-blue-300'
                    }`}
                  >
                    {feedback.type === 'success' && (
                      <CheckCircle className="w-5 h-5" />
                    )}
                    {feedback.type === 'error' && (
                      <XCircle className="w-5 h-5" />
                    )}
                    {feedback.type === 'info' && (
                      <AlertTriangle className="w-5 h-5" />
                    )}
                    {feedback.message}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="flex gap-4 w-full">
              {gameState === 'idle' || gameState === 'finished' ? (
                <button
                  onClick={startGame}
                  className="flex-1 flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 text-white font-bold py-4 px-6 rounded-lg transition-all shadow-lg border-b-4 border-gray-900 active:border-b-0 active:translate-y-1"
                >
                  {gameState === 'finished' ? (
                    <>
                      <RotateCcw className="w-5 h-5" /> Reset
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5" /> Start Session
                    </>
                  )}
                </button>
              ) : (
                <div className="flex-1 bg-gray-800 text-gray-500 font-bold py-4 px-6 rounded-lg border border-gray-700 flex items-center justify-center cursor-not-allowed">
                  Simulating...
                </div>
              )}

              <button
                onClick={handleBuy}
                disabled={gameState === 'idle'}
                className={`flex-1 flex flex-col items-center justify-center py-2 px-6 rounded-lg font-bold transition-all shadow-lg border-b-4 border-black/30 active:border-b-0 active:translate-y-1 ${
                  gameState === 'finished' &&
                  scenario === 'bullish' &&
                  !feedback?.message.includes('VALID')
                    ? 'bg-green-600 hover:bg-green-500 text-white animate-pulse ring-4 ring-green-500/30' // Valid Entry Prompt
                    : gameState === 'running'
                    ? 'bg-gray-800 text-gray-500 cursor-wait'
                    : 'bg-green-700 hover:bg-green-600 text-white'
                } ${
                  gameState === 'idle' ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <span className="text-lg">BUY LONG</span>
                <span className="text-[10px] font-normal opacity-70">
                  ENTRY
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SniperTrainer;
