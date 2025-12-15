
import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Settings,
  TrendingUp,
  Activity,
  Anchor,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceDot,
} from 'recharts';
import { scenarios, scenarioDetails, ScenarioType } from '../utils/scenarios';

// --- Types ---
type StopMethod = 'fixed' | 'atr' | 'technical';
const METHOD_ORDER: StopMethod[] = ['fixed', 'atr', 'technical'];

const SCENARIO_INSIGHTS: Record<ScenarioType, string> = {
  strong_trend:
    'All three trails stay alive — watch how the structural stop rides the trend longest.',
  choppy_rally:
    'ATR dynamically widens in the chop zone while the fixed stop often gets shaken out.',
  parabolic:
    'The fixed trail is quickest to lock the vertical gains once the blow-off cracks.',
  reversal:
    'Technical swing-low logic re-enters the move fastest after the V-bottom turnaround.',
};

interface SimulationState {
  isActive: boolean;
  isFinished: boolean;
  currentIndex: number;
}

interface MethodResult {
  exited: boolean;
  exitIndex: number;
  exitPrice: number;
  profit: number;
  grade: string;
  history: { index: number; stopPrice: number }[];
}

// --- Helper Components ---
const StatusBadge = ({
  exited,
  profit,
}: {
  exited: boolean;
  profit: number;
}) => {
  if (!exited)
    return (
      <span className="text-xs font-bold text-blue-400 border border-blue-400/30 px-2 py-0.5 rounded animate-pulse">
        ACTIVE
      </span>
    );
  if (profit > 0)
    return (
      <span className="text-xs font-bold text-green-400 border border-green-400/30 px-2 py-0.5 rounded">
        WIN (+{profit.toFixed(2)})
      </span>
    );
  return (
    <span className="text-xs font-bold text-red-400 border border-red-400/30 px-2 py-0.5 rounded">
      LOSS ({profit.toFixed(2)})
    </span>
  );
};

const GradeBadge = ({ grade }: { grade: string }) => {
  const color = grade.startsWith('A')
    ? 'text-green-400'
    : grade.startsWith('B')
    ? 'text-blue-400'
    : grade.startsWith('C')
    ? 'text-yellow-400'
    : 'text-red-400';
  return <span className={`text-lg font-black ${color}`}>{grade}</span>;
};

