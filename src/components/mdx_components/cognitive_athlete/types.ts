export type BreathingMode = '4-7-8' | 'physiological-sigh';

export type BreathingPhase =
  | 'idle'
  | 'inhale'
  | 'inhale-short'
  | 'hold'
  | 'exhale';

export interface BreathingConfig {
  inhaleDuration: number;
  inhaleShortDuration?: number; // Only for sigh
  holdDuration: number;
  exhaleDuration: number;
  name: string;
  description: string;
}

export enum CrashState {
  NORMAL = 'normal',
  GUT_SHOCK = 'gut-shock',
  TRANSMITTING = 'transmitting',
  BRAIN_SHOCK = 'brain-shock',
  RECOVERY = 'recovery',
}

export interface Symptom {
  id: string;
  title: string;
  description: string;
}

export enum RiskLevel {
  PROCESS_MODE = 'PROCESS_MODE', // 0-2
  TOLERANCE_BUILDING = 'TOLERANCE_BUILDING', // 3-5
  CASINO_MODE = 'CASINO_MODE', // 6-9
}

export interface CandleData {
  id: number;
  open: number;
  close: number;
  high: number;
  low: number;
}

export interface HormonalState {
  zone: 'CORTISOL' | 'OPTIMAL' | 'TESTOSTERONE';
  label: string;
  description: string;
  recommendedSize: number;
  color: string;
  icon: string;
  warning?: string;
}

export interface ChartDataPoint {
  arousal: number;
  size: number;
}

export const SYMPTOMS: Symptom[] = [
  {
    id: 'preoccupation',
    title: 'Preoccupation',
    description:
      'Thinking about trading significantly even when not trading (planning, replaying, fantasizing).',
  },
  {
    id: 'tolerance',
    title: 'Tolerance',
    description:
      'Needing to trade more frequently or in larger sizes to achieve the same level of excitement.',
  },
  {
    id: 'withdrawal',
    title: 'Withdrawal',
    description:
      'Feeling restless, irritable, or anxious on days you cannot trade.',
  },
  {
    id: 'escape',
    title: 'Escape',
    description:
      'Trading to escape from life problems or relieve negative feelings (guilt, anxiety, depression).',
  },
  {
    id: 'chasing',
    title: 'Chasing',
    description:
      'Feeling compelled to trade again quickly after a loss to "get even".',
  },
  {
    id: 'lying',
    title: 'Lying',
    description:
      'Hiding the extent of your trading or losses from family and friends.',
  },
  {
    id: 'loss_of_control',
    title: 'Loss of Control',
    description: "Have you tried to cut back or stop trading but couldn't?",
  },
  {
    id: 'relationship_damage',
    title: 'Relationship Damage',
    description:
      'Has trading caused conflict or distance in important relationships?',
  },
  {
    id: 'financial_jeopardy',
    title: 'Financial Jeopardy',
    description:
      "Have you risked money you couldn't afford to lose or jeopardized opportunities?",
  },
];
