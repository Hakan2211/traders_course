
import React, { useRef, useState, useEffect } from 'react';
import Sketch from 'react-p5';
import P5 from 'p5';
import { Play, RotateCcw, TrendingUp, TrendingDown, Info } from 'lucide-react';
import {
  ScenarioType,
  Candle,
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  PARTICLES_COUNT,
  FRAMES_PER_CANDLE,
  LEVEL_LOW,
  LEVEL_RESISTANCE,
  LEVEL_HIGH,
  LEVEL_STOP_HUNT,
} from '../types';

// Particle Class for P5
class Particle {
  p5: P5;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  targetY: number;

  constructor(p5: P5) {
    this.p5 = p5;
    this.x = p5.random(50, CANVAS_WIDTH - 50);
    this.y = LEVEL_LOW + p5.random(-20, 20);
    this.vx = 0;
    this.vy = 0;
    this.color = '#4ade80'; // Green-400
    this.targetY = LEVEL_LOW;
  }

  update(noiseScale: number, attractionStrength: number) {
    // Attraction to target price
    const dy = this.targetY - this.y;
    this.vy += dy * attractionStrength;

    // Brownian motion / Market Noise
    this.vx += this.p5.random(-noiseScale, noiseScale);
    this.vy += this.p5.random(-noiseScale, noiseScale);

    // Damping / Friction
    this.vx *= 0.9;
    this.vy *= 0.9;

    // Apply velocity
    this.x += this.vx;
    this.y += this.vy;

    // Boundaries
    if (this.x < 50) {
      this.x = 50;
      this.vx *= -1;
    }
    if (this.x > CANVAS_WIDTH - 50) {
      this.x = CANVAS_WIDTH - 50;
      this.vx *= -1;
    }

    // Color logic based on movement
    if (this.vy < -0.5) this.color = '#4ade80'; // Moving up (Green)
    else if (this.vy > 0.5) this.color = '#f87171'; // Moving down (Red)
    else this.color = '#94a3b8'; // Neutral
  }

  display() {
    this.p5.noStroke();
    this.p5.fill(this.color);
    this.p5.circle(this.x, this.y, 4);
  }
}

