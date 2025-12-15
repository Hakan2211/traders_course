
import React, { useState, useEffect } from 'react';
import { OrderBook } from './OrderBook';
import { DAY_1_ASKS, DAY_3_ASKS, TARGET_SHARES, STARTING_PRICE } from './data';
import { OrderRow, ScenarioType, SimulationResult } from './types';
import { Activity, Play, RefreshCw, AlertTriangle } from 'lucide-react';

const LiquidityExecutionSim = () => {
  const [scenario, setScenario] = useState<ScenarioType>('DAY_1');
  const [asks, setAsks] = useState<OrderRow[]>([]);
  const [currentPrice, setCurrentPrice] = useState(STARTING_PRICE);
  const [isSimulating, setIsSimulating] = useState(false);
  const [filledShares, setFilledShares] = useState(0);
  const [totalCost, setTotalCost] = useState(0);
  const [result, setResult] = useState<SimulationResult | null>(null);

  // Load initial data
  useEffect(() => {
    resetSimulation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scenario]);

  const resetSimulation = () => {
    setIsSimulating(false);
    setFilledShares(0);
    setTotalCost(0);
    setResult(null);
    setCurrentPrice(STARTING_PRICE);

    // Deep copy to reset state
    const initialData = scenario === 'DAY_1' ? DAY_1_ASKS : DAY_3_ASKS;
    setAsks(JSON.parse(JSON.stringify(initialData)));
  };

  const runSimulation = async () => {
    if (isSimulating) return;
    setIsSimulating(true);
    setResult(null);
    setFilledShares(0);
    setTotalCost(0);

    let currentFilled = 0;
    let currentCost = 0;
    let currentAsks = JSON.parse(
      JSON.stringify(scenario === 'DAY_1' ? DAY_1_ASKS : DAY_3_ASKS)
    );
    let finalPrice = STARTING_PRICE;

    // Simulation loop
    for (let i = 0; i < currentAsks.length; i++) {
      if (currentFilled >= TARGET_SHARES) break;

      const ask = currentAsks[i];
      const remainingNeeded = TARGET_SHARES - currentFilled;

      // Artificial delay for visualization
      await new Promise((r) => setTimeout(r, scenario === 'DAY_1' ? 100 : 400)); // Slower on Day 3 to feel the pain

      let sharesToTake = 0;
      if (ask.shares <= remainingNeeded) {
        // Fill entire level
        sharesToTake = ask.shares;
        ask.filled = true;
        ask.partialFill = 0;
      } else {
        // Partial fill
        sharesToTake = remainingNeeded;
        ask.partialFill = sharesToTake;
        // Don't mark filled strictly, but visually it's touched
      }

      currentFilled += sharesToTake;
      currentCost += sharesToTake * ask.price;
      finalPrice = ask.price;

      // Update state for UI
      setAsks([...currentAsks]);
      setFilledShares(currentFilled);
      setTotalCost(currentCost);
      setCurrentPrice(ask.price);
    }

    // Calculate final stats
    const avgEntry = currentCost / currentFilled;
    const slippage = ((avgEntry - STARTING_PRICE) / STARTING_PRICE) * 100;

    setResult({
      averageEntry: avgEntry,
      totalCost: currentCost,
      slippagePercent: slippage,
      sharesFilled: currentFilled,
      finalPrice: finalPrice,
    });
    setIsSimulating(false);
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 w-full max-w-5xl mx-auto my-8 bg-slate-900/50 p-6 rounded-xl border border-slate-800">
      {/* Left Panel: Controls & Stats */}
      <div className="flex-1 space-y-6">
        <div>
          <h3 className="text-xl font-bold text-white mb-2">
            Liquidity Execution Simulator
          </h3>
          <p className="text-slate-400 text-sm">
            Attempt to buy{' '}
            <span className="text-blue-400 font-bold">
              {TARGET_SHARES.toLocaleString()} shares
            </span>{' '}
            at market. Observe how liquidity depth affects your execution price.
          </p>
        </div>

        {/* Scenario Selector */}
        <div className="flex gap-2 p-1 bg-slate-950 rounded-lg border border-slate-800">
          <button
            onClick={() => setScenario('DAY_1')}
            disabled={isSimulating}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
              scenario === 'DAY_1'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Day 1 (High Liquidity)
          </button>
          <button
            onClick={() => setScenario('DAY_3')}
            disabled={isSimulating}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
              scenario === 'DAY_3'
                ? 'bg-amber-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Day 3 (Low Liquidity)
          </button>
        </div>

        {/* Action Button */}
        <button
          onClick={
            isSimulating ? undefined : result ? resetSimulation : runSimulation
          }
          disabled={isSimulating}
          className={`w-full py-4 rounded-lg font-bold text-lg flex items-center justify-center gap-2 transition-all ${
            isSimulating
              ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
              : result
              ? 'bg-slate-700 hover:bg-slate-600 text-white'
              : 'bg-green-600 hover:bg-green-500 text-white shadow-green-900/20 shadow-lg'
          }`}
        >
          {isSimulating ? (
            <>
              <RefreshCw className="animate-spin" /> Executing Order...
            </>
          ) : result ? (
            <>
              <RefreshCw /> Reset Simulation
            </>
          ) : (
            <>
              <Play fill="currentColor" /> Buy {TARGET_SHARES.toLocaleString()}{' '}
              Shares
            </>
          )}
        </button>

        {/* Live Stats */}
        <div className="bg-slate-950 rounded-lg p-4 space-y-4 border border-slate-800">
          <div className="flex justify-between items-center">
            <span className="text-slate-400 text-sm">Target Shares</span>
            <span className="text-white font-mono">
              {TARGET_SHARES.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400 text-sm">Filled So Far</span>
            <span
              className={`font-mono ${
                filledShares === TARGET_SHARES ? 'text-green-400' : 'text-white'
              }`}
            >
              {filledShares.toLocaleString()}
            </span>
          </div>
          <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all duration-300"
              style={{ width: `${(filledShares / TARGET_SHARES) * 100}%` }}
            />
          </div>
        </div>

        {/* Results Panel */}
        {result && (
          <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700 animate-in fade-in slide-in-from-bottom-4">
            <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Activity size={18} /> Execution Report
            </h4>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-slate-400 uppercase">
                  Avg Entry Price
                </div>
                <div className="text-xl font-mono text-white">
                  ${result.averageEntry.toFixed(2)}
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-400 uppercase">Slippage</div>
                <div
                  className={`text-xl font-mono ${
                    result.slippagePercent > 5
                      ? 'text-red-400'
                      : 'text-green-400'
                  }`}
                >
                  {result.slippagePercent > 0 ? '+' : ''}
                  {result.slippagePercent.toFixed(2)}%
                </div>
              </div>
              <div className="col-span-2 pt-2 border-t border-slate-700">
                <div className="text-xs text-slate-400 uppercase mb-1">
                  Impact Analysis
                </div>
                <p className="text-sm text-slate-300">
                  {result.slippagePercent < 2 ? (
                    'Minimal impact. High liquidity absorbed your order easily. This is typical of Day 1 volume.'
                  ) : (
                    <span className="text-red-300 flex items-start gap-2">
                      <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                      <span>
                        Massive slippage! Your buying pressure moved the price
                        against you by {result.slippagePercent.toFixed(1)}%.
                        This is the Day 3 trap.
                      </span>
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Right Panel: Order Book Visual */}
      <div className="w-full md:w-80 h-[500px] shrink-0 rounded-xl overflow-hidden shadow-2xl border border-slate-700">
        <OrderBook
          asks={asks}
          currentPrice={currentPrice}
          isSimulating={isSimulating}
        />
      </div>
    </div>
  );
};

export default LiquidityExecutionSim;
