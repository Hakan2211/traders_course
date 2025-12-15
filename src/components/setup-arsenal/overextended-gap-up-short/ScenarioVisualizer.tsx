
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Types for our data structures
type ScenarioType = 'washout' | 'fade' | 'bullTrap';

interface PhaseDescription {
  t: string;
  text: string;
}

// Data definition
const paths: Record<ScenarioType, string> = {
  fade: 'M 0 50 L 50 120 L 150 130 L 300 140', // Clean fade
  washout: 'M 0 50 L 40 80 L 80 20 L 120 40 L 300 140', // Drop, Rip (Trap), Then Fade
  bullTrap: 'M 0 50 L 80 10 L 150 10 L 180 50 L 300 140', // Gap and Go attempt, then fail
};

const descriptions: Record<ScenarioType, PhaseDescription[]> = {
  washout: [
    { t: '9:30 AM', text: 'Gap Up Open. Weak hands sell immediately.' },
    {
      t: '9:45 AM',
      text: 'THE TRAP: Violent reversal back up. Early shorts panic cover.',
    },
    {
      t: '10:30 AM',
      text: 'THE REAL MOVE: Exhaustion sets in. Entry is here, on the lower high.',
    },
  ],
  fade: [
    { t: '9:30 AM', text: 'Gap Up Open. Heavy selling immediately.' },
    { t: '9:45 AM', text: 'No bounce. Aggressive selling continues.' },
    {
      t: '10:30 AM',
      text: "Target hit early. Don't chase if you missed the open.",
    },
  ],
  bullTrap: [
    { t: '9:30 AM', text: 'Gap Up. Buyers step in pushing higher.' },
    { t: '10:00 AM', text: 'Breakout fails. Double top forms.' },
    { t: '11:00 AM', text: 'Crosses back below open. Maximum bearishness.' },
  ],
};

