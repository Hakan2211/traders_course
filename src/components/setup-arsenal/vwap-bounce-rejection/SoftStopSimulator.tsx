
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Play,
  AlertTriangle,
  CheckCircle,
  XCircle,
  TrendingDown,
  Clock,
  Activity,
  RefreshCw,
} from 'lucide-react';
import { ScenarioResult, SimulationState } from './types';

const VWAP_PRICE = 10.0;
const ENTRY_PRICE = 10.0;
const INITIAL_PRICE = 10.15;
const CANDLE_DURATION = 15; // Shortened for gameplay flow
const TICK_RATE = 50; // ms

export const SoftStopSimulator: React.FC = () => {
  // --- State ---
  const [simState, setSimState] = useState<SimulationState>({
    phase: 'idle',
    currentPrice: INITIAL_PRICE,
    candleOpen: 10.12,
    candleClose: 10.12,
    candleHigh: 10.12,
    candleLow: 10.12,
    timeRemaining: CANDLE_DURATION,
    pnl: 0,
    feedback: null,
    outcomeType: 'bounce',
  });

  const [hasSold, setHasSold] = useState(false);
  const [showExitButton, setShowExitButton] = useState(false);

  // Refs for animation loop
  const requestRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const lastTickTimeRef = useRef<number>(0);

  // --- Animation Logic ---

  const startSimulation = (forcedOutcome?: 'bounce' | 'break') => {
    // Randomize outcome if not forced: 70% chance of bounce (high prob setup), 30% break
    const outcome = forcedOutcome || (Math.random() > 0.3 ? 'bounce' : 'break');

    setSimState({
      phase: 'approaching',
      currentPrice: 10.08,
      candleOpen: 10.08,
      candleClose: 10.08,
      candleHigh: 10.08,
      candleLow: 10.08,
      timeRemaining: CANDLE_DURATION,
      pnl: 0,
      feedback: null,
      outcomeType: outcome,
    });
    setHasSold(false);
    setShowExitButton(false);

    // Start loop
    lastTickTimeRef.current = performance.now();
    requestRef.current = requestAnimationFrame(animate);
  };

  const animate = (time: number) => {
    // Throttling to tick rate
    if (time - lastTickTimeRef.current < TICK_RATE) {
      requestRef.current = requestAnimationFrame(animate);
      return;
    }
    lastTickTimeRef.current = time;

    setSimState((prev) => {
      let next = { ...prev };
      const volatility = 0.02;

      // 1. APPROACHING PHASE: Drop from open to near VWAP
      if (prev.phase === 'approaching') {
        const dropStep = 0.01 + Math.random() * 0.01;
        next.currentPrice = Math.max(
          VWAP_PRICE + 0.02,
          prev.currentPrice - dropStep
        );

        if (next.currentPrice <= VWAP_PRICE + 0.03) {
          next.phase = 'testing';
        }
      }
      // 2. TESTING PHASE: Dip below VWAP to scare the user
      else if (prev.phase === 'testing') {
        // Quick drop below VWAP
        const dropStep = 0.015;
        next.currentPrice = prev.currentPrice - dropStep;

        // Once we are sufficiently below VWAP, move to DECISION phase
        if (next.currentPrice <= VWAP_PRICE - 0.05) {
          // Dips to 9.95
          next.currentPrice = 9.95;
          next.phase = 'decision';
        }
      }
      // 3. DECISION PHASE: Hover below VWAP while timer counts down
      else if (prev.phase === 'decision') {
        // Tick timer
        next.timeRemaining = Math.max(0, prev.timeRemaining - TICK_RATE / 1000);

        // Micro movements around the "scare" price (9.93 - 9.97)
        const noise = (Math.random() - 0.5) * 0.02;
        next.currentPrice = Math.min(
          VWAP_PRICE - 0.01,
          Math.max(VWAP_PRICE - 0.08, prev.currentPrice + noise)
        );

        // If user sold early, we still animate to show them what they missed
        // If timer hits 0, resolve the candle
        if (next.timeRemaining <= 0) {
          next.phase = 'complete';

          // Final price move based on outcome
          if (prev.outcomeType === 'bounce') {
            // If it was a bounce, price rockets up
            next.currentPrice = VWAP_PRICE + 0.15; // 10.15
            next.feedback = hasSold
              ? '❌ You got shaken out! The algorithm grabbed your liquidity and the price ripped higher.'
              : '✅ Excellent discipline! You respected the soft stop, held through the wick, and caught the move.';
          } else {
            // If it was a break, price stays low
            next.currentPrice = VWAP_PRICE - 0.1; // 9.90
            // If user held, they now need to exit manually
            if (!hasSold) {
              setShowExitButton(true);
              next.feedback =
                '⚠️ The candle closed BELOW VWAP. Support has failed. Exit now!';
            } else {
              // If they panic sold, it was actually a lucky guess, but bad process for this specific setup logic?
              // Or maybe good? In this strategy, panic selling wicks is bad.
              // But if it breaks, you saved money.
              // However, the lesson teaches to WAIT for the close. So panic selling is still "bad process".
              next.feedback =
                '⚠️ You saved money, but you followed bad process. You sold before confirmation. Next time wait for the close.';
            }
          }
        }
      }
      // 4. COMPLETE PHASE: Just simple noise or settle
      else if (prev.phase === 'complete') {
        // Stop animation loop eventually
        if (prev.outcomeType === 'bounce' && prev.currentPrice < 10.15) {
          next.currentPrice += 0.02; // fly up
        }
      }

      // Update Candle Stats
      next.candleClose = next.currentPrice;
      next.candleHigh = Math.max(prev.candleHigh, next.currentPrice);
      next.candleLow = Math.min(prev.candleLow, next.currentPrice);

      // Update P&L (assuming entered at VWAP 10.00)
      // Standard size 1000 shares for dramatic effect
      next.pnl = (next.currentPrice - ENTRY_PRICE) * 1000;

      return next;
    });

    if (simState.phase !== 'complete' || simState.currentPrice < 10.15) {
      requestRef.current = requestAnimationFrame(animate);
    }
  };

  // Stop loop on unmount
  useEffect(() => {
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  // Handler for Panic Sell
  const handlePanicSell = () => {
    setHasSold(true);
    // We don't stop the animation; we let it play out so they see if they were right or wrong.
    // But we lock in their loss.
    // Calculate P&L at moment of sale
    const finalPnl = (simState.currentPrice - ENTRY_PRICE) * 1000;

    // If we are in decision phase (candle hasn't closed), we just mark as sold.
    // The feedback comes when the candle finishes.
  };

  const handleManualExit = () => {
    // This is for the "Break" scenario where user waits for close, then exits.
    setHasSold(true);
    setSimState((prev) => ({
      ...prev,
      feedback:
        '✅ Correct execution. The level broke, you waited for confirmation, and took the small stop.',
    }));
    setShowExitButton(false);
  };

  // --- Render Helpers ---

  // Scale helper for chart
  // Y-axis: 9.80 to 10.20
  const Y_MIN = 9.8;
  const Y_MAX = 10.25;
  const HEIGHT = 200;
  const getY = (price: number) => {
    return HEIGHT - ((price - Y_MIN) / (Y_MAX - Y_MIN)) * HEIGHT;
  };

  const vwapY = getY(VWAP_PRICE);
  const candleTop = getY(Math.max(simState.candleOpen, simState.candleClose));
  const candleBottom = getY(
    Math.min(simState.candleOpen, simState.candleClose)
  );
  const wickTop = getY(simState.candleHigh);
  const wickBottom = getY(simState.candleLow);
  const isGreen = simState.candleClose >= simState.candleOpen;

  const currentPnlFormatted =
    hasSold && simState.phase !== 'complete'
      ? 'Exited'
      : `$${simState.pnl.toFixed(0)}`;

  const pnlColor = simState.pnl >= 0 ? 'text-green-500' : 'text-red-500';

  return (
    <div className="w-full max-w-2xl mx-auto bg-slate-900 border border-slate-700 rounded-xl overflow-hidden shadow-2xl font-sans text-slate-200">
      {/* Header */}
      <div className="bg-slate-800 p-4 border-b border-slate-700 flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-400" />
            Soft Stop Simulator
          </h3>
          <p className="text-xs text-slate-400">
            Train your discipline: Wick vs. Close
          </p>
        </div>
        <div className="text-right">
          <div className="text-xs text-slate-400 uppercase tracking-wider">
            Unrealized P&L
          </div>
          <div
            className={`text-2xl font-mono font-bold ${
              hasSold ? 'text-slate-500' : pnlColor
            }`}
          >
            {currentPnlFormatted}
          </div>
        </div>
      </div>

      {/* Main Simulation Area */}
      <div className="relative h-64 bg-slate-950 p-6 flex items-center justify-center">
        {/* Chart SVG */}
        <svg
          width="100%"
          height="100%"
          className="overflow-visible"
          preserveAspectRatio="none"
        >
          {/* Grid lines */}
          <line
            x1="0"
            y1={getY(10.2)}
            x2="100%"
            y2={getY(10.2)}
            stroke="#1e293b"
            strokeDasharray="4 4"
          />
          <line
            x1="0"
            y1={getY(10.1)}
            x2="100%"
            y2={getY(10.1)}
            stroke="#1e293b"
            strokeDasharray="4 4"
          />
          <line
            x1="0"
            y1={getY(9.9)}
            x2="100%"
            y2={getY(9.9)}
            stroke="#1e293b"
            strokeDasharray="4 4"
          />

          {/* VWAP Line */}
          <line
            x1="0"
            y1={vwapY}
            x2="100%"
            y2={vwapY}
            stroke="#fbbf24"
            strokeWidth="2"
            strokeDasharray="6 4"
          />
          <text
            x="10"
            y={vwapY - 10}
            fill="#fbbf24"
            fontSize="12"
            fontWeight="bold"
          >
            VWAP $10.00
          </text>

          {/* Previous Context Candles (Static) */}
          {/* Candle 1: Green up */}
          <line
            x1="10%"
            y1={getY(9.9)}
            x2="10%"
            y2={getY(10.05)}
            stroke="#334155"
            strokeWidth="1"
          />
          <rect
            x="8%"
            y={getY(10.02)}
            width="4%"
            height={getY(9.95) - getY(10.02)}
            fill="#10b981"
          />

          {/* Candle 2: Big Green Breakout */}
          <line
            x1="25%"
            y1={getY(10.0)}
            x2="25%"
            y2={getY(10.18)}
            stroke="#334155"
            strokeWidth="1"
          />
          <rect
            x="23%"
            y={getY(10.15)}
            width="4%"
            height={getY(10.02) - getY(10.15)}
            fill="#10b981"
          />

          {/* ACTIVE CANDLE */}
          {simState.phase !== 'idle' && (
            <g className="transition-all duration-75 ease-linear">
              {/* Wick */}
              <line
                x1="50%"
                y1={wickTop}
                x2="50%"
                y2={wickBottom}
                stroke={isGreen ? '#10b981' : '#ef4444'}
                strokeWidth="2"
              />
              {/* Body */}
              <rect
                x="45%"
                y={candleTop}
                width="10%"
                height={Math.max(1, candleBottom - candleTop)}
                fill={isGreen ? '#10b981' : '#ef4444'}
              />
              {/* Price Tag Line */}
              <line
                x1="55%"
                y1={getY(simState.currentPrice)}
                x2="100%"
                y2={getY(simState.currentPrice)}
                stroke="#94a3b8"
                strokeWidth="1"
                strokeDasharray="2 2"
                opacity="0.5"
              />
              <rect
                x="90%"
                y={getY(simState.currentPrice) - 10}
                width="60"
                height="20"
                rx="4"
                fill={isGreen ? '#10b981' : '#ef4444'}
              />
              <text
                x="92%"
                y={getY(simState.currentPrice) + 4}
                fill="white"
                fontSize="12"
                fontWeight="bold"
              >
                ${simState.currentPrice.toFixed(2)}
              </text>
            </g>
          )}
        </svg>

        {/* Start Overlay */}
        {simState.phase === 'idle' && (
          <div className="absolute inset-0 bg-slate-900/80 flex items-center justify-center backdrop-blur-sm">
            <div className="text-center">
              <h4 className="text-xl font-bold mb-4">
                Ready to test your discipline?
              </h4>
              <p className="text-slate-400 mb-6 max-w-sm">
                You are Long 1000 shares at $10.00. <br /> The price is pulling
                back to VWAP.
              </p>
              <button
                onClick={() => startSimulation()}
                className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-full font-bold flex items-center gap-2 mx-auto transition-all transform hover:scale-105"
              >
                <Play className="w-5 h-5" /> Start Scenario
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Control Panel */}
      <div className="bg-slate-800 p-6 border-t border-slate-700">
        {/* Timer Bar */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex items-center gap-2 text-slate-400 text-sm font-mono bg-slate-900 px-3 py-1 rounded">
            <Clock className="w-4 h-4" />
            {simState.phase === 'idle'
              ? '00:15'
              : `00:${Math.ceil(simState.timeRemaining)
                  .toString()
                  .padStart(2, '0')}`}
          </div>
          <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-1000 ${
                simState.timeRemaining < 5
                  ? 'bg-red-500 animate-pulse'
                  : 'bg-blue-500'
              }`}
              style={{
                width: `${(simState.timeRemaining / CANDLE_DURATION) * 100}%`,
              }}
            ></div>
          </div>
        </div>

        {/* Action Buttons */}
        {simState.phase === 'complete' && simState.feedback ? (
          <div
            className={`p-4 rounded-lg border flex items-start gap-3 ${
              simState.feedback.includes('❌') ||
              simState.feedback.includes('bad process')
                ? 'bg-red-900/20 border-red-500/50 text-red-200'
                : 'bg-green-900/20 border-green-500/50 text-green-200'
            }`}
          >
            {simState.feedback.includes('❌') ? (
              <XCircle className="w-6 h-6 shrink-0" />
            ) : (
              <CheckCircle className="w-6 h-6 shrink-0" />
            )}
            <div>
              <p className="font-bold">
                {simState.feedback.includes('❌') ? 'Mistake' : 'Result'}
              </p>
              <p className="text-sm opacity-90">{simState.feedback}</p>
              <button
                onClick={() => setSimState({ ...simState, phase: 'idle' })}
                className="mt-3 text-xs bg-slate-700 hover:bg-slate-600 px-3 py-1.5 rounded flex items-center gap-2"
              >
                <RefreshCw className="w-3 h-3" /> Try Again
              </button>
            </div>
          </div>
        ) : showExitButton ? (
          <div className="animate-bounce">
            <button
              onClick={handleManualExit}
              className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-4 rounded-lg shadow-lg flex items-center justify-center gap-2"
            >
              <AlertTriangle className="w-6 h-6" /> CLOSE POSITION (STOP LOSS)
            </button>
            <p className="text-center text-red-400 text-sm mt-2">
              Candle closed below VWAP!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <button
              disabled={simState.phase === 'idle' || hasSold}
              onClick={handlePanicSell}
              className={`group relative p-4 rounded-lg border transition-all ${
                hasSold
                  ? 'bg-slate-700 border-slate-600 opacity-50 cursor-not-allowed'
                  : 'bg-slate-800 border-red-500/30 hover:bg-red-900/20 hover:border-red-500'
              }`}
            >
              <div className="flex flex-col items-center">
                <span className="text-red-400 font-bold text-lg mb-1 group-hover:scale-110 transition-transform">
                  PANIC SELL
                </span>
                <span className="text-xs text-slate-500">Exit immediately</span>
              </div>
            </button>

            <button
              disabled={simState.phase === 'idle' || hasSold}
              className={`group relative p-4 rounded-lg border transition-all ${
                hasSold
                  ? 'bg-slate-700 border-slate-600 opacity-50 cursor-not-allowed'
                  : 'bg-slate-800 border-blue-500/30 hover:bg-blue-900/20 hover:border-blue-500'
              }`}
            >
              <div className="flex flex-col items-center">
                <span className="text-blue-400 font-bold text-lg mb-1 group-hover:scale-110 transition-transform">
                  WAIT FOR CLOSE
                </span>
                <span className="text-xs text-slate-500">
                  Hold for confirmation
                </span>
              </div>
              {/* Visual cue that this is the active state implicitly if not selling */}
              <div className="absolute inset-0 border-2 border-transparent group-hover:border-blue-500/20 rounded-lg animate-pulse"></div>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
