import { CONSTANTS, CoinSide, FlipResult } from './types';

/**
 * Calculates the next state based on the bet size and random outcome.
 */
export const performFlip = (
  currentCapital: number,
  betSizePercent: number,
  expectedArithmetic: number,
  flipId: number
): FlipResult => {
  const isHeads = Math.random() >= 0.5;
  const side = isHeads ? CoinSide.HEADS : CoinSide.TAILS;

  // The logic:
  // You bet X% of your capital.
  // If Heads: You gain 50% on that bet. (Multiplier = 1 + (betSize * 0.5))
  // If Tails: You lose 40% on that bet. (Multiplier = 1 - (betSize * 0.4))

  const fraction = betSizePercent / 100;
  let multiplier = 1;
  let isWin = false;

  if (isHeads) {
    multiplier = 1 + fraction * CONSTANTS.WIN_PCT;
    isWin = true;
  } else {
    multiplier = 1 - fraction * CONSTANTS.LOSS_PCT;
    isWin = false;
  }

  const capitalAfter = currentCapital * multiplier;
  const changePercent = (multiplier - 1) * 100;

  // Expected Value Update (Linear)
  // EV of the bet itself is: 0.5 * 0.5 + 0.5 * -0.4 = 0.25 - 0.2 = 0.05 (+5%)
  // So for the total capital, the expected growth factor is 1 + (betSize * 0.05)
  const evGrowthFactor =
    1 + fraction * (CONSTANTS.WIN_PCT * 0.5 - CONSTANTS.LOSS_PCT * 0.5);
  const nextExpectedArithmetic = expectedArithmetic * evGrowthFactor;

  return {
    id: flipId,
    side,
    capitalAfter,
    capitalBefore: currentCapital,
    expectedArithmetic: nextExpectedArithmetic,
    changePercent,
    isWin,
    betSize: betSizePercent,
  };
};

export const formatMoney = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
};
