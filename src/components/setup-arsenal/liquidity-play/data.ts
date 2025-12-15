import { OrderRow } from './types';

export const TARGET_SHARES = 10000;
export const STARTING_PRICE = 7.0;

export const DAY_1_ASKS: OrderRow[] = [
  { id: 'd1-1', price: 7.0, shares: 15000 },
  { id: 'd1-2', price: 7.01, shares: 25000 },
  { id: 'd1-3', price: 7.02, shares: 10000 },
  { id: 'd1-4', price: 7.03, shares: 50000 },
  { id: 'd1-5', price: 7.04, shares: 30000 },
  { id: 'd1-6', price: 7.05, shares: 12000 },
  { id: 'd1-7', price: 7.06, shares: 20000 },
  { id: 'd1-8', price: 7.07, shares: 45000 },
  { id: 'd1-9', price: 7.08, shares: 10000 },
  { id: 'd1-10', price: 7.09, shares: 50000 },
];

// The trap: Extremely thin liquidity, large gaps between prices
export const DAY_3_ASKS: OrderRow[] = [
  { id: 'd3-1', price: 7.0, shares: 100 },
  { id: 'd3-2', price: 7.05, shares: 200 },
  { id: 'd3-3', price: 7.1, shares: 500 },
  { id: 'd3-4', price: 7.25, shares: 800 },
  { id: 'd3-5', price: 7.4, shares: 1000 },
  { id: 'd3-6', price: 7.65, shares: 1500 },
  { id: 'd3-7', price: 7.9, shares: 1200 },
  { id: 'd3-8', price: 8.2, shares: 2000 },
  { id: 'd3-9', price: 8.5, shares: 3000 },
  { id: 'd3-10', price: 9.0, shares: 5000 },
];
