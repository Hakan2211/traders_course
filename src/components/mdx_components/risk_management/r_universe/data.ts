
import { Grade, Trade, Stats } from './types';

const PAIRS = [
  'EUR/USD',
  'GBP/JPY',
  'XAU/USD',
  'BTC/USD',
  'NVDA',
  'TSLA',
  'SPX500',
];
const TYPES = ['Trend Continuation', 'Breakout', 'Reversal', 'Range Fade'];

const getRandomFrom = <T>(list: T[]): T =>
  list[Math.floor(Math.random() * list.length)];

export const generateTrades = (count = 500): Trade[] => {
  const trades: Trade[] = [];
  let currentDate = new Date('2023-01-01');

  for (let i = 0; i < count; i += 1) {
    const rand = Math.random();
    let grade: Grade;
    let rMultiple: number;

    if (rand > 0.7) {
      grade = 'A';
      const win = Math.random() > 0.4;
      rMultiple = win ? 1 + Math.random() * 4 : -1;
      if (win && Math.random() > 0.9) {
        rMultiple += 3;
      }
    } else if (rand > 0.4) {
      grade = 'B';
      const win = Math.random() > 0.52;
      rMultiple = win ? 0.5 + Math.random() * 2 : -1;
    } else if (rand > 0.15) {
      grade = 'C';
      const win = Math.random() > 0.65;
      rMultiple = win ? 0.2 + Math.random() * 1.5 : -1 - Math.random() * 0.5;
    } else {
      grade = 'D';
      const win = Math.random() > 0.75; // Poor win rate
      // D trades often have bad RR or large losses
      rMultiple = win ? 0.1 + Math.random() * 1.0 : -1 - Math.random() * 1.5;
    }

    const mae = rMultiple > 0 ? Math.random() * 0.8 : Math.abs(rMultiple);
    const mfe =
      rMultiple > 0 ? rMultiple + Math.random() * 0.5 : Math.random() * 0.8;

    currentDate.setDate(currentDate.getDate() + Math.floor(Math.random() * 3));

    const entry = 100 + Math.random() * 50;
    const riskPerShare = grade === 'A' ? 0.5 : 1;
    const stop = entry - riskPerShare;
    const exit = entry + rMultiple * riskPerShare;

    trades.push({
      id: i + 1,
      rMultiple: Number(rMultiple.toFixed(2)),
      grade,
      date: currentDate.toISOString().split('T')[0],
      pair: getRandomFrom(PAIRS),
      type: getRandomFrom(TYPES),
      entry: Number(entry.toFixed(2)),
      stop: Number(stop.toFixed(2)),
      exit: Number(exit.toFixed(2)),
      risk: 100,
      mae: Number(mae.toFixed(2)),
      mfe: Number(mfe.toFixed(2)),
    });
  }

  return trades;
};

export const calculateStats = (trades: Trade[]): Stats => {
  if (!trades.length) {
    return {
      totalTrades: 0,
      totalR: 0,
      expectancy: 0,
      winRate: 0,
      avgWin: 0,
      avgLoss: 0,
      largestWin: 0,
      largestLoss: 0,
    };
  }

  const totalR = trades.reduce((sum, trade) => sum + trade.rMultiple, 0);
  const wins = trades.filter((trade) => trade.rMultiple > 0);
  const losses = trades.filter((trade) => trade.rMultiple <= 0);

  const sumWins = wins.reduce((sum, trade) => sum + trade.rMultiple, 0);
  const sumLosses = losses.reduce((sum, trade) => sum + trade.rMultiple, 0);

  return {
    totalTrades: trades.length,
    totalR: Number(totalR.toFixed(2)),
    expectancy: Number((totalR / trades.length).toFixed(3)),
    winRate: Number(((wins.length / trades.length) * 100).toFixed(1)),
    avgWin: wins.length ? Number((sumWins / wins.length).toFixed(2)) : 0,
    avgLoss: losses.length ? Number((sumLosses / losses.length).toFixed(2)) : 0,
    largestWin: wins.length
      ? Math.max(...wins.map((trade) => trade.rMultiple))
      : 0,
    largestLoss: losses.length
      ? Math.min(...losses.map((trade) => trade.rMultiple))
      : 0,
  };
};
