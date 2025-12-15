import React from 'react';
import { ChartPoint, StageData } from './types';
import { AlertTriangle, Brain, CheckCircle, Activity, Zap } from 'lucide-react';

export const STOCK_DATA: ChartPoint[] = [
  { time: '10:45', price: 73.1 },
  { time: '10:46', price: 73.2 },
  { time: '10:47', price: 73.45, annotation: 'Breakout' },
  { time: '10:47:15', price: 73.5, annotation: 'ENTRY' },
  { time: '10:48', price: 73.7 },
  { time: '10:48:30', price: 73.85, annotation: 'Peak' },
  { time: '10:49', price: 73.7 },
  { time: '10:49:30', price: 73.5 },
  { time: '10:50', price: 73.3 },
  { time: '10:51', price: 73.0 },
  { time: '10:52', price: 72.8 },
  { time: '10:52:15', price: 72.5, annotation: 'DANGER' },
  { time: '10:52:30', price: 72.5, annotation: 'Decision' },
  { time: '10:53', price: 72.3 },
  { time: '10:53:15', price: 72.2, annotation: 'STOP HIT' },
  { time: '10:55', price: 72.1 },
  { time: '11:00', price: 72.15 },
  { time: '11:15', price: 72.0 },
  { time: '11:30', price: 72.4 }, // Next trade setup
  { time: '11:35', price: 72.8 },
];

