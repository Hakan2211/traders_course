import React, { useRef, useCallback } from 'react'
import type p5 from 'p5'
import P5Sketch from '@/components/mdx_components/2d_environment/p5Sketch/p5SketchContainer'
import EnvironmentWrapper from '@/components/mdx_components/2d_environment/environmentWrapper'

// Particle Class definition for physics simulation
class Particle {
  pos: p5.Vector
  vel: p5.Vector
  acc: p5.Vector
  maxSpeed: number
  p5: p5

  constructor(p5: p5, anchorY: number) {
    this.p5 = p5
    // Initialize random position
    this.pos = p5.createVector(p5.random(p5.width), anchorY)
    this.vel = p5.createVector(0, 0)
    this.acc = p5.createVector(0, 0)
    this.maxSpeed = 12 // Increased max speed for responsiveness
  }

  applyForce(force: p5.Vector) {
    this.acc.add(force)
  }

  attract(targetY: number) {
    // The "Magnet" Logic (Spring force / Mean Reversion)
    const dir = targetY - this.pos.y
    const force = dir * 0.02 // Slightly weaker magnet to allow further excursion
    this.acc.y += force

    // Add friction to simulate market liquidity/resistance
    this.vel.mult(0.96) // Less friction (0.95 -> 0.96)
  }

  update() {
    this.vel.add(this.acc)
    // Limit speed to prevent particles from flying off screen too wildly
    this.vel.limit(this.maxSpeed)
    this.pos.add(this.vel)

    // Boundary checks (bounce off walls horizontally)
    if (this.pos.x < 0) {
      this.pos.x = 0
      this.vel.x *= -1
    } else if (this.pos.x > this.p5.width) {
      this.pos.x = this.p5.width
      this.vel.x *= -1
    }

    // Reset acceleration each frame
    this.acc.mult(0)
  }

  display() {
    // Color logic:
    // Red = Overextended (Far from VWAP)
    // Green = Equilibrium (Near VWAP)
    const dist = Math.abs(this.pos.y - this.p5.height / 2)
    const threshold = 60 // Distance to be considered "extended"

    this.p5.noStroke()

    if (dist > threshold) {
      // Reddish/Orange for extended
      this.p5.fill(248, 113, 113, 200)
    } else {
      // Emerald Green for value area
      this.p5.fill(52, 211, 153, 200)
    }

    // Draw particle
    this.p5.ellipse(this.pos.x, this.pos.y, 8, 8)
  }
}

const VwapMagnetSimulation: React.FC = () => {
  const particles = useRef<Particle[]>([])

  const sketch = useCallback((p: p5, parentEl: HTMLDivElement) => {
    // Get dimensions from parent element
    const width = parentEl.clientWidth || 600
    const height = parentEl.clientHeight || 400

    p.setup = () => {
      p.createCanvas(width, height)

      // Center VWAP vertically
      const vwapY = height / 2

      // Initialize particles
      particles.current = []
      for (let i = 0; i < 300; i++) {
        particles.current.push(new Particle(p, vwapY))
      }
    }

    p.draw = () => {
      // Clear background to let the EnvironmentWrapper gradient show through
      p.clear()

      const vwapY = p.height / 2

      // Draw VWAP Line (The Anchor)
      p.stroke(250, 204, 21) // Tailwind yellow-400
      p.strokeWeight(2)
      // Dashed line effect manually or just solid
      const ctx = p.drawingContext as CanvasRenderingContext2D
      if (ctx.setLineDash) {
        ctx.setLineDash([5, 5])
        p.line(0, vwapY, p.width, vwapY)
        ctx.setLineDash([]) // Reset
      } else {
        p.line(0, vwapY, p.width, vwapY)
      }

      p.noStroke()
      p.fill(250, 204, 21)
      p.textSize(12)
      p.textAlign(p.LEFT)
      p.text('VWAP (Equilibrium)', 10, vwapY - 10)

      // Update and draw particles
      particles.current.forEach((particle) => {
        particle.attract(vwapY) // Apply magnetic force
        particle.update()
        particle.display()
      })

      // Draw Interaction Hint
      p.fill(255, 255, 255, 180)
      p.textAlign(p.CENTER)
      p.textSize(14)
      p.text(
        "CLICK anywhere to simulate 'News Catalyst' (Volatility)",
        p.width / 2,
        p.height - 20,
      )
    }

    p.mousePressed = () => {
      // Only interact if mouse is inside canvas
      if (
        p.mouseX > 0 &&
        p.mouseX < p.width &&
        p.mouseY > 0 &&
        p.mouseY < p.height
      ) {
        // Apply explosive force away from mouse
        particles.current.forEach((particle) => {
          // Calculate vector from mouse to particle
          const mouseVec = p.createVector(p.mouseX, p.mouseY)
          // Create a copy of particle pos to subtract from (avoid modifying original)
          const dir = particle.pos.copy().sub(mouseVec)

          // Inverse square law or simple distance based force?
          // Simple strong push is better for "explosion" feel
          dir.normalize()

          // Stronger force if closer to mouse
          const forceMagnitude = 45 // Significantly stronger force (25 -> 45)
          dir.mult(forceMagnitude)

          // Add some randomness for chaos
          dir.rotate(p.random(-0.5, 0.5))

          particle.applyForce(dir)
        })
      }
    }

    p.windowResized = () => {
      p.resizeCanvas(parentEl.clientWidth, parentEl.clientHeight)
    }
  }, [])

  return (
    <div className="w-full">
      <EnvironmentWrapper height="400px">
        <P5Sketch sketch={sketch} />
      </EnvironmentWrapper>
    </div>
  )
}

export default VwapMagnetSimulation
