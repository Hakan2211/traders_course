
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Play,
  TrendingUp,
  TrendingDown,
  Clock,
  Award,
  AlertTriangle,
  RotateCcw,
  XCircle,
  HandCoins,
} from 'lucide-react';
import { GameState, ScenarioType, TradeResult, ChartDataPoint } from './types';

const INITIAL_PRICE = 100; // Represents entry price
const ROUND_DURATION_MS = 8000; // 8 seconds total
const TICK_RATE_MS = 30; // Smooth updates
const MAX_ROUNDS = 10;

// Game Logic Constants
const TARGET_WIN = 500; // +$5.00
const TEMPTATION_WIN = 200; // +$2.00
const TARGET_LOSS = -500; // -$5.00
const TEMPTATION_LOSS = -100; // -$1.00

export const DispositionSimulator: React.FC = () => {
  // Game State
  const [status, setStatus] = useState<GameState['status']>('INTRO');
  const [round, setRound] = useState(1);
  const [history, setHistory] = useState<TradeResult[]>([]);

  // Round State
  const [pnl, setPnl] = useState(0);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [timeLeft, setTimeLeft] = useState(ROUND_DURATION_MS);
  const [currentScenario, setCurrentScenario] =
    useState<ScenarioType>('WINNER');
  const [isPositionOpen, setIsPositionOpen] = useState(false);
  const [roundOutcome, setRoundOutcome] = useState<TradeResult | null>(null);

  const startTimeRef = useRef<number>(0);
  const timerRef = useRef<number | null>(null);

  // --- Logic ---

  const generatePrice = (elapsed: number, scenario: ScenarioType): number => {
    // PnL generation logic based on time
    let val = 0;

    // Noise
    const noise = (Math.random() - 0.5) * 20;

    if (scenario === 'WINNER') {
      // 0 - 1500ms: Rapidly shoot to +200
      // 1500ms - 5000ms: Wiggle around +200 (The Temptation to sell)
      // 5000ms - 8000ms: Shoot to +500

      if (elapsed < 1500) {
        val = (elapsed / 1500) * TEMPTATION_WIN;
      } else if (elapsed < 5000) {
        // Wiggle
        val = TEMPTATION_WIN + Math.sin(elapsed * 0.005) * 30;
      } else {
        // Shoot up
        const progress = (elapsed - 5000) / 3000;
        val = TEMPTATION_WIN + (TARGET_WIN - TEMPTATION_WIN) * progress;
      }
    } else {
      // Loser
      // 0 - 1500ms: Drop to -100
      // 1500ms - 5000ms: Wiggle around -100 (The Hope it comes back)
      // 5000ms - 8000ms: Drop to -500

      if (elapsed < 1500) {
        val = (elapsed / 1500) * TEMPTATION_LOSS;
      } else if (elapsed < 5000) {
        // Wiggle
        val = TEMPTATION_LOSS + Math.sin(elapsed * 0.005) * 20;
      } else {
        // Crash
        const progress = (elapsed - 5000) / 3000;
        val = TEMPTATION_LOSS + (TARGET_LOSS - TEMPTATION_LOSS) * progress;
      }
    }

    return val + noise;
  };

  const startRound = () => {
    const isWinner = Math.random() > 0.5;
    setCurrentScenario(isWinner ? 'WINNER' : 'LOSER');
    setChartData([]);
    setPnl(0);
    setTimeLeft(ROUND_DURATION_MS);
    setIsPositionOpen(true);
    setRoundOutcome(null);
    setStatus('PLAYING');
    startTimeRef.current = Date.now();
  };

  const endRound = useCallback(
    (outcome: TradeResult['outcome']) => {
      if (timerRef.current) clearInterval(timerRef.current);
      setIsPositionOpen(false);

      const duration = Date.now() - startTimeRef.current;

      // Determine specific outcome based on timing
      let refinedOutcome = outcome;
      if (currentScenario === 'WINNER') {
        if (duration < 5000) refinedOutcome = 'EARLY_EXIT'; // Paper Hands
        else refinedOutcome = 'FULL_TARGET'; // Diamond Hands
      } else {
        if (duration < 3000) refinedOutcome = 'OPTIMAL_EXIT'; // Good cut
        else if (duration > 5000) refinedOutcome = 'HELD_LOSS'; // Disaster
        else refinedOutcome = 'STOPPED_OUT'; // Okay stop
      }

      const finalResult: TradeResult = {
        id: round,
        scenario: currentScenario,
        pnl: pnl,
        duration: duration,
        outcome: refinedOutcome,
      };

      setRoundOutcome(finalResult);
      setHistory((prev) => [...prev, finalResult]);
      setStatus('ROUND_SUMMARY');
    },
    [round, currentScenario, pnl]
  );

  // Game Loop
  useEffect(() => {
    if (status !== 'PLAYING') return;

    timerRef.current = window.setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const newTimeLeft = Math.max(0, ROUND_DURATION_MS - elapsed);

      const currentPnl = generatePrice(elapsed, currentScenario);
      setPnl(currentPnl);

      // Add to chart
      setChartData((prev) => {
        // We track PnL directly in chart data for simplicity
        const newData = [...prev, { t: elapsed, price: currentPnl }];
        if (newData.length > 200) return newData.slice(-200);
        return newData;
      });

      if (newTimeLeft <= 0) {
        // Forced exit
        endRound(currentScenario === 'WINNER' ? 'FULL_TARGET' : 'HELD_LOSS');
        return;
      }

      setTimeLeft(newTimeLeft);
    }, TICK_RATE_MS);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [status, currentScenario, endRound]);

  const handleClosePosition = () => {
    // Logic is handled in endRound with refinedOutcome
    endRound('OPTIMAL_EXIT'); // Placeholder, refined inside
  };

  const handleNext = () => {
    if (round >= MAX_ROUNDS) {
      setStatus('GAME_SUMMARY');
    } else {
      setRound((r) => r + 1);
      startRound();
    }
  };

  const handleRestart = () => {
    setRound(1);
    setHistory([]);
    setStatus('INTRO');
  };

  // --- Rendering ---

  // Chart Rendering
  const renderChart = () => {
    if (chartData.length === 0) return null;

    // Fixed scale for consistent visual reference
    const maxY = 600;
    const minY = -600;
    const range = maxY - minY;

    const points = chartData
      .map((d, i) => {
        const x = (d.t / ROUND_DURATION_MS) * 100;
        // Invert Y because SVG 0 is top
        const y = 100 - ((d.price - minY) / range) * 100;
        return `${x},${y}`;
      })
      .join(' ');

    const zeroY = 100 - ((0 - minY) / range) * 100;
    const isProfit = pnl >= 0;

    return (
      <svg
        className="w-full h-full overflow-visible"
        preserveAspectRatio="none"
        viewBox="0 0 100 100"
      >
        {/* Zero Line */}
        <line
          x1="0"
          y1={zeroY}
          x2="100"
          y2={zeroY}
          stroke="#475569"
          strokeWidth="1"
          strokeDasharray="4"
        />

        {/* Temptation Lines */}
        <line
          x1="0"
          y1={100 - ((200 - minY) / range) * 100}
          x2="100"
          y2={100 - ((200 - minY) / range) * 100}
          stroke="#1e293b"
          strokeWidth="0.5"
        />
        <line
          x1="0"
          y1={100 - ((-100 - minY) / range) * 100}
          x2="100"
          y2={100 - ((-100 - minY) / range) * 100}
          stroke="#1e293b"
          strokeWidth="0.5"
        />

        {/* Path */}
        <polyline
          fill="none"
          stroke={isProfit ? '#22c55e' : '#ef4444'}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
          vectorEffect="non-scaling-stroke"
        />
        {/* Dot */}
        {chartData.length > 0 && (
          <circle
            cx={timeLeft === 0 ? 100 : (1 - timeLeft / ROUND_DURATION_MS) * 100}
            cy={100 - ((pnl - minY) / range) * 100}
            r="4"
            fill={isProfit ? '#22c55e' : '#ef4444'}
            stroke="white"
            strokeWidth="2"
          />
        )}
      </svg>
    );
  };

  // Screens

  if (status === 'INTRO') {
    return (
      <div className="bg-slate-900 text-white p-8 rounded-xl shadow-2xl max-w-2xl mx-auto my-12 border border-slate-700 font-sans">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-6 ring-4 ring-blue-900">
            <TrendingUp className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold mb-4">
            The Disposition Effect Challenge
          </h2>
          <p className="text-slate-300 mb-8 text-lg leading-relaxed">
            A rapid-fire mini-game to prove if you cut winners short.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 text-left">
            <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
              <h4 className="text-green-400 font-bold mb-2 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" /> Scenario A: The Winner
              </h4>
              <p className="text-sm text-slate-400">
                Starts green. A button appears:{' '}
                <strong>"CASH OUT NOW (+$200)"</strong>.
                <br />
                <br />
                <span className="text-white">If you wait 5 seconds</span>, it
                hits <span className="text-green-400 font-bold">+$500</span>.
                <br />
                <span className="text-white">If you click early</span>, you get
                the{' '}
                <span className="text-amber-400 font-bold">"Paper Hands"</span>{' '}
                badge.
              </p>
            </div>
            <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
              <h4 className="text-red-400 font-bold mb-2 flex items-center gap-2">
                <TrendingDown className="w-4 h-4" /> Scenario B: The Loser
              </h4>
              <p className="text-sm text-slate-400">
                Starts red. A button appears:{' '}
                <strong>"CUT LOSS (-$100)"</strong>.
                <br />
                <br />
                <span className="text-white">If you wait</span>, it crashes to{' '}
                <span className="text-red-400 font-bold">-$500</span>.
                <br />
                <span className="text-white">If you cut fast</span>, you
                survive.
              </p>
            </div>
          </div>

          <button
            onClick={startRound}
            className="bg-green-600 hover:bg-green-500 text-white font-bold py-4 px-10 rounded-lg text-lg transition-all shadow-lg hover:shadow-green-500/20 flex items-center justify-center mx-auto gap-2 w-full md:w-auto"
          >
            <Play className="w-5 h-5" /> START CHALLENGE (10 ROUNDS)
          </button>
        </div>
      </div>
    );
  }

  if (status === 'GAME_SUMMARY') {
    const winners = history.filter((h) => h.scenario === 'WINNER');
    const losers = history.filter((h) => h.scenario === 'LOSER');

    // Calculate average hold time
    const avgWinnerHold =
      winners.reduce((acc, curr) => acc + curr.duration, 0) /
      (winners.length || 1);
    const avgLoserHold =
      losers.reduce((acc, curr) => acc + curr.duration, 0) /
      (losers.length || 1);

    // Disposition Ratio: How much longer do you hold losers than winners?
    // If you hold losers for 6s and winners for 2s, ratio is 3.0.
    const ratio = avgWinnerHold > 0 ? avgLoserHold / avgWinnerHold : 0;

    const paperHandsCount = winners.filter(
      (w) => w.outcome === 'EARLY_EXIT'
    ).length;
    const diamondHandsCount = winners.filter(
      (w) => w.outcome === 'FULL_TARGET'
    ).length;
    const disasterCount = losers.filter(
      (l) => l.outcome === 'HELD_LOSS'
    ).length;

    let title = 'Result: DISPOSITION EFFECT CONFIRMED';
    let color = 'text-red-400';
    let description = `You held losers ${ratio.toFixed(
      1
    )}x longer than winners.`;

    if (ratio < 1.2 && disasterCount === 0 && paperHandsCount < 2) {
      title = 'Result: DISCIPLINED TRADER';
      color = 'text-green-400';
      description = 'You cut losers fast and let winners run. Impressive.';
    } else if (paperHandsCount > winners.length / 2) {
      title = 'Result: PAPER HANDS';
      color = 'text-amber-400';
      description = 'You consistently cut your winners way too early.';
    }

    return (
      <div className="bg-slate-900 text-white p-8 rounded-xl shadow-2xl max-w-2xl mx-auto my-12 border border-slate-700">
        <div className="text-center mb-8">
          <h2 className={`text-2xl md:text-3xl font-bold mb-2 ${color}`}>
            {title}
          </h2>
          <p className="text-xl text-slate-300">{description}</p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-slate-800 p-4 rounded-lg flex flex-col items-center justify-center">
            <div className="text-slate-400 text-xs uppercase font-bold tracking-wider mb-1">
              Avg Winner Hold
            </div>
            <div className="text-3xl font-mono text-green-400">
              {(avgWinnerHold / 1000).toFixed(1)}s
            </div>
          </div>
          <div className="bg-slate-800 p-4 rounded-lg flex flex-col items-center justify-center">
            <div className="text-slate-400 text-xs uppercase font-bold tracking-wider mb-1">
              Avg Loser Hold
            </div>
            <div className="text-3xl font-mono text-red-400">
              {(avgLoserHold / 1000).toFixed(1)}s
            </div>
          </div>
        </div>

        <div className="space-y-2 mb-8 text-sm">
          <div className="flex justify-between bg-slate-800/50 p-3 rounded">
            <span className="text-slate-400">Diamond Hands (Held Winners)</span>
            <span className="font-bold">
              {diamondHandsCount} / {winners.length}
            </span>
          </div>
          <div className="flex justify-between bg-slate-800/50 p-3 rounded">
            <span className="text-slate-400">
              Paper Hands (Cut Winners Early)
            </span>
            <span className="font-bold text-amber-400">
              {paperHandsCount} / {winners.length}
            </span>
          </div>
          <div className="flex justify-between bg-slate-800/50 p-3 rounded">
            <span className="text-slate-400">
              Disasters (Held Losers Too Long)
            </span>
            <span className="font-bold text-red-400">
              {disasterCount} / {losers.length}
            </span>
          </div>
        </div>

        <button
          onClick={handleRestart}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded w-full flex items-center justify-center gap-2"
        >
          <RotateCcw className="w-5 h-5" /> Retry Challenge
        </button>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 text-white rounded-xl shadow-2xl max-w-2xl mx-auto my-12 border border-slate-700 overflow-hidden relative font-sans">
      {/* Header */}
      <div className="bg-slate-800 p-4 flex justify-between items-center border-b border-slate-700">
        <div className="flex items-center gap-3">
          <span className="font-bold text-slate-200">
            TRADE {round}/{MAX_ROUNDS}
          </span>
          <div
            className={`px-2 py-0.5 rounded text-xs font-bold ${
              currentScenario === 'WINNER'
                ? 'bg-green-900 text-green-300'
                : 'bg-red-900 text-red-300'
            }`}
          >
            {status === 'PLAYING'
              ? 'LIVE'
              : currentScenario === 'WINNER'
              ? 'WINNER SCENARIO'
              : 'LOSER SCENARIO'}
          </div>
        </div>
        <div className="flex items-center gap-2 font-mono">
          <Clock className="w-4 h-4 text-slate-400" />
          <span>{(timeLeft / 1000).toFixed(1)}s</span>
        </div>
      </div>

      {/* Chart Area */}
      <div className="h-72 bg-slate-900 relative p-0">
        <div className="absolute inset-0 p-4 z-0">{renderChart()}</div>

        {/* PnL Overlay */}
        <div className="absolute top-6 left-6 z-10">
          <div
            className={`text-5xl font-black font-mono tracking-tighter transition-colors duration-100 ${
              pnl >= 0 ? 'text-green-500' : 'text-red-500'
            }`}
          >
            {pnl > 0 ? '+' : ''}
            {pnl.toFixed(0)}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="p-4 bg-slate-800 border-t border-slate-700">
        {status === 'PLAYING' ? (
          <button
            onClick={handleClosePosition}
            className={`w-full py-6 rounded-lg font-bold text-2xl shadow-xl transition-all active:scale-[0.98] flex items-center justify-center gap-3 ${
              pnl >= 0
                ? 'bg-green-600 hover:bg-green-500 text-white ring-4 ring-green-900/50'
                : 'bg-red-600 hover:bg-red-500 text-white ring-4 ring-red-900/50'
            }`}
          >
            {pnl >= 0 ? (
              <>
                <HandCoins className="w-8 h-8" /> CASH OUT NOW (+
                {pnl.toFixed(0)})
              </>
            ) : (
              <>
                <XCircle className="w-8 h-8" /> CUT LOSS ({pnl.toFixed(0)})
              </>
            )}
          </button>
        ) : (
          <div className="text-center py-2">
            <div className="mb-6">
              {roundOutcome?.outcome === 'EARLY_EXIT' && (
                <div className="animate-bounce text-amber-400 font-bold text-xl flex items-center justify-center gap-2">
                  <AlertTriangle className="w-6 h-6" /> PAPER HANDS! You missed
                  out on +{TARGET_WIN}.
                </div>
              )}
              {roundOutcome?.outcome === 'HELD_LOSS' && (
                <div className="animate-pulse text-red-500 font-bold text-xl flex items-center justify-center gap-2">
                  <TrendingDown className="w-6 h-6" /> DISASTER! You held until
                  -{Math.abs(TARGET_LOSS)}.
                </div>
              )}
              {roundOutcome?.outcome === 'FULL_TARGET' && (
                <div className="text-green-400 font-bold text-xl flex items-center justify-center gap-2">
                  <Award className="w-6 h-6" /> DIAMOND HANDS! Perfect exit.
                </div>
              )}
              {(roundOutcome?.outcome === 'STOPPED_OUT' ||
                roundOutcome?.outcome === 'OPTIMAL_EXIT') && (
                <div className="text-blue-300 font-bold text-xl flex items-center justify-center gap-2">
                  <div className="w-6 h-6 rounded-full border-2 border-blue-300 flex items-center justify-center text-xs">
                    OK
                  </div>{' '}
                  GOOD STOP. Small loss taken.
                </div>
              )}
            </div>
            <button
              onClick={handleNext}
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-12 rounded-lg text-lg shadow-lg hover:shadow-blue-500/20 transition-all"
            >
              Next Trade →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
