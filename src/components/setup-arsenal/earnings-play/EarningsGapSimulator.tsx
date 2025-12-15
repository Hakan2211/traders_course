
import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Play,
  RotateCcw,
  TrendingDown,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Candle, GameState } from './types';

// Robust P5 Wrapper with ResizeObserver
const P5Wrapper = ({ sketch }: { sketch: (p: any) => void }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const p5Instance = useRef<any>(null);

  useEffect(() => {
    if (!window.hasOwnProperty('p5')) {
      console.error('P5.js not found on window. Ensure it is loaded via CDN.');
      return;
    }

    // Initialize P5
    // @ts-ignore
    p5Instance.current = new window.p5(sketch, containerRef.current);

    // Responsive Canvas Handling
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect;
        // Only resize if dimensions are valid and instance exists
        if (p5Instance.current && width > 0 && height > 0) {
          p5Instance.current.resizeCanvas(width, height);
        }
      }
    });

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      observer.disconnect();
      p5Instance.current?.remove();
    };
  }, [sketch]);

  return <div ref={containerRef} className="h-full w-full overflow-hidden" />;
};

const EarningsGapSimulator = () => {
  const [gameState, setGameState] = useState<GameState>('waiting');
  const [feedback, setFeedback] = useState('Wait for the market open...');
  const [pnl, setPnl] = useState<number>(0);
  const [remountKey, setRemountKey] = useState(0);

  // Refs to communicate with P5 loop.
  const gameRefs = useRef({
    gameState: 'waiting' as GameState,
    shouldShort: false,
    setFeedback: (t: string) => {},
    setGameState: (s: GameState) => {},
    setPnl: (p: number) => {},
  });

  // Assign current state/setters to ref mutable properties
  gameRefs.current.setFeedback = setFeedback;
  gameRefs.current.setGameState = setGameState;
  gameRefs.current.setPnl = setPnl;
  gameRefs.current.gameState = gameState;

  const handleShort = () => {
    if (gameState === 'playing') {
      gameRefs.current.shouldShort = true;
    }
  };

  const handleReset = () => {
    setRemountKey((prev) => prev + 1);
    setGameState('waiting');
    setFeedback('Market Closed. Initializing...');
    setPnl(0);
  };

  // The P5 Sketch Function
  const sketch = useCallback((p: any) => {
    let candles: Candle[] = [];
    let frame = 0;

    // Config
    const GAP_HEIGHT = 100;
    const BASE_PRICE = 200;

    // Game State Internal
    let currentPrice = BASE_PRICE;
    let entryPrice = 0;
    let targetPrice = BASE_PRICE + 20; // Partial gap fill
    let stopLossPrice = 0;
    let isShort = false;
    let localState: GameState = 'playing';

    p.setup = () => {
      p.createCanvas(100, 100); // Initial size, resized by observer
      p.frameRate(30);
      resetGame();
    };

    const resetGame = () => {
      candles = [];
      frame = 0;
      currentPrice = BASE_PRICE + GAP_HEIGHT;
      entryPrice = 0;
      isShort = false;
      localState = 'playing';

      gameRefs.current.setGameState('playing');
      gameRefs.current.setFeedback(
        'MARKET OPEN! Gapping Up +15%. Wait for the setup...'
      );
      gameRefs.current.shouldShort = false;
      gameRefs.current.setPnl(0);

      // Pre-market data (flat)
      for (let i = 0; i < 30; i++) {
        addCandle(BASE_PRICE, BASE_PRICE, BASE_PRICE, BASE_PRICE);
      }
    };

    const addCandle = (o: number, c: number, h: number, l: number) => {
      // x is calculated dynamically in draw
      candles.push({
        open: o,
        close: c,
        high: h,
        low: l,
        x: 0,
        volume: p.random(10, 50),
      });
    };

    p.draw = () => {
      p.background(15, 23, 42); // slate-950

      // Input Handling
      if (gameRefs.current.shouldShort && localState === 'playing') {
        gameRefs.current.shouldShort = false;
        executeShort();
      }

      // Simulation Step
      if (localState === 'playing' || localState === 'entered') {
        updatePrice();
      }

      // --- AUTO SCALING --- //
      // 1. Calculate Price Range (Y-Axis)
      let minP = BASE_PRICE;
      let maxP = BASE_PRICE + GAP_HEIGHT + 20; // Ensure initial view covers the gap

      // Expand to fit current price action
      for (const c of candles) {
        if (c.low < minP) minP = c.low;
        if (c.high > maxP) maxP = c.high;
      }
      // Add visual padding
      const range = maxP - minP || 1;
      const paddedMin = minP - range * 0.15;
      const paddedMax = maxP + range * 0.15;

      const mapY = (price: number) =>
        p.map(price, paddedMin, paddedMax, p.height - 30, 30);

      // 2. Calculate Time Range (X-Axis)
      // "Fit to Screen" logic
      // Always keep some empty space on the right (buffer)
      const buffer = 30;
      const totalSlots = Math.max(60, candles.length + buffer);
      const slotWidth = p.width / totalSlots;
      const candleWidth = Math.max(1.5, slotWidth * 0.65); // Dynamic width, min 1.5px

      // DRAW GRID / TARGETS
      drawGrid(mapY);

      // DRAW CANDLES
      p.noStroke();
      for (let i = 0; i < candles.length; i++) {
        const c = candles[i];
        const x = i * slotWidth + (slotWidth - candleWidth) / 2;

        const yOpen = mapY(c.open);
        const yClose = mapY(c.close);
        const yHigh = mapY(c.high);
        const yLow = mapY(c.low);

        const isGreen = c.close >= c.open;

        p.stroke(isGreen ? '#22c55e' : '#ef4444');
        p.strokeWeight(1);
        p.line(x + candleWidth / 2, yHigh, x + candleWidth / 2, yLow);

        p.fill(isGreen ? '#22c55e' : '#ef4444');
        p.noStroke();
        let h = Math.abs(yClose - yOpen);
        if (h < 1) h = 1;
        p.rect(x, Math.min(yOpen, yClose), candleWidth, h);
      }

      // DRAW ENTRY LINES
      if (localState !== 'waiting' && isShort) {
        const yEntry = mapY(entryPrice);
        const yStop = mapY(stopLossPrice);

        // Entry
        p.stroke(250, 204, 21); // Yellow
        p.drawingContext.setLineDash([3, 3]);
        p.line(0, yEntry, p.width, yEntry);

        // Stop
        p.stroke(239, 68, 68); // Red
        p.line(0, yStop, p.width, yStop);
        p.drawingContext.setLineDash([]);
      }

      // DRAW CURRENT PRICE MARKER
      drawUI(mapY, currentPrice, localState);
    };

    const drawGrid = (mapY: (n: number) => number) => {
      // Target Line
      const yTarget = mapY(targetPrice);
      p.stroke(34, 197, 94, 80); // Green transparent
      p.drawingContext.setLineDash([5, 5]);
      p.line(0, yTarget, p.width, yTarget);
      p.drawingContext.setLineDash([]);

      p.fill(34, 197, 94);
      p.noStroke();
      p.textSize(10);
      p.textAlign(p.LEFT, p.BOTTOM);
      p.text('TARGET (GAP FILL)', 5, yTarget - 2);

      // Gap Start Line (Base Price)
      const yBase = mapY(BASE_PRICE);
      p.stroke(148, 163, 184, 40); // Slate 400 transparent
      p.line(0, yBase, p.width, yBase);
    };

    const drawUI = (
      mapY: (n: number) => number,
      price: number,
      state: GameState
    ) => {
      const y = mapY(price);

      // Price Line
      p.stroke(59, 130, 246, 50);
      p.line(0, y, p.width, y);

      // Label on Right
      p.noStroke();
      p.fill(
        state === 'lost' ? '#ef4444' : state === 'won' ? '#22c55e' : '#3b82f6'
      );

      // Tag shape
      p.beginShape();
      p.vertex(p.width, y - 10);
      p.vertex(p.width - 35, y - 10);
      p.vertex(p.width - 45, y);
      p.vertex(p.width - 35, y + 10);
      p.vertex(p.width, y + 10);
      p.endShape(p.CLOSE);

      p.fill(255);
      p.textSize(10);
      p.textAlign(p.CENTER, p.CENTER);
      p.text(price.toFixed(0), p.width - 20, y);
    };

    const executeShort = () => {
      isShort = true;
      entryPrice = currentPrice;
      stopLossPrice = currentPrice + 15;

      if (frame < 150) {
        localState = 'lost';
        gameRefs.current.setGameState('lost');
        gameRefs.current.setFeedback(
          'STOPPED OUT! Too early! You entered during the volatility squeeze.'
        );
      } else {
        localState = 'entered';
        gameRefs.current.setGameState('entered');
        gameRefs.current.setFeedback('ENTRY FILLED. Watching for gap fill...');
      }
    };

    const updatePrice = () => {
      frame++;
      let volatility = 0;
      let trend = 0;

      if (frame < 150) {
        volatility = p.random(-3, 6);
        trend = 0.3;
      } else {
        volatility = p.random(-4, 2);
        trend = -0.5;
      }

      let change = volatility + trend;
      currentPrice += change;

      if (frame % 5 === 0) {
        let open = currentPrice - change; // approx
        let close = currentPrice;
        let high = Math.max(open, close) + p.random(0, 4);
        let low = Math.min(open, close) - p.random(0, 4);
        addCandle(open, close, high, low);
      }

      if (localState === 'entered') {
        gameRefs.current.setPnl(entryPrice - currentPrice);
        if (currentPrice > stopLossPrice) {
          localState = 'lost';
          gameRefs.current.setGameState('lost');
          gameRefs.current.setFeedback('STOPPED OUT. Highs broken.');
        } else if (currentPrice < targetPrice) {
          localState = 'won';
          gameRefs.current.setGameState('won');
          gameRefs.current.setFeedback('TARGET HIT! Gap fill achieved.');
        }
      } else if (localState === 'playing') {
        // Check for missed opportunity (gap filled without entry)
        if (currentPrice < targetPrice) {
          localState = 'missed';
          gameRefs.current.setGameState('missed');
          gameRefs.current.setFeedback(
            'MISSED OPPORTUNITY. Gap filled without entry.'
          );
        }
      }
    };
  }, []);

  return (
    <div className="flex flex-col w-full h-[800px] relative border border-slate-800 bg-slate-950 rounded-xl overflow-hidden min-h-[500px]">
      {/* Header / HUD */}
      <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-start pointer-events-none">
        <div className="bg-slate-900/80 backdrop-blur border border-slate-700 p-3 rounded-lg shadow-xl">
          <div className="text-xs text-slate-400 font-mono uppercase tracking-wider mb-1">
            Status
          </div>
          <div
            className={cn(
              'text-sm font-bold flex items-center gap-2',
              gameState === 'lost'
                ? 'text-red-400'
                : gameState === 'won'
                ? 'text-green-400'
                : gameState === 'missed'
                ? 'text-yellow-400'
                : 'text-blue-400'
            )}
          >
            {gameState === 'playing' && (
              <Play className="w-4 h-4 animate-pulse" />
            )}
            {gameState === 'waiting' && <RotateCcw className="w-4 h-4" />}
            {gameState === 'won' && <CheckCircle2 className="w-4 h-4" />}
            {gameState === 'lost' && <AlertCircle className="w-4 h-4" />}
            {gameState === 'missed' && <AlertCircle className="w-4 h-4" />}
            <span className="uppercase">{gameState}</span>
          </div>
        </div>

        <div className="bg-slate-900/80 backdrop-blur border border-slate-700 p-3 rounded-lg shadow-xl text-right">
          <div className="text-xs text-slate-400 font-mono uppercase tracking-wider mb-1">
            Unrealized P&L
          </div>
          <div
            className={cn(
              'text-lg font-mono font-bold',
              pnl > 0
                ? 'text-green-400'
                : pnl < 0
                ? 'text-red-400'
                : 'text-white'
            )}
          >
            {pnl > 0 ? '+' : ''}
            {pnl.toFixed(2)}
          </div>
        </div>
      </div>

      {/* P5 Canvas Container */}
      <div className="flex-grow w-full relative overflow-hidden">
        <P5Wrapper key={remountKey} sketch={sketch} />

        {/* Overlay Message for Win/Loss/Missed */}
        {(gameState === 'won' ||
          gameState === 'lost' ||
          gameState === 'missed') && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-20 animate-in fade-in duration-300">
            <div
              className={cn(
                'p-8 rounded-2xl border-2 shadow-2xl max-w-md text-center transform scale-100',
                gameState === 'won'
                  ? 'bg-green-950/90 border-green-500/50'
                  : gameState === 'missed'
                  ? 'bg-yellow-950/90 border-yellow-500/50'
                  : 'bg-red-950/90 border-red-500/50'
              )}
            >
              <h2
                className={cn(
                  'text-3xl font-bold mb-2',
                  gameState === 'won'
                    ? 'text-green-400'
                    : gameState === 'missed'
                    ? 'text-yellow-400'
                    : 'text-red-400'
                )}
              >
                {gameState === 'won'
                  ? 'TARGET HIT'
                  : gameState === 'missed'
                  ? 'MISSED MOVE'
                  : 'STOPPED OUT'}
              </h2>
              <p className="text-slate-200 text-lg leading-relaxed">
                {feedback}
              </p>
              <button
                onClick={handleReset}
                className="mt-6 px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-full font-bold transition-all border border-slate-600 flex items-center gap-2 mx-auto"
              >
                <RotateCcw className="w-4 h-4" /> Try Again
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Controls */}
      <div className="h-20 bg-slate-900 border-t border-slate-800 flex items-center justify-between px-6 shrink-0 z-10 relative">
        <div className="text-slate-400 text-sm max-w-lg">
          <span className="text-yellow-500 font-bold mr-2">TIP:</span>
          {gameState === 'waiting'
            ? "Click 'Short' when you think the top is in."
            : feedback}
        </div>

        <div className="flex gap-4">
          {gameState === 'playing' && (
            <button
              onClick={handleShort}
              className="bg-red-500 hover:bg-red-600 active:scale-95 transition-all text-white font-bold py-2 px-8 rounded shadow-[0_0_20px_rgba(239,68,68,0.4)] flex items-center gap-2"
            >
              <TrendingDown className="w-5 h-5" />
              SHORT
            </button>
          )}
          {gameState === 'entered' && (
            <button
              disabled
              className="bg-slate-700 text-slate-400 font-bold py-2 px-8 rounded cursor-not-allowed opacity-50"
            >
              POSITION OPEN
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EarningsGapSimulator;
