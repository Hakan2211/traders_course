import { TraderProfile, SimulationConfig } from './types';

export const generateSimulationData = (
  config: SimulationConfig
): TraderProfile[] => {
  const { initialBalance, winRate, rewardRatio, totalTrades } = config;

  // 1. Generate a common sequence of market events (wins/losses)
  // This ensures fair comparison - all traders face the same market conditions.
  const outcomes: ('WIN' | 'LOSS')[] = Array.from(
    { length: totalTrades },
    () => {
      return Math.random() < winRate ? 'WIN' : 'LOSS';
    }
  );

  // Helper to calculate common data structure
  const createEmptyData = () => ({
    balance: [initialBalance],
    drawdown: [0],
    isAlive: [true],
    stressLevel: [0],
  });

  // --- TRADER A: Conservative (1% Fixed) ---
  const traderA: TraderProfile = {
    id: 'trader-a',
    name: 'Trader A',
    description: 'Disciplined (1% Risk)',
    riskType: 'conservative',
    initialBalance,
    data: createEmptyData(),
  };

  // --- TRADER B: Aggressive (5% Fixed) ---
  const traderB: TraderProfile = {
    id: 'trader-b',
    name: 'Trader B',
    description: 'Aggressive (5% Risk)',
    riskType: 'aggressive',
    initialBalance,
    data: createEmptyData(),
  };

  // --- TRADER C: Emotional (Random/Revenge) ---
  const traderC: TraderProfile = {
    id: 'trader-c',
    name: 'Trader C',
    description: 'Emotional (Revenge)',
    riskType: 'emotional',
    initialBalance,
    data: createEmptyData(),
  };

  // Simulation Loop
  let balA = initialBalance;
  let maxBalA = initialBalance;

  let balB = initialBalance;
  let maxBalB = initialBalance;

  let balC = initialBalance;
  let maxBalC = initialBalance;
  let consecutiveLossesC = 0;

  for (let i = 0; i < totalTrades; i++) {
    const outcome = outcomes[i];
    const isWin = outcome === 'WIN';

    // --- Logic A: Fixed 1% ---
    if (traderA.data.isAlive[i]) {
      const riskAmount = balA * 0.01;
      const pnl = isWin ? riskAmount * rewardRatio : -riskAmount;
      balA += pnl;
      if (balA < 0) balA = 0;
    }
    maxBalA = Math.max(maxBalA, balA);
    traderA.data.balance.push(balA);
    traderA.data.drawdown.push(((maxBalA - balA) / maxBalA) * 100);
    traderA.data.isAlive.push(balA > 100); // Dead if < $100
    traderA.data.stressLevel.push(traderA.data.drawdown[i + 1] / 20); // Low stress usually

    // --- Logic B: Fixed 5% ---
    if (traderB.data.isAlive[i]) {
      const riskAmount = balB * 0.05;
      const pnl = isWin ? riskAmount * rewardRatio : -riskAmount;
      balB += pnl;
      if (balB < 0) balB = 0;
    }
    maxBalB = Math.max(maxBalB, balB);
    traderB.data.balance.push(balB);
    traderB.data.drawdown.push(((maxBalB - balB) / maxBalB) * 100);
    traderB.data.isAlive.push(balB > 100);
    traderB.data.stressLevel.push(traderB.data.drawdown[i + 1] / 50); // Higher stress scaling

    // --- Logic C: Emotional ---
    // Risk starts at 2%. Doubles after every 2 consecutive losses (revenge). Resets on win.
    if (traderC.data.isAlive[i]) {
      let riskPercent = 0.02;

      // Emotional Logic: Revenge trading
      if (consecutiveLossesC >= 2) riskPercent = 0.05;
      if (consecutiveLossesC >= 3) riskPercent = 0.1;
      if (consecutiveLossesC >= 4) riskPercent = 0.2; // Full tilt

      const riskAmount = balC * riskPercent;
      const pnl = isWin ? riskAmount * rewardRatio : -riskAmount;

      balC += pnl;
      if (balC < 0) balC = 0;
      if (isWin) consecutiveLossesC = 0;
      else consecutiveLossesC++;
    }
    maxBalC = Math.max(maxBalC, balC);
    traderC.data.balance.push(balC);
    traderC.data.drawdown.push(((maxBalC - balC) / maxBalC) * 100);
    traderC.data.isAlive.push(balC > 100);

    // Stress for C is high if DD is high OR if currently tilting (high consecutive losses)
    const tiltStress = Math.min(consecutiveLossesC * 0.25, 1);
    const ddStress = traderC.data.drawdown[i + 1] / 60;
    traderC.data.stressLevel.push(Math.max(tiltStress, ddStress));
  }

  return [traderA, traderB, traderC];
};
