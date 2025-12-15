
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import EnvironmentWrapper from '@/components/mdx_components/2d_environment/environmentWrapper';
import {
  Play,
  RotateCcw,
  Zap,
  TrendingUp,
  Volume2,
  AlertCircle,
} from 'lucide-react';

// --- Types ---
interface CandleData {
  day: number;
  label: string;
  open: number;
  close: number;
  high: number;
  low: number;
  volume: number; // Scale 0-100
  isGreen: boolean;
  annotation?: string;
}

// --- Constants ---
const STAGES = {
  INITIAL: 0,
  DAY_1: 1,
  CONSOLIDATION: 2,
  TRIGGER_READY: 3,
  SQUEEZE: 4,
};

const DATA: CandleData[] = [
  {
    day: 1,
    label: 'Day 1',
    open: 80,
    close: 55,
    high: 85,
    low: 50,
    volume: 100,
    isGreen: false,
    annotation: 'Shorts Enter w/ Size',
  },
  {
    day: 2,
    label: 'Day 2',
    open: 55,
    close: 58,
    high: 60,
    low: 53,
    volume: 5,
    isGreen: true,
    annotation: 'Volume Collapse',
  },
  {
    day: 3,
    label: 'Day 3',
    open: 58,
    close: 56,
    high: 59,
    low: 55,
    volume: 2,
    isGreen: false,
  },
  {
    day: 4,
    label: 'Day 4',
    open: 56,
    close: 90,
    high: 95,
    low: 55,
    volume: 75,
    isGreen: true,
    annotation: 'The Squeeze',
  },
];

const ChartGrid = () => (
  <g className="opacity-20">
    {[0, 1, 2, 3, 4].map((i) => (
      <line
        key={i}
        x1="0"
        y1={i * 75}
        x2="100%"
        y2={i * 75}
        stroke="currentColor"
        strokeDasharray="4 4"
      />
    ))}
  </g>
);

