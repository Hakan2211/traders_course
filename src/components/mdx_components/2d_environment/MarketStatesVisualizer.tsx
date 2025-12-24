import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Play, Pause, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'

type MarketState =
  | 'stable-quiet'
  | 'stable-volatile'
  | 'trending-quiet'
  | 'trending-volatile'
  | 'dynamic-cycle'

interface MarketStateConfig {
  id: MarketState
  name: string
  description: string
  color: string
  generatePoints: (totalPoints: number) => number[]
}

const TOTAL_POINTS = 100
const CHART_WIDTH = 800
const CHART_HEIGHT = 400
const PADDING = 40

const MARKET_STATES: MarketStateConfig[] = [
  {
    id: 'stable-quiet',
    name: 'Stable & Quiet',
    description:
      'Prices tend to stay within a relatively small range with little movement up or down outside that range.',
    color: '#64748b',
    generatePoints: (totalPoints: number) => {
      const points: number[] = []
      const baseY = CHART_HEIGHT / 2
      const amplitude = 15 // Small fluctuations

      for (let i = 0; i < totalPoints; i++) {
        const x = (i / totalPoints) * (CHART_WIDTH - PADDING * 2) + PADDING
        // Gentle sine wave with small deterministic variations (no time dependency)
        const y = baseY + Math.sin(i * 0.1) * amplitude + Math.sin(i * 0.05) * 3
        points.push(y)
      }
      return points
    },
  },
  {
    id: 'stable-volatile',
    name: 'Stable & Volatile',
    description:
      'There are large daily or weekly changes, but without major changes over a period of months.',
    color: '#ef4444',
    generatePoints: (totalPoints: number) => {
      const points: number[] = []
      const baseY = CHART_HEIGHT / 2
      const amplitude = 80 // Large fluctuations

      for (let i = 0; i < totalPoints; i++) {
        const x = (i / totalPoints) * (CHART_WIDTH - PADDING * 2) + PADDING
        // Multiple sine waves with high frequency and large amplitude
        const y =
          baseY +
          Math.sin(i * 0.3) * amplitude * 0.6 +
          Math.sin(i * 0.5) * amplitude * 0.4 +
          Math.sin(i * 0.7) * 10
        points.push(y)
      }
      return points
    },
  },
  {
    id: 'trending-quiet',
    name: 'Trending & Quiet',
    description:
      'There is slow movement or drift in prices when measured over a period of months but without severe retracement or price movement in the opposite direction.',
    color: '#10b981',
    generatePoints: (totalPoints: number) => {
      const points: number[] = []
      // Upward trend: start at higher Y (lower on screen), end at lower Y (higher on screen)
      const startY = CHART_HEIGHT * 0.7 // Start lower on screen (higher price)
      const endY = CHART_HEIGHT * 0.3 // End higher on screen (lower price)
      const amplitude = 10 // Small fluctuations

      for (let i = 0; i < totalPoints; i++) {
        const x = (i / totalPoints) * (CHART_WIDTH - PADDING * 2) + PADDING
        // Smooth upward trend: start at bottom (high Y), end at top (low Y)
        const trend = startY - (startY - endY) * (i / totalPoints)
        const y =
          trend + Math.sin(i * 0.15) * amplitude + Math.sin(i * 0.08) * 2
        points.push(y)
      }
      return points
    },
  },
  {
    id: 'trending-volatile',
    name: 'Trending & Volatile',
    description:
      'There are large changes in price accompanied by occasional significant shorter-term reversals of direction.',
    color: '#f59e0b',
    generatePoints: (totalPoints: number) => {
      const points: number[] = []
      // Upward trend: start at higher Y (lower on screen), end at lower Y (higher on screen)
      const startY = CHART_HEIGHT * 0.75 // Start lower on screen (higher price)
      const endY = CHART_HEIGHT * 0.25 // End higher on screen (lower price)
      const amplitude = 60 // Large swings

      for (let i = 0; i < totalPoints; i++) {
        const x = (i / totalPoints) * (CHART_WIDTH - PADDING * 2) + PADDING
        // Upward trend with large pullbacks: trend goes from high Y to low Y
        const trend = startY - (startY - endY) * (i / totalPoints)
        const pullback = Math.sin(i * 0.2) * amplitude * 0.7
        const volatility = Math.sin(i * 0.4) * amplitude * 0.3
        const noise = Math.sin(i * 0.6) * 8
        const y = trend + pullback + volatility + noise
        points.push(y)
      }
      return points
    },
  },
  {
    id: 'dynamic-cycle',
    name: 'Dynamic Cycle',
    description:
      'A living simulation that cycles through the four market states: calm → storm → directional chaos → mature trend → calm.',
    color: '#a78bfa', // purple accent
    // Not used directly; dynamic points are computed in the component
    generatePoints: (totalPoints: number) => {
      const points: number[] = []
      for (let i = 0; i < totalPoints; i++) {
        points.push(CHART_HEIGHT / 2)
      }
      return points
    },
  },
]

