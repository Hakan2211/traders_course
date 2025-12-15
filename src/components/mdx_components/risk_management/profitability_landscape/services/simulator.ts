import { SimulationConfig, SimulationResult } from '../types';

/**
 * Runs a single simulation of N trades.
 * Uses compounding risk (risk % of CURRENT capital).
 */
export const runSimulation = (config: SimulationConfig): SimulationResult => {
  const { winRate, rrRatio, numTrades, startingCapital, riskPerTradePct } =
    config;

  const equityCurve: number[] = [startingCapital];
  const trades: boolean[] = [];
  let currentCapital = startingCapital;

  let peakCapital = startingCapital;
  let maxDrawdown = 0;

  let currentLosingStreak = 0;
  let longestLosingStreak = 0;
  let winCount = 0;
  let lossCount = 0;
  let grossProfit = 0;
  let grossLoss = 0;

  for (let i = 0; i < numTrades; i++) {
    const isWin = Math.random() < winRate;
    const riskAmount = currentCapital * riskPerTradePct;

    if (isWin) {
      const profit = riskAmount * rrRatio;
      currentCapital += profit;
      grossProfit += profit;

      trades.push(true);
      winCount++;
      currentLosingStreak = 0;
    } else {
      const loss = riskAmount;
      currentCapital -= loss;
      grossLoss += loss;

      trades.push(false);
      lossCount++;
      currentLosingStreak++;
      if (currentLosingStreak > longestLosingStreak) {
        longestLosingStreak = currentLosingStreak;
      }
    }

    // Drawdown Calculation
    if (currentCapital > peakCapital) {
      peakCapital = currentCapital;
    }
    const currentDrawdown = (peakCapital - currentCapital) / peakCapital;
    if (currentDrawdown > maxDrawdown) {
      maxDrawdown = currentDrawdown;
    }

    equityCurve.push(currentCapital);
  }

  const netProfit = currentCapital - startingCapital;
  const netProfitPct = (netProfit / startingCapital) * 100;
  const expectancy = winRate * rrRatio - (1 - winRate); // R-multiple expectancy
  const profitFactor = grossLoss === 0 ? grossProfit : grossProfit / grossLoss;

  return {
    equityCurve,
    trades,
    finalCapital: currentCapital,
    netProfitPct,
    maxDrawdownPct: maxDrawdown * 100,
    longestLosingStreak,
    winCount,
    lossCount,
    expectancy,
    profitFactor,
  };
};

/**
 * Runs multiple simulations for Monte Carlo analysis
 */
export const runMonteCarlo = (
  config: SimulationConfig,
  iterations: number = 50
): SimulationResult[] => {
  const results: SimulationResult[] = [];
  for (let i = 0; i < iterations; i++) {
    results.push(runSimulation(config));
  }
  return results;
};
