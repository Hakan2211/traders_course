import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TrendingUp, TrendingDown, Info, Activity } from 'lucide-react'

// --- Types & Configuration ---

type ScenarioType = 'breakout' | 'fade'

interface ChartPoint {
  x: number
  y: number
}

interface VolumeBar {
  x: number
  height: number
  color: string // Tailwind class equivalent color hex
}

interface Annotation {
  id: string
  x: number // Percentage 0-100
  y: number // Percentage 0-100 relative to container height
  text: string
  subText?: string
  align?: 'left' | 'right' | 'center'
}

const VIEWBOX_WIDTH = 800
const VIEWBOX_HEIGHT = 400
const VWAP_Y_START = 280
const VWAP_Y_END = 260 // Slight rise in VWAP typically

// Helper to generate SVG path 'd' attribute from points
const generatePath = (points: ChartPoint[]): string => {
  if (points.length === 0) return ''
  const start = points[0]
  let d = `M ${start.x} ${start.y}`
  for (let i = 1; i < points.length; i++) {
    d += ` L ${points[i].x} ${points[i].y}`
  }
  return d
}

// --- Data Definition ---

// Common Morning Leg (Indices 0-3)
// 0: Open, 1: High, 2: Pullback start, 3: Stabilization
const commonPoints: ChartPoint[] = [
  { x: 0, y: 280 },
  { x: 50, y: 200 },
  { x: 100, y: 80 }, // Morning High
  { x: 160, y: 200 }, // Pullback
]

// Breakout Scenario Points (Appending to common)
// Logic: Tight consolidation above VWAP, then explosion
const breakoutRest: ChartPoint[] = [
  { x: 220, y: 180 },
  { x: 280, y: 210 }, // Test support
  { x: 340, y: 190 },
  { x: 400, y: 205 }, // Tightening
  { x: 460, y: 185 },
  { x: 520, y: 200 },
  { x: 580, y: 180 }, // Pre-breakout coil
  { x: 640, y: 60 }, // EXPLOSION
  { x: 720, y: 20 }, // Continuation
  { x: 800, y: 40 }, // High close
]

// Fade Scenario Points (Appending to common)
// Logic: Lower highs, gap from VWAP, then crash through VWAP
const fadeRest: ChartPoint[] = [
  { x: 220, y: 140 }, // Lower High 1
  { x: 280, y: 220 }, // Dip
  { x: 340, y: 170 }, // Lower High 2
  { x: 400, y: 240 }, // Dip closer to VWAP
  { x: 460, y: 200 }, // Lower High 3 (Weak)
  { x: 520, y: 250 }, // Almost touching VWAP
  { x: 580, y: 220 }, // Last gasp
  { x: 640, y: 320 }, // CRASH through VWAP (Stuff candle)
  { x: 720, y: 360 }, // Fade continues
  { x: 800, y: 380 }, // Low close
]

const breakoutPoints = [...commonPoints, ...breakoutRest]
const fadePoints = [...commonPoints, ...fadeRest]

const breakoutPath = generatePath(breakoutPoints)
const fadePath = generatePath(fadePoints)

// Volume Data Generators
const generateVolume = (scenario: ScenarioType): VolumeBar[] => {
  const bars: VolumeBar[] = []
  const count = 20
  const barWidth = VIEWBOX_WIDTH / count

  for (let i = 0; i < count; i++) {
    const x = i * barWidth + barWidth / 2
    let height = 10
    let color = '#475569' // Slate-600 neutral

    // Morning Volume (Common)
    if (i < 5) {
      height = 50 + Math.random() * 30
      color = i % 2 === 0 ? '#34d399' : '#f87171' // Mix green/red
    }
    // Midday (Divergence)
    else if (i < 15) {
      if (scenario === 'breakout') {
        height = 10 + Math.random() * 10 // Very Low volume (Consolidation)
        color = '#94a3b8' // Muted
      } else {
        height = 20 + Math.random() * 15 // Declining but choppy
        color = '#f87171' // Red-ish tint for selling pressure
      }
    }
    // Afternoon (Resolution)
    else {
      if (scenario === 'breakout') {
        height = 80 + Math.random() * 20 // Massive volume spike
        color = '#34d399' // Emerald
      } else {
        height = 70 + Math.random() * 20 // Massive sell volume (Stuff candle)
        color = '#ef4444' // Red
      }
    }
    bars.push({ x, height, color })
  }
  return bars
}

