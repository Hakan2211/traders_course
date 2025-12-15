
import React, { useCallback, useEffect, useRef } from 'react';
import type p5 from 'p5';
import P5Sketch from '@/components/mdx_components/2d_environment/p5Sketch/p5SketchContainer';
import {
  AnchorPreset,
  VWAPTrade,
  computeAnchorSeries,
  computeSessionSeries,
} from '@/components/mdx_components/2d_environment/p5Sketch/vwapLabMath';

interface VWAPLaboratory2DProps {
  trades: VWAPTrade[];
  activeAnchors: AnchorPreset[];
  scenarioLabel: string;
  showSessionVWAP: boolean;
  showDeviationBands: boolean;
  totalScenarioTrades: number;
  processedScenarioTrades: number;
  isPlaying: boolean;
}

const VWAPLaboratory2D: React.FC<VWAPLaboratory2DProps> = ({
  trades,
  activeAnchors,
  scenarioLabel,
  showSessionVWAP,
  showDeviationBands,
  totalScenarioTrades,
  processedScenarioTrades,
  isPlaying,
}) => {
  const tradesRef = useRef<VWAPTrade[]>(trades);
  const anchorsRef = useRef<AnchorPreset[]>(activeAnchors);
  const labelRef = useRef<string>(scenarioLabel);
  const showSessionRef = useRef<boolean>(showSessionVWAP);
  const showDeviationRef = useRef<boolean>(showDeviationBands);
  const totalsRef = useRef<{ total: number; processed: number }>({
    total: totalScenarioTrades,
    processed: processedScenarioTrades,
  });
  const playingRef = useRef<boolean>(isPlaying);

  useEffect(() => {
    tradesRef.current = trades;
  }, [trades]);

  useEffect(() => {
    anchorsRef.current = activeAnchors;
  }, [activeAnchors]);

  useEffect(() => {
    labelRef.current = scenarioLabel;
  }, [scenarioLabel]);

  useEffect(() => {
    showSessionRef.current = showSessionVWAP;
  }, [showSessionVWAP]);

  useEffect(() => {
    showDeviationRef.current = showDeviationBands;
  }, [showDeviationBands]);

  useEffect(() => {
    totalsRef.current = {
      total: totalScenarioTrades,
      processed: processedScenarioTrades,
    };
  }, [totalScenarioTrades, processedScenarioTrades]);

  useEffect(() => {
    playingRef.current = isPlaying;
  }, [isPlaying]);

  const sketch = useCallback((p: p5, parentEl: HTMLDivElement) => {
    const layout = {
      padding: 32,
      gap: 24,
      hudHeight: 180,
    };

    function drawStdBand(
      series: ReturnType<typeof computeSessionSeries>,
      multiplier: number,
      fillColor: p5.Color,
      mapX: (time: number) => number,
      mapY: (price: number) => number
    ) {
      if (series.length < 2) return;
      p.noStroke();
      p.fill(fillColor);
      p.beginShape();
      series.forEach((point) => {
        const upper = point.vwap + point.stdDev * multiplier;
        p.vertex(mapX(point.time), mapY(upper));
      });
      for (let i = series.length - 1; i >= 0; i--) {
        const point = series[i];
        const lower = point.vwap - point.stdDev * multiplier;
        p.vertex(mapX(point.time), mapY(lower));
      }
      p.endShape(p.CLOSE);
    }

    function drawSeriesLine(
      series: ReturnType<typeof computeSessionSeries>,
      color: p5.Color,
      weight: number,
      mapX: (time: number) => number,
      mapY: (price: number) => number
    ) {
      if (series.length < 2) return;
      p.stroke(color);
      p.strokeWeight(weight);
      p.noFill();
      p.beginShape();
      series.forEach((point) => {
        p.vertex(mapX(point.time), mapY(point.vwap));
      });
      p.endShape();
    }

    p.setup = () => {
      p.createCanvas(parentEl.clientWidth, parentEl.clientHeight);
      p.textFont('Inter, ui-sans-serif, system-ui');
      p.textSize(12);
      p.frameRate(60);
    };

    p.windowResized = () => {
      p.resizeCanvas(parentEl.clientWidth, parentEl.clientHeight);
    };

    p.draw = () => {
      const tradesSnapshot = tradesRef.current;
      const scenarioName = labelRef.current;
      const anchors = anchorsRef.current;
      const showSession = showSessionRef.current;
      const showBands = showDeviationRef.current;
      const totals = totalsRef.current;
      const playing = playingRef.current;

      p.background(6, 9, 16);

      if (!tradesSnapshot.length) {
        p.fill(230);
        p.textAlign(p.CENTER, p.CENTER);
        p.text(
          'Add trades to begin calculating VWAP.',
          p.width / 2,
          p.height / 2
        );
        return;
      }

      const chartHeightRatio = 0.56;
      const chartX = layout.padding;
      const chartY = layout.padding + 50;
      const chartW = p.width - layout.padding * 2;
      const chartH =
        (p.height - layout.padding * 2 - layout.gap - 50) * chartHeightRatio;
      const hudY = chartY + chartH + layout.gap;
      const hudH = p.height - hudY - layout.padding;

      const times = tradesSnapshot.map((t) => t.time);
      const prices = tradesSnapshot.map((t) => t.price);
      const timeStart = Math.min(...times);
      const timeEnd = Math.max(...times);

      const sessionSeries = computeSessionSeries(tradesSnapshot);
      const anchorSeriesMap = computeAnchorSeries(tradesSnapshot, anchors);

      let minPrice = Math.min(...prices);
      let maxPrice = Math.max(...prices);

      if (sessionSeries.length) {
        sessionSeries.forEach((point) => {
          minPrice = Math.min(minPrice, point.vwap - point.stdDev * 2);
          maxPrice = Math.max(maxPrice, point.vwap + point.stdDev * 2);
        });
      }

      Object.values(anchorSeriesMap).forEach((entry) => {
        entry.points.forEach((point) => {
          minPrice = Math.min(minPrice, point.vwap);
          maxPrice = Math.max(maxPrice, point.vwap);
        });
      });

      if (!Number.isFinite(minPrice) || !Number.isFinite(maxPrice)) {
        minPrice = Math.min(...prices);
        maxPrice = Math.max(...prices);
      }

      const pricePadding = (maxPrice - minPrice) * 0.12 || 1;
      const priceMin = minPrice - pricePadding;
      const priceMax = maxPrice + pricePadding;
      const timeSpan = Math.max(timeEnd - timeStart, 1);

      const mapX = (time: number) =>
        chartX + ((time - timeStart) / timeSpan) * chartW;
      const mapY = (price: number) =>
        chartY +
        chartH -
        ((price - priceMin) / Math.max(priceMax - priceMin, 1)) * chartH;

      p.push();
      p.noStroke();
      p.fill(12, 18, 32, 200);
      p.rect(chartX, chartY, chartW, chartH, 14);
      p.pop();

      const gridLines = 6;
      p.stroke(28, 34, 52);
      p.strokeWeight(1);
      for (let i = 0; i <= gridLines; i++) {
        const yy = chartY + (chartH / gridLines) * i;
        p.line(chartX, yy, chartX + chartW, yy);
      }
      const timeSlices = 8;
      for (let i = 0; i <= timeSlices; i++) {
        const xx = chartX + (chartW / timeSlices) * i;
        p.line(xx, chartY, xx, chartY + chartH);
      }

      // Price path
      p.noFill();
      p.stroke(130, 190, 255);
      p.strokeWeight(2.2);
      p.beginShape();
      tradesSnapshot.forEach((trade) => {
        p.vertex(mapX(trade.time), mapY(trade.price));
      });
      p.endShape();

      // Manual trade inject markers
      tradesSnapshot.forEach((trade, idx) => {
        const x = mapX(trade.time);
        const y = mapY(trade.price);
        const isLatest = idx === tradesSnapshot.length - 1;
        if (trade.source === 'manual') {
          p.noStroke();
          p.fill(isLatest ? p.color(255, 196, 140) : p.color(255, 163, 94));
          p.circle(x, y, isLatest ? 10 : 7);
        } else if (isLatest) {
          p.noStroke();
          p.fill(186, 230, 253);
          p.circle(x, y, 8);
        }
      });

      if (showSession && sessionSeries.length) {
        if (showBands) {
          const band2 = p.color(56, 189, 248, 26);
          const band1 = p.color(56, 189, 248, 48);
          drawStdBand(sessionSeries, 2, band2, mapX, mapY);
          drawStdBand(sessionSeries, 1, band1, mapX, mapY);
        }
        drawSeriesLine(sessionSeries, p.color(56, 189, 248), 2, mapX, mapY);
      }

      anchors.forEach((anchor) => {
        const series = anchorSeriesMap[anchor.id];
        if (!series || !series.points.length) return;
        p.strokeWeight(1.6);
        const anchorColor = p.color(anchor.color);
        p.stroke(anchorColor);
        p.noFill();
        p.beginShape();
        series.points.forEach((point) => {
          p.vertex(mapX(point.time), mapY(point.vwap));
        });
        p.endShape();

        const startX = mapX(anchor.startTime);
        p.stroke(anchorColor);
        p.strokeWeight(1);
        p.line(startX, chartY, startX, chartY + chartH);
        p.noStroke();
        p.fill(anchorColor);
        p.textAlign(p.LEFT, p.TOP);
        p.text(anchor.label, startX + 6, chartY - 14);
      });

      // Titles and labels
      p.fill(230);
      p.textAlign(p.LEFT, p.TOP);
      p.textSize(17);
      p.text(`VWAP Laboratory — ${scenarioName}`, chartX, chartY - 60);
      p.textSize(12);
      const progressPct =
        totals.total > 0 ? (totals.processed / totals.total) * 100 : 100;
      const progressText = `Trades processed: ${Math.min(
        totals.processed,
        totals.total
      )}/${totals.total} (${progressPct.toFixed(1)}%)`;
      p.text(progressText, chartX, chartY + chartH + 8);

      if (playing) {
        p.fill(94, 234, 212);
        p.textAlign(p.RIGHT, p.TOP);
        p.text('Replaying from market open…', chartX + chartW, chartY - 42);
      }

      // Legend
      const legendY = chartY - 18;
      let legendX = chartX + chartW * 0.42;
      if (showSession) {
        p.noStroke();
        p.fill(56, 189, 248);
        p.circle(legendX, legendY, 8);
        p.fill(220);
        p.textAlign(p.LEFT, p.CENTER);
        p.text('Session VWAP', legendX + 10, legendY);
        legendX += 120;
      }
      anchors.forEach((anchor) => {
        const entry = anchorSeriesMap[anchor.id];
        if (!entry?.points.length) return;
        p.noStroke();
        p.fill(p.color(anchor.color));
        p.circle(legendX, legendY, 8);
        p.fill(220);
        p.text(anchor.label, legendX + 10, legendY);
        legendX += 120;
      });

      // HUD / Formula breakdown
      p.noStroke();
      p.fill(12, 18, 32, 220);
      p.rect(chartX, hudY, chartW, hudH, 16);

      const numerator = tradesSnapshot.reduce(
        (acc, trade) => acc + trade.price * trade.volume,
        0
      );
      const denominator = tradesSnapshot.reduce(
        (acc, trade) => acc + trade.volume,
        0
      );
      const vwap =
        denominator > 0 ? numerator / Math.max(denominator, 1e-6) : 0;
      const latestPrice = tradesSnapshot[tradesSnapshot.length - 1]?.price ?? 0;
      const latestVolume =
        tradesSnapshot[tradesSnapshot.length - 1]?.volume ?? 0;

      p.fill(240);
      p.textAlign(p.LEFT, p.TOP);
      p.textSize(14);
      p.text('VWAP = Σ(Price × Volume) ÷ Σ Volume', chartX + 16, hudY + 14);
      p.textSize(12);
      p.fill(160, 170, 200);
      p.text(
        'Watch how each trade pushes both the numerator and denominator.',
        chartX + 16,
        hudY + 34
      );

      const barAreaX = chartX + 16;
      const barAreaY = hudY + 60;
      const barWidth = chartW - 32;
      const barHeight = 22;
      const maxValue = Math.max(numerator, denominator, 1);

      const numeratorRatio = Math.pow(numerator / maxValue, 0.65);
      const denominatorRatio = Math.pow(denominator / maxValue, 0.65);

      p.textAlign(p.LEFT, p.CENTER);
      p.textSize(12);

      // Numerator bar
      p.noStroke();
      p.fill(60, 64, 92);
      p.rect(barAreaX, barAreaY, barWidth, barHeight, 10);
      p.fill(252, 211, 77, 220);
      p.rect(barAreaX, barAreaY, barWidth * numeratorRatio, barHeight, 10);
      p.fill(255, 238, 194);
      p.text(
        `Σ (Price × Volume) = ${numerator.toLocaleString(undefined, {
          maximumFractionDigits: 0,
        })}`,
        barAreaX + 8,
        barAreaY + barHeight / 2
      );

      // Denominator bar
      const denomY = barAreaY + barHeight + 18;
      p.fill(47, 60, 94);
      p.rect(barAreaX, denomY, barWidth, barHeight, 10);
      p.fill(96, 165, 250, 220);
      p.rect(barAreaX, denomY, barWidth * denominatorRatio, barHeight, 10);
      p.fill(209, 229, 255);
      p.text(
        `Σ Volume = ${denominator.toLocaleString()}`,
        barAreaX + 8,
        denomY + barHeight / 2
      );

      // Result panel
      const resultY = denomY + barHeight + 24;
      p.fill(14, 22, 36);
      p.rect(barAreaX, resultY, barWidth, 40, 10);
      p.fill(255);
      p.textAlign(p.LEFT, p.CENTER);
      p.text(
        `Session VWAP: ${vwap.toFixed(2)} | Last Price: ${latestPrice.toFixed(
          2
        )} | Last Volume: ${latestVolume.toLocaleString()}`,
        barAreaX + 12,
        resultY + 20
      );
    };
  }, []);

  return <P5Sketch sketch={sketch} />;
};

export default VWAPLaboratory2D;
