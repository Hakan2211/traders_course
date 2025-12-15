import { TradeStats, BinData, Insight, Benchmark } from './types';

export const calculateStats = (trades: number[]): TradeStats => {
  if (trades.length === 0) {
    return {
      count: 0,
      winRate: 0,
      avgWin: 0,
      avgLoss: 0,
      expectancy: 0,
      totalR: 0,
      maxDrawdown: 0,
      profitFactor: 0,
    };
  }

  const wins = trades.filter((t) => t > 0);
  const losses = trades.filter((t) => t <= 0); // Treating 0 as non-win/loss for strict R calc usually, but fitting simple model here
  const totalR = trades.reduce((acc, curr) => acc + curr, 0);

  // Calculate Drawdown in R
  let currentDd = 0;
  let maxDd = 0;
  let peak = 0;
  let runningTotal = 0;

  trades.forEach((r) => {
    runningTotal += r;
    if (runningTotal > peak) peak = runningTotal;
    const dd = peak - runningTotal;
    if (dd > maxDd) maxDd = dd;
  });

  const avgWin =
    wins.length > 0 ? wins.reduce((a, b) => a + b, 0) / wins.length : 0;
  const absLossTotal = losses.reduce((a, b) => a + Math.abs(b), 0);
  const avgLoss = losses.length > 0 ? absLossTotal / losses.length : 0;

  const profitFactor =
    absLossTotal === 0
      ? wins.length > 0
        ? 999
        : 0
      : wins.reduce((a, b) => a + b, 0) / absLossTotal;

  // Expectancy = (WinRate * AvgWin) - (LossRate * AvgLoss)
  // Or simply Average R per trade
  const expectancy = totalR / trades.length;

  return {
    count: trades.length,
    winRate: wins.length / trades.length,
    avgWin,
    avgLoss,
    expectancy,
    totalR,
    maxDrawdown: maxDd,
    profitFactor,
  };
};

export const generateHistogramData = (trades: number[]): BinData[] => {
  const map = new Map<number, number>();

  // Bin size 0.5
  trades.forEach((r) => {
    // Clamp extreme values for visualization cleanliness, or keep raw?
    // Let's bin by 0.5.  -1.2 becomes -1.5 bin or -1.0?
    // Simple rounding to nearest 0.5
    const bin = Math.round(r * 2) / 2;
    map.set(bin, (map.get(bin) || 0) + 1);
  });

  // Ensure we have a range from min to max, filling zeros
  if (map.size === 0) return [];

  const keys = Array.from(map.keys()).sort((a, b) => a - b);
  const min = Math.min(-2, ...keys); // Force showing at least -2
  const max = Math.max(3, ...keys); // Force showing at least +3

  const result: BinData[] = [];

  for (let i = min; i <= max; i += 0.5) {
    const val = map.get(i) || 0;
    result.push({
      range: i > 0 ? `+${i}R` : `${i}R`,
      value: i,
      count: val,
      type: i > 0 ? 'win' : i < 0 ? 'loss' : 'neutral',
    });
  }

  return result;
};

export const analyzeDistribution = (
  stats: TradeStats,
  trades: number[]
): Insight[] => {
  const insights: Insight[] = [];

  if (stats.count < 10) return insights;

  // 1. Stop Discipline Check
  // Check if huge outliers in losses exist
  const hugeLosses = trades.filter((t) => t < -1.2);
  if (hugeLosses.length > 0) {
    insights.push({
      id: 'discipline',
      title: 'Stop Loss Warning',
      type: 'danger',
      description: `You have ${hugeLosses.length} losses exceeding -1.2R.`,
      recommendation:
        'Strictly adhere to your 1R stop loss. Do not widen stops.',
    });
  } else if (stats.avgLoss >= 0.9 && stats.avgLoss <= 1.1) {
    insights.push({
      id: 'perfect-loss',
      title: 'The Perfect Loss',
      type: 'success',
      description: `Your average loss is ${stats.avgLoss.toFixed(
        2
      )}R, very close to 1R.`,
      recommendation: 'Excellent discipline. Keep taking "perfect losses".',
    });
  }

  // 2. Early Exit Check
  // If Winrate is high but Expectancy is low, or Avg Win is small
  if (stats.winRate > 0.6 && stats.avgWin < 1.2) {
    insights.push({
      id: 'early-exit',
      title: 'Possible Early Exits',
      type: 'warning',
      description: `High win rate (${(stats.winRate * 100).toFixed(
        1
      )}%) but low average win (${stats.avgWin.toFixed(1)}R).`,
      recommendation:
        'Try using a trailing stop to capture larger runners (MFE).',
    });
  }

  // 3. Profitability Check
  if (stats.expectancy > 0.4) {
    insights.push({
      id: 'profitable',
      title: 'Professional Edge',
      type: 'success',
      description: `Your expectancy of ${stats.expectancy.toFixed(
        2
      )}R is solid.`,
      recommendation:
        'Focus on increasing trade frequency (Opportunity) without lowering quality.',
    });
  } else if (stats.expectancy < 0) {
    insights.push({
      id: 'unprofitable',
      title: 'Negative Expectancy',
      type: 'danger',
      description:
        'You are currently losing money on every trade statistically.',
      recommendation:
        'Stop trading real capital. Review your strategy or position sizing.',
    });
  }

  return insights;
};

// Generates simulated data for a "Scenario"
export const generateScenarioData = (
  type: 'pro' | 'newbie' | 'gambler'
): number[] => {
  const data: number[] = [];
  let count = 50;

  if (type === 'pro') {
    // 50% WR, 2R winners, strict 1R losers
    for (let i = 0; i < count; i++) {
      if (Math.random() > 0.5)
        data.push(1 + Math.random() * 2); // 1R to 3R wins
      else data.push(-1); // Strict loss
    }
  } else if (type === 'newbie') {
    // 60% WR, but small wins and big losses
    for (let i = 0; i < count; i++) {
      if (Math.random() > 0.4)
        data.push(0.5 + Math.random() * 0.5); // 0.5R to 1R wins
      else data.push(-1 - Math.random()); // -1R to -2R losses
    }
  } else {
    // Gambler: Low WR, Huge wins, Huge losses
    for (let i = 0; i < count; i++) {
      if (Math.random() > 0.7) data.push(3 + Math.random() * 5);
      else data.push(-1 - Math.random() * 2);
    }
  }
  return data;
};
