
import React, { useState, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
  LabelList,
} from 'recharts';
import {
  Plus,
  Trash2,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Target,
  Info,
  ArrowRight,
  Save,
  Layout,
  BarChart3,
} from 'lucide-react';
import {
  calculateStats,
  generateHistogramData,
  analyzeDistribution,
  generateScenarioData,
} from './utils';
import { PRO_BENCHMARK } from './types';
import EnvironmentWrapper from '../../2d_environment/environmentWrapper';

// --- Sub-components for Cleaner File ---

const StatCard = ({
  label,
  value,
  subtext,
  color = 'slate',
  icon: Icon,
}: {
  label: string;
  value: string;
  subtext?: string;
  color?: 'emerald' | 'red' | 'blue' | 'slate' | 'amber';
  icon?: any;
}) => {
  const colors = {
    slate: 'text-slate-100 border-slate-700 bg-slate-800/50',
    emerald: 'text-emerald-400 border-emerald-900/50 bg-emerald-950/30',
    red: 'text-red-400 border-red-900/50 bg-red-950/30',
    blue: 'text-blue-400 border-blue-900/50 bg-blue-950/30',
    amber: 'text-amber-400 border-amber-900/50 bg-amber-950/30',
  };

  return (
    <div
      className={`p-4 rounded-xl border ${colors[color]} flex flex-col justify-between relative overflow-hidden group`}
    >
      {Icon && (
        <Icon className="absolute top-3 right-3 w-5 h-5 opacity-20 group-hover:opacity-40 transition-opacity" />
      )}
      <span className="text-xs font-medium uppercase tracking-wider opacity-70 mb-1">
        {label}
      </span>
      <div className="text-2xl font-bold tracking-tight">{value}</div>
      {subtext && <div className="text-xs opacity-60 mt-1">{subtext}</div>}
    </div>
  );
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-slate-900 border border-slate-700 p-3 rounded-lg shadow-xl text-xs">
        <p className="font-bold text-slate-200 mb-1">{data.range} Result</p>
        <p className="text-slate-400">
          Trades: <span className="text-white font-mono">{data.count}</span>
        </p>
        <p className="text-slate-500 mt-1 italic">
          {data.type === 'win'
            ? 'Winning trades'
            : data.type === 'loss'
            ? 'Losing trades'
            : 'Breakeven'}
        </p>
      </div>
    );
  }
  return null;
};

// Helper for Recharts custom label
const CustomBarLabel = (props: any) => {
  const { x, y, width, value } = props;
  if (!value) return null;
  return (
    <text
      x={x + width / 2}
      y={y - 6}
      fill="#94a3b8"
      textAnchor="middle"
      fontSize={12}
      fontWeight={600}
    >
      {value}
    </text>
  );
};

// --- Main Component ---