const CatalystXRaySimulator: React.FC = () => {
  const [scenario, setScenario] = useState<ScenarioType>('MATERIAL');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPhaseText, setCurrentPhaseText] = useState('Ready to Start');

  // Refs for simulation state that P5 needs to access without re-rendering
  const particlesRef = useRef<Particle[]>([]);
  const candlesRef = useRef<Candle[]>([]);
  const currentCandleRef = useRef<Candle | null>(null);
  const simFrameRef = useRef(0);
  const scenarioRef = useRef<ScenarioType>('MATERIAL');

  // Sync state to ref for P5
  useEffect(() => {
    scenarioRef.current = scenario;
  }, [scenario]);

  const resetSimulation = (p5: P5) => {
    simFrameRef.current = 0;
    candlesRef.current = [];
    currentCandleRef.current = {
      open: LEVEL_LOW,
      close: LEVEL_LOW,
      high: LEVEL_LOW,
      low: LEVEL_LOW,
      volume: 0,
      timestamp: 0,
    };

    particlesRef.current = [];
    for (let i = 0; i < PARTICLES_COUNT; i++) {
      particlesRef.current.push(new Particle(p5));
    }
    setCurrentPhaseText('Waiting for News...');
  };

  const setup = (p5: P5, canvasParentRef: Element) => {
    p5.createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT).parent(canvasParentRef);
    resetSimulation(p5);
  };

  const draw = (p5: P5) => {
    p5.background(15, 23, 42); // bg-slate-900

    // 1. Draw Environment (Grid & Levels)
    drawGrid(p5);

    if (!isPlaying) {
      // Just hover particles if paused
      particlesRef.current.forEach((p) => {
        p.targetY = LEVEL_LOW;
        p.update(0.1, 0.01);
        p.display();
      });
      return;
    }

    // 2. Update Simulation Logic (The "Director")
    const frame = simFrameRef.current;
    const currentScenario = scenarioRef.current;
    let targetY = LEVEL_LOW;
    let noise = 0.5;
    let attraction = 0.005;

    // --- SCENARIO LOGIC ---
    // Phase 1: The Impulse (Frames 0-120) - Both Scenarios Same
    if (frame < 120) {
      if (frame === 1)
        setCurrentPhaseText('PHASE 1: NEWS DROP! (Initial Impulse)');
      // Rapid move to resistance
      targetY = p5.map(frame, 0, 100, LEVEL_LOW, LEVEL_RESISTANCE);
      attraction = 0.02; // Strong pull
      if (targetY < LEVEL_RESISTANCE) targetY = LEVEL_RESISTANCE;
    }
    // Phase 2: The Reaction (Frames 120-250) - Divergence
    else if (frame < 250) {
      if (currentScenario === 'MATERIAL') {
        if (frame === 120)
          setCurrentPhaseText('PHASE 2: CONSOLIDATION (Building Energy)');
        // Flagging under resistance
        targetY = LEVEL_RESISTANCE + p5.sin(frame * 0.1) * 10;
        noise = 0.2; // Tightening up
      } else {
        if (frame === 120)
          setCurrentPhaseText('PHASE 2: THE TRAP (False Breakout)');
        // Pop above resistance briefly (The Wick Creator)
        if (frame < 180) {
          targetY = LEVEL_STOP_HUNT; // Push higher
          attraction = 0.01;
        } else {
          setCurrentPhaseText('PHASE 2: REJECTION (Supply Overwhelms)');
          targetY = LEVEL_RESISTANCE + 50; // Start falling
        }
      }
    }
    // Phase 3: The Resolution (Frames 250+)
    else {
      if (currentScenario === 'MATERIAL') {
        if (frame === 250)
          setCurrentPhaseText('PHASE 3: BREAKOUT! (Sustained Momentum)');
        // Moon time
        targetY = LEVEL_HIGH;
        attraction = 0.015;
      } else {
        if (frame === 250)
          setCurrentPhaseText('PHASE 3: THE DROP (Bagholder Creation)');
        // Crash
        targetY = LEVEL_LOW + 50;
        attraction = 0.01;
        noise = 1.0; // Chaos/Panic
      }
    }

    // 3. Update Particles
    let sumY = 0;
    particlesRef.current.forEach((p) => {
      p.targetY = targetY;
      p.update(noise, attraction);
      p.display();
      sumY += p.y;
    });

    // 4. Calculate Price (Average of particles)
    const currentPrice = sumY / PARTICLES_COUNT;

    // 5. Update Candle Logic
    if (currentCandleRef.current) {
      const cc = currentCandleRef.current;
      cc.high = Math.min(cc.high, currentPrice); // Remember Y is inverted
      cc.low = Math.max(cc.low, currentPrice);
      cc.close = currentPrice;

      // Volume grows with particle velocity (simulation)
      // Simplified: Volume grows per frame
      cc.volume += p5.random(10, 50);

      // Check for new candle
      if (frame % FRAMES_PER_CANDLE === 0 && frame > 0) {
        candlesRef.current.push({ ...cc });
        // Start new candle
        currentCandleRef.current = {
          open: cc.close,
          close: cc.close,
          high: cc.close,
          low: cc.close,
          volume: 0,
          timestamp: frame,
        };
      }
    }

    // 6. Draw Chart Overlay
    drawCandles(p5);

    // 7. Advance Frame
    simFrameRef.current++;

    // Stop condition
    if (frame > 400) setIsPlaying(false);
  };

  const drawGrid = (p5: P5) => {
    // Resistance Line
    p5.stroke(251, 191, 36, 100); // Amber 400 transparent
    p5.strokeWeight(2);
    p5.drawingContext.setLineDash([10, 10]);
    p5.line(0, LEVEL_RESISTANCE, CANVAS_WIDTH, LEVEL_RESISTANCE);
    p5.drawingContext.setLineDash([]);
    p5.noStroke();
    p5.fill(251, 191, 36);
    p5.textSize(12);
    p5.text('KEY RESISTANCE / BREAKOUT LEVEL', 10, LEVEL_RESISTANCE - 10);
  };

  const drawCandles = (p5: P5) => {
    const candleWidth = 20;
    const spacing = 40;
    const startX = 50;

    // Helper to draw single candle
    const drawSingleCandle = (c: Candle, index: number, isLive: boolean) => {
      const x = startX + index * spacing;
      const isGreen = c.close < c.open; // Y is inverted

      const color = isGreen ? '#4ade80' : '#f87171';

      p5.stroke(color);
      p5.strokeWeight(2);
      // Wick
      p5.line(x + candleWidth / 2, c.high, x + candleWidth / 2, c.low);

      // Body
      p5.noStroke();
      p5.fill(color);
      // p5 rect takes x, y, w, h.
      const bodyTop = Math.min(c.open, c.close);
      const bodyHeight = Math.abs(c.close - c.open);
      // Ensure minimal height for visibility
      const visualHeight = Math.max(1, bodyHeight);

      p5.rect(x, bodyTop, candleWidth, visualHeight);

      // Volume Bar (at bottom)
      // Scale volume max height 100px
      const volHeight = p5.map(c.volume, 0, 10000, 0, 80);
      p5.fill(color); // Volume same color as candle
      p5.rect(x, CANVAS_HEIGHT - volHeight, candleWidth, volHeight);
    };

    // Draw History
    candlesRef.current.forEach((c, i) => drawSingleCandle(c, i, false));

    // Draw Live Candle
    if (currentCandleRef.current) {
      drawSingleCandle(
        currentCandleRef.current,
        candlesRef.current.length,
        true
      );
    }
  };

  const handlePlay = () => {
    setIsPlaying(true);
    if (simFrameRef.current >= 400) {
      // Auto reset if finished
      // We need to access p5 instance here, but for simplicity in react-p5
      // we handle reset inside the state change or pass a ref.
      // A cleaner way is to just reset frame count, the draw loop handles the rest.
      simFrameRef.current = 0;
      candlesRef.current = [];
      currentCandleRef.current = {
        open: LEVEL_LOW,
        close: LEVEL_LOW,
        high: LEVEL_LOW,
        low: LEVEL_LOW,
        volume: 0,
        timestamp: 0,
      };
    }
  };

  const handleReset = () => {
    setIsPlaying(false);
    simFrameRef.current = 0;
    candlesRef.current = [];
    if (currentCandleRef.current) {
      currentCandleRef.current = {
        open: LEVEL_LOW,
        close: LEVEL_LOW,
        high: LEVEL_LOW,
        low: LEVEL_LOW,
        volume: 0,
        timestamp: 0,
      };
    }
    // Note: Full particle reset happens inside draw loop check or we can trigger re-render
    // For this implementation, pausing resets visuals effectively in the draw loop logic for particles
    setCurrentPhaseText('Ready to Start');
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-slate-800 rounded-xl overflow-hidden shadow-2xl border border-slate-700">
      {/* Header / Controls */}
      <div className="p-6 border-b border-slate-700 flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-850">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <TrendingUp className="text-blue-400" />
            Catalyst X-Ray Mode
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Visualizing the particle flow behind the candles.
          </p>
        </div>

        <div className="flex items-center gap-4 bg-slate-900 p-2 rounded-lg border border-slate-700">
          <div className="flex bg-slate-800 rounded p-1">
            <button
              onClick={() => {
                setScenario('MATERIAL');
                handleReset();
              }}
              className={`px-4 py-2 rounded text-sm font-medium transition-all ${
                scenario === 'MATERIAL'
                  ? 'bg-green-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Scenario A: News Play
            </button>
            <button
              onClick={() => {
                setScenario('FLUFF');
                handleReset();
              }}
              className={`px-4 py-2 rounded text-sm font-medium transition-all ${
                scenario === 'FLUFF'
                  ? 'bg-red-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Scenario B: Pop & Drop
            </button>
          </div>
        </div>
      </div>

      {/* Canvas Container */}
      <div className="relative bg-slate-900 flex justify-center items-center overflow-hidden h-[500px]">
        <div className="absolute top-4 left-4 z-10 bg-slate-800/80 backdrop-blur border border-slate-600 px-4 py-2 rounded text-blue-200 font-mono text-sm">
          {currentPhaseText}
        </div>

        {/* Play Overlay */}
        {!isPlaying && simFrameRef.current === 0 && (
          <div className="absolute z-20 inset-0 bg-black/40 flex items-center justify-center">
            <button
              onClick={handlePlay}
              className="group bg-blue-600 hover:bg-blue-500 text-white rounded-full p-6 shadow-2xl transition-all transform hover:scale-105"
            >
              <Play size={48} className="fill-current ml-1" />
            </button>
          </div>
        )}

        {/* Replay Overlay */}
        {!isPlaying && simFrameRef.current > 0 && (
          <div className="absolute z-20 inset-0 bg-black/40 flex items-center justify-center">
            <button
              onClick={handleReset}
              className="group bg-slate-700 hover:bg-slate-600 text-white rounded-full p-6 shadow-2xl transition-all"
            >
              <RotateCcw
                size={48}
                className="text-slate-200 group-hover:-rotate-90 transition-transform duration-500"
              />
            </button>
          </div>
        )}

        <Sketch setup={setup} draw={draw} />
      </div>

      {/* Legend / Info */}
      <div className="p-4 bg-slate-800 border-t border-slate-700 flex justify-center gap-8 text-sm text-slate-400">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-green-400 shadow-[0_0_10px_rgba(74,222,128,0.5)]"></span>
          <span>Buyers (Particles)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-red-400 shadow-[0_0_10px_rgba(248,113,113,0.5)]"></span>
          <span>Sellers (Particles)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-6 border border-green-400 bg-green-400/20"></div>
          <span>Candle Body</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-8 h-0 border-t-2 border-dashed border-amber-400"></span>
          <span>Resistance Level</span>
        </div>
      </div>

      {/* Instructional Context */}
      <div className="bg-slate-900/50 p-6 border-t border-slate-800">
        <div className="flex items-start gap-3">
          <Info className="text-blue-400 flex-shrink-0 mt-1" size={20} />
          <div>
            <h4 className="text-slate-200 font-semibold mb-1">
              Observation Challenge
            </h4>
            <p className="text-slate-400 text-sm leading-relaxed">
              Watch closely during <strong>Phase 2</strong>. In the{' '}
              <span className="text-green-400">News Play</span>, notice how
              particles consolidate <em>under</em> the line before pushing
              through. In the <span className="text-red-400">Pop & Drop</span>,
              watch the particles create a "false breakout" above the line, get
              rejected, and leave behind a long upper wick on the candle. That
              wick is the footprint of trapped buyers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CatalystXRaySimulator;
