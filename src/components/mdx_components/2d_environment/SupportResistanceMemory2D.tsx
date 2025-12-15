
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

type Phase = 'approach' | 'contact' | 'reversal' | 'breakout';
type Scenario = 'reversal' | 'breakout';

interface SupportResistanceMemory2DProps {
  scenario: Scenario;
  phase: Phase;
  progress: number; // 0..1
  lineCurvature: number; // 0..1
  chartZoom: number; // ~0.8..1.2
}

const WIDTH = 820;
const HEIGHT = 420;
const PADDING = 48;

function easeInOut(t: number) {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

export default function SupportResistanceMemory2D({
  scenario,
  phase,
  progress,
  lineCurvature,
  chartZoom,
}: SupportResistanceMemory2DProps) {
  // Layout derived values
  const resY = HEIGHT * 0.35; // resistance line Y (lower y = higher price visually)
  const startY = HEIGHT * 0.8;
  const afterBreakoutY = HEIGHT * 0.22;
  const afterReversalY = HEIGHT * 0.62;

  const { points, dot, resistanceColor, showFlash } = useMemo(() => {
    const APPROACH_PORTION = 0.7;
    const totalPoints = 140;
    const approachPoints = Math.floor(totalPoints * APPROACH_PORTION);
    const reactionPoints = totalPoints - approachPoints;

    const pts: Array<{ x: number; y: number }> = [];
    // Approach: left to right, climbing toward resY
    for (let i = 0; i < approachPoints; i++) {
      const denomA = Math.max(1, approachPoints - 1);
      const t = i / denomA;
      const x = PADDING + t * (WIDTH - PADDING * 2);
      // curve factor: 0 linear, 1 more concave
      const curve = Math.pow(
        t,
        1 - Math.min(Math.max(lineCurvature, 0), 1) * 0.7
      );
      const y = startY - (startY - resY) * easeInOut(curve);
      pts.push({ x, y });
    }

    // Reaction segment
    const endY = scenario === 'breakout' ? afterBreakoutY : afterReversalY;
    for (let i = 0; i < reactionPoints; i++) {
      const denomR = Math.max(1, reactionPoints - 1);
      const t = i / denomR;
      const x = PADDING + (i / denomR) * (WIDTH - PADDING * 2);
      // start near resY (contact)
      const local = easeInOut(t);
      const y =
        scenario === 'breakout'
          ? resY - (resY - endY) * local // move above
          : resY + (endY - resY) * local; // move below
      pts.push({ x, y });
    }

    // Determine dot position from progress across total points
    let dotX = PADDING;
    let dotY = startY;
    if (pts.length >= 2) {
      const idxFloat = Math.min(
        pts.length - 1,
        Math.max(0, progress * (pts.length - 1))
      );
      const baseIdx = Math.floor(idxFloat);
      const nextIdx = Math.min(baseIdx + 1, pts.length - 1);
      const localT = idxFloat - baseIdx;
      dotX = pts[baseIdx].x + (pts[nextIdx].x - pts[baseIdx].x) * localT;
      dotY = pts[baseIdx].y + (pts[nextIdx].y - pts[baseIdx].y) * localT;
    } else if (pts.length === 1) {
      dotX = pts[0].x;
      dotY = pts[0].y;
    }

    // Resistance color flips to green if scenario is breakout and we are in breakout phase
    const resistanceColor =
      scenario === 'breakout' && phase === 'breakout' ? '#16a34a' : '#ef4444';

    const showFlash = phase === 'contact';

    return {
      points: pts,
      dot: { x: dotX, y: dotY },
      resistanceColor,
      showFlash,
    };
  }, [progress, lineCurvature, phase, scenario]);

  // Build SVG path
  const pathD = useMemo(() => {
    if (points.length === 0) return '';
    const d = points
      .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
      .join(' ');
    return d;
  }, [points]);

  // Trail markers behind the dot
  const trail = useMemo(() => {
    const count = 8;
    const arr: Array<{ x: number; y: number; a: number; r: number }> = [];
    for (let i = 0; i < count; i++) {
      const t = Math.max(0, progress - (i + 1) * 0.01);
      if (points.length >= 2) {
        const idxFloat = Math.min(
          points.length - 1,
          Math.max(0, t * (points.length - 1))
        );
        const baseIdx = Math.floor(idxFloat);
        const nextIdx = Math.min(baseIdx + 1, points.length - 1);
        const localT = idxFloat - baseIdx;
        const x =
          points[baseIdx].x + (points[nextIdx].x - points[baseIdx].x) * localT;
        const y =
          points[baseIdx].y + (points[nextIdx].y - points[baseIdx].y) * localT;
        arr.push({
          x,
          y,
          a: Math.max(0, 0.7 - i * 0.08),
          r: Math.max(1.5, 5 - i * 0.5),
        });
      } else if (points.length === 1) {
        arr.push({
          x: points[0].x,
          y: points[0].y,
          a: Math.max(0, 0.7 - i * 0.08),
          r: Math.max(1.5, 5 - i * 0.5),
        });
      } else {
        arr.push({
          x: PADDING,
          y: HEIGHT - PADDING,
          a: Math.max(0, 0.7 - i * 0.08),
          r: Math.max(1.5, 5 - i * 0.5),
        });
      }
    }
    return arr;
  }, [points, progress]);

  return (
    <div className="w-full h-full p-4">
      <div
        className="w-full h-full rounded-xl border border-gray-700/40 bg-gradient-to-b from-slate-900/60 to-slate-950/80"
        style={{ overflow: 'hidden' }}
      >
        <svg
          width="100%"
          height="100%"
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          preserveAspectRatio="xMidYMid meet"
          style={{
            transform: `scale(${chartZoom})`,
            transformOrigin: 'center',
          }}
        >
          {/* Grid */}
          {[0, 0.25, 0.5, 0.75, 1].map((r) => (
            <line
              key={`gh-${r}`}
              x1={PADDING}
              y1={PADDING + r * (HEIGHT - PADDING * 2)}
              x2={WIDTH - PADDING}
              y2={PADDING + r * (HEIGHT - PADDING * 2)}
              stroke="#1f2937"
              strokeDasharray="4 4"
            />
          ))}
          {[0, 0.25, 0.5, 0.75, 1].map((r) => (
            <line
              key={`gv-${r}`}
              x1={PADDING + r * (WIDTH - PADDING * 2)}
              y1={PADDING}
              x2={PADDING + r * (WIDTH - PADDING * 2)}
              y2={HEIGHT - PADDING}
              stroke="#1f2937"
              strokeDasharray="4 4"
            />
          ))}

          {/* Resistance line */}
          <motion.line
            x1={PADDING}
            y1={resY}
            x2={WIDTH - PADDING}
            y2={resY}
            stroke={resistanceColor}
            strokeWidth="3"
            initial={false}
            animate={{
              stroke: resistanceColor,
              opacity:
                scenario === 'breakout' && phase === 'breakout' ? 0.9 : 1,
            }}
            transition={{ duration: 0.3 }}
          />
          {/* Resistance label */}
          <text
            x={WIDTH - PADDING}
            y={resY - 8}
            textAnchor="end"
            fontSize="12"
            fill="#e5e7eb"
          >
            {scenario === 'breakout' && phase === 'breakout'
              ? 'New Support (Polarity Flip)'
              : 'Resistance (Old Battle Zone)'}
          </text>

          {/* Price line */}
          <defs>
            <linearGradient
              id="priceGradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#22c55e" stopOpacity="0.9" />
            </linearGradient>
          </defs>
          <motion.path
            d={pathD}
            fill="none"
            stroke="url(#priceGradient)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={false}
            animate={{ d: pathD }}
            transition={{ duration: 0.35 }}
          />

          {/* Flash at contact */}
          {showFlash && (
            <motion.circle
              cx={PADDING + 0.7 * (WIDTH - PADDING * 2)}
              cy={resY}
              r="8"
              fill="white"
              initial={{ opacity: 0.9, r: 6 }}
              animate={{ opacity: [0.9, 0.5, 0], r: [6, 18, 24] }}
              transition={{ duration: 0.4 }}
            />
          )}

          {/* Trail */}
          {trail.map((t, i) => (
            <circle
              key={i}
              cx={t.x}
              cy={t.y}
              r={t.r}
              fill="#22c55e"
              opacity={t.a}
            />
          ))}

          {/* Price dot */}
          <motion.circle
            cx={dot.x}
            cy={dot.y}
            r="6"
            fill="#22c55e"
            stroke="white"
            strokeWidth="1"
            initial={false}
            animate={{ cx: dot.x, cy: dot.y }}
            transition={{ duration: 0.08 }}
          />
        </svg>
      </div>
    </div>
  );
}
