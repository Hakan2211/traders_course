
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Skull, Clock, Scale } from 'lucide-react';

const SisyphusScale: React.FC = () => {
  const [drawdown, setDrawdown] = useState(15);

  // Calculate recovery metrics
  const recoveryNeeded = useMemo(() => {
    if (drawdown === 100) return Infinity;
    return (drawdown / (100 - drawdown)) * 100;
  }, [drawdown]);

  // Derived styling and text states
  const getDangerLevel = (d: number) => {
    if (d < 10) return { color: '#22c55e', text: 'Safe Zone', icon: Clock };
    if (d < 20)
      return { color: '#eab308', text: 'Caution', icon: AlertTriangle };
    if (d < 40)
      return { color: '#f97316', text: 'Danger Zone', icon: AlertTriangle };
    if (d < 60) return { color: '#ef4444', text: 'Career Threat', icon: Skull };
    return { color: '#7f1d1d', text: 'Game Over', icon: Skull };
  };

  const getRecoveryTime = (d: number) => {
    if (d <= 5) return '1-2 Weeks';
    if (d <= 10) return '1 Month';
    if (d <= 20) return '3-6 Months';
    if (d <= 35) return '1-2 Years';
    if (d <= 50) return '3-5 Years';
    if (d <= 70) return 'Decade+';
    return 'Impossible';
  };

  const danger = getDangerLevel(drawdown);

  // Boulder scale grows logarithmically with recovery needed
  const boulderScale = 1 + Math.log(recoveryNeeded + 1) * 0.18;
  const rockCount = Math.floor(drawdown / 5);

  // Tilt angle: negative tilts left side down (drawdown side heavier)
  const tiltAngle = Math.min(drawdown * 0.35, 22) * -1;

  return (
    <div className="w-full max-w-4xl mx-auto my-12 bg-gradient-to-b from-slate-900 to-slate-950 rounded-2xl border border-slate-700/50 overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="bg-slate-950/80 backdrop-blur-sm px-6 py-5 border-b border-slate-800/50 flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2.5">
            <Scale className="w-5 h-5 text-blue-400" />
            The Sisyphus Scale
          </h3>
          <p className="text-slate-500 text-sm mt-1 hidden sm:block">
            The cruel mathematics of drawdown recovery
          </p>
        </div>
        <div className="text-right">
          <div
            className="text-2xl font-mono font-bold tracking-tight"
            style={{ color: danger.color }}
          >
            {drawdown}%
          </div>
          <div className="text-xs text-slate-500 uppercase tracking-wider">
            Drawdown
          </div>
        </div>
      </div>

      {/* Main Visualization Area */}
      <div className="relative h-[380px] overflow-hidden">
        {/* Subtle gradient background */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/0 via-slate-900/50 to-slate-950" />

        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
          }}
        />

        {/* Warning Overlay at high drawdowns */}
        <AnimatePresence>
          {drawdown > 35 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: drawdown > 60 ? 0.15 : 0.08 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-gradient-to-t from-red-900/50 to-transparent pointer-events-none"
            />
          )}
        </AnimatePresence>

        {/* Scale Assembly - SVG based for precise positioning */}
        <svg
          viewBox="0 0 500 320"
          className="absolute inset-0 w-full h-full"
          style={{ maxWidth: '600px', margin: '0 auto', left: 0, right: 0 }}
        >
          {/* Base/Stand */}
          <rect x="242" y="280" width="16" height="30" fill="#334155" rx="2" />
          <rect x="220" y="305" width="60" height="12" fill="#1e293b" rx="4" />

          {/* Pillar */}
          <rect x="246" y="140" width="8" height="145" fill="#475569" />
          <rect x="244" y="140" width="12" height="4" fill="#64748b" rx="1" />

          {/* Pivot Point */}
          <circle
            cx="250"
            cy="140"
            r="10"
            fill="#64748b"
            stroke="#334155"
            strokeWidth="3"
          />
          <circle cx="250" cy="140" r="4" fill="#94a3b8" />

          {/* Rotatable Group - Main Beam Assembly */}
          <motion.g
            initial={false}
            animate={{ rotate: tiltAngle }}
            transition={{ type: 'spring', stiffness: 120, damping: 20 }}
            style={{ originX: '250px', originY: '140px' }}
          >
            {/* Main Beam */}
            <rect x="60" y="136" width="380" height="8" fill="#475569" rx="4" />
            <rect x="60" y="136" width="380" height="3" fill="#64748b" rx="2" />

            {/* Left hinge point */}
            <circle
              cx="80"
              cy="140"
              r="6"
              fill="#64748b"
              stroke="#334155"
              strokeWidth="2"
            />

            {/* Right hinge point */}
            <circle
              cx="420"
              cy="140"
              r="6"
              fill="#64748b"
              stroke="#334155"
              strokeWidth="2"
            />

            {/* Left Pan Assembly - Drawdown Side */}
            <motion.g
              initial={false}
              animate={{ rotate: -tiltAngle }}
              transition={{ type: 'spring', stiffness: 120, damping: 20 }}
              style={{ originX: '80px', originY: '140px' }}
            >
              {/* Chains */}
              <line
                x1="80"
                y1="146"
                x2="40"
                y2="220"
                stroke="#64748b"
                strokeWidth="2"
              />
              <line
                x1="80"
                y1="146"
                x2="120"
                y2="220"
                stroke="#64748b"
                strokeWidth="2"
              />

              {/* Pan */}
              <ellipse cx="80" cy="225" rx="50" ry="8" fill="#334155" />
              <ellipse cx="80" cy="222" rx="48" ry="6" fill="#475569" />

              {/* Rocks in pan */}
              {Array.from({ length: Math.min(rockCount, 18) }).map((_, i) => {
                const row = Math.floor(i / 6);
                const col = i % 6;
                const offsetX = (col - 2.5) * 12 + (row % 2 ? 6 : 0);
                const offsetY = row * -8;
                return (
                  <motion.rect
                    key={i}
                    x={72 + offsetX}
                    y={212 + offsetY}
                    width="8"
                    height="8"
                    rx="2"
                    fill="#94a3b8"
                    stroke="#64748b"
                    strokeWidth="1"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                  />
                );
              })}

              {/* Label */}
              <motion.g
                animate={{ scale: 1 + drawdown / 300 }}
                style={{ originX: '80px', originY: '256px' }}
              >
                <rect
                  x="50"
                  y="245"
                  width="60"
                  height="22"
                  rx="4"
                  fill="#1e293b"
                  stroke="#7f1d1d"
                  strokeWidth="1"
                />
                <text
                  x="80"
                  y="260"
                  textAnchor="middle"
                  fill="#f87171"
                  fontSize="12"
                  fontFamily="monospace"
                  fontWeight="bold"
                >
                  -{drawdown}%
                </text>
              </motion.g>
            </motion.g>

            {/* Right Pan Assembly - Recovery Side */}
            <motion.g
              initial={false}
              animate={{ rotate: -tiltAngle }}
              transition={{ type: 'spring', stiffness: 120, damping: 20 }}
              style={{ originX: '420px', originY: '140px' }}
            >
              {/* Chains */}
              <line
                x1="420"
                y1="146"
                x2="380"
                y2="220"
                stroke="#64748b"
                strokeWidth="2"
              />
              <line
                x1="420"
                y1="146"
                x2="460"
                y2="220"
                stroke="#64748b"
                strokeWidth="2"
              />

              {/* Pan */}
              <ellipse cx="420" cy="225" rx="50" ry="8" fill="#334155" />
              <ellipse cx="420" cy="222" rx="48" ry="6" fill="#475569" />

              {/* Boulder Group - Scaling needs to be isolated */}
              <g transform="translate(420, 205)">
                <motion.g
                  animate={{ scale: boulderScale }}
                  transition={{ type: 'spring', stiffness: 120, damping: 15 }}
                >
                  {/* Circle centered at 0,0 in this group */}
                  <circle cx="0" cy="0" r="18" fill="url(#boulderGradient)" />
                  <ellipse
                    cx="-6"
                    cy="-7"
                    rx="6"
                    ry="4"
                    fill="rgba(255,255,255,0.15)"
                  />
                </motion.g>
              </g>

              {/* Label */}
              <rect
                x="375"
                y="245"
                width="90"
                height="22"
                rx="4"
                fill="#1e293b"
                stroke="#166534"
                strokeWidth="1"
              />
              <text
                x="420"
                y="260"
                textAnchor="middle"
                fill="#4ade80"
                fontSize="11"
                fontFamily="monospace"
                fontWeight="bold"
              >
                +{recoveryNeeded.toFixed(1)}%
              </text>
            </motion.g>
          </motion.g>

          {/* Gradient definitions */}
          <defs>
            <linearGradient
              id="boulderGradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#cbd5e1" />
              <stop offset="50%" stopColor="#64748b" />
              <stop offset="100%" stopColor="#334155" />
            </linearGradient>
          </defs>
        </svg>

        {/* Side Labels */}
        <div className="absolute bottom-4 left-4 sm:left-8 text-xs text-red-400/70 font-medium uppercase tracking-wider">
          Drawdown
        </div>
        <div className="absolute bottom-4 right-4 sm:right-8 text-xs text-green-400/70 font-medium uppercase tracking-wider">
          Recovery Needed
        </div>
      </div>

      {/* Controls & Metrics */}
      <div className="bg-slate-950/80 backdrop-blur-sm p-6 border-t border-slate-800/50 grid md:grid-cols-2 gap-6">
        {/* Slider Control */}
        <div className="space-y-5">
          <div>
            <label className="flex justify-between text-sm font-medium text-slate-300 mb-3">
              <span>Drawdown Severity</span>
              <span className="font-mono" style={{ color: danger.color }}>
                {drawdown}%
              </span>
            </label>
            <input
              type="range"
              min="0"
              max="90"
              step="1"
              value={drawdown}
              onChange={(e) => setDrawdown(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-full appearance-none cursor-pointer accent-blue-500 hover:accent-blue-400 transition-all"
              style={{
                background: `linear-gradient(to right, ${danger.color} 0%, ${
                  danger.color
                } ${drawdown / 0.9}%, #1e293b ${
                  drawdown / 0.9
                }%, #1e293b 100%)`,
              }}
            />
            <div className="flex justify-between text-[10px] text-slate-600 mt-2 font-mono">
              <span>0%</span>
              <span>25%</span>
              <span>50%</span>
              <span>75%</span>
              <span>90%</span>
            </div>
          </div>

          <div
            className="p-4 rounded-xl border bg-slate-900/50 flex gap-3 items-start transition-all duration-300"
            style={{ borderColor: `${danger.color}40` }}
          >
            <danger.icon
              className="w-5 h-5 mt-0.5 shrink-0"
              style={{ color: danger.color }}
            />
            <div>
              <div
                className="font-semibold text-sm"
                style={{ color: danger.color }}
              >
                {danger.text}
              </div>
              <div className="text-xs text-slate-400 mt-1 leading-relaxed">
                {drawdown > 50
                  ? 'Exponential recovery requirements make survival statistically unlikely.'
                  : drawdown > 20
                  ? 'Significant effort required. Discipline is critical.'
                  : 'Manageable with consistent execution.'}
              </div>
            </div>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800/50">
            <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">
              Capital Left
            </div>
            <div className="text-2xl font-mono text-white font-bold">
              {100 - drawdown}%
            </div>
          </div>
          <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800/50">
            <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">
              Gain Required
            </div>
            <div className="text-2xl font-mono text-green-400 font-bold">
              +{recoveryNeeded.toFixed(1)}%
            </div>
          </div>
          <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800/50 col-span-2">
            <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">
              Estimated Recovery Time
            </div>
            <div className="text-lg text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-500" />
              <span className="font-medium">{getRecoveryTime(drawdown)}</span>
            </div>
            <div className="text-[10px] text-slate-600 mt-1">
              Assuming consistent profitable performance
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SisyphusScale;
