
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import {
  AlertTriangle,
  ShieldCheck,
  Skull,
  RotateCcw,
  TrendingUp,
  Users,
} from 'lucide-react';
import {
  SimulationResult,
  SimulationStats,
  PresetConfig,
  RiskLevel,
} from './types';

// Constants
const INITIAL_BALANCE = 10000;
const SIMULATION_TRADES = 100;
const SIMULATION_RUNS = 10;
const MASS_SIM_ACCOUNTS = 1000;
const RUIN_THRESHOLD = 500; // Accounts below this balance ($500) are considered "Ruined" to simulate broker liquidation/margin call

const PRESETS: PresetConfig[] = [
  {
    name: 'The Gambler',
    risk: 10,
    winRate: 40,
    rr: 1.5,
    description: 'High risk, low edge. Destined for ruin.',
  },
  {
    name: 'The Scalper',
    risk: 0.5,
    winRate: 60,
    rr: 1.2,
    description: 'High frequency, low risk, moderate edge.',
  },
  {
    name: 'The Professional',
    risk: 1,
    winRate: 50,
    rr: 2,
    description: 'Controlled risk, strong expectancy.',
  },
  {
    name: 'The Sniper',
    risk: 2,
    winRate: 40,
    rr: 3,
    description: 'Lower win rate, high reward, manageable risk.',
  },
];

