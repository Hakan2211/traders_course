
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Zap, Brain, CheckCircle2, Lock } from 'lucide-react';

const PHASE_1_LIMIT = 10;
const PHASE_2_LIMIT = 50;

export const HebbianClicker: React.FC = () => {
  const [clicks, setClicks] = useState(0);
  const [lastClickTime, setLastClickTime] = useState(0);
  const [decayAmount, setDecayAmount] = useState(0);
  const canvasRef = useRef<HTMLDivElement>(null);

  const isPhase1 = clicks < PHASE_1_LIMIT;
  const isPhase2 = clicks >= PHASE_1_LIMIT && clicks < PHASE_2_LIMIT;
  const isComplete = clicks >= PHASE_2_LIMIT;

  const triggerSpark = useCallback(() => {
    if (!canvasRef.current) return;

    const spark = document.createElement('div');
    spark.classList.add(
      'absolute',
      'w-2',
      'h-2',
      'bg-yellow-400',
      'rounded-full',
      'pointer-events-none'
    );

    const randomY = Math.random() * 20 - 10;
    spark.style.left = '10%';
    spark.style.top = `calc(50% + ${randomY}px)`;

    const animation = spark.animate(
      [
        { left: '10%', opacity: 1 },
        { left: '90%', opacity: 0 },
      ],
      {
        duration: isPhase1 ? 300 : 500,
        easing: 'ease-out',
      }
    );

    canvasRef.current.appendChild(spark);
    animation.addEventListener('finish', () => {
      spark.remove();
    });
  }, [isPhase1]);

  const handleClick = useCallback(() => {
    if (isComplete) return;

    setClicks((prev) => prev + 1);
    setLastClickTime(Date.now());
    triggerSpark();
  }, [isComplete, triggerSpark]);

  const handleReset = useCallback(() => {
    setClicks(0);
    setDecayAmount(0);
    setLastClickTime(0);
  }, []);

  useEffect(() => {
    if (isComplete || clicks === 0) return;

    const interval = setInterval(() => {
      const timeSinceLastClick = Date.now() - lastClickTime;

      if (isPhase2 && timeSinceLastClick > 500) {
        setDecayAmount((prev) => Math.min(prev + 0.05, 0.8));
      } else {
        setDecayAmount(0);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [clicks, isComplete, isPhase2, lastClickTime]);

  const getWireOpacity = () => {
    if (isComplete) return 1;
    if (isPhase1) return 0.1;

    const progressInPhase2 =
      (clicks - PHASE_1_LIMIT) / (PHASE_2_LIMIT - PHASE_1_LIMIT);
    const baseOpacity = 0.4 + progressInPhase2 * 0.6;
    return Math.max(0.2, baseOpacity - decayAmount);
  };

  const getMyelinOpacity = () => (isComplete ? 1 : 0);

  return (
    <div className="w-full max-w-2xl mx-auto my-12 bg-slate-900 border border-slate-700 rounded-xl overflow-hidden shadow-2xl">
      <div className="bg-slate-800 p-4 border-b border-slate-700 flex justify-between items-center">
        <div>
          <h3 className="text-yellow-400 font-bold text-lg flex items-center gap-2">
            <Brain className="w-5 h-5" />
            The Hebbian Clicker
          </h3>
          <p className="text-slate-400 text-xs mt-1">
            &quot;Neurons that fire together, wire together.&quot;
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-mono font-bold text-slate-200">
            {clicks}{' '}
            <span className="text-sm text-slate-500 font-normal">reps</span>
          </div>
        </div>
      </div>

      <div
        className="relative h-64 bg-slate-950 flex items-center justify-center overflow-hidden select-none"
        ref={canvasRef}
      >
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'radial-gradient(#475569 1px, transparent 1px)',
            backgroundSize: '20px 20px',
          }}
        />

        <div className="absolute left-8 z-20 flex flex-col items-center">
          <div
            className={`w-16 h-16 rounded-full border-4 flex items-center justify-center transition-all duration-200 ${
              clicks > 0
                ? 'border-yellow-500 bg-yellow-900/20 shadow-[0_0_20px_rgba(234,179,8,0.3)]'
                : 'border-slate-600 bg-slate-800'
            }`}
          >
            <Zap
              className={`w-8 h-8 ${
                clicks > 0
                  ? 'text-yellow-400 fill-yellow-400'
                  : 'text-slate-600'
              }`}
            />
          </div>
          <span className="mt-2 text-xs font-mono text-slate-500">
            Stimulus
          </span>
        </div>

        <div className="absolute right-8 z-20 flex flex-col items-center">
          <div
            className={`w-16 h-16 rounded-full border-4 flex items-center justify-center transition-all duration-500 ${
              clicks >= PHASE_1_LIMIT
                ? 'border-blue-500 bg-blue-900/20 shadow-[0_0_20px_rgba(59,130,246,0.3)]'
                : 'border-slate-600 bg-slate-800'
            }`}
          >
            {isComplete ? (
              <Lock className="w-6 h-6 text-emerald-400" />
            ) : (
              <div
                className={`w-8 h-8 rounded-full ${
                  clicks >= PHASE_1_LIMIT ? 'bg-blue-500/50' : 'bg-slate-700'
                }`}
              />
            )}
          </div>
          <span className="mt-2 text-xs font-mono text-slate-500">Action</span>
        </div>

        <div className="absolute left-24 right-24 h-4 flex items-center">
          <div
            className="h-1 bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)] transition-all duration-300 ease-out w-full"
            style={{
              opacity: getWireOpacity(),
              transform: `scaleY(${isComplete ? 3 : 1})`,
            }}
          />

          <div
            className="absolute inset-0 flex justify-between items-center px-4"
            style={{
              opacity: getMyelinOpacity(),
              transition: 'opacity 1s ease-in',
            }}
          >
            {[1, 2, 3, 4, 5, 6].map((segment) => (
              <div
                key={segment}
                className="h-3 w-8 bg-yellow-200 rounded-sm shadow-lg animate-pulse"
              />
            ))}
          </div>
        </div>

        <div className="absolute bottom-4 left-0 right-0 text-center pointer-events-none">
          {clicks === 0 && (
            <span className="text-slate-400 text-sm animate-bounce">
              Tap &apos;Fire&apos; rapidly to build the connection
            </span>
          )}

          {isPhase1 && clicks > 0 && (
            <span className="text-yellow-600 text-sm font-bold">
              Sparks flying... connection weak...
            </span>
          )}

          {isPhase2 && (
            <div className="flex flex-col items-center gap-1">
              <span
                className={`text-blue-400 text-sm font-bold ${
                  decayAmount > 0 ? 'opacity-50' : 'opacity-100'
                }`}
              >
                Wiring together... keep going!
              </span>
              {decayAmount > 0 && (
                <span className="text-red-400 text-xs">
                  Signal decaying... reinforce it!
                </span>
              )}
            </div>
          )}

          {isComplete && (
            <div className="bg-emerald-900/80 px-4 py-2 rounded-full inline-flex items-center gap-2 border border-emerald-500/50 backdrop-blur-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-200 text-sm font-bold">
                Permanent Pathway Built!
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="p-6 bg-slate-900 flex flex-col items-center justify-center gap-4">
        <div className="w-full flex flex-col gap-3 sm:flex-row">
          <button
            onClick={handleClick}
            disabled={isComplete}
            className={`relative group flex-1 py-4 rounded-xl text-xl font-black uppercase tracking-widest transition-all duration-75 ${
              isComplete
                ? 'bg-emerald-600 text-emerald-950 cursor-default'
                : 'bg-yellow-500 hover:bg-yellow-400 active:bg-yellow-600 text-yellow-950 active:scale-95 shadow-[0_0_30px_rgba(234,179,8,0.4)] hover:shadow-[0_0_50px_rgba(234,179,8,0.6)]'
            }`}
          >
            {isComplete ? 'Connection Myelinated' : 'Fire Neurons!'}
            {!isComplete && (
              <div className="absolute inset-0 rounded-xl ring-2 ring-white/20 group-hover:ring-white/40" />
            )}
          </button>

          <button
            onClick={handleReset}
            disabled={clicks === 0}
            className="px-6 py-4 rounded-xl text-sm font-semibold tracking-wide uppercase border border-slate-600 text-slate-200 hover:border-slate-400 hover:text-white transition disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Reset Pathway
          </button>
        </div>

        <p className="text-xs text-slate-500 text-center max-w-md">
          {isPhase1 && '1-10 Reps: Short-term memory. Fades instantly.'}
          {isPhase2 &&
            '10-50 Reps: Structural remodeling. Requires maintenance or it decays.'}
          {isComplete &&
            '50+ Reps: Myelination. High-speed, automatic superhighway established.'}
        </p>
      </div>
    </div>
  );
};

export default HebbianClicker;
