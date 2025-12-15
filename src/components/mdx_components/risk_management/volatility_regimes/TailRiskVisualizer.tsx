
import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Play,
  Pause,
  RefreshCw,
  AlertTriangle,
  Info,
  ShieldAlert,
  TrendingDown,
} from 'lucide-react';
import { TabMode, MarketEvent, SimulationResult } from './types';

// --- DATA ---
const HISTORICAL_EVENTS: MarketEvent[] = [
  {
    year: 1987,
    name: 'Black Monday',
    sigma: -20,
    description: 'S&P 500 drops 22.6% in one day.',
    actualDrop: '-22.6%',
  },
  {
    year: 1997,
    name: 'Asian Financial Crisis',
    sigma: -5.5,
    description: 'Currency devaluations spread globally.',
    actualDrop: '-7%',
  },
  {
    year: 1998,
    name: 'LTCM Collapse',
    sigma: -6.8,
    description: 'Nobel prize winning hedge fund implodes.',
    actualDrop: '-10%',
  },
  {
    year: 2000,
    name: 'Dotcom Burst',
    sigma: -4.2,
    description: 'Tech bubble burst.',
    actualDrop: '-5%',
  },
  {
    year: 2001,
    name: '9/11 Attacks',
    sigma: -5.8,
    description: 'Markets close for 4 days, open down.',
    actualDrop: '-7.1%',
  },
  {
    year: 2008,
    name: 'Lehman Collapse',
    sigma: -9.2,
    description: 'Global financial system freeze.',
    actualDrop: '-9%',
  },
  {
    year: 2010,
    name: 'Flash Crash',
    sigma: -7.5,
    description: 'Dow drops 1000 pts in minutes.',
    actualDrop: '-9%',
  },
  {
    year: 2011,
    name: 'US Credit Downgrade',
    sigma: -6.5,
    description: 'S&P downgrades US debt.',
    actualDrop: '-6.7%',
  },
  {
    year: 2015,
    name: 'Swiss Franc De-peg',
    sigma: -25,
    description: 'EUR/CHF drops 30% in minutes.',
    actualDrop: '-30%',
  },
  {
    year: 2016,
    name: 'Brexit Vote',
    sigma: -8.1,
    description: 'GBP crashes overnight.',
    actualDrop: '-8%',
  },
  {
    year: 2020,
    name: 'COVID Crash',
    sigma: -11,
    description: 'Fastest 30% drop in history.',
    actualDrop: '-12%',
  },
  {
    year: 2022,
    name: 'Russia/Ukraine',
    sigma: -4.5,
    description: 'Global geopolitical shock.',
    actualDrop: '-4%',
  },
];

// --- MATH HELPERS ---

// Standard Normal Distribution PDF
const normalPDF = (x: number, mean = 0, std = 1) => {
  return (
    (1 / (std * Math.sqrt(2 * Math.PI))) *
    Math.exp(-0.5 * Math.pow((x - mean) / std, 2))
  );
};

// Fat Tailed Distribution PDF (approximated with a t-distribution-like mix)
const fatTailPDF = (x: number) => {
  // Mixture model: 80% Normal(0,1) + 20% Normal(0, 5)
  // This creates the "tall peak" (calm markets) and "fat tails" (extreme events)
  return 0.8 * normalPDF(x, 0, 0.8) + 0.2 * normalPDF(x, 0, 4);
};

// --- COMPONENTS ---

