
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Asset, HeatState, CorrelationGroup } from './types';
import { AVAILABLE_ASSETS, BREAK_POINT } from './constants';
import AssetCard from './AssetCard';
import Thermometer from './Thermometer';
import { Info, AlertCircle, RefreshCw, XCircle } from 'lucide-react';

const PortfolioHeatGame: React.FC = () => {
  const [selectedAssets, setSelectedAssets] = useState<Asset[]>([]);
  const [isBroken, setIsBroken] = useState(false);

  // Logic to calculate heat and penalties
  const heatState: HeatState = useMemo(() => {
    let baseHeat = 0;
    let penaltyHeat = 0;
    const groupCounts: Record<string, number> = {};

    selectedAssets.forEach((asset) => {
      baseHeat += asset.baseRisk;
      if (asset.correlationGroup !== CorrelationGroup.NONE) {
        groupCounts[asset.correlationGroup] =
          (groupCounts[asset.correlationGroup] || 0) + 1;
      }
    });

    // Correlation Penalty: For each duplicate group, add 0.5% * (count - 1)
    const messages: string[] = [];

    Object.entries(groupCounts).forEach(([group, count]) => {
      if (count > 1) {
        const penalty = (count - 1) * 0.5;
        penaltyHeat += penalty;
        messages.push(
          `High Correlation: ${count} ${group.replace(
            '_',
            ' '
          )} positions (+${penalty.toFixed(1)}% risk)`
        );
      }
    });

    const currentHeat = baseHeat + penaltyHeat;

    let status: HeatState['status'] = 'SAFE';
    if (currentHeat >= 12) status = 'BROKEN';
    else if (currentHeat >= 10) status = 'CRITICAL';
    else if (currentHeat >= 8) status = 'DANGER';
    else if (currentHeat >= 6) status = 'CAUTION';

    return {
      currentHeat,
      baseHeat,
      penaltyHeat,
      status,
      messages,
    };
  }, [selectedAssets]);

  useEffect(() => {
    if (heatState.status === 'BROKEN' && !isBroken) {
      setIsBroken(true);
    }
  }, [heatState.status, isBroken]);

  const toggleAsset = (asset: Asset) => {
    if (isBroken && !selectedAssets.find((a) => a.id === asset.id)) return; // Prevent adding if broken

    if (selectedAssets.find((a) => a.id === asset.id)) {
      setSelectedAssets((prev) => prev.filter((a) => a.id !== asset.id));
      if (heatState.currentHeat - asset.baseRisk < BREAK_POINT) {
        setIsBroken(false);
      }
    } else {
      setSelectedAssets((prev) => [...prev, asset]);
    }
  };

  const reset = () => {
    setSelectedAssets([]);
    setIsBroken(false);
  };

  return (
    <div
      className={`
        relative w-full max-w-6xl mx-auto rounded-xl overflow-hidden shadow-2xl transition-all duration-300 border border-slate-800
        ${isBroken ? 'shadow-red-900/50 animate-shake' : 'shadow-black/50'}
    `}
    >
      {/* Background with subtle grid */}
      <div className="absolute inset-0 bg-slate-900 z-0">
        <div className="absolute inset-0 opacity-5 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      </div>

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-0 lg:gap-8 h-full min-h-[600px]">
        {/* Left Panel: Asset Selection */}
        <div className="col-span-1 lg:col-span-8 p-6 lg:p-8 flex flex-col h-full bg-slate-900/50 backdrop-blur-sm">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <span className="w-2 h-8 bg-blue-500 rounded-full"></span>
                Market Access
              </h2>
              <p className="text-slate-400 text-sm mt-1">
                Select positions to add to your fortress.
              </p>
            </div>
            <button
              onClick={reset}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium transition-colors border border-slate-700"
            >
              <RefreshCw size={16} />
              Reset Portfolio
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 overflow-y-auto pr-2 pb-4">
            {AVAILABLE_ASSETS.map((asset) => (
              <AssetCard
                key={asset.id}
                asset={asset}
                isSelected={!!selectedAssets.find((a) => a.id === asset.id)}
                onToggle={toggleAsset}
                disabled={
                  isBroken && !selectedAssets.find((a) => a.id === asset.id)
                }
              />
            ))}
          </div>

          {/* Active Penalties Display */}
          <AnimatePresence>
            {heatState.messages.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="mt-auto pt-4"
              >
                <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2 text-orange-400 font-bold text-sm uppercase tracking-wide">
                    <AlertCircle size={16} />
                    Correlation Detected
                  </div>
                  <div className="space-y-1">
                    {heatState.messages.map((msg, idx) => (
                      <div
                        key={idx}
                        className="text-sm text-orange-200/80 flex items-start gap-2"
                      >
                        <span className="mt-1.5 w-1 h-1 bg-orange-500 rounded-full"></span>
                        {msg}
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Panel: Gauge */}
        <div
          className={`
            col-span-1 lg:col-span-4 p-6 lg:p-8 bg-slate-950 border-l border-slate-800 flex flex-col items-center justify-center relative
            ${isBroken ? 'border-red-500/30 bg-red-950/10' : ''}
        `}
        >
          {/* Overlay for broken state */}
          {isBroken && (
            <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-red-500/20 via-transparent to-transparent animate-pulse"></div>
          )}

          <Thermometer heatState={heatState} />

          <div className="mt-8 w-full space-y-3 z-10">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Positions</span>
              <span className="font-mono text-white">
                {selectedAssets.length}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Base Risk</span>
              <span className="font-mono text-white">
                {heatState.baseHeat.toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Correlation Penalty</span>
              <span
                className={`font-mono font-bold ${
                  heatState.penaltyHeat > 0
                    ? 'text-orange-500'
                    : 'text-slate-600'
                }`}
              >
                +{heatState.penaltyHeat.toFixed(1)}%
              </span>
            </div>
            <div className="h-px bg-slate-800 my-2"></div>
            <div className="flex justify-between text-lg font-bold">
              <span className="text-slate-200">Total Heat</span>
              <span className="font-mono text-white">
                {heatState.currentHeat.toFixed(1)}%
              </span>
            </div>
          </div>

          {isBroken && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="mt-6 p-3 bg-red-500/20 border border-red-500 rounded-lg text-center"
            >
              <div className="flex items-center justify-center gap-2 text-red-400 font-bold mb-1">
                <XCircle size={20} />
                FORTRESS BREACHED
              </div>
              <p className="text-xs text-red-300">
                Max limit exceeded. Correlation amplified risk beyond
                sustainable levels.
              </p>
              <button
                onClick={reset}
                className="mt-2 text-xs underline text-red-400 hover:text-red-300"
              >
                Reset Simulation
              </button>
            </motion.div>
          )}

          <div className="absolute top-4 right-4">
            <div className="group relative">
              <Info
                size={18}
                className="text-slate-600 hover:text-slate-400 cursor-help"
              />
              <div className="absolute right-0 top-6 w-48 bg-slate-800 text-xs text-slate-300 p-2 rounded shadow-xl border border-slate-700 hidden group-hover:block z-50">
                Heat increases by 1% per asset. Identical groups (e.g., Short
                USD) add a +0.5% correlation penalty for every extra position.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortfolioHeatGame;