const LiquidityPlayChart: React.FC = () => {
  const [stage, setStage] = useState(STAGES.INITIAL);
  const [showIntraday, setShowIntraday] = useState(false);

  // Reset logic
  const handleReset = () => {
    setStage(STAGES.INITIAL);
    setShowIntraday(false);
  };

  // Progression logic
  const handleNext = () => {
    if (stage < STAGES.TRIGGER_READY) {
      setStage((prev) => prev + 1);
    }
  };

  const handleSqueeze = () => {
    setStage(STAGES.SQUEEZE);
    setTimeout(() => setShowIntraday(true), 1500); // Auto show intraday after squeeze visual
  };

  return (
    <div className="w-full">
      <EnvironmentWrapper height="900px" className="flex flex-col">
        {/* --- Top UI: Status Bar --- */}
        <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-start z-10 pointer-events-none">
          <div>
            <h2 className="text-white text-xl font-bold tracking-tight">
              Anatomy of the Setup
            </h2>
            <div className="flex items-center space-x-2 mt-1">
              <span
                className={`h-2 w-2 rounded-full ${
                  stage === STAGES.INITIAL ? 'bg-slate-500' : 'bg-green-500'
                }`}
              />
              <p className="text-slate-400 text-sm">
                {stage === STAGES.INITIAL && 'Waiting to start...'}
                {stage === STAGES.DAY_1 && 'Phase 1: High Volume Injection'}
                {stage === STAGES.CONSOLIDATION && 'Phase 2: Liquidity Trap'}
                {stage >= STAGES.TRIGGER_READY && 'Phase 3: The Squeeze'}
              </p>
            </div>
          </div>

          {/* Volume Metric Display */}
          <div className="bg-slate-900/80 backdrop-blur-md border border-slate-700 p-3 rounded-lg text-right min-w-[140px]">
            <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">
              Current Volume
            </p>
            <AnimatePresence mode="wait">
              <motion.div
                key={stage}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-2xl font-mono text-white font-bold"
              >
                {stage === STAGES.INITIAL
                  ? '---'
                  : stage === STAGES.DAY_1
                  ? '52.4M'
                  : stage === STAGES.CONSOLIDATION
                  ? '480K'
                  : stage === STAGES.TRIGGER_READY
                  ? '300K'
                  : '25.2M'}
              </motion.div>
            </AnimatePresence>
            <p className="text-[10px] text-slate-400">
              {stage === STAGES.CONSOLIDATION && (
                <span className="text-red-400 font-bold">-99.1% Drop</span>
              )}
              {stage === STAGES.SQUEEZE && (
                <span className="text-green-400 font-bold">+5000% Surge</span>
              )}
            </p>
          </div>
        </div>

        {/* --- Main Chart Area (SVG) --- */}
        <div className="relative w-full h-full p-8 md:p-16 flex items-center justify-center">
          {/* Conditional Rendering: Main Daily View vs Intraday Zoom */}
          {!showIntraday ? (
            <svg
              viewBox="0 0 400 300"
              className="w-full h-full overflow-visible"
            >
              {/* Grid */}
              <ChartGrid />

              {/* Render Candles based on Stage */}
              {stage >= STAGES.DAY_1 && (
                <Candle
                  data={DATA[0]}
                  index={0}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  initial={{ opacity: 0, y: 50, scale: 0.9 }}
                  showLabel={true}
                />
              )}

              {stage >= STAGES.CONSOLIDATION && (
                <>
                  <Candle
                    data={DATA[1]}
                    index={1}
                    delay={0.2}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    showLabel={false}
                  />
                  <Candle
                    data={DATA[2]}
                    index={2}
                    delay={0.4}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    showLabel={false}
                  />
                  {/* Annotation for consolidation */}
                  <motion.g
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                  >
                    <text
                      x="200"
                      y="80"
                      fill="#94a3b8"
                      fontSize="8"
                      textAnchor="middle"
                    >
                      Consolidation Range
                    </text>
                    <line
                      x1="150"
                      y1="90"
                      x2="250"
                      y2="90"
                      stroke="#94a3b8"
                      strokeDasharray="2 2"
                      strokeWidth="1"
                    />
                    <line
                      x1="150"
                      y1="200"
                      x2="250"
                      y2="200"
                      stroke="#94a3b8"
                      strokeDasharray="2 2"
                      strokeWidth="1"
                    />
                  </motion.g>
                </>
              )}

              {stage >= STAGES.SQUEEZE && (
                <Candle
                  data={DATA[3]}
                  index={3}
                  delay={0}
                  isSqueeze={true}
                  initial={{ scaleY: 0, opacity: 0, originY: 1 }}
                  animate={{ scaleY: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 150, damping: 15 }}
                  showLabel={true}
                />
              )}
            </svg>
          ) : (
            <IntradayView onBack={() => setShowIntraday(false)} />
          )}
        </div>

        {/* --- Volume Bar Overlay (Separate from SVG logic for easier layout) --- */}
        {!showIntraday && (
          <div className="absolute bottom-0 left-0 right-0 h-32 px-16 flex items-end justify-between pointer-events-none pb-8 md:pb-16 opacity-80">
            {/* Day 1 Volume - Massive */}
            <div className="flex-1 flex justify-center items-end h-full mx-2">
              {stage >= STAGES.DAY_1 && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: '100%' }}
                  transition={{ type: 'spring', bounce: 0.4, duration: 1.2 }}
                  className="w-8 bg-yellow-500/80 shadow-[0_0_20px_rgba(234,179,8,0.4)] rounded-t-sm relative group"
                >
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-yellow-500 text-black text-[10px] font-bold px-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                    52M
                  </div>
                </motion.div>
              )}
            </div>

            {/* Day 2 Volume - Tiny */}
            <div className="flex-1 flex justify-center items-end h-full mx-2">
              {stage >= STAGES.CONSOLIDATION && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: '2%' }}
                  transition={{ delay: 0.3 }}
                  className="w-8 bg-slate-600/50 rounded-t-sm relative group"
                >
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-700 text-white text-[10px] px-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                    500K
                  </div>
                </motion.div>
              )}
            </div>

            {/* Day 3 Volume - Microscopic */}
            <div className="flex-1 flex justify-center items-end h-full mx-2">
              {stage >= STAGES.CONSOLIDATION && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: '1.5%' }}
                  transition={{ delay: 0.5 }}
                  className="w-8 bg-slate-600/50 rounded-t-sm relative group"
                >
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-700 text-white text-[10px] px-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                    300K
                  </div>
                </motion.div>
              )}
            </div>

            {/* Day 4 Volume - Surge */}
            <div className="flex-1 flex justify-center items-end h-full mx-2">
              {stage >= STAGES.SQUEEZE && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: '60%' }}
                  transition={{ type: 'spring', stiffness: 200 }}
                  className="w-8 bg-green-500/80 shadow-[0_0_20px_rgba(34,197,94,0.4)] rounded-t-sm"
                >
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-green-400 font-bold text-xs animate-bounce">
                    SQUEEZE
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        )}

        {/* --- Controls --- */}
        <div className="absolute bottom-6 left-0 right-0 flex justify-center space-x-4 z-20">
          {stage === STAGES.INITIAL && (
            <motion.button
              layoutId="action-btn"
              onClick={handleNext}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-full font-semibold shadow-lg shadow-blue-900/40 transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Play size={18} fill="currentColor" />
              <span>Start Lesson</span>
            </motion.button>
          )}

          {(stage === STAGES.DAY_1 || stage === STAGES.CONSOLIDATION) && (
            <motion.button
              layoutId="action-btn"
              onClick={handleNext}
              className="flex items-center space-x-2 bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-full font-semibold shadow-lg transition-all border border-slate-600"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <TrendingUp size={18} />
              <span>Next Phase</span>
            </motion.button>
          )}

          {stage === STAGES.TRIGGER_READY && (
            <motion.button
              layoutId="action-btn"
              onClick={handleSqueeze}
              className="flex items-center space-x-2 bg-red-600 hover:bg-red-500 text-white px-8 py-4 rounded-full font-bold text-lg shadow-[0_0_30px_rgba(220,38,38,0.5)] animate-pulse transition-all border-2 border-red-400"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Zap size={24} fill="currentColor" />
              <span>FORCE COVER</span>
            </motion.button>
          )}

          {(stage === STAGES.SQUEEZE || showIntraday) && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={handleReset}
              className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-full text-sm font-medium border border-slate-700 transition-all"
            >
              <RotateCcw size={14} />
              <span>Reset Scenario</span>
            </motion.button>
          )}
        </div>
      </EnvironmentWrapper>
    </div>
  );
};

