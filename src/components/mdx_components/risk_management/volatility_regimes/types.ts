export const Regime = {
  CALM: 'CALM',
  NORMAL: 'NORMAL',
  VOLATILE: 'VOLATILE',
  CRISIS: 'CRISIS',
} as const;

export type Regime = (typeof Regime)[keyof typeof Regime];

export interface MarketState {
  atrMultiplier: number; // 0.5 to 5.0
  vix: number; // 10 to 90
  regime: Regime;
  scenarioName: string;
}

export interface TraderStats {
  pnl: number;
  drawdown: number;
  survived: boolean;
}

export interface MarketEvent {
  year: number;
  name: string;
  sigma: number; // Standard deviations from mean
  description: string;
  actualDrop: string;
}

export interface SimulationResult {
  triggered: boolean;
  gapSize: number; // in sigma
  lossMultiplier: number; // how many times larger than planned risk
  event: MarketEvent;
}

export enum TabMode {
  TIMELINE = 'TIMELINE',
  SIMULATOR = 'SIMULATOR',
  RANDOM = 'RANDOM',
}
