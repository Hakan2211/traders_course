import { Trade, Grade } from './types';

// Helper to generate random trades
const generateTrades = (count: number): Trade[] => {
  const trades: Trade[] = [];
  const pairs = ['EUR/USD', 'GBP/JPY', 'XAU/USD', 'NVDA', 'BTC/USD', 'ES_F'];
  const setups = ['Trend Continuation', 'Breakout', 'Reversal', 'Pullback'];

  for (let i = 0; i < count; i++) {
    const isWin = Math.random() > 0.45; // 55% win rate
    const gradeProb = Math.random();
    let grade: Grade = 'B';

    if (gradeProb > 0.7) grade = 'A';
    else if (gradeProb < 0.2) grade = 'C';

    // R Multiple Logic
    let rMultiple = 0;
    if (isWin) {
      // Winners usually between 1R and 5R
      rMultiple = 1 + Math.random() * 4;
      if (grade === 'A') rMultiple += 0.5; // A trades perform better
    } else {
      // Losers usually -1R, sometimes -1.5R (slippage/bad discipline)
      rMultiple = -1 * (1 + Math.random() * 0.2);
    }

    // MAE Logic (How much heat did it take?)
    // Winners usually take less heat (0.2 - 0.8R)
    // BUT some volatile winners take heavy heat (> 0.8R)
    let mae = 0;
    if (isWin) {
      if (Math.random() > 0.8) {
        // 20% of winners are "Volatile Wins" (Q2)
        mae = 0.85 + Math.random() * 0.4; // 0.85 to 1.25R heat
      } else {
        // 80% are Sniper (Q1) or Chop
        mae = Math.random() * 0.8;
      }
    } else {
      // Losers typically take > 0.8R heat, but some are chopped out early
      mae = 0.5 + Math.random() * 0.8;
    }

    // MFE Logic (How good did it get?)
    // Winners usually get close to their R multiple or higher
    // Losers might have been green at some point
    let mfe = 0;
    if (isWin) {
      mfe = rMultiple + Math.random() * 1.5; // Went further than exit?
    } else {
      // Some losers had potential!
      if (Math.random() > 0.8) {
        // Heartbreakers: Went +1.5R then reversed
        mfe = 1.0 + Math.random() * 1.5;
      } else {
        mfe = Math.random() * 0.8; // Might have been green briefly
      }
    }

    // Specific Pattern Injection for educational purposes
    // 1. "Leaving money on table": High MFE, Low R (Early Exit)
    if (i % 8 === 0 && isWin) {
      mfe = rMultiple * 2.5;
    }

    trades.push({
      id: `TRD-${1000 + i}`,
      date: new Date(Date.now() - Math.floor(Math.random() * 30) * 86400000)
        .toISOString()
        .split('T')[0],
      pair: pairs[Math.floor(Math.random() * pairs.length)],
      direction: Math.random() > 0.5 ? 'Long' : 'Short',
      entry: 0, // Simplified for scatter plot relevance
      stop: 0,
      exit: 0,
      risk: 100,
      rMultiple: parseFloat(rMultiple.toFixed(2)),
      mae: parseFloat(mae.toFixed(2)),
      mfe: parseFloat(mfe.toFixed(2)),
      grade,
      outcome: isWin ? 'WIN' : 'LOSS',
      setupType: setups[Math.floor(Math.random() * setups.length)],
    });
  }

  return trades;
};

export const MOCK_TRADES = generateTrades(100);
