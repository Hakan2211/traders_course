
import { useEffect, useMemo, useState } from 'react';
import { motion, useSpring, useMotionTemplate } from 'framer-motion';

type ShortInterestDataPanelProps = {
  initialFloatSizeMillions?: number;
  initialShortInterestPct?: number;
  initialAvgDailyVolumeMillions?: number;
  initialBorrowFeePct?: number;
  initialUtilizationPct?: number;
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function formatMillions(value: number): string {
  return `${value.toFixed(1)}M`;
}

function calculateSqueezeScore(
  shortInterestPct: number,
  daysToCover: number,
  borrowFeePct: number,
  utilizationPct: number
): number {
  let score = 0;
  // Short interest contribution (0-3)
  if (shortInterestPct >= 40) score += 3;
  else if (shortInterestPct >= 25) score += 2;
  else if (shortInterestPct >= 15) score += 1;
  else score += shortInterestPct / 15;

  // Days to cover contribution (0-3)
  if (daysToCover >= 8) score += 3;
  else if (daysToCover >= 5) score += 2;
  else if (daysToCover >= 3) score += 1;
  else score += daysToCover / 3;

  // Borrow fee contribution (0-2)
  if (borrowFeePct >= 50) score += 2;
  else if (borrowFeePct >= 20) score += 1.5;
  else if (borrowFeePct >= 10) score += 1;
  else score += borrowFeePct / 10;

  // Utilization contribution (0-2)
  if (utilizationPct >= 90) score += 2;
  else if (utilizationPct >= 75) score += 1.5;
  else if (utilizationPct >= 50) score += 1;
  else score += utilizationPct / 50;

  return Math.min(score, 10);
}

function getRiskLevel(score: number): { label: string; color: string } {
  if (score >= 7.5) return { label: 'EXTREME RISK', color: 'text-red-400' };
  if (score >= 5.5) return { label: 'ELEVATED RISK', color: 'text-amber-400' };
  if (score >= 3.5) return { label: 'MODERATE RISK', color: 'text-yellow-300' };
  return { label: 'LOW RISK', color: 'text-emerald-400' };
}

function getValueColor(
  value: number,
  thresholds: { warn: number; danger: number },
  higherIsWorse = true
): string {
  if (higherIsWorse) {
    if (value >= thresholds.danger) return 'text-red-400';
    if (value >= thresholds.warn) return 'text-amber-400';
    return 'text-gray-200';
  } else {
    if (value <= thresholds.danger) return 'text-red-400';
    if (value <= thresholds.warn) return 'text-amber-400';
    return 'text-gray-200';
  }
}

export default function ShortInterestDataPanel({
  initialFloatSizeMillions = 159,
  initialShortInterestPct = 28.4,
  initialAvgDailyVolumeMillions = 7.3,
  initialBorrowFeePct = 12.5,
  initialUtilizationPct = 87.3,
}: ShortInterestDataPanelProps) {
  const [floatSize, setFloatSize] = useState<number>(initialFloatSizeMillions);
  const [shortInterestPct, setShortInterestPct] = useState<number>(
    initialShortInterestPct
  );
  const [avgVolume, setAvgVolume] = useState<number>(
    initialAvgDailyVolumeMillions
  );
  const [borrowFee, setBorrowFee] = useState<number>(initialBorrowFeePct);
  const [utilization, setUtilization] = useState<number>(initialUtilizationPct);

  const { shortInterestShares, daysToCover, squeezeScore } = useMemo(() => {
    const siShares = (floatSize * shortInterestPct) / 100;
    const dtcRaw = siShares / Math.max(avgVolume, 0.0001);
    const dtc = Number(dtcRaw.toFixed(1));
    const score = calculateSqueezeScore(
      shortInterestPct,
      dtc,
      borrowFee,
      utilization
    );
    return {
      shortInterestShares: siShares,
      daysToCover: dtc,
      squeezeScore: score,
    };
  }, [floatSize, shortInterestPct, avgVolume, borrowFee, utilization]);

  const risk = getRiskLevel(squeezeScore);
  const dtcPercent = clamp((daysToCover / 10) * 100, 0, 100);

  // Animated values
  const needleRotation = useSpring(-90, {
    stiffness: 120,
    damping: 20,
    mass: 0.6,
  });
  const dtcWidth = useSpring(0, {
    stiffness: 120,
    damping: 20,
    mass: 0.6,
  });
  const dtcWidthStyle = useMotionTemplate`${dtcWidth}%`;

  useEffect(() => {
    needleRotation.set(-90 + (squeezeScore / 10) * 180);
  }, [squeezeScore, needleRotation]);

  useEffect(() => {
    dtcWidth.set(dtcPercent);
  }, [dtcPercent, dtcWidth]);

  return (
    <div className="w-full rounded-2xl border border-gray-700/50 bg-gradient-to-br from-gray-950/90 via-gray-900/85 to-black/90 p-4 shadow-[0_15px_45px_rgba(0,0,0,0.6)]">
      <div className="mb-4 rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur">
        <h3 className="text-center text-lg font-semibold text-rose-400">
          📊 Reading the Shadow: Short Interest Data Panel
        </h3>
        <p className="mt-1 text-center text-sm text-gray-400">
          Real-world metrics that reveal the shadow float&apos;s size and
          squeeze potential
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Metrics Panel */}
        <div className="rounded-xl border border-white/10 bg-gradient-to-br from-slate-950/80 via-slate-900/80 to-gray-900/80 p-4 backdrop-blur transition-colors hover:border-rose-400/30">
          <div className="mb-3 flex items-center justify-between border-b border-white/10 pb-2">
            <div className="text-base font-semibold text-white">
              Shadow Float Metrics
            </div>
            <div className="rounded bg-white/5 px-2 py-0.5 text-[11px] text-gray-400">
              FINRA / Ortex
            </div>
          </div>

          <div className="divide-y divide-white/5">
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                Short Interest
                <span
                  className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-indigo-500/30 text-[10px] text-indigo-400"
                  title="Number of shares currently borrowed and sold short"
                >
                  ℹ
                </span>
              </div>
              <div className="flex items-center gap-2 text-xl font-bold text-red-400">
                <span>{formatMillions(shortInterestShares)}</span>
                <span className="rounded bg-red-500/20 px-1.5 py-0.5 text-xs font-semibold text-red-400">
                  ↑ 12%
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                % of Float Shorted
                <span
                  className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-indigo-500/30 text-[10px] text-indigo-400"
                  title="Percentage of available shares that are sold short"
                >
                  ℹ
                </span>
              </div>
              <div
                className={`text-xl font-bold ${getValueColor(
                  shortInterestPct,
                  {
                    warn: 20,
                    danger: 40,
                  }
                )}`}
              >
                {shortInterestPct.toFixed(1)}%
              </div>
            </div>

            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                Borrow Fee Rate
                <span
                  className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-indigo-500/30 text-[10px] text-indigo-400"
                  title="Annual cost to borrow shares - higher = harder to short"
                >
                  ℹ
                </span>
              </div>
              <div
                className={`text-xl font-bold ${getValueColor(borrowFee, {
                  warn: 15,
                  danger: 50,
                })}`}
              >
                {borrowFee.toFixed(1)}%
              </div>
            </div>

            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                Utilization Rate
                <span
                  className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-indigo-500/30 text-[10px] text-indigo-400"
                  title="% of available shares already lent out"
                >
                  ℹ
                </span>
              </div>
              <div
                className={`text-xl font-bold ${getValueColor(utilization, {
                  warn: 70,
                  danger: 90,
                })}`}
              >
                {utilization.toFixed(1)}%
              </div>
            </div>
          </div>

          {/* DTC visual */}
          <div className="mt-4 rounded-lg bg-black/30 p-4">
            <div className="text-xs text-gray-400">Days to Cover (DTC)</div>
            <div className="relative mt-2 h-7 w-full overflow-hidden rounded-full bg-white/5">
              <motion.div
                style={{ width: dtcWidthStyle }}
                className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-amber-400 to-red-400"
              />
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-bold text-gray-100 drop-shadow">
                  {daysToCover.toFixed(1)} days
                </span>
              </div>
            </div>
            <div className="mt-1 flex justify-between text-[10px] text-gray-500">
              <span>0</span>
              <span>Low Risk</span>
              <span>Moderate</span>
              <span>High Risk</span>
              <span>10+</span>
            </div>
            <div className="mt-3 rounded-md border border-indigo-400/30 bg-indigo-500/10 p-3 font-mono">
              <div className="text-[11px] uppercase tracking-wide text-indigo-300">
                Formula
              </div>
              <div className="text-[13px] text-indigo-200">
                Days to Cover = Short Interest ÷ Avg Daily Volume
              </div>
            </div>
          </div>
        </div>

        {/* Risk Panel */}
        <div className="rounded-xl border border-white/10 bg-gradient-to-br from-slate-950/80 via-slate-900/80 to-gray-900/80 p-4 backdrop-blur transition-colors hover:border-rose-400/30">
          <div className="mb-3 flex items-center justify-between border-b border-white/10 pb-2">
            <div className="text-base font-semibold text-white">
              Squeeze Risk Assessment
            </div>
            <div className="rounded bg-white/5 px-2 py-0.5 text-[11px] text-gray-400">
              Live Analysis
            </div>
          </div>

          {/* Gauge */}
          <div className="rounded-lg bg-black/30 p-4">
            <div className="text-center text-sm text-gray-400">
              Short Squeeze Probability
            </div>
            <div className="relative h-24">
              <svg className="mx-auto h-24 w-52" viewBox="0 0 200 100">
                <defs>
                  <linearGradient
                    id="gaugeGradient"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="0%"
                  >
                    <stop offset="0%" stopColor="#34d399" />
                    <stop offset="50%" stopColor="#f59e0b" />
                    <stop offset="100%" stopColor="#f87171" />
                  </linearGradient>
                </defs>
                <path
                  d="M 10 90 A 90 90 0 0 1 190 90"
                  fill="none"
                  stroke="url(#gaugeGradient)"
                  strokeWidth="15"
                  strokeLinecap="round"
                />
                <circle cx="100" cy="90" r="5" fill="#fff" />
              </svg>
              <motion.div
                className="absolute left-1/2 bottom-2 h-[72px] w-[2px] origin-bottom bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                style={{
                  rotate: needleRotation,
                  x: '-50%',
                }}
              />
            </div>
            <div className={`mt-2 text-center text-lg font-bold ${risk.color}`}>
              {risk.label}
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              Squeeze Score
              <span
                className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-indigo-500/30 text-[10px] text-indigo-400"
                title="Composite score based on SI%, DTC, borrow fee, and utilization"
              >
                ℹ
              </span>
            </div>
            <div className="flex items-center gap-1 text-xl font-bold text-amber-400">
              <span>{squeezeScore.toFixed(1)}</span>
              <span className="text-sm text-gray-500">/10</span>
            </div>
          </div>

          {/* Interpretation */}
          <div
            className={`mt-4 rounded-md border-l-4 p-3 text-sm leading-relaxed ${
              squeezeScore >= 7.5
                ? 'border-red-400 bg-red-500/15'
                : squeezeScore >= 5.5
                ? 'border-amber-400 bg-amber-500/15'
                : squeezeScore >= 3.5
                ? 'border-indigo-400 bg-indigo-500/15'
                : 'border-emerald-400 bg-emerald-500/15'
            }`}
          >
            <div
              className={`mb-1 text-[13px] font-bold uppercase ${
                squeezeScore >= 7.5
                  ? 'text-red-400'
                  : squeezeScore >= 5.5
                  ? 'text-amber-400'
                  : squeezeScore >= 3.5
                  ? 'text-indigo-300'
                  : 'text-emerald-300'
              }`}
            >
              {squeezeScore >= 7.5
                ? '🚨 What This Means'
                : squeezeScore >= 5.5
                ? '⚠️ What This Means'
                : squeezeScore >= 3.5
                ? '💡 What This Means'
                : '✅ What This Means'}
            </div>
            <div className="text-gray-200">
              {squeezeScore >= 7.5
                ? `EXTREME squeeze setup. With ${shortInterestPct.toFixed(
                    1
                  )}% of float short and ${daysToCover.toFixed(
                    1
                  )} days to cover, this is a powder keg. Borrow fees at ${borrowFee.toFixed(
                    1
                  )}% and ${utilization.toFixed(
                    1
                  )}% utilization show severe supply constraints. Any bullish catalyst could trigger a multi-day violent squeeze. Shorts are trapped.`
                : squeezeScore >= 5.5
                ? `With ${shortInterestPct.toFixed(
                    1
                  )}% of float short and ${daysToCover.toFixed(
                    1
                  )} days to cover, this stock shows elevated squeeze risk. ${
                    utilization >= 80
                      ? `High utilization (${utilization.toFixed(1)}%) and `
                      : ''
                  }${
                    borrowFee >= 10
                      ? `rising borrow fees (${borrowFee.toFixed(1)}%) `
                      : ''
                  }indicate difficulty finding shares to short. Any bullish catalyst could trigger forced buying.`
                : squeezeScore >= 3.5
                ? `Moderate short interest at ${shortInterestPct.toFixed(
                    1
                  )}% with ${daysToCover.toFixed(
                    1
                  )} days to cover. Some squeeze potential exists, but shorts have reasonable exit liquidity. Watch for increasing utilization or borrow fees as early warning signs.`
                : `Low squeeze risk. Short interest of ${shortInterestPct.toFixed(
                    1
                  )}% with only ${daysToCover.toFixed(
                    1
                  )} days to cover provides ample exit liquidity. Low borrow fees (${borrowFee.toFixed(
                    1
                  )}%) indicate shares are readily available. Shorts can cover without significant price impact.`}
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="mt-4 rounded-xl border border-white/10 bg-gradient-to-br from-slate-950/80 via-slate-900/80 to-gray-900/80 p-4 backdrop-blur">
        <h4 className="mb-4 text-rose-400">
          🎛️ Interactive Controls - Adjust Variables
        </h4>

        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm text-gray-300">
              Short Interest (% of Float)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={5}
                max={100}
                step={0.1}
                value={shortInterestPct}
                onChange={(e) =>
                  setShortInterestPct(parseFloat(e.target.value))
                }
                className="range range-xs w-full accent-rose-400 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-rose-400"
              />
              <span className="min-w-[64px] text-right font-semibold text-rose-400">
                {shortInterestPct.toFixed(1)}%
              </span>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm text-gray-300">
              Average Daily Volume (millions)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={1}
                max={50}
                step={0.1}
                value={avgVolume}
                onChange={(e) => setAvgVolume(parseFloat(e.target.value))}
                className="range range-xs w-full accent-rose-400 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-rose-400"
              />
              <span className="min-w-[64px] text-right font-semibold text-rose-400">
                {avgVolume.toFixed(1)}M
              </span>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm text-gray-300">
              Borrow Fee Rate (%)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={0.5}
                max={100}
                step={0.5}
                value={borrowFee}
                onChange={(e) => setBorrowFee(parseFloat(e.target.value))}
                className="range range-xs w-full accent-rose-400 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-rose-400"
              />
              <span className="min-w-[64px] text-right font-semibold text-rose-400">
                {borrowFee.toFixed(1)}%
              </span>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm text-gray-300">
              Utilization Rate (%)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={0}
                max={100}
                step={0.1}
                value={utilization}
                onChange={(e) => setUtilization(parseFloat(e.target.value))}
                className="range range-xs w-full accent-rose-400 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-rose-400"
              />
              <span className="min-w-[64px] text-right font-semibold text-rose-400">
                {utilization.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        {/* Optional: Float size adjuster, hidden by default but kept for flexibility */}
        <div className="mt-4 hidden">
          <label className="mb-2 block text-sm text-gray-300">
            Float Size (millions)
          </label>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={10}
              max={1000}
              step={1}
              value={floatSize}
              onChange={(e) => setFloatSize(parseFloat(e.target.value))}
              className="range range-xs w-full accent-rose-400 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-rose-400"
            />
            <span className="min-w-[64px] text-right font-semibold text-rose-400">
              {formatMillions(floatSize)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
