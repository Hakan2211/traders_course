
import React, { useState, useEffect, useRef } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  ReferenceLine,
  Tooltip,
  Area,
  AreaChart,
} from 'recharts';
import { Activity, Heart, Zap, Brain, TrendingUp } from 'lucide-react';
import BrainVisual from './BrainVisual';
import { STOCK_DATA, STAGES } from './constants';
import { StageData } from './types';

const BioTelemetryDashboard: React.FC = () => {
  const [activeStageId, setActiveStageId] = useState<number>(1);
  const observerRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Derived state based on active stage
  const currentStage = STAGES.find((s) => s.id === activeStageId) || STAGES[0];
  const chartData = STOCK_DATA.slice(0, currentStage.chartEndIndex + 1);

  // Scrollytelling Logic
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '-40% 0px -40% 0px', // Active when element is in the middle 20% of screen
      threshold: 0.1,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const index = Number(entry.target.getAttribute('data-index'));
          setActiveStageId(index);
        }
      });
    }, observerOptions);

    observerRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="bg-slate-900 min-h-screen text-slate-50 font-sans selection:bg-blue-500/30">
      <div className="flex flex-col lg:flex-row">
        {/* --- LEFT: SCROLLING NARRATIVE --- */}
        <div className="w-full lg:w-5/12 p-6 lg:p-12 relative z-10">
          <header className="mb-20 pt-10">
            <div className="inline-block px-3 py-1 bg-blue-900/30 border border-blue-500/30 rounded-full text-blue-400 text-xs font-bold mb-4">
              INTERACTIVE MODULE
            </div>
            <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight mb-4">
              The Bio-Telemetry <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
                Dashboard
              </span>
            </h1>
            <p className="text-slate-400 text-lg leading-relaxed">
              Scroll down to witness the direct correlation between price action
              and biological reaction.
            </p>
          </header>

          <div className="space-y-[60vh] pb-[50vh]">
            {STAGES.map((stage, idx) => (
              <div
                key={stage.id}
                ref={(el) => {
                  observerRefs.current[idx] = el;
                }}
                data-index={stage.id}
                className={`transition-opacity duration-500 ${
                  activeStageId === stage.id ? 'opacity-100' : 'opacity-30'
                }`}
              >
                <div className="mb-2 flex items-center gap-3">
                  <span className="text-slate-500 font-mono text-sm">
                    {stage.subtitle}
                  </span>
                  {activeStageId === stage.id && (
                    <span className="animate-pulse w-2 h-2 rounded-full bg-emerald-500"></span>
                  )}
                </div>
                <h2 className="text-2xl font-bold mb-6 text-white">
                  {stage.title}
                </h2>
                {stage.content}
              </div>
            ))}
          </div>
        </div>

        {/* --- RIGHT: STICKY DASHBOARD --- */}
        <div className="w-full lg:w-7/12 sticky top-0 h-screen bg-slate-950 border-l border-slate-800 flex flex-col overflow-hidden">
          {/* Top Bar: Key Stats */}
          <div className="h-16 border-b border-slate-800 flex items-center justify-between px-6 bg-slate-900/50 backdrop-blur-sm z-20">
            <div className="flex items-center gap-4">
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">
                  P&L (Open)
                </span>
                <span
                  className={`font-mono font-bold text-lg ${
                    chartData[chartData.length - 1].price < 73.5
                      ? 'text-red-400'
                      : 'text-emerald-400'
                  }`}
                >
                  {(
                    (chartData[chartData.length - 1].price - 73.5) *
                    200
                  ).toLocaleString('en-US', {
                    style: 'currency',
                    currency: 'USD',
                  })}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  currentStage.isCrisis
                    ? 'bg-red-500 animate-ping'
                    : 'bg-emerald-500'
                }`}
              ></div>
              <span className="text-xs font-mono text-slate-400">
                LIVE FEED
              </span>
            </div>
          </div>

          <div className="flex-1 flex flex-col lg:flex-row h-full relative">
            {/* BREATH PACER OVERLAY (Stage 6) */}
            {currentStage.isIntervention && (
              <div className="absolute inset-0 z-50 bg-slate-950/80 flex flex-col items-center justify-center backdrop-blur-sm animate-in fade-in duration-500">
                <div className="w-64 h-64 rounded-full border-4 border-blue-500/30 flex items-center justify-center animate-breath relative">
                  <div className="absolute inset-0 rounded-full bg-blue-500/10 blur-xl"></div>
                  <span className="text-2xl font-bold text-blue-100">
                    BREATHE
                  </span>
                </div>
                <p className="mt-8 text-blue-200 font-mono">
                  Vagus Nerve Stimulation Active
                </p>
              </div>
            )}

            {/* Sub-Panel 1: The Biology (Left side of dashboard) */}
            <div className="lg:w-1/3 p-6 border-r border-slate-800 flex flex-col gap-6 bg-slate-925 relative overflow-hidden">
              {/* Crisis Flash Background */}
              <div
                className={`absolute inset-0 bg-red-500/10 pointer-events-none transition-opacity duration-300 ${
                  currentStage.isCrisis
                    ? 'opacity-100 animate-pulse'
                    : 'opacity-0'
                }`}
              ></div>

              {/* Brain State */}
              <div className="flex-1 flex flex-col relative">
                <h3 className="text-xs uppercase text-slate-500 font-bold mb-2 flex items-center gap-2">
                  <Brain size={14} /> Neural State
                </h3>
                <div className="flex-1 bg-slate-900/50 rounded-xl border border-slate-800 shadow-inner">
                  <BrainVisual
                    region={currentStage.brain.activeRegion}
                    status={currentStage.brain.status}
                  />
                </div>
              </div>

              {/* Metrics Bars */}
              <div className="flex-1 flex flex-col justify-end space-y-6">
                {/* HR */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Heart size={12} /> HR
                    </span>
                    <span
                      className={
                        currentStage.metrics.hr > 100
                          ? 'text-red-400 animate-pulse font-bold'
                          : 'text-slate-200'
                      }
                    >
                      {currentStage.metrics.hr} BPM
                    </span>
                  </div>
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ease-out ${
                        currentStage.metrics.hr > 100
                          ? 'bg-red-500'
                          : 'bg-yellow-400'
                      }`}
                      style={{
                        width: `${(currentStage.metrics.hr / 140) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>

                {/* Cortisol */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Zap size={12} /> CORTISOL
                    </span>
                    <span
                      className={
                        currentStage.metrics.cortisol > 50
                          ? 'text-red-400 font-bold'
                          : 'text-slate-200'
                      }
                    >
                      {currentStage.metrics.cortisol}%
                    </span>
                  </div>
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-red-500 rounded-full transition-all duration-700 ease-out"
                      style={{ width: `${currentStage.metrics.cortisol}%` }}
                    ></div>
                  </div>
                </div>

                {/* Dopamine */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Activity size={12} /> DOPAMINE
                    </span>
                    <span className="text-slate-200">
                      {currentStage.metrics.dopamine}%
                    </span>
                  </div>
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-700 ease-out"
                      style={{ width: `${currentStage.metrics.dopamine}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sub-Panel 2: The Chart (Right side of dashboard) */}
            <div className="lg:w-2/3 flex flex-col bg-slate-950 relative">
              <div className="p-4 border-b border-slate-800 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <TrendingUp size={16} className="text-slate-400" />
                  <span className="font-mono text-sm font-bold text-slate-200">
                    XYZ Tech
                  </span>
                </div>
                <div className="flex gap-4 text-xs font-mono text-slate-500">
                  <span>1M</span>
                  <span>5M</span>
                  <span className="text-slate-200 font-bold border-b border-blue-500">
                    15M
                  </span>
                  <span>1H</span>
                </div>
              </div>

              <div className="flex-1 w-full h-full p-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <defs>
                      <linearGradient
                        id="colorPrice"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#3b82f6"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor="#3b82f6"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="time" hide={true} />
                    <YAxis
                      domain={[72.0, 74.0]}
                      orientation="right"
                      tick={{
                        fill: '#64748b',
                        fontSize: 10,
                        fontFamily: 'monospace',
                      }}
                      tickCount={6}
                      axisLine={false}
                      tickLine={false}
                    />

                    {/* Entry Line */}
                    <ReferenceLine
                      y={73.5}
                      stroke="#10b981"
                      strokeDasharray="3 3"
                      label={{
                        position: 'left',
                        value: 'ENTRY',
                        fill: '#10b981',
                        fontSize: 10,
                      }}
                    />

                    {/* Stop Line */}
                    <ReferenceLine
                      y={72.2}
                      stroke="#ef4444"
                      strokeDasharray="3 3"
                      label={{
                        position: 'left',
                        value: 'STOP',
                        fill: '#ef4444',
                        fontSize: 10,
                      }}
                    />

                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1e293b',
                        borderColor: '#334155',
                        color: '#f8fafc',
                      }}
                      itemStyle={{ color: '#f8fafc' }}
                      labelStyle={{ color: '#94a3b8' }}
                    />

                    <Line
                      type="monotone"
                      dataKey="price"
                      stroke={
                        activeStageId >= 4 && activeStageId <= 6
                          ? '#ef4444'
                          : '#3b82f6'
                      }
                      strokeWidth={3}
                      dot={(props) => {
                        // Custom dot only for the last point
                        if (props.index === chartData.length - 1) {
                          return (
                            <circle
                              cx={props.cx}
                              cy={props.cy}
                              r={6}
                              fill={
                                activeStageId >= 4 && activeStageId <= 6
                                  ? '#ef4444'
                                  : '#3b82f6'
                              }
                              stroke="white"
                              strokeWidth={2}
                            >
                              <animate
                                attributeName="r"
                                values="6;8;6"
                                dur="1.5s"
                                repeatCount="indefinite"
                              />
                            </circle>
                          );
                        }
                        return <></>;
                      }}
                      isAnimationActive={false} // Disable recharts animation to control it via scroll state
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BioTelemetryDashboard;