const ScenarioVisualizer: React.FC = () => {
  const [activeScenario, setActiveScenario] = useState<ScenarioType>('washout');
  const [progress, setProgress] = useState<number>(0); // 0, 1, or 2

  // Calculate percentage for path length and dot position
  // 0 -> 33%, 1 -> 66%, 2 -> 100%
  const pathPercentage = (progress + 1) / 3;
  const offsetDistanceString = `${pathPercentage * 100}%`;

  return (
    <div className="w-full bg-slate-900 rounded-xl border border-slate-700 overflow-hidden shadow-2xl ring-1 ring-white/10 my-8">
      {/* Header / Tabs */}
      <div className="flex flex-wrap border-b border-slate-700 bg-slate-950">
        {(['washout', 'fade', 'bullTrap'] as ScenarioType[]).map((s) => (
          <button
            key={s}
            onClick={() => {
              setActiveScenario(s);
              setProgress(0);
            }}
            className={`flex-1 py-4 px-2 text-xs sm:text-sm font-bold uppercase tracking-wider transition-all duration-200 outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-inset
              ${
                activeScenario === s
                  ? 'bg-slate-800 text-blue-400 border-b-2 border-blue-400 shadow-[inset_0_-2px_4px_rgba(0,0,0,0.3)]'
                  : 'text-slate-500 hover:text-slate-300 hover:bg-slate-900'
              }
            `}
          >
            {s.replace(/([A-Z])/g, ' $1')}
          </button>
        ))}
      </div>

      <div className="p-6 lg:p-8 grid md:grid-cols-2 gap-8 items-center">
        {/* Left: The Animated Chart */}
        <div className="relative h-64 bg-slate-800/30 rounded-lg border border-slate-700/50 p-4 shadow-inner">
          {/* Grid Lines */}
          <div className="absolute inset-0 grid grid-rows-4 gap-4 p-4 pointer-events-none opacity-20">
            <div className="border-b border-dashed border-slate-400"></div>
            <div className="border-b border-dashed border-slate-400"></div>
            <div className="border-b border-dashed border-slate-400"></div>
          </div>

          {/* Previous Close Line */}
          <div className="absolute top-[80%] left-0 right-0 border-t border-dashed border-slate-500/50 flex items-center">
            <span className="text-[10px] text-slate-500 font-mono absolute -top-4 right-2 bg-slate-900/80 px-1 rounded">
              Prev Close
            </span>
          </div>

          {/* Time Labels */}
          <div className="absolute bottom-1 left-4 text-[10px] text-slate-500 font-mono">
            9:30
          </div>
          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[10px] text-slate-500 font-mono">
            10:00
          </div>
          <div className="absolute bottom-1 right-4 text-[10px] text-slate-500 font-mono">
            11:00
          </div>

          <svg viewBox="0 0 300 150" className="w-full h-full overflow-visible">
            <defs>
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="2" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* The Path */}
            <motion.path
              key={activeScenario} // Re-mount on scenario change to reset animation cleanly
              d={paths[activeScenario]}
              fill="none"
              stroke={activeScenario === 'bullTrap' ? '#fbbf24' : '#60a5fa'} // Amber-400 or Blue-400
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0, opacity: 0.5 }}
              animate={{ pathLength: pathPercentage, opacity: 1 }}
              transition={{ duration: 1.2, ease: 'easeInOut' }}
              filter="url(#glow)"
            />

            {/* The Animated Dot */}
            {/* 
                We use style={{ offsetPath }} to make the circle follow the path.
                Tailwind doesn't support offset-path natively, so we pass it in style.
              */}
            <motion.circle
              r="6"
              fill="#fff"
              stroke={activeScenario === 'bullTrap' ? '#d97706' : '#2563eb'}
              strokeWidth="2"
              style={{ offsetPath: `path("${paths[activeScenario]}")` } as any}
              initial={{ offsetDistance: '0%' }}
              animate={{ offsetDistance: offsetDistanceString }}
              transition={{ duration: 1.2, ease: 'easeInOut' }}
            />
          </svg>
        </div>

        {/* Right: The Narrative Control */}
        <div className="flex flex-col h-full justify-between">
          <div className="mb-6 min-h-[140px]">
            <div className="flex items-center gap-3 mb-3">
              <span className="bg-slate-700 text-slate-300 text-xs font-mono py-1 px-2 rounded">
                Phase {progress + 1}/3
              </span>
              <h3 className="text-xl font-bold text-white">
                {descriptions[activeScenario][progress].t}
              </h3>
            </div>

            <AnimatePresence mode="wait">
              <motion.p
                key={`${activeScenario}-${progress}`}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.3 }}
                className="text-slate-300 text-lg leading-relaxed font-light"
              >
                {descriptions[activeScenario][progress].text}
              </motion.p>
            </AnimatePresence>
          </div>

          <div className="space-y-6">
            <div className="flex gap-3">
              <button
                onClick={() => setProgress(Math.max(0, progress - 1))}
                disabled={progress === 0}
                className="px-6 py-3 rounded-lg border border-slate-600 text-slate-400 hover:text-white hover:border-slate-400 hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-all font-medium"
              >
                Back
              </button>
              <button
                onClick={() => setProgress(Math.min(2, progress + 1))}
                disabled={progress === 2}
                className={`flex-1 py-3 rounded-lg text-white font-bold shadow-lg transition-all transform active:scale-95 flex items-center justify-center gap-2
                    ${
                      progress === 2
                        ? 'bg-green-600 cursor-default opacity-80'
                        : 'bg-blue-600 hover:bg-blue-500 hover:shadow-blue-500/25'
                    }
                `}
              >
                {progress === 2 ? (
                  <span className="flex items-center gap-2">
                    Pattern Complete
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </span>
                ) : (
                  'Next Phase ->'
                )}
              </button>
            </div>

            {/* Context Alerts using AnimatePresence for smooth entry/exit */}
            <div className="min-h-[60px]">
              <AnimatePresence>
                {activeScenario === 'washout' && progress === 1 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="p-3 bg-red-900/30 border border-red-500/50 rounded-lg text-red-200 text-sm flex items-start gap-3 shadow-sm"
                  >
                    <div className="mt-0.5 min-w-[16px]">
                      <svg
                        className="w-4 h-4 text-red-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                      </svg>
                    </div>
                    <span>
                      <strong>TRAP ZONE:</strong> This is where 90% of shorts
                      get squeezed. The violent reversal clears out early
                      entries. Wait for the lower high.
                    </span>
                  </motion.div>
                )}

                {activeScenario === 'bullTrap' && progress === 1 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="p-3 bg-amber-900/30 border border-amber-500/50 rounded-lg text-amber-200 text-sm flex items-start gap-3 shadow-sm"
                  >
                    <div className="mt-0.5 min-w-[16px]">
                      <svg
                        className="w-4 h-4 text-amber-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                      </svg>
                    </div>
                    <span>
                      <strong>FOMO WARNING:</strong> Breaking highs often lures
                      in breakout buyers. If it fails here, the reversal will be
                      swift.
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScenarioVisualizer;
