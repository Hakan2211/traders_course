export interface Waypoint {
  id: number;
  title: string;
  description: string;
  cameraPos: [number, number, number];
  target: [number, number, number];
  stats?: string;
  formula?: string;
  warning?: boolean;
}

export interface MarkerData {
  label: string;
  wr: number; // 0.2 to 0.8
  rr: number; // 0.5 to 5
  color: string;
}

export type TooltipData = {
  x: number;
  y: number;
  wr: number;
  rr: number;
  expectancy: number;
} | null;

export interface SimulationResult {
  equityCurve: number[];
  trades: boolean[]; // true = win, false = loss
  finalCapital: number;
  netProfitPct: number;
  maxDrawdownPct: number;
  longestLosingStreak: number;
  winCount: number;
  lossCount: number;
  expectancy: number;
  profitFactor: number;
}

export interface SimulationConfig {
  winRate: number; // 0.0 to 1.0
  rrRatio: number; // e.g., 2.5
  numTrades: number;
  startingCapital: number;
  riskPerTradePct: number; // 0.01 for 1%
}

export interface Preset {
  id: string;
  name: string;
  winRate: number;
  rrRatio: number;
  description: string;
}
