export enum TraderArchetype {
  SCALPER = 'Scalper',
  DAY_TRADER = 'Day Trader',
  SWING_TRADER = 'Swing Trader',
  POSITION_TRADER = 'Position Trader',
  GAMBLER = 'Gambler',
}

export interface GraveData {
  id: number;
  position: [number, number, number];
  rotation: [number, number, number];
  causeOfDeath: string;
  archetype: string;
  daysSurvived: number;
  lossAmount: string;
}
