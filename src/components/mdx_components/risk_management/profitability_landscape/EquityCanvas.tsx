
import React, { useRef, useEffect } from 'react';
import { SimulationResult } from './types';

interface EquityCanvasProps {
  data: SimulationResult | SimulationResult[];
  width?: number;
  height?: number;
  isMonteCarlo?: boolean;
  highlightStreaks?: boolean;
}

export const EquityCanvas: React.FC<EquityCanvasProps> = ({
  data,
  width = 800,
  height = 400,
  isMonteCarlo = false,
  highlightStreaks = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    ctx.clearRect(0, 0, width, height);

    drawGrid(ctx, width, height);

    if (Array.isArray(data)) {
      if (data.length === 0) return;

      const maxEquity = Math.max(
        ...data.map((r) => Math.max(...r.equityCurve))
      );
      const minEquity = Math.min(
        ...data.map((r) => Math.min(...r.equityCurve))
      );
      const range = Math.max(1, maxEquity - minEquity);

      data.forEach((result, idx) => {
        drawCurve(
          ctx,
          result.equityCurve,
          width,
          height,
          maxEquity,
          minEquity,
          range,
          idx === data.length - 1
            ? 'rgba(59, 130, 246, 1)'
            : 'rgba(59, 130, 246, 0.15)',
          idx === data.length - 1 ? 2 : 1
        );
      });
    } else if (data) {
      const curve = data.equityCurve;
      if (curve.length === 0) return;

      const maxEquity = Math.max(...curve);
      const minEquity = Math.min(...curve);
      const range = Math.max(1, maxEquity - minEquity);

      if (highlightStreaks) {
        drawStreakHighlights(ctx, data, width, height);
      }

      drawCurve(
        ctx,
        curve,
        width,
        height,
        maxEquity,
        minEquity,
        range,
        '#3b82f6',
        2
      );

      const startCap = curve[0];
      const yZero =
        height - ((startCap - minEquity) / range) * (height - 40) - 20;
      ctx.beginPath();
      ctx.setLineDash([5, 5]);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.moveTo(0, yZero);
      ctx.lineTo(width, yZero);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }, [data, width, height, highlightStreaks]);

  return (
    <div className="relative w-full border border-slate-800 bg-slate-900 rounded-lg overflow-hidden shadow-inner">
      <canvas ref={canvasRef} className="w-full block" />
      <div className="absolute top-2 right-4 text-xs text-slate-500 pointer-events-none">
        Equity Curve (1% risk per trade)
      </div>
      {isMonteCarlo && (
        <div className="absolute top-4 left-4 bg-slate-950/80 p-2 rounded border border-blue-900/50 backdrop-blur-sm">
          <p className="text-xs text-blue-300 font-mono">
            Running 50 Simulations
          </p>
        </div>
      )}
    </div>
  );
};

const drawGrid = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let i = 1; i < 5; i++) {
    const x = (w / 5) * i;
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
  }
  for (let i = 1; i < 5; i++) {
    const y = (h / 5) * i;
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
  }
  ctx.stroke();
};

const drawCurve = (
  ctx: CanvasRenderingContext2D,
  curve: number[],
  w: number,
  h: number,
  max: number,
  min: number,
  range: number,
  color: string,
  lineWidth: number
) => {
  const padding = 20;
  const drawHeight = h - padding * 2;

  ctx.beginPath();
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;

  curve.forEach((val, i) => {
    const x = (i / (curve.length - 1)) * w;
    const normalizedY = (val - min) / range;
    const y = h - padding - normalizedY * drawHeight;

    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });

  ctx.stroke();
};

const drawStreakHighlights = (
  ctx: CanvasRenderingContext2D,
  result: SimulationResult,
  w: number,
  h: number
) => {
  const curve = result.equityCurve;
  let consecutiveLosses = 0;
  const threshold = 4;

  const highlightRegion = (
    startIdx: number,
    endIdx: number,
    streakCount: number
  ) => {
    const x1 = (startIdx / (curve.length - 1)) * w;
    const x2 = (endIdx / (curve.length - 1)) * w;
    ctx.fillStyle = `rgba(244, 63, 94, ${Math.min(
      0.1 + streakCount * 0.02,
      0.5
    )})`;
    ctx.fillRect(x1, 0, x2 - x1, h);
  };

  for (let i = 1; i <= result.trades.length; i++) {
    if (i <= result.trades.length && !result.trades[i - 1]) {
      consecutiveLosses++;
    } else {
      if (consecutiveLosses >= threshold) {
        highlightRegion(i - consecutiveLosses, i, consecutiveLosses);
      }
      consecutiveLosses = 0;
    }
  }
};