// Annotations configuration
const annotations: Record<ScenarioType, Annotation[]> = {
  breakout: [
    { id: 'b1', x: 12, y: 20, text: 'Morning High', align: 'center' },
    {
      id: 'b2',
      x: 45,
      y: 48,
      text: 'Compression',
      subText: 'Tight range above VWAP',
      align: 'center',
    },
    {
      id: 'b3',
      x: 80,
      y: 15,
      text: 'Power Hour Explosion',
      subText: 'Shorts trapped',
      align: 'left',
    },
  ],
  fade: [
    { id: 'f1', x: 12, y: 20, text: 'Morning High', align: 'center' },
    {
      id: 'f2',
      x: 35,
      y: 35,
      text: 'Lower Highs',
      subText: 'The "Bouncing Ball"',
      align: 'center',
    },
    {
      id: 'f3',
      x: 50,
      y: 55,
      text: 'VWAP Gap',
      subText: 'No support below',
      align: 'center',
    },
    {
      id: 'f4',
      x: 80,
      y: 85,
      text: 'The Flush',
      subText: 'Support breaks',
      align: 'left',
    },
  ],
}

// --- Component ---

const DivergenceChart: React.FC = () => {
  const [scenario, setScenario] = useState<ScenarioType>('breakout')

  // Derived state
  const isBreakout = scenario === 'breakout'
  const currentPath = isBreakout ? breakoutPath : fadePath
  const currentVolume = generateVolume(scenario)
  const currentAnnotations = annotations[scenario]
  const primaryColor = isBreakout ? '#34d399' : '#f43f5e' // Emerald-400 vs Rose-500
  const gradientId = isBreakout ? 'gradientBreakout' : 'gradientFade'

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden font-sans my-8">
      {/* Header & Controls */}
      <div className="p-6 border-b border-slate-800 flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-400" />
            The Divergence Point
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Compare how structure evolves after 12:00 PM
          </p>
        </div>

        {/* Toggle Switch */}
        <div className="bg-slate-950 p-1 rounded-lg flex items-center border border-slate-800 relative">
          <div className="absolute inset-0 pointer-events-none px-1 py-1">
            <motion.div
              layout
              className={`h-full w-1/2 rounded-md ${
                isBreakout
                  ? 'bg-emerald-900/30'
                  : 'translate-x-full bg-rose-900/30'
              }`}
              initial={false}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            />
          </div>
          <button
            onClick={() => setScenario('breakout')}
            className={`relative z-10 px-4 py-2 rounded-md flex items-center gap-2 text-sm font-medium transition-colors ${
              isBreakout
                ? 'text-emerald-400'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            Breakout (Long)
          </button>
          <button
            onClick={() => setScenario('fade')}
            className={`relative z-10 px-4 py-2 rounded-md flex items-center gap-2 text-sm font-medium transition-colors ${
              !isBreakout
                ? 'text-rose-400'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <TrendingDown className="w-4 h-4" />
            Fade (Short)
          </button>
        </div>
      </div>

      {/* Main Chart Area */}
      <div className="relative aspect-video w-full bg-slate-950/50">
        {/* Background Grid */}
        <div className="absolute inset-0 grid grid-cols-4 grid-rows-4 pointer-events-none opacity-20">
          {[...Array(16)].map((_, i) => (
            <div key={i} className="border-r border-b border-slate-700" />
          ))}
        </div>

        {/* Time Labels (Approximate) */}
        <div className="absolute bottom-2 left-0 right-0 flex justify-between px-8 text-xs text-slate-600 font-mono">
          <span>9:30 AM</span>
          <span>11:00 AM</span>
          <span>1:00 PM</span>
          <span>3:00 PM</span>
          <span>4:00 PM</span>
        </div>

        {/* Annotations Overlay */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <AnimatePresence>
            {currentAnnotations.map((note) => (
              <motion.div
                key={note.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4 }}
                className="absolute flex flex-col items-center"
                style={{
                  left: `${note.x}%`,
                  top: `${note.y}%`,
                  transform: 'translate(-50%, -50%)',
                }}
              >
                <div
                  className={`px-3 py-1 rounded-full text-xs font-bold shadow-lg backdrop-blur-sm border ${
                    isBreakout
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                      : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                  }`}
                >
                  {note.text}
                </div>
                {note.subText && (
                  <span className="mt-1 text-[10px] text-slate-400 bg-slate-900/80 px-2 py-0.5 rounded">
                    {note.subText}
                  </span>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Special "Decision Point" Marker at 12:00 PM approx */}
          <div className="absolute top-0 bottom-12 left-[35%] w-px border-l border-dashed border-slate-600 opacity-50 flex flex-col items-center pt-2">
            <span className="text-[10px] text-slate-500 bg-slate-950 px-1">
              12:00 PM
            </span>
          </div>
        </div>

        {/* SVG Chart */}
        <svg
          viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
          className="w-full h-full overflow-visible"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="gradientBreakout" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#34d399" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#34d399" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="gradientFade" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#f43f5e" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* VWAP Line */}
          <line
            x1="0"
            y1={VWAP_Y_START}
            x2={VIEWBOX_WIDTH}
            y2={VWAP_Y_END}
            stroke="#3b82f6"
            strokeWidth="2"
            strokeDasharray="6 6"
            className="opacity-60"
          />
          <text
            x="10"
            y={VWAP_Y_START - 10}
            fill="#3b82f6"
            fontSize="12"
            className="opacity-80 font-mono"
          >
            VWAP
          </text>

          {/* Volume Bars (Bottom) */}
          <g className="opacity-80">
            {currentVolume.map((bar, i) => (
              <motion.rect
                key={i}
                x={bar.x - VIEWBOX_WIDTH / 20 / 2 + 2}
                y={VIEWBOX_HEIGHT - bar.height}
                width={VIEWBOX_WIDTH / 20 - 4}
                height={bar.height}
                fill={bar.color}
                initial={{ scaleY: 0 }}
                animate={{
                  scaleY: 1,
                  y: VIEWBOX_HEIGHT - bar.height,
                  height: bar.height,
                  fill: bar.color,
                }}
                transition={{
                  type: 'spring',
                  stiffness: 200,
                  damping: 20,
                  delay: i * 0.02,
                }}
              />
            ))}
          </g>

          {/* Price Path Area Fill */}
          <motion.path
            d={`${currentPath} L ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT} L 0 ${VIEWBOX_HEIGHT} Z`}
            fill={`url(#${gradientId})`}
            initial={false}
            animate={{
              d: `${currentPath} L ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT} L 0 ${VIEWBOX_HEIGHT} Z`,
            }}
            transition={{ duration: 0.6, ease: 'easeInOut' }}
            className="opacity-50"
          />

          {/* Main Price Line */}
          <motion.path
            d={currentPath}
            fill="none"
            stroke={primaryColor}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={false}
            animate={{ d: currentPath, stroke: primaryColor }}
            transition={{ duration: 0.6, ease: 'easeInOut' }}
            style={{ filter: `drop-shadow(0 0 4px ${primaryColor})` }}
          />
        </svg>
      </div>

      {/* Info Panel / Legend */}
      <div className="bg-slate-900 p-6 border-t border-slate-800">
        <div className="flex gap-4 items-start">
          <Info
            className={`w-6 h-6 shrink-0 mt-1 ${
              isBreakout ? 'text-emerald-400' : 'text-rose-400'
            }`}
          />
          <div>
            <h3
              className={`text-lg font-bold mb-2 ${
                isBreakout ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {isBreakout
                ? 'Scenario A: The Energy Coil'
                : 'Scenario B: The Deflating Balloon'}
            </h3>
            <p className="text-slate-300 leading-relaxed text-sm">
              {isBreakout ? (
                <span>
                  Notice how price refuses to break below{' '}
                  <span className="text-blue-400 font-semibold">VWAP</span>.
                  Volume (bottom bars) completely dries up during the middle of
                  the day — this is the "coil" tightening. When volume returns
                  at the end, it releases upward.
                </span>
              ) : (
                <span>
                  Notice the{' '}
                  <span className="text-rose-300 font-semibold">
                    Lower Highs
                  </span>
                  . Each bounce is weaker. There is a visible "moat" between
                  price and VWAP until gravity wins. The final volume spike
                  isn't buying — it's stops triggering as support breaks.
                </span>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DivergenceChart
