
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import type p5 from 'p5';
import P5Sketch from '@/components/mdx_components/2d_environment/p5Sketch/p5SketchContainer';

export type VPAMode = 'micro' | 'macro' | 'global';
export type VPAPattern =
  | 'accumulation'
  | 'distribution'
  | 'testing'
  | 'sellingClimax'
  | 'buyingClimax';

export interface Candle {
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface VPALens2DProps {
  mode: VPAMode;
  pattern: VPAPattern;
  step: number;
  showInsights: boolean;
  onHoverReadingChange?: (text: string | null) => void;
  totalBars?: number;
  onStepChange?: (nextStep: number) => void;
  dualView?: boolean;
}

const DEFAULT_BARS = 40;

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function makeCandle(
  prevClose: number,
  delta: number,
  volatility: number,
  volume: number
): Candle {
  const open = prevClose;
  const close = clamp(prevClose + delta, 10, 90);
  const body = Math.abs(close - open);
  const wickScale = 0.2 + volatility * 0.8;
  const upperWick = body * (0.3 + wickScale * 0.7);
  const lowerWick = body * (0.3 + wickScale * 0.7);
  const high = Math.max(open, close) + upperWick;
  const low = Math.min(open, close) - lowerWick;
  return {
    open,
    high: clamp(high, 5, 95),
    low: clamp(low, 5, 95),
    close,
    volume: Math.max(volume, 0.001),
  };
}

function generateSequence(pattern: VPAPattern, bars: number): Candle[] {
  const seq: Candle[] = [];
  let price = 50;

  const push = (
    delta: number,
    vol: number,
    volNoise = 0.2,
    volFloor = 0.05
  ) => {
    const v = Math.max(
      vol * (0.8 + Math.random() * 0.4) + Math.random() * volNoise,
      volFloor
    );
    const c = makeCandle(price, delta, Math.random(), v);
    seq.push(c);
    price = c.close;
  };

  switch (pattern) {
    case 'accumulation': {
      // Range-bound with spikes on down bars, then subtle markup
      for (let i = 0; i < Math.min(bars, 24); i++) {
        const drift = (Math.random() - 0.5) * 0.6;
        const isDown = drift < 0;
        const vol = isDown ? 0.8 : 0.35; // spikes on down bars
        push(drift, vol, 0.15, 0.05);
      }
      for (let i = seq.length; i < bars; i++) {
        const drift = 0.2 + Math.random() * 0.4; // gentle markup
        const vol = 0.5 + Math.random() * 0.3;
        push(drift, vol, 0.15, 0.1);
      }
      break;
    }
    case 'distribution': {
      // Flat top, high volume on up bars, then markdown
      for (let i = 0; i < Math.min(bars, 18); i++) {
        const drift = Math.random() * 0.4; // push into flat top
        const vol = 0.7; // participation on up moves
        push(drift, vol, 0.2, 0.1);
      }
      for (let i = seq.length; i < Math.min(bars, 28); i++) {
        const drift = (Math.random() - 0.5) * 0.2; // stall at top
        const vol = 0.5 + (drift > 0 ? 0.2 : -0.1);
        push(drift, vol, 0.15, 0.08);
      }
      for (let i = seq.length; i < bars; i++) {
        const drift = -(0.4 + Math.random() * 0.6); // markdown
        const vol = 0.6 + Math.random() * 0.3;
        push(drift, vol, 0.2, 0.12);
      }
      break;
    }
    case 'sellingClimax': {
      for (let i = 0; i < Math.min(bars, 20); i++) {
        const drift = -(0.1 + Math.random() * 0.3);
        const vol = 0.35 + Math.random() * 0.2;
        push(drift, vol);
      }
      // Climax bar
      push(-(2.2 + Math.random() * 0.8), 1.0, 0.1, 0.8);
      // Test
      push(0.1 + Math.random() * 0.2, 0.15, 0.05, 0.05);
      while (seq.length < bars) {
        const drift = (Math.random() - 0.4) * 0.3;
        const vol = 0.25 + Math.random() * 0.2;
        push(drift, vol);
      }
      break;
    }
    case 'buyingClimax': {
      for (let i = 0; i < Math.min(bars, 20); i++) {
        const drift = 0.1 + Math.random() * 0.3;
        const vol = 0.35 + Math.random() * 0.2;
        push(drift, vol);
      }
      // Climax bar
      push(2.2 + Math.random() * 0.8, 1.0, 0.1, 0.8);
      // Test
      push(-(0.1 + Math.random() * 0.2), 0.15, 0.05, 0.05);
      while (seq.length < bars) {
        const drift = (0.4 - Math.random()) * 0.3;
        const vol = 0.25 + Math.random() * 0.2;
        push(drift, vol);
      }
      break;
    }
    case 'testing': {
      for (let i = 0; i < Math.min(bars, 15); i++) {
        const drift = (Math.random() - 0.5) * 0.5;
        const vol = 0.4 + Math.random() * 0.2;
        push(drift, vol);
      }
      // Simulate preceding climax
      push(1.8 * (Math.random() > 0.5 ? 1 : -1), 0.95, 0.1, 0.8);
      // Testing bar: small candle, low volume
      push((Math.random() - 0.5) * 0.2, 0.12, 0.05, 0.05);
      while (seq.length < bars) {
        const drift = (Math.random() - 0.5) * 0.3;
        const vol = 0.25 + Math.random() * 0.2;
        push(drift, vol);
      }
      break;
    }
  }

  return seq;
}

function classifyEffortVsResult(
  current: Candle,
  previous: Candle | null,
  maxVolume: number
) {
  const body = Math.abs(current.close - current.open);
  const prevBody = previous ? Math.abs(previous.close - previous.open) : body;
  const volRatio = current.volume / Math.max(maxVolume, 0.0001);
  const bodyChange = previous ? body - prevBody : 0;
  const volChange = previous ? current.volume - previous.volume : 0;
  const direction = current.close >= current.open ? 1 : -1;

  let label: string | null = null;
  if (volRatio > 0.7 && body < prevBody * 0.6) {
    label = 'Effort > Result → Absorption';
  } else if (volRatio < 0.35 && body > prevBody * 1.3) {
    label = 'Result > Effort → Weak Move';
  } else if (volChange < -0.02 && bodyChange > 0.4) {
    label = 'Effort ↓, Result ↑ → Hidden Strength';
  } else if (volChange > 0.02 && bodyChange < -0.4) {
    label = 'Effort ↑, Result ↓ → Hidden Weakness';
  }

  const agreement =
    (bodyChange >= 0 && volChange >= 0) || (bodyChange <= 0 && volChange <= 0);

  return { label, agreement, direction, body, volRatio };
}

export const VPALens2D: React.FC<VPALens2DProps> = ({
  mode,
  pattern,
  step,
  showInsights,
  onHoverReadingChange,
  totalBars = DEFAULT_BARS,
  onStepChange,
  dualView = false,
}) => {
  const patternRef = useRef<VPAPattern>(pattern);
  const modeRef = useRef<VPAMode>(mode);
  const stepRef = useRef<number>(step);
  const showInsightsRef = useRef<boolean>(showInsights);
  const hoverTextRef = useRef<string | null>(null);
  const onStepChangeRef = useRef<typeof onStepChange>(onStepChange);

  // Cinematic/transition refs
  const currentZoomRef = useRef<number>(1);
  const targetZoomRef = useRef<number>(1);
  const lastModeRef = useRef<VPAMode>(mode);
  const lastStepSeenRef = useRef<number>(step);
  const stepAnimRef = useRef<number>(1); // 0->1 slide-in for last candle
  const narrationTextRef = useRef<string | null>(null);
  const narrationLifeRef = useRef<number>(0); // frames

  useEffect(() => {
    patternRef.current = pattern;
  }, [pattern]);
  useEffect(() => {
    modeRef.current = mode;
    // Update zoom target when mode changes
    lastModeRef.current = modeRef.current;
    targetZoomRef.current =
      mode === 'micro' ? 1.0 : mode === 'macro' ? 0.94 : 0.88;
  }, [mode]);
  useEffect(() => {
    stepRef.current = step;
    if (step > lastStepSeenRef.current) {
      stepAnimRef.current = 0; // trigger slide-in animation
      lastStepSeenRef.current = step;
    }
  }, [step]);
  useEffect(() => {
    showInsightsRef.current = showInsights;
  }, [showInsights]);
  useEffect(() => {
    if (onHoverReadingChange) onHoverReadingChange(hoverTextRef.current);
  }, [onHoverReadingChange]);
  useEffect(() => {
    onStepChangeRef.current = onStepChange;
  }, [onStepChange]);

  const sequenceCacheKey = useMemo(
    () => `${pattern}-${totalBars}`,
    [pattern, totalBars]
  );

  const sketch = useCallback(
    (p: p5, parentEl: HTMLDivElement) => {
      let candles: Candle[] = [];
      let cachedKey = '';
      let hoverIndex: number | null = null;
      let lastFrameStepObserved = stepRef.current;

      const getLeftWidth = () => Math.floor(parentEl.clientWidth);
      const getTopHeight = () => Math.floor(parentEl.clientHeight);

      const chartPadding = 40;
      const basePriceAreaRatio = dualView ? 0.55 : 0.7; // dualView gives larger volume view
      const timelineHeight = 20;

      function ensureSequence() {
        const key = `${patternRef.current}-${DEFAULT_BARS}`;
        if (key !== cachedKey) {
          candles = generateSequence(patternRef.current, DEFAULT_BARS);
          cachedKey = key;
        }
      }

      function getVisibleWindow(total: number, mode: VPAMode, stepIdx: number) {
        const currentCount = clamp(stepIdx, 1, total);
        if (mode === 'micro') {
          const start = Math.max(currentCount - 1, 0);
          return { start, end: start + 1 };
        }
        if (mode === 'macro') {
          const span = 8;
          const end = currentCount;
          const start = Math.max(end - span, 0);
          return { start, end };
        }
        return { start: 0, end: currentCount };
      }

      function drawPatternOverlay(
        x1: number,
        y1: number,
        w: number,
        h: number
      ) {
        p.noStroke();
        switch (patternRef.current) {
          case 'accumulation':
            p.fill(50, 200, 120, 35);
            p.rect(x1, y1 + h * (1 - basePriceAreaRatio) * 0.3, w, h * 0.5);
            p.fill(160, 255, 200, 160);
            p.text('Smart Money Accumulating', x1 + 10, y1 + 20);
            break;
          case 'distribution':
            p.fill(255, 80, 100, 35);
            p.rect(x1, y1 + h * 0.1, w, h * 0.5);
            p.fill(255, 180, 190, 160);
            p.text('Smart Money Distributing', x1 + 10, y1 + 20);
            break;
          case 'testing':
            p.fill(255, 220, 100, 190);
            p.text('Testing Supply/Demand', x1 + 10, y1 + 20);
            break;
          case 'sellingClimax':
            p.fill(255, 120, 120, 190);
            p.text('Panic / Capitulation', x1 + 10, y1 + 20);
            break;
          case 'buyingClimax':
            p.fill(140, 220, 255, 190);
            p.text('Euphoria / Exhaustion', x1 + 10, y1 + 20);
            break;
        }
      }

      p.setup = () => {
        p.createCanvas(getLeftWidth(), getTopHeight());
        p.textFont('sans-serif');
        // Initialize zoom target on first render
        targetZoomRef.current =
          modeRef.current === 'micro'
            ? 1.0
            : modeRef.current === 'macro'
            ? 0.94
            : 0.88;
        currentZoomRef.current = targetZoomRef.current;
      };

      p.mouseMoved = () => {
        const leftX = 0;
        const topY = 0;
        const chartW = p.width;
        const chartH = p.height;
        const padding = chartPadding;
        const areaW = chartW - padding * 2;
        const areaH = chartH - padding * 2 - timelineHeight;

        if (
          p.mouseX < leftX + padding ||
          p.mouseX > leftX + chartW - padding ||
          p.mouseY < topY + padding ||
          p.mouseY > topY + chartH - padding
        ) {
          hoverIndex = null;
          hoverTextRef.current = null;
          if (onHoverReadingChange) onHoverReadingChange(null);
          return;
        }

        ensureSequence();
        const visible = getVisibleWindow(
          candles.length,
          modeRef.current,
          stepRef.current
        );
        const n = Math.max(1, visible.end - visible.start);
        const candleW = areaW / Math.max(n, 1);
        const idx =
          Math.floor((p.mouseX - (leftX + padding)) / candleW) + visible.start;
        hoverIndex = clamp(idx, visible.start, visible.end - 1);

        const c = candles[hoverIndex];
        const prev = hoverIndex > 0 ? candles[hoverIndex - 1] : null;
        const maxVolume = candles
          .slice(visible.start, visible.end)
          .reduce((m, v) => Math.max(m, v.volume), 0.0001);
        const info = classifyEffortVsResult(c, prev, maxVolume);
        const dirText = c.close >= c.open ? 'Up' : 'Down';
        const base = `Candle ${hoverIndex + 1} (${dirText}) • Effort=${(
          c.volume / maxVolume
        ).toFixed(2)}, Result=${Math.abs(c.close - c.open).toFixed(2)}`;
        hoverTextRef.current = info.label ? `${base} • ${info.label}` : base;
        if (onHoverReadingChange) onHoverReadingChange(hoverTextRef.current);
      };

      const handleTimelineSeek = (
        mouseX: number,
        chartX: number,
        chartW: number
      ) => {
        if (!onStepChangeRef.current) return;
        const rel = clamp((mouseX - chartX) / chartW, 0, 1);
        const target = Math.max(1, Math.round(rel * candles.length));
        onStepChangeRef.current(target);
      };

      p.mousePressed = () => {
        const padding = chartPadding;
        const chartX = padding;
        const chartY = padding;
        const chartW = p.width - padding * 2;
        const chartH = p.height - padding * 2 - timelineHeight;
        const timelineY = chartY + chartH + 6;
        if (p.mouseY >= timelineY && p.mouseY <= timelineY + timelineHeight) {
          ensureSequence();
          handleTimelineSeek(p.mouseX, chartX, chartW);
        }
      };

      p.mouseDragged = () => {
        const padding = chartPadding;
        const chartX = padding;
        const chartY = padding;
        const chartW = p.width - padding * 2;
        const chartH = p.height - padding * 2 - timelineHeight;
        const timelineY = chartY + chartH + 6;
        if (p.mouseY >= timelineY && p.mouseY <= timelineY + timelineHeight) {
          ensureSequence();
          handleTimelineSeek(p.mouseX, chartX, chartW);
        }
      };

      p.windowResized = () => {
        p.resizeCanvas(getLeftWidth(), getTopHeight());
      };

      p.draw = () => {
        ensureSequence();

        // Animated background gradient (mode-based)
        const t = p.millis() / 1000;
        const pulse = 0.5 + 0.5 * Math.sin((t / 0.8) * p.TWO_PI);
        let cTop: p5.Color;
        let cBottom: p5.Color;
        if (modeRef.current === 'micro') {
          cTop = p.color('#0b1020');
          cBottom = p.color('#0f1840');
        } else if (modeRef.current === 'macro') {
          cTop = p.color('#0c1f26');
          cBottom = p.color('#19394d');
        } else {
          cTop = p.color('#1e222a');
          cBottom = p.color('#2a2e37');
        }
        const mix = 0.1 + 0.15 * pulse;
        const gTop = p.lerpColor(cTop, cBottom, mix);
        const gBottom = p.lerpColor(cTop, cBottom, 0.9 - mix * 0.4);
        for (let y = 0; y < p.height; y++) {
          const f = y / p.height;
          const cLine = p.lerpColor(gTop, gBottom, f);
          p.stroke(cLine);
          p.line(0, y, p.width, y);
        }

        const padding = chartPadding;
        const chartX = padding;
        const chartY = padding;
        const chartW = p.width - padding * 2;
        const chartH = p.height - padding * 2 - timelineHeight;

        // Frame
        p.noFill();
        p.stroke(60, 60, 75);
        p.rect(chartX, chartY, chartW, chartH);

        // Title
        p.noStroke();
        p.fill(220);
        p.textSize(14);
        p.textAlign(p.CENTER, p.TOP);
        p.text(
          'The Three-Level VPA Lens — Price & Volume',
          chartX + chartW / 2,
          chartY - 24
        );

        // Smooth zoom transition
        currentZoomRef.current = lerp(
          currentZoomRef.current,
          targetZoomRef.current,
          0.08
        );
        const zoomCenterX = chartX + chartW / 2;
        const zoomCenterY = chartY + chartH / 2;

        // Begin zoomed drawing context
        p.push();
        p.translate(zoomCenterX, zoomCenterY);
        p.scale(currentZoomRef.current);
        p.translate(-zoomCenterX, -zoomCenterY);

        // Visible range / zoom
        const visible = getVisibleWindow(
          candles.length,
          modeRef.current,
          stepRef.current
        );
        const slice = candles.slice(visible.start, visible.end);
        if (slice.length === 0) return;

        // Price/Volume ranges
        let minPrice = Infinity;
        let maxPrice = -Infinity;
        let maxVolume = 0;
        slice.forEach((c) => {
          minPrice = Math.min(minPrice, c.low);
          maxPrice = Math.max(maxPrice, c.high);
          maxVolume = Math.max(maxVolume, c.volume);
        });
        const pricePadding = (maxPrice - minPrice || 1) * 0.08;
        const priceAreaH = chartH * basePriceAreaRatio;
        const priceStartY = chartY;
        const volumeAreaH = chartH * (1 - basePriceAreaRatio);
        const volumeStartY = chartY + priceAreaH;

        // Grid
        p.stroke(45, 48, 60);
        p.strokeWeight(1);
        for (let i = 0; i <= 4; i++) {
          const y = priceStartY + (priceAreaH / 4) * i;
          p.line(chartX, y, chartX + chartW, y);
        }

        // Pattern overlay (subtle hint)
        if (showInsightsRef.current) {
          drawPatternOverlay(chartX, chartY, chartW, chartH);
        }

        // Candle width
        const candleW = chartW / slice.length;

        // Draw volume bars first
        p.noStroke();
        slice.forEach((c, i) => {
          const x = chartX + i * candleW + candleW * 0.1;
          const volH =
            (c.volume / Math.max(maxVolume, 0.0001)) * (volumeAreaH * 0.9);
          const isUp = c.close >= c.open;
          // shadow/reflection
          p.fill(0, 0, 0, 50);
          p.rect(
            x + 1,
            volumeStartY + volumeAreaH - volH + 2,
            candleW * 0.8,
            volH
          );
          p.fill(isUp ? 100 : 255, isUp ? 255 : 100, 120, 170);
          p.rect(x, volumeStartY + volumeAreaH - volH, candleW * 0.8, volH);
        });

        // Draw price candles and annotations
        let lastLabelY = chartY + 8;
        slice.forEach((c, i) => {
          const globalIndex = visible.start + i;
          // Slide-in animation for the newest candle
          if (stepRef.current !== lastFrameStepObserved) {
            stepAnimRef.current = 0;
            lastFrameStepObserved = stepRef.current;
          } else {
            stepAnimRef.current = Math.min(1, stepAnimRef.current + 0.08);
          }
          const slideOffset =
            globalIndex === stepRef.current - 1
              ? (1 - stepAnimRef.current) * (candleW * 0.9)
              : 0;
          const xCenter = chartX + i * candleW + candleW / 2 + slideOffset;
          const isUp = c.close >= c.open;

          const norm = (price: number) =>
            priceStartY +
            ((maxPrice + pricePadding - price) /
              (maxPrice - minPrice + pricePadding * 2)) *
              priceAreaH;

          const highY = norm(c.high);
          const lowY = norm(c.low);
          const openY = norm(c.open);
          const closeY = norm(c.close);

          // faint glow/shadow under candle
          p.noStroke();
          p.fill(0, 0, 0, 60);
          const shadowW = candleW * 0.55;
          p.rect(
            xCenter - shadowW / 2 + 1,
            Math.min(openY, closeY) + 1,
            shadowW,
            Math.max(2, Math.abs(closeY - openY)) + 2,
            2
          );

          p.stroke(isUp ? 100 : 255, isUp ? 255 : 100, 120);
          p.strokeWeight(1.5);
          p.line(xCenter, highY, xCenter, lowY);

          const bodyTop = Math.min(openY, closeY);
          const bodyBottom = Math.max(openY, closeY);
          const bodyH = Math.max(2, bodyBottom - bodyTop);
          const volRatio = c.volume / Math.max(maxVolume, 0.0001);
          const bodyW = candleW * (0.45 + volRatio * 0.25);

          p.fill(isUp ? 100 : 255, isUp ? 255 : 100, 120);
          p.noStroke();
          p.rect(xCenter - bodyW / 2, bodyTop, bodyW, bodyH);

          // Effort-Result "energy bridge": pulsing arc between body center and volume top
          if (i > 0 && showInsightsRef.current) {
            const prev = slice[i - 1];
            const prevBody = Math.abs(prev.close - prev.open);
            const bodyChange = bodyH - Math.max(2, prevBody);
            const volChange = c.volume - prev.volume;
            const agree =
              (bodyChange >= 0 && volChange >= 0) ||
              (bodyChange <= 0 && volChange <= 0);
            const volTopY =
              volumeStartY +
              volumeAreaH -
              (c.volume / Math.max(maxVolume, 0.0001)) * (volumeAreaH * 0.9);

            // strength drives thickness and glow
            const strength = clamp(
              (Math.abs(bodyChange) + Math.abs(volChange)) /
                (Math.max(prevBody, 1) + Math.max(prev.volume, 1) * 0.1),
              0,
              1
            );
            const baseColor = agree
              ? p.color(120, 255, 160, 220)
              : p.color(255, 120, 120, 220);
            const centerY = bodyTop + bodyH / 2;
            const cp1x = xCenter + candleW * 0.6;
            const cp1y = (centerY + volTopY) / 2 - 12;
            const thickness = 1 + 3 * strength + pulse * 1.2;

            p.noFill();
            for (let g = 3; g >= 1; g--) {
              const alpha = 70 * (g / 3) + 40 * pulse;
              const cGlow = p.color(
                p.red(baseColor),
                p.green(baseColor),
                p.blue(baseColor),
                alpha
              );
              p.stroke(cGlow);
              p.strokeWeight(thickness * (g / 3));
              p.bezier(
                xCenter,
                centerY,
                cp1x,
                cp1y,
                xCenter - candleW * 0.6,
                cp1y,
                xCenter,
                volTopY
              );
            }

            // Micro icons above candle
            const cx = xCenter;
            const cy = highY - 8;
            let microColor: p5.Color = p.color(180, 200, 255);
            let microText = '';
            if (agree && bodyChange > 0 && volChange > 0) {
              microColor = p.color(120, 255, 160);
              microText = '+Effort +Result';
            } else if (volChange > 0 && bodyChange <= 0) {
              microColor = p.color(255, 180, 120);
              microText = 'Effort↑ Result↓';
            } else if (volChange < 0 && bodyChange > 0) {
              microColor = p.color(120, 180, 255);
              microText = 'Effort↓ Result↑';
            }
            // Special-case absorption (high effort, tiny body)
            if (volRatio > 0.7 && bodyH < 6) {
              microColor = p.color(255, 120, 120);
              microText = 'Absorption';
            }
            if (globalIndex === stepRef.current - 1) {
              p.noStroke();
              p.fill(microColor);
              p.ellipse(cx, cy, 6, 6);
              p.fill(240);
              p.textSize(10);
              p.textAlign(p.LEFT, p.CENTER);
              p.text(microText, cx + 6, cy);
            }
          }

          // Labels for effort vs result
          if (showInsightsRef.current) {
            const prev = i > 0 ? slice[i - 1] : null;
            const info = classifyEffortVsResult(c, prev, maxVolume);
            if (info.label && globalIndex === stepRef.current - 1) {
              p.fill(255, 255, 180);
              p.textSize(12);
              p.textAlign(p.LEFT, p.TOP);
              const y = lastLabelY;
              p.text(info.label, chartX + 10, y);
              lastLabelY = y + 16;
              // Start narration
              narrationTextRef.current = info.label;
              narrationLifeRef.current = 90; // ~1.5s at 60fps
            }
          }
        });

        // Hover tooltip
        if (
          hoverIndex !== null &&
          hoverIndex >= visible.start &&
          hoverIndex < visible.end
        ) {
          const i = hoverIndex - visible.start;
          const xCenter = chartX + i * candleW + candleW / 2;
          p.stroke(160, 160, 220, 140);
          p.strokeWeight(1);
          p.line(xCenter, priceStartY, xCenter, priceStartY + priceAreaH);
          if (hoverTextRef.current) {
            p.noStroke();
            p.fill(22, 22, 32, 230);
            const text = hoverTextRef.current;
            p.textSize(12);
            const tw = p.textWidth(text) + 16;
            const th = 22;
            const tx = clamp(p.mouseX + 12, chartX, chartX + chartW - tw);
            const ty = clamp(p.mouseY + 12, chartY, chartY + chartH - th);
            p.rect(tx, ty, tw, th, 6);
            p.fill(230);
            p.textAlign(p.LEFT, p.CENTER);
            p.text(text, tx + 8, ty + th / 2);
          }
        }

        // Narration overlay (top-center) fade in/out
        if (narrationLifeRef.current > 0 && narrationTextRef.current) {
          const life = narrationLifeRef.current;
          const alpha = life > 70 ? (90 - life) * 8 : life * 6;
          p.noStroke();
          p.fill(22, 22, 32, Math.min(200, 80 + alpha * 0.5));
          const text = narrationTextRef.current;
          p.textSize(13);
          const tw = p.textWidth(text) + 20;
          const th = 26;
          const tx = chartX + chartW / 2 - tw / 2;
          const ty = chartY - 34;
          p.rect(tx, ty, tw, th, 6);
          p.fill(245, 245, 220, Math.min(255, 120 + alpha));
          p.textAlign(p.CENTER, p.CENTER);
          p.text(text, tx + tw / 2, ty + th / 2);
          narrationLifeRef.current -= 1;
        }

        // Axis labels
        p.fill(180);
        p.textSize(10);
        p.textAlign(p.RIGHT, p.CENTER);
        for (let i = 0; i <= 4; i++) {
          const y = priceStartY + (priceAreaH / 4) * i;
          const val = lerp(
            maxPrice + pricePadding,
            minPrice - pricePadding,
            i / 4
          );
          p.text(val.toFixed(1), chartX - 6, y);
        }

        // End zoomed context
        p.pop();

        // Timeline navigator (sparkline)
        const timelineY = chartY + chartH + 6;
        const tlH = timelineHeight - 6;
        p.noStroke();
        p.fill(30, 35, 50, 180);
        p.rect(chartX, timelineY, chartW, tlH, 6);
        // sparkline
        p.stroke(140, 180, 255, 220);
        p.noFill();
        p.beginShape();
        for (let i = 0; i < candles.length; i++) {
          const c = candles[i];
          const x = chartX + (i / Math.max(candles.length - 1, 1)) * chartW;
          const y =
            timelineY + tlH - (c.volume / Math.max(maxVolume, 0.0001)) * tlH;
          p.vertex(x, y);
        }
        p.endShape();
        // current step marker
        const stepX =
          chartX +
          ((stepRef.current - 1) / Math.max(candles.length - 1, 1)) * chartW;
        p.stroke(255, 255, 255, 220);
        p.strokeWeight(2);
        p.line(stepX, timelineY, stepX, timelineY + tlH);
      };
    },
    [sequenceCacheKey]
  );

  return (
    <div className="w-full h-full">
      <P5Sketch sketch={sketch} />
    </div>
  );
};

export default VPALens2D;
