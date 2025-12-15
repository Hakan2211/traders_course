
import React, { useCallback, useEffect, useRef } from 'react';
import type p5 from 'p5';
import P5Sketch from '@/components/mdx_components/2d_environment/p5Sketch/p5SketchContainer';

export type ProfileShape =
  | 'd_shape'
  | 'p_shape'
  | 'b_shape'
  | 'trend'
  | 'double_distribution';

interface ProfileShapeExplorer2DProps {
  selectedShape: ProfileShape;
  showVWAP: boolean;
  showValueArea: boolean;
  showNodes: boolean;
  onHoverInfo?: (info: string | null) => void;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

// Compute Value Area (68.2%) around POC by expanding outwards
function computeValueAreaIndices(volumes: number[]): {
  vah: number;
  val: number;
} {
  const total = volumes.reduce((s, v) => s + v, 0) || 1;
  const target = total * 0.682;
  let pocIndex = 0;
  let maxVol = -Infinity;
  for (let i = 0; i < volumes.length; i++) {
    if (volumes[i] > maxVol) {
      maxVol = volumes[i];
      pocIndex = i;
    }
  }
  let sum = volumes[pocIndex];
  let low = pocIndex;
  let high = pocIndex;
  while (sum < target && (low > 0 || high < volumes.length - 1)) {
    const nextLowVol = low > 0 ? volumes[low - 1] : -Infinity;
    const nextHighVol =
      high < volumes.length - 1 ? volumes[high + 1] : -Infinity;
    if (nextHighVol >= nextLowVol) {
      if (high < volumes.length - 1) {
        high += 1;
        sum += volumes[high];
      } else if (low > 0) {
        low -= 1;
        sum += volumes[low];
      } else {
        break;
      }
    } else {
      if (low > 0) {
        low -= 1;
        sum += volumes[low];
      } else if (high < volumes.length - 1) {
        high += 1;
        sum += volumes[high];
      } else {
        break;
      }
    }
  }
  return { vah: high, val: low };
}

// Identify HVNs and LVNs (simple local extrema with thresholds)
function findNodes(volumes: number[]) {
  const maxVol = Math.max(...volumes) || 1;
  const hvnIndices: number[] = [];
  const lvnIndices: number[] = [];
  for (let i = 1; i < volumes.length - 1; i++) {
    const left = volumes[i - 1];
    const mid = volumes[i];
    const right = volumes[i + 1];
    if (mid > left && mid > right && mid > 0.6 * maxVol) {
      hvnIndices.push(i);
    }
    if (mid < left && mid < right && mid < 0.35 * maxVol) {
      lvnIndices.push(i);
    }
  }
  return { hvnIndices, lvnIndices, maxVol };
}

function gaussian(x: number, mean: number, stdDev: number): number {
  const a = (x - mean) / (stdDev || 1e-6);
  return Math.exp(-0.5 * a * a);
}

function generateDistribution(shape: ProfileShape, bins: number): number[] {
  const arr = new Array(bins).fill(0);
  const center = (bins - 1) / 2;
  switch (shape) {
    case 'd_shape': {
      // Symmetric bell curve
      const std = bins * 0.16;
      for (let i = 0; i < bins; i++) {
        arr[i] = gaussian(i, center, std);
      }
      break;
    }
    case 'p_shape': {
      // Thin lower tail, fat top (buyers winning) -> upper concentration
      const stdTop = bins * 0.14; // tight concentration near top
      const stdTail = bins * 0.28; // broader, lighter tail below
      const peak = center - bins * 0.14; // move peak upward (smaller index = higher price on canvas)
      for (let i = 0; i < bins; i++) {
        const topLobe = gaussian(i, peak, stdTop);
        const lowerTail = gaussian(i, center + bins * 0.3, stdTail) * 0.25;
        arr[i] = topLobe + lowerTail;
      }
      break;
    }
    case 'b_shape': {
      // Thick lower shelf, thin top (sellers dominating) -> lower concentration
      const stdBottom = bins * 0.14; // tight concentration near bottom
      const stdCap = bins * 0.28; // lighter cap above
      const trough = center + bins * 0.14; // move shelf downward (larger index = lower on canvas)
      for (let i = 0; i < bins; i++) {
        const lowerShelf = gaussian(i, trough, stdBottom);
        const upperCap = gaussian(i, center - bins * 0.3, stdCap) * 0.25;
        arr[i] = lowerShelf + upperCap;
      }
      break;
    }
    case 'trend': {
      // Skewed shape (long tail) — migrate value upward
      // Use an exponential ramp blended with a broad gaussian
      const std = bins * 0.22;
      for (let i = 0; i < bins; i++) {
        const norm = i / (bins - 1); // 0 (bottom) -> 1 (top)
        const ramp = Math.pow(norm, 2.2); // accelerating
        const bell = gaussian(i, center + bins * 0.1, std) * 0.6;
        arr[i] = ramp * 0.9 + bell;
      }
      break;
    }
    case 'double_distribution': {
      // Two humps separated by LVN
      const stdA = bins * 0.11;
      const stdB = bins * 0.11;
      const peakA = center - bins * 0.18;
      const peakB = center + bins * 0.24;
      for (let i = 0; i < bins; i++) {
        const a = gaussian(i, peakA, stdA);
        const b = gaussian(i, peakB, stdB);
        arr[i] = a + b * 0.95;
      }
      // Carve a valley (LVN) between the two humps
      const valleyStart = Math.floor(center - bins * 0.05);
      const valleyEnd = Math.floor(center + bins * 0.08);
      for (let i = valleyStart; i <= valleyEnd; i++) {
        if (i >= 0 && i < bins) arr[i] *= 0.4;
      }
      break;
    }
  }
  // Normalize to [0, 1]
  const max = Math.max(...arr) || 1;
  return arr.map((v) => v / max);
}

export const ProfileShapeExplorer2D: React.FC<ProfileShapeExplorer2DProps> = ({
  selectedShape,
  showVWAP,
  showValueArea,
  showNodes,
  onHoverInfo,
}) => {
  const shapeRef = useRef<ProfileShape>(selectedShape);
  const showVWAPRef = useRef<boolean>(showVWAP);
  const showValueAreaRef = useRef<boolean>(showValueArea);
  const showNodesRef = useRef<boolean>(showNodes);
  const hoverCbRef = useRef<typeof onHoverInfo>(onHoverInfo);

  useEffect(() => {
    shapeRef.current = selectedShape;
  }, [selectedShape]);
  useEffect(() => {
    showVWAPRef.current = showVWAP;
  }, [showVWAP]);
  useEffect(() => {
    showValueAreaRef.current = showValueArea;
  }, [showValueArea]);
  useEffect(() => {
    showNodesRef.current = showNodes;
  }, [showNodes]);
  useEffect(() => {
    hoverCbRef.current = onHoverInfo;
  }, [onHoverInfo]);

  const sketch = useCallback((p: p5, parentEl: HTMLDivElement) => {
    const BINS = 56;
    let current: number[] = generateDistribution(shapeRef.current, BINS);
    let target: number[] = current.slice();
    let hoverIndex: number | null = null;

    const layout = {
      padding: 36,
      labelWidth: 64,
    };

    function computeVWAP(volumes: number[]): number {
      // Weighted average price index (0..BINS-1), then map to Y later
      let sumVol = 0;
      let sumIdx = 0;
      for (let i = 0; i < volumes.length; i++) {
        sumVol += volumes[i];
        sumIdx += volumes[i] * i;
      }
      if (sumVol === 0) return (BINS - 1) / 2;
      return sumIdx / sumVol;
    }

    p.setup = () => {
      p.createCanvas(parentEl.clientWidth, parentEl.clientHeight);
      p.textFont('Inter, ui-sans-serif, system-ui, -apple-system');
    };

    p.windowResized = () => {
      p.resizeCanvas(parentEl.clientWidth, parentEl.clientHeight);
    };

    p.mouseMoved = () => {
      const x0 = layout.padding + layout.labelWidth;
      const y0 = layout.padding;
      const w = p.width - layout.padding * 2 - layout.labelWidth;
      const h = p.height - layout.padding * 2;
      if (
        p.mouseX < x0 ||
        p.mouseX > x0 + w ||
        p.mouseY < y0 ||
        p.mouseY > y0 + h
      ) {
        hoverIndex = null;
        if (hoverCbRef.current) hoverCbRef.current(null);
        return;
      }
      const binHeight = h / BINS;
      const idx = Math.floor((p.mouseY - y0) / binHeight);
      hoverIndex = clamp(idx, 0, BINS - 1);
      if (hoverCbRef.current) {
        // Build contextual text
        // Determine if this is within VA and distance to POC
        const volumes = current;
        const { vah, val } = computeValueAreaIndices(volumes);
        let poc = 0;
        let pocVol = -Infinity;
        for (let i = 0; i < volumes.length; i++) {
          if (volumes[i] > pocVol) {
            pocVol = volumes[i];
            poc = i;
          }
        }
        const withinVA = hoverIndex >= val && hoverIndex <= vah;
        const role = withinVA
          ? 'Value Area'
          : volumes[hoverIndex] < volumes[poc] * 0.35
          ? 'LVN'
          : 'HVN';
        hoverCbRef.current(
          `Level ${BINS - hoverIndex} • ${role} • RelVol ${(
            volumes[hoverIndex] / (pocVol || 1)
          ).toFixed(2)}`
        );
      }
    };

    p.draw = () => {
      // Smoothly update target if shape changed
      const desired = generateDistribution(shapeRef.current, BINS);
      if (desired !== target) {
        target = desired;
      }
      // Morph current -> target
      for (let i = 0; i < BINS; i++) {
        current[i] = lerp(current[i], target[i], 0.08);
      }

      // Draw background
      p.noStroke();
      p.background(16, 18, 26);

      const x0 = layout.padding + layout.labelWidth;
      const y0 = layout.padding;
      const w = p.width - layout.padding * 2 - layout.labelWidth;
      const h = p.height - layout.padding * 2;
      const binHeight = h / BINS;

      // Frame
      p.stroke(55, 60, 75);
      p.noFill();
      p.rect(x0, y0, w, h);

      // Title
      p.noStroke();
      p.fill(230);
      p.textAlign(p.LEFT, p.CENTER);
      p.textSize(14);
      const title =
        shapeRef.current === 'd_shape'
          ? 'D-shape (Balanced)'
          : shapeRef.current === 'p_shape'
          ? 'P-shape (Short-covering)'
          : shapeRef.current === 'b_shape'
          ? 'b-shape (Liquidation)'
          : shapeRef.current === 'trend'
          ? 'Trend / Skewed'
          : 'Double Distribution';
      p.text(`Profile Shape Explorer — ${title}`, x0, y0 - 18);

      // Compute meta (POC, VA, VWAP, nodes)
      const volumes = current;
      let pocIndex = 0;
      let pocVol = -Infinity;
      for (let i = 0; i < volumes.length; i++) {
        if (volumes[i] > pocVol) {
          pocVol = volumes[i];
          pocIndex = i;
        }
      }
      const { vah, val } = computeValueAreaIndices(volumes);
      const vwapIdx = computeVWAP(volumes);
      const { hvnIndices, lvnIndices, maxVol } = findNodes(volumes);

      // Value Area shading
      if (showValueAreaRef.current) {
        p.noStroke();
        p.fill(80, 140, 255, 35);
        const yVal = y0 + val * binHeight;
        const yVah = y0 + (vah + 1) * binHeight;
        p.rect(x0, yVal, w, yVah - yVal);
      }

      // Grid lines (price ticks)
      p.stroke(45, 50, 65);
      p.strokeWeight(1);
      const gridLines = 6;
      for (let g = 0; g <= gridLines; g++) {
        const yy = y0 + (h / gridLines) * g;
        p.line(x0, yy, x0 + w, yy);
      }

      // Draw histogram bars
      for (let i = 0; i < BINS; i++) {
        const ratio = volumes[i]; // 0..1
        const barW = ratio * (w * 0.95);
        const yTop = y0 + i * binHeight;
        const isPOC = i === pocIndex;
        const isHover = hoverIndex === i;

        // bar background glow
        if (isPOC) {
          p.noStroke();
          p.fill(255, 215, 120, 30);
          p.rect(x0, yTop, w, binHeight);
        } else if (isHover) {
          p.noStroke();
          p.fill(140, 180, 255, 20);
          p.rect(x0, yTop, w, binHeight);
        }

        p.noStroke();
        if (isPOC) {
          p.fill(255, 200, 120, 220);
        } else {
          // gradient by depth into VA
          const inVA = i >= val && i <= vah;
          if (inVA) {
            p.fill(110, 190, 255, 190);
          } else {
            p.fill(160, 170, 190, 150);
          }
        }
        p.rect(x0, yTop + 2, barW, Math.max(1, binHeight - 4), 3);
      }

      // POC marker (line at the POC price level)
      p.stroke(255, 205, 130, 220);
      p.strokeWeight(2);
      const pocY = y0 + pocIndex * binHeight + binHeight / 2;
      p.line(x0 - 8, pocY, x0 + w, pocY);
      p.noStroke();
      p.fill(255, 205, 130);
      p.textSize(11);
      p.textAlign(p.RIGHT, p.CENTER);
      p.text('POC', x0 - 10, pocY);

      // VWAP line (optional)
      if (showVWAPRef.current) {
        const vwapY = y0 + vwapIdx * binHeight + binHeight / 2;
        p.stroke(100, 255, 160, 200);
        p.strokeWeight(2);
        p.drawingContext.setLineDash([6, 4]);
        p.line(x0, vwapY, x0 + w, vwapY);
        p.drawingContext.setLineDash([]);
        p.noStroke();
        p.fill(100, 255, 160);
        p.textSize(11);
        p.textAlign(p.RIGHT, p.CENTER);
        p.text('VWAP', x0 - 10, vwapY);
      }

      // HVN/LVN markers (optional)
      if (showNodesRef.current) {
        // HVNs: triangles on right edge
        p.noStroke();
        p.fill(255, 240, 160, 230);
        hvnIndices.slice(0, 4).forEach((idx) => {
          const y = y0 + idx * binHeight + binHeight / 2;
          const size = 6;
          p.triangle(
            x0 + w + 12,
            y,
            x0 + w + 2,
            y - size,
            x0 + w + 2,
            y + size
          );
        });
        // LVNs: small circles on left edge
        p.fill(160, 200, 255, 220);
        lvnIndices.slice(0, 4).forEach((idx) => {
          const y = y0 + idx * binHeight + binHeight / 2;
          p.ellipse(x0 - 14, y, 6, 6);
        });
      }

      // Price axis labels (left)
      p.fill(200);
      p.textSize(10);
      p.textAlign(p.RIGHT, p.CENTER);
      for (let g = 0; g <= gridLines; g++) {
        const label = ((gridLines - g) * (BINS / gridLines)) | 0;
        const yy = y0 + (h / gridLines) * g;
        p.text(`${label}`, x0 - 10, yy);
      }
    };
  }, []);

  return (
    <div className="w-full h-full">
      <P5Sketch sketch={sketch} />
    </div>
  );
};

export default ProfileShapeExplorer2D;
