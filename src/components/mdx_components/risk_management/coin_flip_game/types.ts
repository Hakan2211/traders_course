export enum CoinSide {
  HEADS = 'HEADS',
  TAILS = 'TAILS',
}

export interface FlipResult {
  id: number;
  side: CoinSide;
  capitalBefore: number;
  capitalAfter: number;
  changePercent: number;
  expectedArithmetic: number; // The linear expectation
  isWin: boolean;
  betSize: number;
}

export interface GameState {
  capital: number;
  betSize: number; // Percentage 1-100
  history: FlipResult[];
  isFlipping: boolean;
  flipsRemaining: number;
  expectedArithmetic: number;
  gameStatus: 'idle' | 'playing' | 'finished';
}

export const CONSTANTS = {
  WIN_PCT: 0.5, // +50%
  LOSS_PCT: 0.4, // -40%
  STARTING_CAPITAL: 10000,
  ANIMATION_DURATION_MS: 1500,
};
