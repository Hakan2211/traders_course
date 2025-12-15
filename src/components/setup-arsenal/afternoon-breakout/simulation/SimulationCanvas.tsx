import React, { useEffect, useRef, useState } from 'react'
import { SimulationMode } from './types'
import { RefreshCw } from 'lucide-react'
import type p5 from 'p5'

interface SimulationCanvasProps {
  mode: SimulationMode
}

const SimulationCanvas: React.FC<SimulationCanvasProps> = ({ mode }) => {
  const canvasRef = useRef<HTMLDivElement>(null)
  const p5Instance = useRef<p5 | null>(null)
  const [phase, setPhase] = useState<string>('Initializing')
  const [energyLevel, setEnergyLevel] = useState<number>(0)

  // Restart logic trigger
  const [resetKey, setResetKey] = useState(0)

  useEffect(() => {
    if (!canvasRef.current) return

    // Cleanup previous instance
    if (p5Instance.current) {
      p5Instance.current.remove()
      p5Instance.current = null
    }

    // Dynamically import p5
    import('p5')
      .then((p5Module) => {
        const p5 = p5Module.default
        if (!canvasRef.current || p5Instance.current) return

        const sketch = (p: p5) => {
          let particles: any[] = []
          const numParticles = 40

          // Simulation State
          let ceilingY = 50
          let floorY = 350 // Fixed VWAP level
          let isCeilingBroken = false
          let isFloorBroken = false
          let wallLeft = 50
          let wallRight = 550

          // Fade specific
          let gravity = 0.15

          // Breakout specific
          let compressionRate = 0.2 // Speed ceiling lowers

          class Particle {
            pos: any
            vel: any
            radius: number

            constructor(x: number, y: number) {
              this.pos = p.createVector(x, y)
              // Initial velocity depends on mode
              if (mode === 'breakout') {
                this.vel = p
                  .createVector(p.random(-1, 1), p.random(-1, 1))
                  .mult(p.random(3, 5))
              } else {
                this.vel = p.createVector(p.random(-2, 2), p.random(-8, -15)) // High initial upward vel
              }
              this.radius = p.random(6, 10)
            }

            update() {
              if (mode === 'fade') {
                this.vel.y += gravity
              }

              this.pos.add(this.vel)

              // Friction/Air resistance slightly
              if (mode === 'fade') {
                this.vel.mult(0.995)
              }
            }

            checkEdges() {
              // Left Wall
              if (this.pos.x < wallLeft + this.radius) {
                this.pos.x = wallLeft + this.radius
                this.vel.x *= -1
              }
              // Right Wall
              if (this.pos.x > wallRight - this.radius) {
                this.pos.x = wallRight - this.radius
                this.vel.x *= -1
              }

              // Floor Logic
              if (!isFloorBroken) {
                if (this.pos.y > floorY - this.radius) {
                  this.pos.y = floorY - this.radius

                  if (mode === 'breakout') {
                    this.vel.y *= -1 // Elastic bounce
                  } else {
                    this.vel.y *= -0.65 // Damping (losing energy)
                    // Prevent endless micro-bouncing
                    if (Math.abs(this.vel.y) < 1) this.vel.y = 0
                  }
                }
              }

              // Ceiling Logic
              if (!isCeilingBroken) {
                if (this.pos.y < ceilingY + this.radius) {
                  if (mode === 'breakout') {
                    this.pos.y = ceilingY + this.radius
                    this.vel.y *= -1
                    // Add kinetic energy on bounce in breakout mode (Heat up)
                    this.vel.mult(1.02)
                  } else {
                    // Open ceiling for fade mode, but if they go too high, just let them
                  }
                }
              }
            }

            display(energyRatio: number) {
              p.noStroke()

              let c
              if (mode === 'breakout') {
                // Blue (Cool) -> Yellow (Hot) -> White (Explosive)
                const lowColor = p.color(59, 130, 246) // Blue-500
                const midColor = p.color(234, 179, 8) // Yellow-500
                const highColor = p.color(255, 255, 255) // White

                if (energyRatio < 0.5) {
                  c = p.lerpColor(lowColor, midColor, energyRatio * 2)
                } else {
                  c = p.lerpColor(midColor, highColor, (energyRatio - 0.5) * 2)
                }
              } else {
                // Orange (Active) -> Gray (Dead)
                const activeColor = p.color(249, 115, 22) // Orange-500
                const deadColor = p.color(71, 85, 105) // Slate-600

                // In fade mode, energyRatio is basically velocity/initialVelocity
                // We want 1.0 -> Orange, 0.0 -> Gray
                c = p.lerpColor(deadColor, activeColor, energyRatio)
              }

              p.fill(c)
              p.ellipse(this.pos.x, this.pos.y, this.radius * 2)

              // Glow effect
              if (mode === 'breakout' && energyRatio > 0.6) {
                const ctx = p.drawingContext as CanvasRenderingContext2D
                ctx.shadowBlur = 15
                ctx.shadowColor = c.toString()
              } else {
                const ctx = p.drawingContext as CanvasRenderingContext2D
                ctx.shadowBlur = 0
              }
            }
          }

          p.setup = () => {
            // Create canvas slightly smaller than parent container width usually
            const c = p.createCanvas(600, 400)
            c.parent(canvasRef.current!)

            // Initialize Particles
            for (let i = 0; i < numParticles; i++) {
              particles.push(
                new Particle(
                  p.random(wallLeft + 20, wallRight - 20),
                  p.random(150, 300),
                ),
              )
            }

            // Reset state variables
            ceilingY = mode === 'breakout' ? 100 : -1000 // High up or irrelevant for fade
            floorY = 350
            isCeilingBroken = false
            isFloorBroken = false

            p.frameRate(60)
          }

          p.draw = () => {
            p.background(15, 23, 42) // slate-950

            // Draw Walls
            p.stroke(30, 41, 59) // slate-800
            p.strokeWeight(2)
            p.line(wallLeft, 0, wallLeft, 400)
            p.line(wallRight, 0, wallRight, 400)

            // Draw VWAP Floor
            if (!isFloorBroken) {
              p.stroke(
                mode === 'breakout' ? 59 : 239,
                mode === 'breakout' ? 130 : 68,
                mode === 'breakout' ? 246 : 68,
              ) // Blue or Red tint
              p.strokeWeight(4)
              p.line(wallLeft, floorY, wallRight, floorY)

              p.noStroke()
              p.fill(148, 163, 184)
              p.textSize(12)
              p.text('VWAP / Support', wallLeft + 10, floorY - 10)
            } else {
              // Broken floor fragments
              p.stroke(239, 68, 68, 100)
              p.strokeWeight(2)
              p.line(wallLeft, floorY, wallLeft + 100, floorY + 20)
              p.line(wallRight - 100, floorY - 20, wallRight, floorY)
            }

            // Draw Ceiling (Breakout Mode Only)
            if (mode === 'breakout') {
              if (!isCeilingBroken) {
                p.stroke(234, 179, 8) // Yellow
                p.strokeWeight(4)
                p.line(wallLeft, ceilingY, wallRight, ceilingY)

                p.noStroke()
                p.fill(234, 179, 8)
                p.textSize(12)
                p.text('Resistance / Sell Wall', wallLeft + 10, ceilingY + 20)

                // Move Ceiling Down (Compression)
                if (ceilingY < floorY - 60) {
                  // Keep some gap
                  ceilingY += compressionRate
                  setPhase('Compression Phase')
                } else {
                  // SQUEEZE TRIGGER
                  isCeilingBroken = true
                  setPhase('EXPLOSION / BREAKOUT')
                }

                // Draw visual pressure arrows
                p.stroke(234, 179, 8, 100)
                p.strokeWeight(2)
                const arrowX = 300
                p.line(arrowX, ceilingY - 20, arrowX, ceilingY - 5)
                p.line(arrowX - 5, ceilingY - 10, arrowX, ceilingY - 5)
                p.line(arrowX + 5, ceilingY - 10, arrowX, ceilingY - 5)
              } else {
                // Broken Ceiling
                setPhase('EXPLOSION / BREAKOUT')
              }
            }

            // Fade Logic Check
            if (mode === 'fade') {
              // Calculate total energy
              let totalVel = 0
              particles.forEach((pt) => (totalVel += Math.abs(pt.vel.y)))
              const avgVel = totalVel / particles.length

              if (avgVel < 0.5 && !isFloorBroken) {
                // Give it a moment before breaking
                if (p.frameCount % 120 === 0) {
                  isFloorBroken = true
                  setPhase('FLOOR BREAK / DUMP')
                } else {
                  setPhase('Energy Exhaustion')
                }
              } else if (!isFloorBroken) {
                setPhase('Deterioration (Bouncing Ball)')
              }
            }

            // Update and Draw Particles
            let totalEnergy = 0
            particles.forEach((pt) => {
              pt.checkEdges()
              pt.update()

              let ratio = 0
              if (mode === 'breakout') {
                // Map velocity to ratio
                const speed = pt.vel.mag()
                ratio = p.map(speed, 3, 15, 0, 1)
                totalEnergy += speed
              } else {
                // Map y-velocity to life
                const speed = Math.abs(pt.vel.y)
                ratio = p.map(speed, 0, 8, 0, 1)
                totalEnergy += speed
              }

              pt.display(p.constrain(ratio, 0, 1))
            })

            // Update React State for Stats (throttled)
            if (p.frameCount % 10 === 0) {
              setEnergyLevel(Math.floor(totalEnergy))
            }
          }
        }

        if (canvasRef.current) {
          p5Instance.current = new p5(sketch, canvasRef.current)
        }
      })
      .catch((error) => {
        console.error('Failed to load p5.js:', error)
      })

    return () => {
      if (p5Instance.current) {
        p5Instance.current.remove()
        p5Instance.current = null
      }
    }
  }, [mode, resetKey])

  const handleRestart = () => {
    setResetKey((prev) => prev + 1)
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative rounded-xl overflow-hidden shadow-2xl border border-slate-700 bg-slate-900">
        <div ref={canvasRef} />

        {/* Overlay Stats */}
        <div className="absolute top-4 right-4 bg-slate-900/80 backdrop-blur border border-slate-700 p-3 rounded-lg text-xs font-mono">
          <div className="flex justify-between gap-4 mb-1">
            <span className="text-slate-400">Phase:</span>
            <span
              className={`font-bold ${
                phase.includes('EXPLOSION')
                  ? 'text-green-400 animate-pulse'
                  : phase.includes('DUMP')
                    ? 'text-red-500 animate-pulse'
                    : 'text-blue-300'
              }`}
            >
              {phase}
            </span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-slate-400">System Energy:</span>
            <div className="w-20 h-3 bg-slate-800 rounded-full overflow-hidden mt-0.5">
              <div
                className={`h-full transition-all duration-300 ${
                  mode === 'breakout' ? 'bg-yellow-500' : 'bg-orange-500'
                }`}
                style={{ width: `${Math.min(energyLevel / 2, 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Restart Overlay Button (Visible when phase is terminal) */}
        {(phase.includes('EXPLOSION') ||
          phase.includes('Dump') ||
          phase.includes('DUMP')) && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 pointer-events-none">
            {/* Just visual feedback, the controls are outside */}
          </div>
        )}
      </div>
      <div className="flex gap-4">
        <button
          onClick={handleRestart}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors text-sm font-medium border border-slate-700"
        >
          <RefreshCw size={16} />
          Reset Simulation
        </button>
      </div>
    </div>
  )
}

export default SimulationCanvas
