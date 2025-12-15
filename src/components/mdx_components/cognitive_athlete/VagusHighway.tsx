
import React, { useState, useRef } from 'react';
import { CrashState } from './types';
import { Play, RotateCcw } from 'lucide-react';

const VagusHighway: React.FC = () => {
  const [status, setStatus] = useState<CrashState>(CrashState.NORMAL);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const triggerCrash = () => {
    if (status !== CrashState.NORMAL) return;

    // Sequence
    setStatus(CrashState.GUT_SHOCK);

    // 1. Gut gets hit (Red)
    // 2. Delay, then pulse travels up
    setTimeout(() => {
      setStatus(CrashState.TRANSMITTING);
    }, 1000);

    // 3. Pulse arrival (animation takes 1.5s defined in CSS)
    setTimeout(() => {
      setStatus(CrashState.BRAIN_SHOCK);
    }, 2500); // 1000ms delay + 1500ms travel
  };

  const reset = () => {
    setStatus(CrashState.NORMAL);
  };

  // Helper to generate particle elements
  const renderParticles = (count: number, direction: 'up' | 'down') => {
    return Array.from({ length: count }).map((_, i) => (
      <circle
        key={`${direction}-${i}`}
        cx="100"
        cy={direction === 'up' ? '350' : '50'}
        r={direction === 'up' ? 3 : 2}
        className={
          direction === 'up' ? 'vagus-particle-up' : 'vagus-particle-down'
        }
        fill={direction === 'up' ? '#fbbf24' : '#60a5fa'} // Gold for afferent, Blue for efferent
        style={{
          animationDelay: `${Math.random() * (direction === 'up' ? 1.5 : 4)}s`,
          opacity: 0.8,
        }}
      />
    ));
  };

  return (
    <div className="w-full bg-gradient-to-br from-gray-950/90 via-gray-900/85 to-black/90 border border-gray-700/50 shadow-[0_10px_40px_rgba(0,0,0,0.6)] rounded-2xl backdrop-blur-2xl p-6 my-8 flex flex-col items-center relative overflow-hidden">
      <style>{`
        @keyframes vagusMoveUp {
          0% {
            transform: translateY(0);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(-300px);
            opacity: 0;
          }
        }
        @keyframes vagusMoveDown {
          0% {
            transform: translateY(0);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(300px);
            opacity: 0;
          }
        }
        @keyframes vagusPulseShock {
          0% {
            transform: translateY(0);
            opacity: 1;
            r: 8px;
          }
          50% {
            r: 12px;
          }
          100% {
            transform: translateY(-300px);
            opacity: 1;
            r: 8px;
          }
        }
        .vagus-particle-up {
          animation: vagusMoveUp 2s linear infinite;
        }
        .vagus-particle-down {
          animation: vagusMoveDown 4s linear infinite;
        }
        .pulse-shock {
          animation: vagusPulseShock 1.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
      `}</style>

      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-500/20 to-transparent"></div>

      <div className="flex justify-between w-full items-start mb-4 z-10 relative">
        <div>
          <h3 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
            The Vagus Highway
            <span className="text-xs font-normal text-zinc-500 border border-zinc-700 rounded px-2 py-0.5">
              Interactive
            </span>
          </h3>
          <p className="text-zinc-400 text-sm max-w-md mt-1">
            Visualizing the 80/20 traffic flow. See how the body detects danger
            before the brain.
          </p>
        </div>

        <div className="flex gap-2">
          {status === CrashState.NORMAL ? (
            <button
              onClick={triggerCrash}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg font-semibold shadow-lg shadow-red-900/20 transition-all active:scale-95"
            >
              <Play size={16} fill="currentColor" />
              Trigger Market Crash
            </button>
          ) : (
            <button
              onClick={reset}
              className="flex items-center gap-2 bg-zinc-700 hover:bg-zinc-600 text-white px-4 py-2 rounded-lg font-semibold transition-all"
            >
              <RotateCcw size={16} />
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Diagram Container */}
      <div className="relative w-[300px] h-[400px]">
        {/* Connection Labels */}
        <div className="absolute top-1/2 -right-12 transform -translate-y-1/2 text-xs text-right space-y-8">
          <div className="text-blue-400">
            <span className="font-bold block">Efferent (20%)</span>
            <span className="opacity-70">Brain → Body</span>
          </div>
          <div className="text-yellow-400">
            <span className="font-bold block">Afferent (80%)</span>
            <span className="opacity-70">Body → Brain</span>
          </div>
        </div>

        <svg viewBox="0 0 200 400" className="w-full h-full drop-shadow-lg">
          {/* Vagus Nerve Path */}
          <path
            d="M 100 50 C 100 150, 100 250, 100 350"
            fill="none"
            stroke="#27272a"
            strokeWidth="40"
            strokeLinecap="round"
          />
          <path
            d="M 100 50 C 100 150, 100 250, 100 350"
            fill="none"
            stroke="#3f3f46"
            strokeWidth="2"
            strokeDasharray="4 4"
            className="opacity-30"
          />

          {/* Particles */}
          <g>
            {renderParticles(20, 'up')} {/* Dense Upstream */}
            {renderParticles(5, 'down')} {/* Sparse Downstream */}
          </g>

          {/* Crash Pulse - Only visible during transmission */}
          {status === CrashState.TRANSMITTING && (
            <circle
              cx="100"
              cy="350"
              r="8"
              fill="#ef4444"
              className="pulse-shock shadow-red-500"
              stroke="white"
              strokeWidth="2"
            />
          )}

          {/* Brain Node (Top) */}
          <g transform="translate(100, 50)">
            <circle
              r="40"
              className={`transition-colors duration-500 ${
                status === CrashState.BRAIN_SHOCK
                  ? 'fill-red-600'
                  : 'fill-zinc-800'
              }`}
              stroke={status === CrashState.BRAIN_SHOCK ? '#fca5a5' : '#52525b'}
              strokeWidth="3"
            />
            <text
              textAnchor="middle"
              dy="5"
              className="fill-white font-bold text-xs pointer-events-none"
            >
              BRAIN
            </text>
            {status === CrashState.BRAIN_SHOCK && (
              <text
                textAnchor="middle"
                dy="-50"
                className="fill-red-400 font-bold text-sm animate-bounce"
              >
                PANIC!
              </text>
            )}
          </g>

          {/* Gut Node (Bottom) */}
          <g transform="translate(100, 350)">
            <path
              d="M -35 -20 Q 0 -40 35 -20 Q 45 10 30 30 Q 0 45 -30 30 Q -45 10 -35 -20 Z"
              className={`transition-colors duration-300 ${
                status !== CrashState.NORMAL ? 'fill-red-600' : 'fill-zinc-800'
              }`}
              stroke={status !== CrashState.NORMAL ? '#fca5a5' : '#52525b'}
              strokeWidth="3"
            />
            <text
              textAnchor="middle"
              dy="5"
              className="fill-white font-bold text-xs pointer-events-none"
            >
              GUT
            </text>
            {status !== CrashState.NORMAL && (
              <text
                textAnchor="middle"
                dy="50"
                dx="0"
                className="fill-red-400 font-bold text-sm animate-pulse"
              >
                THREAT DETECTED
              </text>
            )}
          </g>
        </svg>
      </div>

      {/* Status Bar */}
      <div className="w-full bg-zinc-950 p-4 rounded-lg border border-zinc-800 mt-4 h-24 flex items-center justify-center text-center">
        {status === CrashState.NORMAL && (
          <p className="text-zinc-500 text-sm">
            System Normal. Traffic flowing primarily from Gut to Brain.
          </p>
        )}
        {status === CrashState.GUT_SHOCK && (
          <p className="text-red-400 font-bold animate-pulse">
            ⚠ CRASH EVENT! <br />
            <span className="text-zinc-400 font-normal text-sm">
              Vessels constrict. Digestion stops. Gut neurons fire massive
              warning.
            </span>
          </p>
        )}
        {status === CrashState.TRANSMITTING && (
          <p className="text-yellow-400 font-bold">
            SIGNAL TRAVELING... <br />
            <span className="text-zinc-400 font-normal text-sm">
              Moving up the Vagus Nerve to the Insula (15-30s latency in
              reality, sped up here).
            </span>
          </p>
        )}
        {status === CrashState.BRAIN_SHOCK && (
          <p className="text-red-500 font-bold">
            BRAIN ALERTED <br />
            <span className="text-zinc-400 font-normal text-sm">
              "Why do I feel sick?" Conscious mind finally realizes something is
              wrong.
            </span>
          </p>
        )}
      </div>
    </div>
  );
};

export default VagusHighway;
