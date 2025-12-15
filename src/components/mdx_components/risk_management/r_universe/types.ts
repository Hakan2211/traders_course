export type Grade = 'A' | 'B' | 'C' | 'D';

export interface Trade {
  id: number;
  rMultiple: number;
  grade: Grade;
  date: string;
  pair: string;
  entry: number;
  exit: number;
  stop: number;
  risk: number;
  mae: number;
  mfe: number;
  type: string;
}

export interface FilterState {
  grades: Grade[];
  showOutliers: boolean;
  minR: number | null;
  maxR: number | null;
}

export interface Stats {
  totalTrades: number;
  totalR: number;
  expectancy: number;
  winRate: number;
  avgWin: number;
  avgLoss: number;
  largestWin: number;
  largestLoss: number;
}
