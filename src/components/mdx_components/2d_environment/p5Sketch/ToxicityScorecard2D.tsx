
import React, { useCallback } from 'react';
import type p5 from 'p5';
import P5Sketch from '@/components/mdx_components/2d_environment/p5Sketch/p5SketchContainer';

type MetricKey = 'overhang' | 'discount' | 'runway';

type MetricConfig = {
  label: string;
  subLabel: string;
  min: number;
  max: number;
  initial: number;
  unit: string;
  weight: number;
  direction: 'up' | 'down';
  stops: [number, number, number, number];
  insights: [string, string, string, string, string];
};

const METRIC_CONFIGS: Record<MetricKey, MetricConfig> = {
  overhang: {
    label: 'Warrant Overhang',
    subLabel: 'Share supply waiting above',
    min: 0,
    max: 60,
    initial: 40,
    unit: '%',
    weight: 0.3,
    direction: 'up',
    stops: [5, 15, 45, 60],
    insights: [
      'Clean float. Hardly any warrants looming.',
      'Still light. Keep an eye on strike prices.',
      'Overhang building. Rally faces friction.',
      'Heavy lid overhead. Dilution almost guaranteed.',
      'Death-spiral territory. Supply flood inevitable.',
    ],
  },
  discount: {
    label: 'Average Offering Discount',
    subLabel: 'How desperate the financing gets',
    min: 0,
    max: 40,
    initial: 21.5,
    unit: '%',
    weight: 0.3,
    direction: 'up',
    stops: [10, 20, 30, 40],
    insights: [
      'Healthy raises. Institutions still leaning in.',
      'Mild stress. Bankers asking for a sweetener.',
      'Large haircuts. Company is bargaining hard.',
      'Toxic prints. Only vulture funds will play.',
      'Nuclear dilution. Survival odds collapsing.',
    ],
  },
  runway: {
    label: 'Cash Runway',
    subLabel: 'How long before cash hits zero',
    min: 0.5,
    max: 14,
    initial: 4,
    unit: 'mo',
    weight: 0.4,
    direction: 'down',
    stops: [3, 6, 9, 12],
    insights: [
      'Cliff-edge. Cash is basically gone.',
      'Critical. Raise now or risk default.',
      'Shrinking. Offer likely inside 2 quarters.',
      'Comfortable. Plenty of time to plan.',
      'Flush. Management controls timing.',
    ],
  },
};

const TOTAL_INTERPRETATION = [
  {
    max: 1.5,
    label: 'Low toxicity · Structure is healthy',
    color: [56, 189, 248],
  },
  {
    max: 3,
    label: 'Moderate toxicity · Start scouting exits',
    color: [250, 204, 21],
  },
  {
    max: 4,
    label: 'High toxicity · Dilution risk is dominant',
    color: [248, 113, 113],
  },
  {
    max: 5.1,
    label: 'Extreme toxicity · Death spiral setup',
    color: [239, 68, 68],
  },
];

const severityPalette: [number, number, number][] = [
  [56, 189, 248],
  [34, 197, 94],
  [250, 204, 21],
  [248, 113, 113],
  [239, 68, 68],
];

const getSeverityColor = (score: number) => {
  const idx = Math.min(
    severityPalette.length - 1,
    Math.max(0, Math.round(score) - 1)
  );
  return severityPalette[idx];
};

const formatValue = (key: MetricKey, value: number) => {
  const config = METRIC_CONFIGS[key];
  if (config.unit === '%') {
    return `${value.toFixed(1)}%`;
  }
  return `${value.toFixed(1)} ${config.unit}`;
};