export const RDistributionBuilder: React.FC = () => {
  // State
  const [trades, setTrades] = useState<number[]>([]);
  const [inputValue, setInputValue] = useState<string>('');
  const [targetExpectancy, setTargetExpectancy] = useState<number>(0.6);
  const [viewMode, setViewMode] = useState<'build' | 'compare'>('build');
  const [showGoalPanel, setShowGoalPanel] = useState(false);

  // Derived Data
  const stats = useMemo(() => calculateStats(trades), [trades]);
  const histogramData = useMemo(() => generateHistogramData(trades), [trades]);
  const insights = useMemo(
    () => analyzeDistribution(stats, trades),
    [stats, trades]
  );

  // Handlers
  const addTrade = (r: number) => {
    setTrades((prev) => [...prev, r]);
  };

  const handleManualAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(inputValue);
    if (!isNaN(val)) {
      addTrade(val);
      setInputValue('');
    }
  };

  const loadScenario = (type: 'pro' | 'newbie' | 'gambler') => {
    setTrades(generateScenarioData(type));
  };

  const resetData = () => setTrades([]);

  // Calculations for Gap Analysis
  const gap = targetExpectancy - stats.expectancy;
  // const tradesToTarget = 100; // Simulated run
  // const projectedR = stats.expectancy * tradesToTarget;

  // Options to fix gap (simplified math)
  // 1. Winrate adjustment needed: E = (WR * AvgW) - ((1-WR) * AvgL) => E = WR(AvgW + AvgL) - AvgL => WR = (E + AvgL) / (AvgW + AvgL)
  const reqWinRate =
    (targetExpectancy + stats.avgLoss) / (stats.avgWin + stats.avgLoss);

  // 2. Avg Win needed: E = (WR * AvgW) - (LR * AvgL) => AvgW = (E + LR*AvgL) / WR
  const reqAvgWin =
    (targetExpectancy + (1 - stats.winRate) * stats.avgLoss) / stats.winRate;

  return (
    <EnvironmentWrapper height="auto" className="p-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">
        {/* LEFT COLUMN: Input & Controls */}
        <div className="lg:col-span-4 space-y-6">
          {/* Input Panel */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-emerald-500 to-amber-500 opacity-50"></div>

            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Layout className="w-5 h-5 text-emerald-500" />
              Input Console
            </h2>
            <div className="space-y-4">
              {/* Quick Add Buttons */}
              <div>
                <p className="text-xs font-medium text-slate-400 mb-2 uppercase tracking-wide">
                  Quick Log (R-Multiple)
                </p>
                <div className="grid grid-cols-4 gap-2">
                  {[-1, -0.5, 1, 1.5, 2, 3, 4, 5].map((val) => (
                    <button
                      key={val}
                      onClick={() => addTrade(val)}
                      className={`
                      py-2 rounded-lg text-sm font-bold transition-all border
                      ${
                        val < 0
                          ? 'bg-red-950/30 border-red-900/50 text-red-400 hover:bg-red-900/50'
                          : 'bg-emerald-950/30 border-emerald-900/50 text-emerald-400 hover:bg-emerald-900/50'
                      }
                    `}
                    >
                      {val > 0 ? '+' : ''}
                      {val}R
                    </button>
                  ))}
                </div>
              </div>

              {/* Manual Input */}
              <form onSubmit={handleManualAdd} className="relative">
                <div className="flex gap-2">
                  <input
                    type="number"
                    step="0.1"
                    placeholder="Custom R (e.g., 2.3)"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-700 text-white text-sm rounded-lg px-4 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none placeholder:text-slate-600"
                  />
                  <button
                    type="submit"
                    disabled={!inputValue}
                    className="bg-slate-800 hover:bg-slate-700 text-white p-2 rounded-lg border border-slate-700 transition-colors disabled:opacity-50"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </form>

              {/* Scenarios */}
              <div className="pt-4 border-t border-slate-800">
                <p className="text-xs text-slate-500 mb-2">
                  Load Simulation Data:
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => loadScenario('pro')}
                    className="flex-1 text-xs py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700"
                  >
                    Pro
                  </button>
                  <button
                    onClick={() => loadScenario('newbie')}
                    className="flex-1 text-xs py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700"
                  >
                    Newbie
                  </button>
                  <button
                    onClick={() => loadScenario('gambler')}
                    className="flex-1 text-xs py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700"
                  >
                    Gambler
                  </button>
                </div>
              </div>

              {trades.length > 0 && (
                <button
                  onClick={resetData}
                  className="w-full text-xs text-red-400 hover:text-red-300 flex items-center justify-center gap-2 mt-2 py-2 opacity-60 hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-3 h-3" /> Clear All Data
                </button>
              )}
            </div>
          </div>

          {/* Diagnostic Panel */}
          {insights.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider ml-1">
                AI Insights
              </h3>
              {insights.map((insight) => (
                <div
                  key={insight.id}
                  className={`p-4 rounded-xl border flex gap-3 ${
                    insight.type === 'success'
                      ? 'bg-emerald-950/20 border-emerald-900/50'
                      : insight.type === 'danger'
                      ? 'bg-red-950/20 border-red-900/50'
                      : insight.type === 'warning'
                      ? 'bg-amber-950/20 border-amber-900/50'
                      : 'bg-blue-950/20 border-blue-900/50'
                  }`}
                >
                  <div className="shrink-0 pt-1">
                    {insight.type === 'success' && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    )}
                    {insight.type === 'danger' && (
                      <AlertTriangle className="w-5 h-5 text-red-500" />
                    )}
                    {insight.type === 'warning' && (
                      <AlertTriangle className="w-5 h-5 text-amber-500" />
                    )}
                    {insight.type === 'info' && (
                      <Info className="w-5 h-5 text-blue-500" />
                    )}
                  </div>
                  <div>
                    <h4
                      className={`text-sm font-bold ${
                        insight.type === 'success'
                          ? 'text-emerald-400'
                          : insight.type === 'danger'
                          ? 'text-red-400'
                          : insight.type === 'warning'
                          ? 'text-amber-400'
                          : 'text-blue-400'
                      }`}
                    >
                      {insight.title}
                    </h4>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                      {insight.description}
                    </p>
                    <p className="text-xs mt-2 font-medium opacity-80 border-t border-white/5 pt-2 inline-block w-full">
                      💡 Rec: {insight.recommendation}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Visualization & Stats */}
        <div className="lg:col-span-8 space-y-6">
          {/* Top Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              label="Trades"
              value={stats.count.toString()}
              icon={Layout}
            />
            <StatCard
              label="Win Rate"
              value={`${(stats.winRate * 100).toFixed(1)}%`}
              color={stats.winRate > 0.5 ? 'emerald' : 'amber'}
              subtext={
                stats.count > 0
                  ? `${(stats.winRate * stats.count).toFixed(0)} W / ${(
                      stats.count -
                      stats.winRate * stats.count
                    ).toFixed(0)} L`
                  : '-'
              }
              icon={Target}
            />
            <StatCard
              label="Expectancy"
              value={`${
                stats.expectancy > 0 ? '+' : ''
              }${stats.expectancy.toFixed(2)}R`}
              color={
                stats.expectancy >= 0.5
                  ? 'emerald'
                  : stats.expectancy > 0
                  ? 'blue'
                  : 'red'
              }
              subtext="Avg per trade"
              icon={TrendingUp}
            />
            <StatCard
              label="Total Return"
              value={`${stats.totalR > 0 ? '+' : ''}${stats.totalR.toFixed(
                1
              )}R`}
              color={stats.totalR > 0 ? 'emerald' : 'red'}
              subtext="Cumulative"
              icon={Save}
            />
          </div>

          {/* Main Chart Area */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl min-h-[400px] flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-white">
                R-Distribution Histogram
              </h2>
              <div className="flex bg-slate-800 rounded-lg p-1 border border-slate-700">
                <button
                  onClick={() => setViewMode('build')}
                  className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                    viewMode === 'build'
                      ? 'bg-slate-600 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Live View
                </button>
                <button
                  onClick={() => setViewMode('compare')}
                  className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                    viewMode === 'compare'
                      ? 'bg-slate-600 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  vs Professional
                </button>
              </div>
            </div>

            <div className="flex-1 w-full relative">
              {trades.length === 0 ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500">
                  <BarChart3 className="w-16 h-16 mb-4 opacity-20" />
                  <p>No trades recorded yet.</p>
                  <p className="text-sm opacity-60">
                    Use the input panel or load a scenario.
                  </p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart
                    data={histogramData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#1e293b"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="range"
                      stroke="#64748b"
                      tick={{ fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                      dy={10}
                    />
                    <YAxis
                      stroke="#64748b"
                      tick={{ fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip
                      cursor={{ fill: '#1e293b' }}
                      content={<CustomTooltip />}
                    />
                    <Bar
                      dataKey="count"
                      radius={[4, 4, 0, 0]}
                      animationDuration={500}
                    >
                      {histogramData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            entry.type === 'win'
                              ? '#10b981'
                              : entry.type === 'loss'
                              ? '#ef4444'
                              : '#64748b'
                          }
                          fillOpacity={0.8}
                        />
                      ))}
                      <LabelList
                        dataKey="count"
                        content={<CustomBarLabel />}
                        position="top"
                      />
                    </Bar>

                    {/* Reference Line for Mean if needed, or 0 */}
                    <ReferenceLine
                      x="0R"
                      stroke="#475569"
                      strokeDasharray="3 3"
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Comparison Footer */}
            {viewMode === 'compare' && trades.length > 0 && (
              <div className="mt-6 pt-6 border-t border-slate-800 grid grid-cols-2 gap-8">
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                    Your Stats
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Win Rate</span>
                      <span className="font-mono text-white">
                        {(stats.winRate * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Avg Win</span>
                      <span className="font-mono text-emerald-400">
                        +{stats.avgWin.toFixed(2)}R
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Avg Loss</span>
                      <span className="font-mono text-red-400">
                        -{stats.avgLoss.toFixed(2)}R
                      </span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                    Pro Benchmark{' '}
                    <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                  </h4>
                  <div className="space-y-2 text-sm opacity-60">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Win Rate</span>
                      <span className="font-mono text-white">50-55%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Avg Win</span>
                      <span className="font-mono text-emerald-400">+2.00R</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Avg Loss</span>
                      <span className="font-mono text-red-400">-1.00R</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Goal Setting & Gap Analysis */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <button
              onClick={() => setShowGoalPanel(!showGoalPanel)}
              className="w-full p-4 flex items-center justify-between bg-slate-800/50 hover:bg-slate-800 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-500" />
                <span className="font-semibold text-white">
                  Expectancy Target & Gap Analysis
                </span>
              </div>
              <ArrowRight
                className={`w-5 h-5 text-slate-500 transition-transform ${
                  showGoalPanel ? 'rotate-90' : ''
                }`}
              />
            </button>

            {showGoalPanel && (
              <div className="p-6 border-t border-slate-800 bg-slate-900">
                <div className="flex items-center gap-6 mb-8">
                  <div className="flex-1">
                    <label className="text-xs text-slate-400 mb-1 block">
                      Set Your Goal (Expectancy)
                    </label>
                    <input
                      type="range"
                      min="0.2"
                      max="1.5"
                      step="0.1"
                      value={targetExpectancy}
                      onChange={(e) =>
                        setTargetExpectancy(parseFloat(e.target.value))
                      }
                      className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                    <div className="flex justify-between text-xs text-slate-500 mt-1">
                      <span>0.2R</span>
                      <span>0.8R</span>
                      <span>1.5R</span>
                    </div>
                  </div>
                  <div className="text-center bg-blue-950/30 border border-blue-900/50 p-3 rounded-lg min-w-[100px]">
                    <span className="text-xs text-blue-400 block">TARGET</span>
                    <span className="text-xl font-bold text-white">
                      {targetExpectancy.toFixed(1)}R
                    </span>
                  </div>
                  <div className="text-center bg-slate-800 p-3 rounded-lg min-w-[100px]">
                    <span className="text-xs text-slate-400 block">
                      CURRENT
                    </span>
                    <span
                      className={`text-xl font-bold ${
                        stats.expectancy >= targetExpectancy
                          ? 'text-emerald-400'
                          : 'text-red-400'
                      }`}
                    >
                      {stats.expectancy.toFixed(2)}R
                    </span>
                  </div>
                </div>
                {gap > 0 ? (
                  <div>
                    <h4 className="text-sm font-semibold text-white mb-4">
                      How to bridge the {gap.toFixed(2)}R gap:
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 border border-slate-700 rounded-lg bg-slate-800/20 hover:bg-slate-800/40 transition-colors">
                        <p className="text-xs text-slate-400 uppercase mb-1">
                          Option A: Improve Win Rate
                        </p>
                        <div className="flex items-end gap-2">
                          <span className="text-2xl font-bold text-white">
                            {(reqWinRate * 100).toFixed(1)}%
                          </span>
                          <span className="text-sm text-slate-400 mb-1">
                            required
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-2">
                          Currently {(stats.winRate * 100).toFixed(1)}%. You
                          need{' '}
                          {(reqWinRate * 100 - stats.winRate * 100).toFixed(1)}%
                          more wins with current R/R.
                        </p>
                      </div>
                      <div className="p-4 border border-slate-700 rounded-lg bg-slate-800/20 hover:bg-slate-800/40 transition-colors">
                        <p className="text-xs text-slate-400 uppercase mb-1">
                          Option B: Improve Avg Win
                        </p>
                        <div className="flex items-end gap-2">
                          <span className="text-2xl font-bold text-emerald-400">
                            {reqAvgWin.toFixed(2)}R
                          </span>
                          <span className="text-sm text-slate-400 mb-1">
                            required
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-2">
                          Currently {stats.avgWin.toFixed(2)}R. Hold winners
                          longer to gain {(reqAvgWin - stats.avgWin).toFixed(2)}
                          R more per win.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-emerald-950/30 border border-emerald-900/50 p-4 rounded-lg flex items-center gap-3">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                    <div>
                      <p className="text-emerald-400 font-bold">
                        Goal Achieved!
                      </p>
                      <p className="text-emerald-200/60 text-sm">
                        Your current expectancy exceeds your target. Consider
                        raising your standards.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </EnvironmentWrapper>
  );
};
