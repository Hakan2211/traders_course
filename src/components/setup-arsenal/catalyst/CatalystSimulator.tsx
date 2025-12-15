
import React, { useEffect, useRef, useState } from 'react';
import p5 from 'p5';

// ----------------------------------------------------------------------
// Types & Constants
// ----------------------------------------------------------------------

type ScenarioType = 'LONG' | 'SHORT';
type ParticleRole = 'DRIVER' | 'CHASER';

interface SimulationState {
  scenario: ScenarioType;
  isRunning: boolean;
}

// ----------------------------------------------------------------------
// Component
// ----------------------------------------------------------------------

const CatalystSimulator: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const p5InstanceRef = useRef<p5 | null>(null);

  // React State for UI Controls
  const [scenario, setScenario] = useState<ScenarioType>('LONG');
  const [isPlaying, setIsPlaying] = useState(false);

  // Refs to pass state into P5 closure
  const stateRef = useRef<SimulationState>({
    scenario: 'LONG',
    isRunning: false,
  });

  // Sync React state to Mutable Ref for P5
  useEffect(() => {
    stateRef.current.scenario = scenario;
    stateRef.current.isRunning = isPlaying;
  }, [scenario, isPlaying]);

  useEffect(() => {
    if (!containerRef.current) return;

    // ------------------------------------------------------------------
    // P5 Sketch Definition
    // ------------------------------------------------------------------
    const sketch = (p: p5) => {
      // Configuration
      let CANVAS_WIDTH = containerRef.current?.clientWidth || 800;
      let CANVAS_HEIGHT = 600;

      // LAYOUT: Resistance at 65% height.
      // This leaves 35% at bottom for accumulation, 65% at top for "Blue Sky" breakout
      const RESISTANCE_Y = CANVAS_HEIGHT * 0.65;

      const MAX_FRAMES = 950;
      const INITIAL_PARTICLE_COUNT = 150;

      // Simulation Variables
      let particles: Particle[] = [];
      let chartPoints: { time: number; y: number }[] = [];
      let volumeHistory: { val: number; color: string }[] = [];
      let time = 0;
      let isFinished = false;

      // ----------------------------------------------------------------
      // Particle Class
      // ----------------------------------------------------------------
      class Particle {
        pos: p5.Vector;
        vel: p5.Vector;
        acc: p5.Vector;
        color: p5.Color;
        type: 'BUYER' | 'SELLER';
        role: ParticleRole;
        trapped: boolean;
        isDead: boolean;
        hasSpawnedReplacement: boolean;

        constructor(role: ParticleRole = 'DRIVER') {
          // Spawn at bottom
          this.pos = p.createVector(
            p.random(0, 100),
            p.random(CANVAS_HEIGHT - 10, CANVAS_HEIGHT + 10)
          );
          this.vel = p.createVector(p.random(3, 8), p.random(-3, -6));
          this.acc = p.createVector(0, 0);
          this.color = p.color(34, 197, 94); // Green-500
          this.type = 'BUYER';
          this.role = role;
          this.trapped = false;
          this.isDead = false;
          this.hasSpawnedReplacement = false;
        }

        applyForce(force: p5.Vector) {
          this.acc.add(force);
        }

        update(currentScenario: ScenarioType): Particle | null {
          let newParticle: Particle | null = null;

          // Physics
          this.vel.add(this.acc);

          // Basic Limits
          this.vel.x = p.constrain(this.vel.x, -2, 12);

          // Soft terminal velocity to prevent infinite acceleration off screen
          // But relaxed enough to allow "breakout" feel
          if (this.vel.y < -8) {
            this.vel.y = p.lerp(this.vel.y, -8, 0.05);
          }

          this.pos.add(this.vel);
          this.acc.mult(0); // Reset acceleration

          // ------------------------------------------------------------
          // SCENARIO 1: LONG (Breakout)
          // ------------------------------------------------------------
          if (currentScenario === 'LONG') {
            const distToWall = this.pos.y - RESISTANCE_Y;

            // --- PHASE 1: PRE-MARKET COMPRESSION (0 - 150) ---
            if (time < 150) {
              if (distToWall < 40 && distToWall > -10) {
                // Hit Resistance -> Compress
                this.trapped = true;
                this.color = p.color(234, 179, 8); // Yellow

                this.vel.y *= 0.5;
                this.vel.x *= 0.9;

                // Wall Containment
                if (this.pos.y < RESISTANCE_Y)
                  this.pos.y = RESISTANCE_Y + p.random(0, 5);
                this.pos.x += p.random(0, 2);
              }
            } else {
              // --- PHASE 2: THE BREAKOUT (150 - 400) ---
              if (this.trapped) {
                this.trapped = false;
                this.color = p.color(52, 211, 153); // Emerald
                this.vel.y -= p.random(1, 2); // Pop
                this.vel.x += p.random(0.5, 1);
              }

              // Timeline Forces
              if (time < 400) {
                // Leg 1: Push Up
                this.applyForce(p.createVector(0, -0.04));
              } else if (time >= 400 && time < 650) {
                // --- PHASE 3: CONSOLIDATION (400 - 650) ---
                // Friction to slow ascent
                this.vel.mult(0.96);
                this.applyForce(p.createVector(0, 0.03));
              } else {
                // --- PHASE 4: SECOND LEG (650+) ---
                // Moderate push, but with drag to keep it on screen
                this.applyForce(p.createVector(0, -0.025));
                this.vel.mult(0.99); // Slight air resistance at high altitude
              }
            }

            // --- OFF SCREEN LOGIC ---
            // If particles go too high, spawn chasers
            if (this.pos.y < -50) {
              if (this.role === 'DRIVER') {
                if (!this.hasSpawnedReplacement) {
                  this.hasSpawnedReplacement = true;
                  newParticle = new Particle('CHASER');
                  newParticle.respawnAsChaser();
                }
              } else {
                this.respawnAsChaser();
              }
            }
          }

          // ------------------------------------------------------------
          // SCENARIO 2: SHORT (Rejection)
          // ------------------------------------------------------------
          else {
            // Hit Resistance -> Reject
            if (
              this.pos.y <= RESISTANCE_Y + 5 &&
              this.vel.y < 0 &&
              !this.isDead
            ) {
              this.vel.y *= -0.6; // Hard bounce
              this.type = 'SELLER';
              this.color = p.color(239, 68, 68); // Red
              this.vel.x += p.random(0, 3);
            }

            if (this.type === 'SELLER') {
              this.applyForce(p.createVector(0, 0.15)); // Gravity
              this.vel.mult(0.96); // Drag
            }

            if (this.pos.y > p.height + 50) {
              this.isDead = true;
            }
          }

          if (this.pos.x > p.width + 100) this.isDead = true;

          return newParticle;
        }

        respawnAsChaser() {
          this.pos.y = p.height + 20;
          this.pos.x = p.random(0, p.width * 0.6);
          this.vel = p.createVector(p.random(2, 5), p.random(-4, -7));
          this.trapped = false;
          this.type = 'BUYER';
          this.role = 'CHASER';
          this.color = p.color(52, 211, 153);
        }

        display() {
          if (this.isDead) return;
          p.noStroke();
          p.fill(this.color);
          p.circle(this.pos.x, this.pos.y, this.type === 'SELLER' ? 4 : 3);
        }
      }

      // ----------------------------------------------------------------
      // Setup & Reset
      // ----------------------------------------------------------------
      p.setup = () => {
        p.createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
        p.frameRate(60);
        resetSimulation();
      };

      p.windowResized = () => {
        CANVAS_WIDTH = containerRef.current?.clientWidth || 800;
        p.resizeCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
      };

      const resetSimulation = () => {
        particles = [];
        chartPoints = [];
        volumeHistory = [];
        time = 0;
        isFinished = false;

        for (let i = 0; i < INITIAL_PARTICLE_COUNT; i++) {
          particles.push(new Particle('DRIVER'));
        }
      };

      // ----------------------------------------------------------------
      // Main Loop
      // ----------------------------------------------------------------
      p.draw = () => {
        p.background(15, 23, 42);
        drawGrid();
        drawResistanceLine();

        if (!stateRef.current.isRunning) {
          if (time > 0) resetSimulation();
          drawReadyScreen();
          return;
        }

        if (time >= MAX_FRAMES) {
          isFinished = true;
          drawSimulationEnd();
          return;
        }

        time++;
        let totalVel = 0;
        let activeParticles: Particle[] = [];
        const newParticlesToAdd: Particle[] = [];

        // Update
        for (let i = particles.length - 1; i >= 0; i--) {
          const part = particles[i];
          const newP = part.update(stateRef.current.scenario);
          if (newP) newParticlesToAdd.push(newP);

          if (!part.isDead) {
            part.display();
            totalVel += part.vel.mag();
            activeParticles.push(part);
          } else {
            particles.splice(i, 1);
          }
        }
        particles.push(...newParticlesToAdd);

        // Chart Calculation
        const priceDrivers = activeParticles.filter((p) => p.role === 'DRIVER');
        if (priceDrivers.length > 0) {
          priceDrivers.sort((a, b) => a.pos.y - b.pos.y);

          // Top 20% average
          const leaderCount = Math.max(
            1,
            Math.floor(priceDrivers.length * 0.2)
          );
          let leaderSumY = 0;
          for (let i = 0; i < leaderCount; i++)
            leaderSumY += priceDrivers[i].pos.y;

          let avgY = leaderSumY / leaderCount;

          // Visual Clamp: Keep visible but don't distort physics
          // Just ensure it doesn't draw off top edge
          avgY = Math.max(30, avgY);

          // Smoothing
          let smoothY = avgY;
          if (chartPoints.length > 0) {
            const lastY = chartPoints[chartPoints.length - 1].y;
            smoothY = p.lerp(lastY, avgY, 0.05);
          }

          chartPoints.push({ time: time, y: smoothY });
        }

        drawChartLine();
        drawVolume(totalVel);
        drawStats(time, activeParticles.length);
      };

      // ----------------------------------------------------------------
      // Helpers
      // ----------------------------------------------------------------
      const drawResistanceLine = () => {
        const isLong = stateRef.current.scenario === 'LONG';
        const isBroken = isLong && time > 150;

        p.stroke(isBroken ? p.color(34, 197, 94) : p.color(239, 68, 68));
        p.strokeWeight(2);

        const ctx = p.drawingContext as CanvasRenderingContext2D;
        ctx.setLineDash([6, 6]);
        p.line(0, RESISTANCE_Y, p.width, RESISTANCE_Y);
        ctx.setLineDash([]);

        p.noStroke();
        p.fill(isBroken ? p.color(34, 197, 94) : p.color(239, 68, 68));
        p.textSize(10);
        p.textAlign(p.RIGHT);
        p.text('RESISTANCE / SUPPLY WALL', p.width - 10, RESISTANCE_Y - 10);
      };

      const drawChartLine = () => {
        if (chartPoints.length < 2) return;
        p.noFill();
        p.stroke(255);
        p.strokeWeight(2);
        p.beginShape();
        for (let pt of chartPoints) {
          const x = p.map(pt.time, 0, MAX_FRAMES, 0, p.width);
          p.vertex(x, pt.y);
        }
        p.endShape();
      };

      const drawVolume = (currentTotalVel: number) => {
        let col = '#4ade80';
        if (chartPoints.length > 5) {
          const curr = chartPoints[chartPoints.length - 1].y;
          const prev = chartPoints[chartPoints.length - 5].y;
          if (curr > prev) col = '#f87171';
        }

        volumeHistory.push({ val: currentTotalVel, color: col });

        const barW = p.width / MAX_FRAMES;
        p.noStroke();

        for (let i = 0; i < volumeHistory.length; i++) {
          const v = volumeHistory[i];
          const bx = p.map(i, 0, MAX_FRAMES, 0, p.width);
          p.fill(v.color);
          // OVERLAP FIX: Reduce Max Height of Volume Bars significantly
          // Max height 80px out of 600px canvas
          const h = p.map(v.val, 0, INITIAL_PARTICLE_COUNT * 4, 0, 80);
          p.rect(bx, p.height - h, barW + 1, h);
        }

        p.fill(100);
        p.textAlign(p.LEFT, p.BOTTOM);
        p.text('VOLUME', 5, p.height - 5);
      };

      const drawGrid = () => {
        p.stroke(30, 41, 59);
        p.strokeWeight(1);
        for (let x = 0; x < p.width; x += 50) p.line(x, 0, x, p.height);
        for (let y = 0; y < p.height; y += 50) p.line(0, y, p.width, y);
      };

      const drawReadyScreen = () => {
        p.fill(255);
        p.textAlign(p.CENTER, p.CENTER);
        p.textSize(16);
        p.text('SYSTEM READY // AWAITING INJECTION', p.width / 2, p.height / 2);
        const r = 200 + Math.sin(p.millis() * 0.005) * 10;
        p.noFill();
        p.stroke(stateRef.current.scenario === 'LONG' ? 'green' : 'red');
        p.strokeWeight(1);
        p.circle(p.width / 2, p.height / 2, r);
      };

      const drawSimulationEnd = () => {
        p.fill(255);
        p.textAlign(p.CENTER, p.CENTER);
        p.textSize(16);
        p.text('SIMULATION COMPLETE', p.width / 2, p.height / 2);
      };

      const drawStats = (t: number, count: number) => {
        p.textAlign(p.LEFT, p.TOP);
        p.textSize(10);
        p.fill(100);
        p.text(`FRAME: ${t}`, 10, 10);
        p.text(`PARTICLES: ${count}`, 10, 22);
      };
    };

    p5InstanceRef.current = new p5(sketch, containerRef.current);

    return () => {
      p5InstanceRef.current?.remove();
    };
  }, []);

  const handleStart = () => {
    setIsPlaying(true);
  };

  const handleReset = () => {
    setIsPlaying(false);
  };

  const toggleScenario = (newScenario: ScenarioType) => {
    setScenario(newScenario);
    setIsPlaying(false);
  };

  return (
    <div className="flex flex-col w-full">
      <div
        ref={containerRef}
        className="w-full h-[600px] relative bg-slate-900 overflow-hidden rounded-t-lg border-b border-slate-800"
      >
        <div className="absolute top-4 left-4 z-10 pointer-events-none">
          <div className="bg-slate-900/80 backdrop-blur border border-slate-700 p-3 rounded shadow-lg">
            <h3 className="text-[10px] text-slate-400 uppercase tracking-widest mb-1">
              Current Setup
            </h3>
            <div
              className={`text-lg font-bold leading-none ${
                scenario === 'LONG' ? 'text-green-400' : 'text-red-400'
              }`}
            >
              {scenario === 'LONG' ? 'NEWS PLAY' : 'POP & DROP'}
            </div>
            <div className="text-xs text-slate-300 mt-1">
              {scenario === 'LONG'
                ? 'BREAKOUT (Material News)'
                : 'REJECTION (Fluff News)'}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-800 p-6 rounded-b-lg">
        <div className="flex flex-col md:flex-row gap-6 justify-between items-center">
          <div className="flex flex-col gap-3 w-full md:w-auto">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
              1. Select Catalyst
            </span>
            <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-700">
              <button
                onClick={() => toggleScenario('LONG')}
                className={`flex-1 px-4 py-2 rounded-md text-sm font-bold transition-all duration-200 ${
                  scenario === 'LONG'
                    ? 'bg-green-600 text-white shadow-[0_0_15px_rgba(22,163,74,0.5)]'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                Material News
              </button>
              <button
                onClick={() => toggleScenario('SHORT')}
                className={`flex-1 px-4 py-2 rounded-md text-sm font-bold transition-all duration-200 ${
                  scenario === 'SHORT'
                    ? 'bg-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.5)]'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                Fluff News
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-3 w-full md:w-auto">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
              2. Control
            </span>
            <div className="flex gap-3">
              {!isPlaying ? (
                <button
                  onClick={handleStart}
                  className="w-full md:w-48 px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg shadow-lg shadow-blue-900/50 border border-blue-400 transition-transform active:scale-95"
                >
                  INJECT VOLUME
                </button>
              ) : (
                <button
                  onClick={handleReset}
                  className="w-full md:w-48 px-6 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold rounded-lg border border-slate-600 transition-transform active:scale-95"
                >
                  RESET
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-slate-900/50 rounded border border-slate-700/50 text-sm text-slate-400">
          {scenario === 'LONG' ? (
            <p>
              <strong className="text-green-400">Analysis:</strong> Material
              news creates sustained demand. Notice how volume{' '}
              <span className="text-white">remains high</span> as price breaks
              resistance. The initial buyers hold, and new "chaser" particles
              enter, fueling the move.
            </p>
          ) : (
            <p>
              <strong className="text-red-400">Analysis:</strong> Fluff news
              creates a trap. Notice how particles hit the wall and{' '}
              <span className="text-white">lose momentum immediately</span>.
              Volume bars shrink (turn red) as buyers vanish and gravity takes
              over.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CatalystSimulator;
