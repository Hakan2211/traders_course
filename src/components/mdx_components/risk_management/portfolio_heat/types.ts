export enum AssetType {
  FOREX = 'FOREX',
  STOCK = 'STOCK',
  COMMODITY = 'COMMODITY',
  CRYPTO = 'CRYPTO',
}

export enum CorrelationGroup {
  USD_SHORT = 'USD_SHORT', // Long EUR/USD, GBP/USD etc
  USD_LONG = 'USD_LONG', // Short EUR/USD
  TECH = 'TECH',
  ENERGY = 'ENERGY',
  SAFE_HAVEN = 'SAFE_HAVEN',
  NONE = 'NONE',
}

export interface Asset {
  id: string;
  symbol: string;
  name: string;
  type: AssetType;
  baseRisk: number; // usually 1.0
  correlationGroup: CorrelationGroup;
  description: string;
}

export interface HeatState {
  currentHeat: number;
  baseHeat: number;
  penaltyHeat: number;
  status: 'SAFE' | 'CAUTION' | 'DANGER' | 'CRITICAL' | 'BROKEN';
  messages: string[];
}

// Risk Constellation Types

export interface Position {
  id: string;
  name: string;
  type: AssetType;
  risk: number; // 0.5 to 3.0 (percent)
  sector?: string;
}

export interface Correlation {
  source: string;
  target: string;
  value: number; // -1.0 to 1.0
}

export interface Scenario {
  id: string;
  name: string;
  description: string;
  positions: Position[];
  correlations: Correlation[];
}

export interface NodeVisuals {
  color: string;
  emissive: string;
}
