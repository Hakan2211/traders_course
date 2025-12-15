
import React from 'react';
import { SetupData, RiskLevel } from './types';
import { motion, AnimatePresence } from 'framer-motion';

interface OverlayProps {
  selectedSetup: SetupData | null;
  onClose: () => void;
}

export const Overlay: React.FC<OverlayProps> = ({ selectedSetup, onClose }) => {
  const getRiskColor = (risk: RiskLevel) => {
    switch (risk) {
      case RiskLevel.LOW:
        return 'text-green-400 border-green-400/30';
      case RiskLevel.MEDIUM:
        return 'text-yellow-400 border-yellow-400/30';
      case RiskLevel.HIGH:
        return 'text-red-400 border-red-400/30';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6 z-10">
      {/* Header */}
      <div className="pointer-events-auto">
        <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400 tracking-tighter uppercase">
          Setup Arsenal{' '}
          <span className="text-white/20 text-xl font-normal">| Module 4</span>
        </h1>
        <p className="text-slate-400 mt-2 max-w-md text-sm font-mono">
          Navigate the 3D Matrix. <br />
          <span className="text-blue-400">X-Axis:</span> Timing |
          <span className="text-green-400"> Y-Axis:</span> Type |
          <span className="text-red-400"> Z-Axis:</span> Risk
        </p>
      </div>

      {/* Selected Card */}
      <AnimatePresence>
        {selectedSetup && (
          <motion.div
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 300, opacity: 0 }}
            className="absolute right-0 top-0 bottom-0 w-96 bg-slate-900/90 backdrop-blur-xl border-l border-slate-700 pointer-events-auto shadow-2xl overflow-y-auto"
          >
            <div className="p-8 h-full flex flex-col">
              <button
                onClick={onClose}
                className="self-end mb-6 text-slate-400 hover:text-white transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>

              <div className="flex items-center gap-2 mb-2">
                <span
                  className="inline-block w-3 h-3 rounded-full shadow-[0_0_10px_currentColor]"
                  style={{
                    color: selectedSetup.color,
                    backgroundColor: selectedSetup.color,
                  }}
                />
                <span className="text-xs uppercase tracking-widest text-slate-400">
                  {selectedSetup.type}
                </span>
              </div>

              <h2 className="text-3xl font-bold text-white mb-4 leading-tight">
                {selectedSetup.name}
              </h2>

              <div
                className={`inline-flex items-center px-3 py-1 rounded-full border text-xs font-bold mb-6 w-fit ${getRiskColor(
                  selectedSetup.risk
                )}`}
              >
                {selectedSetup.risk}
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-slate-500 text-xs uppercase tracking-wider mb-2 font-bold">
                    Concept
                  </h3>
                  <p className="text-slate-200 leading-relaxed border-l-2 border-blue-500 pl-4">
                    {selectedSetup.description}
                  </p>
                </div>

                <div>
                  <h3 className="text-slate-500 text-xs uppercase tracking-wider mb-2 font-bold">
                    Timing Window
                  </h3>
                  <div className="bg-slate-800/50 p-3 rounded border border-slate-700 font-mono text-sm text-blue-300">
                    {selectedSetup.timeFrame}
                  </div>
                </div>

                {/* <div className="mt-auto pt-6 border-t border-slate-800">
                  <button className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded transition-colors uppercase tracking-wider text-sm">
                    View Full Lesson
                  </button>
                </div> */}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Legend Footer */}
      <div className="pointer-events-auto flex gap-4 text-xs font-mono text-slate-500 mb-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-yellow-400 rounded-full"></span> Breakout
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-blue-500 rounded-full"></span> Momentum
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-red-500 rounded-full"></span> Reversal
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-green-500 rounded-full"></span> Structure
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-purple-500 rounded-full"></span> Event
        </div>
      </div>
    </div>
  );
};