// --- Sub-components ---

const Candle = ({
  data,
  index,
  animate,
  initial,
  transition,
  delay = 0,
  showLabel = false,
  isSqueeze = false,
}: any) => {
  // Coordinate Mapping (Approximate for 400x300 viewBox)
  const x = 50 + index * 100;
  // Invert Y axis: Higher price = Lower Y value.
  // Assume scale 0-100 range maps to Y 300-0 roughly
  const openY = 300 - data.open * 3;
  const closeY = 300 - data.close * 3;
  const highY = 300 - data.high * 3;
  const lowY = 300 - data.low * 3;

  const bodyHeight = Math.abs(openY - closeY) || 1; // Minimum 1px for doji
  const bodyY = Math.min(openY, closeY);
  const color = data.isGreen ? '#22c55e' : '#ef4444';

  return (
    <motion.g
      initial={initial}
      animate={animate}
      transition={transition || { duration: 0.5, delay, type: 'spring' }}
    >
      {/* Wicks */}
      <line x1={x} y1={highY} x2={x} y2={lowY} stroke={color} strokeWidth="2" />

      {/* Body */}
      <rect
        x={x - 15}
        y={bodyY}
        width="30"
        height={bodyHeight}
        fill={color}
        rx="2"
      />

      {/* Label/Annotation */}
      {showLabel && (
        <motion.g
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: delay + 0.5 }}
        >
          <rect
            x={x - 40}
            y={highY - 45}
            width="80"
            height="30"
            rx="4"
            fill="#1e293b"
            stroke={color}
            strokeWidth="1"
          />
          <text
            x={x}
            y={highY - 26}
            fill="white"
            fontSize="10"
            textAnchor="middle"
            fontWeight="bold"
          >
            {data.label}
          </text>
          {isSqueeze && (
            <text
              x={x}
              y={highY - 55}
              fill="#22c55e"
              fontSize="12"
              textAnchor="middle"
              fontWeight="bold"
            >
              BREAKOUT!
            </text>
          )}
        </motion.g>
      )}

      {/* Squeeze specific particles */}
      {isSqueeze && (
        <>
          <motion.circle
            cx={x}
            cy={highY}
            r="4"
            fill="white"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: [0, 1, 0], scale: [1, 2, 3] }}
            transition={{ repeat: Infinity, duration: 1 }}
          />
        </>
      )}
    </motion.g>
  );
};