const TailRiskVisualizer: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabMode>(TabMode.TIMELINE);
  const [currentYear, setCurrentYear] = useState<number>(1980);
  const [isPlaying, setIsPlaying] = useState(false);

  // Simulator State
  const [userStopLoss, setUserStopLoss] = useState<number>(2); // in Sigma
  const [simResults, setSimResults] = useState<SimulationResult[]>([]);

  // Random Year State
  const [randomEvents, setRandomEvents] = useState<number[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const requestRef = useRef<number | undefined>(undefined);
  const startTimeRef = useRef<number | undefined>(undefined);

  // --- ANIMATION LOGIC ---
  const animateTimeline = (time: number) => {
    if (!startTimeRef.current) startTimeRef.current = time;
    const progress = time - startTimeRef.current;

    // Advance year every 500ms
    if (progress > 200) {
      setCurrentYear((prev) => {
        if (prev >= 2024) {
          setIsPlaying(false);
          return 2024;
        }
        return prev + 1;
      });
      startTimeRef.current = time;
    }

    if (isPlaying) {
      requestRef.current = requestAnimationFrame(animateTimeline);
    }
  };

  useEffect(() => {
    if (isPlaying) {
      requestRef.current = requestAnimationFrame(animateTimeline);
    } else {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      startTimeRef.current = undefined;
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isPlaying]);

  // --- GENERATE CHART PATHS ---

  const width = 800;
  const height = 300;
  const padding = 20;
  const graphWidth = width - padding * 2;
  const graphHeight = height - padding * 2;
  const minX = -10;
  const maxX = 10;
  const scaleX = graphWidth / (maxX - minX);

  // Y scale needs to handle the peak of the PDF
  const maxY = 0.5;
  const scaleY = graphHeight / maxY;

  const getCoord = (x: number, y: number) => {
    const cx = padding + (x - minX) * scaleX;
    const cy = height - padding - y * scaleY;
    return { x: cx, y: cy };
  };

  const generatePath = (pdfFunc: (x: number) => number) => {
    let d = `M ${padding} ${height - padding}`;
    for (let x = minX; x <= maxX; x += 0.1) {
      const y = pdfFunc(x);
      const coords = getCoord(x, y);
      d += ` L ${coords.x} ${coords.y}`;
    }
    d += ` L ${width - padding} ${height - padding} Z`;
    return d;
  };

  const normalPath = useMemo(() => generatePath(normalPDF), []);
  const fatTailPath = useMemo(() => generatePath(fatTailPDF), []);

  // --- HELPERS ---

  const getEventColor = (sigma: number) => {
    const abs = Math.abs(sigma);
    if (abs < 2) return 'fill-blue-400'; // Normal
    if (abs < 4) return 'fill-yellow-400'; // Rare
    return 'fill-red-500'; // Black Swan
  };

  const activeEvents = useMemo(() => {
    return HISTORICAL_EVENTS.filter((e) => e.year <= currentYear);
  }, [currentYear]);

  const sigma6Count = activeEvents.filter((e) => Math.abs(e.sigma) >= 6).length;
  // Theoretical probability of >6 sigma is ~1 in 500 million. In 40 years of daily data (~10,000 days), expected count is 0.00002.
  const theoreticalCount = 0;

  // --- SIMULATOR LOGIC ---

  const runSimulation = () => {
    const hits: SimulationResult[] = [];
    HISTORICAL_EVENTS.forEach((event) => {
      // Assuming gap direction is always negative for this demo (crashes)
      if (Math.abs(event.sigma) > userStopLoss) {
        // Simple logic: If the event is a 10 sigma move, and your stop is 2 sigma,
        // you suffer massive slippage.
        const lossMult = Math.abs(event.sigma) / userStopLoss;
        hits.push({
          triggered: true,
          gapSize: Math.abs(event.sigma),
          lossMultiplier: lossMult,
          event,
        });
      }
    });
    setSimResults(hits);
  };

  // --- RANDOM YEAR GENERATOR ---

  const generateRandomYear = () => {
    setIsGenerating(true);
    const events: number[] = [];
    // Generate 252 trading days
    for (let i = 0; i < 252; i++) {
      // Inverse transform sampling or simple rejection sampling for the fat tail pdf
      // Simplifying here: Use a mix of normal randoms
      let val;
      if (Math.random() > 0.98) {
        // 2% chance of drawing from the volatile distribution (Tail)
        val = (Math.random() - 0.5) * 20; // Wide range
      } else {
        val = (Math.random() - 0.5) * 4; // Normal range approx -2 to 2 sigma
      }
      events.push(val);
    }
    setRandomEvents(events);
    setTimeout(() => setIsGenerating(false), 500);
  };

  return (
    <div className="bg-slate-800 rounded-xl shadow-2xl border border-slate-700 overflow-hidden">
      {/* --- HEADER TABS --- */}
      <div className="flex border-b border-slate-700">
        <button
          onClick={() => setActiveTab(TabMode.TIMELINE)}
          className={`flex-1 py-4 text-sm font-semibold tracking-wide transition-colors ${
            activeTab === TabMode.TIMELINE
              ? 'bg-slate-700 text-blue-400 border-b-2 border-blue-400'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          TIMELINE VISUALIZER
        </button>
        <button
          onClick={() => setActiveTab(TabMode.SIMULATOR)}
          className={`flex-1 py-4 text-sm font-semibold tracking-wide transition-colors ${
            activeTab === TabMode.SIMULATOR
              ? 'bg-slate-700 text-yellow-400 border-b-2 border-yellow-400'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          SIMULATE YOUR TRADE
        </button>
        <button
          onClick={() => setActiveTab(TabMode.RANDOM)}
          className={`flex-1 py-4 text-sm font-semibold tracking-wide transition-colors ${
            activeTab === TabMode.RANDOM
              ? 'bg-slate-700 text-emerald-400 border-b-2 border-emerald-400'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          RANDOM YEAR GENERATOR
        </button>
      </div>

      <div className="p-6">
        {/* --- MAIN CHART AREA (Shown in all modes) --- */}
        <div className="relative w-full h-[350px] bg-slate-900 rounded-lg border border-slate-700 mb-6 overflow-hidden">
          {/* Grid Lines */}
          <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
            <div className="w-[1px] h-full bg-slate-200"></div>
            <div className="h-[1px] w-full bg-slate-200"></div>
          </div>

          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-full preserve-3d"
          >
            {/* Theoretical Normal Distribution (Blue) */}
            <path
              d={normalPath}
              fill="none"
              stroke="#60a5fa"
              strokeWidth="2"
              strokeDasharray="5,5"
              className="opacity-50"
            />

            {/* Reality Fat Tail Distribution (Red) */}
            <path
              d={fatTailPath}
              fill="url(#grad1)"
              stroke="#f87171"
              strokeWidth="3"
              className="opacity-90"
            />

            <defs>
              <linearGradient id="grad1" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop
                  offset="0%"
                  style={{ stopColor: '#f87171', stopOpacity: 0.2 }}
                />
                <stop
                  offset="100%"
                  style={{ stopColor: '#f87171', stopOpacity: 0 }}
                />
              </linearGradient>
            </defs>

            {/* Labels */}
            <text
              x={width / 2}
              y={30}
              textAnchor="middle"
              className="fill-slate-500 text-xs uppercase tracking-widest"
            >
              Probability Distribution
            </text>
            <text
              x={width / 2 + 10}
              y={height - 5}
              className="fill-blue-400 text-xs"
            >
              0σ
            </text>
            <text
              x={getCoord(-3, 0).x}
              y={height - 5}
              textAnchor="middle"
              className="fill-slate-500 text-xs"
            >
              -3σ
            </text>
            <text
              x={getCoord(3, 0).x}
              y={height - 5}
              textAnchor="middle"
              className="fill-slate-500 text-xs"
            >
              +3σ
            </text>
            <text
              x={getCoord(-6, 0).x}
              y={height - 5}
              textAnchor="middle"
              className="fill-red-500 text-xs font-bold"
            >
              -6σ
            </text>

            {/* Active Events Dots (Timeline Mode) */}
            {activeTab === TabMode.TIMELINE &&
              activeEvents.map((evt, i) => {
                // Clamp X for visual purposes so it stays in view even if -20 sigma
                const visualSigma = Math.max(Math.min(evt.sigma, 9.5), -9.5);
                const coords = getCoord(visualSigma, fatTailPDF(visualSigma)); // Place on curve
                return (
                  <g key={i} className="group cursor-pointer">
                    <circle
                      cx={coords.x}
                      cy={coords.y}
                      r={
                        activeTab === TabMode.TIMELINE &&
                        evt.year === currentYear
                          ? 8
                          : 5
                      }
                      className={`${getEventColor(
                        evt.sigma
                      )} transition-all duration-300 hover:r-8`}
                    />
                    {/* Tooltip on Hover */}
                    <foreignObject
                      x={coords.x - 75}
                      y={coords.y - 80}
                      width="150"
                      height="100"
                      className="invisible group-hover:visible z-50"
                    >
                      <div className="bg-slate-800 border border-slate-600 p-2 rounded shadow-xl text-xs text-center">
                        <p className="font-bold text-white">
                          {evt.year}: {evt.name}
                        </p>
                        <p className="text-red-400">{evt.sigma}σ Event</p>
                        <p className="text-slate-400">{evt.description}</p>
                      </div>
                    </foreignObject>
                  </g>
                );
              })}

            {/* Random Dots (Random Mode) */}
            {activeTab === TabMode.RANDOM &&
              randomEvents.map((val, i) => {
                const visualSigma = Math.max(Math.min(val, 9.5), -9.5);
                const coords = getCoord(visualSigma, 0.02); // Place near bottom
                return (
                  <circle
                    key={i}
                    cx={coords.x}
                    cy={coords.y + Math.random() * 20}
                    r={3}
                    className={
                      Math.abs(val) > 3
                        ? 'fill-red-500 opacity-80'
                        : 'fill-blue-500 opacity-30'
                    }
                  />
                );
              })}

            {/* Stop Loss Line (Simulator Mode) */}
            {activeTab === TabMode.SIMULATOR && (
              <>
                <line
                  x1={getCoord(-userStopLoss, 0).x}
                  y1={0}
                  x2={getCoord(-userStopLoss, 0).x}
                  y2={height}
                  stroke="#fbbf24"
                  strokeWidth="2"
                  strokeDasharray="4,4"
                />
                <text
                  x={getCoord(-userStopLoss, 0).x - 5}
                  y={50}
                  textAnchor="end"
                  className="fill-yellow-400 text-xs font-bold"
                >
                  Your Stop
                </text>

                {/* Visualizing Gaps */}
                {simResults.map((res, i) => {
                  const startX = getCoord(-userStopLoss, 0).x;
                  const endX = getCoord(Math.max(res.event.sigma, -9.5), 0).x;
                  return (
                    <g key={i}>
                      <line
                        x1={startX}
                        y1={height / 2 + i * 5}
                        x2={endX}
                        y2={height / 2 + i * 5}
                        stroke="#ef4444"
                        strokeWidth="1"
                        className="opacity-50"
                      />
                      <circle
                        cx={endX}
                        cy={height / 2 + i * 5}
                        r={3}
                        className="fill-red-500"
                      />
                    </g>
                  );
                })}
              </>
            )}
          </svg>
        </div>

        {/* --- CONTROLS & INFO PANELS --- */}

        {/* TIMELINE CONTROLS */}
        {activeTab === TabMode.TIMELINE && (
          <div className="space-y-6">
            <div className="flex items-center gap-4 bg-slate-900 p-4 rounded-lg border border-slate-700">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="p-3 bg-blue-600 hover:bg-blue-500 rounded-full text-white transition-colors"
              >
                {isPlaying ? <Pause size={20} /> : <Play size={20} />}
              </button>

              <div className="flex-1">
                <div className="flex justify-between mb-2">
                  <span className="text-slate-400 text-xs font-mono">1980</span>
                  <span className="text-white font-bold text-xl font-mono">
                    {currentYear}
                  </span>
                  <span className="text-slate-400 text-xs font-mono">2024</span>
                </div>
                <input
                  type="range"
                  min="1980"
                  max="2024"
                  value={currentYear}
                  onChange={(e) => setCurrentYear(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-900 p-4 rounded-lg border border-slate-700">
                <h3 className="text-slate-400 text-xs uppercase mb-1">
                  Theoretical Expectation
                </h3>
                <p className="text-blue-400 text-sm mb-2">
                  Based on Standard Normal Distribution
                </p>
                <div className="flex justify-between items-center border-t border-slate-800 pt-2">
                  <span className="text-slate-500 text-sm">
                    6σ Events expected:
                  </span>
                  <span className="text-white font-mono font-bold text-lg">
                    {theoreticalCount.toFixed(5)}
                  </span>
                </div>
                <p className="text-slate-600 text-[10px] mt-1 italic">
                  Once in 1.4 million years
                </p>
              </div>

              <div className="bg-slate-900 p-4 rounded-lg border border-red-900/30">
                <h3 className="text-slate-400 text-xs uppercase mb-1">
                  Market Reality
                </h3>
                <p className="text-red-400 text-sm mb-2">
                  Fat Tailed Distribution
                </p>
                <div className="flex justify-between items-center border-t border-slate-800 pt-2">
                  <span className="text-slate-500 text-sm">
                    6σ Events since 1980:
                  </span>
                  <span className="text-red-500 font-mono font-bold text-lg">
                    {sigma6Count}
                  </span>
                </div>
                <p className="text-red-400/60 text-[10px] mt-1 italic">
                  Occurs every ~5-7 years
                </p>
              </div>
            </div>

            <div className="bg-blue-900/20 border border-blue-900/50 p-4 rounded-lg flex gap-3">
              <Info className="text-blue-400 shrink-0" size={20} />
              <p className="text-sm text-blue-200">
                Notice how the{' '}
                <span className="text-red-400 font-bold">Red Curve</span> is
                flatter but wider? It captures the "Black Swan" events that the{' '}
                <span className="text-blue-400 font-bold dashed border-b border-blue-400">
                  Blue Curve
                </span>{' '}
                claims are impossible. Standard risk models underestimate these
                tail risks by orders of magnitude.
              </p>
            </div>
          </div>
        )}

        {/* SIMULATOR CONTROLS */}
        {activeTab === TabMode.SIMULATOR && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="col-span-1 bg-slate-900 p-5 rounded-lg border border-slate-700">
                <label className="block text-slate-400 text-sm mb-4">
                  Set Your Stop Loss (Std Dev)
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="5"
                  step="0.1"
                  value={userStopLoss}
                  onChange={(e) => setUserStopLoss(parseFloat(e.target.value))}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-yellow-500 mb-4"
                />
                <div className="flex justify-between items-center mb-6">
                  <span className="text-xs text-slate-500">Tight (0.5σ)</span>
                  <span className="text-xl font-bold text-yellow-400">
                    {userStopLoss}σ
                  </span>
                  <span className="text-xs text-slate-500">Wide (5.0σ)</span>
                </div>

                <button
                  onClick={runSimulation}
                  className="w-full py-3 bg-red-600 hover:bg-red-500 text-white rounded font-bold transition-all shadow-lg shadow-red-900/20 flex items-center justify-center gap-2"
                >
                  <ShieldAlert size={18} />
                  TEST SURVIVABILITY
                </button>
              </div>

              <div className="col-span-1 md:col-span-2 bg-slate-900 p-5 rounded-lg border border-slate-700 max-h-[300px] overflow-y-auto custom-scrollbar">
                <h3 className="text-slate-300 font-bold mb-4 flex items-center gap-2">
                  <TrendingDown size={18} className="text-red-500" />
                  Historical Failures
                </h3>

                {simResults.length === 0 ? (
                  <div className="h-40 flex flex-col items-center justify-center text-slate-600">
                    <p>
                      Click "Test Survivability" to see how your stop would hold
                      up against history.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm text-slate-400 mb-2">
                      Events where the market moved{' '}
                      <span className="text-white font-bold">faster</span> than
                      your stop could execute:
                    </p>
                    {simResults.map((res, i) => (
                      <div
                        key={i}
                        className="bg-slate-800 p-3 rounded border-l-4 border-red-500 flex justify-between items-center"
                      >
                        <div>
                          <span className="text-xs text-slate-500 font-mono">
                            {res.event.year}
                          </span>
                          <p className="text-sm font-bold text-slate-200">
                            {res.event.name}
                          </p>
                          <p className="text-xs text-slate-400">
                            Market moved: {res.event.actualDrop}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-slate-400">Actual Loss</p>
                          <p className="text-red-400 font-bold font-mono text-lg">
                            {res.lossMultiplier.toFixed(1)}x Risk
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* RANDOM GENERATOR CONTROLS */}
        {activeTab === TabMode.RANDOM && (
          <div className="space-y-6">
            <div className="flex flex-col items-center justify-center py-8">
              <button
                onClick={generateRandomYear}
                disabled={isGenerating}
                className="px-8 py-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg font-bold text-lg shadow-lg shadow-emerald-900/20 flex items-center gap-3 transition-all"
              >
                <RefreshCw
                  size={24}
                  className={isGenerating ? 'animate-spin' : ''}
                />
                {isGenerating ? 'SIMULATING...' : 'SIMULATE TRADING YEAR'}
              </button>
              <p className="mt-4 text-slate-400 text-sm max-w-md text-center">
                Generates 252 trading days using a Fat-Tailed distribution. Most
                days are calm, but watch for the outliers.
              </p>
            </div>

            {randomEvents.length > 0 && (
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-slate-900 p-4 rounded border border-slate-700 text-center">
                  <div className="text-slate-500 text-xs uppercase">
                    Days Simulated
                  </div>
                  <div className="text-white font-bold text-2xl">252</div>
                </div>
                <div className="bg-slate-900 p-4 rounded border border-slate-700 text-center">
                  <div className="text-slate-500 text-xs uppercase">
                    Days &gt; 3σ
                  </div>
                  <div
                    className={`font-bold text-2xl ${
                      randomEvents.filter((e) => Math.abs(e) > 3).length > 0
                        ? 'text-yellow-400'
                        : 'text-slate-300'
                    }`}
                  >
                    {randomEvents.filter((e) => Math.abs(e) > 3).length}
                  </div>
                  <div className="text-[10px] text-slate-600">Norm: &lt;1</div>
                </div>
                <div className="bg-slate-900 p-4 rounded border border-slate-700 text-center">
                  <div className="text-slate-500 text-xs uppercase">
                    Black Swans (&gt;6σ)
                  </div>
                  <div
                    className={`font-bold text-2xl ${
                      randomEvents.filter((e) => Math.abs(e) > 6).length > 0
                        ? 'text-red-500'
                        : 'text-slate-300'
                    }`}
                  >
                    {randomEvents.filter((e) => Math.abs(e) > 6).length}
                  </div>
                  <div className="text-[10px] text-slate-600">Norm: 0</div>
                </div>
              </div>
            )}

            {randomEvents.some((e) => Math.abs(e) > 6) && (
              <div className="bg-red-900/20 border border-red-500/50 p-4 rounded flex items-start gap-3 animate-pulse">
                <AlertTriangle className="text-red-500 shrink-0" />
                <div>
                  <h4 className="text-red-400 font-bold text-sm">
                    CRITICAL FAILURE DETECTED
                  </h4>
                  <p className="text-red-200/70 text-sm">
                    Even in a single simulated year, a black swan event
                    occurred. If you were using max leverage, your account is
                    now 0.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TailRiskVisualizer;
