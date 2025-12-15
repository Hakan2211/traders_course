
import React, { useState } from 'react';
import Scene from './Scene';
import ControlPanel from './ControlPanel';
import { MarketState, Regime } from './types';

const VolatilityRegimeViz: React.FC = () => {
  const [marketState, setMarketState] = useState<MarketState>({
    atrMultiplier: 1.0,
    vix: 18,
    regime: Regime.NORMAL,
    scenarioName: 'Standard Market',
  });

  const handleUpdate = (updates: Partial<MarketState>) => {
    setMarketState((prev) => ({ ...prev, ...updates }));
  };

  return (
    <div className="w-full relative h-[800px] my-8 rounded-2xl overflow-hidden border border-slate-800">
      <Scene marketState={marketState} />
      <ControlPanel state={marketState} onUpdate={handleUpdate} />
    </div>
  );
};

export default VolatilityRegimeViz;
