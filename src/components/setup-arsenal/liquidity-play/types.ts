export interface OrderRow {
  id: string;
  price: number;
  shares: number;
  cumulative?: number;
  filled?: boolean;
  partialFill?: number;
}

export interface SimulationResult {
  averageEntry: number;
  totalCost: number;
  slippagePercent: number;
  sharesFilled: number;
  finalPrice: number;
}

export type ScenarioType = 'DAY_1' | 'DAY_3';
