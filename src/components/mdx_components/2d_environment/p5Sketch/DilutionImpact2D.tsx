
import React, { useCallback } from 'react';
import type p5 from 'p5';
import P5Sketch from '@/components/mdx_components/2d_environment/p5Sketch/p5SketchContainer';

type ControlKey = 'cash' | 'price' | 'shares';

type ControlConfig = {
  label: string;
  unit: string;
  min: number;
  max: number;
  helper: string;
};

const BASE_SHARES_M = 10; // 10M outstanding
const INVESTOR_SHARES_M = 0.25; // 250k personal position
const NET_INCOME_M = 12; // $12M earnings run rate
const BASE_SHARE_PRICE = 10; // $10 per share baseline
const BASE_MARKET_CAP_M = BASE_SHARES_M * BASE_SHARE_PRICE; // $100M implied

const CONTROL_CONFIGS: Record<ControlKey, ControlConfig> = {
  cash: {
    label: 'Cash Raised',
    unit: '$M',
    min: 2,
    max: 216,
    helper: 'Deal size (price × shares)',
  },
  price: {
    label: 'Offering Price',
    unit: '$',
    min: 2,
    max: 18,
    helper: 'Institutional print per share',
  },
  shares: {
    label: 'Shares Issued',
    unit: 'M',
    min: 1,
    max: 12,
    helper: 'New supply hitting the float',
  },
};

const formatLabel = (key: ControlKey, value: number) => {
  if (key === 'price') {
    return `$${value.toFixed(2)}`;
  }
  if (key === 'cash') {
    return `$${value.toFixed(1)}M`;
  }
  return `${value.toFixed(2)}M`;
};

