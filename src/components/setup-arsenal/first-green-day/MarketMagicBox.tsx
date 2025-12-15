
import React, { useEffect, useRef, useState } from 'react';
import p5 from 'p5';

// Define the simulation phases
type Phase = 'RUNNER' | 'FRD' | 'FGD';

interface SimulationState {
  phase: Phase;
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  variant?: 'success' | 'danger' | 'primary';
}

const Button: React.FC<ButtonProps> = ({
  children,
  active,
  variant = 'primary',
  className = '',
  ...props
}) => {
  const baseStyles =
    'py-3 px-4 rounded-lg font-bold transition-all transform active:scale-95 text-sm uppercase tracking-wider';

  let variantStyles = '';
  if (variant === 'success') {
    variantStyles = active
      ? 'bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.5)] border-2 border-emerald-400'
      : 'bg-slate-700 text-emerald-400 hover:bg-slate-600 border-2 border-transparent';
  } else if (variant === 'danger') {
    variantStyles = active
      ? 'bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.5)] border-2 border-red-400'
      : 'bg-slate-700 text-red-400 hover:bg-slate-600 border-2 border-transparent';
  } else {
    variantStyles = active
      ? 'bg-blue-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.5)] border-2 border-blue-400'
      : 'bg-slate-700 text-blue-400 hover:bg-slate-600 border-2 border-transparent';
  }

  return (
    <button
      className={`${baseStyles} ${variantStyles} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

const MarketMagicBox: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const p5InstanceRef = useRef<p5 | null>(null);

  // We use a ref for state accessible inside the p5 closure to avoid stale closures
  const simulationState = useRef<SimulationState>({ phase: 'RUNNER' });

  // React state for UI updates (text descriptions)
  const [currentPhase, setCurrentPhase] = useState<Phase>('RUNNER');

  const setPhase = (phase: Phase) => {
    simulationState.current.phase = phase;
    setCurrentPhase(phase);
  };

  useEffect(() => {
    if (!containerRef.current) return;

    // The P5 Sketch
    const sketch = (p: p5) => {
      let particles: Particle[] = [];
      const NUM_PARTICLES = 150;

      // Physics Constants
      const UPWARD_FORCE = -0.3;
      const GRAVITY_FRD = 0.2;
      const GRAVITY_FGD = 0.4; // Optimized for bounce arc

      class Particle {
        pos: p5.Vector;
        vel: p5.Vector;
        acc: p5.Vector;
        col: p5.Color;
        size: number;
        type: 'BUYER' | 'SELLER';
        isBouncing: boolean; // For FGD bounce effect

        constructor(x: number, y: number) {
          this.pos = p.createVector(x, y);
          this.vel = p.createVector(p.random(-1, 1), p.random(-2, 0));
          this.acc = p.createVector(0, 0);
          this.col = p.color(34, 197, 94); // Default Green
          this.size = p.random(6, 12);
          this.type = 'BUYER';
          this.isBouncing = false;
        }

        applyForce(force: p5.Vector) {
          this.acc.add(force);
        }

        update() {
          const mode = simulationState.current.phase;

          // Physics Logic based on Mode
          if (mode === 'RUNNER') {
            // Anti-gravity (Euphoria)
            this.applyForce(p.createVector(0, UPWARD_FORCE));
            // Jitter (Volatility)
            this.vel.x += p.random(-0.5, 0.5);

            // Turn Green
            this.col = p.lerpColor(this.col, p.color(34, 197, 94), 0.1);
            this.isBouncing = false;
          } else if (mode === 'FRD') {
            // Gravity turns on (Reality check)
            this.applyForce(p.createVector(0, GRAVITY_FRD));

            // Turn Red gradually
            this.col = p.lerpColor(this.col, p.color(239, 68, 68), 0.05);
            this.isBouncing = false;
          } else if (mode === 'FGD') {
            // Heavy Gravity (Capitulation)
            this.applyForce(p.createVector(0, GRAVITY_FGD));

            // Deep Red until bounce
            if (!this.isBouncing) {
              this.col = p.lerpColor(this.col, p.color(153, 27, 27), 0.1);
            }
          }

          this.vel.add(this.acc);
          this.pos.add(this.vel);
          this.acc.mult(0); // Reset acceleration

          // Friction/Air Resistance
          this.vel.mult(0.98);

          this.checkEdges();
        }

        checkEdges() {
          const mode = simulationState.current.phase;

          // Ceiling Logic
          if (this.pos.y < 0) {
            this.pos.y = 0;

            if (mode === 'RUNNER') {
              // Stick to top/crowd at top
              this.vel.y *= -0.2;
            } else {
              // Hit ceiling and fall
              this.vel.y *= -0.5;
            }
          }

          // Floor Logic
          if (this.pos.y > p.height) {
            this.pos.y = p.height;

            if (mode === 'RUNNER') {
              // Reset to bottom to keep flow going
              this.pos.y = p.height;
              this.vel.y = p.random(-5, -2);
            } else if (mode === 'FRD') {
              // Hit floor and thud (heavy stop)
              this.vel.y *= -0.15;
            } else if (mode === 'FGD') {
              // THE RELIEF BOUNCE

              if (!this.isBouncing) {
                // FIRST IMPACT: Force a massive bounce
                // This ensures even settled particles get launched up
                this.vel.y = p.random(-14, -18);
                this.isBouncing = true;

                // Flash Green immediately
                this.col = p.color(74, 222, 128); // Light Green
              } else {
                // Subsequent bounces: Dampen normally
                this.vel.y *= -0.6;
              }
              // Drift sideways on bounce
              this.vel.x += p.random(-3, 3);
            }
          }

          // Walls
          if (this.pos.x > p.width) {
            this.pos.x = p.width;
            this.vel.x *= -0.8;
          } else if (this.pos.x < 0) {
            this.pos.x = 0;
            this.vel.x *= -0.8;
          }
        }

        show() {
          p.noStroke();
          // Glow effect
          if (this.isBouncing) {
            p.fill(74, 222, 128, 100);
            p.ellipse(this.pos.x, this.pos.y, this.size + 4);
          }
          p.fill(this.col);
          p.ellipse(this.pos.x, this.pos.y, this.size);
        }
      }

      p.setup = () => {
        // Create canvas that fits the container
        const parent = containerRef.current;
        if (parent) {
          p.createCanvas(parent.offsetWidth, 400).parent(parent);
        }

        // Initialize particles
        for (let i = 0; i < NUM_PARTICLES; i++) {
          particles.push(new Particle(p.random(p.width), p.height));
        }
      };

      p.draw = () => {
        p.background(15, 23, 42); // Match bg-slate-900

        // Draw grid lines for visual reference
        p.stroke(30, 41, 59);
        p.strokeWeight(1);
        for (let i = 0; i < p.height; i += 50) {
          p.line(0, i, p.width, i);
        }

        particles.forEach((particle) => {
          particle.update();
          particle.show();
        });

        // Overlay Text based on mode
        p.textAlign(p.CENTER);
        p.textSize(16);
        p.fill(255);
        p.noStroke();

        const mode = simulationState.current.phase;
        if (mode === 'RUNNER') {
          p.fill(34, 197, 94);
          p.text('MOMENTUM ACCELERATING (Days 1-4)', p.width / 2, 50);
        } else if (mode === 'FRD') {
          p.fill(239, 68, 68);
          p.text('EXHAUSTION: FIRST RED DAY (Day 5)', p.width / 2, 50);
        } else {
          p.fill(74, 222, 128);
          p.text('OVERSOLD BOUNCE: FIRST GREEN DAY (Day 9)', p.width / 2, 50);
        }
      };

      p.windowResized = () => {
        const parent = containerRef.current;
        if (parent) {
          p.resizeCanvas(parent.offsetWidth, 400);
        }
      };
    };

    // Instantiate P5
    const myP5 = new p5(sketch);
    p5InstanceRef.current = myP5;

    // Cleanup
    return () => {
      myP5.remove();
    };
  }, []); // Empty dependency array means this runs once on mount

  // UI Description Logic
  const getDescription = () => {
    switch (currentPhase) {
      case 'RUNNER':
        return (
          <div className="bg-emerald-900/30 border border-emerald-800 p-4 rounded-lg">
            <h3 className="text-emerald-400 font-bold mb-1">
              Days 1-4: The Runner
            </h3>
            <p className="text-emerald-200 text-sm">
              Buying pressure defies gravity. Prices accelerate upward. FOMO is
              high. Particles (Traders) are stuck to the ceiling (Overextended).
            </p>
          </div>
        );
      case 'FRD':
        return (
          <div className="bg-red-900/30 border border-red-800 p-4 rounded-lg">
            <h3 className="text-red-400 font-bold mb-1">
              Day 5: First Red Day (FRD)
            </h3>
            <p className="text-red-200 text-sm">
              Gravity (Reality) returns. The runner exhausts. Buying dries up,
              and profit-taking pushes price down. The trend has broken.
            </p>
          </div>
        );
      case 'FGD':
        return (
          <div className="bg-slate-700/50 border border-slate-600 p-4 rounded-lg">
            <h3 className="text-green-400 font-bold mb-1">
              Day 9: First Green Day (FGD)
            </h3>
            <p className="text-slate-200 text-sm">
              After days of falling (Capitulation), the price hits the floor. It
              doesn't stay there—it bounces. Shorts cover, creating a temporary
              "Relief Bounce" (Green flash).
            </p>
          </div>
        );
    }
  };

  return (
    <div className="bg-slate-800 rounded-xl shadow-2xl overflow-hidden border border-slate-700 my-8">
      <div className="p-6 border-b border-slate-700">
        <h2 className="text-xl font-semibold text-white flex items-center">
          <span className="bg-blue-500 w-2 h-8 mr-3 rounded-full"></span>
          Magic Box Simulation
        </h2>
      </div>

      {/* Control Panel */}
      <div className="flex flex-col sm:flex-row gap-4 p-6 bg-slate-850">
        <Button
          variant="success"
          active={currentPhase === 'RUNNER'}
          onClick={() => setPhase('RUNNER')}
          className="flex-1"
        >
          1. Ignition (Runner)
        </Button>
        <Button
          variant="danger"
          active={currentPhase === 'FRD'}
          onClick={() => setPhase('FRD')}
          className="flex-1"
        >
          2. Exhaustion (FRD)
        </Button>
        <Button
          variant="primary"
          active={currentPhase === 'FGD'}
          onClick={() => setPhase('FGD')}
          className="flex-1"
        >
          3. Capitulation (FGD)
        </Button>
      </div>

      {/* P5 Canvas Container */}
      <div
        className="relative w-full h-[400px] bg-slate-900"
        ref={containerRef}
      >
        {/* Canvas is injected here by P5 */}
      </div>

      {/* Educational Context */}
      <div className="p-6">{getDescription()}</div>
    </div>
  );
};

export default MarketMagicBox;