const RiskCalculator: React.FC = () => {
  const [riskPerTrade, setRiskPerTrade] = useState(2);
  const [winRate, setWinRate] = useState(50);
  const [riskReward, setRiskReward] = useState(1.5);
  const [simulationPaths, setSimulationPaths] = useState<any[]>([]);
  const [stats, setStats] = useState<SimulationStats>({
    riskOfRuinProb: 0,
    survivalTradeCount: 0,
    expectedValue: 0,
    riskLevel: 'safe',
  });

  // Mass Sim State
  const [viewMode, setViewMode] = useState<'standard' | 'mass'>('standard');
  const [massStats, setMassStats] = useState({
    survived: MASS_SIM_ACCOUNTS,
    ruined: 0,
    running: false,
    finished: false,
  });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);

  // Standard Simulation Logic
  const runStandardSimulation = useCallback(() => {
    const paths = [];
    let ruinedCount = 0;
    let totalSurvivalTrades = 0;

    for (let run = 0; run < SIMULATION_RUNS; run++) {
      const pathData = [];
      let currentBalance = INITIAL_BALANCE;
      let ruined = false;
      let tradesSurvived = SIMULATION_TRADES;

      for (let i = 0; i <= SIMULATION_TRADES; i++) {
        if (i === 0) {
          pathData.push({ trade: 0, balance: INITIAL_BALANCE });
          continue;
        }

        if (currentBalance < RUIN_THRESHOLD) {
          if (!ruined) {
            ruined = true;
            tradesSurvived = i;
          }
          currentBalance = 0;
        } else {
          const isWin = Math.random() * 100 < winRate;
          const riskAmount = currentBalance * (riskPerTrade / 100);

          if (isWin) {
            currentBalance += riskAmount * riskReward;
          } else {
            currentBalance -= riskAmount;
          }
        }

        pathData.push({ trade: i, balance: Math.round(currentBalance) });
      }

      if (ruined) ruinedCount++;
      totalSurvivalTrades += tradesSurvived;

      if (run < 5) {
        paths.push(pathData);
      }
    }

    const winDec = winRate / 100;
    const lossDec = 1 - winDec;
    const ev = winDec * riskReward - lossDec * 1;

    let calcRoR = 0;
    if (ev <= 0) {
      calcRoR = 100;
    } else {
      const volatilityDrag = riskPerTrade * 2;
      const edgeFactor = ev * 10;
      calcRoR = Math.max(0, Math.min(100, (volatilityDrag / edgeFactor) * 25));
      if (riskPerTrade > 15) calcRoR = 99.9;
      if (riskPerTrade < 1.5 && ev > 0.2) calcRoR = 0.1;
    }

    let level: RiskLevel = 'safe';
    if (calcRoR > 50 || ev < 0) level = 'extreme';
    else if (calcRoR > 20) level = 'danger';
    else if (calcRoR > 5) level = 'caution';

    setStats({
      riskOfRuinProb: calcRoR,
      survivalTradeCount: totalSurvivalTrades / SIMULATION_RUNS,
      expectedValue: ev,
      riskLevel: level,
    });

    const mergedData = [];
    for (let i = 0; i <= SIMULATION_TRADES; i++) {
      const point: any = { trade: i };
      paths.forEach((path, idx) => {
        point[`run${idx}`] = path[i].balance;
      });
      mergedData.push(point);
    }
    setSimulationPaths(mergedData);
  }, [riskPerTrade, winRate, riskReward]);

  // Mass Simulation Logic
  const runMassSimulation = useCallback(() => {
    setViewMode('mass');
    setMassStats({
      survived: MASS_SIM_ACCOUNTS,
      ruined: 0,
      running: true,
      finished: false,
    });

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas resolution to match display
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    const width = canvas.width;
    const height = canvas.height;

    // Config
    const accounts = new Float32Array(MASS_SIM_ACCOUNTS).fill(INITIAL_BALANCE);
    const ruined = new Uint8Array(MASS_SIM_ACCOUNTS).fill(0);
    let survivedCount = MASS_SIM_ACCOUNTS;
    let ruinedCount = 0;
    let currentTrade = 0;

    // Scale
    const maxY = INITIAL_BALANCE * 3;
    const getX = (t: number) => (t / SIMULATION_TRADES) * width;
    const getY = (b: number) =>
      height - (Math.max(0, Math.min(b, maxY)) / maxY) * height;

    // Initial Clear
    ctx.fillStyle = '#020617';
    ctx.fillRect(0, 0, width, height);

    // Draw Grid
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    ctx.beginPath();
    // Y grid
    for (let i = 1; i < 4; i++) {
      const y = (i / 4) * height;
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
    }
    // X grid
    for (let i = 1; i < 10; i++) {
      const x = (i / 10) * width;
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
    }
    ctx.stroke();

    // Start Line
    ctx.strokeStyle = '#334155';
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    const startY = getY(INITIAL_BALANCE);
    ctx.moveTo(0, startY);
    ctx.lineTo(width, startY);
    ctx.stroke();
    ctx.setLineDash([]);

    // We use a closure for the animation variables to ensure continuity across frames
    const animate = () => {
      if (currentTrade >= SIMULATION_TRADES) {
        setMassStats((s) => ({ ...s, running: false, finished: true }));
        return;
      }

      // Calculate multiple trades per frame for speed
      const tradesPerFrame = 4;

      for (let step = 0; step < tradesPerFrame; step++) {
        if (currentTrade >= SIMULATION_TRADES) break;

        const startX = getX(currentTrade);
        const endX = getX(currentTrade + 1);

        const safePath = new Path2D();
        const ruinedPath = new Path2D();

        for (let i = 0; i < MASS_SIM_ACCOUNTS; i++) {
          const startY = getY(accounts[i]);

          if (ruined[i]) {
            // Already ruined, draw flat line at 0
            const zeroY = getY(0);
            ruinedPath.moveTo(startX, zeroY);
            ruinedPath.lineTo(endX, zeroY);
            continue;
          }

          const isWin = Math.random() * 100 < winRate;
          const riskAmt = accounts[i] * (riskPerTrade / 100);

          if (isWin) {
            accounts[i] += riskAmt * riskReward;
          } else {
            accounts[i] -= riskAmt;
          }

          // Check for Ruin Threshold
          if (accounts[i] < RUIN_THRESHOLD) {
            accounts[i] = 0;
            if (ruined[i] === 0) {
              ruined[i] = 1;
              ruinedCount++;
              survivedCount--;
            }
          }

          const endY = getY(accounts[i]);

          if (ruined[i]) {
            // Just died this step
            ruinedPath.moveTo(startX, startY);
            ruinedPath.lineTo(endX, endY);
          } else {
            safePath.moveTo(startX, startY);
            safePath.lineTo(endX, endY);
          }
        }

        ctx.lineWidth = 1;
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.3)'; // Red for ruined
        ctx.stroke(ruinedPath);

        ctx.strokeStyle = 'rgba(96, 165, 250, 0.05)'; // Very faint Blue for safe
        ctx.stroke(safePath);

        currentTrade++;
      }

      setMassStats({
        survived: survivedCount,
        ruined: ruinedCount,
        running: true,
        finished: false,
      });
      animationRef.current = requestAnimationFrame(animate);
    };

    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    animationRef.current = requestAnimationFrame(animate);
  }, [riskPerTrade, winRate, riskReward]);

  useEffect(() => {
    if (viewMode === 'standard') {
      runStandardSimulation();
    }
  }, [riskPerTrade, winRate, riskReward, viewMode, runStandardSimulation]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  const getRiskColor = (level: RiskLevel) => {
    switch (level) {
      case 'safe':
        return 'text-brand-green';
      case 'caution':
        return 'text-brand-yellow';
      case 'danger':
        return 'text-orange-500';
      case 'extreme':
        return 'text-brand-red';
    }
  };

  const getRiskBg = (level: RiskLevel) => {
    switch (level) {
      case 'safe':
        return 'bg-brand-green/20 border-brand-green/30';
      case 'caution':
        return 'bg-brand-yellow/20 border-brand-yellow/30';
      case 'danger':
        return 'bg-orange-500/20 border-orange-500/30';
      case 'extreme':
        return 'bg-brand-red/20 border-brand-red/30';
    }
  };

  return (
    <div className="w-full my-12 bg-slate-900 border border-slate-700 rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/5">
      <div className="bg-slate-850 p-6 border-b border-slate-700 flex justify-between items-center flex-wrap gap-4">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-brand-blue" />
            Risk of Ruin Simulator
          </h3>
          <p className="text-slate-400 text-sm mt-1">
            Visualize how position size and win rate impact your survival.
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {PRESETS.map((p) => (
            <button
              key={p.name}
              onClick={() => {
                setRiskPerTrade(p.risk);
                setWinRate(p.winRate);
                setRiskReward(p.rr);
              }}
              className="px-3 py-1.5 text-xs font-medium rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 lg:divide-x divide-slate-700">
        {/* Controls Panel */}
        <div className="p-6 space-y-8 bg-slate-900/50">
          {/* Risk Per Trade */}
          <div className="space-y-3">
            <div className="flex justify-between">
              <label className="text-sm font-medium text-slate-300">
                Risk Per Trade
              </label>
              <span
                className={`text-sm font-bold ${
                  riskPerTrade > 5 ? 'text-brand-red' : 'text-brand-blue'
                }`}
              >
                {riskPerTrade}%
              </span>
            </div>
            <input
              type="range"
              min="0.5"
              max="20"
              step="0.5"
              value={riskPerTrade}
              onChange={(e) => setRiskPerTrade(parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-brand-blue"
            />
            <div className="flex justify-between text-xs text-slate-500 font-mono">
              <span>0.5%</span>
              <span>20%</span>
            </div>
          </div>

          {/* Win Rate */}
          <div className="space-y-3">
            <div className="flex justify-between">
              <label className="text-sm font-medium text-slate-300">
                Win Rate
              </label>
              <span className="text-sm font-bold text-brand-green">
                {winRate}%
              </span>
            </div>
            <input
              type="range"
              min="10"
              max="90"
              step="1"
              value={winRate}
              onChange={(e) => setWinRate(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-brand-green"
            />
            <div className="flex justify-between text-xs text-slate-500 font-mono">
              <span>10%</span>
              <span>90%</span>
            </div>
          </div>

          {/* Risk Reward */}
          <div className="space-y-3">
            <div className="flex justify-between">
              <label className="text-sm font-medium text-slate-300">
                Risk:Reward Ratio
              </label>
              <span className="text-sm font-bold text-brand-yellow">
                1:{riskReward}
              </span>
            </div>
            <input
              type="range"
              min="0.5"
              max="5"
              step="0.1"
              value={riskReward}
              onChange={(e) => setRiskReward(parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-brand-yellow"
            />
            <div className="flex justify-between text-xs text-slate-500 font-mono">
              <span>1:0.5</span>
              <span>1:5</span>
            </div>
          </div>

          {/* Key Stats Readout */}
          <div className="mt-8 pt-6 border-t border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-sm">
                Expected Value (R):
              </span>
              <span
                className={`font-mono font-bold ${
                  stats.expectedValue > 0 ? 'text-green-400' : 'text-red-400'
                }`}
              >
                {stats.expectedValue > 0 ? '+' : ''}
                {stats.expectedValue.toFixed(2)}R
              </span>
            </div>
            <div
              className={`p-4 rounded-lg border ${getRiskBg(
                stats.riskLevel
              )} flex items-center gap-3`}
            >
              {stats.riskLevel === 'safe' && (
                <ShieldCheck className="w-8 h-8 text-brand-green" />
              )}
              {stats.riskLevel === 'caution' && (
                <AlertTriangle className="w-8 h-8 text-brand-yellow" />
              )}
              {(stats.riskLevel === 'danger' ||
                stats.riskLevel === 'extreme') && (
                <Skull className="w-8 h-8 text-brand-red" />
              )}

              <div>
                <div className="text-xs font-bold uppercase opacity-80 mb-0.5 tracking-wider text-slate-200">
                  Probability of Ruin
                </div>
                <div
                  className={`text-2xl font-black ${getRiskColor(
                    stats.riskLevel
                  )}`}
                >
                  {stats.riskOfRuinProb > 99
                    ? '>99%'
                    : stats.riskOfRuinProb < 1
                    ? '<1%'
                    : `~${Math.round(stats.riskOfRuinProb)}%`}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Chart Panel */}
        <div className="col-span-2 p-6 flex flex-col h-[500px] bg-slate-950 relative">
          <div className="flex justify-between items-center mb-4 z-10">
            <div className="flex gap-4 items-center">
              <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-widest">
                {viewMode === 'standard'
                  ? 'Monte Carlo (10 Paths)'
                  : 'Mass Simulation (1000 Accounts)'}
              </h4>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setViewMode('standard');
                  runStandardSimulation();
                }}
                className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                  viewMode === 'standard'
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-500 hover:text-white'
                }`}
              >
                <RotateCcw className="w-3 h-3" /> Standard
              </button>
              <button
                onClick={runMassSimulation}
                className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                  viewMode === 'mass'
                    ? 'bg-blue-800 text-white'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <Users className="w-3 h-3" /> Run 1,000 Sim
              </button>
            </div>
          </div>

          <div className="flex-grow w-full relative group">
            {viewMode === 'standard' ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={simulationPaths}
                  margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#1e293b"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="trade"
                    stroke="#475569"
                    tick={{ fontSize: 12 }}
                    tickFormatter={(val) => (val === 0 ? '' : `T${val}`)}
                  />
                  <YAxis
                    stroke="#475569"
                    tick={{ fontSize: 12 }}
                    tickFormatter={(val) => `$${val / 1000}k`}
                    domain={[0, 'auto']}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      color: '#f1f5f9',
                    }}
                    itemStyle={{ fontSize: '12px' }}
                    labelStyle={{ color: '#94a3b8', marginBottom: '0.5rem' }}
                    formatter={(value: number) => [
                      `$${value.toLocaleString()}`,
                      'Balance',
                    ]}
                  />
                  <ReferenceLine
                    y={INITIAL_BALANCE}
                    stroke="#334155"
                    strokeDasharray="3 3"
                  />
                  <ReferenceLine
                    y={RUIN_THRESHOLD}
                    stroke="#ef4444"
                    strokeWidth={1}
                    strokeDasharray="5 5"
                    label={{
                      value: 'Ruin',
                      fill: '#ef4444',
                      fontSize: 10,
                      position: 'insideBottomRight',
                    }}
                  />

                  {[0, 1, 2, 3, 4].map((i) => (
                    <Line
                      key={i}
                      type="monotone"
                      dataKey={`run${i}`}
                      stroke={i === 0 ? '#60a5fa' : '#334155'}
                      strokeWidth={i === 0 ? 2 : 1}
                      dot={false}
                      activeDot={{ r: 4, strokeWidth: 0 }}
                      strokeOpacity={i === 0 ? 1 : 0.3}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <>
                <canvas
                  ref={canvasRef}
                  className="w-full h-full block rounded border border-slate-800"
                />
                {/* Overlay Stats for Mass Sim */}
                <div className="absolute top-4 right-4 bg-slate-900/90 border border-slate-700 p-4 rounded-lg shadow-xl backdrop-blur-sm animate-in fade-in slide-in-from-top-2">
                  <div className="text-xs text-slate-500 uppercase tracking-wider mb-2">
                    Sim Results
                  </div>
                  <div className="flex items-end gap-2 mb-1">
                    <span className="text-2xl font-bold text-brand-red">
                      {massStats.ruined}
                    </span>
                    <span className="text-sm text-slate-400 mb-1">
                      accounts died
                    </span>
                  </div>
                  <div className="flex items-end gap-2">
                    <span className="text-2xl font-bold text-brand-green">
                      {massStats.survived}
                    </span>
                    <span className="text-sm text-slate-400 mb-1">
                      survived
                    </span>
                  </div>
                  {massStats.finished && (
                    <div className="mt-3 pt-3 border-t border-slate-800 text-xs text-center text-slate-400">
                      {((massStats.ruined / MASS_SIM_ACCOUNTS) * 100).toFixed(
                        1
                      )}
                      % Ruin Rate
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          <div className="mt-4 flex gap-6 text-xs text-slate-500 font-mono justify-center">
            <div className="flex items-center gap-2">
              <div className="w-3 h-0.5 bg-blue-400"></div> Surviving Path
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-0.5 bg-red-500"></div> Ruined Path
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RiskCalculator;
