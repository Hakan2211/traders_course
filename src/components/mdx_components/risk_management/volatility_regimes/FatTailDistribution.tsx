
import React, { useState, useMemo } from 'react';
import {
  ComposedChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceArea,
  ReferenceLine,
} from 'recharts';
import {
  generateDistributionData,
  formatProbability,
  getTimeFrequency,
} from '../utils/math';
import {
  AlertTriangle,
  ZoomIn,
  ZoomOut,
  Info,
  Calculator,
  TrendingUp,
} from 'lucide-react';

interface FatTailChartProps {
  showEvents?: boolean;
}

const FatTailDistribution: React.FC<FatTailChartProps> = ({
  showEvents = true,
}) => {
  const [zoomTail, setZoomTail] = useState(false);
  const [hoveredSigma, setHoveredSigma] = useState<number | null>(null);
  const [calculatorSigma, setCalculatorSigma] = useState(4.5);

  // Generate data based on zoom level.
  // Zoom focuses on the "Tail" (3 to 6 sigma) where the danger lies.
  const data = useMemo(() => {
    if (zoomTail) {
      // Generate only right tail data
      const tailData = generateDistributionData(7, 0.1).filter(
        (d) => d.sigma >= 2.5
      );
      return tailData;
    }
    return generateDistributionData(6, 0.1);
  }, [zoomTail]);

  // Historical "Impossible" Events
  const events = [
    { sigma: 4.5, label: 'Flash Crash', color: '#f59e0b' }, // ~4-5 sigma
    { sigma: 5.2, label: "Covid '20", color: '#ef4444' }, // Extreme
    { sigma: 5.8, label: 'Black Monday', color: '#b91c1c' }, // In reality 20 sigma, but clamped for chart
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const normalVal =
        payload.find((p: any) => p.dataKey === 'normal')?.value || 0;
      const fatVal =
        payload.find((p: any) => p.dataKey === 'fatTail')?.value || 0;
      const ratio =
        normalVal === 0 ? '>10,000x' : (fatVal / normalVal).toFixed(1) + 'x';

      return (
        <div className="bg-slate-900 border border-slate-700 p-3 rounded-lg shadow-xl text-xs sm:text-sm z-50">
          <p className="font-bold text-slate-200 mb-2 border-b border-slate-700 pb-1">
            σ level: {label}
          </p>
          <div className="space-y-1">
            <p className="text-emerald-400 flex justify-between gap-4">
              <span>Theoretical:</span>
              <span className="font-mono">{formatProbability(normalVal)}</span>
            </p>
            <p className="text-rose-400 flex justify-between gap-4">
              <span>Real Market:</span>
              <span className="font-mono">{formatProbability(fatVal)}</span>
            </p>
            <div className="mt-2 pt-2 border-t border-slate-700">
              <p className="text-slate-400 text-[10px] uppercase tracking-wider">
                Risk Multiplier
              </p>
              <p className="text-amber-400 font-bold text-lg">
                {ratio} more likely
              </p>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full bg-slate-900 rounded-xl border border-slate-700 shadow-2xl overflow-hidden mb-8">
      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <AlertTriangle className="text-rose-500 w-6 h-6" />
            The Normal Distribution Lie
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Comparing textbook theory vs. market reality
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-800 p-1 rounded-lg">
          <button
            onClick={() => setZoomTail(false)}
            className={`px-3 py-1.5 text-sm rounded-md transition-all flex items-center gap-2 ${
              !zoomTail
                ? 'bg-slate-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ZoomOut className="w-4 h-4" /> Full View
          </button>
          <button
            onClick={() => setZoomTail(true)}
            className={`px-3 py-1.5 text-sm rounded-md transition-all flex items-center gap-2 ${
              zoomTail
                ? 'bg-rose-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ZoomIn className="w-4 h-4" /> Inspect Tail Risk
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      {zoomTail && (
        <div className="bg-rose-900/20 border-b border-rose-900/30 p-3 flex items-start gap-3">
          <Info className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="text-sm text-rose-200">
            <span className="font-bold">Tail View Active:</span> Notice how the{' '}
            <span className="text-emerald-400">Normal (Green)</span> line hits
            zero probability quickly, while the{' '}
            <span className="text-rose-400">Fat Tail (Red)</span> remains
            elevated? That gap represents the Black Swans that destroy accounts.
          </div>
        </div>
      )}

      {/* Chart */}
      <div className="h-[350px] w-full p-2 sm:p-4 relative">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={data}
            margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
            onMouseMove={(e) => {
              if (e.activeLabel) setHoveredSigma(Number(e.activeLabel));
            }}
            onMouseLeave={() => setHoveredSigma(null)}
          >
            <defs>
              <linearGradient id="colorNormal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorFat" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#334155"
              opacity={0.3}
            />
            <XAxis
              dataKey="sigma"
              label={{
                value: 'Standard Deviations (σ)',
                position: 'bottom',
                fill: '#94a3b8',
                offset: 0,
              }}
              stroke="#64748b"
              tick={{ fill: '#94a3b8', fontSize: 12 }}
              type="number"
              domain={zoomTail ? [2.5, 7] : ['dataMin', 'dataMax']}
              allowDataOverflow
            />
            <YAxis
              stroke="#64748b"
              tick={{ fill: '#94a3b8', fontSize: 10 }}
              width={40}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ stroke: '#94a3b8', strokeWidth: 1 }}
            />

            {/* Normal Distribution */}
            <Area
              type="monotone"
              dataKey="normal"
              stroke="#10b981"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorNormal)"
              name="Normal Distribution"
              isAnimationActive={true}
              animationDuration={1500}
            />

            {/* Fat Tail Distribution */}
            <Area
              type="monotone"
              dataKey="fatTail"
              stroke="#f43f5e"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorFat)"
              name="Real Market (Fat Tail)"
              isAnimationActive={true}
              animationDuration={1500}
            />

            {/* Annotations */}
            {!zoomTail && (
              <ReferenceArea x1={-1} x2={1} fill="#3b82f6" fillOpacity={0.05} />
            )}

            {/* Historical Events Overlay */}
            {showEvents &&
              events.map((event, i) => (
                <ReferenceLine
                  key={i}
                  x={event.sigma}
                  stroke={event.color}
                  strokeDasharray="3 3"
                  label={{
                    position: 'top',
                    value: event.label,
                    fill: event.color,
                    fontSize: 12,
                    fontWeight: 'bold',
                  }}
                />
              ))}

            {/* Calculator Reference Line */}
            <ReferenceLine
              x={calculatorSigma}
              stroke="#38bdf8"
              strokeWidth={2}
              strokeDasharray="5 5"
              ifOverflow="extendDomain"
            />
          </ComposedChart>
        </ResponsiveContainer>

        {/* Legend Overlay */}
        <div className="absolute top-6 right-6 bg-slate-900/80 backdrop-blur border border-slate-700 p-3 rounded-lg text-xs sm:text-sm shadow-lg pointer-events-none">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-4 h-1 bg-emerald-500 rounded-full"></div>
            <span className="text-emerald-100 font-medium">
              Textbook (Normal)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-1 bg-rose-500 rounded-full"></div>
            <span className="text-rose-100 font-bold">
              Real World (Fat Tail)
            </span>
          </div>
        </div>
      </div>

      {/* Explainer Footer / Calculator */}
      <div className="bg-slate-800 border-t border-slate-700">
        <div className="p-4 sm:p-6 grid lg:grid-cols-2 gap-8">
          {/* Interactive Calculator Input */}
          <div className="space-y-4">
            <h3 className="text-white font-bold flex items-center gap-2">
              <Calculator className="w-4 h-4 text-sky-400" /> Tail Event
              Frequency Calculator
            </h3>
            <p className="text-xs text-slate-400">
              Drag the slider to see how often "impossible" events actually
              happen in financial markets compared to what traditional models
              predict.
            </p>

            <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
              <div className="flex justify-between items-end mb-2">
                <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                  Event Magnitude
                </label>
                <span className="text-2xl font-bold text-sky-400">
                  {calculatorSigma}σ
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="7"
                step="0.1"
                value={calculatorSigma}
                onChange={(e) => setCalculatorSigma(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-sky-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-2 font-mono">
                <span>1σ (Daily Noise)</span>
                <span>3σ (Correction)</span>
                <span>5σ (Crash)</span>
                <span>7σ (Collapse)</span>
              </div>
            </div>
          </div>
          {/* Comparison Display */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-emerald-950/20 p-4 rounded-lg border border-emerald-900/30 flex flex-col justify-between relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <TrendingUp className="w-12 h-12 text-emerald-500" />
              </div>
              <div>
                <p className="text-xs text-emerald-500 font-bold uppercase tracking-wider mb-2">
                  Normal World
                </p>
                <p className="text-xl sm:text-2xl text-white font-serif leading-tight">
                  {getTimeFrequency(calculatorSigma, 'normal')}
                </p>
              </div>
              <p className="text-[10px] text-slate-400 mt-3 border-t border-emerald-900/30 pt-2">
                Based on Gaussian Distribution (Textbook)
              </p>
            </div>
            <div className="bg-rose-950/20 p-4 rounded-lg border border-rose-900/30 flex flex-col justify-between relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <AlertTriangle className="w-12 h-12 text-rose-500" />
              </div>
              <div>
                <p className="text-xs text-rose-500 font-bold uppercase tracking-wider mb-2">
                  Real World
                </p>
                <p className="text-xl sm:text-2xl text-white font-bold leading-tight">
                  {getTimeFrequency(calculatorSigma, 'fat')}
                </p>
              </div>
              <p className="text-[10px] text-slate-400 mt-3 border-t border-rose-900/30 pt-2">
                Based on Fat-Tail Distribution (Reality)
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FatTailDistribution;
