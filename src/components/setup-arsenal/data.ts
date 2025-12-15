import { SetupData, SetupType, TimeFrame, RiskLevel } from './types';

// Helper to map grid coordinates
// X: Time (-2 to 3)
// Y: Type (-2 to 2)
// Z: Risk (0 to 2)

const RISK_Z_MAP = {
  [RiskLevel.LOW]: 5,
  [RiskLevel.MEDIUM]: 0,
  [RiskLevel.HIGH]: -5,
};

const TIME_X_MAP = {
  [TimeFrame.PRE_MARKET]: -5,
  [TimeFrame.OPEN]: -3,
  [TimeFrame.MORNING]: -1,
  [TimeFrame.MIDDAY]: 1,
  [TimeFrame.POWER_HOUR]: 3,
  [TimeFrame.MULTI_DAY]: 5,
};

const TYPE_Y_MAP = {
  [SetupType.BREAKOUT]: 8,
  [SetupType.MOMENTUM]: 4,
  [SetupType.REVERSAL]: 0,
  [SetupType.STRUCTURE]: -4,
  [SetupType.EVENT]: -8,
};

const COLORS = {
  [SetupType.BREAKOUT]: '#fbbf24', // Yellow
  [SetupType.MOMENTUM]: '#3b82f6', // Blue
  [SetupType.REVERSAL]: '#ef4444', // Red
  [SetupType.STRUCTURE]: '#22c55e', // Green
  [SetupType.EVENT]: '#a855f7', // Purple
};

