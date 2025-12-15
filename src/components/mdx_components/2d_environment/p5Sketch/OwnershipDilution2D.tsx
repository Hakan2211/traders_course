
import React, { useCallback } from 'react';
import type p5 from 'p5';
import P5Sketch from '@/components/mdx_components/2d_environment/p5Sketch/p5SketchContainer';

const formatMetric = (value: number, unit: '%' | '$' | 'M') => {
  if (unit === '%') {
    return `${value.toFixed(1)}%`;
  }

  if (unit === '$') {
    return `$${value.toFixed(2)}`;
  }

  return `${value.toFixed(1)}M`;
};

type MetricUnit = '%' | '$' | 'M';
type Trend = 'up' | 'down';
interface Metric {
  label: string;
  unit: MetricUnit;
  start: number;
  end: number;
  value: number;
  trend: Trend;
  color: [number, number, number];
}

export const OwnershipDilution2D: React.FC = () => {
  const sketch = useCallback((p: p5, parentEl: HTMLDivElement) => {
    let progress = 0; // manual 0..1
    let isDragging = false;

    const START_SLICES = 8;
    const EXTRA_SLICES = 4;
    const START_SHARES = 10; // millions
    const SHARE_INCREASE = 5;
    const COMPANY_VALUE = 100; // $100M company valuation baseline

    const getTimelineGeometry = () => {
      const paddingX = p.width * 0.12;
      const width = p.width * 0.76;
      const y = p.height * 0.9;
      return { paddingX, width, y };
    };

    const setProgressFromPointerX = (x: number) => {
      const { paddingX, width } = getTimelineGeometry();
      const t = (x - paddingX) / width;
      progress = p.constrain(t, 0, 1);
    };

    const drawGrid = () => {
      p.push();
      p.stroke(18, 26, 54);
      p.strokeWeight(1);
      const spacing = 70;
      for (let x = 0; x < p.width; x += spacing) {
        p.line(x, 0, x, p.height);
      }
      for (let y = 0; y < p.height; y += spacing) {
        p.line(0, y, p.width, y);
      }
      p.pop();
    };

    const drawTimeline = (currentProgress: number) => {
      const { paddingX, width, y } = getTimelineGeometry();

      p.stroke(42, 58, 101);
      p.strokeWeight(4);
      p.line(paddingX, y, paddingX + width, y);

      const handleX = paddingX + width * currentProgress;
      p.noStroke();
      p.fill(93, 199, 255);
      p.circle(handleX, y, 20);

      p.textAlign(p.LEFT, p.BOTTOM);
      p.fill(148, 163, 184);
      p.textSize(13);
      p.text('No dilution', paddingX, y - 10);

      p.textAlign(p.RIGHT, p.BOTTOM);
      p.text('4 fresh slices issued', paddingX + width, y - 10);

      p.textAlign(p.CENTER, p.TOP);
      p.fill(203, 213, 225);
      p.text(
        `${Math.round(currentProgress * 100)}% of dilution pathway`,
        handleX,
        y + 12
      );
    };

    const drawPizza = ({
      centerX,
      centerY,
      diameter,
      totalSlices,
      displaySlices,
      ownershipPercent,
    }: {
      centerX: number;
      centerY: number;
      diameter: number;
      totalSlices: number;
      displaySlices: number;
      ownershipPercent: number;
    }) => {
      const startAngle = -p.HALF_PI;
      const radius = diameter * 0.42;
      const innerDiameter = diameter * 0.82;
      const sliceAngle = p.TWO_PI / displaySlices;
      const mintedCount = Math.max(0, displaySlices - START_SLICES);

      p.push();
      p.translate(centerX, centerY);

      // Crust layers
      p.noStroke();
      p.fill(110, 75, 23);
      p.ellipse(0, 0, diameter, diameter);
      p.fill(227, 168, 73);
      p.ellipse(0, 0, diameter * 0.92, diameter * 0.92);
      p.fill(240, 190, 124);
      p.ellipse(0, 0, innerDiameter, innerDiameter);

      // Owned slice vs everyone else
      const ownedAngle = p.TWO_PI * (1 / totalSlices);
      p.fill(87, 232, 199);
      p.arc(
        0,
        0,
        innerDiameter,
        innerDiameter,
        startAngle,
        startAngle + ownedAngle
      );
      p.fill(254, 141, 94);
      p.arc(
        0,
        0,
        innerDiameter,
        innerDiameter,
        startAngle + ownedAngle,
        startAngle + p.TWO_PI
      );

      // Slice lines
      p.strokeWeight(3);
      for (let i = 0; i < displaySlices; i++) {
        const angle = startAngle + sliceAngle * i;
        const isMinted = i >= START_SLICES;
        p.stroke(isMinted ? 'rgba(96,165,250,0.8)' : 'rgba(15,15,20,0.25)');
        p.line(0, 0, Math.cos(angle) * radius, Math.sin(angle) * radius);
      }

      // Minted glow
      if (mintedCount > 0) {
        p.noFill();
        p.stroke(96, 165, 250, 200);
        p.strokeWeight(6);
        for (let i = 0; i < mintedCount; i++) {
          const angleStart = startAngle + sliceAngle * (START_SLICES + i);
          p.arc(
            0,
            0,
            diameter * 0.96,
            diameter * 0.96,
            angleStart,
            angleStart + sliceAngle
          );
        }
      }

      p.pop();

      // Labels
      p.textAlign(p.CENTER, p.BOTTOM);
      p.fill(199, 210, 254);
      p.textSize(15);
      p.text(
        'The pizza represents the company',
        centerX,
        centerY - diameter * 0.55
      );

      p.textAlign(p.CENTER, p.CENTER);
      p.fill(89, 251, 210);
      p.textSize(36);
      p.text(`${ownershipPercent.toFixed(1)}%`, centerX, centerY);

      p.textSize(15);
      p.fill(148, 163, 184);
      p.text(
        `1 slice out of ${displaySlices} total`,
        centerX,
        centerY + diameter * 0.36
      );
    };

    const drawMetrics = ({
      ownershipPercent,
      valuePerShare,
      totalShares,
    }: {
      ownershipPercent: number;
      valuePerShare: number;
      totalShares: number;
    }) => {
      const metrics: Metric[] = [
        {
          label: 'Ownership share',
          unit: '%',
          start: 100 / START_SLICES,
          end: 100 / (START_SLICES + EXTRA_SLICES),
          value: ownershipPercent,
          trend: 'down',
          color: [86, 234, 211],
        },
        {
          label: 'Value per share',
          unit: '$',
          start: COMPANY_VALUE / START_SHARES,
          end: COMPANY_VALUE / (START_SHARES + SHARE_INCREASE),
          value: valuePerShare,
          trend: 'down',
          color: [255, 196, 136],
        },
        {
          label: 'Share count',
          unit: 'M',
          start: START_SHARES,
          end: START_SHARES + SHARE_INCREASE,
          value: totalShares,
          trend: 'up',
          color: [125, 177, 255],
        },
      ];

      const graphLeft = p.width * 0.55;
      const graphWidth = p.width * 0.34;
      // Shift bars slightly lower and increase spacing to avoid overlaps
      const firstBarY = Math.floor(p.height * 0.32);
      const barHeight = 40;
      const gap = Math.max(96, Math.floor(p.height * 0.12));

      metrics.forEach((metric, idx) => {
        const baseY = firstBarY + idx * gap;
        const maxValue = metric.trend === 'up' ? metric.end : metric.start || 1;
        const originalRatio = metric.start / maxValue;
        const currentRatio = metric.value / maxValue;

        // Track
        p.noStroke();
        p.fill(15, 19, 32);
        p.rect(graphLeft, baseY, graphWidth, barHeight, 12);

        // Original benchmark
        p.fill(45, 56, 94, 180);
        p.rect(graphLeft, baseY, graphWidth * originalRatio, barHeight, 12);

        // Live value
        p.fill(metric.color[0], metric.color[1], metric.color[2]);
        p.rect(graphLeft, baseY, graphWidth * currentRatio, barHeight, 12);

        // Label + text
        p.textAlign(p.LEFT, p.BOTTOM);
        p.fill(224, 231, 255);
        p.textSize(16);
        p.text(metric.label, graphLeft, baseY - 12);

        const arrowX = graphLeft + graphWidth + 18;
        const arrowY = baseY + barHeight / 2;
        p.noStroke();
        if (metric.trend === 'down') {
          p.fill(248, 113, 113);
          p.triangle(
            arrowX - 10,
            arrowY - 6,
            arrowX + 10,
            arrowY - 6,
            arrowX,
            arrowY + 10
          );
        } else {
          p.fill(34, 197, 94);
          p.triangle(
            arrowX - 10,
            arrowY + 6,
            arrowX + 10,
            arrowY + 6,
            arrowX,
            arrowY - 12
          );
        }

        // Place summary text below the bar with extra spacing
        p.textAlign(p.LEFT, p.TOP);
        p.textSize(13);
        p.fill(148, 163, 184);
        p.text(
          `${formatMetric(metric.value, metric.unit)} now (was ${formatMetric(
            metric.start,
            metric.unit
          )})`,
          graphLeft,
          baseY + barHeight + 16
        );
      });

      // Move caption higher to avoid first bar label
      p.textAlign(p.LEFT, p.BOTTOM);
      p.fill(180, 198, 229);
      p.textSize(12);
      p.text(
        'Company value held constant at $100M. More slices = thinner claims.',
        graphLeft,
        p.height * 0.16
      );
    };

    p.setup = () => {
      p.createCanvas(parentEl.clientWidth, parentEl.clientHeight);
      p.textFont('Inter, sans-serif');
      p.pixelDensity(Math.min(2, window.devicePixelRatio || 1));
    };

    p.windowResized = () => {
      p.resizeCanvas(parentEl.clientWidth, parentEl.clientHeight);
    };

    // Mouse / touch interactions for manual control
    p.mousePressed = () => {
      const { paddingX, width, y } = getTimelineGeometry();
      const handleX = paddingX + width * progress;
      const onHandle = Math.hypot(p.mouseX - handleX, p.mouseY - y) <= 16;
      const onTrack =
        p.mouseY >= y - 16 &&
        p.mouseY <= y + 16 &&
        p.mouseX >= paddingX &&
        p.mouseX <= paddingX + width;

      if (onHandle || onTrack) {
        isDragging = true;
        setProgressFromPointerX(p.mouseX);
      }
    };

    p.mouseDragged = () => {
      if (isDragging) {
        setProgressFromPointerX(p.mouseX);
      }
    };

    p.mouseReleased = () => {
      isDragging = false;
    };

    p.touchStarted = () => {
      const { paddingX, width, y } = getTimelineGeometry();
      const handleX = paddingX + width * progress;
      const onHandle = Math.hypot(p.mouseX - handleX, p.mouseY - y) <= 22;
      const onTrack =
        p.mouseY >= y - 22 &&
        p.mouseY <= y + 22 &&
        p.mouseX >= paddingX &&
        p.mouseX <= paddingX + width;
      if (onHandle || onTrack) {
        isDragging = true;
        setProgressFromPointerX(p.mouseX);
      }
      return false;
    };

    p.touchMoved = () => {
      if (isDragging) {
        setProgressFromPointerX(p.mouseX);
      }
      return false;
    };

    p.touchEnded = () => {
      isDragging = false;
      return false;
    };

    p.draw = () => {
      const totalSlices = START_SLICES + EXTRA_SLICES * progress;
      const displaySlices = Math.max(START_SLICES, Math.round(totalSlices));
      const ownershipPercent = (1 / totalSlices) * 100;
      const totalShares = START_SHARES + SHARE_INCREASE * progress;
      const valuePerShare = COMPANY_VALUE / totalShares;

      p.background(5, 8, 20);

      drawGrid();

      const pizzaCenterX = p.width * 0.3;
      const pizzaCenterY = p.height * 0.5;
      const pizzaDiameter = Math.min(p.width * 0.48, p.height * 0.78);

      drawPizza({
        centerX: pizzaCenterX,
        centerY: pizzaCenterY,
        diameter: pizzaDiameter,
        totalSlices,
        displaySlices,
        ownershipPercent,
      });

      drawMetrics({ ownershipPercent, valuePerShare, totalShares });

      drawTimeline(progress);
    };
  }, []);

  return <P5Sketch sketch={sketch} className="rounded-2xl" />;
};
