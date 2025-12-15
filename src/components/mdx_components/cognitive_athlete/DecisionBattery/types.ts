import { LucideIcon } from 'lucide-react';

export enum TaskCost {
  ZERO = 0,
  LOW = 5,
  MEDIUM = 10,
  HIGH = 15,
  EXTREME = 30,
}

export interface Task {
  id: string;
  name: string;
  description: string;
  cost: TaskCost;
  icon: LucideIcon;
  category: 'routine' | 'social' | 'mental';
}

export interface BatteryState {
  currentLevel: number;
  decisionsMade: number;
  status: 'Optimal' | 'Fatigued' | 'Critical';
}
