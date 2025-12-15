
import React, { useState, useEffect } from 'react';
import {
  Play,
  RotateCcw,
  AlertCircle,
  Brain,
  Clock,
  CheckCircle,
  XCircle,
} from 'lucide-react';

const steps = [
  {
    id: 1,
    phase: 'trigger',
    title: 'Trading Impulse Detected',
    description: 'You feel the urge to act',
    examples: [
      'Exit this trade early',
      'Move my stop loss',
      'Revenge trade',
      'Skip this setup',
      'Add to a loser',
    ],
    color: 'red',
    icon: AlertCircle,
    question: 'Do you feel an urgent need to do something RIGHT NOW?',
  },
  {
    id: 2,
    phase: 'recognition',
    title: 'Name the Brain',
    description: 'Create psychological distance',
    examples: [
      '"That\'s my reptilian brain"',
      '"That\'s my limbic brain talking"',
      '"My survival system is activated"',
      '"My fear brain wants to take over"',
      '"That\'s not my CEO speaking"',
    ],
    color: 'yellow',
    icon: Brain,
    question: 'Which brain is driving this impulse?',
    details:
      "Simply naming it creates separation. You're no longer identified with the urge—you're observing it.",
  },
  {
    id: 3,
    phase: 'pause',
    title: 'The 10-Second Pause',
    description: 'Let the signal reach the CEO',
    color: 'blue',
    icon: Clock,
    interactive: true,
    instructions: 'Breathe deeply and count slowly',
    question: 'Can you give your neocortex time to engage?',
  },
  {
    id: 4,
    phase: 'decision',
    title: 'CEO Decision',
    description: 'Now decide from the penthouse',
    color: 'green',
    icon: CheckCircle,
    question: 'Can you state a rule-based, logical reason for this action?',
    paths: [
      {
        answer: 'YES',
        result: 'Proceed with the action',
        explanation:
          'If your neocortex can articulate a clear, system-based reason, the action is likely valid.',
        outcome: 'success',
      },
      {
        answer: 'NO',
        result: 'Do NOT take the action',
        explanation:
          "If you can't justify it with rules and logic, it's coming from the basement. This is emotional override.",
        outcome: 'protect',
      },
    ],
  },
];

const CountdownTimer = ({ onComplete }: { onComplete: () => void }) => {
  const [count, setCount] = useState(10);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    if (isRunning && count > 0) {
      const timer = setTimeout(() => setCount(count - 1), 1000);
      return () => clearTimeout(timer);
    } else if (count === 0) {
      onComplete();
    }
  }, [count, isRunning, onComplete]);

  const startTimer = () => {
    setIsRunning(true);
  };

  const resetTimer = () => {
    setCount(10);
    setIsRunning(false);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-48 h-48">
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="96"
            cy="96"
            r="88"
            stroke="#1e293b"
            strokeWidth="12"
            fill="none"
          />
          <circle
            cx="96"
            cy="96"
            r="88"
            stroke="#3b82f6"
            strokeWidth="12"
            fill="none"
            strokeDasharray={`${2 * Math.PI * 88}`}
            strokeDashoffset={`${2 * Math.PI * 88 * (count / 10)}`}
            className="transition-all duration-1000 ease-linear"
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-6xl font-bold text-white">{count}</span>
        </div>
      </div>

      <div className="flex gap-3">
        {!isRunning ? (
          <button
            onClick={startTimer}
            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl transition-all flex items-center gap-2"
          >
            <Play className="w-5 h-5" />
            Start Pause
          </button>
        ) : (
          <button
            onClick={resetTimer}
            className="px-6 py-3 bg-slate-600 hover:bg-slate-700 text-white font-semibold rounded-xl transition-all flex items-center gap-2"
          >
            <RotateCcw className="w-5 h-5" />
            Reset
          </button>
        )}
      </div>

      <p className="text-slate-400 text-center max-w-md">
        Breathe deeply. Count slowly. Give your neocortex time to come online.
      </p>
    </div>
  );
};

