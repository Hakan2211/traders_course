export type Candle = {
  open: number;
  close: number;
  high: number;
  low: number;
  x: number;
  volume: number;
};

export type GameState =
  | 'waiting'
  | 'playing'
  | 'entered'
  | 'won'
  | 'lost'
  | 'missed';

export interface SketchProps {
  onGameStateChange: (state: GameState) => void;
  onFeedbackChange: (feedback: string) => void;
  triggerShort: boolean;
  onResetTrigger: () => void;
}
