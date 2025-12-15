export interface PricePoint {
  index: number;
  price: number;
  atr: number;
  swingLow: number | null; // The logic will calculate a swing low value for this point
}

export type ScenarioType =
  | 'strong_trend'
  | 'choppy_rally'
  | 'parabolic'
  | 'reversal';

const generateScenario = (type: ScenarioType): PricePoint[] => {
  const points: PricePoint[] = [];
  let currentPrice = 100;
  const length = 100;

  // Seed random but deterministic
  const random = (seed: number) => {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  };

  let swingLowTracker = currentPrice;
  let swingLowCounter = 0;

  for (let i = 0; i < length; i++) {
    let change = 0;
    let volatility = 0.5;

    switch (type) {
      case 'strong_trend':
        // Consistent upward trend with minor noise
        change = 0.8 + (random(i) - 0.5) * 1.5;
        volatility = 1.2;
        break;
      case 'choppy_rally':
        // Upward trend but deep pullbacks
        change = 0.6 + (random(i) - 0.5) * 4.0;
        volatility = 2.5;
        break;
      case 'parabolic':
        // Exponential growth then crash
        if (i < 60) change = 0.5 + i * 0.05 + (random(i) - 0.5);
        else change = -4.0 - random(i) * 2;
        volatility = i < 60 ? 1.0 : 4.0;
        break;
      case 'reversal':
        // V-shape
        if (i < 50) change = -1.0 + (random(i) - 0.5);
        else change = 1.2 + (random(i) - 0.5);
        volatility = 1.5;
        break;
    }

    currentPrice += change;

    // Simple Swing Low Logic: "Lowest low of last 10 bars" simulated for the technical indicator
    // In a real chart, we'd look back. Here we simulate a "trailing" support level that steps up.
    if (i === 0) swingLowTracker = currentPrice - 2;

    // Update swing low "structure" periodically to simulate technical levels moving up
    swingLowCounter++;
    if (type === 'strong_trend' && swingLowCounter > 10) {
      swingLowTracker = currentPrice - 3;
      swingLowCounter = 0;
    } else if (type === 'choppy_rally' && swingLowCounter > 15) {
      swingLowTracker = currentPrice - 6;
      swingLowCounter = 0;
    } else if (type === 'parabolic') {
      // Technical stops usually lag significantly in parabolic moves
      if (swingLowCounter > 8) {
        swingLowTracker = currentPrice - 5;
        swingLowCounter = 0;
      }
    } else if (type === 'reversal') {
      // Logic handles itself based on direction
      if (i > 50 && swingLowCounter > 10) {
        swingLowTracker = currentPrice - 3;
        swingLowCounter = 0;
      }
    }

    // Ensure swing low never exceeds price (impossible physically)
    if (swingLowTracker > currentPrice) swingLowTracker = currentPrice - 0.5;

    points.push({
      index: i,
      price: parseFloat(currentPrice.toFixed(2)),
      atr: parseFloat(volatility.toFixed(2)),
      swingLow: parseFloat(swingLowTracker.toFixed(2)),
    });
  }

  return points;
};

export const scenarios = {
  strong_trend: generateScenario('strong_trend'),
  choppy_rally: generateScenario('choppy_rally'),
  parabolic: generateScenario('parabolic'),
  reversal: generateScenario('reversal'),
};

export const scenarioDetails = {
  strong_trend: {
    label: 'Strong Uptrend',
    description: 'Steady climb with minor pullbacks. Ideal for all methods.',
  },
  choppy_rally: {
    label: 'Choppy Rally',
    description: 'High volatility uptrend. Tight stops often fail here.',
  },
  parabolic: {
    label: 'Parabolic Move',
    description: 'Explosive move followed by a crash. Needs fast reaction.',
  },
  reversal: {
    label: 'V-Shaped Reversal',
    description:
      'Sharp drop followed by recovery. Testing short vs long logic.',
  },
};
