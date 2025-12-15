
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  BookOpen,
  Target,
  Info,
  Lightbulb,
  ShieldAlert,
} from 'lucide-react';
import { Badge } from './ui/Badge';
import { RiskMeter } from './ui/RiskMeter';
import { LessonTabs, TabType } from './LessonTabs';
import { CycleDiagram } from './CycleDiagram';
import { cn } from '../../../lib/utils';

const ReverseSplitLesson: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('long');

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8 pb-20">
      {/* Header Section */}
      <div className="text-center mb-8 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-24 bg-blue-500/20 blur-[100px] rounded-full -z-10"></div>
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-blue-400 to-blue-200"
        >
          Reverse Split Strategy
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-lg text-slate-400 max-w-2xl mx-auto"
        >
          Mastering the manipulation cycle: Float Reduction → Pump → Dilution
        </motion.p>
      </div>

      {/* Warning Banner */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="mx-auto max-w-3xl mb-10 bg-gradient-to-r from-amber-500/10 to-red-500/10 border border-amber-500/30 rounded-xl p-4 flex items-start gap-4"
      >
        <div className="p-2 bg-amber-500/20 rounded-lg text-amber-400 shrink-0">
          <AlertTriangle size={24} />
        </div>
        <div>
          <h3 className="text-amber-300 font-bold text-lg mb-1">
            Advanced Manipulation Play
          </h3>
          <p className="text-amber-200/70 text-sm leading-relaxed">
            These setups trade company desperation mechanics. Extremely high
            risk. Timing is unpredictable. Requires deep understanding of
            listing requirements.
          </p>
        </div>
      </motion.div>

      {/* Tabs */}
      <LessonTabs activeTab={activeTab} onChange={setActiveTab} />

      {/* Main Content Area */}
      <div className="min-h-[600px]">
        <AnimatePresence mode="wait">
          {/* LONG TAB */}
          {activeTab === 'long' && (
            <motion.div
              key="long"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Setup Card */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-slate-900/60 backdrop-blur-md border border-slate-700/50 rounded-2xl p-6 lg:p-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/5 blur-[80px] rounded-full -translate-y-1/2 translate-x-1/2"></div>

                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                          <TrendingUp className="text-green-400" />
                          Long Setup
                        </h2>
                        <p className="text-slate-400 text-sm">
                          Anticipating the post-split pump
                        </p>
                      </div>
                      <Badge variant="long">LONG ↗</Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                      <DetailRow
                        label="Category"
                        value="Manipulation / Anticipation"
                        valueColor="text-blue-400"
                      />
                      <DetailRow
                        label="Timeframe"
                        value="Daily Tracking (Entry 5-15m)"
                      />
                      <div className="col-span-1 md:col-span-2">
                        <RiskMeter level={5} />
                      </div>
                      <div className="col-span-1 md:col-span-2">
                        <div className="flex justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                          <span>Success Rate</span>
                          <span className="text-amber-400">50-65%</span>
                        </div>
                        <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: '60%' }}
                            transition={{ duration: 1, delay: 0.5 }}
                            className="h-full bg-gradient-to-r from-blue-500 to-green-500"
                          />
                        </div>
                      </div>
                      <DetailRow
                        label="Risk/Reward"
                        value="1:3 to 1:10+"
                        valueColor="text-green-400"
                      />
                      <DetailRow
                        label="Float Req."
                        value="< 3M SHARES (Required)"
                        valueColor="text-amber-400"
                      />
                      <div className="col-span-1 md:col-span-2 bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                          Required Catalyst
                        </div>
                        <div className="font-bold text-blue-300 mb-2">
                          ✓ Reverse Split Effectiveness
                        </div>
                        <ul className="text-sm text-slate-400 space-y-1 list-disc list-inside">
                          <li>Company desperate to avoid delisting</li>
                          <li>
                            Entry: Consolidation or after red days post-split
                          </li>
                          <li>Timing: Same day to 2 weeks after R/S</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sidebar - Entry Timing */}
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-slate-200 px-2 flex items-center gap-2">
                    <Target className="w-5 h-5 text-blue-400" />
                    Entry Timing
                  </h3>

                  <TimelineCard
                    number="1"
                    title="Same Day"
                    desc="Very aggressive. High risk of consolidation before pump."
                    color="border-red-500/30"
                  />
                  <TimelineCard
                    number="2"
                    title="Consolidation"
                    desc="Preferred. 2-7 days post-split. Position in base, stop below low."
                    color="border-green-500/30"
                    highlight
                  />
                  <TimelineCard
                    number="3"
                    title="Red Days"
                    desc="Anticipate reversal after several red days. Requires patience."
                    color="border-blue-500/30"
                  />
                  <TimelineCard
                    number="4"
                    title="Volume Confirmation"
                    desc="Too Late. Move happens fast. This is an anticipation setup."
                    color="border-slate-700"
                    muted
                  />

                  {/* Strategy Insight Box */}
                  <div className="bg-gradient-to-br from-slate-900 to-slate-900/50 border border-blue-500/20 rounded-xl p-5 mt-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Lightbulb className="w-4 h-4 text-blue-400" />
                      <h4 className="text-blue-200 font-bold text-sm uppercase tracking-wider">
                        Strategy Insight
                      </h4>
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed mb-3">
                      <strong className="text-white block mb-1">
                        Why it works:
                      </strong>
                      Company{' '}
                      <span className="text-blue-400 font-semibold">NEEDS</span>{' '}
                      to pump to meet requirements. Lower float makes it easy.
                    </p>
                    <div className="pt-3 border-t border-slate-700/50">
                      <p className="text-xs text-amber-400/90 leading-relaxed">
                        <strong className="text-amber-400">
                          Key Challenge:
                        </strong>{' '}
                        Timing is unpredictable. Position small and wait for the
                        catalyst.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* SHORT TAB */}
          {activeTab === 'short' && (
            <motion.div
              key="short"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-slate-900/60 backdrop-blur-md border border-slate-700/50 rounded-2xl p-6 lg:p-8 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/5 blur-[80px] rounded-full -translate-y-1/2 translate-x-1/2"></div>

                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                        <TrendingDown className="text-red-400" />
                        Short Setup
                      </h2>
                      <p className="text-slate-400 text-sm">
                        Fading the inevitable dilution
                      </p>
                    </div>
                    <Badge variant="short">SHORT ↘</Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    <DetailRow
                      label="Category"
                      value="Dilution / Distribution"
                      valueColor="text-red-400"
                    />
                    <DetailRow
                      label="Timeframe"
                      value="Daily Context (Entry 5-15m)"
                    />
                    <div className="col-span-1 md:col-span-2">
                      <RiskMeter level={5} />
                    </div>
                    <div className="col-span-1 md:col-span-2">
                      <div className="flex justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                        <span>Success Rate</span>
                        <span className="text-amber-400">55-70%</span>
                      </div>
                      <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: '65%' }}
                          transition={{ duration: 1, delay: 0.5 }}
                          className="h-full bg-gradient-to-r from-red-500 to-amber-500"
                        />
                      </div>
                    </div>
                    <DetailRow
                      label="Risk/Reward"
                      value="1:2 to 1:5"
                      valueColor="text-amber-400"
                    />
                    <DetailRow
                      label="Volume Req."
                      value="High Volume (Distribution)"
                    />
                    <div className="col-span-1 md:col-span-2 bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                      <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                        Required Catalyst
                      </div>
                      <div className="font-bold text-red-300 mb-2">
                        ✓ Post-Pump Offering / Dilution
                      </div>
                      <ul className="text-sm text-slate-400 space-y-1 list-disc list-inside">
                        <li>Company files offering to raise cash</li>
                        <li>Takes advantage of inflated price</li>
                        <li>
                          <span className="text-amber-400">WARNING:</span>{' '}
                          Locates are extremely hard to find
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Sidebar - Short Insights */}
                <div className="space-y-4">
                  <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-5">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                      <ShieldAlert className="w-5 h-5 text-red-400" />
                      Key Challenges
                    </h3>
                    <div className="space-y-4">
                      <div className="p-3 bg-red-950/20 border border-red-500/20 rounded-lg">
                        <h4 className="text-sm font-bold text-red-300 mb-1">
                          Locate Scarcity
                        </h4>
                        <p className="text-xs text-slate-400">
                          Since float is reduced (e.g. 1-for-20 split), shares
                          available to short are scarce. Borrow fees often
                          exceed 100%.
                        </p>
                      </div>
                      <div className="p-3 bg-amber-950/20 border border-amber-500/20 rounded-lg">
                        <h4 className="text-sm font-bold text-amber-300 mb-1">
                          Squeeze Risk
                        </h4>
                        <p className="text-xs text-slate-400">
                          If the pump isn't over, low float means price can skip
                          dollars instantly. Must wait for the backside.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Short Strategy Insight */}
                  <div className="bg-gradient-to-br from-slate-900 to-slate-900/50 border border-red-500/20 rounded-xl p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <Lightbulb className="w-4 h-4 text-red-400" />
                      <h4 className="text-red-200 font-bold text-sm uppercase tracking-wider">
                        Strategy Insight
                      </h4>
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed mb-3">
                      <strong className="text-white block mb-1">
                        Why it works:
                      </strong>
                      Dilution is guaranteed. The pattern is reliable because
                      they{' '}
                      <span className="text-red-400 font-semibold">must</span>{' '}
                      sell shares.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* CYCLE TAB */}
          {activeTab === 'cycle' && (
            <motion.div
              key="cycle"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              {/* Visual Diagram */}
              <CycleDiagram />

              {/* Two Column Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Why it exists */}
                <div className="bg-slate-900/40 border border-slate-700/50 rounded-2xl p-6">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <BookOpen className="text-violet-400" size={20} />
                    The "Why"
                  </h3>
                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <div className="w-1 h-full bg-red-500/50 rounded-full shrink-0"></div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-200">
                          Penny Stock Reality
                        </h4>
                        <p className="text-xs text-slate-400 mt-1">
                          No real revenue. Survives by diluting shareholders.
                          Uses market as ATM.
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="w-1 h-full bg-green-500/50 rounded-full shrink-0"></div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-200">
                          The Pump Logic
                        </h4>
                        <p className="text-xs text-slate-400 mt-1">
                          Low float (&lt;3M) is easy to manipulate. Insiders
                          pump to improve equity metrics.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Listing Requirements */}
                <div className="bg-slate-900/40 border border-slate-700/50 rounded-2xl p-6">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Info className="text-blue-400" size={20} />
                    Listing Rules (Nasdaq)
                  </h3>
                  <div className="space-y-3">
                    <RequirementItem
                      title="Min Bid Price"
                      value="$1.00"
                      sub="Primary reason for R/S"
                    />
                    <RequirementItem
                      title="Stockholders' Equity"
                      value="$2.5M+"
                    />
                    <RequirementItem
                      title="Public Float Value"
                      value="$1M - $15M"
                    />
                    <RequirementItem
                      title="SEC Reporting"
                      value="Compliance"
                      sub="Timely filings & Audit commitee"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

// Sub-components for cleaner code
const DetailRow: React.FC<{
  label: string;
  value: string;
  valueColor?: string;
}> = ({ label, value, valueColor = 'text-slate-200' }) => (
  <div>
    <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
      {label}
    </div>
    <div className={`font-bold text-lg ${valueColor}`}>{value}</div>
  </div>
);

const TimelineCard: React.FC<{
  number: string;
  title: string;
  desc: string;
  color: string;
  highlight?: boolean;
  muted?: boolean;
}> = ({ number, title, desc, color, highlight, muted }) => (
  <div
    className={cn(
      'relative p-4 rounded-xl border bg-slate-800/40 transition-all duration-300 hover:bg-slate-800/60',
      color,
      highlight
        ? 'ring-1 ring-green-500/40 bg-green-900/10'
        : 'border-slate-700',
      muted ? 'opacity-70' : 'opacity-100'
    )}
  >
    <div className="flex items-center gap-3 mb-2">
      <div
        className={cn(
          'flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold',
          highlight
            ? 'bg-green-500 text-green-950'
            : 'bg-slate-700 text-slate-300'
        )}
      >
        {number}
      </div>
      <h4
        className={cn(
          'font-bold',
          highlight ? 'text-green-300' : 'text-slate-200'
        )}
      >
        {title}
      </h4>
    </div>
    <p className="text-xs text-slate-400 leading-relaxed pl-9">{desc}</p>
  </div>
);

const RequirementItem: React.FC<{
  title: string;
  value: string;
  sub?: string;
}> = ({ title, value, sub }) => (
  <div className="flex justify-between items-center p-3 bg-slate-950/30 rounded-lg border border-slate-800">
    <span className="text-sm text-slate-400">{title}</span>
    <div className="text-right">
      <div className="text-sm font-bold text-white">{value}</div>
      {sub && <div className="text-[10px] text-amber-500">{sub}</div>}
    </div>
  </div>
);

export default ReverseSplitLesson;