export const STAGES: StageData[] = [
  {
    id: 1,
    title: 'Stage 1: Setup Recognition',
    subtitle: 'T-30 seconds',
    content: (
      <div className="space-y-4">
        <p className="text-lg text-slate-300">
          The chart pattern matches. Your temporal lobe identifies the
          "Breakout." The Prefrontal Cortex (PFC) runs the checklist.
        </p>
        <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
          <div className="flex items-center gap-2 mb-2 text-yellow-400 font-bold">
            <Brain size={18} /> Neural Activity
          </div>
          <p className="text-sm text-slate-400">
            Pattern match found. Dopamine spikes slightly (15%) signaling
            potential reward.
          </p>
        </div>
      </div>
    ),
    metrics: { hr: 74, cortisol: 10, dopamine: 30 },
    brain: { activeRegion: 'PFC', status: 'Calm' },
    chartEndIndex: 2,
  },
  {
    id: 2,
    title: 'Stage 2 & 3: Entry Decision',
    subtitle: 'T-0 (Execution)',
    content: (
      <div className="space-y-4">
        <p className="text-lg text-slate-300">
          You click "Buy". The action itself releases dopamine. You are in the
          game. Anticipation is at its peak.
        </p>
        <div className="flex gap-4">
          <div className="bg-emerald-900/30 p-3 rounded border border-emerald-800 flex-1">
            <p className="text-xs text-emerald-400 uppercase font-bold">
              Action
            </p>
            <p className="font-mono text-emerald-200">BUY 200 @ $73.50</p>
          </div>
          <div className="bg-slate-800 p-3 rounded border border-slate-700 flex-1">
            <p className="text-xs text-slate-400 uppercase font-bold">
              Stop Loss
            </p>
            <p className="font-mono text-slate-200">$72.20</p>
          </div>
        </div>
      </div>
    ),
    metrics: { hr: 78, cortisol: 15, dopamine: 65 },
    brain: { activeRegion: 'PFC', status: 'Activated' },
    chartEndIndex: 4,
  },
  {
    id: 3,
    title: 'Stage 4: Adverse Move Begins',
    subtitle: 'T+2 minutes',
    content: (
      <div className="space-y-4">
        <p className="text-lg text-slate-300">
          The trade moves against you. You are now negative. The Insula detects
          "error/pain". Dopamine crashes.
        </p>
        <div className="bg-orange-900/20 p-4 rounded-lg border border-orange-900/50">
          <div className="flex items-center gap-2 mb-2 text-orange-400 font-bold">
            <Zap size={18} /> Biological Shift
          </div>
          <p className="text-sm text-slate-400">
            Loss aversion activates. -$40 feels like -$100. Cortisol begins to
            rise.
          </p>
        </div>
      </div>
    ),
    metrics: { hr: 82, cortisol: 35, dopamine: 10 },
    brain: { activeRegion: 'Amygdala', status: 'Activated' },
    chartEndIndex: 9,
  },
  {
    id: 4,
    title: 'Stage 5: The Crisis',
    subtitle: 'Stop Loss Zone',
    content: (
      <div className="space-y-4">
        <p className="text-lg text-slate-300">
          <span className="text-red-400 font-bold">AMYGDALA HIJACK.</span>{' '}
          <br />
          Price is near the stop. Threat assessment is MAX. Your reptile brain
          is screaming "GET OUT!"
        </p>
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-red-950 border border-red-800 p-2 rounded text-center">
            <span className="text-xs text-red-400 block">Cortisol</span>
            <span className="text-xl font-bold text-red-200">SPIKING</span>
          </div>
          <div className="bg-red-950 border border-red-800 p-2 rounded text-center">
            <span className="text-xs text-red-400 block">PFC</span>
            <span className="text-xl font-bold text-red-200">OFFLINE</span>
          </div>
        </div>
      </div>
    ),
    metrics: { hr: 118, cortisol: 90, dopamine: 0 },
    brain: { activeRegion: 'Amygdala', status: 'Hijacked' },
    chartEndIndex: 11,
    isCrisis: true,
  },
  {
    id: 5,
    title: 'Stage 6: The Intervention',
    subtitle: 'The 6-Second Window',
    content: (
      <div className="space-y-4">
        <p className="text-lg text-slate-300">
          You recognize the hijack. You lean back. You breathe. You force the
          Prefrontal Cortex back online.
        </p>
        <div className="bg-blue-900/20 p-4 rounded-lg border border-blue-800/50">
          <div className="flex items-center gap-2 mb-2 text-blue-400 font-bold">
            <Activity size={18} /> Protocol Active
          </div>
          <p className="text-sm text-blue-200">
            "My stop is $72.20. I trust the system."
          </p>
        </div>
      </div>
    ),
    metrics: { hr: 108, cortisol: 60, dopamine: 10 },
    brain: { activeRegion: 'PFC', status: 'Recovering' },
    chartEndIndex: 12,
    isIntervention: true,
  },
  {
    id: 6,
    title: 'Stage 7: Discipline Execution',
    subtitle: 'Stop Hit ($72.20)',
    content: (
      <div className="space-y-4">
        <p className="text-lg text-slate-300">
          The stop is hit. You lost money, but you saved your mind. The
          Discipline Circuit fires. Unexpected dopamine spike from "doing the
          right thing."
        </p>
        <div className="flex items-center gap-3 p-3 bg-emerald-900/10 border border-emerald-800/50 rounded-lg">
          <CheckCircle className="text-emerald-500" size={24} />
          <div>
            <p className="text-sm text-emerald-400 font-bold">
              Protocol Followed
            </p>
            <p className="text-xs text-slate-400">Neural pathway reinforced.</p>
          </div>
        </div>
      </div>
    ),
    metrics: { hr: 94, cortisol: 30, dopamine: 45 },
    brain: { activeRegion: 'PFC', status: 'Calm' },
    chartEndIndex: 14,
  },
  {
    id: 7,
    title: 'Stage 8: The Rewiring',
    subtitle: 'Post-Trade Analysis',
    content: (
      <div className="space-y-4">
        <p className="text-lg text-slate-300">
          15 minutes later. You journal. You reframe the loss as a "Process
          Win." Neuroplasticity strengthens the discipline habit.
        </p>
      </div>
    ),
    metrics: { hr: 70, cortisol: 15, dopamine: 55 },
    brain: { activeRegion: 'Hippocampus', status: 'Calm' },
    chartEndIndex: 16,
  },
  {
    id: 8,
    title: 'Stage 9: The Next Trade',
    subtitle: 'Resilience',
    content: (
      <div className="space-y-4">
        <p className="text-lg text-slate-300">
          Because you managed the loss correctly, you carry no emotional
          baggage. You take the next setup with full confidence.
        </p>
      </div>
    ),
    metrics: { hr: 72, cortisol: 12, dopamine: 35 },
    brain: { activeRegion: 'PFC', status: 'Calm' },
    chartEndIndex: 19,
  },
];
