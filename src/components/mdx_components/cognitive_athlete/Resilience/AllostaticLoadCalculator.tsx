
import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Briefcase,
  Heart,
  Home,
  Moon,
  AlertCircle,
  DollarSign,
  Users,
  Activity,
  Brain,
  Coffee,
} from 'lucide-react';
import EnvironmentWrapper from '@/components/mdx_components/2d_environment/environmentWrapper';
import { SystemLoadBar } from './SystemLoadBar';
import { StressorToggle } from './StressorToggle';
import { Stressor, SystemStatus } from './types';

const defaultStressors: Stressor[] = [
  {
    id: 'trading_drawdown',
    label: 'Trading Drawdown',
    value: 25,
    icon: DollarSign,
    color: 'text-red-500',
    description: 'Extended losses affecting your account',
  },
  {
    id: 'financial_pressure',
    label: 'Financial Pressure',
    value: 20,
    icon: Briefcase,
    color: 'text-orange-500',
    description: 'Bills, mortgage, or income uncertainty',
  },
  {
    id: 'relationship_stress',
    label: 'Relationship Tension',
    value: 15,
    icon: Users,
    color: 'text-pink-500',
    description: 'Conflict with partner, family, or friends',
  },
  {
    id: 'sleep_deprivation',
    label: 'Sleep Deprivation',
    value: 18,
    icon: Moon,
    color: 'text-blue-500',
    description: 'Consistent lack of quality sleep',
  },
  {
    id: 'health_issues',
    label: 'Health Concerns',
    value: 22,
    icon: Heart,
    color: 'text-red-400',
    description: 'Physical illness or chronic condition',
  },
  {
    id: 'work_stress',
    label: 'Work Pressure',
    value: 15,
    icon: Briefcase,
    color: 'text-yellow-500',
    description: 'Job-related stress or deadlines',
  },
  {
    id: 'family_responsibilities',
    label: 'Family Responsibilities',
    value: 12,
    icon: Home,
    color: 'text-purple-500',
    description: 'Caring for children or elderly parents',
  },
  {
    id: 'no_recovery',
    label: 'No Recovery Protocols',
    value: 20,
    icon: Activity,
    color: 'text-cyan-500',
    description: 'Lack of stress management routines',
  },
  {
    id: 'decision_fatigue',
    label: 'Decision Fatigue',
    value: 15,
    icon: Brain,
    color: 'text-indigo-500',
    description: 'Too many decisions without breaks',
  },
  {
    id: 'substance_use',
    label: 'Substance Use',
    value: 25,
    icon: Coffee,
    color: 'text-amber-500',
    description: 'Using alcohol or drugs to cope',
  },
];

const getSystemStatus = (load: number): SystemStatus => {
  if (load >= 100) return 'FAILURE';
  if (load >= 75) return 'CRITICAL';
  if (load >= 50) return 'STRAINED';
  return 'OPTIMAL';
};

export const AllostaticLoadCalculator: React.FC = () => {
  const [activeStressors, setActiveStressors] = useState<Set<string>>(
    new Set()
  );

  const totalLoad = useMemo(() => {
    return Array.from(activeStressors).reduce((sum, id) => {
      const stressor = defaultStressors.find((s) => s.id === id);
      return sum + (stressor?.value || 0);
    }, 0);
  }, [activeStressors]);

  const systemStatus = useMemo(() => getSystemStatus(totalLoad), [totalLoad]);

  const handleToggle = (id: string) => {
    setActiveStressors((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <EnvironmentWrapper height="auto" className="p-8">
      <div className="w-full max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent flex items-center justify-center gap-3">
            <Activity className="w-8 h-8 text-emerald-400" />
            Allostatic Load Calculator
          </h2>
          <p className="text-slate-400 text-sm max-w-2xl mx-auto">
            Select the stressors currently affecting your life. Your system
            integrity reflects cumulative burden—not just individual events.
          </p>
        </div>

        {/* System Load Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <SystemLoadBar load={totalLoad} status={systemStatus} />
        </motion.div>

        {/* Status Message */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className={`p-4 rounded-xl border-2 ${
            systemStatus === 'OPTIMAL'
              ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-300'
              : systemStatus === 'STRAINED'
              ? 'bg-yellow-500/10 border-yellow-500/50 text-yellow-300'
              : systemStatus === 'CRITICAL'
              ? 'bg-orange-500/10 border-orange-500/50 text-orange-300'
              : 'bg-red-500/10 border-red-500/50 text-red-300'
          }`}
        >
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold mb-1">
                {systemStatus === 'OPTIMAL' && 'System Operating Normally'}
                {systemStatus === 'STRAINED' && 'System Under Strain'}
                {systemStatus === 'CRITICAL' && 'System Approaching Critical'}
                {systemStatus === 'FAILURE' && 'System Failure Imminent'}
              </p>
              <p className="text-sm opacity-90">
                {systemStatus === 'OPTIMAL' &&
                  'You can handle significant stressors. Recovery is quick, resilience is high.'}
                {systemStatus === 'STRAINED' &&
                  'Minor stressors may feel overwhelming. Monitor your recovery time and consider reducing load.'}
                {systemStatus === 'CRITICAL' &&
                  'One more small stressor could trigger breakdown. Immediate intervention needed—reduce load or take a break.'}
                {systemStatus === 'FAILURE' &&
                  'System collapse is likely. Stop trading immediately. Seek professional help if needed. Focus on recovery.'}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Stressors Grid */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
            <Brain className="w-5 h-5 text-indigo-400" />
            Life Stressors
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {defaultStressors.map((stressor, index) => (
              <motion.div
                key={stressor.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <StressorToggle
                  stressor={stressor}
                  isActive={activeStressors.has(stressor.id)}
                  onToggle={handleToggle}
                />
              </motion.div>
            ))}
          </div>
        </div>

        {/* Explanation */}
        <div className="mt-8 p-6 bg-slate-800/50 rounded-xl border border-slate-700">
          <h4 className="text-sm font-mono uppercase text-slate-400 tracking-wider mb-3">
            Understanding Allostatic Load
          </h4>
          <div className="space-y-2 text-sm text-slate-300 leading-relaxed">
            <p>
              <strong className="text-emerald-400">Allostasis</strong> is the
              process of maintaining stability through change—your body adapting
              to stress.
            </p>
            <p>
              <strong className="text-yellow-400">Allostatic Load</strong> is
              the cumulative wear-and-tear from chronic activation of stress
              response systems.
            </p>
            <p className="pt-2 border-t border-slate-700">
              Think of it as an inverted stress battery: when load is{' '}
              <strong className="text-emerald-400">LOW</strong>, you can handle
              significant stressors. When load is{' '}
              <strong className="text-red-400">HIGH</strong>, minor stressors
              feel overwhelming.
            </p>
            <p>
              Amir's March breakdown wasn't from the $17,400 loss alone—it was
              from three years of accumulated stress, relationship tension,
              financial pressure, sleep deprivation, and no recovery protocols.
              The loss was just the final straw.
            </p>
          </div>
        </div>
      </div>
    </EnvironmentWrapper>
  );
};

export default AllostaticLoadCalculator;
