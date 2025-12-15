
import React from 'react';
import { motion } from 'framer-motion';
import { Asset, AssetType, CorrelationGroup } from './types';
import { Plus, X, Activity, TrendingUp, DollarSign, Cpu } from 'lucide-react';

interface AssetCardProps {
  asset: Asset;
  isSelected: boolean;
  onToggle: (asset: Asset) => void;
  disabled?: boolean;
}

const AssetCard: React.FC<AssetCardProps> = ({
  asset,
  isSelected,
  onToggle,
  disabled,
}) => {
  const getIcon = () => {
    if (asset.correlationGroup === CorrelationGroup.TECH) {
      return <Cpu className="w-4 h-4 text-purple-400" />;
    }

    switch (asset.type) {
      case AssetType.FOREX:
        return <DollarSign className="w-4 h-4 text-emerald-400" />;
      case AssetType.STOCK:
        return <Activity className="w-4 h-4 text-blue-400" />;
      case AssetType.COMMODITY:
        return <TrendingUp className="w-4 h-4 text-yellow-400" />;
      default:
        return <Activity className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <motion.div
      layout
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      onClick={() => !disabled && onToggle(asset)}
      className={`
        relative p-3 rounded-lg border cursor-pointer transition-all duration-200 group
        ${
          isSelected
            ? 'bg-slate-800 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.2)]'
            : 'bg-slate-800/50 border-slate-700 hover:border-slate-600 hover:bg-slate-800'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed grayscale' : ''}
      `}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-slate-900/50 border border-slate-700/50">
            {getIcon()}
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100 leading-none">
              {asset.symbol}
            </h3>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider">
              {asset.type}
            </span>
          </div>
        </div>
        <div
          className={`
          flex items-center justify-center w-5 h-5 rounded-full border transition-colors
          ${
            isSelected
              ? 'bg-red-500/10 border-red-500 text-red-500'
              : 'bg-emerald-500/10 border-emerald-500 text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white'
          }
        `}
        >
          {isSelected ? <X size={12} /> : <Plus size={12} />}
        </div>
      </div>

      <div className="flex justify-between items-end">
        <div className="text-xs text-slate-500">{asset.description}</div>
        <div className="text-xs font-mono font-bold text-slate-300">
          Risk:{' '}
          <span className={isSelected ? 'text-white' : 'text-slate-400'}>
            {asset.baseRisk}%
          </span>
        </div>
      </div>

      {isSelected && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 rounded-lg border-2 border-blue-500 pointer-events-none"
        />
      )}
    </motion.div>
  );
};

export default AssetCard;
