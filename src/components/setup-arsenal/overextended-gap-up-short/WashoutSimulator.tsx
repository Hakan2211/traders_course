
import React, { useState } from 'react';

import {
  Play,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  ChevronLeft,
  TrendingDown,
  TrendingUp,
  XCircle,
} from 'lucide-react';

import { motion, AnimatePresence } from 'framer-motion';

// Types for the step data

interface StepData {
  time: string;

  price: string;

  priceChange: 'drop' | 'rip' | 'entry' | 'fade';

  action: string;

  amateur: string;

  pro: string;

  coords: { x1: number; y1: number; x2: number; y2: number };
}

export const WashoutSimulator: React.FC = () => {
  const [step, setStep] = useState(0);

  // Coordinate mapping: 0-100 grid.

  // Y-axis: 0 is top (High Price), 100 is bottom (Low Price).

  // X-axis: Time.

  // Open: $12.00 -> y:30

  // Drop: $11.50 -> y:50

  // Rip:  $12.50 -> y:10

  // Entry:$12.20 -> y:22

  // Fade: $10.50 -> y:90

  const steps: StepData[] = [
    {
      time: '9:30 AM - The Open',

      price: '$12.00 → $11.50',

      priceChange: 'drop',

      action: 'Price gaps up to $12.00 and immediately drops at the open.',

      amateur:
        "Shorts immediately! 'It's fading just like I thought!' (FOMO entry)",

      pro: 'Waits. Recognizes the gap is emotional and this early drop is often a trap.',

      coords: { x1: 10, y1: 30, x2: 25, y2: 50 },
    },

    {
      time: '9:45 AM - The Trap (Washout)',

      price: '$11.50 → $12.50',

      priceChange: 'rip',

      action: 'Sudden violent reversal rips to new highs ($12.50).',

      amateur:
        "Panic! 'It's a squeeze! I have to cover!' (Buys back for a loss)",

      pro: 'Watches calmly. Notes volume is declining on the rip. Identifies the washout.',

      coords: { x1: 25, y1: 50, x2: 45, y2: 10 },
    },

    {
      time: '10:15 AM - The Real Entry',

      price: '$12.50 → $12.20',

      priceChange: 'entry',

      action: 'Price stalls at highs, fails to hold, and breaks back down.',

      amateur:
        "Too scared to touch it again after losing money. 'This stock is crazy.'",

      pro: 'EXECUTES SHORT. Risk defined clearly above the washout high ($12.50).',

      coords: { x1: 45, y1: 10, x2: 55, y2: 22 },
    },

    {
      time: '11:00 AM - The Payoff',

      price: '$12.20 → $10.50',

      priceChange: 'fade',

      action: 'The real fade occurs, dropping toward previous close.',

      amateur: 'Watching from the sidelines in frustration.',

      pro: 'Takes profit at the gap fill magnet ($10.50).',

      coords: { x1: 55, y1: 22, x2: 95, y2: 90 },
    },
  ];

  const handleNext = () => {
    setStep((prev) => Math.min(steps.length - 1, prev + 1));
  };

  const handleBack = () => {
    setStep((prev) => Math.max(0, prev - 1));
  };

  const handleReset = () => {
    setStep(0);
  };

  const currentStepData = steps[step];

  const isComplete = step === steps.length - 1;

  // Helper to determine line color based on price action direction

  const getLineColor = (index: number) => {
    const change = steps[index].priceChange;

    if (change === 'rip') return '#22c55e'; // Green

    if (change === 'entry') return '#3b82f6'; // Blue

    return '#ef4444'; // Red
  };

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-2xl overflow-hidden font-sans">
      {/* Header */}

      <div className="bg-slate-950/50 p-6 border-b border-slate-800 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
            <AlertTriangle className="text-yellow-500 w-6 h-6" />
          </div>

          <div>
            <h3 className="text-xl font-bold text-white tracking-tight">
              Simulator: The Washout Trap
            </h3>

            <p className="text-slate-400 text-sm">
              Scenario 2: "Washout Then Fade"
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-500 bg-slate-950 px-3 py-1 rounded-full border border-slate-800">
          <span>
            PHASE {step + 1} / {steps.length}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2">
        {/* Left Column: Visualization */}

        <div className="p-6 lg:p-8 border-b lg:border-b-0 lg:border-r border-slate-800 bg-slate-950/30 relative min-h-[300px] flex flex-col">
          <div className="absolute top-4 right-4 z-10">
            <div className="flex items-center gap-2 bg-slate-900/80 backdrop-blur px-3 py-1.5 rounded-lg border border-slate-800 shadow-sm">
              <div
                className={`w-2 h-2 rounded-full ${
                  step === 0
                    ? 'bg-red-500'
                    : step === 1
                    ? 'bg-green-500'
                    : step === 2
                    ? 'bg-blue-500'
                    : 'bg-red-500'
                } animate-pulse`}
              ></div>

              <span className="text-xs font-medium text-slate-300">
                Live Action
              </span>
            </div>
          </div>

          {/* Chart Container */}

          <div className="flex-1 w-full h-64 relative mt-4 mb-8">
            {/* Grid Background */}

            <div className="absolute inset-0 grid grid-cols-4 grid-rows-4 gap-4 pointer-events-none opacity-10">
              {[...Array(16)].map((_, i) => (
                <div
                  key={i}
                  className="border-r border-b border-slate-400 last:border-0"
                ></div>
              ))}
            </div>

            {/* Price Axis Labels (Simplified) */}

            <div className="absolute -left-6 top-0 text-[10px] text-slate-600 font-mono">
              $12.50
            </div>

            <div className="absolute -left-6 bottom-0 text-[10px] text-slate-600 font-mono">
              $10.50
            </div>

            {/* The SVG Chart */}

            <svg
              className="w-full h-full overflow-visible"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >
              {/* Reference: Open Price Line */}

              <line
                x1="0"
                y1="30"
                x2="100"
                y2="30"
                stroke="#475569"
                strokeWidth="0.5"
                strokeDasharray="2"
              />

              <AnimatePresence>
                {steps.map((s, index) => {
                  if (index > step) return null;

                  return (
                    <motion.g key={index}>
                      {/* The Line Segment */}

                      <motion.path
                        d={`M ${s.coords.x1} ${s.coords.y1} L ${s.coords.x2} ${s.coords.y2}`}
                        stroke={getLineColor(index)}
                        strokeWidth="3"
                        fill="none"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        transition={{ duration: 0.8, ease: 'easeInOut' }}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />

                      {/* End Point Dot */}

                      <motion.circle
                        cx={s.coords.x2}
                        cy={s.coords.y2}
                        r="3"
                        fill="#f8fafc"
                        stroke={getLineColor(index)}
                        strokeWidth="2"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.8, duration: 0.3 }}
                      />

                      {/* Entry Marker Special Case */}

                      {index === 2 && (
                        <motion.g
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 1.2 }}
                        >
                          <rect
                            x={s.coords.x2 - 12}
                            y={s.coords.y2 - 25}
                            width="24"
                            height="16"
                            rx="4"
                            fill="#3b82f6"
                          />

                          <text
                            x={s.coords.x2}
                            y={s.coords.y2 - 14}
                            textAnchor="middle"
                            fontSize="8"
                            fill="white"
                            fontWeight="bold"
                          >
                            SHORT
                          </text>

                          <line
                            x1={s.coords.x2}
                            y1={s.coords.y2 - 9}
                            x2={s.coords.x2}
                            y2={s.coords.y2 - 3}
                            stroke="#3b82f6"
                            strokeWidth="1"
                          />
                        </motion.g>
                      )}
                    </motion.g>
                  );
                })}
              </AnimatePresence>
            </svg>
          </div>

          {/* Legend */}

          <div className="flex justify-center gap-6 text-xs text-slate-400 font-medium">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-red-500"></div>Selling
            </div>

            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              Buying/Squeeze
            </div>

            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>Entry
              Trigger
            </div>
          </div>
        </div>

        {/* Right Column: Narrative & Controls */}

        <div className="p-6 lg:p-8 flex flex-col justify-between h-full bg-slate-900">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="flex-1"
            >
              {/* Time & Price Header */}

              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-blue-400 text-xs font-mono tracking-wider uppercase bg-blue-500/10 px-2 py-1 rounded">
                    {currentStepData.time}
                  </span>

                  {currentStepData.priceChange === 'drop' && (
                    <TrendingDown className="w-4 h-4 text-red-400" />
                  )}

                  {currentStepData.priceChange === 'rip' && (
                    <TrendingUp className="w-4 h-4 text-green-400" />
                  )}

                  {currentStepData.priceChange === 'fade' && (
                    <TrendingDown className="w-4 h-4 text-red-400" />
                  )}
                </div>

                <h2 className="text-3xl font-bold text-white mb-2">
                  {currentStepData.price}
                </h2>

                <p className="text-slate-300 leading-relaxed">
                  {currentStepData.action}
                </p>
              </div>

              {/* Mindsets Comparison */}

              <div className="space-y-4">
                {/* Amateur Mindset */}

                <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-4 relative overflow-hidden group hover:bg-red-500/10 transition-colors">
                  <div className="absolute top-0 left-0 w-1 h-full bg-red-500/50"></div>

                  <div className="flex items-start gap-3">
                    <XCircle className="w-5 h-5 text-red-400 mt-0.5 shrink-0" />

                    <div>
                      <span className="text-red-400 text-xs font-bold uppercase tracking-wider block mb-1">
                        The Amateur Reaction
                      </span>

                      <p className="text-slate-200 text-sm italic opacity-90">
                        "{currentStepData.amateur}"
                      </p>
                    </div>
                  </div>
                </div>

                {/* Pro Mindset */}

                <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-lg p-4 relative overflow-hidden group hover:bg-emerald-500/10 transition-colors">
                  <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500/50"></div>

                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" />

                    <div>
                      <span className="text-emerald-400 text-xs font-bold uppercase tracking-wider block mb-1">
                        The Pro Reaction
                      </span>

                      <p className="text-slate-200 text-sm font-medium">
                        {currentStepData.pro}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Controls */}

          <div className="mt-8 pt-6 border-t border-slate-800 flex items-center gap-3">
            <button
              onClick={handleBack}
              disabled={step === 0}
              className="px-4 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent transition-all flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" /> Back
            </button>

            {!isComplete ? (
              <button
                onClick={handleNext}
                className="flex-1 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-900/20"
              >
                Next Phase <Play className="w-4 h-4 fill-current" />
              </button>
            ) : (
              <button
                onClick={handleReset}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-bold py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-all"
              >
                Replay Simulation <RefreshCw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
