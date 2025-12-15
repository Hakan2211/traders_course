import { Asset, AssetType, CorrelationGroup, NodeVisuals } from './types';

export const AVAILABLE_ASSETS: Asset[] = [
  {
    id: 'eurusd',
    symbol: 'EUR/USD',
    name: 'Euro vs US Dollar',
    type: AssetType.FOREX,
    baseRisk: 1.0,
    correlationGroup: CorrelationGroup.USD_SHORT,
    description: 'Long Position',
  },
  {
    id: 'gbpusd',
    symbol: 'GBP/USD',
    name: 'Pound vs US Dollar',
    type: AssetType.FOREX,
    baseRisk: 1.0,
    correlationGroup: CorrelationGroup.USD_SHORT,
    description: 'Long Position',
  },
  {
    id: 'audusd',
    symbol: 'AUD/USD',
    name: 'Aussie vs US Dollar',
    type: AssetType.FOREX,
    baseRisk: 1.0,
    correlationGroup: CorrelationGroup.USD_SHORT,
    description: 'Long Position',
  },
  {
    id: 'usdjpy',
    symbol: 'USD/JPY',
    name: 'Dollar vs Yen',
    type: AssetType.FOREX,
    baseRisk: 1.0,
    correlationGroup: CorrelationGroup.USD_LONG,
    description: 'Long Position',
  },
  {
    id: 'gold',
    symbol: 'XAU/USD',
    name: 'Gold',
    type: AssetType.COMMODITY,
    baseRisk: 1.0,
    correlationGroup: CorrelationGroup.SAFE_HAVEN,
    description: 'Long Position',
  },
  {
    id: 'aapl',
    symbol: 'AAPL',
    name: 'Apple Inc.',
    type: AssetType.STOCK,
    baseRisk: 1.0,
    correlationGroup: CorrelationGroup.TECH,
    description: 'Long Position',
  },
  {
    id: 'msft',
    symbol: 'MSFT',
    name: 'Microsoft',
    type: AssetType.STOCK,
    baseRisk: 1.0,
    correlationGroup: CorrelationGroup.TECH,
    description: 'Long Position',
  },
  {
    id: 'nvda',
    symbol: 'NVDA',
    name: 'Nvidia',
    type: AssetType.STOCK,
    baseRisk: 1.0,
    correlationGroup: CorrelationGroup.TECH,
    description: 'Long Position',
  },
  {
    id: 'xom',
    symbol: 'XOM',
    name: 'Exxon Mobil',
    type: AssetType.STOCK,
    baseRisk: 1.0,
    correlationGroup: CorrelationGroup.ENERGY,
    description: 'Long Position',
  },
  {
    id: 'btc',
    symbol: 'BTC/USD',
    name: 'Bitcoin',
    type: AssetType.CRYPTO,
    baseRisk: 2.0, // Higher risk asset
    correlationGroup: CorrelationGroup.NONE, // For simplicity
    description: 'Long Position',
  },
];

export const MAX_HEAT = 15;
export const BREAK_POINT = 12;

export const ASSET_COLORS: Record<AssetType, NodeVisuals> = {
  [AssetType.FOREX]: { color: '#3b82f6', emissive: '#1d4ed8' }, // Blue
  [AssetType.STOCK]: { color: '#10b981', emissive: '#047857' }, // Green
  [AssetType.COMMODITY]: { color: '#f59e0b', emissive: '#b45309' }, // Amber
  [AssetType.CRYPTO]: { color: '#8b5cf6', emissive: '#6d28d9' }, // Purple
};
