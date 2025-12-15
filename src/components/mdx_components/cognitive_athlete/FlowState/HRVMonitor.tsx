
import React, { useState, useEffect } from 'react';
import {
  Activity,
  ShieldAlert,
  Zap,
  Lock,
  Battery,
  Play,
  RotateCcw,
} from 'lucide-react';

type Status = 'optimal' | 'compromised' | 'critical' | 'input';

export const HRVMonitor: React.FC = () => {
  const [baseline, setBaseline] = useState<number | string>('');
  const [current, setCurrent] = useState<number | string>('');
  const [status, setStatus] = useState<Status>('input');
  const [percentage, setPercentage] = useState<number>(0);

  const calculate = () => {
    if (!baseline || !current) return;
    const b = Number(baseline);
    const c = Number(current);
    if (isNaN(b) || isNaN(c) || b === 0) return;

    const ratio = c / b;
    const pct = ratio * 100;
    setPercentage(pct);

    if (ratio >= 0.95) setStatus('optimal'); // > 95% of baseline
    else if (ratio >= 0.8) setStatus('compromised'); // 80-94%
    else setStatus('critical'); // < 80%
  };

  const reset = () => {
    setBaseline('');
    setCurrent('');
    setStatus('input');
    setPercentage(0);
  };

  const getStatusColor = () => {
    switch (status) {
      case 'optimal':
        return 'text-emerald-400 border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.3)]';
      case 'compromised':
        return 'text-amber-400 border-amber-500 shadow-[0_0_30px_rgba(245,158,11,0.3)]';
      case 'critical':
        return 'text-rose-500 border-rose-600 shadow-[0_0_30px_rgba(244,63,94,0.3)]';
      default:
        return 'text-slate-400 border-slate-700';
    }
  };

  const getRingColor = () => {
    switch (status) {
      case 'optimal':
        return '#34d399'; // emerald-400
      case 'compromised':
        return '#fbbf24'; // amber-400
      case 'critical':
        return '#f43f5e'; // rose-500
      default:
        return '#334155'; // slate-700
    }
  };

  return (
    <div className="relative w-full rounded-3xl overflow-hidden border border-slate-800 bg-slate-900/90 backdrop-blur-xl shadow-2xl">
      {/* HUD Header */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-slate-700 to-transparent opacity-50"></div>
      <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-black/20">
        <h2 className="font-mono uppercase text-xs tracking-[0.2em] text-slate-400 flex items-center gap-2">
          <Activity className="w-4 h-4" />
          System Readiness
        </h2>
        <div className="flex gap-1">
          <div
            className={`w-1 h-1 rounded-full ${
              status === 'optimal'
                ? 'bg-emerald-500 animate-pulse'
                : 'bg-slate-700'
            }`}
          ></div>
          <div
            className={`w-1 h-1 rounded-full ${
              status === 'compromised'
                ? 'bg-amber-500 animate-pulse'
                : 'bg-slate-700'
            }`}
          ></div>
          <div
            className={`w-1 h-1 rounded-full ${
              status === 'critical'
                ? 'bg-rose-500 animate-pulse'
                : 'bg-slate-700'
            }`}
          ></div>
        </div>
      </div>

      <div className="p-6 md:p-8 flex flex-col items-center justify-center relative z-10">
        {/* Animated Background Grid */}
        <div
          className="absolute inset-0 z-0 opacity-10"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
            backgroundSize: '20px 20px',
          }}
        ></div>

        {/* The Circular Gauge */}
        <div className="relative w-64 h-64 mb-8 z-10">
          {/* Spinning Rings */}
          <div
            className={`absolute inset-0 rounded-full border border-dashed border-slate-700/50 ${
              status !== 'input' ? 'animate-[spin_10s_linear_infinite]' : ''
            }`}
          ></div>
          <div
            className={`absolute inset-4 rounded-full border border-dotted border-slate-700/50 ${
              status !== 'input'
                ? 'animate-[spin_15s_linear_infinite_reverse]'
                : ''
            }`}
          ></div>

          {/* Main Gauge SVG */}
          <svg className="w-full h-full transform -rotate-90 drop-shadow-lg">
            <circle
              cx="128"
              cy="128"
              r="110"
              stroke="#1e293b"
              strokeWidth="12"
              fill="none"
            />
            <circle
              cx="128"
              cy="128"
              r="110"
              stroke={getRingColor()}
              strokeWidth="12"
              fill="none"
              strokeDasharray="691" // 2 * pi * 110
              strokeDashoffset={
                status === 'input'
                  ? 691
                  : 691 - 691 * (Math.min(percentage, 100) / 100)
              }
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />
          </svg>

          {/* Center Content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {status === 'input' ? (
              <div className="text-center animate-pulse text-slate-500">
                <Battery className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <span className="font-mono text-xs uppercase tracking-widest">
                  Awaiting Data
                </span>
              </div>
            ) : (
              <div className="text-center">
                <span
                  className={`text-5xl font-bold font-mono block mb-1 drop-shadow-md ${
                    getStatusColor().split(' ')[0]
                  }`}
                >
                  {percentage.toFixed(0)}%
                </span>
                <span className="text-xs uppercase tracking-widest text-slate-500 font-semibold">
                  of Baseline
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Inputs / Results Switcher */}
        {status === 'input' ? (
          <div className="w-full space-y-4 z-10">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-mono uppercase text-slate-500 ml-1">
                  Baseline HRV
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={baseline}
                    onChange={(e) => setBaseline(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-center text-slate-200 font-mono focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
                    placeholder="e.g. 70"
                  />
                  <span className="absolute right-3 top-3 text-slate-600 text-xs font-mono">
                    ms
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-mono uppercase text-slate-500 ml-1">
                  Today's HRV
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={current}
                    onChange={(e) => setCurrent(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-center text-slate-200 font-mono focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
                    placeholder="e.g. 58"
                  />
                  <span className="absolute right-3 top-3 text-slate-600 text-xs font-mono">
                    ms
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={calculate}
              disabled={!baseline || !current}
              className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/50"
            >
              <Play className="w-4 h-4 fill-current" />
              INITIATE ANALYSIS
            </button>
          </div>
        ) : (
          <div className="w-full space-y-4 z-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Status Box */}
            <div
              className={`p-4 rounded-xl border-l-4 bg-slate-800/50 ${getStatusColor()}`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className="font-mono text-xs uppercase tracking-widest font-bold">
                  Status
                </span>
                {status === 'optimal' && <Zap className="w-5 h-5" />}
                {status === 'compromised' && (
                  <ShieldAlert className="w-5 h-5" />
                )}
                {status === 'critical' && <Lock className="w-5 h-5" />}
              </div>
              <div className="text-2xl font-bold uppercase tracking-tight mb-1">
                {status === 'optimal'
                  ? 'SYSTEM OPTIMAL'
                  : status === 'compromised'
                  ? 'COMPROMISED'
                  : 'CRITICAL LOCK'}
              </div>
            </div>

            {/* Protocol Box */}
            <div className="space-y-2">
              <h3 className="font-mono text-xs uppercase text-slate-500">
                Recommended Protocol
              </h3>
              <div className="bg-slate-950 rounded-xl p-4 border border-slate-800">
                {status === 'optimal' && (
                  <ul className="space-y-2 text-sm text-emerald-300">
                    <li className="flex items-center gap-2">
                      <span className="text-emerald-500">✓</span> Full Position
                      Sizing
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-emerald-500">✓</span> Aggressive
                      Execution
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-emerald-500">✓</span> Extended
                      Session Allowed
                    </li>
                  </ul>
                )}
                {status === 'compromised' && (
                  <ul className="space-y-2 text-sm text-amber-300">
                    <li className="flex items-center gap-2">
                      <span className="text-amber-500">⚠</span> Reduce Size by
                      50%
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-amber-500">⚠</span> A+ Setups ONLY
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-amber-500">⚠</span> Limit Session
                      Duration (&lt; 2hrs)
                    </li>
                  </ul>
                )}
                {status === 'critical' && (
                  <ul className="space-y-2 text-sm text-rose-300">
                    <li className="flex items-center gap-2">
                      <span className="text-rose-500">⛔</span> NO TRADING
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-rose-500">⛔</span> Focus on
                      Recovery Protocol
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-rose-500">⛔</span> Paper Trading
                      Only
                    </li>
                  </ul>
                )}
              </div>
            </div>

            <button
              onClick={reset}
              className="w-full bg-slate-800 hover:bg-slate-700 text-slate-400 text-sm font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              RECALIBRATE
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