// --- Main Component ---
const TrailingStopVisualizer: React.FC = () => {
  // Config State
  const [scenario, setScenario] = useState<ScenarioType>('strong_trend');
  const [speed, setSpeed] = useState<number>(100); // ms per tick

  // Params State
  const [fixedDist, setFixedDist] = useState(5);
  const [atrMult, setAtrMult] = useState(2);
  const [techBuffer, setTechBuffer] = useState(2);

  // Simulation State
  const [simState, setSimState] = useState<SimulationState>({
    isActive: false,
    isFinished: false,
    currentIndex: 0,
  });

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Derived Data
  const data = useMemo(() => scenarios[scenario], [scenario]);
  const entryPrice = data[0].price;
  const scenarioInsight = SCENARIO_INSIGHTS[scenario];

  const methodConfigs = useMemo<
    Record<
      StopMethod,
      {
        title: string;
        description: string;
        icon: React.ReactNode;
        accentBorder: string;
        accentText: string;
        badgeBg: string;
      }
    >
  >(
    () => ({
      fixed: {
        title: `Fixed ${fixedDist}-Pip Trail`,
        description:
          'Simple trailing stop. Moves up a fixed distance behind price. Good for steady trends, vulnerable to volatility.',
        icon: <Anchor className="w-4 h-4 text-blue-400" />,
        accentBorder: 'border-blue-800/40',
        accentText: 'text-blue-300',
        badgeBg: 'bg-blue-800/10 text-blue-200',
      },
      atr: {
        title: `${atrMult}x ATR Dynamic Trail`,
        description:
          'Adapts to volatility. Widens when choppy, tightens when calm. The professional standard.',
        icon: <Activity className="w-4 h-4 text-blue-400" />,
        accentBorder: 'border-blue-800/40',
        accentText: 'text-blue-300',
        badgeBg: 'bg-blue-800/10 text-blue-200',
      },
      technical: {
        title: 'Technical (Swing Low)',
        description: `Trails below structural market lows (minus ${techBuffer} pip buffer). Respects market structure.`,
        icon: <TrendingUp className="w-4 h-4 text-cyan-400" />,
        accentBorder: 'border-cyan-500/40',
        accentText: 'text-cyan-300',
        badgeBg: 'bg-cyan-500/10 text-cyan-200',
      },
    }),
    [fixedDist, atrMult, techBuffer]
  );

  // -- Simulation Logic --

  // We calculate the FULL history for each method based on current params whenever params change
  // Then the visualizer just slices this history based on currentIndex.

  const methodCalculations = useMemo(() => {
    const results: Record<StopMethod, MethodResult> = {
      fixed: {
        exited: false,
        exitIndex: -1,
        exitPrice: 0,
        profit: 0,
        grade: 'F',
        history: [],
      },
      atr: {
        exited: false,
        exitIndex: -1,
        exitPrice: 0,
        profit: 0,
        grade: 'F',
        history: [],
      },
      technical: {
        exited: false,
        exitIndex: -1,
        exitPrice: 0,
        profit: 0,
        grade: 'F',
        history: [],
      },
    };

    (['fixed', 'atr', 'technical'] as StopMethod[]).forEach((method) => {
      let currentStop = -Infinity;
      const history = [];
      let hasExited = false;
      let exitIdx = -1;
      let exitPx = 0;

      for (let i = 0; i < data.length; i++) {
        const point = data[i];

        if (hasExited) {
          history.push({ index: i, stopPrice: exitPx }); // Flatline after exit
          continue;
        }

        let potentialStop = -Infinity;
        // Calculate potential new stop level
        if (method === 'fixed') {
          potentialStop = point.price - fixedDist;
        } else if (method === 'atr') {
          potentialStop = point.price - point.atr * atrMult;
        } else if (method === 'technical') {
          // Use the simulated swing low from data
          potentialStop = (point.swingLow || point.price - 5) - techBuffer;
        }

        // Initialize stop on first bar
        if (i === 0) {
          currentStop = potentialStop;
        } else {
          // Trailing logic: Only move UP (for longs)
          if (potentialStop > currentStop) {
            currentStop = potentialStop;
          }
        }

        // Check for stop out (Low < Stop) -> simpler simulation: Price < Stop
        // In real life we check Low, here we check Price for visual simplicity on line chart
        if (i > 0 && point.price <= currentStop) {
          hasExited = true;
          exitIdx = i;
          exitPx = currentStop;
          history.push({ index: i, stopPrice: currentStop });
        } else {
          history.push({ index: i, stopPrice: currentStop });
        }
      }

      // Calculate final stats
      const finalPrice = hasExited ? exitPx : data[data.length - 1].price;
      const profit = finalPrice - entryPrice;

      // Calculate Grade (Simple logic based on potential capture)
      const maxPrice = Math.max(...data.map((d) => d.price));
      const maxPotentialProfit = maxPrice - entryPrice;
      const captureRatio = profit / maxPotentialProfit;

      let grade = 'F';
      if (profit < 0) grade = 'D';
      else if (captureRatio > 0.8) grade = 'A+';
      else if (captureRatio > 0.7) grade = 'A';
      else if (captureRatio > 0.6) grade = 'B+';
      else if (captureRatio > 0.5) grade = 'B';
      else if (captureRatio > 0.3) grade = 'C';
      else grade = 'C-';

      if (!hasExited && simState.isFinished) {
        // If still active at end of simulation
        grade = 'In Progress';
      }

      results[method] = {
        exited: hasExited,
        exitIndex: exitIdx,
        exitPrice: exitPx,
        profit,
        grade,
        history,
      };
    });

    return results;
  }, [data, fixedDist, atrMult, techBuffer, simState.isFinished, entryPrice]);

  // -- Playback Control --
  const togglePlay = () => {
    setSimState((prev) => ({ ...prev, isActive: !prev.isActive }));
  };

  const reset = () => {
    setSimState({ isActive: false, isFinished: false, currentIndex: 0 });
  };

  useEffect(() => {
    if (simState.isActive && !simState.isFinished) {
      timerRef.current = setInterval(() => {
        setSimState((prev) => {
          if (prev.currentIndex >= data.length - 1) {
            return { ...prev, isActive: false, isFinished: true };
          }
          return { ...prev, currentIndex: prev.currentIndex + 1 };
        });
      }, speed);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [simState.isActive, simState.isFinished, data.length, speed]);

  const finishedLeader: StopMethod | null = simState.isFinished
    ? METHOD_ORDER.reduce<StopMethod | null>((best, method) => {
        if (!best) return method;
        return methodCalculations[method].profit >
          methodCalculations[best].profit
          ? method
          : best;
      }, null)
    : null;

  const currentPrice =
    data[Math.min(simState.currentIndex, data.length - 1)].price;

  // -- Render Helper for Charts --
  const renderChart = (method: StopMethod) => {
    const result = methodCalculations[method];
    const { title, description, icon } = methodConfigs[method];

    // Check if THIS method has exited by current index
    const hasExitedNow =
      result.exited && result.exitIndex <= simState.currentIndex;
    const currentProfit = hasExitedNow
      ? result.profit
      : data[simState.currentIndex].price - entryPrice;

    // Data for chart: slice original data + append stop level
    const chartData = data.slice(0, simState.currentIndex + 1).map((pt, i) => ({
      ...pt,
      stop: result.history[i]?.stopPrice,
    }));

    return (
      <div
        key={method}
        className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden flex flex-col h-[320px]"
      >
        {/* Header */}
        <div className="p-3 border-b border-slate-700 bg-slate-900/50 flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2 text-slate-200 font-semibold mb-1">
              {icon}
              <span>{title}</span>
            </div>
            <p className="text-xs text-slate-400 leading-tight h-8">
              {description}
            </p>
          </div>
          <div className="text-right">
            <StatusBadge exited={hasExitedNow} profit={currentProfit} />
            {simState.isFinished && hasExitedNow && (
              <div className="mt-1 flex justify-end items-center gap-1">
                <span className="text-xs text-slate-500 uppercase tracking-wider">
                  Grade
                </span>
                <GradeBadge grade={result.grade} />
              </div>
            )}
          </div>
        </div>

        {/* Chart */}
        <div className="flex-1 w-full relative">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <XAxis hide />
              <YAxis
                domain={['auto', 'auto']}
                hide
                padding={{ top: 20, bottom: 20 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  borderColor: '#334155',
                  color: '#f1f5f9',
                }}
                itemStyle={{ fontSize: '12px' }}
                labelStyle={{ display: 'none' }}
                formatter={(value: number) => value.toFixed(2)}
              />

              {/* Profit Zone Filling */}
              <defs>
                <linearGradient
                  id={`gradient-${method}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>

              {/* Price Line */}
              <Line
                type="monotone"
                dataKey="price"
                stroke="#94a3b8"
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />

              {/* Stop Line */}
              <Line
                type="stepAfter"
                dataKey="stop"
                stroke="#f43f5e"
                strokeWidth={2}
                strokeDasharray="4 4"
                dot={false}
                isAnimationActive={false}
              />

              {/* Entry Dot */}
              <ReferenceDot
                x={0}
                y={entryPrice}
                r={4}
                fill="#3b82f6"
                stroke="none"
              />

              {/* Exit Dot (if exited) */}
              {hasExitedNow && (
                <ReferenceDot
                  x={result.exitIndex}
                  y={result.exitPrice}
                  r={4}
                  fill="#ef4444"
                  stroke="white"
                  strokeWidth={2}
                />
              )}
            </LineChart>
          </ResponsiveContainer>

          {/* Overlay Stats */}
          <div className="absolute top-2 left-3 bg-slate-900/80 backdrop-blur px-2 py-1 rounded border border-slate-700 text-xs font-mono text-slate-300">
            Current: {data[simState.currentIndex].price.toFixed(2)}
          </div>
          <div className="absolute bottom-2 right-3 bg-slate-900/80 backdrop-blur px-2 py-1 rounded border border-slate-700 text-xs font-mono text-red-400">
            Stop: {result.history[simState.currentIndex]?.stopPrice.toFixed(2)}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-2xl overflow-hidden">
      {/* --- Control Panel --- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 border-b border-slate-800">
        {/* Left: Scenario & Playback */}
        <div className="lg:col-span-8 p-6 space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-400" />
                Trailing Stop Race
              </h2>
              <p className="text-slate-400 text-sm mt-1">
                Compare which method captures the most profit.
              </p>
            </div>

            <div className="flex bg-slate-800 rounded-lg p-1 border border-slate-700">
              {(Object.keys(scenarios) as ScenarioType[]).map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setScenario(s);
                    reset();
                  }}
                  disabled={simState.isActive}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    scenario === s
                      ? 'bg-blue-800 text-white shadow-lg'
                      : 'text-slate-400 hover:text-white hover:bg-slate-700'
                  } ${
                    simState.isActive ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {scenarioDetails[s].label}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-slate-950 rounded-lg p-4 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                onClick={togglePlay}
                disabled={simState.isFinished}
                className={`flex items-center gap-2 px-6 py-2 rounded-md font-bold text-white transition-all w-full sm:w-auto justify-center ${
                  simState.isActive
                    ? 'bg-amber-600 hover:bg-amber-700'
                    : simState.isFinished
                    ? 'bg-slate-700 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {simState.isActive ? <Pause size={18} /> : <Play size={18} />}
                {simState.isActive
                  ? 'Pause'
                  : simState.isFinished
                  ? 'Finished'
                  : 'Start Simulation'}
              </button>

              <button
                onClick={reset}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors"
                title="Reset"
              >
                <RotateCcw size={18} />
              </button>
            </div>
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <div className="flex-1">
                <div className="flex justify-between text-xs text-slate-500 mb-1">
                  <span>Progress</span>
                  <span>
                    {Math.round(
                      (simState.currentIndex / (data.length - 1)) * 100
                    )}
                    %
                  </span>
                </div>
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-800 transition-all duration-300"
                    style={{
                      width: `${
                        (simState.currentIndex / (data.length - 1)) * 100
                      }%`,
                    }}
                  ></div>
                </div>
              </div>

              <select
                className="bg-slate-900 border border-slate-700 text-xs text-slate-300 rounded px-2 py-1 outline-none focus:border-blue-800"
                value={speed}
                onChange={(e) => setSpeed(Number(e.target.value))}
              >
                <option value={200}>Slow</option>
                <option value={100}>Normal</option>
                <option value={30}>Fast</option>
                <option value={10}>Instant</option>
              </select>
            </div>
          </div>
        </div>

        {/* Right: Parameter Config */}
        <div className="lg:col-span-4 bg-slate-950/50 p-6 border-l border-slate-800 flex flex-col justify-center space-y-5">
          <div className="flex items-center gap-2 text-slate-300 font-semibold mb-2">
            <Settings className="w-4 h-4 text-blue-400" />
            <span>Configuration</span>
          </div>
          <div className="space-y-4">
            <div>
              <label className="flex justify-between text-xs font-medium text-slate-400 mb-1">
                Fixed Distance{' '}
                <span className="text-slate-200">{fixedDist} pips</span>
              </label>
              <input
                type="range"
                min="1"
                max="20"
                step="1"
                value={fixedDist}
                onChange={(e) => setFixedDist(Number(e.target.value))}
                disabled={simState.isActive}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-800 disabled:opacity-50"
              />
            </div>
            <div>
              <label className="flex justify-between text-xs font-medium text-slate-400 mb-1">
                ATR Multiplier{' '}
                <span className="text-slate-200">{atrMult}x</span>
              </label>
              <input
                type="range"
                min="1"
                max="5"
                step="0.5"
                value={atrMult}
                onChange={(e) => setAtrMult(Number(e.target.value))}
                disabled={simState.isActive}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-800 disabled:opacity-50"
              />
            </div>
            <div>
              <label className="flex justify-between text-xs font-medium text-slate-400 mb-1">
                Tech Buffer{' '}
                <span className="text-slate-200">{techBuffer} pips</span>
              </label>
              <input
                type="range"
                min="0"
                max="10"
                step="1"
                value={techBuffer}
                onChange={(e) => setTechBuffer(Number(e.target.value))}
                disabled={simState.isActive}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500 disabled:opacity-50"
              />
            </div>
          </div>

          <div className="text-xs text-slate-500 italic border-t border-slate-800 pt-4">
            *Adjust parameters before starting to see how they impact survival.
          </div>
        </div>
      </div>

      {/* --- Visualization Grid --- */}
      <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        {METHOD_ORDER.map((method) => renderChart(method))}
      </div>

      {/* --- Insights & Standings --- */}
      <div className="px-6 pb-6">
        <div className="bg-slate-950 rounded-lg border border-slate-800 p-4 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="text-xs font-mono uppercase tracking-[0.3em] text-slate-500">
                Simulation Notes
              </p>
              <h3 className="text-lg font-semibold text-white mt-1">
                {scenarioDetails[scenario].label}
              </h3>
              <p className="text-sm text-slate-400 mt-1">{scenarioInsight}</p>
            </div>
            <div className="text-sm text-slate-300 bg-slate-900/70 border border-slate-800 rounded-lg px-4 py-3 w-full md:w-auto">
              <p className="text-xs uppercase text-slate-500 tracking-wider">
                Current Price
              </p>
              <p className="text-2xl font-bold text-white">
                {currentPrice.toFixed(2)}
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                {simState.isFinished
                  ? 'Simulation complete'
                  : 'Streaming bar-by-bar'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {METHOD_ORDER.map((method) => {
              const result = methodCalculations[method];
              const config = methodConfigs[method];
              const hasExitedNow =
                result.exited && result.exitIndex <= simState.currentIndex;
              const liveProfit = currentPrice - entryPrice;
              const displayedProfit = hasExitedNow ? result.profit : liveProfit;
              const latestStop =
                result.history[
                  Math.min(simState.currentIndex, result.history.length - 1)
                ]?.stopPrice ??
                result.history[result.history.length - 1]?.stopPrice ??
                entryPrice;
              const isLeader = finishedLeader === method && simState.isFinished;
              const gradeDisplay =
                simState.isFinished || hasExitedNow ? result.grade : '--';

              return (
                <div
                  key={method}
                  className={`rounded-lg border bg-slate-900/60 p-4 ${
                    isLeader ? config.accentBorder : 'border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-slate-200 font-semibold">
                      {config.icon}
                      <span>{config.title}</span>
                    </div>
                    {isLeader && (
                      <span
                        className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${config.badgeBg}`}
                      >
                        Leader
                      </span>
                    )}
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <p className="text-slate-500 uppercase tracking-wider text-[10px]">
                        Captured
                      </p>
                      <p
                        className={`text-lg font-semibold ${config.accentText}`}
                      >
                        {displayedProfit >= 0 ? '+' : ''}
                        {displayedProfit.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500 uppercase tracking-wider text-[10px]">
                        Last Stop
                      </p>
                      <p className="text-base font-semibold text-red-300">
                        {latestStop?.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500 uppercase tracking-wider text-[10px]">
                        Exit
                      </p>
                      <p className="text-base font-semibold text-slate-200">
                        {hasExitedNow ? result.exitPrice.toFixed(2) : 'Active'}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500 uppercase tracking-wider text-[10px]">
                        Grade
                      </p>
                      <p className="text-base font-semibold text-slate-200">
                        {gradeDisplay}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Educational Context Footer */}
      <div className="bg-blue-950/30 border-t border-blue-900/50 p-4 text-center">
        <p className="text-blue-200 text-sm">
          <span className="font-bold">Pro Tip:</span> In the{' '}
          {scenarioDetails[scenario].label} scenario, {scenarioInsight}
        </p>
      </div>
    </div>
  );
};

export default TrailingStopVisualizer;