export default function DecisionFlowchart() {
  const [currentStep, setCurrentStep] = useState(0);
  const [timerCompleted, setTimerCompleted] = useState(false);
  const [selectedPath, setSelectedPath] = useState(null);
  const [showFullFlow, setShowFullFlow] = useState(false);

  const step = steps[currentStep];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      setTimerCompleted(false);
      setSelectedPath(null);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setTimerCompleted(false);
      setSelectedPath(null);
    }
  };

  const handleReset = () => {
    setCurrentStep(0);
    setTimerCompleted(false);
    setSelectedPath(null);
  };

  const colorSchemes = {
    red: {
      bg: 'bg-red-500/10',
      border: 'border-red-500/30',
      text: 'text-red-400',
      // Gradient not used per instructions
    },
    yellow: {
      bg: 'bg-yellow-500/10',
      border: 'border-yellow-500/30',
      text: 'text-yellow-400',
      // Gradient not used per instructions
    },
    blue: {
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/30',
      text: 'text-blue-400',
      // Gradient not used per instructions
    },
    green: {
      bg: 'bg-green-500/10',
      border: 'border-green-500/30',
      text: 'text-green-400',
      // Gradient not used per instructions
    },
  };

  const colors = colorSchemes[step.color as keyof typeof colorSchemes];
  const Icon = step.icon;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 my-12">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            The 10-Second Pause Protocol
          </h1>
          <p className="text-slate-300 text-lg mb-6">
            Create space between stimulus and response
          </p>

          {/* View Toggle */}
          <div className="flex justify-center gap-3">
            <button
              onClick={() => setShowFullFlow(!showFullFlow)}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-all"
            >
              {showFullFlow ? 'Interactive Mode' : 'Show Full Flowchart'}
            </button>
          </div>
        </div>

        {showFullFlow ? (
          /* Full Flowchart View */
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-8">
            <div className="space-y-6">
              {steps.map((s, idx) => {
                const stepColors =
                  colorSchemes[s.color as keyof typeof colorSchemes];
                const StepIcon = s.icon;

                return (
                  <div key={s.id}>
                    {/* Step Card */}
                    <div
                      className={`${stepColors.bg} border ${stepColors.border} rounded-xl p-6`}
                    >
                      <div className="flex items-start gap-4">
                        <div
                          className={`p-3 rounded-lg ${stepColors.bg} border ${stepColors.border}`}
                        >
                          <StepIcon className={`w-6 h-6 ${stepColors.text}`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span
                              className={`text-sm font-bold ${stepColors.text}`}
                            >
                              STEP {s.id}
                            </span>
                            <h3 className="text-xl font-bold text-white">
                              {s.title}
                            </h3>
                          </div>
                          <p className="text-slate-300 mb-4">{s.description}</p>

                          {s.question && (
                            <div className="bg-slate-900/50 rounded-lg p-4 mb-4">
                              <p className="text-white font-semibold">
                                {s.question}
                              </p>
                            </div>
                          )}

                          {s.examples && (
                            <div className="space-y-2">
                              <p className="text-sm text-slate-400 font-semibold">
                                Examples:
                              </p>
                              {s.examples.map((ex, i) => (
                                <div
                                  key={i}
                                  className="text-slate-300 text-sm pl-4 border-l-2 border-slate-600"
                                >
                                  {ex}
                                </div>
                              ))}
                            </div>
                          )}

                          {s.paths && (
                            <div className="grid md:grid-cols-2 gap-4 mt-4">
                              {s.paths.map((path, i) => (
                                <div
                                  key={i}
                                  className={`p-4 rounded-lg border-2 ${
                                    path.outcome === 'success'
                                      ? 'bg-green-500/10 border-green-500/30'
                                      : 'bg-red-500/10 border-red-500/30'
                                  }`}
                                >
                                  <div
                                    className={`text-lg font-bold mb-2 ${
                                      path.outcome === 'success'
                                        ? 'text-green-400'
                                        : 'text-red-400'
                                    }`}
                                  >
                                    {path.answer}
                                  </div>
                                  <div className="text-white font-semibold mb-2">
                                    {path.result}
                                  </div>
                                  <p className="text-sm text-slate-300">
                                    {path.explanation}
                                  </p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Arrow */}
                    {idx < steps.length - 1 && (
                      <div className="flex justify-center my-4">
                        <div className="w-1 h-8 bg-slate-700" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* Interactive Step-by-Step View */
          <>
            {/* Progress */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-2">
                {steps.map((s, idx) => (
                  <div
                    key={s.id}
                    className={`flex-1 h-2 mx-1 rounded-full transition-all ${
                      idx <= currentStep
                        ? 'bg-blue-500' // Replaced gradient with solid blue
                        : 'bg-slate-700'
                    }`}
                  />
                ))}
              </div>
              <div className="text-center text-slate-400">
                Step {currentStep + 1} of {steps.length}
              </div>
            </div>

            {/* Current Step */}
            <div
              className={`${colors.bg} border ${colors.border} rounded-2xl p-8 mb-6`}
            >
              <div className="flex items-center gap-4 mb-6">
                <div
                  className={`p-4 rounded-xl ${colors.bg} border ${colors.border}`}
                >
                  <Icon className={`w-8 h-8 ${colors.text}`} />
                </div>
                <div>
                  <div className={`text-sm font-bold ${colors.text} mb-1`}>
                    STEP {step.id}
                  </div>
                  <h2 className="text-3xl font-bold text-white">
                    {step.title}
                  </h2>
                </div>
              </div>

              <p className="text-xl text-slate-300 mb-6">{step.description}</p>

              {step.question && (
                <div className="bg-slate-900/50 rounded-xl p-6 mb-6">
                  <p className="text-lg text-white font-semibold">
                    {step.question}
                  </p>
                </div>
              )}

              {step.details && (
                <div className="bg-slate-900/30 rounded-xl p-4 mb-6 border-l-4 border-yellow-500">
                  <p className="text-slate-300">{step.details}</p>
                </div>
              )}

              {/* Interactive Timer */}
              {step.interactive && (
                <div className="my-8">
                  <CountdownTimer onComplete={() => setTimerCompleted(true)} />
                </div>
              )}

              {/* Examples */}
              {step.examples && (
                <div className="space-y-3 mb-6">
                  <p className="text-sm text-slate-400 font-semibold uppercase tracking-wide">
                    Example Phrases:
                  </p>
                  {step.examples.map((example, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-900/30 rounded-lg p-4 border-l-4 border-slate-600"
                    >
                      <p className="text-slate-200">{example}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Decision Paths */}
              {step.paths && (
                <div className="space-y-4">
                  {step.paths.map((path, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedPath(idx as any)}
                      className={`w-full p-6 rounded-xl border-2 transition-all text-left ${
                        selectedPath === idx
                          ? path.outcome === 'success'
                            ? 'border-green-500 bg-green-500/20'
                            : 'border-red-500 bg-red-500/20'
                          : 'border-slate-600 bg-slate-800/50 hover:border-slate-500'
                      }`}
                    >
                      <div
                        className={`text-2xl font-bold mb-3 ${
                          path.outcome === 'success'
                            ? 'text-green-400'
                            : 'text-red-400'
                        }`}
                      >
                        {path.answer}
                      </div>
                      <div className="text-xl text-white font-semibold mb-3">
                        → {path.result}
                      </div>
                      {selectedPath === idx && (
                        <p className="text-slate-300 mt-3 pt-3 border-t border-slate-600">
                          {path.explanation}
                        </p>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Navigation */}
            <div className="flex justify-between gap-4">
              <button
                onClick={handlePrevious}
                disabled={currentStep === 0}
                className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>

              <button
                onClick={handleReset}
                className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-xl transition-all flex items-center gap-2"
              >
                <RotateCcw className="w-5 h-5" />
                Start Over
              </button>

              {currentStep < steps.length - 1 ? (
                <button
                  onClick={handleNext}
                  disabled={step.interactive && !timerCompleted}
                  // Removed purple-to-blue gradient
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next Step
                </button>
              ) : (
                <button
                  onClick={handleReset}
                  // Removed green gradient, using solid green
                  className="px-6 py-3 bg-green-600 hover:bg-green-500 text-white font-semibold rounded-xl transition-all flex items-center gap-2"
                >
                  <CheckCircle className="w-5 h-5" />
                  Complete
                </button>
              )}
            </div>
          </>
        )}

        {/* Key Principle */}
        {/* Replaced purple gradient with blue solid background/border logic */}
        <div className="mt-8 bg-blue-500/10 border border-blue-500/30 rounded-2xl p-6">
          <div className="flex items-start gap-4">
            {/* Replaced purple-400 with blue-400 */}
            <Brain className="w-8 h-8 text-blue-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-xl font-bold text-white mb-2">
                "Between stimulus and response there is a space..."
              </h3>
              <p className="text-slate-300 leading-relaxed">
                The 10-Second Pause isn't about eliminating fear or greed. It's
                about creating that critical space where your neocortex can
                engage before your reptilian brain hijacks your decisions.
                You're not fighting your biology—you're giving your CEO brain
                time to show up to the meeting.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
