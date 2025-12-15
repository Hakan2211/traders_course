export type Mode = 'predator' | 'survivor';

export type GameResult = 'win' | 'loss' | 'survived' | 'hunted' | 'stopped';

export interface PriceLevel {
  price: number;
  stopCount: number;
  isSupport: boolean;
  isResistance: boolean;
  isHunted: boolean;
}

export interface GameHistoryItem {
  round: number;
  mode: Mode;
  result: GameResult;
  profit: number;
  description: string;
  targetPrice?: number;
  stopPrice?: number;
  huntLow?: number;
}

export interface GameState {
  capital: number;
  score: number;
  round: number;
  history: GameHistoryItem[];
}

export const PIP_VALUE = 0.0001;
export const SUPPORT_LEVEL = 1.1;
export const CURRENT_PRICE = SUPPORT_LEVEL + 10 * PIP_VALUE;
