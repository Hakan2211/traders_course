export type ScenarioType = 'WINNER' | 'LOSER';

export interface TradeResult {
  id: number;
  scenario: ScenarioType;
  pnl: number;
  duration: number; // in milliseconds
  outcome:
    | 'EARLY_EXIT'
    | 'FULL_TARGET'
    | 'STOPPED_OUT'
    | 'HELD_LOSS'
    | 'OPTIMAL_EXIT';
}

export interface GameState {
  status: 'INTRO' | 'PLAYING' | 'ROUND_SUMMARY' | 'GAME_SUMMARY';
  round: number;
  maxRounds: number;
  history: TradeResult[];
}

export interface ChartDataPoint {
  t: number;
  price: number;
}
