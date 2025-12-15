export type Phase =
  | 'INTRO'
  | 'ACT1_IDLE'
  | 'ACT1_TRADE'
  | 'ACT1_LOSS'
  | 'ACT1_CHOICE'
  | 'ACT2_IDLE'
  | 'ACT2_TRADE'
  | 'ACT2_LOSS'
  | 'ACT2_CHOICE'
  | 'SPIRAL_Start'
  | 'SPIRAL_ACTIVE'
  | 'AFTERMATH_GOOD'
  | 'AFTERMATH_BAD';

export type EmotionalState =
  | 'CALM'
  | 'ANXIOUS'
  | 'ANGRY'
  | 'RAGE'
  | 'DESTROYED';

export interface Trade {
  id: number;
  pair: string;
  type: 'LONG' | 'SHORT';
  entry: number;
  exit: number;
  pnl: number;
  pnlPercent: number;
  timestamp: string;
}

export interface SimulationState {
  balance: number;
  startBalance: number;
  phase: Phase;
  emotion: EmotionalState;
  trades: Trade[];
  stressLevel: number; // 0 to 100, controls visual distortion
}
