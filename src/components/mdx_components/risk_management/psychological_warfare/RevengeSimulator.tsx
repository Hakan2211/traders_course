
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle,
  Activity,
  TrendingDown,
  Skull,
  ShieldCheck,
  RefreshCw,
  RotateCcw,
  X,
  Play,
} from 'lucide-react';
import SimulatedChart from './SimulatedChart';
import StressEffects from './StressEffects';
import { Phase, EmotionalState, SimulationState, Trade } from './types';

const INITIAL_BALANCE = 10000;

const RevengeSimulator: React.FC = () => {
  const [state, setState] = useState<SimulationState>({
    balance: INITIAL_BALANCE,
    startBalance: INITIAL_BALANCE,
    phase: 'INTRO',
    emotion: 'CALM',
    trades: [],
    stressLevel: 0,
  });

  const spiralIntervalRef = useRef<any>(null);

  // Helper to add a trade
  const addTrade = (
    pnlPercent: number,
    type: 'LONG' | 'SHORT',
    isSpiral = false
  ) => {
    const pnl = state.balance * (pnlPercent / 100);
    const newBalance = state.balance + pnl;

    // Calculate stress based on drawdown
    const drawdown = ((INITIAL_BALANCE - newBalance) / INITIAL_BALANCE) * 100;
    let newStress = Math.max(0, drawdown * 5); // Base stress

    let newEmotion: EmotionalState = 'CALM';
    if (drawdown > 1) newEmotion = 'ANXIOUS';
    if (drawdown > 3) newEmotion = 'ANGRY';
    if (drawdown > 8) newEmotion = 'RAGE';
    if (drawdown > 12) newEmotion = 'DESTROYED';

    // Artificial stress bump for Spiral
    if (isSpiral) newStress += 20;

    setState((prev) => ({
      ...prev,
      balance: newBalance,
      trades: [
        {
          id: Date.now(),
          pair: 'EUR/USD',
          type,
          entry: 1.105,
          exit: 1.1, // Simplified
          pnl,
          pnlPercent,
          timestamp: new Date().toLocaleTimeString(),
        },
        ...prev.trades,
      ],
      emotion: newEmotion,
      stressLevel: Math.min(100, newStress),
    }));

    return newBalance;
  };

  // ACTIONS
  const startSimulation = () => {
    setState({
      balance: INITIAL_BALANCE,
      startBalance: INITIAL_BALANCE,
      phase: 'ACT1_IDLE',
      emotion: 'CALM',
      trades: [],
      stressLevel: 0,
    });
  };

  const executeAct1Trade = () => {
    setState((prev) => ({ ...prev, phase: 'ACT1_TRADE' }));
    setTimeout(() => {
      addTrade(-1, 'LONG');
      setState((prev) => ({ ...prev, phase: 'ACT1_LOSS' }));
      setTimeout(() => {
        setState((prev) => ({ ...prev, phase: 'ACT1_CHOICE' }));
      }, 1500);
    }, 2000);
  };

  const handleAct1Choice = (choice: 'BREAK' | 'REVENGE') => {
    if (choice === 'BREAK') {
      setState((prev) => ({ ...prev, phase: 'AFTERMATH_GOOD' }));
    } else {
      setState((prev) => ({
        ...prev,
        phase: 'ACT2_IDLE',
        emotion: 'ANXIOUS',
        stressLevel: 20,
      }));
    }
  };

  const executeAct2Trade = () => {
    setState((prev) => ({ ...prev, phase: 'ACT2_TRADE' }));
    setTimeout(() => {
      addTrade(-2, 'SHORT'); // Bigger loss
      setState((prev) => ({ ...prev, phase: 'ACT2_LOSS' }));
      setTimeout(() => {
        setState((prev) => ({
          ...prev,
          phase: 'ACT2_CHOICE',
          emotion: 'ANGRY',
          stressLevel: 40,
        }));
      }, 1500);
    }, 2000);
  };

  const handleAct2Choice = (choice: 'STOP' | 'SPIRAL') => {
    if (choice === 'STOP') {
      setState((prev) => ({ ...prev, phase: 'AFTERMATH_GOOD' })); // Still technically "good" for stopping
    } else {
      setState((prev) => ({
        ...prev,
        phase: 'SPIRAL_Start',
        emotion: 'RAGE',
        stressLevel: 60,
      }));
    }
  };

  const startSpiral = () => {
    setState((prev) => ({ ...prev, phase: 'SPIRAL_ACTIVE', stressLevel: 75 }));

    let count = 0;
    const maxTrades = 5;

    spiralIntervalRef.current = setInterval(() => {
      count++;
      // Escalating losses: -3%, -4%, -5%
      const damage = -(2 + count);
      const currentBalance = addTrade(
        damage,
        count % 2 === 0 ? 'LONG' : 'SHORT',
        true
      );

      if (count >= maxTrades || currentBalance < 5000) {
        // Bankruptcy protection or max trades
        clearInterval(spiralIntervalRef.current);
        setState((prev) => ({
          ...prev,
          phase: 'AFTERMATH_BAD',
          emotion: 'DESTROYED',
          stressLevel: 100,
        }));
      }
    }, 800); // Fast interval
  };

  // Render Helpers
  const formatMoney = (val: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(val);
  const getPnlColor = (val: number) =>
    val >= 0 ? 'text-green-500' : 'text-red-500';

  return (
    <div className="relative w-full max-w-6xl mx-auto h-[90vh] bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 rounded-2xl overflow-hidden shadow-2xl border border-zinc-800/50 flex flex-col">
      {/* Ambient background glow */}
      <div
        className={`absolute inset-0 transition-all duration-1000 pointer-events-none ${
          state.stressLevel > 50
            ? 'bg-[radial-gradient(ellipse_at_top,rgba(220,38,38,0.15),transparent_50%)]'
            : 'bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.08),transparent_50%)]'
        }`}
      />

      <StressEffects level={state.stressLevel} />

      {/* HEADER */}
      <header className="h-16 border-b border-zinc-800/50 bg-zinc-900/60 flex items-center justify-between px-6 z-20 backdrop-blur-xl">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Activity className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight text-zinc-100">
              TRADER<span className="text-blue-400">PRO</span>
            </span>
          </div>
          <div className="h-8 w-px bg-gradient-to-b from-transparent via-zinc-700 to-transparent mx-3" />
          <div className="flex items-center space-x-2">
            <span className="text-zinc-500 text-xs font-medium uppercase tracking-wider">
              Status
            </span>
            <span
              className={`text-xs font-bold px-3 py-1.5 rounded-full border transition-all duration-500 ${
                state.emotion === 'CALM'
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-lg shadow-emerald-500/10'
                  : state.emotion === 'ANXIOUS'
                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/30 shadow-lg shadow-amber-500/10'
                  : state.emotion === 'ANGRY'
                  ? 'bg-orange-500/10 text-orange-400 border-orange-500/30 shadow-lg shadow-orange-500/10'
                  : 'bg-red-500/15 text-red-400 border-red-500/30 shadow-lg shadow-red-500/20 animate-pulse'
              }`}
            >
              {state.emotion}
            </span>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div
            className={`text-2xl font-mono font-bold tracking-tight transition-all duration-300 ${
              state.balance < INITIAL_BALANCE ? 'text-red-400' : 'text-zinc-100'
            } ${state.stressLevel > 50 ? 'stress-glitch scale-105' : ''}`}
          >
            {formatMoney(state.balance)}
          </div>
          <button
            onClick={startSimulation}
            className="p-2.5 hover:bg-zinc-800/80 rounded-xl text-zinc-500 hover:text-zinc-300 transition-all border border-transparent hover:border-zinc-700"
            title="Reset Simulation"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex overflow-hidden z-10 relative">
        {/* LEFT: CHART & CONTROLS */}
        <div className="flex-1 flex flex-col p-5 space-y-5">
          {/* Chart Area */}
          <div className="flex-1 min-h-[300px] bg-gradient-to-b from-zinc-900/80 to-zinc-900/40 rounded-xl relative shadow-inner border border-zinc-800/50 overflow-hidden">
            {/* Chart grid pattern */}
            <div
              className="absolute inset-0 opacity-[0.03]"
              style={{
                backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                backgroundSize: '40px 40px',
              }}
            />

            {state.phase !== 'INTRO' && (
              <SimulatedChart
                phase={state.phase}
                stressLevel={state.stressLevel}
              />
            )}

            {/* Center Overlays for Phases */}
            <AnimatePresence>
              {state.phase === 'INTRO' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-zinc-950/95 to-zinc-900/95 p-8 text-center backdrop-blur-sm"
                >
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="w-20 h-20 rounded-2xl bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center mb-8 shadow-2xl border border-zinc-700/50"
                  >
                    <Skull className="w-10 h-10 text-zinc-500" />
                  </motion.div>
                  <motion.h1
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-4xl font-black mb-3 text-white tracking-tight"
                  >
                    The Enemy Inside
                  </motion.h1>
                  <motion.p
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="text-zinc-400 max-w-md mb-10 leading-relaxed"
                  >
                    This simulator recreates the psychological spiral of revenge
                    trading. Your goal: survive with your capital intact.
                  </motion.p>
                  <motion.button
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={startSimulation}
                    className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold rounded-xl transition-all flex items-center space-x-3 shadow-lg shadow-blue-500/25"
                  >
                    <Play className="w-5 h-5" />
                    <span>BEGIN SIMULATION</span>
                  </motion.button>
                </motion.div>
              )}

              {state.phase === 'ACT1_LOSS' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="absolute bottom-6 right-6 bg-gradient-to-br from-red-900/95 to-red-950/95 text-white p-5 rounded-xl border border-red-500/50 shadow-2xl shadow-red-900/50 backdrop-blur-md"
                >
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <div className="font-bold text-sm uppercase tracking-wider text-red-300">
                      Stop Loss Hit
                    </div>
                  </div>
                  <div className="font-mono text-3xl font-bold">-$100.00</div>
                  <div className="text-red-400 text-sm">-1.0% of capital</div>
                </motion.div>
              )}

              {state.phase === 'SPIRAL_ACTIVE' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 flex items-center justify-center pointer-events-none"
                >
                  <motion.h1
                    animate={{
                      scale: [1, 1.05, 1],
                      opacity: [0.05, 0.1, 0.05],
                    }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                    className="text-[12rem] font-black text-red-500 uppercase tracking-tighter select-none"
                  >
                    RAGE
                  </motion.h1>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Controls Area */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 min-h-[180px] shrink-0">
            {/* Setup Card */}
            <div
              className={`bg-gradient-to-br from-zinc-900/90 to-zinc-900/50 p-5 rounded-xl border-l-4 flex flex-col justify-between relative overflow-hidden backdrop-blur-sm transition-all duration-500 ${
                state.phase.includes('ACT1')
                  ? 'border-l-emerald-500 border-r border-t border-b border-zinc-800/50'
                  : state.phase.includes('ACT2')
                  ? 'border-l-amber-500 border-r border-t border-b border-zinc-800/50'
                  : 'border-l-red-500 border-r border-t border-b border-zinc-800/50'
              }`}
            >
              {/* Subtle background glow */}
              <div
                className={`absolute inset-0 opacity-[0.03] transition-opacity duration-500 ${
                  state.phase.includes('ACT1')
                    ? 'bg-emerald-500'
                    : state.phase.includes('ACT2')
                    ? 'bg-amber-500'
                    : 'bg-red-500'
                }`}
              />

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.2em]">
                    Active Setup
                  </h3>
                  <span
                    className={`text-[10px] px-2.5 py-1 rounded-md font-bold tracking-wide shadow-sm ${
                      state.phase.includes('ACT1')
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : state.phase.includes('ACT2')
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : 'bg-red-500/20 text-red-400 border border-red-500/30'
                    }`}
                  >
                    {state.phase.includes('ACT1')
                      ? 'GRADE A'
                      : state.phase.includes('ACT2')
                      ? 'GRADE B-'
                      : 'GRADE F'}
                  </span>
                </div>

                <div className="flex items-baseline space-x-2 mb-2">
                  <span className="text-2xl font-mono font-semibold text-zinc-100 tracking-tight">
                    EUR/USD
                  </span>
                </div>
                <div className="text-[10px] text-zinc-500 font-medium flex items-center space-x-2 uppercase tracking-wider">
                  <span>15M</span>
                  <span className="w-1 h-1 rounded-full bg-zinc-600" />
                  <span>Trend Following</span>
                </div>
              </div>

              <div className="space-y-3 mt-5 relative z-10">
                <div className="flex justify-between text-xs items-center">
                  <span className="text-zinc-500 font-medium">
                    Risk Exposure
                  </span>
                  <span
                    className={`font-mono font-bold ${
                      state.stressLevel > 30 ? 'text-red-400' : 'text-blue-400'
                    }`}
                  >
                    {state.phase === 'SPIRAL_ACTIVE'
                      ? 'MAX'
                      : state.phase.includes('ACT2')
                      ? '2.0%'
                      : '1.0%'}
                  </span>
                </div>
                <div className="w-full bg-zinc-800/50 h-2 rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full transition-colors duration-500 ${
                      state.stressLevel > 30
                        ? 'bg-gradient-to-r from-red-600 to-red-400'
                        : 'bg-gradient-to-r from-blue-600 to-blue-400'
                    }`}
                    initial={false}
                    animate={{
                      width:
                        state.phase === 'SPIRAL_ACTIVE'
                          ? '100%'
                          : state.phase.includes('ACT2')
                          ? '50%'
                          : '25%',
                    }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="col-span-2 bg-gradient-to-br from-zinc-900/80 to-zinc-900/40 p-5 rounded-xl border border-zinc-800/50 flex items-center justify-center relative backdrop-blur-sm overflow-hidden">
              {/* Normal Trade Button */}
              {state.phase === 'ACT1_IDLE' && (
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={executeAct1Trade}
                  className="w-full h-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 rounded-xl font-bold text-white shadow-xl shadow-blue-500/20 flex items-center justify-center space-x-3 text-lg"
                >
                  <Play className="w-5 h-5" />
                  <span>PLACE TRADE</span>
                  <span className="text-blue-200 text-sm font-normal">
                    (1% Risk)
                  </span>
                </motion.button>
              )}

              {/* Loading State */}
              {(state.phase === 'ACT1_TRADE' ||
                state.phase === 'ACT2_TRADE') && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center space-y-3"
                >
                  <RefreshCw className="w-8 h-8 animate-spin text-zinc-400" />
                  <span className="text-zinc-400 font-medium">
                    Executing Order...
                  </span>
                </motion.div>
              )}

              {/* Choice 1: Break vs Revenge */}
              {state.phase === 'ACT1_CHOICE' && (
                <div className="flex space-x-4 w-full h-full">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleAct1Choice('BREAK')}
                    className="flex-1 bg-gradient-to-br from-zinc-800/80 to-zinc-900/80 hover:from-emerald-900/30 hover:to-emerald-950/30 border border-emerald-500/20 hover:border-emerald-500/40 text-emerald-400 rounded-xl p-4 transition-all flex flex-col items-center justify-center group"
                  >
                    <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center mb-3 group-hover:bg-emerald-500/20 transition-colors">
                      <ShieldCheck className="w-6 h-6 text-emerald-500" />
                    </div>
                    <div className="text-base font-bold text-emerald-400 mb-1">
                      Walk Away
                    </div>
                    <div className="text-[10px] uppercase tracking-widest text-emerald-500/60">
                      30 min cooldown
                    </div>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleAct1Choice('REVENGE')}
                    className="flex-1 bg-gradient-to-br from-red-900/20 to-red-950/20 hover:from-red-900/30 hover:to-red-950/30 border border-red-500/20 hover:border-red-500/40 text-red-400 rounded-xl p-4 transition-all flex flex-col items-center justify-center group"
                  >
                    <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mb-3 group-hover:bg-red-500/20 transition-colors">
                      <TrendingDown className="w-6 h-6 text-red-500 group-hover:rotate-12 transition-transform" />
                    </div>
                    <div className="text-base font-bold text-red-400 mb-1">
                      Revenge Trade
                    </div>
                    <div className="text-[10px] uppercase tracking-widest text-red-500/60">
                      Win it back now
                    </div>
                  </motion.button>
                </div>
              )}

              {/* Act 2 Entry */}
              {state.phase === 'ACT2_IDLE' && (
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={executeAct2Trade}
                  className="w-full h-full bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 rounded-xl font-bold text-white shadow-xl shadow-red-500/30 flex flex-col items-center justify-center animate-pulse"
                >
                  <span className="text-xl mb-1">RECOVER LOSSES</span>
                  <span className="text-red-200 text-sm font-normal">
                    Double size — 2% Risk
                  </span>
                </motion.button>
              )}

              {/* Choice 2: Stop vs Spiral */}
              {state.phase === 'ACT2_CHOICE' && (
                <div className="flex space-x-4 w-full h-full relative z-10">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleAct2Choice('STOP')}
                    className="flex-1 bg-gradient-to-br from-zinc-800/80 to-zinc-900/80 text-zinc-400 rounded-xl p-4 transition-all flex flex-col items-center justify-center border border-zinc-700/50 hover:border-zinc-600"
                  >
                    <div className="w-12 h-12 rounded-full bg-zinc-700/30 flex items-center justify-center mb-3">
                      <X className="w-6 h-6" />
                    </div>
                    <div className="text-base font-bold mb-1">Accept Loss</div>
                    <div className="text-[10px] uppercase tracking-widest text-zinc-500">
                      Stop at -3%
                    </div>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleAct2Choice('SPIRAL')}
                    className="flex-[2] bg-gradient-to-br from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white rounded-xl p-4 transition-all flex flex-col items-center justify-center shadow-[0_0_40px_rgba(220,38,38,0.4)] border border-red-400/50"
                  >
                    <AlertTriangle className="w-10 h-10 mb-2 animate-bounce" />
                    <span className="text-xl font-black italic tracking-tight mb-1">
                      I CAN FIX THIS
                    </span>
                    <span className="text-[10px] font-bold bg-black/30 px-3 py-1 rounded-full uppercase tracking-widest">
                      Maximum Leverage
                    </span>
                  </motion.button>
                </div>
              )}

              {/* Spiral Trigger */}
              {state.phase === 'SPIRAL_Start' && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={startSpiral}
                  className="w-full h-full bg-gradient-to-br from-red-700 via-red-600 to-red-800 rounded-xl font-black text-3xl text-white shadow-2xl shadow-red-500/50 border-4 border-red-400 flex items-center justify-center"
                >
                  <span className="animate-pulse">GET IT BACK NOW</span>
                </motion.button>
              )}

              {/* Spiral Active - Disabled Buttons */}
              {state.phase === 'SPIRAL_ACTIVE' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="w-full h-full flex flex-col items-center justify-center bg-black/60 rounded-xl"
                >
                  <RefreshCw className="w-10 h-10 animate-spin text-red-500 mb-3" />
                  <span className="text-red-400 font-mono font-bold text-lg">
                    EXECUTING ORDERS...
                  </span>
                </motion.div>
              )}

              {/* Outcome Overlay */}
              {(state.phase === 'AFTERMATH_GOOD' ||
                state.phase === 'AFTERMATH_BAD') && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 bg-zinc-950/98 z-20 flex flex-col items-center justify-center p-6 text-center backdrop-blur-md overflow-y-auto"
                >
                  <div className="my-auto flex flex-col items-center justify-center w-full max-w-xl py-8">
                    {/* Icon */}
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{
                        type: 'spring',
                        stiffness: 200,
                        damping: 15,
                      }}
                      className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-6 ${
                        state.phase === 'AFTERMATH_BAD'
                          ? 'bg-gradient-to-br from-red-500 to-red-700 shadow-xl shadow-red-500/30'
                          : 'bg-gradient-to-br from-emerald-500 to-emerald-700 shadow-xl shadow-emerald-500/30'
                      }`}
                    >
                      {state.phase === 'AFTERMATH_BAD' ? (
                        <Skull className="w-10 h-10 text-white" />
                      ) : (
                        <ShieldCheck className="w-10 h-10 text-white" />
                      )}
                    </motion.div>

                    {/* Title */}
                    <motion.h2
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.1 }}
                      className={`text-5xl font-black mb-2 tracking-tight ${
                        state.phase === 'AFTERMATH_BAD'
                          ? 'text-red-500'
                          : 'text-emerald-500'
                      }`}
                    >
                      {state.phase === 'AFTERMATH_BAD' ? 'WRECKED' : 'SURVIVED'}
                    </motion.h2>

                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.15 }}
                      className={`text-sm font-medium tracking-[0.3em] uppercase mb-10 ${
                        state.phase === 'AFTERMATH_BAD'
                          ? 'text-red-500/60'
                          : 'text-emerald-500/60'
                      }`}
                    >
                      {state.phase === 'AFTERMATH_BAD'
                        ? 'Account Destroyed'
                        : 'Capital Preserved'}
                    </motion.div>

                    {/* Stats */}
                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="grid grid-cols-2 gap-4 mb-10 w-full"
                    >
                      <div className="bg-zinc-900/80 rounded-xl p-5 border border-zinc-800/50">
                        <div className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest mb-2">
                          Final Balance
                        </div>
                        <div className="text-2xl font-mono text-white">
                          {formatMoney(state.balance)}
                        </div>
                      </div>
                      <div className="bg-zinc-900/80 rounded-xl p-5 border border-zinc-800/50">
                        <div className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest mb-2">
                          Performance
                        </div>
                        <div
                          className={`text-2xl font-mono ${
                            state.balance >= INITIAL_BALANCE
                              ? 'text-emerald-400'
                              : 'text-red-400'
                          }`}
                        >
                          {(
                            ((state.balance - INITIAL_BALANCE) /
                              INITIAL_BALANCE) *
                            100
                          ).toFixed(1)}
                          %
                        </div>
                      </div>
                    </motion.div>

                    {/* Analysis Box */}
                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.25 }}
                      className={`w-full rounded-xl p-6 border-l-4 ${
                        state.phase === 'AFTERMATH_BAD'
                          ? 'bg-red-950/30 border-red-500'
                          : 'bg-emerald-950/30 border-emerald-500'
                      }`}
                    >
                      <h3 className="text-zinc-100 font-bold mb-3 text-sm uppercase tracking-wider flex items-center">
                        <Activity
                          className={`w-4 h-4 mr-2 ${
                            state.phase === 'AFTERMATH_BAD'
                              ? 'text-red-500'
                              : 'text-emerald-500'
                          }`}
                        />
                        Analysis
                      </h3>
                      <p className="text-zinc-300 text-sm leading-relaxed">
                        {state.phase === 'AFTERMATH_BAD'
                          ? 'You fell into the Revenge Trading Trap. A minor -1% loss triggered an emotional spiral. Instead of walking away, you doubled down with larger size and lower quality setups. This is how accounts go to zero.'
                          : 'You survived. Taking a loss hurts, but walking away preserved your capital and mental state. The market will be there tomorrow. This is what professionals do.'}
                      </p>
                    </motion.div>

                    {/* Button */}
                    <motion.button
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={startSimulation}
                      className="mt-10 px-8 py-4 rounded-xl bg-white hover:bg-zinc-100 text-zinc-900 font-bold transition-all shadow-xl"
                    >
                      Try Again
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT: HISTORY & LOGS */}
        <div className="w-72 bg-gradient-to-b from-zinc-900/60 to-zinc-950/60 border-l border-zinc-800/50 flex flex-col backdrop-blur-sm">
          <div className="p-4 border-b border-zinc-800/50 flex items-center justify-between">
            <span className="font-bold text-xs text-zinc-400 uppercase tracking-[0.2em]">
              Trade Log
            </span>
            <span className="text-[10px] text-zinc-600 font-mono">
              {state.trades.length} trades
            </span>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            <AnimatePresence>
              {state.trades.map((trade, index) => (
                <motion.div
                  key={trade.id}
                  initial={{ opacity: 0, x: 20, scale: 0.95 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className={`bg-zinc-900/60 p-3 rounded-lg border text-sm relative overflow-hidden backdrop-blur-sm ${
                    trade.pnlPercent < -2
                      ? 'border-red-500/30'
                      : 'border-zinc-800/50'
                  }`}
                >
                  {/* Loss intensity indicator */}
                  {trade.pnlPercent < 0 && (
                    <div
                      className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-red-500 to-red-600"
                      style={{
                        opacity: Math.min(Math.abs(trade.pnlPercent) / 5, 1),
                      }}
                    />
                  )}
                  <div className="flex justify-between items-center mb-2 pl-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-zinc-200">
                        {trade.pair}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          trade.type === 'LONG'
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : 'bg-red-500/10 text-red-400'
                        }`}
                      >
                        {trade.type}
                      </span>
                    </div>
                    <span className="text-[10px] text-zinc-600 font-mono">
                      {trade.timestamp}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pl-2">
                    <span className="text-zinc-500 text-xs">
                      {trade.pnlPercent.toFixed(1)}%
                    </span>
                    <span
                      className={`font-mono font-bold ${getPnlColor(
                        trade.pnl
                      )}`}
                    >
                      {trade.pnl > 0 ? '+' : ''}
                      {formatMoney(trade.pnl)}
                    </span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {state.trades.length === 0 && (
              <div className="text-center text-zinc-600 text-xs py-12 flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-zinc-800/50 flex items-center justify-center mb-3">
                  <Activity className="w-5 h-5 text-zinc-600" />
                </div>
                <span>No trades yet</span>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default RevengeSimulator;