const MarketStatesVisualizer: React.FC = () => {
  const [currentState, setCurrentState] = useState<MarketState>('stable-quiet')
  const [isPlaying, setIsPlaying] = useState(false)
  const [playbackPosition, setPlaybackPosition] = useState(0)
  const [cycleProgress, setCycleProgress] = useState(0) // 0..100 (%), only used for dynamic-cycle

  // Auto-play only moves the playback position; the line itself is static per state
  useEffect(() => {
    if (!isPlaying) return
    const id = setInterval(() => {
      setPlaybackPosition((prev) => {
        const next = prev + 0.6 // speed
        return next >= 100 ? 0 : next
      })
      // For dynamic cycle, also advance the morphing progress
      setCycleProgress((prev) => {
        // Slightly slower morph speed than the dot
        const next = prev + 0.35
        return next >= 100 ? 0 : next
      })
    }, 50)
    return () => clearInterval(id)
  }, [isPlaying])

  const currentStateConfig = MARKET_STATES.find((s) => s.id === currentState)!

  // Precompute static shapes for the four canonical states
  const baseShapes = React.useMemo(() => {
    const get = (id: MarketState) =>
      MARKET_STATES.find((s) => s.id === id)!.generatePoints(TOTAL_POINTS)
    return {
      stableQuiet: get('stable-quiet'),
      stableVolatile: get('stable-volatile'),
      trendingVolatile: get('trending-volatile'),
      trendingQuiet: get('trending-quiet'),
    }
  }, [])

  // Utility to blend two shapes
  const blendShapes = (a: number[], b: number[], t: number) => {
    const out: number[] = new Array(Math.min(a.length, b.length))
    for (let i = 0; i < out.length; i++) {
      out[i] = a[i] + (b[i] - a[i]) * t
    }
    return out
  }

  // Compute dynamic cycle shape by morphing through the 4 states in order
  const dynamicPointsAndColor = React.useMemo(() => {
    const progress = (cycleProgress % 100) / 100 // 0..1
    const segment = Math.floor(progress * 4) // 0..3
    const localT = progress * 4 - segment // 0..1 within segment

    switch (segment) {
      case 0:
        return {
          points: blendShapes(
            baseShapes.stableQuiet,
            baseShapes.stableVolatile,
            localT,
          ),
          color: MARKET_STATES.find((s) => s.id === 'stable-volatile')!.color,
          label: 'Calm → Storm (Stable & Quiet → Stable & Volatile)',
        }
      case 1:
        return {
          points: blendShapes(
            baseShapes.stableVolatile,
            baseShapes.trendingVolatile,
            localT,
          ),
          color: MARKET_STATES.find((s) => s.id === 'trending-volatile')!.color,
          label:
            'Storm Finds Direction (Stable & Volatile → Trending & Volatile)',
        }
      case 2:
        return {
          points: blendShapes(
            baseShapes.trendingVolatile,
            baseShapes.trendingQuiet,
            localT,
          ),
          color: MARKET_STATES.find((s) => s.id === 'trending-quiet')!.color,
          label: 'Trend Matures (Trending & Volatile → Trending & Quiet)',
        }
      default:
        return {
          points: blendShapes(
            baseShapes.trendingQuiet,
            baseShapes.stableQuiet,
            localT,
          ),
          color: MARKET_STATES.find((s) => s.id === 'stable-quiet')!.color,
          label: 'Exhaustion and Reset (Trending & Quiet → Stable & Quiet)',
        }
    }
  }, [cycleProgress, baseShapes])

  const usingDynamic = currentState === 'dynamic-cycle'
  const currentPoints = usingDynamic
    ? dynamicPointsAndColor.points
    : currentStateConfig.generatePoints(TOTAL_POINTS)
  const lineColor = usingDynamic
    ? dynamicPointsAndColor.color
    : currentStateConfig.color

  // Convert points to SVG path
  const pathData = currentPoints
    .map((y, i) => {
      const x = (i / TOTAL_POINTS) * (CHART_WIDTH - PADDING * 2) + PADDING
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`
    })
    .join(' ')

  const handleStateChange = (newState: MarketState) => {
    setCurrentState(newState)
  }

  const handleSliderChange = (value: number[]) => {
    setPlaybackPosition(value[0])
    setIsPlaying(false)
  }

  const resetToStart = () => {
    setPlaybackPosition(0)
    setIsPlaying(false)
  }

  return (
    <div className="w-full h-full flex flex-col p-6 gap-4 overflow-y-auto">
      {/* Header */}
      <div className="text-center mb-2">
        <h3 className="text-lg font-semibold text-white mb-1">
          The Four Market States
        </h3>
        <p className="text-xs text-muted-foreground">
          Explore how different market conditions affect price behavior
        </p>
      </div>

      {/* State Selection Buttons */}
      <div className="grid grid-cols-2 gap-2">
        {MARKET_STATES.map((state) => (
          <button
            key={state.id}
            onClick={() => handleStateChange(state.id)}
            className={`p-3 rounded-lg border-2 transition-all text-left ${
              currentState === state.id
                ? 'border-white bg-white/10'
                : 'border-gray-700 bg-gray-800/30 hover:border-gray-600'
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: state.color }}
              />
              <span className="text-sm font-medium text-white">
                {state.name}
              </span>
            </div>
            <p className="text-xs text-muted-foreground line-clamp-2">
              {state.description}
            </p>
          </button>
        ))}
      </div>

      {/* Chart Visualization */}
      <div className="flex-1 relative bg-gray-900/50 rounded-lg border border-gray-700/50 p-4 min-h-0">
        <svg
          width={CHART_WIDTH}
          height={CHART_HEIGHT}
          className="w-full h-full"
          viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Grid lines */}
          <defs>
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={lineColor} stopOpacity="0.8" />
              <stop offset="100%" stopColor={lineColor} stopOpacity="0.4" />
            </linearGradient>
          </defs>

          {/* Horizontal grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
            <line
              key={`h-${ratio}`}
              x1={PADDING}
              y1={ratio * (CHART_HEIGHT - PADDING * 2) + PADDING}
              x2={CHART_WIDTH - PADDING}
              y2={ratio * (CHART_HEIGHT - PADDING * 2) + PADDING}
              stroke="#374151"
              strokeWidth="1"
              strokeDasharray="4 4"
            />
          ))}

          {/* Vertical grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
            <line
              key={`v-${ratio}`}
              x1={ratio * (CHART_WIDTH - PADDING * 2) + PADDING}
              y1={PADDING}
              x2={ratio * (CHART_WIDTH - PADDING * 2) + PADDING}
              y2={CHART_HEIGHT - PADDING}
              stroke="#374151"
              strokeWidth="1"
              strokeDasharray="4 4"
            />
          ))}

          {/* Chart line */}
          <motion.path
            d={pathData}
            fill="none"
            stroke={`url(#lineGradient)`}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={false}
            animate={{ d: pathData }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
          />

          {/* Playback indicator */}
          {(isPlaying || playbackPosition > 0) &&
            (() => {
              const ratio = playbackPosition / 100
              const floatIndex = ratio * (TOTAL_POINTS - 1)
              const baseIndex = Math.floor(floatIndex)
              const t = Math.min(Math.max(floatIndex - baseIndex, 0), 1)
              const dotX = PADDING + ratio * (CHART_WIDTH - PADDING * 2)
              const y0 = currentPoints[baseIndex] ?? currentPoints[0]
              const y1 =
                currentPoints[Math.min(baseIndex + 1, TOTAL_POINTS - 1)] ??
                currentPoints[currentPoints.length - 1]
              const dotY = y0 + (y1 - y0) * t
              return (
                <motion.circle
                  cx={dotX}
                  cy={dotY}
                  r="6"
                  fill={lineColor}
                  initial={false}
                  animate={{
                    cx: dotX,
                    cy: dotY,
                  }}
                  transition={{ duration: isPlaying ? 0.1 : 0 }}
                />
              )
            })()}
        </svg>
      </div>

      {/* Current State Info */}
      <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700/50">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h4 className="text-sm font-semibold text-white flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: lineColor }}
              />
              {usingDynamic
                ? `${currentStateConfig.name} — ${dynamicPointsAndColor.label}`
                : currentStateConfig.name}
            </h4>
            <p className="text-xs text-muted-foreground mt-1">
              {usingDynamic
                ? 'Weather: calm sky → thunderstorm → strong wind → clearing. This cycle teaches rhythm: tension → release → expansion → consolidation.'
                : currentStateConfig.description}
            </p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="space-y-4">
        {/* Playback Controls */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => setIsPlaying(!isPlaying)}
            variant={isPlaying ? 'default' : 'secondary'}
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4 mr-2" />
                Pause
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Play
              </>
            )}
          </Button>
          <Button size="sm" variant="outline" onClick={resetToStart}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
          <div className="flex-1" />
        </div>

        {/* Timeline Slider */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <Label className="text-xs text-muted-foreground">
              Timeline Scrubber
            </Label>
            <span className="text-xs text-muted-foreground tabular-nums">
              {Math.round(playbackPosition)}%
            </span>
          </div>
          <Slider
            value={[playbackPosition]}
            min={0}
            max={100}
            step={0.1}
            onValueChange={handleSliderChange}
            className="w-full"
          />
        </div>
      </div>
    </div>
  )
}

export default MarketStatesVisualizer
