
import React, { useState, useEffect } from 'react';
import { SYMPTOMS, RiskLevel } from '../types';
import Checklist from './Checklist';
import Gauge from './Gauge';
import { TriangleAlert, BrainCircuit, RefreshCw } from 'lucide-react';

const CasinoModeMeter: React.FC = () => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showWarning, setShowWarning] = useState(false);
  const score = selectedIds.length;

  let riskLevel = RiskLevel.PROCESS_MODE;
  if (score >= 3 && score <= 5) riskLevel = RiskLevel.TOLERANCE_BUILDING;
  if (score >= 6) riskLevel = RiskLevel.CASINO_MODE;

  const isCritical = riskLevel === RiskLevel.CASINO_MODE;

  // Effect to trigger warning overlay when hitting critical
  useEffect(() => {
    if (isCritical) {
      // Add a slight delay for dramatic effect
      const timer = setTimeout(() => setShowWarning(true), 500);
      return () => clearTimeout(timer);
    } else {
      setShowWarning(false);
    }
  }, [isCritical]);

  const handleToggle = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const reset = () => {
    setSelectedIds([]);
    setShowWarning(false);
  };

  return (
    <div
      className={`relative max-w-2xl mx-auto bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 ${
        isCritical ? 'border-red-500/50 shadow-red-900/20 glitch-active' : ''
      }`}
    >
      {/* Header */}
      <div className="bg-slate-950 p-4 border-b border-slate-800 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <BrainCircuit
            className={`w-5 h-5 ${
              isCritical ? 'text-red-500 animate-pulse' : 'text-blue-400'
            }`}
          />
          <h2 className="text-lg font-bold font-mono tracking-tight text-white">
            CASINO MODE METER
          </h2>
        </div>
        <button
          onClick={reset}
          className="text-xs text-slate-500 hover:text-white flex items-center gap-1 transition-colors"
        >
          <RefreshCw className="w-3 h-3" /> RESET
        </button>
      </div>

      <div className="p-4 md:flex md:gap-6">
        {/* Left Column: Gauge & Status */}
        <div className="md:w-1/3 flex flex-col items-center justify-start border-b md:border-b-0 md:border-r border-slate-800 pb-6 md:pb-0 md:pr-6">
          <div className="mb-2 relative scale-90 origin-top">
            <Gauge score={score} maxScore={9} />

            <div className="text-center mt-[-10px]">
              <div
                className="text-3xl font-black font-mono mb-1 transition-colors duration-300"
                style={{
                  color: isCritical
                    ? '#ef4444'
                    : score >= 3
                    ? '#eab308'
                    : '#22c55e',
                }}
              >
                {score} / 9
              </div>
            </div>
          </div>

          <div
            className={`
            w-full p-3 rounded-lg border text-center transition-all duration-500
            ${
              riskLevel === RiskLevel.PROCESS_MODE
                ? 'bg-green-950/30 border-green-900 text-green-200'
                : ''
            }
            ${
              riskLevel === RiskLevel.TOLERANCE_BUILDING
                ? 'bg-yellow-950/30 border-yellow-900 text-yellow-200'
                : ''
            }
            ${
              riskLevel === RiskLevel.CASINO_MODE
                ? 'bg-red-950/50 border-red-600 text-red-100'
                : ''
            }
          `}
          >
            <h3 className="font-bold text-sm mb-1 uppercase tracking-wider">
              {riskLevel === RiskLevel.PROCESS_MODE && 'Process Mode'}
              {riskLevel === RiskLevel.TOLERANCE_BUILDING &&
                'Tolerance Building'}
              {riskLevel === RiskLevel.CASINO_MODE && 'CASINO MODE'}
            </h3>
            <p className="text-xs opacity-90 leading-tight">
              {riskLevel === RiskLevel.PROCESS_MODE &&
                'Healthy dopamine response.'}
              {riskLevel === RiskLevel.TOLERANCE_BUILDING &&
                'Warning: Reduce size immediately.'}
              {riskLevel === RiskLevel.CASINO_MODE &&
                'Trading now is gambling.'}
            </p>
          </div>
        </div>

        {/* Right Column: Checklist */}
        <div className="md:w-2/3 pt-6 md:pt-0">
          <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
            Diagnostic Criteria
          </h4>
          <Checklist
            symptoms={SYMPTOMS}
            selectedIds={selectedIds}
            onToggle={handleToggle}
          />
        </div>
      </div>

      {/* DETOX REQUIRED OVERLAY */}
      {showWarning && (
        <div className="absolute inset-0 bg-slate-950/95 z-50 flex flex-col items-center justify-center p-6 text-center backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-16 h-16 mb-4 rounded-full bg-red-500/10 flex items-center justify-center border-2 border-red-500 animate-bounce">
            <TriangleAlert className="w-8 h-8 text-red-500" />
          </div>

          <h1
            className="text-3xl md:text-4xl font-black text-red-500 mb-2 tracking-tighter glitch-text"
            data-text="WARNING: DETOX REQUIRED"
          >
            WARNING: DETOX REQUIRED
          </h1>

          <p className="text-base text-red-100 max-w-md mb-6 leading-relaxed">
            You have crossed into{' '}
            <span className="font-bold text-red-400">Addiction</span>. Stop
            immediately.
          </p>

          <button
            onClick={reset}
            className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded shadow-[0_0_20px_rgba(220,38,38,0.5)] transition-all transform hover:scale-105 text-sm"
          >
            ACKNOWLEDGE & RESET
          </button>
        </div>
      )}
    </div>
  );
};

export default CasinoModeMeter;
