export interface TableRowData {
  date: string;
  behavior: string;
  target: number;
  attempted: number;
  correct: number;
  successRate: string;
  notes: string;
}

export enum TimerPhase {
  Idle = 'IDLE',
  Rise = 'RISE',
  Crest = 'CREST',
  Crash = 'CRASH',
  Complete = 'COMPLETE',
}
