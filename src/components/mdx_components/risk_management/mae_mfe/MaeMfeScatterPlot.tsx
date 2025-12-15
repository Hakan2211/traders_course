
import React, { useState, useMemo } from 'react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
  Label,
} from 'recharts';
import { Trade, Diagnostic } from './types';
import { MOCK_TRADES } from './constants';
import { ScatterTooltip } from './ScatterTooltip';
import {
  Filter,
  AlertTriangle,
  CheckCircle,
  Crosshair,
  TrendingUp,
} from 'lucide-react';

const MaeMfeScatterPlot: React.FC = () => {
  const [trades] = useState<Trade[]>(MOCK_TRADES);
  const [filterWinner, setFilterWinner] = useState(true);
  const [filterLoser, setFilterLoser] = useState(true);
  const [filterGrade, setFilterGrade] = useState<string>('ALL'); // ALL, A, B, C

  // --- Filtering Logic ---
  const filteredTrades = useMemo(() => {
    return trades.filter((t) => {
      if (!filterWinner && t.rMultiple > 0) return false;
      if (!filterLoser && t.rMultiple <= 0) return false;
      if (filterGrade !== 'ALL' && t.grade !== filterGrade) return false;
      return true;
    });
  }, [trades, filterWinner, filterLoser, filterGrade]);

  // --- Diagnostics Logic ---
  const diagnostics = useMemo((): Diagnostic[] => {
    const diags: Diagnostic[] = [];

    // Check for premature exits (High MFE vs Actual R)
    const prematureExits = filteredTrades.filter(
      (t) => t.rMultiple > 0 && t.mfe > t.rMultiple * 1.5
    );
    if (prematureExits.length > filteredTrades.length * 0.15) {
      diags.push({
        title: 'Premature Exits Detected',
        severity: 'high',
        evidence: `${prematureExits.length} winning trades had an MFE 1.5x higher than your exit.`,
        cost: `~${prematureExits
          .reduce((acc, t) => acc + (t.mfe - t.rMultiple), 0)
          .toFixed(1)}R left on table`,
        fix: 'Implement a trailing stop strategy to capture more trend.',
      });
    }

    // Check for tight stops (Losers with low MAE)
    // Actually, "Stops too tight" often means price barely hit stop (MAE ~= 1R) then went to MFE.
    // Let's look for "Fakeouts": Losers where MFE became > 2R *after* being stopped, or Low MAE losers?
    // Based on prompt: "Losers: Low MAE, Moderate MFE" -> Stops too tight
    const tightStops = filteredTrades.filter(
      (t) => t.rMultiple < 0 && t.mae < 1.1 && t.mae > 0.9 && t.mfe > 1
    );
    if (tightStops.length > 3) {
      diags.push({
        title: 'Stops Too Tight / Whipsaws',
        severity: 'medium',
        evidence: `${tightStops.length} trades stopped out exactly at -1R then moved >1R in favor.`,
        cost: `-${tightStops.length}R loss + missed opportunity`,
        fix: 'Consider widening stops by 0.2R or waiting for confirmation.',
      });
    }

    // Check for A-Grade Performance
    const aGrades = filteredTrades.filter((t) => t.grade === 'A');
    const aGradeWinRate =
      aGrades.filter((t) => t.rMultiple > 0).length / (aGrades.length || 1);

    if (aGrades.length > 0 && aGradeWinRate < 0.4) {
      diags.push({
        title: 'A-Grade Selection Issue',
        severity: 'high',
        evidence: `A-Grade win rate is only ${(aGradeWinRate * 100).toFixed(
          0
        )}%.`,
        cost: 'Confidence capital',
        fix: "Review your criteria for 'A-Grade'. You may be over-optimistic.",
      });
    } else if (aGrades.length > 0) {
      diags.push({
        title: 'A-Grade Execution Strong',
        severity: 'low',
        evidence: `A-Grade win rate is ${(aGradeWinRate * 100).toFixed(0)}%.`,
        cost: 'None - Keep it up',
        fix: 'Scale up risk on these setups.',
      });
    }

    return diags;
  }, [filteredTrades]);

  // --- Quadrant Analysis ---
  const quadrantStats = useMemo(() => {
    // Q1: Low MAE (<0.8), High MFE (>2) - Ideal (Top Left)
    // Q2: High MAE (>0.8), High MFE (>2) - Lucky/Volatile (Top Right)
    // Q3: High MAE (>0.8), Low MFE (<2) - Stop Outs/Losers (Bottom Right)
    // Q4: Low MAE (<0.8), Low MFE (<2) - Chop/Scalps (Bottom Left)

    const total = filteredTrades.length || 1;
    const q1 = filteredTrades.filter((t) => t.mae <= 0.8 && t.mfe >= 2).length;
    const q2 = filteredTrades.filter((t) => t.mae > 0.8 && t.mfe >= 2).length;
    const q3 = filteredTrades.filter((t) => t.mae > 0.8 && t.mfe < 2).length;
    const q4 = filteredTrades.filter((t) => t.mae <= 0.8 && t.mfe < 2).length;

    return [
      {
        label: 'Q1: Sniper Entries',
        count: q1,
        percentage: Math.round((q1 / total) * 100),
        description: 'Low Risk, High Reward',
        color: 'text-green-400',
      },
      {
        label: 'Q2: Volatile Wins',
        count: q2,
        percentage: Math.round((q2 / total) * 100),
        description: 'High Heat, High Reward',
        color: 'text-yellow-400',
      },
      {
        label: 'Q3: Clean Losses',
        count: q3,
        percentage: Math.round((q3 / total) * 100),
        description: 'Plan Executed',
        color: 'text-slate-400',
      },
      {
        label: 'Q4: Chop/Early',
        count: q4,
        percentage: Math.round((q4 / total) * 100),
        description: 'Small Wins/Losses',
        color: 'text-blue-400',
      },
    ];
  }, [filteredTrades]);

  return (
    <div className="w-full bg-slate-950 text-slate-200 p-4 md:p-6 rounded-xl border border-slate-800 shadow-2xl space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
            MAE / MFE Analyzer
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Visualize trade efficiency. Are you taking too much heat (MAE)? Are
            you capturing the full move (MFE)?
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 items-center bg-slate-900 p-2 rounded-lg border border-slate-800">
          <Filter className="w-4 h-4 text-slate-500 mr-2" />
          <button
            onClick={() => setFilterWinner(!filterWinner)}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
              filterWinner
                ? 'bg-green-900/40 text-green-400 border border-green-800'
                : 'bg-slate-800 text-slate-500 hover:bg-slate-700'
            }`}
          >
            Winners
          </button>
          <button
            onClick={() => setFilterLoser(!filterLoser)}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
              filterLoser
                ? 'bg-red-900/40 text-red-400 border border-red-800'
                : 'bg-slate-800 text-slate-500 hover:bg-slate-700'
            }`}
          >
            Losers
          </button>
          <div className="h-4 w-px bg-slate-700 mx-1" />
          <select
            value={filterGrade}
            onChange={(e) => setFilterGrade(e.target.value)}
            className="bg-slate-800 text-slate-200 text-xs rounded-md border-none focus:ring-1 focus:ring-blue-500 px-2 py-1 outline-none"
          >
            <option value="ALL">All Grades</option>
            <option value="A">Grade A</option>
            <option value="B">Grade B</option>
            <option value="C">Grade C</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart Area */}
        <div className="lg:col-span-2 relative h-[450px] bg-slate-900/50 rounded-lg border border-slate-800 p-2">
          {/* 
                Quadrant Background Labels 
                Grid: 2x2. 
                Row 1 = High Y (High MFE)
                Row 2 = Low Y (Low MFE)
                Col 1 = Low X (Low MAE)
                Col 2 = High X (High MAE)
            */}
          <div className="absolute inset-0 pointer-events-none p-12 grid grid-cols-2 grid-rows-2">
            {/* Row 1 Col 1: High MFE, Low MAE -> Q1 */}
            <div className="border-r border-b border-slate-800/50 p-4 flex flex-col justify-start items-start">
              <span className="text-green-500/10 font-bold text-4xl uppercase">
                Q1
              </span>
              <span className="text-slate-600/40 text-xs uppercase mt-1">
                Sniper Entries
              </span>
            </div>

            {/* Row 1 Col 2: High MFE, High MAE -> Q2 */}
            <div className="border-b border-slate-800/50 p-4 flex flex-col justify-start items-end">
              <span className="text-yellow-500/10 font-bold text-4xl uppercase">
                Q2
              </span>
              <span className="text-slate-600/40 text-xs uppercase mt-1">
                Volatile Wins
              </span>
            </div>

            {/* Row 2 Col 1: Low MFE, Low MAE -> Q4 */}
            <div className="border-r border-slate-800/50 p-4 flex flex-col justify-end items-start">
              <span className="text-blue-500/20 font-bold text-4xl uppercase">
                Q4
              </span>
              <span className="text-slate-600/40 text-xs uppercase mt-1">
                Chop / Scalps
              </span>
            </div>

            {/* Row 2 Col 2: Low MFE, High MAE -> Q3 */}
            <div className="p-4 flex flex-col justify-end items-end">
              <span className="text-slate-500/10 font-bold text-4xl uppercase">
                Q3
              </span>
              <span className="text-slate-600/40 text-xs uppercase mt-1">
                Clean Losses
              </span>
            </div>
          </div>

          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#334155"
                opacity={0.3}
              />
              <XAxis
                type="number"
                dataKey="mae"
                name="MAE"
                unit="R"
                stroke="#94a3b8"
                fontSize={12}
                tickCount={6}
                domain={[0, 2]}
              >
                <Label
                  value="MAE (Maximum Adverse Excursion)"
                  offset={0}
                  position="insideBottom"
                  fill="#64748b"
                  fontSize={11}
                  dy={15}
                />
              </XAxis>
              <YAxis
                type="number"
                dataKey="mfe"
                name="MFE"
                unit="R"
                stroke="#94a3b8"
                fontSize={12}
                tickCount={6}
                domain={[0, 6]}
              >
                <Label
                  value="MFE (Maximum Favorable Excursion)"
                  angle={-90}
                  position="insideLeft"
                  fill="#64748b"
                  fontSize={11}
                  dx={-10}
                />
              </YAxis>
              <ZAxis
                type="number"
                dataKey="rMultiple"
                range={[50, 400]}
                name="R-Multiple"
              />
              <Tooltip
                content={<ScatterTooltip />}
                cursor={{ strokeDasharray: '3 3', stroke: '#cbd5e1' }}
              />

              {/* Quadrant Dividers */}
              <ReferenceLine
                x={0.8}
                stroke="#475569"
                strokeDasharray="5 5"
                label={{
                  value: 'High Heat Threshold (0.8R)',
                  position: 'insideTopRight',
                  fill: '#475569',
                  fontSize: 10,
                }}
              />
              <ReferenceLine
                y={2.0}
                stroke="#475569"
                strokeDasharray="5 5"
                label={{
                  value: 'Target Threshold (2R)',
                  position: 'insideTopRight',
                  fill: '#475569',
                  fontSize: 10,
                }}
              />

              <Scatter
                name="Trades"
                data={filteredTrades}
                fill="#8884d8"
                animationDuration={1000}
              >
                {filteredTrades.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.rMultiple > 0 ? '#22c55e' : '#ef4444'}
                    stroke={entry.grade === 'A' ? '#fbbf24' : 'transparent'}
                    strokeWidth={entry.grade === 'A' ? 2 : 0}
                    className="transition-all duration-300 hover:opacity-100 opacity-80"
                  />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        {/* Sidebar Info */}
        <div className="flex flex-col gap-6">
          {/* Quadrant Stats */}
          <div className="bg-slate-900 rounded-lg p-4 border border-slate-800">
            <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center">
              <Crosshair className="w-4 h-4 mr-2 text-blue-400" /> Quadrant
              Distribution
            </h3>
            <div className="space-y-3">
              {quadrantStats.map((stat) => (
                <div
                  key={stat.label}
                  className="group flex items-center justify-between p-2 rounded hover:bg-slate-800 transition-colors cursor-default"
                >
                  <div>
                    <div className={`text-xs font-bold ${stat.color}`}>
                      {stat.label}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {stat.description}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-mono font-bold text-slate-200">
                      {stat.percentage}%
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {stat.count} trades
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Diagnostics */}
          <div className="bg-slate-900 rounded-lg p-4 border border-slate-800 flex-1">
            <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center">
              <TrendingUp className="w-4 h-4 mr-2 text-yellow-400" />
              Diagnostics
            </h3>
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
              {diagnostics.length === 0 ? (
                <div className="text-xs text-slate-500 italic p-4 text-center">
                  Not enough data to form patterns yet.
                </div>
              ) : (
                diagnostics.map((diag, i) => (
                  <div
                    key={i}
                    className={`p-3 rounded border border-l-4 ${
                      diag.severity === 'high'
                        ? 'border-red-900/50 border-l-red-500 bg-red-900/10'
                        : diag.severity === 'medium'
                        ? 'border-yellow-900/50 border-l-yellow-500 bg-yellow-900/10'
                        : 'border-green-900/50 border-l-green-500 bg-green-900/10'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="text-xs font-bold text-slate-200">
                        {diag.title}
                      </h4>
                      {diag.severity === 'high' && (
                        <AlertTriangle className="w-3 h-3 text-red-500" />
                      )}
                      {diag.severity === 'low' && (
                        <CheckCircle className="w-3 h-3 text-green-500" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 mb-2 leading-relaxed">
                      {diag.evidence}
                    </p>
                    <div className="flex flex-col gap-1 mt-2 pt-2 border-t border-slate-800/50">
                      <div className="text-[10px]">
                        <span className="text-slate-500 uppercase font-bold tracking-wider">
                          Cost:
                        </span>{' '}
                        <span className="text-slate-300">{diag.cost}</span>
                      </div>
                      <div className="text-[10px]">
                        <span className="text-slate-500 uppercase font-bold tracking-wider">
                          Fix:
                        </span>{' '}
                        <span className="text-blue-300">{diag.fix}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="text-[10px] text-slate-600 text-center uppercase tracking-widest pt-4 border-t border-slate-900">
        Professional Grade Analytics • Module 2.5
      </div>
    </div>
  );
};

export default MaeMfeScatterPlot;
