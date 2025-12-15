
import React, { useRef, useEffect, useState, useCallback } from 'react';
import EnvironmentWrapper from '@/components/mdx_components/2d_environment/environmentWrapper';
import { Button } from '@/components/ui/button';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  RefreshCw,
  DollarSign,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Game Constants
const CANVAS_HEIGHT = 300;
const INITIAL_PRICE = 100;
const SPEED = 2; // Pixels per frame

type GameState = 'IDLE' | 'RUNNING' | 'FINISHED';
type Outcome = 'NONE' | 'FADE' | 'PERFECT' | 'CHASE' | 'MISSED';

interface DataPoint {
  price: number;
  isPump: boolean;
}

const PatienceTrainer: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number | null>(null);

  // Game Logic State (Refs for Animation Loop)
  const gameStateRef = useRef<GameState>('IDLE');
  const outcomeRef = useRef<Outcome>('NONE');
  const purchasedRef = useRef<boolean>(false);

  // UI State (for rendering React components)
  const [gameState, _setGameState] = useState<GameState>('IDLE');
  const [outcome, _setOutcome] = useState<Outcome>('NONE');
  const [score, setScore] = useState<{ pnl: number; rrr: string }>({
    pnl: 0,
    rrr: '0:0',
  });
  const [feedback, setFeedback] = useState<string>('');
  const [purchased, _setPurchased] = useState<boolean>(false);

  // Sync helpers
  const setGameStateUI = (val: GameState) => {
    gameStateRef.current = val;
    _setGameState(val);
  };

  const setOutcomeUI = (val: Outcome) => {
    outcomeRef.current = val;
    _setOutcome(val);
  };

  const setPurchasedUI = (val: boolean) => {
    purchasedRef.current = val;
    _setPurchased(val);
  };

  // Refs for mutable game data
  const dataRef = useRef<DataPoint[]>([]);
  const scrollOffsetRef = useRef<number>(0);
  const pumpStartTimeRef = useRef<number>(0); // In frames
  const frameCountRef = useRef<number>(0);
  const entryPriceRef = useRef<number | null>(null);
  const entryFrameRef = useRef<number | null>(null);
  const currentPriceRef = useRef<number>(INITIAL_PRICE);

  // We define drawFrame first so resetGame can use it if we weren't using hoisting,
  // but with const functions we need to be careful.
  // Easier to use a ref for the draw function or just define it before usage if possible,
  // OR rely on the fact that useEffect calls resetGame after render.

  const drawFrame = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    // Handle Resize / Retina
    const rect = container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    // Only resize if dimensions changed to avoid clearing canvas unnecessarily,
    // but here we clear every frame anyway.
    if (
      canvas.width !== rect.width * dpr ||
      canvas.height !== CANVAS_HEIGHT * dpr
    ) {
      canvas.width = rect.width * dpr;
      canvas.height = CANVAS_HEIGHT * dpr;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Reset transform to avoid stacking scales
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = CANVAS_HEIGHT;

    // 1. Clear Background
    ctx.clearRect(0, 0, width, height);

    // 2. Draw Grid
    ctx.strokeStyle = '#334155'; // Slate 700
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 0; i < height; i += 50) {
      ctx.moveTo(0, i);
      ctx.lineTo(width, i);
    }
    ctx.stroke();

    // 3. Calculate Viewport
    const data = dataRef.current;
    const totalPoints = data.length;
    const pointsOnScreen = Math.ceil(width / SPEED);
    const startIndex = Math.max(0, totalPoints - pointsOnScreen);

    // 4. Draw Price Line
    if (totalPoints > 0) {
      ctx.beginPath();
      ctx.lineWidth = 2;
      ctx.lineJoin = 'round';

      // Use refs for styling checks
      const currentOutcome = outcomeRef.current;
      const currentFrame = frameCountRef.current;
      const pumpStart = pumpStartTimeRef.current;

      for (let i = startIndex; i < totalPoints; i++) {
        const point = data[i];
        const x = (i - startIndex) * SPEED;
        const y = height / 2 - (point.price - INITIAL_PRICE) * 4;

        if (i === startIndex) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }

      if (currentOutcome === 'FADE') ctx.strokeStyle = '#ef4444'; // Red
      else if (currentOutcome === 'PERFECT' && currentFrame > pumpStart)
        ctx.strokeStyle = '#10b981'; // Green
      else if (currentOutcome === 'CHASE')
        ctx.strokeStyle = '#fbbf24'; // Yellow
      else ctx.strokeStyle = '#3b82f6'; // Blue

      ctx.shadowBlur = 10;
      ctx.shadowColor = ctx.strokeStyle;
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    // 5. Draw Entry Marker
    if (entryPriceRef.current !== null && entryFrameRef.current !== null) {
      // Calculate X position based on frame index relative to start index
      const entryRelativeIndex = entryFrameRef.current + 50 - startIndex; // +50 accounts for pre-fill

      // Actually: dataRef index = frame + 50.
      // entryFrameRef is stored as frameCount.
      // So data index of entry is entryFrameRef + 50.
      const dataIndex = entryFrameRef.current + 50;

      if (dataIndex >= startIndex) {
        const x = (dataIndex - startIndex) * SPEED;
        const y = height / 2 - (entryPriceRef.current - INITIAL_PRICE) * 4;

        ctx.beginPath();
        ctx.strokeStyle = '#ffffff';
        ctx.setLineDash([5, 5]);
        ctx.lineWidth = 1;
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = '#ffffff';
        ctx.font = '12px sans-serif';
        ctx.fillText('ENTRY', 10, y - 5);

        // Draw vertical line at entry
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.stroke();
      }
    }
  }, []);

  const resetGame = useCallback(() => {
    setGameStateUI('IDLE');
    setOutcomeUI('NONE');
    setPurchasedUI(false);
    setFeedback('');
    setScore({ pnl: 0, rrr: '0:0' });

    dataRef.current = [];
    // Pre-fill some data so line doesn't start at left edge abruptly
    for (let i = 0; i < 50; i++) {
      dataRef.current.push({ price: INITIAL_PRICE, isPump: false });
    }

    scrollOffsetRef.current = 0;
    frameCountRef.current = 0;
    entryPriceRef.current = null;
    entryFrameRef.current = null;
    currentPriceRef.current = INITIAL_PRICE;

    drawFrame();
  }, [drawFrame]);

  const startGame = () => {
    resetGame();
    setGameStateUI('RUNNING');
    pumpStartTimeRef.current = Math.floor(Math.random() * 600) + 200;
  };

  const handleBuy = () => {
    if (gameStateRef.current !== 'RUNNING' || purchasedRef.current) return;

    setPurchasedUI(true);
    entryPriceRef.current = currentPriceRef.current;
    entryFrameRef.current = frameCountRef.current;

    const framesUntilPump = pumpStartTimeRef.current - frameCountRef.current;

    if (framesUntilPump > 200) {
      setOutcomeUI('FADE');
      setFeedback('🛑 Entered Too Early: "Boredom killed the trade."');
      setScore({ pnl: -150, rrr: '1:-1' });
    } else if (framesUntilPump <= 200 && framesUntilPump >= -20) {
      setOutcomeUI('PERFECT');
      setFeedback('🚀 Perfect Entry: Anticipation captured!');
      setScore({ pnl: 1250, rrr: '1:8' });
    } else {
      setOutcomeUI('CHASE');
      setFeedback('🤡 Exit Liquidity: You chased the green candle.');
      setScore({ pnl: -400, rrr: '1:-2' });
    }
  };

  const updatePhysics = useCallback(() => {
    frameCountRef.current += 1;
    const frame = frameCountRef.current;
    const pumpStart = pumpStartTimeRef.current;
    const currentOutcome = outcomeRef.current;

    let volatility = 0.5;
    let trend = 0;

    if (
      currentOutcome === 'FADE' &&
      entryFrameRef.current &&
      frame > entryFrameRef.current + 20
    ) {
      // Fade if entered too early (stops out)
      trend = -0.8;
      volatility = 1.2;
    } else if (frame >= pumpStart) {
      // Pump logic
      if (currentOutcome === 'FADE') {
        // If already faded/stopped out, maybe it recovers later but user is out
        trend = 0.1;
      } else {
        // Real pump
        trend = 3.5;
        volatility = 2.0;
      }
    } else {
      // Consolidation logic
      trend = 0;
      // Mean reversion to keep it in range
      if (currentPriceRef.current > INITIAL_PRICE + 5) trend = -0.1;
      if (currentPriceRef.current < INITIAL_PRICE - 5) trend = 0.1;
    }

    const noise = (Math.random() - 0.5) * volatility;
    currentPriceRef.current += trend + noise;

    dataRef.current.push({
      price: currentPriceRef.current,
      isPump: frame >= pumpStart && currentOutcome !== 'FADE',
    });

    // End game conditions
    if (
      currentOutcome !== 'NONE' &&
      entryFrameRef.current &&
      frame > entryFrameRef.current + 200
    ) {
      setGameStateUI('FINISHED');
    }

    if (currentOutcome === 'NONE' && frame > pumpStart + 150) {
      setOutcomeUI('MISSED');
      setFeedback('📉 Opportunity Missed: Hesitation is costly.');
      setGameStateUI('FINISHED');
    }
  }, []);

  const loop = useCallback(() => {
    if (gameStateRef.current === 'RUNNING') {
      updatePhysics();
    }
    drawFrame();
    requestRef.current = requestAnimationFrame(loop);
  }, [drawFrame, updatePhysics]);

  useEffect(() => {
    // Only start the loop once on mount
    resetGame();
    requestRef.current = requestAnimationFrame(loop);

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [loop, resetGame]);

  return (
    <EnvironmentWrapper
      height="450px"
      className="flex flex-col relative border-t-4 border-t-blue-500"
    >
      {/* Header / Stats Bar */}
      <div className="w-full h-16 bg-slate-900/50 border-b border-slate-700 flex items-center justify-between px-6 z-10">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div
              className={cn(
                'w-3 h-3 rounded-full animate-pulse',
                gameState === 'RUNNING' ? 'bg-green-500' : 'bg-slate-500'
              )}
            />
            <span className="text-sm font-mono text-slate-400 uppercase tracking-wider">
              {gameState === 'IDLE' ? 'DISCONNECTED' : 'LIVE FEED'}
            </span>
          </div>
          <div className="h-6 w-px bg-slate-700 mx-2" />
          <div className="flex flex-col">
            <span className="text-xs text-slate-500 uppercase">Symbol</span>
            <span className="text-sm font-bold text-slate-200">RVS-SPLT</span>
          </div>
        </div>

        {/* PnL Display */}
        <div className="flex items-center gap-6">
          <div className="text-right">
            <div className="text-xs text-slate-500 uppercase">
              Unrealized P&L
            </div>
            <div
              className={cn(
                'text-lg font-mono font-bold',
                score.pnl > 0
                  ? 'text-green-400'
                  : score.pnl < 0
                  ? 'text-red-400'
                  : 'text-slate-200'
              )}
            >
              {score.pnl > 0 ? '+' : ''}
              {score.pnl > 0 || score.pnl < 0 ? `$${score.pnl}.00` : '--'}
            </div>
          </div>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div
        ref={containerRef}
        className="flex-1 w-full relative group cursor-crosshair"
      >
        <canvas ref={canvasRef} className="w-full h-full block" />

        {/* Game Over / Feedback Overlay */}
        {(gameState === 'FINISHED' || outcome !== 'NONE') && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-slate-900/90 border border-slate-700 p-4 rounded-xl backdrop-blur-md shadow-2xl flex items-center gap-4 animate-in fade-in slide-in-from-top-4 duration-300 z-30">
            {outcome === 'PERFECT' && (
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            )}
            {outcome === 'FADE' && (
              <TrendingUp className="w-8 h-8 text-red-500 rotate-180" />
            )}
            {outcome === 'CHASE' && (
              <AlertTriangle className="w-8 h-8 text-yellow-500" />
            )}
            {outcome === 'MISSED' && (
              <Activity className="w-8 h-8 text-slate-400" />
            )}

            <div>
              <h3
                className={cn(
                  'font-bold text-lg',
                  outcome === 'PERFECT'
                    ? 'text-green-400'
                    : outcome === 'FADE'
                    ? 'text-red-400'
                    : outcome === 'CHASE'
                    ? 'text-yellow-400'
                    : 'text-slate-300'
                )}
              >
                {outcome === 'PERFECT' && 'GREAT TRADE!'}
                {outcome === 'FADE' && 'STOPPED OUT'}
                {outcome === 'CHASE' && 'BAD ENTRY'}
                {outcome === 'MISSED' && 'MISSED MOVE'}
              </h3>
              <p className="text-slate-300 text-sm">{feedback}</p>
              {outcome === 'PERFECT' && (
                <p className="text-xs text-green-500/80 mt-1 font-mono">
                  Captured 1:8 Risk/Reward
                </p>
              )}
            </div>
          </div>
        )}

        {/* Start Overlay */}
        {gameState === 'IDLE' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm z-20">
            <h2 className="text-2xl font-bold text-white mb-2">
              Patience Trainer
            </h2>
            <p className="text-slate-300 mb-6 max-w-md text-center">
              The stock is consolidating. Wait for the setup, but don't hesitate
              when it moves. Too early? You get faded. Too late? You are exit
              liquidity.
            </p>
            <Button onClick={startGame} size="lg" className="animate-pulse">
              <Activity className="w-5 h-5" /> Initialize Simulation
            </Button>
          </div>
        )}
      </div>

      {/* Control Deck */}
      <div className="h-20 bg-slate-900 border-t border-slate-700 flex items-center justify-between px-6 z-10">
        <div className="flex gap-2 text-xs text-slate-500 font-mono">
          <div>
            <span className="block text-slate-600">FLOAT</span>
            <span className="text-slate-300">1.2M</span>
          </div>
          <div className="w-px bg-slate-800 h-8 mx-2" />
          <div>
            <span className="block text-slate-600">AVG VOL</span>
            <span className="text-slate-300">Low</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Instant Reset during gameplay */}
          {gameState === 'RUNNING' && (
            <Button
              onClick={startGame}
              variant="secondary"
              className="px-4"
              title="Reset Simulation"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          )}

          {gameState === 'FINISHED' ? (
            <Button
              onClick={startGame}
              variant="secondary"
              size="lg"
              className="w-48"
            >
              <RefreshCw className="w-4 h-4" /> Replay Setup
            </Button>
          ) : (
            <Button
              onClick={handleBuy}
              disabled={gameState !== 'RUNNING' || purchased}
              variant={purchased ? 'secondary' : 'completedButton'}
              size="lg"
              className="w-48 shadow-emerald-900/50"
            >
              {purchased ? (
                'POSITION OPEN'
              ) : (
                <>
                  <DollarSign className="w-5 h-5" /> BUY MARKET
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </EnvironmentWrapper>
  );
};

export default PatienceTrainer;
