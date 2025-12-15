export type RiskLevel =
  | 'safe'
  | 'caution'
  | 'danger'
  | 'extreme'
  | 'RUIN'
  | 'SAFE'
  | 'DANGER'
  | 'CAUTION';

export interface PresetConfig {
  name: string;
  risk: number;
  winRate: number;
  rr: number;
  description: string;
}

export interface SimulationStats {
  riskOfRuinProb: number;
  survivalTradeCount: number;
  expectedValue: number;
  riskLevel: RiskLevel;
}

export interface SimulationPoint {
  trade: number;
  balance: number;
}

export interface SimulationResult {
  runId: number;
  path: SimulationPoint[];
  survived: boolean;
  tradesSurvived: number;
}

export type CalculatorMode = 'BASIC' | 'ATR' | 'KELLY' | 'SCORE';

export interface CalculatorState {
  accountSize: number;
  riskPercent: number;
  entryPrice: number;
  stopLoss: number;
  atrValue: number;
  atrMultiplier: number;
  winRate: number;
  rewardRatio: number;
  kellyFraction: number;
  riskScore: number;
}

export interface CalculationResult {
  riskAmount: number;
  positionSize: number;
  totalPositionValue: number;
  leverageUsed: number;
  stopDistance: number;
  riskLevel: RiskLevel;
  message: string;
}

export interface RiskScoreItem {
  id: string;
  label: string;
  checked: boolean;
  points: number;
}

export interface PortfolioItem {
  id: string;
  symbol: string;
  riskAmount: number;
  percentRisk: number;
}
