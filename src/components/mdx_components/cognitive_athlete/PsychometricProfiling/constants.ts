import {
  Strategy,
  ProfileData,
  MarketSession,
  Timezone,
  Chronotype,
  ChronotypeProfile,
} from './types';

export const INITIAL_USER_PROFILE: ProfileData = {
  Speed: 5,
  Patience: 5,
  'Risk Tolerance': 5,
  Discipline: 5,
  Creativity: 5,
  'Stress Tolerance': 5,
};

export const STRATEGIES: Strategy[] = [
  {
    id: 'scalping',
    name: 'Scalping',
    description: 'High-frequency trades seeking small price changes.',
    profile: {
      Speed: 10,
      Patience: 2,
      'Risk Tolerance': 8,
      Discipline: 9, // Execution discipline
      Creativity: 2, // Robotic execution preferred
      'Stress Tolerance': 9,
    },
  },
  {
    id: 'swing',
    name: 'Swing Trading',
    description: 'Holding positions for days to weeks to capture trends.',
    profile: {
      Speed: 3,
      Patience: 9,
      'Risk Tolerance': 6,
      Discipline: 8, // Patience discipline
      Creativity: 5,
      'Stress Tolerance': 6,
    },
  },
  {
    id: 'day_trading',
    name: 'Day Trading',
    description: 'Opening and closing positions within the same trading day.',
    profile: {
      Speed: 8,
      Patience: 5,
      'Risk Tolerance': 7,
      Discipline: 9,
      Creativity: 3,
      'Stress Tolerance': 8,
    },
  },
  {
    id: 'systematic',
    name: 'Algo/Systematic',
    description: 'Strict rule-based or automated trading.',
    profile: {
      Speed: 1, // The system is fast, the human doesn't need to be
      Patience: 10, // Waiting for the system to work
      'Risk Tolerance': 5,
      Discipline: 10, // Adhering to the system absolutely
      Creativity: 1, // Creativity kills systems
      'Stress Tolerance': 4,
    },
  },
  {
    id: 'discretionary',
    name: 'Discretionary Macro',
    description:
      'Trading based on analysis of market conditions and intuition.',
    profile: {
      Speed: 4,
      Patience: 7,
      'Risk Tolerance': 6,
      Discipline: 6,
      Creativity: 9, // Needs out-of-the-box thinking
      'Stress Tolerance': 6,
    },
  },
];

export const MARKETS: MarketSession[] = [
  { name: 'London', utcStart: 8, utcEnd: 16.5, color: '#3b82f6' }, // 8:00 - 16:30 UTC
  { name: 'New York', utcStart: 13.5, utcEnd: 20, color: '#ef4444' }, // 9:30 - 16:00 EST (UTC-4/5 approx, simplify to 13:30 UTC for standard)
  { name: 'Tokyo', utcStart: 0, utcEnd: 6, color: '#eab308' }, // 9:00 - 15:00 JST -> 00:00 - 06:00 UTC
  { name: 'Sydney', utcStart: 22, utcEnd: 5, color: '#a855f7' }, // 9:00 - 16:00 AEDT -> 22:00 - 05:00 UTC
];

export const TIMEZONES: Timezone[] = [
  { label: 'UTC (London)', offset: 0 },
  { label: 'EST (New York)', offset: -5 },
  { label: 'PST (Los Angeles)', offset: -8 },
  { label: 'CST (Chicago)', offset: -6 },
  { label: 'CET (Berlin)', offset: 1 },
  { label: 'JST (Tokyo)', offset: 9 },
  { label: 'AEDT (Sydney)', offset: 11 },
  { label: 'IST (India)', offset: 5.5 },
];

export const CHRONOTYPES: Record<Chronotype, ChronotypeProfile> = {
  [Chronotype.LION]: {
    name: Chronotype.LION,
    description: 'Early riser. Peak energy in the morning, crash in afternoon.',
    peakWindows: [{ start: 6, end: 12 }],
    advice:
      'Attack the market open. Avoid late afternoon decisions. You are built for the Opening Bell.',
  },
  [Chronotype.BEAR]: {
    name: Chronotype.BEAR,
    description: 'The norm. Steady energy mid-morning to early evening.',
    peakWindows: [{ start: 9, end: 17 }],
    advice:
      'You can trade the full session, but guard your energy around lunch (1-2 PM dip). Consistency is your edge.',
  },
  [Chronotype.WOLF]: {
    name: Chronotype.WOLF,
    description: 'Late riser. Groggy morning, peaks in afternoon/evening.',
    peakWindows: [{ start: 13, end: 21 }],
    advice:
      "DO NOT trade the 9:30 AM Open if you're foggy. Your brain turns on after lunch. Hunt the close or Asian session.",
  },
  [Chronotype.DOLPHIN]: {
    name: Chronotype.DOLPHIN,
    description: 'Irregular sleep. Wired and tired. Short bursts of focus.',
    peakWindows: [
      { start: 10, end: 12 },
      { start: 16, end: 18 },
    ],
    advice:
      "Avoid long sessions. Your biology favors precision strikes. Trade specific setups, then walk away. Don't linger.",
  },
};
