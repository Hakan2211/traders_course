
import React, { useEffect, useRef, useState, useCallback } from 'react';
import p5 from 'p5';

// Fix: Use 'any' for CustomP5 to avoid TypeScript errors regarding missing p5 properties (setup, draw, width, etc.)
// which are not resolving correctly on the extended interface.
type CustomP5 = any;

type GameState = 'idle' | 'running' | 'won' | 'lost_early' | 'lost_late';

const ParabolicSimulator: React.FC = () => {
  const renderRef = useRef<HTMLDivElement>(null);
  const p5Instance = useRef<CustomP5 | null>(null);

  const [gameState, setGameState] = useState<GameState>('idle');
  const [score, setScore] = useState(0);

  // We need a stable reference to setGameState to use inside the p5 sketch
  // without triggering re-initialization of the sketch on every state change.
  const gameStateRef = useRef(gameState);

  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  const handleStateChange = useCallback((newState: GameState) => {
    setGameState(newState);
    if (newState === 'won') {
      setScore((s) => s + 1);
    }
  }, []);

  useEffect(() => {
    if (!renderRef.current) return;

    const sketch = (p: CustomP5) => {
      let price: number[] = [];
      let t = 0;
      let isRunning = false;
      let crashPoint = 0;
      let maxPrice = 0;
      const speed = 0.8; // Slightly faster for better gameplay feel

      // Visual configuration
      const bgColor = [20, 20, 25]; // Dark background
      const gridColor = [40, 40, 50];

      p.setup = () => {
        const width = renderRef.current ? renderRef.current.offsetWidth : 600;
        const height = 350;
        p.createCanvas(width, height).parent(renderRef.current!);
        resetSim();
      };

      // Handle window resize
      p.windowResized = () => {
        const width = renderRef.current ? renderRef.current.offsetWidth : 600;
        p.resizeCanvas(width, 350);
      };

      const resetSim = () => {
        price = [];
        t = 0;
        isRunning = false;
        // Randomize crash point: ensure it's not too immediate but fits on screen
        // We want the crash to happen roughly between 40% and 80% of the screen width usually
        crashPoint = p.random(200, 450);
        maxPrice = 0;
      };

      p.myStart = () => {
        resetSim();
        isRunning = true;
        p.loop();
      };

      p.myShort = () => {
        if (!isRunning) return;

        const currentPrice = price.length > 0 ? price[price.length - 1] : 0;
        const currentMax = maxPrice;

        // LOGIC: Did they short the frontside or the backside?

        // 1. Frontside: Shorting while t < crashPoint (price is still parabolic up)
        // Or strictly, very close to the peak but still before the clear break
        if (t < crashPoint + 10) {
          p.noLoop();
          handleStateChange('lost_early'); // "You stepped in front of the train"
          return;
        }

        // 2. Chasing: Waiting too long.
        // If price has dropped significantly from the highs (e.g., given back 20% of the move's height)
        // We calculate "height" of move as maxPrice (relative to bottom which is ~height-50)
        // Since canvas Y is inverted (0 is top), smaller Y is higher price.

        // Let's approximate the visual range.
        // Peak Y is small (top of screen). Base Y is large (bottom of screen).
        // If currentPrice is significantly larger (lower on screen) than maxPrice (peak).

        const spread = currentPrice - currentMax; // Positive difference
        if (spread > 60) {
          // Arbitrary pixel value representing "too late"
          p.noLoop();
          handleStateChange('lost_late');
          return;
        }

        // 3. Perfect Entry
        p.noLoop();
        handleStateChange('won');
      };

      p.draw = () => {
        p.background(bgColor);

        // Draw Grid
        p.stroke(gridColor);
        p.strokeWeight(1);
        for (let x = 0; x < p.width; x += 50) p.line(x, 0, x, p.height);
        for (let y = 0; y < p.height; y += 50) p.line(0, y, p.width, y);

        if (!isRunning) {
          p.fill(150);
          p.noStroke();
          p.textAlign(p.CENTER);
          p.textSize(16);
          if (gameStateRef.current === 'idle') {
            p.text('Press START SIMULATOR to begin', p.width / 2, p.height / 2);
          }
          // Logic continues to show the static line if game over, handled below by lack of return
          if (price.length === 0) return;
        }

        // Update Physics only if running
        if (isRunning) {
          let y = 0;
          const baseY = p.height - 50;

          if (t < crashPoint) {
            // Parabolic phase: Exponential growth
            // Normalize progress 0 to 1
            let progress = t / crashPoint;
            // Cubic curve for parabolic shape
            let curve = p.pow(progress, 4) * 250;
            // Add noise for realistic "candle" jaggedness
            let noiseVal = (p.noise(t * 0.1) - 0.5) * 20;
            y = baseY - curve + noiseVal;

            // Keep track of the highest price (lowest Y value)
            if (maxPrice === 0 || y < maxPrice) maxPrice = y;
          } else {
            // Crash phase: Rapid drop
            let crashProgress = t - crashPoint; // Frames since crash
            // Steep drop
            let drop = crashProgress * 3;
            let noiseVal = (p.noise(t * 0.1) - 0.5) * 30; // More volatility on the way down
            y = maxPrice + drop + noiseVal;
          }

          price.push(y);
          // Shift array if it gets too long to keep chart moving if needed,
          // but for this mini game, we usually end before scrolling is needed.
          // If we want scrolling:
          if (price.length > p.width) {
            price.shift();
          }

          // Fail safe: If price goes off screen (too high) or user waits indefinitely
          if (y < -50 || (t > crashPoint + 200 && isRunning)) {
            // Auto fail if they just watch it go to zero without shorting
            if (t > crashPoint + 200) {
              p.noLoop();
              handleStateChange('lost_late');
            }
          }

          t += speed * 2;
        }

        // Draw Chart Line
        p.noFill();
        p.strokeWeight(2);

        // Dynamic Color: Green when trending up/flat, Red when crashing
        // Note: Realistically traders look at candle color, but for a line chart:
        // We can color the whole line or segments. Let's color the whole line for simplicity
        // or gradient it.

        p.beginShape();
        for (let i = 0; i < price.length; i++) {
          // Simple visual cue: if we are past crash point, line turns distinct
          // But to simulate "Trap", it should look enticingly green until it isn't.

          // Let's make it green.
          p.stroke(0, 255, 127); // Spring Green

          // Visual Hint: If we are post-crash, maybe the tip turns red?
          if (i > price.length - 10 && t > crashPoint) {
            p.stroke(255, 80, 80);
          }

          p.vertex(i, price[i]);
        }
        p.endShape();

        // Draw Volume Bars
        // Fake volume logic: increasing volume as it goes parabolic, climax at top
        p.noStroke();
        p.fill(255, 255, 255, 30); // Translucent white

        const lastIndex = price.length - 1;
        if (lastIndex >= 0) {
          let volHeight = 20;
          if (t < crashPoint) {
            // Exponential volume growth matching price
            volHeight = p.map(t, 0, crashPoint, 10, 120);
          } else {
            // Climax volume at crash, then tapering or messy
            let dist = t - crashPoint;
            if (dist < 20) volHeight = 150; // Climax spike
            else volHeight = 80 - dist;
          }

          // Add jitter
          volHeight += p.random(-10, 10);
          if (volHeight < 5) volHeight = 5;

          // Draw a simple bar at the current leading edge
          // Note: In a real chart we'd draw history, but here just an indicator of "current volume"
          p.rect(lastIndex, p.height - volHeight, 5, volHeight);

          // Also draw a label
          p.fill(150);
          p.textSize(10);
          p.textAlign(p.RIGHT);
          p.text('VOL', p.width - 10, p.height - 10);
        }
      };
    };

    const myP5 = new p5(sketch);
    p5Instance.current = myP5;

    return () => {
      myP5.remove();
    };
  }, [handleStateChange]); // Dependencies for effect

  // Button Handlers
  const handleStart = () => {
    if (gameState === 'running') return;
    setGameState('running');
    if (p5Instance.current?.myStart) {
      p5Instance.current.myStart();
    }
  };

  const handleShort = () => {
    if (gameState !== 'running') return;
    if (p5Instance.current?.myShort) {
      p5Instance.current.myShort();
    }
  };

  return (
    <div className="flex flex-col items-center bg-slate-900 rounded-xl border border-slate-700 shadow-2xl w-full overflow-hidden my-8">
      {/* Header / Scoreboard */}
      <div className="w-full flex justify-between items-center bg-slate-800 px-6 py-4 border-b border-slate-700">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></span>
            Parabolic Simulator
          </h3>
          <p className="text-xs text-slate-400">
            Wait for the exhaustion crack. Don't fight the trend.
          </p>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-slate-400 text-xs uppercase tracking-wider">
            Account Balance
          </span>
          <span className="text-green-400 font-mono text-xl font-bold">
            ${(10000 + score * 500).toLocaleString()}
          </span>
          <span className="text-xs text-slate-500">Wins: {score}</span>
        </div>
      </div>

      {/* Game Area */}
      <div className="relative w-full h-[350px] bg-black">
        <div ref={renderRef} className="absolute inset-0 z-0"></div>

        {/* Overlays for Game States */}
        {gameState === 'lost_early' && (
          <div className="absolute inset-0 z-10 bg-red-900/90 backdrop-blur-sm flex items-center justify-center flex-col animate-in fade-in duration-300">
            <div className="bg-black/50 p-8 rounded-2xl border border-red-500 text-center max-w-md">
              <h2 className="text-4xl font-bold text-red-500 mb-2">BLOW UP</h2>
              <p className="text-red-100 text-lg mb-6">
                You shorted the <span className="font-bold">Frontside</span>.
                <br />
                <span className="text-sm opacity-80">
                  Momentum was still accelerating. The train ran you over.
                </span>
              </p>
              <button
                onClick={handleStart}
                className="px-8 py-3 bg-white text-red-900 font-bold rounded-lg hover:bg-slate-200 transition-colors uppercase tracking-widest text-sm"
              >
                Re-Simulate
              </button>
            </div>
          </div>
        )}

        {gameState === 'lost_late' && (
          <div className="absolute inset-0 z-10 bg-orange-900/90 backdrop-blur-sm flex items-center justify-center flex-col animate-in fade-in duration-300">
            <div className="bg-black/50 p-8 rounded-2xl border border-orange-500 text-center max-w-md">
              <h2 className="text-4xl font-bold text-orange-500 mb-2">
                TOO LATE
              </h2>
              <p className="text-orange-100 text-lg mb-6">
                You <span className="font-bold">Chased</span> the move.
                <br />
                <span className="text-sm opacity-80">
                  Risk/Reward is poor here. You missed the meat of the move.
                </span>
              </p>
              <button
                onClick={handleStart}
                className="px-8 py-3 bg-white text-orange-900 font-bold rounded-lg hover:bg-slate-200 transition-colors uppercase tracking-widest text-sm"
              >
                Re-Simulate
              </button>
            </div>
          </div>
        )}

        {gameState === 'won' && (
          <div className="absolute inset-0 z-10 bg-green-900/90 backdrop-blur-sm flex items-center justify-center flex-col animate-in fade-in duration-300">
            <div className="bg-black/50 p-8 rounded-2xl border border-green-500 text-center max-w-md">
              <h2 className="text-4xl font-bold text-green-400 mb-2">
                NICE TRADE
              </h2>
              <p className="text-green-100 text-lg mb-6">
                Perfect Timing.
                <br />
                <span className="text-sm opacity-80">
                  You waited for the crack and captured the reversal.
                </span>
              </p>
              <button
                onClick={handleStart}
                className="px-8 py-3 bg-white text-green-900 font-bold rounded-lg hover:bg-slate-200 transition-colors uppercase tracking-widest text-sm"
              >
                Next Trade
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="w-full flex gap-1 bg-slate-800 p-1">
        <button
          disabled={gameState === 'running'}
          onClick={handleStart}
          className={`flex-1 py-4 font-bold text-sm uppercase tracking-wider transition-all
                ${
                  gameState === 'running'
                    ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg'
                }`}
        >
          {gameState === 'idle'
            ? 'Start Simulation'
            : gameState === 'running'
            ? 'Simulating Market...'
            : 'Try Again'}
        </button>

        <button
          disabled={gameState !== 'running'}
          onClick={handleShort}
          className={`flex-1 py-4 font-bold text-xl uppercase tracking-wider transition-all
                ${
                  gameState === 'running'
                    ? 'bg-red-600 hover:bg-red-500 text-white shadow-[0_0_20px_rgba(220,38,38,0.5)] scale-[1.02] active:scale-95'
                    : 'bg-slate-700 text-slate-500 cursor-not-allowed opacity-50'
                }`}
        >
          SHORT NOW
        </button>
      </div>

      {/* Legend / Info */}
      <div className="bg-slate-900 p-4 w-full flex justify-between text-xs text-slate-500 border-t border-slate-700">
        <div className="flex gap-4">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span>Parabolic Phase</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-red-500"></div>
            <span>Exhaustion Phase</span>
          </div>
        </div>
        <div>Goal: Identify the top</div>
      </div>
    </div>
  );
};

export default ParabolicSimulator;
