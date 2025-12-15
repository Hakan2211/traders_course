
import React, { useRef, useEffect } from 'react';
import Sketch from 'react-p5';
import p5Types from 'p5';
import EnvironmentWrapper from '@/components/mdx_components/2d_environment/environmentWrapper';

// Particle Class definition for physics simulation
class Particle {
  pos: p5Types.Vector;
  vel: p5Types.Vector;
  acc: p5Types.Vector;
  maxSpeed: number;
  p5: p5Types;

  constructor(p5: p5Types, anchorY: number) {
    this.p5 = p5;
    // Initialize random position
    this.pos = p5.createVector(p5.random(p5.width), anchorY);
    this.vel = p5.createVector(0, 0);
    this.acc = p5.createVector(0, 0);
    this.maxSpeed = 12; // Increased max speed for responsiveness
  }

  applyForce(force: p5Types.Vector) {
    this.acc.add(force);
  }

  attract(targetY: number) {
    // The "Magnet" Logic (Spring force / Mean Reversion)
    const dir = targetY - this.pos.y;
    const force = dir * 0.02; // Slightly weaker magnet to allow further excursion
    this.acc.y += force;

    // Add friction to simulate market liquidity/resistance
    this.vel.mult(0.96); // Less friction (0.95 -> 0.96)
  }

  update() {
    this.vel.add(this.acc);
    // Limit speed to prevent particles from flying off screen too wildly
    this.vel.limit(this.maxSpeed);
    this.pos.add(this.vel);

    // Boundary checks (bounce off walls horizontally)
    if (this.pos.x < 0) {
      this.pos.x = 0;
      this.vel.x *= -1;
    } else if (this.pos.x > this.p5.width) {
      this.pos.x = this.p5.width;
      this.vel.x *= -1;
    }

    // Reset acceleration each frame
    this.acc.mult(0);
  }

  display() {
    // Color logic:
    // Red = Overextended (Far from VWAP)
    // Green = Equilibrium (Near VWAP)
    const dist = Math.abs(this.pos.y - this.p5.height / 2);
    const threshold = 60; // Distance to be considered "extended"

    this.p5.noStroke();

    if (dist > threshold) {
      // Reddish/Orange for extended
      this.p5.fill(248, 113, 113, 200);
    } else {
      // Emerald Green for value area
      this.p5.fill(52, 211, 153, 200);
    }

    // Draw particle
    this.p5.ellipse(this.pos.x, this.pos.y, 8, 8);
  }
}

const VwapMagnetSimulation: React.FC = () => {
  const particles = useRef<Particle[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  const setup = (p5: p5Types, canvasParentRef: Element) => {
    // Use the container's dimensions
    const width = containerRef.current?.clientWidth || 600;
    const height = containerRef.current?.clientHeight || 400;

    p5.createCanvas(width, height).parent(canvasParentRef);

    // Center VWAP vertically
    const vwapY = height / 2;

    // Initialize particles
    particles.current = [];
    for (let i = 0; i < 300; i++) {
      particles.current.push(new Particle(p5, vwapY));
    }
  };

  const draw = (p5: p5Types) => {
    // Clear background to let the EnvironmentWrapper gradient show through
    // Or use a semi-transparent fill for a trail effect, but clean is better for this wrapper
    p5.clear();

    const vwapY = p5.height / 2;

    // Draw VWAP Line (The Anchor)
    p5.stroke(250, 204, 21); // Tailwind yellow-400
    p5.strokeWeight(2);
    // Dashed line effect manually or just solid
    p5.drawingContext.setLineDash([5, 5]);
    p5.line(0, vwapY, p5.width, vwapY);
    p5.drawingContext.setLineDash([]); // Reset

    p5.noStroke();
    p5.fill(250, 204, 21);
    p5.textSize(12);
    p5.textAlign(p5.LEFT);
    p5.text('VWAP (Equilibrium)', 10, vwapY - 10);

    // Update and draw particles
    particles.current.forEach((p) => {
      p.attract(vwapY); // Apply magnetic force
      p.update();
      p.display();
    });

    // Draw Interaction Hint
    p5.fill(255, 255, 255, 180);
    p5.textAlign(p5.CENTER);
    p5.textSize(14);
    p5.text(
      "CLICK anywhere to simulate 'News Catalyst' (Volatility)",
      p5.width / 2,
      p5.height - 20
    );
  };

  const mousePressed = (p5: p5Types) => {
    // Only interact if mouse is inside canvas
    if (
      p5.mouseX > 0 &&
      p5.mouseX < p5.width &&
      p5.mouseY > 0 &&
      p5.mouseY < p5.height
    ) {
      // Apply explosive force away from mouse
      particles.current.forEach((p) => {
        // Calculate vector from mouse to particle
        const mouseVec = p5.createVector(p5.mouseX, p5.mouseY);
        const dir = p5Types.Vector.sub(p.pos, mouseVec);

        // Inverse square law or simple distance based force?
        // Simple strong push is better for "explosion" feel
        const dist = dir.mag();
        dir.normalize();

        // Stronger force if closer to mouse
        const forceMagnitude = 45; // Significantly stronger force (25 -> 45)
        dir.mult(forceMagnitude);

        // Add some randomness for chaos
        dir.rotate(p5.random(-0.5, 0.5));

        p.applyForce(dir);
      });
    }
  };

  const windowResized = (p5: p5Types) => {
    if (containerRef.current) {
      p5.resizeCanvas(
        containerRef.current.clientWidth,
        containerRef.current.clientHeight
      );
      // Re-center VWAP logic if needed (particles might jump, but that's okay)
    }
  };

  return (
    <div ref={containerRef} className="w-full">
      <EnvironmentWrapper height="400px">
        <Sketch
          setup={setup}
          draw={draw}
          mousePressed={mousePressed}
          windowResized={windowResized}
        />
      </EnvironmentWrapper>
    </div>
  );
};

export default VwapMagnetSimulation;
