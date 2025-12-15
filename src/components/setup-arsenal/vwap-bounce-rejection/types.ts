export type ScenarioResult =
  | 'panic_sold_bounce'
  | 'held_bounce'
  | 'held_break'
  | 'held_break_late_exit';

export interface SimulationState {
  phase: 'idle' | 'approaching' | 'testing' | 'decision' | 'complete';
  currentPrice: number;
  candleClose: number; // The developing candle's current close
  candleLow: number;
  candleHigh: number;
  candleOpen: number;
  timeRemaining: number; // Seconds left in candle
  pnl: number;
  feedback: string | null;
  outcomeType: 'bounce' | 'break'; // Predetermined outcome of the simulation run
}
