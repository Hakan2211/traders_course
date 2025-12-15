export type Trait =
  | 'Speed'
  | 'Patience'
  | 'Risk Tolerance'
  | 'Discipline'
  | 'Creativity'
  | 'Stress Tolerance';

export interface ProfileData {
  Speed: number;
  Patience: number;
  'Risk Tolerance': number;
  Discipline: number;
  Creativity: number;
  'Stress Tolerance': number;
}

export interface Strategy {
  id: string;
  name: string;
  description: string;
  profile: ProfileData;
}

export interface ChartDataPoint {
  trait: string;
  userValue: number;
  strategyValue: number;
  fullMark: number;
}

export enum Chronotype {
  LION = 'Lion',
  BEAR = 'Bear',
  WOLF = 'Wolf',
  DOLPHIN = 'Dolphin',
}

export interface MarketSession {
  name: string;
  utcStart: number; // Hour in UTC (0-23.99)
  utcEnd: number; // Hour in UTC
  color: string;
}

export interface Timezone {
  label: string;
  offset: number; // Offset from UTC in hours
}

export interface ChronotypeProfile {
  name: Chronotype;
  description: string;
  peakWindows: { start: number; end: number }[]; // Local time windows
  advice: string;
}

// New types for NeuroAvatarBuilder
export interface Traits {
  openness: number;
  conscientiousness: number;
  extraversion: number;
  agreeableness: number;
  neuroticism: number;
  dopamine: number;
  riskTolerance: number;
}

export interface Archetype {
  name: string;
  description: string;
  color: string;
  skills: string[];
  weaknesses: string[];
}

export const INITIAL_TRAITS: Traits = {
  openness: 5,
  conscientiousness: 5,
  extraversion: 5,
  agreeableness: 5,
  neuroticism: 5,
  dopamine: 5,
  riskTolerance: 5,
};
