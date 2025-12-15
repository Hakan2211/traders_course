export type TradeSource = 'scenario' | 'manual';

export interface VWAPTrade {
  id: string;
  time: number;
  price: number;
  volume: number;
  source: TradeSource;
}

export interface AnchorPreset {
  id: string;
  label: string;
  description: string;
  color: string;
  startIndex: number;
  startTime: number;
}

export interface SessionStats {
  numerator: number;
  denominator: number;
  vwap: number;
  stdDev: number;
}

export interface AnchorSummary {
  id: string;
  label: string;
  vwap: number | null;
  activated: boolean;
}

export interface VWAPSeriesPoint {
  time: number;
  vwap: number;
  stdDev: number;
}

export interface AnchorSeries {
  id: string;
  label: string;
  color: string;
  startTime: number;
  description: string;
  activated: boolean;
  points: VWAPSeriesPoint[];
}

export function mergeTrades(
  scenarioTrades: VWAPTrade[],
  manualTrades: VWAPTrade[]
): VWAPTrade[] {
  const merged = [...scenarioTrades, ...manualTrades];
  merged.sort((a, b) => {
    if (a.time === b.time) {
      return a.price - b.price;
    }
    return a.time - b.time;
  });
  return merged;
}

export function computeSessionSeries(trades: VWAPTrade[]): VWAPSeriesPoint[] {
  const series: VWAPSeriesPoint[] = [];
  if (!trades.length) return series;

  let sumVolume = 0;
  let weightedPriceSum = 0;
  let mean = 0;
  let m2 = 0;

  trades.forEach((trade) => {
    const { volume, price, time } = trade;
    const vol = Math.max(volume, 0);
    if (vol === 0) {
      series.push({
        time,
        vwap: sumVolume > 0 ? weightedPriceSum / sumVolume : price,
        stdDev: sumVolume > 0 ? Math.sqrt(Math.max(m2 / sumVolume, 0)) : 0,
      });
      return;
    }

    weightedPriceSum += price * vol;
    const prevVolume = sumVolume;
    sumVolume += vol;

    if (sumVolume > 0) {
      const delta = price - mean;
      mean += (vol / sumVolume) * delta;
      const delta2 = price - mean;
      m2 += vol * delta * delta2;
    }

    const variance = sumVolume > 0 ? m2 / sumVolume : 0;
    const vwap = sumVolume > 0 ? weightedPriceSum / sumVolume : price;

    series.push({
      time,
      vwap,
      stdDev: Math.sqrt(Math.max(variance, 0)),
    });
  });

  return series;
}

export function computeSessionStats(trades: VWAPTrade[]): SessionStats {
  if (!trades.length) {
    return {
      numerator: 0,
      denominator: 0,
      vwap: 0,
      stdDev: 0,
    };
  }

  let numerator = 0;
  let denominator = 0;
  trades.forEach((trade) => {
    numerator += trade.price * trade.volume;
    denominator += trade.volume;
  });

  const series = computeSessionSeries(trades);
  const lastPoint = series[series.length - 1];

  return {
    numerator,
    denominator,
    vwap: denominator > 0 ? numerator / denominator : 0,
    stdDev: lastPoint?.stdDev ?? 0,
  };
}

export function computeAnchorSeries(
  trades: VWAPTrade[],
  anchors: AnchorPreset[]
): Record<string, AnchorSeries> {
  const seriesMap: Record<string, AnchorSeries> = {};
  anchors.forEach((anchor) => {
    seriesMap[anchor.id] = {
      id: anchor.id,
      label: anchor.label,
      color: anchor.color,
      startTime: anchor.startTime,
      description: anchor.description,
      activated: false,
      points: [],
    };
  });

  if (!trades.length || !anchors.length) {
    return seriesMap;
  }

  anchors.forEach((anchor) => {
    const filtered = trades.filter((trade) => trade.time >= anchor.startTime);
    if (!filtered.length) {
      seriesMap[anchor.id].points = [];
      return;
    }
    const points = computeSessionSeries(filtered);
    seriesMap[anchor.id].points = points;
    seriesMap[anchor.id].activated = true;
  });

  return seriesMap;
}

export function anchorSummariesFromSeries(
  seriesMap: Record<string, AnchorSeries>
): AnchorSummary[] {
  return Object.values(seriesMap).map((entry) => {
    const lastPoint =
      entry.points.length > 0 ? entry.points[entry.points.length - 1] : null;
    return {
      id: entry.id,
      label: entry.label,
      vwap: lastPoint?.vwap ?? null,
      activated: entry.activated,
    };
  });
}

export function clampTradeTime(
  candidate: number,
  minTime: number,
  maxTime: number
): number {
  if (!Number.isFinite(candidate)) return minTime;
  return Math.min(Math.max(candidate, minTime), maxTime);
}
