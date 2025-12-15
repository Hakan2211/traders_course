
import React from 'react';
import { CandleData } from './types';

interface CandlestickChartProps {
  data: CandleData[];
  width?: number;
  height?: number;
  className?: string;
  supportLevel: number;
  resistanceLevel: number;
}

const CandlestickChart: React.FC<CandlestickChartProps> = ({
  data,
  width = 800,
  height = 400,
  className = '',
  supportLevel,
  resistanceLevel,
}) => {
  // Calculate scales
  const minPrice = Math.min(...data.map((d) => d.low)) * 0.99;
  const maxPrice = Math.max(...data.map((d) => d.high)) * 1.01;
  const priceRange = maxPrice - minPrice;

  const getY = (price: number) =>
    height - ((price - minPrice) / priceRange) * height;
  const candleWidth = (width / data.length) * 0.6;
  const candleSpacing = width / data.length;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={`w-full h-full overflow-visible ${className}`}
    >
      {/* Grid Lines */}
      <line
        x1="0"
        y1={getY(supportLevel)}
        x2={width}
        y2={getY(supportLevel)}
        stroke="#374151"
        strokeDasharray="4 4"
        strokeWidth="1"
      />
      <line
        x1="0"
        y1={getY(resistanceLevel)}
        x2={width}
        y2={getY(resistanceLevel)}
        stroke="#374151"
        strokeDasharray="4 4"
        strokeWidth="1"
      />

      {/* Candles */}
      {data.map((candle, i) => {
        const x = i * candleSpacing + (candleSpacing - candleWidth) / 2;
        const isGreen = candle.close >= candle.open;
        const color = isGreen ? '#22c55e' : '#ef4444';

        return (
          <g key={candle.id}>
            {/* Wick */}
            <line
              x1={x + candleWidth / 2}
              y1={getY(candle.high)}
              x2={x + candleWidth / 2}
              y2={getY(candle.low)}
              stroke={color}
              strokeWidth="2"
            />
            {/* Body */}
            <rect
              x={x}
              y={Math.min(getY(candle.open), getY(candle.close))}
              width={candleWidth}
              height={Math.abs(getY(candle.open) - getY(candle.close))}
              fill={color}
            />
          </g>
        );
      })}
    </svg>
  );
};

export default CandlestickChart;
