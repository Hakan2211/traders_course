import { AssetType, Position, Correlation, Scenario } from './types';

export const SCENARIOS: Scenario[] = [
  {
    id: 'mike_disaster',
    name: "Mike's Disaster",
    description:
      'High correlation trap. 12 positions that look diverse but are all short USD or Tech.',
    positions: [
      { id: 'eurusd', name: 'EUR/USD', type: AssetType.FOREX, risk: 1.0 },
      { id: 'gbpusd', name: 'GBP/USD', type: AssetType.FOREX, risk: 1.0 },
      { id: 'audusd', name: 'AUD/USD', type: AssetType.FOREX, risk: 1.0 },
      { id: 'nzdusd', name: 'NZD/USD', type: AssetType.FOREX, risk: 1.0 },
      { id: 'eurgbp', name: 'EUR/GBP', type: AssetType.FOREX, risk: 1.0 },
      { id: 'eurjpy', name: 'EUR/JPY', type: AssetType.FOREX, risk: 1.0 },
      { id: 'aapl', name: 'AAPL', type: AssetType.STOCK, risk: 1.0 },
      { id: 'msft', name: 'MSFT', type: AssetType.STOCK, risk: 1.0 },
      { id: 'googl', name: 'GOOGL', type: AssetType.STOCK, risk: 1.0 },
      { id: 'tsla', name: 'TSLA', type: AssetType.STOCK, risk: 1.0 },
      { id: 'nvda', name: 'NVDA', type: AssetType.STOCK, risk: 1.0 },
      { id: 'gold', name: 'Gold', type: AssetType.COMMODITY, risk: 1.0 },
    ],
    correlations: [
      // Forex Cluster (USD Short)
      { source: 'eurusd', target: 'gbpusd', value: 0.85 },
      { source: 'eurusd', target: 'audusd', value: 0.75 },
      { source: 'eurusd', target: 'nzdusd', value: 0.7 },
      { source: 'gbpusd', target: 'audusd', value: 0.65 },
      // Tech Cluster
      { source: 'aapl', target: 'msft', value: 0.8 },
      { source: 'aapl', target: 'googl', value: 0.75 },
      { source: 'msft', target: 'nvda', value: 0.85 },
      { source: 'tsla', target: 'nvda', value: 0.65 },
      // Cross Cluster (Risk On)
      { source: 'eurusd', target: 'aapl', value: 0.4 },
    ],
  },
  {
    id: 'diversified',
    name: 'True Diversification',
    description:
      'Uncorrelated assets across different sectors and classes. The Fortress Walls are strong.',
    positions: [
      { id: 'eurusd', name: 'EUR/USD', type: AssetType.FOREX, risk: 1.0 },
      { id: 'jpm', name: 'JPM', type: AssetType.STOCK, risk: 1.0 },
      { id: 'xom', name: 'XOM', type: AssetType.STOCK, risk: 1.0 },
      { id: 'gold', name: 'Gold', type: AssetType.COMMODITY, risk: 1.0 },
      { id: 'btc', name: 'BTC', type: AssetType.CRYPTO, risk: 0.5 },
      { id: 'pfe', name: 'PFE', type: AssetType.STOCK, risk: 1.0 },
    ],
    correlations: [
      { source: 'eurusd', target: 'gold', value: 0.2 },
      { source: 'jpm', target: 'xom', value: 0.35 },
      { source: 'gold', target: 'btc', value: 0.15 },
      { source: 'eurusd', target: 'jpm', value: 0.1 },
    ],
  },
  {
    id: 'usd_trap',
    name: 'The USD Trap',
    description:
      'Visualizing how multiple pairs create one massive single-currency exposure.',
    positions: [
      { id: 'eurusd', name: 'EUR/USD', type: AssetType.FOREX, risk: 1.0 },
      { id: 'gbpusd', name: 'GBP/USD', type: AssetType.FOREX, risk: 1.0 },
      { id: 'audusd', name: 'AUD/USD', type: AssetType.FOREX, risk: 1.0 },
      { id: 'nzdusd', name: 'NZD/USD', type: AssetType.FOREX, risk: 1.0 },
      { id: 'usdcad', name: 'USD/CAD', type: AssetType.FOREX, risk: 1.0 },
    ],
    correlations: [
      { source: 'eurusd', target: 'gbpusd', value: 0.9 },
      { source: 'eurusd', target: 'audusd', value: 0.85 },
      { source: 'eurusd', target: 'nzdusd', value: 0.82 },
      { source: 'gbpusd', target: 'audusd', value: 0.78 },
      { source: 'eurusd', target: 'usdcad', value: -0.8 }, // Inverse
    ],
  },
];

export const calculatePortfolioStats = (
  positions: Position[],
  correlations: Correlation[]
) => {
  const totalHeat = positions.reduce((acc, pos) => acc + pos.risk, 0);

  let maxCorrelation = 0;
  let avgCorrelation = 0;

  if (correlations.length > 0) {
    maxCorrelation = Math.max(...correlations.map((c) => Math.abs(c.value)));
    avgCorrelation =
      correlations.reduce((acc, c) => acc + c.value, 0) / correlations.length;
  }

  // Simplified "Effective Heat" calculation for visualization
  // Effective Heat = Simple Heat * (1 + Avg Correlation Factor)
  // If perfect correlation (1.0), effective heat doubles in "danger" perception
  const effectiveHeat = totalHeat * (1 + Math.max(0, avgCorrelation) * 0.5);

  return { totalHeat, maxCorrelation, effectiveHeat };
};
