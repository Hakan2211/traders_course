
import React from 'react';
import { Zap, AlertTriangle, CheckCircle, Skull } from 'lucide-react';
import { SystemStatus } from './types';

interface SystemLoadBarProps {
  load: number;
  status: SystemStatus;
}

export const SystemLoadBar: React.FC<SystemLoadBarProps> = ({
  load,
  status,
}) => {
  // Cap visual width at 100% for the main bar, but we treat >100 as failure
  const visualPercentage = Math.min(load, 100);

  const getStatusColor = () => {
    switch (status) {
      case 'OPTIMAL':
        return 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]';
      case 'STRAINED':
        return 'bg-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.5)]';
      case 'CRITICAL':
        return 'bg-orange-600 shadow-[0_0_15px_rgba(234,88,12,0.6)]';
      case 'FAILURE':
        return 'bg-red-600 shadow-[0_0_20px_rgba(220,38,38,0.9)]';
      default:
        return 'bg-emerald-500';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'OPTIMAL':
        return <CheckCircle className="w-6 h-6 text-emerald-500" />;
      case 'STRAINED':
        return <Zap className="w-6 h-6 text-yellow-500" />;
      case 'CRITICAL':
        return (
          <AlertTriangle className="w-6 h-6 text-orange-500 animate-pulse" />
        );
      case 'FAILURE':
        return <Skull className="w-6 h-6 text-red-600 animate-bounce" />;
    }
  };

  return (
    <div className="w-full space-y-2">
      <div className="flex justify-between items-end mb-1">
        <div className="flex items-center gap-2">
          {getStatusIcon()}
          <span
            className={`text-sm font-bold tracking-wider ${
              status === 'FAILURE'
                ? 'text-red-600 animate-pulse'
                : 'text-slate-300'
            }`}
          >
            SYSTEM INTEGRITY
          </span>
        </div>
        <div className="text-right">
          <span
            className={`text-3xl font-black ${
              status === 'FAILURE' ? 'text-red-600' : 'text-white'
            }`}
          >
            {load}%
          </span>
          <span className="text-xs text-slate-400 font-medium ml-1">LOAD</span>
        </div>
      </div>
      <div className="relative h-12 bg-slate-800/50 rounded-lg overflow-hidden border border-slate-700 shadow-inner">
        {/* Grid lines for calibration */}
        <div className="absolute inset-0 z-10 grid grid-cols-4 w-full h-full pointer-events-none">
          <div className="border-r border-slate-700/50 h-full"></div>
          <div className="border-r border-slate-700/50 h-full"></div>
          <div className="border-r border-slate-700/50 h-full"></div>
        </div>
        {/* The Fill Bar */}
        <div
          className={`h-full transition-all duration-500 ease-out relative ${getStatusColor()} ${
            status === 'FAILURE' ? 'animate-pulse' : ''
          }`}
          style={{ width: `${visualPercentage}%` }}
        >
          {/* Striped pattern overlay */}
          <div
            className="absolute inset-0 w-full h-full opacity-20"
            style={{
              backgroundImage:
                'linear-gradient(45deg,rgba(255,255,255,.15) 25%,transparent 25%,transparent 50%,rgba(255,255,255,.15) 50%,rgba(255,255,255,.15) 75%,transparent 75%,transparent)',
              backgroundSize: '1rem 1rem',
            }}
          />
        </div>
        {/* Danger Threshold Line */}
        <div className="absolute top-0 bottom-0 right-0 w-1 bg-red-500/30 z-20 border-l border-red-500 border-dashed"></div>
      </div>

      <div className="flex justify-between text-xs font-mono text-slate-400">
        <span>0%</span>
        <span>25%</span>
        <span>50%</span>
        <span>75%</span>
        <span className="text-red-500 font-bold">100% (FAILURE)</span>
      </div>
    </div>
  );
};