export const ToxicityScorecard2D: React.FC = () => {
  const sketch = useCallback((p: p5, parentEl: HTMLDivElement) => {
    type MetricState = Record<MetricKey, { value: number }>;

    const state: {
      metrics: MetricState;
      activeHandle: MetricKey | null;
    } = {
      metrics: {
        overhang: { value: METRIC_CONFIGS.overhang.initial },
        discount: { value: METRIC_CONFIGS.discount.initial },
        runway: { value: METRIC_CONFIGS.runway.initial },
      },
      activeHandle: null,
    };

    const clamp = (val: number, min: number, max: number) =>
      Math.min(Math.max(val, min), max);

    const getScore = (key: MetricKey) => {
      const { direction, stops } = METRIC_CONFIGS[key];
      const value = state.metrics[key].value;
      if (direction === 'up') {
        if (value <= stops[0]) return 1;
        if (value <= stops[1]) return 2;
        if (value <= stops[2]) return 3;
        if (value <= stops[3]) return 4;
        return 5;
      }
      if (value >= stops[3]) return 1;
      if (value >= stops[2]) return 2;
      if (value >= stops[1]) return 3;
      if (value >= stops[0]) return 4;
      return 5;
    };

    const getInsight = (key: MetricKey) => {
      const score = getScore(key);
      return METRIC_CONFIGS[key].insights[score - 1];
    };

    const computeTotalScore = () => {
      let total = 0;
      let weight = 0;
      (Object.keys(METRIC_CONFIGS) as MetricKey[]).forEach((key) => {
        total += getScore(key) * METRIC_CONFIGS[key].weight;
        weight += METRIC_CONFIGS[key].weight;
      });
      return total / weight;
    };

    const getTrackGeometry = (key: MetricKey) => {
      const baseY = p.height * 0.88;
      const baseWidth = p.width * 0.26;
      if (key === 'overhang') {
        return { x: p.width * 0.22, y: baseY, width: baseWidth };
      }
      if (key === 'discount') {
        return { x: p.width * 0.5, y: baseY, width: baseWidth };
      }
      return { x: p.width * 0.78, y: baseY, width: baseWidth };
    };

    const getHandlePosition = (key: MetricKey) => {
      const track = getTrackGeometry(key);
      const config = METRIC_CONFIGS[key];
      const ratio =
        (state.metrics[key].value - config.min) / (config.max - config.min);
      const handleX = track.x - track.width / 2 + ratio * track.width;
      return { x: handleX, y: track.y };
    };

    const setValueFromPointer = (key: MetricKey, pointerX: number) => {
      const { width, x } = getTrackGeometry(key);
      const config = METRIC_CONFIGS[key];
      const left = x - width / 2;
      const ratio = clamp((pointerX - left) / width, 0, 1);
      state.metrics[key].value = config.min + ratio * (config.max - config.min);
    };

    const drawGrid = () => {
      p.push();
      p.stroke(11, 16, 32);
      p.strokeWeight(1);
      const spacing = 60;
      for (let x = 0; x < p.width; x += spacing) {
        p.line(x, 0, x, p.height);
      }
      for (let y = 0; y < p.height; y += spacing) {
        p.line(0, y, p.width, y);
      }
      p.pop();
    };

    const drawBackground = () => {
      p.background(4, 7, 19);
      p.noFill();
      drawGrid();
      p.push();
      p.noStroke();
      const gradient = p.drawingContext.createLinearGradient(0, 0, 0, p.height);
      gradient.addColorStop(0, 'rgba(99,102,241,0.09)');
      gradient.addColorStop(1, 'rgba(15,23,42,0.8)');
      p.drawingContext.fillStyle = gradient;
      p.rect(0, 0, p.width, p.height);
      p.pop();
    };

    const drawOverhangGauge = () => {
      const config = METRIC_CONFIGS.overhang;
      const value = state.metrics.overhang.value;
      const score = getScore('overhang');
      const [r, g, b] = getSeverityColor(score);
      const centerX = p.width * 0.18;
      const centerY = p.height * 0.4;
      const radius = Math.min(p.width, p.height) * 0.19;
      const startAngle = -p.PI * 0.75; // Top half arc
      const endAngle = -p.PI * 0.25;
      const ratio = (value - config.min) / (config.max - config.min);
      const pointerAngle = startAngle + (endAngle - startAngle) * ratio;

      p.push();
      p.translate(centerX, centerY);
      p.noFill();
      p.stroke(31, 41, 79);
      p.strokeWeight(22);
      p.arc(0, 0, radius * 2, radius * 2, startAngle, endAngle);

      p.stroke(r, g, b);
      p.arc(0, 0, radius * 2, radius * 2, startAngle, pointerAngle);

      p.strokeWeight(6);
      p.stroke(226, 232, 255);
      const pointerLength = radius * 0.85;
      p.line(
        0,
        0,
        Math.cos(pointerAngle) * pointerLength,
        Math.sin(pointerAngle) * pointerLength
      );

      p.noStroke();
      p.fill(14, 19, 37);
      p.circle(0, 0, 48);
      p.fill(226, 232, 255);
      p.textAlign(p.CENTER, p.CENTER);
      p.textSize(24);
      p.text(formatValue('overhang', value), 0, -6);
      p.textSize(12);
      p.fill(148, 163, 184);
      p.text('Overhang %', 0, 18);
      p.pop();

      p.push();
      p.textAlign(p.LEFT, p.TOP);
      p.fill(203, 213, 225);
      p.textSize(20);
      p.text(config.label, centerX - radius + 60, centerY + radius - 110);
      p.fill(120, 141, 175);
      p.textSize(14);
      p.text(config.subLabel, centerX - radius + 60, centerY + radius - 80);
      p.fill(r, g, b);
      p.textSize(14);
      p.text(
        getInsight('overhang'),
        centerX - radius + 60,
        centerY + radius - 60
      );
      p.pop();
    };

    const drawDiscountDial = () => {
      const config = METRIC_CONFIGS.discount;
      const value = state.metrics.discount.value;
      const score = getScore('discount');
      const [r, g, b] = getSeverityColor(score);
      const centerX = p.width * 0.5;
      const centerY = p.height * 0.3;
      const radius = Math.min(p.width, p.height) * 0.14;

      p.push();
      p.translate(centerX, centerY);
      p.noFill();
      p.stroke(31, 52, 97);
      p.strokeWeight(16);
      p.arc(0, 0, radius * 2, radius * 2, 0, p.TWO_PI);

      const ratio = (value - config.min) / (config.max - config.min);
      const pointerAngle = -p.HALF_PI + ratio * p.TWO_PI;

      p.stroke(r, g, b);
      p.arc(
        0,
        0,
        radius * 2,
        radius * 2,
        -p.HALF_PI,
        -p.HALF_PI + ratio * p.TWO_PI
      );

      p.stroke(226, 232, 255);
      p.strokeWeight(5);
      const pointerLength = radius * 0.78;
      p.line(
        0,
        0,
        Math.cos(pointerAngle) * pointerLength,
        Math.sin(pointerAngle) * pointerLength
      );
      p.noStroke();
      p.fill(226, 232, 255);
      p.circle(0, 0, 24);

      p.textAlign(p.CENTER, p.CENTER);
      p.fill(226, 232, 255);
      p.textSize(22);
      p.text(formatValue('discount', value), 0, radius + 30);
      p.fill(120, 141, 175);
      p.textSize(14);
      p.text(config.label, 0, radius + 52);
      p.fill(r, g, b);
      p.textSize(13);
      p.text(getInsight('discount'), 0, radius + 72);
      p.pop();
    };

    const drawRunwayBar = () => {
      const config = METRIC_CONFIGS.runway;
      const value = state.metrics.runway.value;
      const score = getScore('runway');
      const [r, g, b] = getSeverityColor(score);
      const barX = p.width * 0.82;
      const barTop = p.height * 0.16;
      const barHeight = p.height * 0.36;
      const barWidth = Math.min(72, p.width * 0.05);

      p.push();
      p.noFill();
      p.stroke(24, 36, 68);
      p.strokeWeight(barWidth);
      p.strokeCap(p.ROUND);
      p.line(barX, barTop, barX, barTop + barHeight);

      const ratio = (value - config.min) / (config.max - config.min);
      const fillHeight = barHeight * ratio;
      p.stroke(r, g, b);
      p.line(barX, barTop + barHeight - fillHeight, barX, barTop + barHeight);
      p.pop();

      p.push();
      p.textAlign(p.CENTER, p.BOTTOM);
      p.fill(226, 232, 255);
      p.textSize(18);
      p.text(formatValue('runway', value), barX, barTop - 12);
      p.textSize(14);
      p.fill(120, 141, 175);
      p.text(METRIC_CONFIGS.runway.label, barX, barTop - 34);
      p.fill(r, g, b);
      p.textSize(13);
      p.text(getInsight('runway'), barX, barTop + barHeight + 44);
      p.pop();
    };

    const drawScoreMeter = () => {
      const total = computeTotalScore();
      const meterLeft = p.width * 0.12;
      const meterWidth = p.width * 0.76;
      const meterY = p.height * 0.64;
      const meterHeight = 28;

      p.push();
      p.textAlign(p.LEFT, p.BOTTOM);
      p.fill(226, 232, 255);
      p.textSize(20);
      p.text('Total Toxicity Score', meterLeft, meterY - 18);
      p.textSize(14);
      p.fill(148, 163, 184);
      p.text(
        'Weighted blend of overhang, discount, and cash runway pressure',
        meterLeft,
        meterY - 2
      );

      p.noStroke();
      TOTAL_INTERPRETATION.forEach((band, idx) => {
        const previousMax = idx === 0 ? 0 : TOTAL_INTERPRETATION[idx - 1].max;
        const startRatio = previousMax / 5;
        const endRatio = Math.min(band.max / 5, 1);
        const alpha = idx === 0 ? 60 : 90;
        p.fill(band.color[0], band.color[1], band.color[2], alpha);
        p.rect(
          meterLeft + meterWidth * startRatio,
          meterY,
          meterWidth * (endRatio - startRatio),
          meterHeight,
          12
        );
      });

      p.fill(16, 24, 48, 100);
      p.rect(meterLeft, meterY, meterWidth, meterHeight, 12);

      const markerX = meterLeft + (meterWidth * clamp(total, 0, 5)) / 5;
      p.fill(255);
      p.circle(markerX, meterY + meterHeight / 2, 18);

      p.fill(4, 7, 19);
      p.textAlign(p.CENTER, p.CENTER);
      p.textSize(12);
      p.text(total.toFixed(1), markerX, meterY + meterHeight / 2);

      const descriptor =
        TOTAL_INTERPRETATION.find((band) => total <= band.max) ||
        TOTAL_INTERPRETATION[TOTAL_INTERPRETATION.length - 1];
      p.textAlign(p.LEFT, p.TOP);
      p.fill(descriptor.color[0], descriptor.color[1], descriptor.color[2]);
      p.textSize(14);
      p.text(descriptor.label, meterLeft, meterY + meterHeight + 16);
      p.pop();
    };

    const drawMetricTable = () => {
      const left = p.width * 0.12;
      const top = p.height * 0.72;
      const rowHeight = 22;
      p.push();
      p.textSize(12);
      p.fill(120, 141, 175);
      p.textAlign(p.LEFT, p.TOP);
      p.text('Component', left, top);
      p.text('Score', left + p.width * 0.32, top);
      p.text('Weight', left + p.width * 0.45, top);
      (Object.keys(METRIC_CONFIGS) as MetricKey[]).forEach((key, idx) => {
        const y = top + 8 + rowHeight * (idx + 1);
        const score = getScore(key);
        const [r, g, b] = getSeverityColor(score);
        p.fill(203, 213, 225);
        p.text(METRIC_CONFIGS[key].label, left, y);
        p.fill(r, g, b);
        p.text(`${score.toFixed(1)} / 5`, left + p.width * 0.32, y);
        p.fill(148, 163, 184);
        p.text(
          `${(METRIC_CONFIGS[key].weight * 100).toFixed(0)}%`,
          left + p.width * 0.45,
          y
        );
      });
      p.pop();
    };

    const drawDraggable = (key: MetricKey) => {
      const track = getTrackGeometry(key);
      const config = METRIC_CONFIGS[key];
      const { x, y } = track;
      p.push();
      p.stroke(33, 45, 71);
      p.strokeWeight(6);
      p.strokeCap(p.ROUND);
      p.line(x - track.width / 2, y, x + track.width / 2, y);

      const { x: handleX } = getHandlePosition(key);
      p.noStroke();
      p.fill(15, 23, 42);
      p.rect(handleX - 48, y - 22, 96, 44, 12);
      p.fill(226, 232, 255);
      p.textAlign(p.CENTER, p.CENTER);
      p.textSize(14);
      p.text(formatValue(key, state.metrics[key].value), handleX, y - 2);
      // Emphasized helper label above the handle for visibility
      p.textSize(12);
      p.fill(0, 210, 10); // accent indigo
      p.text('drag me ↔', handleX, y - 34);
      p.pop();
    };

    const drawAllDraggables = () => {
      (Object.keys(METRIC_CONFIGS) as MetricKey[]).forEach((key) => {
        drawDraggable(key);
      });
    };

    const tryActivateHandle = (pointerX: number, pointerY: number) => {
      const handleRadius = 42;
      for (const key of Object.keys(METRIC_CONFIGS) as MetricKey[]) {
        const handle = getHandlePosition(key);
        const distance = Math.hypot(pointerX - handle.x, pointerY - handle.y);
        if (distance <= handleRadius) {
          state.activeHandle = key;
          setValueFromPointer(key, pointerX);
          return true;
        }
      }
      return false;
    };

    p.setup = () => {
      p.createCanvas(parentEl.clientWidth, parentEl.clientHeight);
      p.textFont('Inter, sans-serif');
      p.pixelDensity(Math.min(2, window.devicePixelRatio || 1));
    };

    p.windowResized = () => {
      p.resizeCanvas(parentEl.clientWidth, parentEl.clientHeight);
    };

    p.mousePressed = () => {
      tryActivateHandle(p.mouseX, p.mouseY);
    };

    p.mouseDragged = () => {
      if (state.activeHandle) {
        setValueFromPointer(state.activeHandle, p.mouseX);
      }
    };

    p.mouseReleased = () => {
      state.activeHandle = null;
    };

    p.touchStarted = () => {
      const activated = tryActivateHandle(p.mouseX, p.mouseY);
      return activated ? false : undefined;
    };

    p.touchMoved = () => {
      if (state.activeHandle) {
        setValueFromPointer(state.activeHandle, p.mouseX);
      }
      return false;
    };

    p.touchEnded = () => {
      state.activeHandle = null;
      return false;
    };

    p.draw = () => {
      drawBackground();
      drawOverhangGauge();
      drawDiscountDial();
      drawRunwayBar();
      drawScoreMeter();
      drawMetricTable();
      drawAllDraggables();
    };
  }, []);

  return <P5Sketch sketch={sketch} className="rounded-2xl" />;
};

export default ToxicityScorecard2D;
