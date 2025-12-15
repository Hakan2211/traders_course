export type AssetType = 'FOREX' | 'CRYPTO' | 'STOCK';

export interface Preset {
  label: string;
  assetType: AssetType;
  entry: number;
  atr: number;
  description: string;
}

export interface CalculatorState {
  entryPrice: number;
  atr: number;
  multiplier: number;
  direction: 'long' | 'short';
  accountSize: number;
  riskPercent: number;
  assetType: AssetType;
}

export interface CalculationResult {
  stopDistance: number;
  stopPrice: number;
  riskAmount: number;
  positionSize: number;
  leverage: number;
  isSafe: boolean;
  volatilityZone: 'LOW' | 'MODERATE' | 'HIGH' | 'EXTREME';
}
