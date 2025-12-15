
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type p5 from 'p5';
import P5Sketch from '@/components/mdx_components/2d_environment/p5Sketch/p5SketchContainer';
import { cn } from '@/lib/utils';

type Side = 'bid' | 'ask';

interface PriceLevel {
  price: number;
  bidVisible: number;
  askVisible: number;
  bidHidden: number;
  askHidden: number;
  activity: number; // 0..1 recent activity heat
  spoof: boolean;
  spoofAlpha: number; // 0..1 for blink
}

interface Ripple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  side: Side;
}

interface Shard {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  life: number;
  maxLife: number;
  color: { r: number; g: number; b: number };
}

interface Particle {
  side: 'buy' | 'sell'; // buy = hits ask, sell = hits bid
  x: number;
  y: number;
  vx: number;
  vy: number;
  sizeUnits: number; // order size in "depth units"
  life: number;
  maxLife: number;
  price: number;
}

type EasingFn = (t: number) => number;
const easeOutCubic: EasingFn = (t) => 1 - Math.pow(1 - t, 3);
const easeInOutBack: EasingFn = (t) => {
  const c1 = 1.70158;
  const c2 = c1 * 1.525;
  return t < 0.5
    ? (Math.pow(2 * t, 2) * ((c2 + 1) * 2 * t - c2)) / 2
    : (Math.pow(2 * t - 2, 2) * ((c2 + 1) * (t * 2 - 2) + c2) + 2) / 2;
};

