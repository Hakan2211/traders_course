export interface BioHack {
  id: string;
  label: string;
  iconName: string; // Storing string name to map to icon component
  type: 'positive' | 'negative' | 'neutral';
  effects: {
    dopamine: number; // Motivation/Focus
    cortisol: number; // Stress
    alpha: number; // Calm/Flow Readiness
    flowScore: number; // Direct contribution to flow
  };
  description: string;
}

export interface TimelineSlot {
  time: string;
  item: BioHack | null;
}

export interface Stats {
  dopamine: number;
  cortisol: number;
  alpha: number;
  flowScore: number;
}

export type FlowState = 'boredom' | 'anxiety' | 'flow';

export interface ChemicalLevel {
  name: string;
  level: number; // 0-100
  color: string;
}

export interface MixerConfig {
  chemicals: ChemicalLevel[];
  glow: boolean;
  description: string;
}
