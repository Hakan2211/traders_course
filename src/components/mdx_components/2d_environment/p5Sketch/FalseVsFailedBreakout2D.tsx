
import React, {
  useCallback,
  useMemo,
  useRef,
  useState,
  useEffect,
} from 'react';
import type p5 from 'p5';
import P5Sketch from '@/components/mdx_components/2d_environment/p5Sketch/p5SketchContainer';
import { cn } from '@/lib/utils';

type ViewMode = 'candle' | 'line';

export const FalseVsFailedBreakout2D: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('candle');
  const [framesPerTick, setFramesPerTick] = useState<number>(3); // higher = slower

  // Refs for p5 access without re-creating the sketch
  const isPlayingRef = useRef(isPlaying);
  const viewModeRef = useRef<ViewMode>(viewMode);
  const framesPerTickRef = useRef<number>(framesPerTick);
  const stepQueueRef = useRef<number>(0);
  const resetRequestRef = useRef<boolean>(false);
  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);
  useEffect(() => {
    viewModeRef.current = viewMode;
  }, [viewMode]);
  useEffect(() => {
    framesPerTickRef.current = framesPerTick;
  }, [framesPerTick]);

  const framesPerCycle = 240; // ~4s at 60fps
  const STEP_TARGET = 60; // aim to step roughly one of ~60 visible bars
  const STEP_SIZE = Math.max(1, Math.floor(framesPerCycle / STEP_TARGET));

  // Price path generators (normalized 0..100)
  const generateFalseBreakout = useCallback(() => {
    const prices: number[] = [];
    const volumes: number[] = [];
    // Lower ground so path to liquidity zone is taller
    const base = 36;
    for (let i = 0; i < framesPerCycle; i++) {
      let t = i / framesPerCycle;
      let price: number;
      // 0-0.25: range
      if (t < 0.25) {
        price =
          base + Math.sin(t * Math.PI * 4) * 1.6 + (Math.random() - 0.5) * 0.6;
        volumes.push(0.2 + Math.random() * 0.2);
      }
      // 0.25-0.35: breakout spike through liquidity
      else if (t < 0.35) {
        const u = (t - 0.25) / 0.1; // 0..1
        price = base + 20 + u * 28 + (Math.random() - 0.5) * 0.8;
        volumes.push(0.9 - Math.abs(0.5 - u) * 0.2 + Math.random() * 0.05); // spike
      }
      // 0.35-0.5: snap back (fast V down)
      else if (t < 0.5) {
        const u = (t - 0.35) / 0.15; // 0..1
        price = base + 30 - u * 24 + (Math.random() - 0.5) * 1.0;
        volumes.push(0.45 - u * 0.25 + Math.random() * 0.05); // dies quickly
      }
      // 0.5-1.0: sustained move opposite direction
      else {
        const u = (t - 0.5) / 0.5; // 0..1
        price = base + 4 - u * 12 + (Math.random() - 0.5) * 1.0;
        volumes.push(0.25 + (1 - u) * 0.15 + Math.random() * 0.05);
      }
      prices.push(Math.max(20, Math.min(90, price)));
    }
    return {
      prices,
      volumes,
      // Raise liquidity band higher to increase the gap visually
      zonePrice: 76,
      zoneHeight: 8,
      zoneLabel: 'Liquidity Zone',
    };
  }, [framesPerCycle]);

  const generateFailedBreakout = useCallback(() => {
    const prices: number[] = [];
    const volumes: number[] = [];
    // Lower base so path up to resistance is taller
    const base = 40;
    for (let i = 0; i < framesPerCycle; i++) {
      let t = i / framesPerCycle;
      let price: number;
      // 0-0.25: range
      if (t < 0.25) {
        price =
          base + Math.sin(t * Math.PI * 2) * 1.2 + (Math.random() - 0.5) * 0.6;
        volumes.push(0.25 + Math.random() * 0.15);
      }
      // 0.25-0.55: slow breakout
      else if (t < 0.55) {
        const u = (t - 0.25) / 0.3; // 0..1
        // Climb to well above resistance to ensure a brief section above it
        price = base + 10 + u * 30 + (Math.random() - 0.5) * 0.8; // ~50 -> ~80
        volumes.push(0.45 - u * 0.1 + Math.random() * 0.05); // sustained, slight fade
      }
      // 0.55-0.85: rounded top rollover
      else if (t < 0.85) {
        // First maintain 4-6 candles above resistance, then roll over
        if (t < 0.65) {
          const u2 = (t - 0.55) / 0.1; // 0..1 over ~24 frames
          price = 78 - 4 * u2 + (Math.random() - 0.5) * 0.6; // 78 -> 74 (all > 70)
          volumes.push(0.38 - u2 * 0.08 + Math.random() * 0.04);
        } else {
          const u3 = (t - 0.65) / 0.2; // 0..1
          const ease = Math.pow(u3, 1.5);
          price = 74 - 12 * ease + (Math.random() - 0.5) * 0.8; // 74 -> ~62
          volumes.push(0.3 - u3 * 0.12 + Math.random() * 0.04);
        }
      }
      // 0.85-1.0: choppy aftermath near base+
      else {
        const u = (t - 0.85) / 0.15;
        price =
          base +
          8 -
          u * 5 +
          Math.sin(i * 0.4) * 0.8 +
          (Math.random() - 0.5) * 0.8;
        volumes.push(0.22 + Math.random() * 0.1);
      }
      prices.push(Math.max(20, Math.min(90, price)));
    }
    return {
      prices,
      volumes,
      // Raise resistance line to increase the gap visually
      zonePrice: 70,
      zoneHeight: 0,
      zoneLabel: 'Resistance',
    }; // line
  }, [framesPerCycle]);

  const datasets = useMemo(() => {
    return {
      falseBreakout: generateFalseBreakout(),
      failedBreakout: generateFailedBreakout(),
    };
  }, [generateFalseBreakout, generateFailedBreakout]);

  const sketch = useCallback(
    (p: p5, parentEl: HTMLDivElement) => {
      let progress = 0;
      let frameCounter = 0;

      const bg = { r: 20, g: 20, b: 30 };
      const priceAreaRatio = 0.7; // top area for price, bottom for volume
      const panelGap = 24;
      const margin = { top: 32, right: 28, bottom: 110, left: 28 };

      const getPanels = () => {
        const fullW = parentEl.clientWidth;
        const fullH = parentEl.clientHeight;
        const innerW = fullW - margin.left - margin.right;
        const innerH = fullH - margin.top - margin.bottom;
        const halfW = (innerW - panelGap) / 2;
        return {
          left: { x: margin.left, y: margin.top, w: halfW, h: innerH },
          right: {
            x: margin.left + halfW + panelGap,
            y: margin.top,
            w: halfW,
            h: innerH,
          },
        };
      };

      const priceToY = (price: number, panel: { y: number; h: number }) => {
        // price 0..100 maps top..bottom within price sub-area
        const priceH = panel.h * priceAreaRatio;
        return panel.y + (1 - price / 100) * priceH;
      };

      const volumeToH = (vol: number, panel: { h: number }) => {
        const volH = panel.h * (1 - priceAreaRatio);
        return volH * Math.max(0, Math.min(1, vol));
      };

      const drawLiquidityZone = (
        panel: { x: number; y: number; w: number; h: number },
        zonePrice: number,
        zoneHeight: number,
        label: string,
        style: 'band' | 'line'
      ) => {
        const yCenter = priceToY(zonePrice, panel);
        if (style === 'band') {
          const yTop = priceToY(zonePrice + zoneHeight / 2, panel);
          const yBottom = priceToY(zonePrice - zoneHeight / 2, panel);
          p.noStroke();
          p.fill(255, 60, 60, 26);
          p.rect(panel.x, yTop, panel.w, yBottom - yTop);
          p.stroke(255, 90, 90, 160);
          p.strokeWeight(1.5);
          p.line(panel.x, yTop, panel.x + panel.w, yTop);
          p.line(panel.x, yBottom, panel.x + panel.w, yBottom);
        } else {
          p.stroke(200, 200, 220, 160);
          p.strokeWeight(1.5);
          p.drawingContext.setLineDash([6, 6]);
          p.line(panel.x, yCenter, panel.x + panel.w, yCenter);
          p.drawingContext.setLineDash([]);
        }
        // Label
        p.noStroke();
        p.fill(230, 230, 240, 200);
        p.textSize(12);
        p.textAlign(p.LEFT, p.BOTTOM);
        p.text(label, panel.x + 8, yCenter - 6);
      };

      const drawAnnotations = (
        panel: { x: number; y: number; w: number; h: number },
        kind: 'false' | 'failed',
        idx: number
      ) => {
        if (kind === 'false') {
          // Stop run near spike (around 0.3 of cycle)
          const alpha1 = Math.max(
            0,
            1 - Math.abs(idx - Math.floor(framesPerCycle * 0.32)) / 30
          );
          p.fill(255, 180, 180, 220 * alpha1);
          p.noStroke();
          p.textSize(12);
          p.textAlign(p.RIGHT, p.TOP);
          p.text('Stop run', panel.x + panel.w - 8, panel.y + 10);
          // Snap back arrow during 0.35-0.5
          if (idx > framesPerCycle * 0.35 && idx < framesPerCycle * 0.5) {
            const arrowX = panel.x + panel.w * 0.75;
            const arrowY1 = panel.y + panel.h * 0.18;
            const arrowY2 = arrowY1 + 36;
            p.stroke(255, 210, 150, 230);
            p.strokeWeight(2);
            p.line(arrowX, arrowY1, arrowX, arrowY2);
            p.line(arrowX, arrowY2, arrowX - 6, arrowY2 - 6);
            p.line(arrowX, arrowY2, arrowX + 6, arrowY2 - 6);
            p.noStroke();
            p.fill(255, 220, 170, 230);
            p.textAlign(p.LEFT, p.CENTER);
            p.text('Snap back', arrowX + 8, arrowY2 - 4);
          }
        } else {
          // Momentum fade around top (0.6-0.7)
          if (idx > framesPerCycle * 0.58 && idx < framesPerCycle * 0.75) {
            p.fill(180, 220, 255, 230);
            p.noStroke();
            p.textSize(12);
            p.textAlign(p.LEFT, p.TOP);
            p.text('Momentum fade', panel.x + 10, panel.y + 10);
          }
          // Rollover label around 0.75-0.85
          if (idx > framesPerCycle * 0.72 && idx < framesPerCycle * 0.88) {
            p.fill(220, 220, 255, 230);
            p.noStroke();
            p.textSize(12);
            p.textAlign(p.RIGHT, p.BOTTOM);
            p.text(
              'Rollover',
              panel.x + panel.w - 8,
              panel.y + panel.h * priceAreaRatio - 8
            );
          }
        }
      };

      const drawChart = (
        panel: { x: number; y: number; w: number; h: number },
        prices: number[],
        volumes: number[],
        idx: number
      ) => {
        // Panel background
        p.noStroke();
        p.fill(28, 28, 38);
        p.rect(panel.x, panel.y, panel.w, panel.h, 10);

        const visible = Math.max(2, Math.min(idx, prices.length - 1));
        const MAX_BARS = 60;
        const sampleStep = Math.max(1, Math.floor(visible / MAX_BARS));
        const sampledIdxs: number[] = [];
        for (let i = 0; i <= visible; i += sampleStep) sampledIdxs.push(i);
        if (sampledIdxs[sampledIdxs.length - 1] !== visible) {
          sampledIdxs.push(visible);
        }
        const stepX = panel.w / Math.max(1, sampledIdxs.length - 1);
        const priceH = panel.h * priceAreaRatio;
        const volHAll = panel.h * (1 - priceAreaRatio);
        const volY = panel.y + panel.h - volHAll;

        // Grid
        p.stroke(60, 60, 72);
        p.strokeWeight(1);
        for (let i = 0; i <= 4; i++) {
          const y = panel.y + (priceH / 4) * i;
          p.line(panel.x, y, panel.x + panel.w, y);
        }

        // Volume bars
        for (let s = 0; s < sampledIdxs.length; s++) {
          const i = sampledIdxs[s];
          const vol = volumes[i] ?? 0;
          const h = volumeToH(vol, panel);
          const x = panel.x + s * stepX;
          p.noStroke();
          // Color tint depends on next/prev price delta
          const prevIndex = s > 0 ? sampledIdxs[s - 1] : sampledIdxs[0];
          const nextIndex =
            s < sampledIdxs.length - 1 ? sampledIdxs[s + 1] : sampledIdxs[s];
          const prev = prices[prevIndex];
          const next = prices[nextIndex];
          const up = next >= prev;
          p.fill(up ? 100 : 255, up ? 255 : 100, 120, 160);
          const barW = Math.max(3, stepX * 0.6);
          p.rect(x - barW * 0.5, volY + volHAll - h, barW, h, 2);
        }

        // Price: line or candles
        if (viewModeRef.current === 'line') {
          p.noFill();
          p.stroke(160, 200, 255);
          p.strokeWeight(2);
          p.beginShape();
          for (let s = 0; s < sampledIdxs.length; s++) {
            const i = sampledIdxs[s];
            const x = panel.x + s * stepX;
            const y = priceToY(prices[i], panel);
            p.vertex(x, y);
          }
          p.endShape();
        } else {
          // Candles
          for (let s = 1; s < sampledIdxs.length; s++) {
            const i = sampledIdxs[s];
            const prevI = sampledIdxs[s - 1];
            const open = prices[prevI];
            const close = prices[i];
            const dirUp = close >= open;
            // Wick size tied to volume a bit
            const vol = volumes[i] ?? 0;
            const wick = 2 + vol * 8 + Math.random() * 2;
            const high = Math.min(95, Math.max(open, close) + wick);
            const low = Math.max(5, Math.min(open, close) - wick);

            const x = panel.x + s * stepX;
            const highY = priceToY(high, panel);
            const lowY = priceToY(low, panel);
            const openY = priceToY(open, panel);
            const closeY = priceToY(close, panel);

            p.stroke(dirUp ? 110 : 255, dirUp ? 255 : 110, 120);
            p.strokeWeight(1.5);
            p.line(x, highY, x, lowY);

            const bodyTop = Math.min(openY, closeY);
            const bodyBot = Math.max(openY, closeY);
            const bodyH = Math.max(2, bodyBot - bodyTop);
            const bodyW = Math.max(3, stepX * 0.6);

            p.noStroke();
            p.fill(dirUp ? 110 : 255, dirUp ? 255 : 110, 140);
            p.rect(x - bodyW * 0.5, bodyTop, bodyW, bodyH, 2);
          }
        }
      };

      p.setup = () => {
        p.createCanvas(parentEl.clientWidth, parentEl.clientHeight);
        p.frameRate(60);
      };

      p.draw = () => {
        p.background(bg.r, bg.g, bg.b);
        const panels = getPanels();

        // Handle reset request
        if (resetRequestRef.current) {
          progress = 0;
          frameCounter = 0;
          stepQueueRef.current = 0;
          resetRequestRef.current = false;
        }

        // Titles
        p.fill(235);
        p.noStroke();
        p.textSize(14);
        p.textAlign(p.CENTER, p.BOTTOM);
        p.text(
          'FALSE BREAKOUT (Liquidity Hunt)',
          panels.left.x + panels.left.w / 2,
          panels.left.y - 8
        );
        p.text(
          'FAILED BREAKOUT (Genuine Failure)',
          panels.right.x + panels.right.w / 2,
          panels.right.y - 8
        );

        // Draw charts
        drawChart(
          panels.left,
          datasets.falseBreakout.prices,
          datasets.falseBreakout.volumes,
          progress
        );
        drawChart(
          panels.right,
          datasets.failedBreakout.prices,
          datasets.failedBreakout.volumes,
          progress
        );

        // Liquidity zone / Resistance
        drawLiquidityZone(
          panels.left,
          datasets.falseBreakout.zonePrice,
          datasets.falseBreakout.zoneHeight,
          datasets.falseBreakout.zoneLabel,
          'band'
        );
        drawLiquidityZone(
          panels.right,
          datasets.failedBreakout.zonePrice,
          datasets.failedBreakout.zoneHeight,
          datasets.failedBreakout.zoneLabel,
          'line'
        );

        // Annotations
        drawAnnotations(panels.left, 'false', progress);
        drawAnnotations(panels.right, 'failed', progress);

        // Footer captions
        p.fill(210);
        p.textSize(12);
        p.textAlign(p.CENTER, p.TOP);
        p.text(
          'Quick V reversal, high intent',
          panels.left.x + panels.left.w / 2,
          panels.left.y + panels.left.h + 8
        );
        p.text(
          'Rounded top, loss of conviction',
          panels.right.x + panels.right.w / 2,
          panels.right.y + panels.right.h + 8
        );

        if (isPlayingRef.current) {
          // advance only every N frames to slow overall speed
          if (
            frameCounter % Math.max(1, Math.floor(framesPerTickRef.current)) ===
            0
          ) {
            progress = (progress + 1) % framesPerCycle;
          }
        } else {
          // consume requested bar steps (each step ~ one decimated bar)
          const barsQueued = stepQueueRef.current;
          if (barsQueued > 0) {
            progress = (progress + STEP_SIZE) % framesPerCycle;
            stepQueueRef.current = barsQueued - 1;
          }
        }

        frameCounter++;
      };

      p.windowResized = () => {
        p.resizeCanvas(parentEl.clientWidth, parentEl.clientHeight);
      };
    },
    [datasets, framesPerCycle]
  );

  return (
    <div className="w-full h-full">
      {/* Controls */}
      <div
        className={cn(
          'absolute z-10 bottom-3 left-1/2 -translate-x-1/2',
          'pointer-events-auto flex items-center gap-2',
          'bg-slate-900/80 border border-slate-700 rounded-full shadow px-3 py-1.5'
        )}
      >
        <button
          type="button"
          onClick={() => setIsPlaying((v) => !v)}
          className={cn(
            'px-3 py-1.5 rounded-md text-sm font-medium',
            isPlaying
              ? 'bg-emerald-600/80 hover:bg-emerald-600 text-white'
              : 'bg-slate-700/80 hover:bg-slate-700 text-slate-100'
          )}
          aria-label={isPlaying ? 'Pause animation' : 'Play animation'}
        >
          {isPlaying ? 'Pause' : 'Play'}
        </button>
        <button
          type="button"
          onClick={() => {
            // switch to paused step-by-step and request one step
            setIsPlaying(false);
            // queue exactly one bar step
            stepQueueRef.current += 1;
          }}
          className="px-3 py-1.5 rounded-md text-sm font-medium bg-amber-600/80 hover:bg-amber-600 text-white"
          aria-label="Step forward"
        >
          Step
        </button>
        <button
          type="button"
          onClick={() => {
            // pause, clear queue, and request reset
            setIsPlaying(false);
            stepQueueRef.current = 0;
            resetRequestRef.current = true;
          }}
          className="px-3 py-1.5 rounded-md text-sm font-medium bg-slate-600/80 hover:bg-slate-600 text-white"
          aria-label="Reset to start"
        >
          Reset
        </button>
        <div className="flex items-center gap-2 px-2">
          <label htmlFor="ffb2d-speed" className="text-xs text-slate-200/80">
            Speed
          </label>
          <input
            id="ffb2d-speed"
            type="range"
            min={1}
            max={8}
            step={1}
            value={9 - framesPerTick}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setFramesPerTick(9 - Number(e.target.value))
            }
            className="accent-indigo-400"
            aria-label="Animation speed (1 slow – 8 fast)"
          />
        </div>
        <button
          type="button"
          onClick={() =>
            setViewMode((m) => (m === 'candle' ? 'line' : 'candle'))
          }
          className="px-3 py-1.5 rounded-md text-sm font-medium bg-indigo-600/80 hover:bg-indigo-600 text-white"
          aria-label="Toggle view mode"
        >
          View: {viewMode === 'candle' ? 'Candles' : 'Line'}
        </button>
      </div>

      {/* Sketch */}
      <P5Sketch sketch={sketch} />
    </div>
  );
};

export default FalseVsFailedBreakout2D;