export const DepthChart2D: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [animateParticles, setAnimateParticles] = useState(true);
  const [showIcebergs, setShowIcebergs] = useState(true);
  const [replaySpeed, setReplaySpeed] = useState(1); // 0.25x..4x map to internal step
  const [glowIntensity, setGlowIntensity] = useState(0.6);
  const [visibleDepthLevels, setVisibleDepthLevels] = useState(36); // per side
  const [maxVolumeClamp, setMaxVolumeClamp] = useState(120); // width scaling cap
  const [icebergSensitivity, setIcebergSensitivity] = useState(0.5); // heuristic factor

  // Refs for p5 access
  const isPlayingRef = useRef(isPlaying);
  const animateParticlesRef = useRef(animateParticles);
  const showIcebergsRef = useRef(showIcebergs);
  const replaySpeedRef = useRef(replaySpeed);
  const glowIntensityRef = useRef(glowIntensity);
  const visibleDepthLevelsRef = useRef(visibleDepthLevels);
  const maxVolumeClampRef = useRef(maxVolumeClamp);
  const icebergSensitivityRef = useRef(icebergSensitivity);
  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);
  useEffect(() => {
    animateParticlesRef.current = animateParticles;
  }, [animateParticles]);
  useEffect(() => {
    showIcebergsRef.current = showIcebergs;
  }, [showIcebergs]);
  useEffect(() => {
    replaySpeedRef.current = replaySpeed;
  }, [replaySpeed]);
  useEffect(() => {
    glowIntensityRef.current = glowIntensity;
  }, [glowIntensity]);
  useEffect(() => {
    visibleDepthLevelsRef.current = visibleDepthLevels;
  }, [visibleDepthLevels]);
  useEffect(() => {
    maxVolumeClampRef.current = maxVolumeClamp;
  }, [maxVolumeClamp]);
  useEffect(() => {
    icebergSensitivityRef.current = icebergSensitivity;
  }, [icebergSensitivity]);

  // Data model
  const midPrice = 1000;
  const tick = 1;
  const totalLevels = 120; // around mid, used as source data

  const baseLevels = useMemo<PriceLevel[]>(() => {
    const levels: PriceLevel[] = [];
    for (let i = -totalLevels / 2; i <= totalLevels / 2; i++) {
      const price = midPrice + i * tick;
      // Construct soft bell-curve liquidity with random variation
      const dist = Math.abs(i);
      const baseDepth =
        80 * Math.exp(-Math.pow(dist / (totalLevels * 0.35), 2)) +
        (Math.random() * 12 - 6);
      const bidVisible =
        i <= 0 ? Math.max(0, baseDepth + (Math.random() * 16 - 8)) : 0;
      const askVisible =
        i > 0 ? Math.max(0, baseDepth + (Math.random() * 16 - 8)) : 0;
      // Seed some hidden iceberg blocks near mid on both sides
      const icebergBias =
        Math.max(0, 40 - dist * 2) * (Math.random() < 0.15 ? 1 : 0);
      levels.push({
        price,
        bidVisible,
        askVisible,
        bidHidden: i <= 0 ? icebergBias : 0,
        askHidden: i > 0 ? icebergBias : 0,
        activity: 0,
        spoof: false,
        spoofAlpha: 0,
      });
    }
    return levels;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sketch = useCallback(
    (p: p5, parentEl: HTMLDivElement) => {
      // Drawing constants
      const bg = { r: 10, g: 13, b: 16 };
      const margin = { top: 28, right: 160, bottom: 60, left: 160 };
      const centerGlowColor = 'rgba(160,180,255,0.35)';
      const bidBase = { r: 8, g: 58, b: 51 };
      const bidHi = { r: 0, g: 255, b: 154 };
      const askBase = { r: 58, g: 10, b: 15 };
      const askHi = { r: 255, g: 107, b: 107 };
      const icebergTint = { r: 12, g: 120, b: 140 };

      let width = parentEl.clientWidth;
      let height = parentEl.clientHeight;

      // View transform (vertical price zoom)
      let priceCenter = midPrice;
      let pricePixelsPerTick = 8; // initial zoom
      let parallax = { x: 0, y: 0 };

      // Working levels with animated widths
      let levels: PriceLevel[] = baseLevels.map((l) => ({ ...l }));
      let lerpLevels: PriceLevel[] = baseLevels.map((l) => ({ ...l }));
      let lastUpdateT = p.millis();

      // Effects
      const ripples: Ripple[] = [];
      const shards: Shard[] = [];
      const particles: Particle[] = [];
      let cumulativeDelta = 0; // for CVD micrograph

      // Mini tape
      interface TapeDot {
        price: number;
        side: 'buy' | 'sell';
        size: number; // visual size
        age: number;
      }
      const tapeDots: TapeDot[] = [];

      // Helpers
      const getInnerRect = () => {
        return {
          x: margin.left,
          y: margin.top,
          w: width - margin.left - margin.right,
          h: height - margin.top - margin.bottom,
        };
      };

      const priceToY = (price: number) => {
        const rect = getInnerRect();
        return rect.y + rect.h / 2 - (price - priceCenter) * pricePixelsPerTick;
      };

      const yToPrice = (y: number) => {
        const rect = getInnerRect();
        return priceCenter - (y - (rect.y + rect.h / 2)) / pricePixelsPerTick;
      };

      const clamp = (v: number, lo: number, hi: number) =>
        Math.max(lo, Math.min(hi, v));

      // Compute cumulative depth (in "units") at each level from spread outward
      function computeCumulative(side: Side) {
        // Treat index 0..N such that index near mid is smaller cumulative
        // We'll traverse outward from mid
        const visible = visibleDepthLevelsRef.current;
        const midIndex = levels.findIndex((l) => l.price === midPrice);
        const rect = getInnerRect();

        const indices: number[] = [];
        if (side === 'bid') {
          for (let i = 0; i >= -visible; i--) indices.push(midIndex + i);
        } else {
          for (let i = 1; i <= visible; i++) indices.push(midIndex + i);
        }

        const cumValues: number[] = [];
        let running = 0;
        for (let k = 0; k < indices.length; k++) {
          const idx = indices[k];
          const lvl = levels[idx];
          if (!lvl) {
            cumValues.push(running);
            continue;
          }
          const visibleDepth = side === 'bid' ? lvl.bidVisible : lvl.askVisible;
          running += Math.max(0, visibleDepth);
          cumValues.push(running);
        }

        // Map running to pixel width
        const maxDepth = Math.max(1, maxVolumeClampRef.current);
        const scale = (rect.w * 0.42) / maxDepth; // 42% per side
        const widths = cumValues.map((v) => clamp(v * scale, 0, rect.w * 0.44));
        return { indices, widths };
      }

      function colorLerp(
        a: { r: number; g: number; b: number },
        b: { r: number; g: number; b: number },
        t: number
      ) {
        const u = clamp(t, 0, 1);
        return {
          r: a.r + (b.r - a.r) * u,
          g: a.g + (b.g - a.g) * u,
          b: a.b + (b.b - a.b) * u,
        };
      }

      function drawBeveledStep(
        side: Side,
        yTop: number,
        yBottom: number,
        widthPix: number,
        activity: number,
        isSpoof: boolean,
        spoofAlpha: number
      ) {
        const rect = getInnerRect();
        const centerX = rect.x + rect.w / 2;
        const isBid = side === 'bid';
        const x0 = centerX;
        const x1 = isBid ? centerX - widthPix : centerX + widthPix;
        const h = Math.max(2, yBottom - yTop);
        // Base gradient by activity
        const base = isBid ? bidBase : askBase;
        const hi = isBid ? bidHi : askHi;
        const t = clamp(0.25 + activity * 0.75, 0, 1);
        const c = colorLerp(base, hi, t);

        // Soft inner shadow/glow
        p.noStroke();
        p.push();
        (p.drawingContext as CanvasRenderingContext2D).shadowBlur =
          12 * glowIntensityRef.current;
        (
          p.drawingContext as CanvasRenderingContext2D
        ).shadowColor = `rgba(${c.r},${c.g},${c.b},0.55)`;
        p.fill(c.r, c.g, c.b, 110);
        p.rect(isBid ? x1 : x0, yTop, Math.abs(x1 - x0), h, 3);
        p.pop();

        // Top highlight (bevel)
        p.stroke(255, 255, 255, 40 + activity * 80);
        p.strokeWeight(1);
        p.line(isBid ? x1 : x0, yTop, isBid ? x0 : x1, yTop);
        // Bottom shadow
        p.stroke(0, 0, 0, 60);
        p.line(isBid ? x1 : x0, yBottom, isBid ? x0 : x1, yBottom);

        // Step seam
        p.stroke(255, 255, 255, 30);
        p.line(isBid ? x1 : x0, yTop + 1, isBid ? x1 : x0, yBottom - 1);

        // Spoof shimmer/ghost outline
        if (isSpoof) {
          const alpha = 160 * spoofAlpha;
          p.stroke(255, 255, 255, alpha);
          p.noFill();
          p.rect(isBid ? x1 : x0, yTop, Math.abs(x1 - x0), h, 3);
        }
      }

      function drawIceberg(
        side: Side,
        yTop: number,
        yBottom: number,
        widthPix: number
      ) {
        if (!showIcebergsRef.current) return;
        if (widthPix <= 2) return;
        const rect = getInnerRect();
        const centerX = rect.x + rect.w / 2;
        const isBid = side === 'bid';
        const x0 = centerX;
        const x1 = isBid ? centerX - widthPix : centerX + widthPix;
        const h = Math.max(2, yBottom - yTop);
        p.noStroke();
        p.fill(icebergTint.r, icebergTint.g, icebergTint.b, 40);
        // Hidden base as translucent block below "tip"
        const depth = Math.max(6, h * 0.7);
        p.rect(isBid ? x1 : x0, yBottom, Math.abs(x1 - x0), depth, 3);
        // Subtle vertical grain
        p.stroke(icebergTint.r, icebergTint.g, icebergTint.b, 50);
        p.strokeWeight(1);
        for (let gx = 0; gx < Math.abs(x1 - x0); gx += 6) {
          const xx = (isBid ? x1 : x0) + gx + (isBid ? -1 : 1);
          p.line(xx, yBottom, xx, yBottom + depth);
        }
      }

      function spawnParticle(kind: 'buy' | 'sell') {
        if (!animateParticlesRef.current) return;
        const rect = getInnerRect();
        const centerX = rect.x + rect.w / 2;
        // Choose a price near center bias
        const price =
          priceCenter +
          (Math.random() * 2 - 1) *
            Math.max(2, visibleDepthLevelsRef.current * 0.25);
        const y = priceToY(price);
        const sizeUnits = 6 + Math.random() * 40; // 6..46
        const px = kind === 'buy' ? rect.x + rect.w - 6 : rect.x + 6;
        const direction = kind === 'buy' ? -1 : 1;
        const speed =
          (0.9 + Math.random() * 0.6) * (0.7 + replaySpeedRef.current * 0.3);
        particles.push({
          side: kind,
          x: px,
          y,
          vx: direction * (2.5 + speed * 3.5),
          vy: (Math.random() - 0.5) * 0.2,
          sizeUnits,
          life: 0,
          maxLife: 1.5,
          price,
        });
        // Tape dot
        tapeDots.push({
          price,
          side: kind,
          size: Math.max(2, Math.min(7, sizeUnits * 0.15)),
          age: 0,
        });
        // Keep tape short
        if (tapeDots.length > 120) tapeDots.shift();
      }

      function spawnRipple(x: number, y: number, side: Side) {
        ripples.push({
          x,
          y,
          radius: 0,
          maxRadius: 42,
          alpha: 1,
          side,
        });
      }

      function spawnShatter(x: number, y: number, side: Side) {
        const baseColor = side === 'bid' ? bidHi : askHi;
        for (let i = 0; i < 12; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = 0.8 + Math.random() * 2.2;
          shards.push({
            x,
            y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed - Math.random() * 0.3,
            size: 2 + Math.random() * 3,
            life: 0,
            maxLife: 0.6 + Math.random() * 0.6,
            color: baseColor,
          });
        }
      }

      function consumeAtLevel(
        levelIdx: number,
        side: Side,
        sizeUnits: number
      ): number {
        // Returns leftover sizeUnits after consuming visible+hidden at level
        const lvl = levels[levelIdx];
        if (!lvl) return sizeUnits;
        const visible = side === 'bid' ? lvl.bidVisible : lvl.askVisible;
        const hidden = side === 'bid' ? lvl.bidHidden : lvl.askHidden;
        let consume = Math.min(sizeUnits, visible);
        if (side === 'bid') lvl.bidVisible = Math.max(0, visible - consume);
        else lvl.askVisible = Math.max(0, visible - consume);
        let remaining = sizeUnits - consume;
        if (
          remaining > 0 &&
          (side === 'bid' ? lvl.bidHidden : lvl.askHidden) > 0
        ) {
          const hiddenConsume = Math.min(
            remaining,
            side === 'bid' ? lvl.bidHidden : lvl.askHidden
          );
          if (side === 'bid') lvl.bidHidden -= hiddenConsume;
          else lvl.askHidden -= hiddenConsume;
          remaining -= hiddenConsume;
        }
        // Mark activity
        lvl.activity = 1;
        return remaining;
      }

      function updateData(dt: number) {
        // Slowly vary displayed liquidity, seed occasional spoof walls
        const midIndex = levels.findIndex((l) => l.price === midPrice);
        for (let i = 0; i < levels.length; i++) {
          const lvl = levels[i];
          // Random walk adjustments
          const k = Math.exp(-Math.abs(i - midIndex) / 120);
          if (i <= midIndex) {
            lvl.bidVisible = clamp(
              lvl.bidVisible +
                (Math.random() - 0.5) * 2.2 * k * replaySpeedRef.current,
              0,
              maxVolumeClampRef.current * 1.25
            );
          }
          if (i >= midIndex) {
            lvl.askVisible = clamp(
              lvl.askVisible +
                (Math.random() - 0.5) * 2.2 * k * replaySpeedRef.current,
              0,
              maxVolumeClampRef.current * 1.25
            );
          }
          // Decay activity heat
          lvl.activity = clamp(lvl.activity - dt * 0.9, 0, 1);
          // Spoof blink and vanish quickly
          if (lvl.spoof) {
            lvl.spoofAlpha = Math.max(0, lvl.spoofAlpha - dt * 3.5);
            if (lvl.spoofAlpha <= 0.01) {
              lvl.spoof = false;
            }
          } else if (Math.random() < 0.0025 * replaySpeedRef.current) {
            // 0.25% chance per level per second near center
            const nearCenter =
              Math.abs(lvl.price - priceCenter) <
              visibleDepthLevelsRef.current * 0.65;
            if (nearCenter) {
              lvl.spoof = true;
              lvl.spoofAlpha = 1;
              // Flash-in a ghost wall then evaporate
              if (i <= midIndex) {
                lvl.bidVisible += 28 + Math.random() * 30;
              } else {
                lvl.askVisible += 28 + Math.random() * 30;
              }
            }
          }
        }
        // Animate toward levels for eased step widths
        for (let i = 0; i < levels.length; i++) {
          const s = 0.12; // damping
          lerpLevels[i].bidVisible =
            lerpLevels[i].bidVisible +
            (levels[i].bidVisible - lerpLevels[i].bidVisible) * s;
          lerpLevels[i].askVisible =
            lerpLevels[i].askVisible +
            (levels[i].askVisible - lerpLevels[i].askVisible) * s;
          lerpLevels[i].bidHidden =
            lerpLevels[i].bidHidden +
            (levels[i].bidHidden - lerpLevels[i].bidHidden) * s;
          lerpLevels[i].askHidden =
            lerpLevels[i].askHidden +
            (levels[i].askHidden - lerpLevels[i].askHidden) * s;
          lerpLevels[i].activity =
            lerpLevels[i].activity +
            (levels[i].activity - lerpLevels[i].activity) * 0.3;
          lerpLevels[i].spoof = levels[i].spoof;
          lerpLevels[i].spoofAlpha =
            lerpLevels[i].spoofAlpha +
            (levels[i].spoofAlpha - lerpLevels[i].spoofAlpha) * 0.35;
        }
      }

      function updateParticles(dt: number) {
        // Random spawn proportional to replaySpeed
        if (animateParticlesRef.current) {
          const rate = 1.1 * replaySpeedRef.current;
          if (Math.random() < rate * dt) spawnParticle('buy');
          if (Math.random() < rate * dt) spawnParticle('sell');
        }
        // Move particles and handle impacts at spread
        const rect = getInnerRect();
        const centerX = rect.x + rect.w / 2;
        for (let i = particles.length - 1; i >= 0; i--) {
          const prt = particles[i];
          prt.x += prt.vx;
          prt.y += prt.vy;
          prt.life += dt;
          // Trail drift
          prt.vy += (Math.random() - 0.5) * 0.02;
          // Impact with wall
          const hit =
            (prt.side === 'buy' && prt.x <= centerX) ||
            (prt.side === 'sell' && prt.x >= centerX);
          if (hit) {
            // Determine target level closest to price
            let closestIdx = 0;
            let closestDist = Infinity;
            for (let k = 0; k < levels.length; k++) {
              const d = Math.abs(levels[k].price - prt.price);
              if (d < closestDist) {
                closestDist = d;
                closestIdx = k;
              }
            }
            // Consume across multiple levels if necessary towards center
            let remaining = prt.sizeUnits;
            const midIndex = levels.findIndex((l) => l.price === midPrice);
            if (prt.side === 'buy') {
              // buy hits asks on right: consume from closest toward mid
              for (let k = closestIdx; k >= midIndex && remaining > 0; k--) {
                remaining = consumeAtLevel(k, 'ask', remaining);
              }
              cumulativeDelta += prt.sizeUnits; // aggressive buy
              spawnRipple(centerX, prt.y, 'ask');
              if (remaining > 2) spawnShatter(centerX, prt.y, 'ask');
            } else {
              // sell hits bids on left: consume from closest toward mid
              for (let k = closestIdx; k <= midIndex && remaining > 0; k++) {
                remaining = consumeAtLevel(k, 'bid', remaining);
              }
              cumulativeDelta -= prt.sizeUnits; // aggressive sell
              spawnRipple(centerX, prt.y, 'bid');
              if (remaining > 2) spawnShatter(centerX, prt.y, 'bid');
            }
            particles.splice(i, 1);
            continue;
          }
          if (prt.life >= prt.maxLife) {
            particles.splice(i, 1);
            continue;
          }
        }
      }

      function updateRipples(dt: number) {
        for (let i = ripples.length - 1; i >= 0; i--) {
          const r = ripples[i];
          r.radius += 80 * dt;
          r.alpha = clamp(r.alpha - dt * 1.6, 0, 1);
          if (r.alpha <= 0.01) ripples.splice(i, 1);
        }
      }

      function updateShards(dt: number) {
        for (let i = shards.length - 1; i >= 0; i--) {
          const s = shards[i];
          s.x += s.vx;
          s.y += s.vy;
          s.vy += 0.04; // gravity
          s.life += dt;
          if (s.life >= s.maxLife) shards.splice(i, 1);
        }
      }

      function drawBackground() {
        // Vignette
        p.background(bg.r, bg.g, bg.b);
        const rect = getInnerRect();
        p.push();
        const g = p.drawingContext as CanvasRenderingContext2D;
        const rad = p.drawingContext.createRadialGradient(
          width / 2,
          height / 2,
          Math.min(width, height) * 0.1,
          width / 2,
          height / 2,
          Math.max(width, height) * 0.8
        );
        rad.addColorStop(0, 'rgba(255,255,255,0.02)');
        rad.addColorStop(1, 'rgba(0,0,0,0.4)');
        g.fillStyle = rad;
        g.fillRect(0, 0, width, height);
        p.pop();

        // Panels / gridlines
        p.noStroke();
        p.fill(18, 18, 22, 200);
        p.rect(rect.x, rect.y, rect.w, rect.h, 16);
        p.stroke(60, 60, 72, 120);
        p.strokeWeight(1);
        // Subtle horizontal gridlines at price ticks
        const stepPix = Math.max(18, Math.min(38, pricePixelsPerTick * 5));
        for (
          let y = rect.y + 10 + ((rect.y + rect.h / 2) % stepPix);
          y < rect.y + rect.h - 10;
          y += stepPix
        ) {
          p.line(rect.x + 6, y, rect.x + rect.w - 6, y);
        }
      }

      function drawSpread() {
        const rect = getInnerRect();
        const centerX = rect.x + rect.w / 2;
        p.push();
        (p.drawingContext as CanvasRenderingContext2D).shadowBlur = 8;
        (p.drawingContext as CanvasRenderingContext2D).shadowColor =
          centerGlowColor;
        p.stroke(210, 220, 255, 220);
        p.strokeWeight(2);
        p.line(centerX, rect.y, centerX, rect.y + rect.h);
        p.pop();
        // Label
        p.noStroke();
        p.fill(235);
        p.textSize(12);
        p.textAlign(p.CENTER, p.TOP);
        p.text('Spread', centerX, rect.y - 18);
      }

      function drawWalls() {
        // Determine visible price range
        const rect = getInnerRect();
        const midIndex = levels.findIndex((l) => l.price === priceCenter);

        // Compute cumulative widths on eased levels
        const tmp = levels;
        levels = lerpLevels;
        const { indices: bidIdx, widths: bidWidths } = computeCumulative('bid');
        const { indices: askIdx, widths: askWidths } = computeCumulative('ask');
        levels = tmp;

        // Draw stepped rectangles per level (mirrored)
        for (let s = 0; s < bidIdx.length; s++) {
          const idx = bidIdx[s];
          const lvl = lerpLevels[idx];
          if (!lvl) continue;
          const yCenter = priceToY(lvl.price);
          const nextIdx = bidIdx[s + 1] ?? idx;
          const nextPrice = lerpLevels[nextIdx]?.price ?? lvl.price - tick;
          const yNext = priceToY(nextPrice);
          const yTop = Math.min(yCenter, yNext);
          const yBottom = Math.max(yCenter, yNext);
          const widthPix = bidWidths[s];
          // Visible tip
          drawBeveledStep(
            'bid',
            yTop,
            yBottom,
            widthPix,
            lvl.activity,
            lvl.spoof,
            lvl.spoofAlpha
          );
          // Hidden base (iceberg)
          if (lvl.bidHidden > icebergSensitivityRef.current * 2) {
            drawIceberg('bid', yTop, yBottom, widthPix * 0.75);
          }
        }
        for (let s = 0; s < askIdx.length; s++) {
          const idx = askIdx[s];
          const lvl = lerpLevels[idx];
          if (!lvl) continue;
          const yCenter = priceToY(lvl.price);
          const nextIdx = askIdx[s + 1] ?? idx;
          const nextPrice = lerpLevels[nextIdx]?.price ?? lvl.price + tick;
          const yNext = priceToY(nextPrice);
          const yTop = Math.min(yCenter, yNext);
          const yBottom = Math.max(yCenter, yNext);
          const widthPix = askWidths[s];
          drawBeveledStep(
            'ask',
            yTop,
            yBottom,
            widthPix,
            lvl.activity,
            lvl.spoof,
            lvl.spoofAlpha
          );
          if (lvl.askHidden > icebergSensitivityRef.current * 2) {
            drawIceberg('ask', yTop, yBottom, widthPix * 0.75);
          }
        }
      }

      function drawParticles() {
        // Additive blend look
        p.push();
        (p.drawingContext as any).globalCompositeOperation = 'lighter';
        for (let i = 0; i < particles.length; i++) {
          const prt = particles[i];
          const baseColor = prt.side === 'buy' ? askHi : bidHi;
          const alpha = 220;
          // trail
          p.noStroke();
          for (let t = 0; t < 6; t++) {
            const f = t / 6;
            const tx = prt.x - prt.vx * f * 2.4;
            const ty = prt.y - prt.vy * f * 2.4;
            p.fill(
              baseColor.r,
              baseColor.g,
              baseColor.b,
              alpha * (1 - f) * 0.25
            );
            p.circle(tx, ty, 4 + prt.sizeUnits * 0.15 * (1 - f));
          }
          // core
          p.fill(baseColor.r, baseColor.g, baseColor.b, 240);
          p.circle(prt.x, prt.y, 3 + prt.sizeUnits * 0.15);
        }
        p.pop();
      }

      function drawRipplesAndShards() {
        // Ripples
        for (let i = 0; i < ripples.length; i++) {
          const r = ripples[i];
          const col = r.side === 'bid' ? bidHi : askHi;
          p.noFill();
          p.stroke(col.r, col.g, col.b, 120 * r.alpha);
          p.strokeWeight(2);
          p.circle(r.x, r.y, r.radius * 2);
        }
        // Shards
        for (let i = 0; i < shards.length; i++) {
          const s = shards[i];
          const a = easeOutCubic(1 - s.life / s.maxLife);
          p.noStroke();
          p.fill(s.color.r, s.color.g, s.color.b, 200 * a);
          p.rect(s.x, s.y, s.size, s.size);
        }
      }

      function drawHUD() {
        const rect = getInnerRect();
        // Top-left compact summary
        p.noStroke();
        p.fill(255, 255, 255, 215);
        p.textSize(13);
        p.textAlign(p.LEFT, p.TOP);
        const bestBid = levels
          .slice()
          .reverse()
          .find((l) => l.price <= priceCenter)?.price;
        const bestAsk = levels.find((l) => l.price > priceCenter)?.price;
        const spread =
          bestAsk !== undefined && bestBid !== undefined
            ? bestAsk - bestBid
            : 0;
        p.text(
          `Best Bid: ${bestBid?.toFixed(2)}   Best Ask: ${bestAsk?.toFixed(
            2
          )}   Spread: ${spread.toFixed(2)}`,
          rect.x + 10,
          rect.y + 8
        );

        // Aggression meter (top-right)
        const meterX = rect.x + rect.w - 140;
        const meterY = rect.y + 10;
        const meterW = 120;
        const meterH = 10;
        const norm = clamp((cumulativeDelta / 600) * 0.5, -1, 1);
        p.fill(30, 30, 36, 180);
        p.rect(meterX, meterY, meterW, meterH, 6);
        // center to sides
        const center = meterX + meterW / 2;
        if (norm >= 0) {
          const w = (meterW / 2) * norm;
          p.fill(0, 255, 154, 180);
          p.rect(center, meterY, w, meterH, 6);
        } else {
          const w = (meterW / 2) * -norm;
          p.fill(255, 107, 107, 180);
          p.rect(center - w, meterY, w, meterH, 6);
        }
        p.noStroke();
        p.fill(220);
        p.textSize(11);
        p.textAlign(p.CENTER, p.TOP);
        p.text('Aggression', center, meterY + 14);

        // Tape mini-strip (right margin)
        const tapeX = rect.x + rect.w + 10;
        const tapeY = rect.y;
        const tapeH = rect.h;
        for (let i = 0; i < tapeDots.length; i++) {
          const d = tapeDots[i];
          const y = clamp(priceToY(d.price), rect.y + 4, rect.y + rect.h - 4);
          const alpha = clamp(1 - d.age / 2.2, 0, 1);
          p.noStroke();
          if (d.side === 'buy') p.fill(0, 255, 154, 220 * alpha);
          else p.fill(255, 107, 107, 220 * alpha);
          p.circle(tapeX, y, d.size);
          d.age += 1 / 60;
        }
      }

      function drawHoverTooltip() {
        const rect = getInnerRect();
        const mx = p.mouseX;
        const my = p.mouseY;
        if (
          mx < rect.x ||
          mx > rect.x + rect.w ||
          my < rect.y ||
          my > rect.y + rect.h
        )
          return;
        const price = yToPrice(my);
        // Find nearest level
        let closestIdx = 0;
        let closestDist = Infinity;
        for (let i = 0; i < lerpLevels.length; i++) {
          const d = Math.abs(lerpLevels[i].price - price);
          if (d < closestDist) {
            closestDist = d;
            closestIdx = i;
          }
        }
        const lvl = lerpLevels[closestIdx];
        if (!lvl) return;
        const y = priceToY(lvl.price);
        // Guide line
        p.stroke(255, 255, 255, 40);
        p.line(rect.x + 6, y, rect.x + rect.w - 6, y);
        // Tooltip card
        const cardW = 200;
        const cardH = 84;
        const cx = rect.x + rect.w / 2;
        const cardX = mx < cx ? cx + 18 : cx - cardW - 18;
        const cardY = clamp(
          y - cardH / 2,
          rect.y + 8,
          rect.y + rect.h - cardH - 8
        );
        p.noStroke();
        p.fill(20, 26, 32, 230);
        p.rect(cardX, cardY, cardW, cardH, 10);
        p.stroke(70, 110, 240, 140);
        p.noFill();
        p.rect(cardX, cardY, cardW, cardH, 10);
        p.noStroke();
        p.fill(235);
        p.textSize(12);
        p.textAlign(p.LEFT, p.TOP);
        p.text(`Price: ${lvl.price.toFixed(2)}`, cardX + 10, cardY + 10);
        p.text(
          `Bid: ${lvl.bidVisible.toFixed(1)} (${lvl.bidHidden.toFixed(
            1
          )} hidden)`,
          cardX + 10,
          cardY + 28
        );
        p.text(
          `Ask: ${lvl.askVisible.toFixed(1)} (${lvl.askHidden.toFixed(
            1
          )} hidden)`,
          cardX + 10,
          cardY + 44
        );
        p.text(
          `Activity: ${(lvl.activity * 100).toFixed(0)}%`,
          cardX + 10,
          cardY + 60
        );
      }

      p.setup = () => {
        p.createCanvas(width, height);
        p.frameRate(60);
        // Mouse wheel for zoom
        parentEl.addEventListener(
          'wheel',
          (e) => {
            e.preventDefault();
            const delta = Math.sign((e as WheelEvent).deltaY);
            // Zoom in/out
            pricePixelsPerTick = clamp(
              pricePixelsPerTick * (delta < 0 ? 1.08 : 0.92),
              2,
              22
            );
          },
          { passive: false }
        );
      };

      p.draw = () => {
        const now = p.millis();
        const dtRaw = Math.max(0, now - lastUpdateT) / 1000;
        lastUpdateT = now;
        const dt = isPlayingRef.current ? dtRaw * replaySpeedRef.current : 0;

        // Slight parallax from mouse
        parallax.x = (p.mouseX - width / 2) * 0.01;
        parallax.y = (p.mouseY - height / 2) * 0.01;
        p.translate(parallax.x, parallax.y);

        // Update data and effects
        updateData(dt);
        updateParticles(dt);
        updateRipples(dt);
        updateShards(dt);

        // Draw
        p.resetMatrix(); // avoid parallax affecting HUD frames
        drawBackground();
        p.translate(parallax.x, parallax.y);
        drawSpread();
        drawWalls();
        drawParticles();
        drawRipplesAndShards();
        p.resetMatrix();
        drawHUD();
        drawHoverTooltip();
      };

      p.windowResized = () => {
        width = parentEl.clientWidth;
        height = parentEl.clientHeight;
        p.resizeCanvas(width, height);
      };
    },
    [baseLevels]
  );

  return (
    <div className="w-full h-full">
      {/* Controls HUD */}
      <div
        className={cn(
          'absolute z-10 bottom-3 left-1/2 -translate-x-1/2',
          'pointer-events-auto flex items-center gap-2 flex-wrap justify-center',
          'bg-slate-900/80 border border-slate-700 rounded-xl shadow px-3 py-2'
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
        <div className="flex items-center gap-2 px-2">
          <label htmlFor="dc2d-speed" className="text-xs text-slate-200/90">
            Replay
          </label>
          <input
            id="dc2d-speed"
            type="range"
            min={0.25}
            max={4}
            step={0.25}
            value={replaySpeed}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setReplaySpeed(Number(e.target.value))
            }
            className="accent-indigo-400"
            aria-label="Replay speed (0.25x – 4x)"
          />
          <div className="text-xs text-slate-100/80 w-10 text-right">
            {replaySpeed.toFixed(2)}x
          </div>
        </div>
        <div className="flex items-center gap-2 px-2">
          <label htmlFor="dc2d-depth" className="text-xs text-slate-200/90">
            Levels
          </label>
          <input
            id="dc2d-depth"
            type="range"
            min={12}
            max={60}
            step={2}
            value={visibleDepthLevels}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setVisibleDepthLevels(Number(e.target.value))
            }
            className="accent-indigo-400"
            aria-label="Visible depth levels"
          />
        </div>
        <div className="flex items-center gap-2 px-2">
          <label htmlFor="dc2d-maxvol" className="text-xs text-slate-200/90">
            MaxVol
          </label>
          <input
            id="dc2d-maxvol"
            type="range"
            min={60}
            max={240}
            step={10}
            value={maxVolumeClamp}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setMaxVolumeClamp(Number(e.target.value))
            }
            className="accent-indigo-400"
            aria-label="Max volume clamp"
          />
        </div>
        <div className="flex items-center gap-2 px-2">
          <label htmlFor="dc2d-glow" className="text-xs text-slate-200/90">
            Glow
          </label>
          <input
            id="dc2d-glow"
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={glowIntensity}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setGlowIntensity(Number(e.target.value))
            }
            className="accent-indigo-400"
            aria-label="Glow intensity"
          />
        </div>
        <div className="flex items-center gap-2 px-2">
          <label htmlFor="dc2d-ice" className="text-xs text-slate-200/90">
            Icebergs
          </label>
          <input
            id="dc2d-ice"
            type="checkbox"
            checked={showIcebergs}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setShowIcebergs(e.target.checked)
            }
            className="accent-teal-400"
            aria-label="Toggle icebergs"
          />
        </div>
        <div className="flex items-center gap-2 px-2">
          <label htmlFor="dc2d-particles" className="text-xs text-slate-200/90">
            Particles
          </label>
          <input
            id="dc2d-particles"
            type="checkbox"
            checked={animateParticles}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setAnimateParticles(e.target.checked)
            }
            className="accent-rose-400"
            aria-label="Toggle market order particles"
          />
        </div>
      </div>

      {/* Sketch */}
      <P5Sketch sketch={sketch} />
    </div>
  );
};

export default DepthChart2D;
