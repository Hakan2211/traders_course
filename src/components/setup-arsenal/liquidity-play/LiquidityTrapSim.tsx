
import React, { useEffect, useRef, useState } from 'react';
import p5 from 'p5';
import { Activity, AlertTriangle, ArrowRightCircle } from 'lucide-react';
import EnvironmentWrapper from '@/components/mdx_components/2d_environment/environmentWrapper';

const LiquidityTrapSim = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const p5Instance = useRef<p5 | null>(null);

  // State for React UI
  const [day, setDay] = useState<1 | 3>(1);
  const [isSqueezing, setIsSqueezing] = useState(false);

  // Refs to pass state into the P5 closure without re-initializing sketch
  const stateRef = useRef({
    day: 1,
    isSqueezing: false,
    pressure: 0,
  });

  // Sync React state to Mutable Ref for P5
  useEffect(() => {
    stateRef.current.day = day;
    stateRef.current.isSqueezing = isSqueezing;
  }, [day, isSqueezing]);

  useEffect(() => {
    if (!containerRef.current) return;

    const sketch = (p: p5) => {
      // Simulation Constants
      const BOX_SIZE = 300;
      const PARTICLE_COUNT = 150;
      const GATE_WIDTH_DAY_1 = 200;
      const GATE_WIDTH_DAY_3 = 20;
      const GRAPH_HEIGHT = 80;

      // Variables
      let particles: Particle[] = [];
      let priceHistory: number[] = [];

      class Particle {
        pos: p5.Vector;
        vel: p5.Vector;
        acc: p5.Vector;
        maxSpeed: number;
        maxForce: number;
        color: p5.Color;

        constructor() {
          // Spawn inside the box randomly
          this.pos = p.createVector(
            p.random(
              p.width / 2 - BOX_SIZE / 2 + 20,
              p.width / 2 + BOX_SIZE / 2 - 20
            ),
            p.random(
              p.height / 2 - BOX_SIZE / 2 + 50,
              p.height / 2 + BOX_SIZE / 2 - 20
            )
          );
          this.vel = p5.Vector.random2D().mult(2);
          this.acc = p.createVector(0, 0);
          this.maxSpeed = 4;
          this.maxForce = 0.2;
          this.color = p.color(255, 80, 80, 200); // Red (Shorts)
        }

        applyForce(force: p5.Vector) {
          this.acc.add(force);
        }

        behaviors(currentGateWidth: number) {
          const { isSqueezing } = stateRef.current;

          if (isSqueezing) {
            // Seek the Exit
            const target = p.createVector(
              p.width / 2,
              p.height / 2 - BOX_SIZE / 2
            );
            const seek = this.seek(target);

            // If very close to exit, crowd mechanics (separation becomes stronger)
            const d = p5.Vector.dist(this.pos, target);
            if (d < 50) {
              const separate = this.separate(particles).mult(2.5);
              this.applyForce(separate);
            }

            this.applyForce(seek.mult(1.5));
          } else {
            // Wandering / Brownian motion inside
            const separate = this.separate(particles);
            this.applyForce(separate);
          }

          // Containment logic
          this.contain(currentGateWidth);
        }

        seek(target: p5.Vector) {
          const desired = p5.Vector.sub(target, this.pos);
          desired.setMag(this.maxSpeed);
          const steer = p5.Vector.sub(desired, this.vel);
          steer.limit(this.maxForce);
          return steer;
        }

        separate(vehicles: Particle[]) {
          const desiredseparation = 15;
          const sum = p.createVector(0, 0);
          let count = 0;
          for (let other of vehicles) {
            const d = p5.Vector.dist(this.pos, other.pos);
            if (d > 0 && d < desiredseparation) {
              const diff = p5.Vector.sub(this.pos, other.pos);
              diff.normalize();
              diff.div(d);
              sum.add(diff);
              count++;
            }
          }
          if (count > 0) {
            sum.div(count);
            sum.setMag(this.maxSpeed);
            sum.sub(this.vel);
            sum.limit(this.maxForce);
          }
          return sum;
        }

        contain(gateWidth: number) {
          const halfBox = BOX_SIZE / 2;
          const cx = p.width / 2;
          const cy = p.height / 2;
          const left = cx - halfBox;
          const right = cx + halfBox;
          const top = cy - halfBox;
          const bottom = cy + halfBox;

          // Side Walls
          if (this.pos.x < left + 5) {
            this.pos.x = left + 5;
            this.vel.x *= -1;
          } else if (this.pos.x > right - 5) {
            this.pos.x = right - 5;
            this.vel.x *= -1;
          }

          // Bottom Wall
          if (this.pos.y > bottom - 5) {
            this.pos.y = bottom - 5;
            this.vel.y *= -1;
          }

          // Top Wall (The Gate Logic)
          if (this.pos.y < top + 5) {
            // Check if within gate width
            const distToCenter = Math.abs(this.pos.x - cx);
            if (distToCenter > gateWidth / 2) {
              // Hit the ceiling
              this.pos.y = top + 5;
              this.vel.y *= -1;
            } else {
              // In the gate area
              if (this.pos.y < top - 20) {
                // Escaped! Reset to bottom or keep flying up?
                // Let's reset them to bottom to simulate new shorts trapped or just cycle them
                if (stateRef.current.day === 1) {
                  this.pos.y = top + 20; // Flow through
                } else if (stateRef.current.isSqueezing) {
                  // Actually escaping during squeeze
                  // Fade out or fly away
                }
              }
            }
          }
        }

        update() {
          this.vel.add(this.acc);
          this.vel.limit(this.maxSpeed);
          this.pos.add(this.vel);
          this.acc.mult(0);
        }

        display() {
          p.noStroke();
          p.fill(this.color);
          p.circle(this.pos.x, this.pos.y, 8);
        }
      }

      p.setup = () => {
        p.createCanvas(
          containerRef.current!.offsetWidth,
          containerRef.current!.offsetHeight
        );

        // Initialize Particles
        for (let i = 0; i < PARTICLE_COUNT; i++) {
          particles.push(new Particle());
        }
      };

      p.draw = () => {
        p.clear(); // Transparent background

        const { day, isSqueezing } = stateRef.current;
        const targetGateWidth = day === 1 ? GATE_WIDTH_DAY_1 : GATE_WIDTH_DAY_3;

        // --- 1. Draw Environment ---
        const cx = p.width / 2;
        const cy = p.height / 2;

        // Draw Box Container
        p.stroke(80);
        p.strokeWeight(2);
        p.noFill();
        p.rectMode(p.CENTER);
        p.rect(cx, cy, BOX_SIZE, BOX_SIZE);

        // Draw Gate (Visual Blocking Rects)
        p.fill(15, 23, 42); // Match bg color (slate-900) to "hide" top line
        p.noStroke();

        // The "Wall" above the box
        const wallThickness = 20;
        const gateHalf = targetGateWidth / 2;
        const boxHalf = BOX_SIZE / 2;

        // Left Gate Wing
        p.fill(200, 200, 200);
        p.rectMode(p.CORNER);
        // Visualizing the sliding gate mechanism
        p.rect(cx - boxHalf, cy - boxHalf - 5, boxHalf - gateHalf, 10);

        // Right Gate Wing
        p.rect(cx + gateHalf, cy - boxHalf - 5, boxHalf - gateHalf, 10);

        // --- 2. Physics & Particles ---
        let pressureCount = 0;
        const gateRegion = p.createVector(cx, cy - boxHalf);

        particles.forEach((particle) => {
          particle.behaviors(targetGateWidth);
          particle.update();
          particle.display();

          // Calculate "Pressure"
          // If squeezing, how many are pushing near the exit?
          const distToGate = p5.Vector.dist(particle.pos, gateRegion);
          if (distToGate < 60 && particle.pos.y < cy - boxHalf + 60) {
            pressureCount++;
          }
        });

        // --- 3. Price Graph Simulation ---
        // Pressure is inversely proportional to gate width and proportional to crowding
        let currentPressure = 0;
        if (isSqueezing) {
          // High pressure when gate is small and count is high
          currentPressure = pressureCount * 15 + p.random(-5, 5);
        } else if (day === 1) {
          // Low pressure, open flow
          currentPressure = 10 + p.random(-2, 2);
        } else {
          // Day 3 no squeeze: Low pressure, dormant
          currentPressure = 5 + p.random(-1, 1);
        }

        // Clamp pressure
        currentPressure = p.constrain(currentPressure, 0, 150);
        stateRef.current.pressure = currentPressure;

        // Update History
        priceHistory.push(currentPressure);
        if (priceHistory.length > p.width / 2) {
          priceHistory.shift();
        }

        // Draw Graph at bottom
        p.push();
        p.translate(0, p.height - GRAPH_HEIGHT - 10);

        // Graph Background
        p.fill(10, 10, 20, 200);
        p.noStroke();
        p.rect(0, 0, p.width, GRAPH_HEIGHT + 10);

        p.stroke(isSqueezing ? 'rgb(239, 68, 68)' : 'rgb(59, 130, 246)'); // Red if squeeze, Blue otherwise
        p.strokeWeight(2);
        p.noFill();
        p.beginShape();
        for (let i = 0; i < priceHistory.length; i++) {
          // Map index to width (right aligned)
          let x = p.map(i, 0, priceHistory.length, p.width / 2, p.width - 20);
          let y = p.map(priceHistory[i], 0, 150, GRAPH_HEIGHT, 0);
          p.vertex(x, y);
        }
        p.endShape();

        // Graph Labels
        p.fill(150);
        p.noStroke();
        p.textSize(10);
        p.textAlign(p.LEFT);
        p.text('PRICE ACTION', p.width / 2 + 10, 15);
        p.pop();

        // --- 4. Annotations ---
        p.fill(255);
        p.textAlign(p.CENTER);
        p.textSize(14);
        if (day === 1) {
          p.text('LIQUIDITY: HIGH', cx, cy - boxHalf - 20);
        } else {
          p.text('LIQUIDITY: LOW', cx, cy - boxHalf - 20);
        }

        if (isSqueezing) {
          p.fill(255, 50, 50);
          p.textSize(20);
          p.textStyle(p.BOLD);
          p.text('!!! SQUEEZE !!!', cx, cy + 20);
        }
      };

      p.windowResized = () => {
        if (containerRef.current) {
          p.resizeCanvas(
            containerRef.current.offsetWidth,
            containerRef.current.offsetHeight
          );
        }
      };
    };

    const myP5 = new p5(sketch, containerRef.current);
    p5Instance.current = myP5;

    return () => {
      myP5.remove();
    };
  }, []); // Empty dependency array, internal updates handled via refs

  return (
    <div className="flex flex-col gap-6 w-full max-w-3xl mx-auto my-8">
      {/* Simulation Visual Area */}
      <EnvironmentWrapper height="450px" className="flex-col">
        <div
          ref={containerRef}
          className="w-full h-full absolute inset-0 z-10"
        />
        {/* Overlay UI inside wrapper if needed, but P5 handles most visuals */}
      </EnvironmentWrapper>

      {/* Control Panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-900/50 p-4 rounded-xl border border-slate-800 backdrop-blur-sm">
        <button
          onClick={() => {
            setDay(1);
            setIsSqueezing(false);
          }}
          className={`flex items-center justify-center gap-2 p-3 rounded-lg border transition-all duration-200 ${
            day === 1
              ? 'bg-blue-600/20 border-blue-500 text-blue-400'
              : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-750'
          }`}
        >
          <Activity size={18} />
          <div className="text-left">
            <div className="font-bold text-sm">Day 1: Entry</div>
            <div className="text-xs opacity-70">High Vol / Wide Door</div>
          </div>
        </button>

        <button
          onClick={() => {
            setDay(3);
            setIsSqueezing(false);
          }}
          className={`flex items-center justify-center gap-2 p-3 rounded-lg border transition-all duration-200 ${
            day === 3 && !isSqueezing
              ? 'bg-amber-600/20 border-amber-500 text-amber-400'
              : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-750'
          }`}
        >
          <ArrowRightCircle size={18} />
          <div className="text-left">
            <div className="font-bold text-sm">Days 2-3: Trap</div>
            <div className="text-xs opacity-70">Low Vol / Tiny Door</div>
          </div>
        </button>

        <button
          onClick={() => {
            setDay(3);
            setIsSqueezing(true);
          }}
          className={`flex items-center justify-center gap-2 p-3 rounded-lg border transition-all duration-200 ${
            isSqueezing
              ? 'bg-red-600/20 border-red-500 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.3)]'
              : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-750'
          }`}
        >
          <AlertTriangle size={18} />
          <div className="text-left">
            <div className="font-bold text-sm">Day 4: SQUEEZE</div>
            <div className="text-xs opacity-70">Panic Buy-In</div>
          </div>
        </button>
      </div>

      {/* Descriptive Text */}
      <div className="bg-slate-900/80 p-6 rounded-xl border-l-4 border-l-blue-500 shadow-sm">
        <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
          {day === 1
            ? 'Phase 1: The Setup'
            : isSqueezing
            ? 'Phase 3: The Explosion'
            : 'Phase 2: The Trap'}
        </h4>
        <p className="text-slate-300 text-sm leading-relaxed">
          {day === 1 && (
            <>
              Shorts enter easily because liquidity (the door width) is massive.
              They feel safe entering position because there is ample room to
              maneuver. The price action is volatile but manageable.
            </>
          )}
          {day === 3 && !isSqueezing && (
            <>
              Volume has evaporated. The liquidity door is now 90% smaller.
              Shorts are comfortable inside the trade ("boring" price action),
              unaware that their exit route has effectively disappeared.
            </>
          )}
          {isSqueezing && (
            <>
              <span className="text-red-400 font-bold">PANIC.</span> Settlement
              pressure forces shorts to cover. They all run for the exit at
              once. Because the "door" (liquidity) is tiny, they clog the exit.
              This bottleneck creates massive upward pressure on the price.
            </>
          )}
        </p>
      </div>
    </div>
  );
};

export default LiquidityTrapSim;
