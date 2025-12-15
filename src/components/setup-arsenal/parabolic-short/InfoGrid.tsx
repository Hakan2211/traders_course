
import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import RiskIndicator from './RiskIndicator';

interface DetailItemProps {
  label: string;
  value: React.ReactNode;
  accentColor: 'red' | 'green';
  fullWidth?: boolean;
}

const DetailItem: React.FC<DetailItemProps> = ({
  label,
  value,
  accentColor,
  fullWidth,
}) => (
  <motion.div
    className={cn(
      'bg-slate-900/40 p-4 rounded-xl border-l-4 backdrop-blur-sm',
      accentColor === 'red' ? 'border-l-red-500' : 'border-l-green-500',
      fullWidth ? 'col-span-2' : 'col-span-2 md:col-span-1'
    )}
    whileHover={{ scale: 1.02, backgroundColor: 'rgba(15, 23, 42, 0.6)' }}
    transition={{ duration: 0.2 }}
  >
    <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
      {label}
    </div>
    <div className="text-slate-200 font-medium text-lg leading-snug">
      {value}
    </div>
  </motion.div>
);

interface InfoGridProps {
  mode: 'short' | 'long';
}

const InfoGrid: React.FC<InfoGridProps> = ({ mode }) => {
  const isShort = mode === 'short';
  const accent = isShort ? 'red' : 'green';

  return (
    <div className="grid grid-cols-2 gap-4">
      <DetailItem
        label="Category"
        accentColor={accent}
        value={
          <span className={isShort ? 'text-red-400' : 'text-green-400'}>
            {isShort
              ? 'Mean Reversion / Exhaustion'
              : 'Reversal / Mean Reversion'}
          </span>
        }
      />
      <DetailItem
        label="Complementary Setup"
        accentColor={accent}
        value={
          <span className={!isShort ? 'text-red-400' : 'text-green-400'}>
            {isShort ? 'Panic Dip Buy' : 'Parabolic Short'}
          </span>
        }
      />
      <DetailItem
        label="Time of Day"
        accentColor={accent}
        value={
          <>
            {isShort ? '9:30 AM - 4:00 PM' : '9:30 AM - 11:00 AM'}
            <div className="text-xs text-slate-500 mt-1">
              ⚠️ Avoid Pre-Market / After Hours
            </div>
          </>
        }
      />
      <DetailItem
        label="Ideal Timeframe"
        accentColor={accent}
        value={
          <>
            Entry:{' '}
            <span className={isShort ? 'text-red-400' : 'text-green-400'}>
              {isShort ? '1-5min' : '5min'}
            </span>{' '}
            | Exit:{' '}
            <span className="text-amber-400 ml-1">
              {isShort ? '5-15min' : '5-30min'}
            </span>
          </>
        }
      />
      <DetailItem
        label="Risk Level"
        accentColor={accent}
        value={<RiskIndicator />}
      />
      <DetailItem
        label="Avg. Success Rate"
        accentColor={accent}
        value={
          <div className="w-full">
            <div className="flex justify-between mb-1 text-amber-400">
              <span>{isShort ? '50-65%' : '45-60%'}</span>
            </div>
            <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
              <motion.div
                className={cn(
                  'h-full',
                  isShort
                    ? 'bg-gradient-to-r from-red-500 to-red-700'
                    : 'bg-gradient-to-r from-green-500 to-green-700'
                )}
                initial={{ width: 0 }}
                animate={{ width: isShort ? '57%' : '52%' }}
                transition={{ duration: 1, delay: 0.5 }}
              />
            </div>
          </div>
        }
      />
      <DetailItem
        label="Volume Requirement"
        accentColor={accent}
        value={
          <>
            {isShort ? 'MASSIVE & Increasing' : 'CLIMAX Volume'}
            <div className="text-xs text-slate-500 mt-1">
              {isShort
                ? 'Volume acceleration = fuel'
                : 'Washout = capitulation signal'}
            </div>
          </>
        }
      />
      <DetailItem
        label="Risk / Reward"
        accentColor={accent}
        value={
          <span className="text-green-400">
            1:2 to {isShort ? '1:4+' : '1:5+'}
          </span>
        }
      />
      <DetailItem
        fullWidth
        label="Required Catalyst"
        accentColor={accent}
        value={
          <div>
            <span className="text-amber-400 block mb-2">
              {isShort ? 'VARIABLE (After Consolidation)' : 'CONTEXT-DEPENDENT'}
            </span>
            <ul className="text-sm text-slate-400 space-y-1 list-disc list-inside">
              {isShort ? (
                <>
                  <li>Can occur after consolidation break</li>
                  <li>
                    Wait for{' '}
                    <span className="text-amber-400 font-bold">EXHAUSTION</span>{' '}
                    candle
                  </li>
                  <li>NEVER step in front of parabolic move</li>
                  <li>⚠️ Frontside goes higher than expected</li>
                </>
              ) : (
                <>
                  <li>Multi-day runner (400-800%+) selling off</li>
                  <li>PM strength → Open washout</li>
                  <li>Panic selling / capitulation</li>
                  <li>"Bungee jump" elastic reversion</li>
                </>
              )}
            </ul>
          </div>
        }
      />
    </div>
  );
};

export default InfoGrid;