const IntradayView = ({ onBack }: { onBack: () => void }) => {
  // Simulated 5-minute chart data points for the squeeze
  const points =
    '0,150 20,145 40,148 60,140 80,100 100,80 120,40 140,30 160,20 200,10';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full h-full bg-slate-900 rounded-lg border border-slate-700 relative overflow-hidden flex flex-col p-4"
    >
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <span className="bg-red-500/20 text-red-400 text-xs px-2 py-1 rounded border border-red-500/30">
            LIVE
          </span>
          <h3 className="text-white font-bold">Day 4: 9:35 AM</h3>
        </div>
        <div className="text-green-400 font-mono text-xl font-bold">+42.5%</div>
      </div>

      <div className="flex-1 relative border-l border-b border-slate-800">
        {/* SVG Chart Line */}
        <svg
          className="w-full h-full"
          viewBox="0 0 200 160"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="gradient" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#22c55e" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
            </linearGradient>
          </defs>
          <motion.path
            d={`M0,150 L0,150 ${points} L200,160 L0,160 Z`}
            fill="url(#gradient)"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
          />
          <motion.polyline
            points={points}
            fill="none"
            stroke="#22c55e"
            strokeWidth="3"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, ease: 'easeOut' }}
          />

          {/* Buy orders animating in */}
          {[1, 2, 3, 4, 5].map((i) => (
            <motion.circle
              key={i}
              cx={80 + i * 20}
              cy={100 - i * 20}
              r="2"
              fill="white"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0], y: -20 }}
              transition={{ delay: 1 + i * 0.2, duration: 1, repeat: Infinity }}
            />
          ))}
        </svg>

        {/* Annotation */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1.5 }}
          className="absolute top-1/4 left-1/4 bg-slate-800/90 p-2 rounded border border-green-500/50 text-xs text-green-300"
        >
          <div className="font-bold flex items-center gap-1">
            <AlertCircle size={12} /> Breakout Entry
          </div>
          Shorts covering into buying pressure
        </motion.div>
      </div>

      <div className="mt-4 flex justify-between text-xs text-slate-500 font-mono">
        <span>09:30</span>
        <span>09:35</span>
        <span>09:40</span>
        <span>09:45</span>
      </div>

      <button
        onClick={onBack}
        className="absolute top-2 right-2 text-slate-500 hover:text-white"
      >
        <RotateCcw size={16} />
      </button>
    </motion.div>
  );
};

export default LiquidityPlayChart;
