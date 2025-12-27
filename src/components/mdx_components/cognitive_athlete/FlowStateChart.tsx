'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'

export function FlowStateChart() {
  const [hoveredZone, setHoveredZone] = useState<string | null>(null)

  // SVG dimensions
  const width = 600
  const height = 400
  const padding = 60

  // Plotting area
  const graphWidth = width - padding * 2
  const graphHeight = height - padding * 2

  // Zone definitions
  // Flow Channel is a diagonal strip
  // We'll define it as a polygon.
  // Let's say flow channel width is roughly 20% of the graph width/height diagonal

  const flowOffset = 60 // How wide the channel is

  // Coordinates (0,0 is top-left of SVG, but we want graph origin at bottom-left)
  // To map graph coordinates (x,y) to SVG:
  // svgX = padding + x
  // svgY = height - padding - y

  const toSvg = (x: number, y: number) => ({
    x: padding + x,
    y: height - padding - y,
  })

  // Points for zones

  // Flow Channel
  // Starts at (0, 0) roughly, goes to (max, max)
  // Let's make it start a bit up the Y axis and end a bit right on X axis to show the channel

  // Anxiety Zone (Top Left)
  // Polygon: Top-Left corner, down to channel top edge, up to top right?
  // Actually simpler:
  // Anxiety is area ABOVE the flow channel.
  // Boredom is area BELOW the flow channel.

  // Let's define the lines for the channel.
  // Center line: y = x (normalized)
  // Upper bound: y = x + offset
  // Lower bound: y = x - offset

  // Normalized to graph dimensions:
  // Let's use 0-100 scale for ease, then scale to graphWidth/Height

  // Vertices for Flow Channel (Polygon)
  const flowPoints = [
    toSvg(0, 0), // Start bottom-left
    toSvg(0, 80), // slightly up Y
    toSvg(graphWidth - 80, graphHeight), // Top edge
    toSvg(graphWidth, graphHeight), // Top right
    toSvg(graphWidth, graphHeight - 80),
    toSvg(80, 0),
  ]
    .map((p) => `${p.x},${p.y}`)
    .join(' ')

  // Vertices for Anxiety Zone (Top Left)
  const anxietyPoints = [
    toSvg(0, 80),
    toSvg(0, graphHeight),
    toSvg(graphWidth, graphHeight),
    toSvg(graphWidth - 80, graphHeight),
  ]
    .map((p) => `${p.x},${p.y}`)
    .join(' ')

  // Vertices for Boredom Zone (Bottom Right)
  const boredomPoints = [
    toSvg(80, 0),
    toSvg(graphWidth, 0),
    toSvg(graphWidth, graphHeight - 80),
  ]
    .map((p) => `${p.x},${p.y}`)
    .join(' ')

  return (
    <Card className="w-full max-w-3xl mx-auto my-8 border-2 border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">
          The Flow Channel
        </CardTitle>
        <CardDescription className="text-center">
          Balancing Challenge (Anxiety) vs. Skill (Boredom)
        </CardDescription>
      </CardHeader>
      <CardContent className="flex justify-center p-4">
        <div className="relative w-full max-w-[600px] aspect-[3/2]">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-full overflow-visible"
          >
            {/* Defs for gradients */}
            <defs>
              <linearGradient id="anxietyGradient" x1="0" y1="1" x2="1" y2="0">
                <stop offset="0%" stopColor="rgba(239, 68, 68, 0.4)" />
                <stop offset="100%" stopColor="rgba(239, 68, 68, 0.1)" />
              </linearGradient>
              <linearGradient id="boredomGradient" x1="0" y1="1" x2="1" y2="0">
                <stop offset="0%" stopColor="rgba(59, 130, 246, 0.1)" />
                <stop offset="100%" stopColor="rgba(59, 130, 246, 0.4)" />
              </linearGradient>
              <linearGradient id="flowGradient" x1="0" y1="1" x2="1" y2="0">
                <stop offset="0%" stopColor="rgba(16, 185, 129, 0.4)" />
                <stop offset="50%" stopColor="rgba(16, 185, 129, 0.6)" />
                <stop offset="100%" stopColor="rgba(16, 185, 129, 0.4)" />
              </linearGradient>
            </defs>

            {/* Axes */}
            <line
              x1={padding}
              y1={height - padding}
              x2={width - padding / 2}
              y2={height - padding}
              stroke="currentColor"
              strokeWidth="2"
              markerEnd="url(#arrowhead)"
              className="text-muted-foreground"
            />
            <line
              x1={padding}
              y1={height - padding}
              x2={padding}
              y2={padding / 2}
              stroke="currentColor"
              strokeWidth="2"
              markerEnd="url(#arrowhead)"
              className="text-muted-foreground"
            />

            {/* Arrowhead definition */}
            <defs>
              <marker
                id="arrowhead"
                markerWidth="10"
                markerHeight="7"
                refX="9"
                refY="3.5"
                orient="auto"
              >
                <polygon
                  points="0 0, 10 3.5, 0 7"
                  fill="currentColor"
                  className="text-muted-foreground"
                />
              </marker>
            </defs>

            {/* Labels */}
            <text
              x={width / 2}
              y={height - 10}
              textAnchor="middle"
              className="fill-foreground font-semibold text-sm"
            >
              SKILL LEVEL →
            </text>
            <text
              x={20}
              y={height / 2}
              textAnchor="middle"
              transform={`rotate(-90, 20, ${height / 2})`}
              className="fill-foreground font-semibold text-sm"
            >
              CHALLENGE / ANXIETY →
            </text>

            {/* Zones */}

            {/* Anxiety Zone */}
            <motion.path
              d={`M ${anxietyPoints} Z`}
              fill="url(#anxietyGradient)"
              stroke="rgb(239, 68, 68)"
              strokeWidth="1"
              initial={{ opacity: 0.8 }}
              whileHover={{ opacity: 1, scale: 1.01 }}
              onHoverStart={() => setHoveredZone('anxiety')}
              onHoverEnd={() => setHoveredZone(null)}
              className="cursor-pointer transition-all duration-300"
            />
            <text
              x={padding + graphWidth * 0.25}
              y={padding + graphHeight * 0.2}
              className="fill-red-500 font-bold text-sm pointer-events-none"
            >
              ANXIETY
            </text>
            <text
              x={padding + graphWidth * 0.25}
              y={padding + graphHeight * 0.2 + 20}
              className="fill-red-400 text-xs pointer-events-none"
            >
              (Too Hard)
            </text>

            {/* Boredom Zone */}
            <motion.path
              d={`M ${boredomPoints} Z`}
              fill="url(#boredomGradient)"
              stroke="rgb(59, 130, 246)"
              strokeWidth="1"
              initial={{ opacity: 0.8 }}
              whileHover={{ opacity: 1, scale: 1.01 }}
              onHoverStart={() => setHoveredZone('boredom')}
              onHoverEnd={() => setHoveredZone(null)}
              className="cursor-pointer transition-all duration-300"
            />
            <text
              x={padding + graphWidth * 0.75}
              y={height - padding - graphHeight * 0.2}
              textAnchor="end"
              className="fill-blue-500 font-bold text-sm pointer-events-none"
            >
              BOREDOM
            </text>
            <text
              x={padding + graphWidth * 0.75}
              y={height - padding - graphHeight * 0.2 + 20}
              textAnchor="end"
              className="fill-blue-400 text-xs pointer-events-none"
            >
              (Too Easy)
            </text>

            {/* Flow Channel */}
            <motion.path
              d={`M ${flowPoints} Z`}
              fill="url(#flowGradient)"
              stroke="rgb(16, 185, 129)"
              strokeWidth="2"
              initial={{ opacity: 0.9 }}
              whileHover={{ opacity: 1, scale: 1.02 }}
              onHoverStart={() => setHoveredZone('flow')}
              onHoverEnd={() => setHoveredZone(null)}
              className="cursor-pointer transition-all duration-300 shadow-lg"
            />
            <text
              x={width / 2}
              y={height / 2}
              textAnchor="middle"
              className="fill-white font-bold text-lg drop-shadow-md pointer-events-none"
            >
              FLOW CHANNEL
            </text>
            <text
              x={width / 2}
              y={height / 2 + 25}
              textAnchor="middle"
              className="fill-white/90 text-sm drop-shadow-md pointer-events-none"
            >
              (The Sweet Spot)
            </text>
          </svg>

          {/* Tooltip Overlay */}
          {hoveredZone && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute top-4 right-4 bg-background/90 backdrop-blur border border-border p-3 rounded-lg shadow-xl max-w-[200px]"
            >
              {hoveredZone === 'anxiety' && (
                <>
                  <h4 className="font-bold text-red-500 mb-1">Anxiety Zone</h4>
                  <p className="text-xs text-muted-foreground">
                    High Challenge, Low Skill. The task overwhelms your current
                    abilities, leading to stress and freeze response.
                  </p>
                </>
              )}
              {hoveredZone === 'boredom' && (
                <>
                  <h4 className="font-bold text-blue-500 mb-1">Boredom Zone</h4>
                  <p className="text-xs text-muted-foreground">
                    Low Challenge, High Skill. Your abilities exceed the task
                    demands, leading to disinterest and auto-pilot.
                  </p>
                </>
              )}
              {hoveredZone === 'flow' && (
                <>
                  <h4 className="font-bold text-emerald-500 mb-1">
                    Flow Channel
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Optimal Match. Challenge slightly exceeds skill, demanding
                    total focus and triggering peak performance.
                  </p>
                </>
              )}
            </motion.div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default FlowStateChart
