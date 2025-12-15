
import React, { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { Eye, Lock, Ghost } from 'lucide-react';

export interface ChartDataPoint {
  time: string;
  price: number;
}

const data = [
  { time: 'T-0', price: 52.0 },
  { time: 'T-1', price: 51.5 },
  { time: 'T-2', price: 50.0 }, // Entry point visually roughly here
  { time: 'T-3', price: 50.8 },
  { time: 'T-4', price: 49.2 },
  { time: 'T-5', price: 48.5 },
  { time: 'T-6', price: 47.0 },
  { time: 'T-7', price: 46.5 },
  { time: 'T-8', price: 45.8 },
  { time: 'T-9', price: 45.0 }, // Current
];

const ENTRY_PRICE = 50.0;
const CURRENT_PRICE = 45.0;

export const AnchorBreaker: React.FC = () => {
  const [isRealityMode, setIsRealityMode] = useState(false);

  return (
    <div className="my-12 w-full max-w-4xl mx-auto bg-gradient-to-br from-gray-950/90 via-gray-900/85 to-black/90 dark:bg-slate-800 border border-gray-700/50 shadow-[0_10px_40px_rgba(0,0,0,0.6)] rounded-2xl backdrop-blur-2xl overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-700/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-900/30">
        <div>
          <h3 className="text-xl font-bold text-gray-100 flex items-center gap-2">
            <Ghost
              className={`w-5 h-5 ${
                isRealityMode ? 'text-gray-600' : 'text-blue-400'
              }`}
            />
            The Anchor Breaker
          </h3>
          <p className="text-sm text-gray-400 mt-1">
            Visualize how your entry price distorts reality.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span
            className={`text-sm font-medium ${
              !isRealityMode ? 'text-blue-400' : 'text-gray-500'
            }`}
          >
            Fantasy Mode
          </span>
          <button
            onClick={() => setIsRealityMode(!isRealityMode)}
            className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 ${
              isRealityMode ? 'bg-emerald-500' : 'bg-gray-600'
            }`}
          >
            <span
              className={`${
                isRealityMode ? 'translate-x-7' : 'translate-x-1'
              } inline-block h-6 w-6 transform rounded-full bg-white transition-transform duration-300 shadow-lg`}
            />
          </button>
          <span
            className={`text-sm font-medium ${
              isRealityMode ? 'text-emerald-400' : 'text-gray-500'
            }`}
          >
            Reality Mode
          </span>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-6 relative min-h-[400px]">
        {/* The Chart */}
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#374151"
                vertical={false}
              />
              <XAxis
                dataKey="time"
                stroke="#9ca3af"
                tick={{ fill: '#9ca3af', fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                domain={[40, 55]}
                stroke="#9ca3af"
                tick={{ fill: '#9ca3af', fontSize: 12 }}
                tickFormatter={(val) => `$${val}`}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#111827',
                  borderColor: '#374151',
                  color: '#f3f4f6',
                }}
                itemStyle={{ color: '#f3f4f6' }}
                formatter={(value: number) => [`$${value.toFixed(2)}`, 'Price']}
              />

              <Line
                type="monotone"
                dataKey="price"
                stroke="#f3f4f6"
                strokeWidth={3}
                dot={{ r: 4, fill: '#f3f4f6', strokeWidth: 0 }}
                activeDot={{ r: 6, fill: '#3b82f6' }}
              />

              {/* The Anchor Line (Entry) - Dissolves in Reality Mode */}
              <ReferenceLine
                y={ENTRY_PRICE}
                stroke="#3b82f6"
                strokeDasharray="4 4"
                strokeOpacity={isRealityMode ? 0 : 1}
                className="transition-all duration-1000 ease-in-out"
              ></ReferenceLine>

              {/* Current Price Line - Always visible, maybe highlighted more in reality */}
              <ReferenceLine
                y={CURRENT_PRICE}
                stroke={isRealityMode ? '#10b981' : '#ef4444'}
                strokeDasharray="2 2"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Overlay Labels & Annotations - Absolute positioning for transitions */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Entry Price Label - Anchored to 50 */}
          <div
            className={`absolute left-[10%] top-[90px] transition-all duration-700 transform ${
              isRealityMode
                ? 'opacity-0 translate-y-[-20px] scale-90'
                : 'opacity-100 translate-y-0 scale-100'
            }`}
          >
            <div className="bg-blue-900/80 backdrop-blur text-blue-100 px-3 py-1 rounded shadow-lg border border-blue-500/50 flex items-center gap-2">
              <Lock className="w-3 h-3" />
              <span className="font-mono font-bold">
                YOUR ENTRY: ${ENTRY_PRICE.toFixed(2)}
              </span>
            </div>
            <div className="text-blue-400 text-xs mt-1 font-medium ml-1">
              The Anchor
            </div>
          </div>

          {/* Current Price Label - Anchored to 45 */}
          <div className="absolute right-[5%] bottom-[80px]">
            <div
              className={`transition-all duration-500 transform border backdrop-blur px-3 py-2 rounded shadow-lg flex flex-col items-end ${
                isRealityMode
                  ? 'bg-emerald-900/80 border-emerald-500/50 scale-110'
                  : 'bg-red-900/80 border-red-500/50 scale-100'
              }`}
            >
              <span
                className={`text-xs uppercase font-bold tracking-wider mb-1 ${
                  isRealityMode ? 'text-emerald-300' : 'text-red-300'
                }`}
              >
                {isRealityMode ? 'Current Asset Value' : 'Current P&L'}
              </span>
              <span
                className={`font-mono text-xl font-bold ${
                  isRealityMode ? 'text-emerald-100' : 'text-red-100'
                }`}
              >
                {isRealityMode ? `$${CURRENT_PRICE.toFixed(2)}` : `-$5.00`}
              </span>
            </div>
          </div>

          {/* Reality Message Overlay */}
          <div
            className={`absolute inset-0 flex items-center justify-center transition-all duration-700 ${
              isRealityMode
                ? 'opacity-100 backdrop-blur-[2px]'
                : 'opacity-0 pointer-events-none'
            }`}
          >
            <div className="bg-gray-950/90 border border-emerald-500/30 p-6 rounded-xl shadow-2xl max-w-md text-center transform transition-transform duration-700 translate-y-0 backdrop-blur-sm">
              <h4 className="text-emerald-400 font-bold text-lg mb-2 flex justify-center items-center gap-2">
                <Eye className="w-5 h-5" />
                Reality Check
              </h4>
              <p className="text-gray-200 text-lg font-medium leading-relaxed">
                "The market does not know you bought at{' '}
                <span className="text-blue-400 font-bold text-xl decoration-blue-500/50 line-through decoration-2">
                  $50
                </span>
                ."
              </p>
              <p className="text-gray-400 mt-4 text-sm">
                The $50 ghost is gone. You simply own an asset worth{' '}
                <span className="text-emerald-400 font-bold">$45</span>. <br />
                Make your decision based on{' '}
                <span className="text-emerald-400">now</span>.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer / Explanation */}
      <div
        className={`p-4 text-sm text-center border-t transition-colors duration-500 ${
          isRealityMode
            ? 'bg-emerald-900/20 border-emerald-900/50 text-emerald-200/70'
            : 'bg-gray-900/30 border-gray-700/50 text-gray-400'
        }`}
      >
        {isRealityMode
          ? 'Anchor removed. You are now seeing the trade as a new participant would.'
          : 'Toggle Reality Mode to dissolve the psychological anchor.'}
      </div>
    </div>
  );
};
