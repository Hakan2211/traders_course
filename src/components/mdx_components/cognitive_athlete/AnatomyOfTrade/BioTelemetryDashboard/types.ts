import React from 'react';

export interface Metrics {
  hr: number;
  cortisol: number; // 0-100 scale
  dopamine: number; // 0-100 scale
}

export type BrainRegion = 'PFC' | 'Amygdala' | 'Hippocampus' | 'None';

export type BrainStatus =
  | 'Calm'
  | 'Activated'
  | 'Hijacked'
  | 'Recovering'
  | 'Offline';

export interface ChartPoint {
  time: string;
  price: number;
  annotation?: string;
  stageId?: number;
}

export interface StageData {
  id: number;
  title: string;
  subtitle: string;
  content: React.ReactNode;
  metrics: Metrics;
  brain: {
    activeRegion: BrainRegion;
    status: BrainStatus;
  };
  chartEndIndex: number; // Index in the chart data array to stop rendering
  isCrisis?: boolean;
  isIntervention?: boolean;
}
