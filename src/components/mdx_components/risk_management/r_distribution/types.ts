export interface TradeStats {
  count: number;
  winRate: number;
  avgWin: number;
  avgLoss: number;
  expectancy: number;
  totalR: number;
  maxDrawdown: number; // In R
  profitFactor: number;
}

export interface BinData {
  range: string;
  value: number; // mid-point for sorting
  count: number;
  type: 'win' | 'loss' | 'neutral';
}

export interface Insight {
  id: string;
  title: string;
  description: string;
  type: 'success' | 'warning' | 'danger' | 'info';
  recommendation: string;
}

export interface Benchmark {
  winRate: number;
  avgWin: number;
  avgLoss: number;
  expectancy: number;
}

// Professional benchmark defaults
export const PRO_BENCHMARK: Benchmark = {
  winRate: 0.55, // 55%
  avgWin: 2.0, // 2R
  avgLoss: 1.0, // 1R
  expectancy: 0.65,
};
