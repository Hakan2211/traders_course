export type Grade = 'A' | 'B' | 'C' | 'D';

export type Outcome = 'WIN' | 'LOSS' | 'BE';

export interface Trade {
  id: string;
  date: string;
  pair: string;
  direction: 'Long' | 'Short';
  entry: number;
  stop: number;
  exit: number;
  risk: number; // in dollars
  rMultiple: number;
  mae: number; // Positive number representing R distance against
  mfe: number; // Positive number representing R distance in favor
  grade: Grade;
  outcome: Outcome;
  setupType: string;
  notes?: string;
}

export interface QuadrantStats {
  label: string;
  count: number;
  percentage: number;
  description: string;
  color: string;
}

export interface Diagnostic {
  title: string;
  severity: 'high' | 'medium' | 'low';
  evidence: string;
  cost: string;
  fix: string;
}