const DilutionImpact2D: React.FC = () => {
  const sketch = useCallback((p: p5, parentEl: HTMLDivElement) => {
    const state: {
      cashRaised: number;
      offeringPrice: number;
      sharesIssued: number;
      activeControl: ControlKey | null;
    } = {
      cashRaised: 8.5 * 4.5,
      offeringPrice: 8.5,
      sharesIssued: 4.5,
      activeControl: null,
    };

    const clamp = (val: number, min: number, max: number) =>
      Math.min(Math.max(val, min), max);

    const getCashRaised = () => state.cashRaised;

    const getDerived = () => {
      const preShares = BASE_SHARES_M;
      const postShares = BASE_SHARES_M + state.sharesIssued;
      const cashRaised = getCashRaised();
      const epsBefore = NET_INCOME_M / preShares;
      const epsAfter = NET_INCOME_M / postShares;
      const valueBefore = BASE_MARKET_CAP_M / preShares;
      const valueAfter = (BASE_MARKET_CAP_M + cashRaised) / postShares;
      const ownershipBefore = (INVESTOR_SHARES_M / preShares) * 100;
      const ownershipAfter = (INVESTOR_SHARES_M / postShares) * 100;
      return {
        preShares,
        postShares,
        addedShares: postShares - preShares,
        cashRaised,
        epsBefore,
        epsAfter,
        valueBefore,
        valueAfter,
        ownershipBefore,
        ownershipAfter,
      };
    };

    const getTrackGeometry = (key: ControlKey) => {
      const baseY = p.height * 0.94;
      const width = p.width * 0.26;
      if (key === 'cash') {
        return { x: p.width * 0.2, y: baseY, width };
      }
      if (key === 'price') {
        return { x: p.width * 0.5, y: baseY, width };
      }
      return { x: p.width * 0.8, y: baseY, width };
    };

    const getControlValue = (key: ControlKey) => {
      if (key === 'cash') return getCashRaised();
      if (key === 'price') return state.offeringPrice;
      return state.sharesIssued;
    };

    const recomputeSharesFromCash = () => {
      const implied = state.cashRaised / state.offeringPrice;
      const clamped = clamp(
        implied,
        CONTROL_CONFIGS.shares.min,
        CONTROL_CONFIGS.shares.max
      );
      state.sharesIssued = clamped;
      state.cashRaised = state.sharesIssued * state.offeringPrice;
    };

    const recomputeCashFromShares = () => {
      const cash = state.sharesIssued * state.offeringPrice;
      state.cashRaised = clamp(
        cash,
        CONTROL_CONFIGS.cash.min,
        CONTROL_CONFIGS.cash.max
      );
    };

    const setControlFromPointer = (key: ControlKey, pointerX: number) => {
      const track = getTrackGeometry(key);
      const cfg = CONTROL_CONFIGS[key];
      const left = track.x - track.width / 2;
      const ratio = clamp((pointerX - left) / track.width, 0, 1);
      const target = cfg.min + ratio * (cfg.max - cfg.min);

      if (key === 'cash') {
        state.cashRaised = clamp(target, cfg.min, cfg.max);
        recomputeSharesFromCash();
        return;
      }

      if (key === 'price') {
        state.offeringPrice = clamp(target, cfg.min, cfg.max);
        recomputeSharesFromCash();
        return;
      }

      if (key === 'shares') {
        state.sharesIssued = clamp(target, cfg.min, cfg.max);
        recomputeCashFromShares();
      }
    };

    const getHandlePosition = (key: ControlKey) => {
      const track = getTrackGeometry(key);
      const cfg = CONTROL_CONFIGS[key];
      const value = clamp(getControlValue(key), cfg.min, cfg.max);
      const ratio = (value - cfg.min) / (cfg.max - cfg.min);
      return {
        x: track.x - track.width / 2 + ratio * track.width,
        y: track.y,
      };
    };

    const tryActivateHandle = (pointerX: number, pointerY: number) => {
      const radius = 42;
      const keys: ControlKey[] = ['cash', 'price', 'shares'];
      for (const key of keys) {
        const handle = getHandlePosition(key);
        const distance = Math.hypot(pointerX - handle.x, pointerY - handle.y);
        if (distance <= radius) {
          state.activeControl = key;
          setControlFromPointer(key, pointerX);
          return true;
        }
      }
      return false;
    };

    const drawBackground = () => {
      p.background(4, 7, 19);
      p.push();
      p.stroke(12, 18, 42);
      const spacing = 64;
      for (let x = 0; x < p.width; x += spacing) {
        p.line(x, 0, x, p.height);
      }
      for (let y = 0; y < p.height; y += spacing) {
        p.line(0, y, p.width, y);
      }
      p.pop();
      p.push();
      const gradient = p.drawingContext.createLinearGradient(0, 0, 0, p.height);
      gradient.addColorStop(0, 'rgba(15,23,42,0.8)');
      gradient.addColorStop(1, 'rgba(2,6,23,0.95)');
      p.drawingContext.fillStyle = gradient;
      p.rect(0, 0, p.width, p.height);
      p.pop();
    };

    const drawShareOrbit = () => {
      const derived = getDerived();
      const centerX = p.width * 0.26;
      const centerY = p.height * 0.45;
      const radius = Math.min(p.width, p.height) * 0.17;
      const totalRatio = derived.postShares;
      const baseRatio = derived.preShares / totalRatio;

      p.push();
      p.translate(centerX, centerY);
      p.noFill();
      p.stroke(30, 41, 82);
      p.strokeWeight(26);
      p.arc(0, 0, radius * 2, radius * 2, -p.HALF_PI, p.TWO_PI - p.HALF_PI);

      p.stroke(56, 189, 248);
      p.arc(
        0,
        0,
        radius * 2,
        radius * 2,
        -p.HALF_PI,
        -p.HALF_PI + baseRatio * p.TWO_PI
      );

      p.stroke(248, 113, 113);
      p.arc(
        0,
        0,
        radius * 2,
        radius * 2,
        -p.HALF_PI + baseRatio * p.TWO_PI,
        -p.HALF_PI + p.TWO_PI
      );

      p.noStroke();
      p.fill(15, 23, 42);
      p.circle(0, 0, radius * 1.1);
      p.fill(226, 232, 255);
      p.textAlign(p.CENTER, p.CENTER);
      p.textSize(18);
      p.text(
        `${derived.preShares.toFixed(1)}M → ${derived.postShares.toFixed(1)}M`,
        0,
        -8
      );
      p.textSize(13);
      p.fill(148, 163, 184);
      p.text('Share count', 0, 14);

      p.pop();

      p.push();
      p.textAlign(p.LEFT, p.TOP);
      p.fill(203, 213, 225);
      p.textSize(20);
      p.text('New Supply Shock', centerX - radius, centerY + radius + 24);
      p.textSize(13);
      p.fill(148, 163, 184);
      p.text(
        'Blue ring = existing float\nRed wedge = newly issued shares',
        centerX - radius,
        centerY + radius + 48
      );
      p.pop();
    };

    const drawEPSPanel = () => {
      const derived = getDerived();
      const panelLeft = p.width * 0.46;
      const panelTop = p.height * 0.18;
      const panelWidth = p.width * 0.5;
      const panelHeight = p.height * 0.28;
      const maxValue = Math.max(derived.epsBefore, derived.epsAfter) * 1.2;

      p.push();
      p.fill(9, 12, 28);
      p.stroke(41, 55, 92);
      p.rect(panelLeft, panelTop, panelWidth, panelHeight, 24);

      const drawRow = (
        label: string,
        value: number,
        color: [number, number, number],
        yOffset: number
      ) => {
        const barWidth = panelWidth * 0.8 * (value / maxValue);
        const barX = panelLeft + panelWidth * 0.1;
        const barY = panelTop + yOffset;
        p.fill(15, 23, 42);
        p.rect(barX, barY, panelWidth * 0.8, 18, 9);
        p.fill(...color);
        p.rect(barX, barY, barWidth, 18, 9);
        p.fill(226, 232, 255);
        p.textAlign(p.LEFT, p.BOTTOM);
        p.textSize(14);
        p.text(`${label} (${value.toFixed(2)})`, barX, barY - 6);
      };

      p.fill(203, 213, 225);
      p.textAlign(p.LEFT, p.TOP);
      p.textSize(20);
      p.text('Earnings Per Share', panelLeft + 24, panelTop + 18);
      p.textSize(13);
      p.fill(148, 163, 184);
      p.text(
        'Same earnings spread across a larger share base. EPS compresses immediately.',
        panelLeft + 24,
        panelTop + 44,
        panelWidth - 48,
        64
      );

      drawRow('Before raise', derived.epsBefore, [56, 189, 248], 94);
      drawRow('After raise', derived.epsAfter, [248, 113, 113], 150);
      p.pop();
    };

    const drawValuePanel = () => {
      const derived = getDerived();
      const panelLeft = p.width * 0.08;
      const panelTop = p.height * 0.64;
      const panelWidth = p.width * 0.36;
      const panelHeight = p.height * 0.24;
      const chartTop = panelTop + 108;
      const chartBottom = panelTop + panelHeight - 28;
      const chartHeight = chartBottom - chartTop;
      const maxValue = Math.max(derived.valueBefore, derived.valueAfter) * 1.15;

      p.push();
      p.fill(9, 12, 28);
      p.stroke(41, 55, 92);
      p.rect(panelLeft, panelTop, panelWidth, panelHeight, 22);

      p.textAlign(p.LEFT, p.TOP);
      p.fill(203, 213, 225);
      p.textSize(18);
      p.text('Value Per Share', panelLeft + 20, panelTop + 18);
      p.textSize(13);
      p.fill(148, 163, 184);
      p.text(
        'Cash arrives, but every share still becomes less valuable.',
        panelLeft + 20,
        panelTop + 42
      );

      const bars = [
        {
          label: 'Before raise',
          value: derived.valueBefore,
          color: [56, 189, 248] as [number, number, number],
          x: panelLeft + panelWidth * 0.32,
        },
        {
          label: 'After raise',
          value: derived.valueAfter,
          color: [248, 113, 113] as [number, number, number],
          x: panelLeft + panelWidth * 0.68,
        },
      ];

      p.textAlign(p.CENTER, p.TOP);
      p.textSize(13);
      bars.forEach((bar) => {
        p.fill(148, 163, 184);
        p.text(bar.label, bar.x, panelTop + 72);
      });

      p.textAlign(p.CENTER, p.BOTTOM);
      bars.forEach((bar) => {
        const ratio = bar.value / maxValue;
        const barHeight = chartHeight * ratio;
        const barWidth = 56;
        const barX = bar.x - barWidth / 2;
        const barY = chartBottom - barHeight;
        p.fill(17, 24, 39);
        p.rect(barX, chartTop, barWidth, chartHeight, 14);
        p.fill(...bar.color);
        p.rect(barX, barY, barWidth, barHeight, 14);
        p.fill(226, 232, 255);
        p.textSize(15);
        p.text(`$${bar.value.toFixed(2)}`, bar.x, barY - 10);
      });
      p.pop();
    };

    const drawImpactBadges = () => {
      const derived = getDerived();
      const epsDelta =
        ((derived.epsAfter - derived.epsBefore) / derived.epsBefore) * 100;
      const ownershipDelta =
        ((derived.ownershipAfter - derived.ownershipBefore) /
          derived.ownershipBefore) *
        100;
      const badges: Array<{
        title: string;
        subtitle: string;
        value: string;
        delta: number;
      }> = [
        {
          title: 'EPS Compression',
          subtitle: 'Math hits instantly',
          value: `$${derived.epsAfter.toFixed(
            2
          )} post vs $${derived.epsBefore.toFixed(2)} pre`,
          delta: epsDelta,
        },
        {
          title: 'Ownership Percentage',
          subtitle: 'Your slice of the pie',
          value: `${derived.ownershipAfter.toFixed(
            2
          )}% post vs ${derived.ownershipBefore.toFixed(2)}% pre`,
          delta: ownershipDelta,
        },
      ];

      badges.forEach((badge, idx) => {
        const left = p.width * 0.54;
        const top = p.height * (0.52 + idx * 0.16);
        const width = p.width * 0.34;
        const height = p.height * 0.14;
        p.push();
        p.fill(9, 12, 28);
        p.stroke(41, 55, 92);
        p.rect(left, top, width, height, 22);
        p.textAlign(p.LEFT, p.TOP);
        p.fill(203, 213, 225);
        p.textSize(18);
        p.text(badge.title, left + 20, top + 16);
        p.textSize(13);
        p.fill(148, 163, 184);
        p.text(badge.subtitle, left + 20, top + 40);
        p.fill(226, 232, 255);
        p.textSize(15);
        p.text(badge.value, left + 20, top + 64);
        p.textSize(30);
        p.textAlign(p.RIGHT, p.TOP);
        p.fill(badge.delta > 0 ? [56, 189, 248] : [248, 113, 113]);
        const deltaText = `${badge.delta > 0 ? '+' : ''}${badge.delta.toFixed(
          1
        )}%`;
        p.text(deltaText, left + width - 24, top + 18);
        p.pop();
      });
    };

    const drawControls = () => {
      const keys: ControlKey[] = ['cash', 'price', 'shares'];
      keys.forEach((key) => {
        const cfg = CONTROL_CONFIGS[key];
        const track = getTrackGeometry(key);
        const handle = getHandlePosition(key);
        p.push();
        p.stroke(33, 45, 71);
        p.strokeWeight(6);
        p.line(
          track.x - track.width / 2,
          track.y,
          track.x + track.width / 2,
          track.y
        );
        p.noStroke();
        p.fill(15, 23, 42);
        p.rect(handle.x - 60, handle.y - 28, 120, 56, 16);
        p.fill(226, 232, 255);
        p.textAlign(p.CENTER, p.CENTER);
        p.textSize(15);
        p.text(formatLabel(key, getControlValue(key)), handle.x, handle.y - 4);
        p.textSize(11);
        p.fill(94, 234, 212);
        p.text('drag me ↔', handle.x, handle.y - 24);

        p.textAlign(p.CENTER, p.TOP);
        p.fill(203, 213, 225);
        p.textSize(14);
        p.text(cfg.label, track.x, track.y + 18);
        p.fill(120, 141, 175);
        p.textSize(12);
        p.text(cfg.helper, track.x, track.y + 38);
        p.pop();
      });
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
      if (state.activeControl) {
        setControlFromPointer(state.activeControl, p.mouseX);
      }
    };

    p.mouseReleased = () => {
      state.activeControl = null;
    };

    p.touchStarted = () => {
      const activated = tryActivateHandle(p.mouseX, p.mouseY);
      return activated ? false : undefined;
    };

    p.touchMoved = () => {
      if (state.activeControl) {
        setControlFromPointer(state.activeControl, p.mouseX);
      }
      return false;
    };

    p.touchEnded = () => {
      state.activeControl = null;
      return false;
    };

    p.draw = () => {
      drawBackground();
      drawShareOrbit();
      drawEPSPanel();
      drawValuePanel();
      drawImpactBadges();
      drawControls();
    };
  }, []);

  return <P5Sketch sketch={sketch} className="rounded-2xl" />;
};

export { DilutionImpact2D };
export default DilutionImpact2D;
