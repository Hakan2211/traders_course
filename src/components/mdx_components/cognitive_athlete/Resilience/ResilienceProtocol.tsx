
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle,
  Brain,
  CheckCircle,
  XCircle,
  Activity,
  RotateCcw,
  Ban,
  PauseCircle,
  PlayCircle,
  LucideIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type StepId = string;
type ResponseType = 'yes' | 'no';

interface Step {
  title: string;
  description: string;
  question?: string;
  icon: LucideIcon;
  color: string;
  yes?: StepId;
  no?: StepId;
  type?: 'terminal';
  status?: 'stop' | 'go';
  action?: string;
}

const steps: Record<StepId, Step> = {
  start: {
    title: 'Session Status Check',
    description: 'A bad trading session or significant loss has occurred.',
    question: 'Can you think clearly right now?',
    icon: AlertTriangle,
    color: 'text-orange-500',
    yes: 'system_check',
    no: 'stop_clarity',
  },
  system_check: {
    title: 'System Integrity',
    description: 'Review your recent trades.',
    question: 'Are you following your trading system?',
    icon: Activity,
    color: 'text-blue-500',
    yes: 'variance_check',
    no: 'stop_system',
  },
  variance_check: {
    title: 'Market Analysis',
    description: 'Analyze market conditions.',
    question: 'Is this loss within normal variance?',
    icon: Activity,
    color: 'text-blue-500',
    yes: 'continue_reduced',
    no: 'fixable_check',
  },
  fixable_check: {
    title: 'Problem Assessment',
    description: 'Identify the root cause.',
    question: 'Is the issue fixable today?',
    icon: RotateCcw,
    color: 'text-yellow-500',
    yes: 'continue_fix',
    no: 'stop_unfixable',
  },
  stop_clarity: {
    type: 'terminal',
    status: 'stop',
    title: 'STOP IMMEDIATELY',
    description:
      'You are not in a state to trade. Your judgment is compromised.',
    action: 'Take a break. Assess only when calm.',
    icon: Ban,
    color: 'text-red-600',
  },
  stop_system: {
    type: 'terminal',
    status: 'stop',
    title: 'STOP TRADING',
    description: 'You have deviated from your system.',
    action: 'Identify why you broke rules. Fix the issue before continuing.',
    icon: Ban,
    color: 'text-red-600',
  },
  stop_unfixable: {
    type: 'terminal',
    status: 'stop',
    title: 'STOP TRADING',
    description: 'The issue cannot be resolved today.',
    action: 'Take a break until resolved.',
    icon: PauseCircle,
    color: 'text-red-600',
  },
  continue_reduced: {
    type: 'terminal',
    status: 'go',
    title: 'CONTINUE WITH CAUTION',
    description: 'Normal variance is part of the game.',
    action: 'Consider reducing position size.',
    icon: PlayCircle,
    color: 'text-green-600',
  },
  continue_fix: {
    type: 'terminal',
    status: 'go',
    title: 'FIX AND CONTINUE',
    description: 'Issue identified and resolvable.',
    action: 'Fix the issue immediately, then continue until resolved.',
    icon: CheckCircle,
    color: 'text-green-600',
  },
};

export default function ResilienceProtocol() {
  const [currentStep, setCurrentStep] = useState<StepId>('start');
  const [history, setHistory] = useState<
    { step: StepId; response: ResponseType }[]
  >([]);

  const handleResponse = (response: ResponseType) => {
    const step = steps[currentStep];
    const nextStep = response === 'yes' ? step.yes : step.no;

    if (nextStep) {
      setHistory([...history, { step: currentStep, response }]);
      setCurrentStep(nextStep);
    }
  };

  const reset = () => {
    setCurrentStep('start');
    setHistory([]);
  };

  const step = steps[currentStep];
  const isTerminal = step.type === 'terminal';

  return (
    <div className="w-full max-w-2xl mx-auto my-8">
      <div
        className={cn(
          'bg-gradient-to-br from-gray-950/90 via-gray-900/85 to-black/90 dark:bg-slate-800',
          'border border-gray-700/50 shadow-[0_10px_40px_rgba(0,0,0,0.6)]',
          'rounded-2xl backdrop-blur-2xl',
          'overflow-hidden'
        )}
      >
        {/* Header */}
        <div className="border-b border-gray-700/50 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="w-6 h-6 text-blue-400" />
              <h2 className="text-xl font-semibold text-white">
                Resilience Protocol
              </h2>
            </div>
            {history.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={reset}
                className="text-gray-400 hover:text-white hover:bg-gray-800/50"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
            )}
          </div>
          <p className="mt-2 text-sm text-gray-400">
            Interactive decision support for handling trading losses
          </p>
        </div>

        {/* Content */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center text-center space-y-6"
            >
              <div
                className={`p-4 rounded-full bg-gray-800/50 backdrop-blur-sm border border-gray-700/30 ${step.color}`}
              >
                <step.icon className="w-12 h-12" />
              </div>

              <div className="space-y-2">
                <h3 className={`text-2xl font-bold ${step.color}`}>
                  {step.title}
                </h3>
                <p className="text-lg text-gray-300">{step.description}</p>
              </div>

              {!isTerminal ? (
                <div className="w-full space-y-4">
                  <p className="text-xl font-medium mb-6 text-gray-200">
                    {step.question}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center w-full">
                    <Button
                      size="lg"
                      onClick={() => handleResponse('yes')}
                      className="w-full sm:w-40 bg-green-600 hover:bg-green-700 text-white"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      YES
                    </Button>
                    <Button
                      size="lg"
                      onClick={() => handleResponse('no')}
                      className="w-full sm:w-40 bg-red-600 hover:bg-red-700 text-white"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      NO
                    </Button>
                  </div>
                </div>
              ) : (
                <div
                  className="w-full bg-gray-800/50 backdrop-blur-sm border border-gray-700/30 p-6 rounded-lg border-l-4"
                  style={{
                    borderLeftColor:
                      step.status === 'stop' ? '#dc2626' : '#16a34a',
                  }}
                >
                  <h4
                    className="text-lg font-bold mb-2"
                    style={{
                      color: step.status === 'stop' ? '#dc2626' : '#16a34a',
                    }}
                  >
                    Required Action:
                  </h4>
                  <p className="text-xl font-medium text-gray-200">
                    {step.action}
                  </p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Breadcrumbs / Progress */}
          <div className="mt-8 pt-6 border-t border-gray-700/50 flex flex-wrap gap-2 justify-center text-sm text-gray-400">
            {history.map((h, i) => (
              <span key={i} className="flex items-center opacity-60">
                {i > 0 && <span className="mx-2">→</span>}
                {steps[h.step].title} ({h.response.toUpperCase()})
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
