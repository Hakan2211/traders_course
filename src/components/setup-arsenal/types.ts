import { ReactNode } from 'react';

export enum RiskLevel {
  LOW = 'Low Risk',
  MEDIUM = 'Medium Risk',
  HIGH = 'High Risk',
}

export enum SetupType {
  BREAKOUT = 'Breakout',
  MOMENTUM = 'Momentum',
  REVERSAL = 'Reversal',
  STRUCTURE = 'Structure',
  EVENT = 'Event/Special',
}

export enum TimeFrame {
  PRE_MARKET = 'Pre-Market (4-9:30)',
  OPEN = 'Open (9:30-10)',
  MORNING = 'Morning (10-11:30)',
  MIDDAY = 'Midday (11:30-2)',
  POWER_HOUR = 'Power Hour (2-4)',
  MULTI_DAY = 'Multi-Day/Daily',
}

export interface SetupData {
  id: number;
  name: string;
  description: string;
  type: SetupType;
  timeFrame: TimeFrame;
  risk: RiskLevel;
  position: [number, number, number]; // x, y, z coordinates for 3D
  color: string;
}

export interface AxisLabel {
  text: string;
  position: [number, number, number];
  rotation?: [number, number, number];
}

// Timeline Scrubber Types
export type TradeSide = 'Long' | 'Short' | 'Neutral' | 'Both';

export type ScrubberRiskLevel = 'Low' | 'Medium' | 'High';

export interface Setup {
  id: number;
  name: string;
  type: TradeSide;
  description: string;
  startTime: number; // Minutes from midnight (e.g., 9:30 AM = 570)
  endTime: number; // Minutes from midnight
  risk: ScrubberRiskLevel;
  category: string;
}

export interface TimeSegment {
  name: string;
  start: number;
  end: number;
  color: string;
  label: string;
}

// Simulation Types and Constants
export type ScenarioType = 'MATERIAL' | 'FLUFF';

export interface Candle {
  open: number;
  close: number;
  high: number;
  low: number;
  volume: number;
  timestamp: number;
}

export interface SimulationState {
  isPlaying: boolean;
  scenario: ScenarioType;
  frame: number;
  phase: string;
}

// Market Maker Game Types
export enum GameState {
  IDLE = 'IDLE',
  PLAYING = 'PLAYING',
  FINISHED = 'FINISHED',
}

export interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
}

export interface PricePoint {
  time: number;
  price: number;
}

export const CANVAS_WIDTH = 800;

export const CANVAS_HEIGHT = 500;

export const PARTICLES_COUNT = 150;

export const FRAMES_PER_CANDLE = 90; // Approx 1.5 seconds per candle for demo speed

// Physics Constants

export const LEVEL_LOW = 400;

export const LEVEL_RESISTANCE = 200;

export const LEVEL_HIGH = 50;

export const LEVEL_STOP_HUNT = 150; // A bit above resistance (for the trap)

// Cheat Sheet Types
export interface CheatSheetRiskLevel {
  level: 'Low' | 'Medium' | 'Medium-High' | 'High';
  value: 1 | 2 | 3 | 4 | 5; // 1-5 scale
}

export interface SetupDetail {
  label: string;
  value: string | ReactNode;
  highlightColor?: 'green' | 'red' | 'blue' | 'yellow' | 'default';
  fullWidth?: boolean;
  isProgress?: boolean;
  progressValue?: number; // 0-100
  isRisk?: boolean;
  riskValue?: number; // 1-5
}

export interface SetupConfig {
  title: string;
  type: 'long' | 'short';
  badgeText: string;
  details: SetupDetail[];
  checklistTitle: string;
  checklist: string[];
}

export interface LessonData {
  title: string;
  subtitle: string;
  longSetup: SetupConfig;
  shortSetup: SetupConfig;
}
