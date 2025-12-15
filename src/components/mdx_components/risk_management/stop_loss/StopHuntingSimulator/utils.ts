import { PriceLevel, PIP_VALUE } from './types';

export const formatPrice = (price: number): string => price.toFixed(4);

const isRoundNumber = (price: number) => {
  const scaled = Math.round((price / 0.005) * 100000) / 100000;
  return Math.abs(scaled - Math.round(scaled)) < 1e-5;
};

export const generateMarketData = (supportLevel: number): PriceLevel[] => {
  const levels: PriceLevel[] = [];
  const startPrice = supportLevel + 15 * PIP_VALUE;
  const endPrice = supportLevel - 40 * PIP_VALUE;

  for (let price = startPrice; price >= endPrice; price -= PIP_VALUE) {
    const roundedPrice = parseFloat(price.toFixed(4));
    const distFromSupport = roundedPrice - supportLevel;
    let stopCount = 0;

    if (distFromSupport < 0 && distFromSupport > -0.001) {
      stopCount = Math.floor(Math.random() * 150) + 100;
      if (distFromSupport > -0.0006) {
        stopCount += 100;
      }
    } else if (distFromSupport <= -0.001 && distFromSupport > -0.002) {
      stopCount = Math.floor(Math.random() * 50) + 20;
    } else if (distFromSupport <= -0.002) {
      stopCount = Math.floor(Math.random() * 10);
    } else {
      stopCount = Math.floor(Math.random() * 5);
    }

    if (isRoundNumber(roundedPrice)) {
      stopCount += 50;
    }

    levels.push({
      price: roundedPrice,
      stopCount,
      isSupport: Math.abs(roundedPrice - supportLevel) < 1e-6,
      isResistance: false,
      isHunted: false,
    });
  }

  return levels;
};

export const calculateHuntEconomics = (
  targetPrice: number,
  currentPrice: number,
  levels: PriceLevel[]
) => {
  const pushCostPerPip = 200;
  const profitPerStop = 15;

  const pipsDistance = Math.abs((currentPrice - targetPrice) / PIP_VALUE);
  const cost = Math.floor(pipsDistance * pushCostPerPip);

  let capturedStops = 0;
  levels.forEach((level) => {
    if (level.price <= currentPrice && level.price >= targetPrice) {
      capturedStops += level.stopCount;
    }
  });

  const revenue = capturedStops * profitPerStop;
  const buyBackDiscount = Math.floor(revenue * 0.2);
  const totalProfit = revenue + buyBackDiscount - cost;

  return {
    cost,
    revenue,
    capturedStops,
    totalProfit,
    isProfitable: totalProfit > 0,
  };
};

export const getHuntProbability = (
  userPrice: number,
  supportLevel: number
): { percent: number; label: string; color: string } => {
  const dist = (supportLevel - userPrice) / PIP_VALUE;

  if (userPrice > supportLevel) {
    return { percent: 99, label: 'GUARANTEED HIT', color: 'text-red-500' };
  }
  if (dist < 5) {
    return { percent: 95, label: 'EXTREME DANGER', color: 'text-red-600' };
  }
  if (dist < 10) {
    return { percent: 80, label: 'HIGH RISK', color: 'text-orange-500' };
  }
  if (dist < 20) {
    return { percent: 45, label: 'MODERATE', color: 'text-yellow-400' };
  }
  if (dist < 30) {
    return { percent: 15, label: 'LOW RISK', color: 'text-green-400' };
  }
  return { percent: 5, label: 'SAFE HAVEN', color: 'text-green-500' };
};
