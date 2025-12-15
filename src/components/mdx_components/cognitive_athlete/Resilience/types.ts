import { LucideIcon } from 'lucide-react';

export interface Stressor {
  id: string;
  label: string;
  value: number;
  icon: LucideIcon;
  color: string;
  description: string;
}

export type SystemStatus = 'OPTIMAL' | 'STRAINED' | 'CRITICAL' | 'FAILURE';
