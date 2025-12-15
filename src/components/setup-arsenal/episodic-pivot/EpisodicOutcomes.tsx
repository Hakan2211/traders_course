
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, AlertTriangle, Activity, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

type ScenarioType = 'fade' | 'grind' | 'consolidation';

interface ScenarioData {
  id: ScenarioType;
  title: string;
  subtitle: string;
  desc: string;
  path: string;
  color: string;
  icon: React.ReactNode;
  bgGradient: string;
}

const EpisodicOutcomes: React.FC = () => {
  const [activeScenario, setActiveScenario] = useState<ScenarioType>('grind');

  // SVG Coordinate System: 400 width, 300 height
  // X=50 is roughly the Catalyst Day
  // Y values: Lower is Higher Price (0 is top)
  const scenarios: Record<ScenarioType, ScenarioData> = {
    fade: {
      id: 'fade',
      title: 'The Fakeout',
      subtitle: 'Probability: ~60%',
      desc: 'The most common outcome. Price breaks above the catalyst high briefly but fails to hold, rolling over and breaking the catalyst low. Volume dries up on bounces.',
      // Starts low (250), jumps to 100 (catalyst), pushes a bit higher (80), then rolls over down to 280
      path: 'M 10 250 L 50 250 L 50 100 L 80 80 L 110 90 L 140 150 L 180 200 L 250 240 L 320 260 L 380 270',
      color: '#ef4444', // red-500
      icon: <AlertTriangle className="w-4 h-4" />,
      bgGradient: 'from-red-900/20 to-transparent',
    },
    grind: {
      id: 'grind',
      title: 'The Grind',
      subtitle: 'Probability: ~20%',
      desc: 'The Holy Grail setup. After the catalyst, price forms a staircase pattern of higher highs and higher lows. Pullbacks are shallow and bought by institutions.',
      // Starts low (250), jumps to 100 (catalyst), dips to 120, up to 80, dips to 100, up to 50, dips to 70, up to 20
      path: 'M 10 250 L 50 250 L 50 100 L 90 120 L 130 80 L 170 100 L 220 50 L 260 70 L 320 20 L 380 10',
      color: '#4ade80', // green-400
      icon: <TrendingUp className="w-4 h-4" />,
      bgGradient: 'from-green-900/20 to-transparent',
    },
    consolidation: {
      id: 'consolidation',
      title: 'Consolidation',
      subtitle: 'Probability: ~20%',
      desc: 'Indecision phase. The market digests the news. Price moves sideways within a defined range. Wait for a breakout box to form before entering.',
      // Starts low (250), jumps to 100 (catalyst), moves sideways between 90 and 130
      path: 'M 10 250 L 50 250 L 50 100 L 80 110 L 120 95 L 160 115 L 200 100 L 240 110 L 280 95 L 320 105 L 380 100',
      color: '#fbbf24', // amber-400
      icon: <Activity className="w-4 h-4" />,
      bgGradient: 'from-amber-900/20 to-transparent',
    },
  };

  const current = scenarios[activeScenario];

  return (
    <div className="w-full h-[900px] p-6 text-gray-100 flex flex-col">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-300">
            Episodic Pivot Outcomes
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            Select a scenario to visualize the post-catalyst price action.
          </p>
        </div>

        {/* Scenario Tabs */}
        <div className="flex p-1 bg-gray-800/50 rounded-lg border border-gray-700 backdrop-blur-sm">
          {Object.values(scenarios).map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveScenario(s.id)}
              className={cn(
                'px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center gap-2',
                activeScenario === s.id
                  ? 'bg-gray-700 text-white shadow-lg ring-1 ring-gray-600'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700/50'
              )}
            >
              {s.icon}
              <span className="hidden sm:inline">{s.title}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 relative bg-gray-900/50 rounded-xl border border-gray-800 overflow-hidden shadow-inner flex flex-col">
        {/* Dynamic Background Gradient */}
        <motion.div
          className={cn(
            'absolute inset-0 bg-gradient-to-b opacity-30 pointer-events-none',
            current.bgGradient
          )}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          transition={{ duration: 1 }}
        />

        {/* Chart Visualization Area */}
        <div className="relative flex-grow min-h-[300px] w-full p-4">
          {/* Overlay Info Box */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeScenario}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="absolute bottom-6 right-6 z-20 max-w-xs bg-gray-950/90 border border-gray-700/80 p-4 rounded-lg shadow-xl backdrop-blur-md"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 rounded bg-gray-800 text-gray-300">
                  {current.icon}
                </div>
                <div>
                  <h3 className="font-bold text-gray-100 leading-tight">
                    {current.title}
                  </h3>
                  <span className="text-xs font-mono text-gray-400">
                    {current.subtitle}
                  </span>
                </div>
              </div>
              <div className="h-px w-full bg-gray-800 my-2" />
              <p className="text-sm text-gray-300 leading-relaxed">
                {current.desc}
              </p>
            </motion.div>
          </AnimatePresence>

          <svg
            className="w-full h-full"
            viewBox="0 0 400 300"
            preserveAspectRatio="none"
          >
            {/* Grid Lines */}
            <defs>
              <pattern
                id="grid"
                width="40"
                height="40"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 40 0 L 0 0 0 40"
                  fill="none"
                  stroke="rgba(255,255,255,0.05)"
                  strokeWidth="1"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />

            {/* Catalyst Event Marker */}
            <g>
              <motion.rect
                initial={{ scaleY: 0, opacity: 0 }}
                animate={{ scaleY: 1, opacity: 0.8 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                x="45"
                y="100"
                width="10"
                height="150"
                fill="#22c55e"
                rx="2"
                className="drop-shadow-[0_0_8px_rgba(34,197,94,0.5)]"
              />
              <text
                x="50"
                y="280"
                textAnchor="middle"
                fill="#22c55e"
                fontSize="10"
                fontWeight="bold"
                letterSpacing="1"
              >
                CATALYST
              </text>
              <line
                x1="50"
                y1="260"
                x2="50"
                y2="100"
                stroke="#22c55e"
                strokeWidth="1"
                strokeDasharray="2 2"
                opacity="0.5"
              />
            </g>

            {/* Price Path Animation */}
            <motion.path
              key={`path-${activeScenario}`}
              d={current.path}
              fill="none"
              stroke={current.color}
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 2, ease: 'easeInOut' }}
              className="drop-shadow-md"
            />

            {/* Pulsing End Point */}
            <motion.circle
              key={`dot-${activeScenario}`}
              cx={current.path.split(' ').slice(-2)[0]} // Rough extraction of last X
              cy={current.path.split(' ').slice(-1)[0]} // Rough extraction of last Y
              r="4"
              fill={current.color}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 1.8, duration: 0.3 }}
            >
              <animate
                attributeName="r"
                values="4;6;4"
                dur="2s"
                repeatCount="indefinite"
              />
              <animate
                attributeName="opacity"
                values="1;0.5;1"
                dur="2s"
                repeatCount="indefinite"
              />
            </motion.circle>
          </svg>
        </div>
      </div>

      <div className="mt-4 flex items-start gap-2 text-xs text-gray-500 bg-gray-900/30 p-3 rounded border border-gray-800">
        <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
        <p>
          The green bar represents the "Catalyst Day" where volume spikes 5x-20x
          normal. Do not enter on this day. The trend reveals itself in days
          3-10 following the event.
        </p>
      </div>
    </div>
  );
};

export default EpisodicOutcomes;