const rawSetups: SetupData[] = [
  {
    id: 1,
    name: 'News Momentum Plays',
    description:
      'Catching the immediate reaction to pre-market news catalysts. High velocity, requires fast execution.',
    type: SetupType.MOMENTUM,
    timeFrame: TimeFrame.PRE_MARKET,
    risk: RiskLevel.MEDIUM,
    color: COLORS[SetupType.MOMENTUM],
    position: [
      TIME_X_MAP[TimeFrame.PRE_MARKET],
      TYPE_Y_MAP[SetupType.MOMENTUM],
      RISK_Z_MAP[RiskLevel.MEDIUM],
    ],
  },
  {
    id: 2,
    name: 'Pop and Drop',
    description:
      'Fading the initial spike on press releases. Price extends too far, too fast, and collapses.',
    type: SetupType.REVERSAL,
    timeFrame: TimeFrame.PRE_MARKET,
    risk: RiskLevel.MEDIUM,
    color: COLORS[SetupType.REVERSAL],
    position: [
      TIME_X_MAP[TimeFrame.PRE_MARKET],
      TYPE_Y_MAP[SetupType.REVERSAL],
      RISK_Z_MAP[RiskLevel.MEDIUM],
    ],
  },
  {
    id: 3,
    name: 'Open Range Breakout (ORB)',
    description:
      'Trading the break of the high/low established in the first 15-30 minutes.',
    type: SetupType.BREAKOUT,
    timeFrame: TimeFrame.OPEN,
    risk: RiskLevel.MEDIUM,
    color: COLORS[SetupType.BREAKOUT],
    position: [
      TIME_X_MAP[TimeFrame.OPEN],
      TYPE_Y_MAP[SetupType.BREAKOUT],
      RISK_Z_MAP[RiskLevel.MEDIUM],
    ],
  },
  {
    id: 4,
    name: 'Gap Up Short',
    description:
      'Stock gaps up on weak news or low volume and immediately fails at the open.',
    type: SetupType.REVERSAL,
    timeFrame: TimeFrame.OPEN,
    risk: RiskLevel.MEDIUM,
    color: COLORS[SetupType.REVERSAL],
    position: [
      TIME_X_MAP[TimeFrame.OPEN],
      TYPE_Y_MAP[SetupType.REVERSAL],
      RISK_Z_MAP[RiskLevel.MEDIUM],
    ],
  },
  {
    id: 5,
    name: 'Afternoon Breakout',
    description:
      'Consolidation throughout midday that breaks out late in the day on volume.',
    type: SetupType.BREAKOUT,
    timeFrame: TimeFrame.POWER_HOUR,
    risk: RiskLevel.LOW,
    color: COLORS[SetupType.BREAKOUT],
    position: [
      TIME_X_MAP[TimeFrame.POWER_HOUR],
      TYPE_Y_MAP[SetupType.BREAKOUT],
      RISK_Z_MAP[RiskLevel.LOW],
    ],
  },
  {
    id: 6,
    name: 'Afternoon Fade',
    description:
      'Morning runner that exhausts and slowly bleeds off during the afternoon.',
    type: SetupType.REVERSAL,
    timeFrame: TimeFrame.MIDDAY,
    risk: RiskLevel.LOW,
    color: COLORS[SetupType.REVERSAL],
    position: [
      TIME_X_MAP[TimeFrame.MIDDAY],
      TYPE_Y_MAP[SetupType.REVERSAL],
      RISK_Z_MAP[RiskLevel.LOW],
    ],
  },
  {
    id: 7,
    name: 'Parabolic Short',
    description:
      "Vertical price movement that becomes unsustainable. The 'Climax Top'.",
    type: SetupType.REVERSAL,
    timeFrame: TimeFrame.MORNING,
    risk: RiskLevel.HIGH,
    color: COLORS[SetupType.REVERSAL],
    position: [
      TIME_X_MAP[TimeFrame.MORNING],
      TYPE_Y_MAP[SetupType.REVERSAL],
      RISK_Z_MAP[RiskLevel.HIGH],
    ],
  },
  {
    id: 8,
    name: 'Panic Dip Buy',
    description:
      "Buying the capitulation wash-out at the open. 'Catching a falling knife' correctly.",
    type: SetupType.REVERSAL,
    timeFrame: TimeFrame.OPEN,
    risk: RiskLevel.MEDIUM,
    color: COLORS[SetupType.REVERSAL],
    position: [
      TIME_X_MAP[TimeFrame.OPEN],
      TYPE_Y_MAP[SetupType.REVERSAL],
      RISK_Z_MAP[RiskLevel.MEDIUM],
    ],
  },
  {
    id: 9,
    name: 'First Green Day',
    description:
      'A stock that has been beaten down creates a structural pivot and closes green.',
    type: SetupType.MOMENTUM,
    timeFrame: TimeFrame.MULTI_DAY,
    risk: RiskLevel.MEDIUM,
    color: COLORS[SetupType.MOMENTUM],
    position: [
      TIME_X_MAP[TimeFrame.MULTI_DAY],
      TYPE_Y_MAP[SetupType.MOMENTUM],
      RISK_Z_MAP[RiskLevel.MEDIUM],
    ],
  },
  {
    id: 10,
    name: 'First Red Day',
    description:
      'A multi-day runner finally shows weakness and closes red, signaling a trend shift.',
    type: SetupType.REVERSAL,
    timeFrame: TimeFrame.MULTI_DAY,
    risk: RiskLevel.MEDIUM,
    color: COLORS[SetupType.REVERSAL],
    position: [
      TIME_X_MAP[TimeFrame.MULTI_DAY],
      TYPE_Y_MAP[SetupType.REVERSAL],
      RISK_Z_MAP[RiskLevel.MEDIUM],
    ],
  },
  {
    id: 11,
    name: 'Reverse Split Long',
    description: 'Post-split float compression leads to explosive volatility.',
    type: SetupType.STRUCTURE,
    timeFrame: TimeFrame.PRE_MARKET,
    risk: RiskLevel.LOW,
    color: COLORS[SetupType.STRUCTURE],
    position: [
      TIME_X_MAP[TimeFrame.PRE_MARKET],
      TYPE_Y_MAP[SetupType.STRUCTURE],
      RISK_Z_MAP[RiskLevel.LOW],
    ],
  },
  {
    id: 12,
    name: 'Reverse Split Short',
    description:
      'Capitalizing on the inevitable dilution and selling pressure of failing companies.',
    type: SetupType.STRUCTURE,
    timeFrame: TimeFrame.OPEN,
    risk: RiskLevel.MEDIUM,
    color: COLORS[SetupType.STRUCTURE],
    position: [
      TIME_X_MAP[TimeFrame.OPEN],
      TYPE_Y_MAP[SetupType.STRUCTURE],
      RISK_Z_MAP[RiskLevel.MEDIUM],
    ],
  },
  {
    id: 13,
    name: 'Overextended Gap Up Short',
    description:
      'A multi-day runner gaps up one last time, exhausting all buyers.',
    type: SetupType.REVERSAL,
    timeFrame: TimeFrame.OPEN,
    risk: RiskLevel.MEDIUM,
    color: COLORS[SetupType.REVERSAL],
    position: [
      TIME_X_MAP[TimeFrame.OPEN],
      TYPE_Y_MAP[SetupType.REVERSAL],
      RISK_Z_MAP[RiskLevel.MEDIUM],
    ],
  },
  {
    id: 14,
    name: 'Overextended Gap Down Long',
    description:
      'Gap down on a stock that is already oversold, leading to a relief bounce.',
    type: SetupType.REVERSAL,
    timeFrame: TimeFrame.OPEN,
    risk: RiskLevel.HIGH,
    color: COLORS[SetupType.REVERSAL],
    position: [
      TIME_X_MAP[TimeFrame.OPEN],
      TYPE_Y_MAP[SetupType.REVERSAL],
      RISK_Z_MAP[RiskLevel.HIGH],
    ],
  },
  {
    id: 15,
    name: 'VWAP Bounce',
    description:
      'Price returns to the Volume Weighted Average Price and holds. Institutional support.',
    type: SetupType.MOMENTUM,
    timeFrame: TimeFrame.MIDDAY,
    risk: RiskLevel.LOW,
    color: COLORS[SetupType.MOMENTUM],
    position: [
      TIME_X_MAP[TimeFrame.MIDDAY],
      TYPE_Y_MAP[SetupType.MOMENTUM],
      RISK_Z_MAP[RiskLevel.LOW],
    ],
  },
  {
    id: 16,
    name: 'VWAP Rejection',
    description:
      'Price rallies to VWAP but cannot reclaim it. Bearish continuation.',
    type: SetupType.MOMENTUM,
    timeFrame: TimeFrame.MIDDAY,
    risk: RiskLevel.LOW,
    color: COLORS[SetupType.MOMENTUM],
    position: [
      TIME_X_MAP[TimeFrame.MIDDAY],
      TYPE_Y_MAP[SetupType.MOMENTUM],
      RISK_Z_MAP[RiskLevel.LOW],
    ],
  },
  {
    id: 17,
    name: 'Liquidity Trap',
    description:
      'False breakout meant to generate liquidity for a large position exit.',
    type: SetupType.STRUCTURE,
    timeFrame: TimeFrame.MORNING,
    risk: RiskLevel.MEDIUM,
    color: COLORS[SetupType.STRUCTURE],
    position: [
      TIME_X_MAP[TimeFrame.MORNING],
      TYPE_Y_MAP[SetupType.STRUCTURE],
      RISK_Z_MAP[RiskLevel.MEDIUM],
    ],
  },
  {
    id: 18,
    name: 'Earnings Play',
    description:
      'Trading the volatility immediately following an earnings report.',
    type: SetupType.EVENT,
    timeFrame: TimeFrame.MULTI_DAY, // Often AH or PM
    risk: RiskLevel.HIGH,
    color: COLORS[SetupType.EVENT],
    position: [
      TIME_X_MAP[TimeFrame.MULTI_DAY],
      TYPE_Y_MAP[SetupType.EVENT],
      RISK_Z_MAP[RiskLevel.HIGH],
    ],
  },
  {
    id: 19,
    name: 'Episodic Pivot',
    description:
      'A fundamental change (earnings, contract, FDA) causes a massive gap and new trend.',
    type: SetupType.BREAKOUT,
    timeFrame: TimeFrame.OPEN,
    risk: RiskLevel.MEDIUM,
    color: COLORS[SetupType.BREAKOUT],
    position: [
      TIME_X_MAP[TimeFrame.OPEN],
      TYPE_Y_MAP[SetupType.BREAKOUT],
      RISK_Z_MAP[RiskLevel.MEDIUM],
    ],
  },
];

// Helper to handle overlapping setups
const processSetups = (items: SetupData[]): SetupData[] => {
  // Group by position key (x,y,z)
  const groups: { [key: string]: SetupData[] } = {};

  items.forEach((item) => {
    // Round to avoid floating point issues if any
    const key = item.position.map((n) => Math.round(n * 100) / 100).join(',');
    if (!groups[key]) groups[key] = [];
    groups[key].push(item);
  });

  const finalSetups: SetupData[] = [];
  const SPACING_X = 0.8; // Space between overlapping items

  Object.values(groups).forEach((group) => {
    if (group.length === 1) {
      finalSetups.push(group[0]);
    } else {
      // Overlap detected - distribute along X axis
      const count = group.length;
      const baseX = group[0].position[0];
      const startX = baseX - ((count - 1) * SPACING_X) / 2;

      group.forEach((item, index) => {
        const newX = startX + index * SPACING_X;
        finalSetups.push({
          ...item,
          position: [newX, item.position[1], item.position[2]],
        });
      });
    }
  });

  return finalSetups.sort((a, b) => a.id - b.id);
};

export const setups = processSetups(rawSetups);
