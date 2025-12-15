
import React, { useState } from 'react';
import {
  Brain,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  ChevronRight,
  Activity,
  Heart,
  Zap,
} from 'lucide-react';

const SomaticMarkersExplorer = () => {
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);
  const [step, setStep] = useState(0);

  const scenarios = [
    {
      id: 'breakdown-trade',
      title: 'Breakdown Trade Setup',
      icon: TrendingDown,
      color: '#ef4444',
      situation: 'Stock breaks key support level with volume',
      pastExperience: {
        good: [
          'Three winning breakdown trades last month',
          'Each followed similar volume pattern',
          'Quick 2-3% moves captured successfully',
        ],
        bad: [
          'Two false breakdowns trapped you',
          'Both had choppy price action before breakdown',
          'Current setup shows similar choppiness',
        ],
      },
      somaticProcess: [
        {
          stage: 'Recognition',
          description: 'Visual cortex processes the chart pattern',
          detail: 'Your eyes see the breakdown. Pattern matches stored memory.',
          neural: 'Visual cortex → Hippocampus (memory retrieval)',
        },
        {
          stage: 'Association Activation',
          description: 'Brain retrieves associated past outcomes',
          detail:
            'Both wins AND losses activate. Conflicting memories surface.',
          neural: 'Hippocampus → Amygdala + Ventromedial PFC',
        },
        {
          stage: 'Body Signal Generation',
          description: 'Insula creates physical marker',
          detail:
            'Slight stomach tightness. Subtle unease. Not panic — caution.',
          neural: 'Insula generates somatic marker',
        },
        {
          stage: 'Conscious Awareness',
          description: 'You feel "something is off"',
          detail:
            'Can\'t articulate why, but gut says: "This one feels different."',
          neural: 'Insula → Anterior cingulate cortex → Consciousness',
        },
      ],
      bodySignals: [
        { signal: 'Slight stomach tightness', meaning: 'Uncertainty detected' },
        {
          signal: 'Hesitation in clicking',
          meaning: 'Conflict between approach/avoid',
        },
        { signal: 'Shallow breath', meaning: 'Low-grade stress activation' },
      ],
      outcome: {
        ifIgnored:
          'Enter trade → False breakdown → 2% loss → "I knew something was off!"',
        ifHeeded:
          'Skip trade → Confirms false breakdown → Saved 2% → Body was right',
      },
    },
    {
      id: 'euphoria-trade',
      title: 'Post-Win Euphoria',
      icon: TrendingUp,
      color: '#22c55e',
      situation: 'Just closed +$3K winner, scanning for next trade',
      pastExperience: {
        good: [
          'Sometimes catching momentum led to 2-3 winners in a row',
          'Riding hot hand worked occasionally',
        ],
        bad: [
          'Five times you overtaded after big wins',
          'Each time: forced setup → gave back profits',
          'Overconfidence after wins = danger pattern',
        ],
      },
      somaticProcess: [
        {
          stage: 'Reward Activation',
          description: 'Dopamine flooding system',
          detail: 'Win triggers massive dopamine release. Feeling invincible.',
          neural: 'Nucleus accumbens → Dopamine surge',
        },
        {
          stage: 'Risk Assessment Impairment',
          description: 'PFC regulation decreases',
          detail:
            "Prefrontal cortex can't override reward-seeking behavior effectively.",
          neural: 'Dopamine temporarily impairs PFC executive function',
        },
        {
          stage: 'Body Warning Generation',
          description: 'Insula detects physiological danger state',
          detail:
            'Despite feeling great, body recognizes: elevated heart rate, restlessness, seeking behavior.',
          neural: 'Insula monitors: This state = past overtrading',
        },
        {
          stage: 'Conflict Signal',
          description: 'Chest expansion + subtle agitation',
          detail:
            "You feel powerful (chest puffed) BUT there's an undercurrent of restless energy.",
          neural: 'Competing signals: Reward system vs. Warning system',
        },
      ],
      bodySignals: [
        {
          signal: 'Chest expansion',
          meaning: 'Testosterone/confidence surge—danger',
        },
        { signal: 'Restless energy', meaning: 'Dopamine-seeking activated' },
        {
          signal: 'Scanning urgency',
          meaning: 'Hunting for next hit — addiction pattern',
        },
      ],
      outcome: {
        ifIgnored:
          'Force mediocre setup → Break rules → Give back $1,500 → "Why do I always do this?"',
        ifHeeded:
          'Recognize state → Walk away → Preserve gains → "Best trade is no trade"',
      },
    },
    {
      id: 'holding-loser',
      title: 'Holding Losing Position',
      icon: AlertTriangle,
      color: '#f59e0b',
      situation: 'Trade down 1.5%, approaching stop at 2%',
      pastExperience: {
        good: [
          'Twice, holding through drawdown led to recovery',
          '"Stops are for quitters" worked sometimes',
        ],
        bad: [
          'Ten times, small losses became big losses',
          'Each time: jaw clenched, hoping for recovery',
          'Pain of realizing loss felt unbearable',
        ],
      },
      somaticProcess: [
        {
          stage: 'Pain Anticipation',
          description: 'Insula predicts loss realization pain',
          detail: 'Body knows: clicking "sell" = pain. Holding = pain delayed.',
          neural:
            'Insula anticipates: Loss realization = physical pain equivalent',
        },
        {
          stage: 'Avoidance Activation',
          description: 'Behavioral inhibition system engaged',
          detail:
            "Mouse cursor hovers over sell button. Can't click. Paralyzed.",
          neural: 'Anterior cingulate cortex: Approach-avoidance conflict',
        },
        {
          stage: 'Muscle Tension',
          description: 'Body holds fight-or-flight response',
          detail:
            'Jaw clenches. Shoulders tense. Suppressing action you know you should take.',
          neural: 'Motor cortex inhibited—frozen state',
        },
        {
          stage: 'Rationalization',
          description: 'Mind generates reasons to hold',
          detail:
            '"Maybe it\'ll bounce." "I\'ve seen this before." "Just a little longer."',
          neural: 'PFC generates justifications for inaction',
        },
      ],
      bodySignals: [
        {
          signal: 'Jaw clenching',
          meaning: 'Suppressed action—avoiding necessary pain',
        },
        { signal: 'Tight throat', meaning: 'Emotional overwhelm approaching' },
        { signal: 'Nausea', meaning: 'Loss aversion activating pain circuits' },
      ],
      outcome: {
        ifIgnored:
          'Hold → 2% becomes 4% → Finally panic sell → Max pain + regret',
        ifHeeded:
          'Recognize jaw clench = warning → Cut at 2% → Follow rules → Minimize damage',
      },
    },
  ];

  const selectedData = scenarios.find((s) => s.id === selectedScenario);

  return (
    <div className="w-full max-w-5xl mx-auto p-6 bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl shadow-2xl my-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Brain className="w-8 h-8 text-cyan-400" />
          <h2 className="text-3xl font-bold text-white">
            Somatic Markers Explained
          </h2>
        </div>
        <p className="text-slate-300">
          How your body marks decisions with physical signals based on past
          experience
        </p>
      </div>

      {!selectedScenario || !selectedData ? (
        <div className="space-y-4">
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 mb-6">
            <h3 className="text-xl font-semibold text-cyan-400 mb-3">
              Damasio's Discovery
            </h3>
            <p className="text-slate-300 mb-4">
              Patients with ventromedial prefrontal cortex damage could think
              logically but couldn't make good decisions. Why? They couldn't
              generate{' '}
              <span className="text-yellow-400 font-semibold">
                somatic markers{' '}
              </span>
              — body-based signals that tag options as good/bad based on past
              outcomes.
            </p>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div className="bg-slate-700/30 p-4 rounded">
                <Zap className="w-5 h-5 text-yellow-400 mb-2" />
                <div className="font-semibold text-white mb-1">
                  Fast & Unconscious
                </div>
                <div className="text-slate-400">
                  Body signals appear before conscious analysis
                </div>
              </div>
              <div className="bg-slate-700/30 p-4 rounded">
                <Activity className="w-5 h-5 text-purple-400 mb-2" />
                <div className="font-semibold text-white mb-1">
                  Experience-Based
                </div>
                <div className="text-slate-400">
                  Built from your actual trading outcomes
                </div>
              </div>
              <div className="bg-slate-700/30 p-4 rounded">
                <Heart className="w-5 h-5 text-red-400 mb-2" />
                <div className="font-semibold text-white mb-1">
                  Physically Real
                </div>
                <div className="text-slate-400">
                  Not imagination—measurable body changes
                </div>
              </div>
            </div>
          </div>

          <h3 className="text-xl font-semibold text-white mb-4">
            Select a Trading Scenario:
          </h3>
          <div className="grid md:grid-cols-3 gap-4">
            {scenarios.map((scenario) => {
              const Icon = scenario.icon;
              return (
                <button
                  key={scenario.id}
                  onClick={() => {
                    setSelectedScenario(scenario.id);
                    setStep(0);
                  }}
                  className="bg-slate-800 hover:bg-slate-700 border-2 border-slate-600 hover:border-slate-500 rounded-lg p-6 text-left transition-all group"
                >
                  <Icon
                    className="w-10 h-10 mb-3"
                    style={{ color: scenario.color }}
                  />
                  <h4 className="text-lg font-semibold text-white mb-2 group-hover:text-cyan-400 transition-colors">
                    {scenario.title}
                  </h4>
                  <p className="text-slate-400 text-sm">{scenario.situation}</p>
                  <div className="flex items-center gap-2 mt-4 text-cyan-400 text-sm font-semibold">
                    Explore <ChevronRight className="w-4 h-4" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <button
            onClick={() => {
              setSelectedScenario(null);
              setStep(0);
            }}
            className="text-cyan-400 hover:text-cyan-300 text-sm font-semibold flex items-center gap-2"
          >
            ← Back to scenarios
          </button>

          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              {React.createElement(selectedData.icon, {
                className: 'w-8 h-8',
                style: { color: selectedData.color },
              })}
              <h3 className="text-2xl font-bold text-white">
                {selectedData.title}
              </h3>
            </div>
            <p className="text-slate-300 text-lg">{selectedData.situation}</p>
          </div>

          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-white mb-4">
              Past Experience Context
            </h4>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="font-semibold text-green-400">
                    Positive Associations
                  </span>
                </div>
                <ul className="space-y-2">
                  {selectedData.pastExperience.good.map((item, idx) => (
                    <li
                      key={idx}
                      className="text-slate-300 text-sm flex items-start gap-2"
                    >
                      <span className="text-green-400 mt-1">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                  <span className="font-semibold text-red-400">
                    Negative Associations
                  </span>
                </div>
                <ul className="space-y-2">
                  {selectedData.pastExperience.bad.map((item, idx) => (
                    <li
                      key={idx}
                      className="text-slate-300 text-sm flex items-start gap-2"
                    >
                      <span className="text-red-400 mt-1">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-white mb-4">
              The Somatic Marker Process
            </h4>
            <div className="space-y-4">
              {selectedData.somaticProcess.map((stage, idx) => (
                <div
                  key={idx}
                  className={`border-l-4 pl-4 py-3 transition-all ${
                    idx <= step
                      ? 'border-cyan-400 opacity-100'
                      : 'border-slate-600 opacity-40'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl font-bold text-cyan-400">
                      {idx + 1}
                    </span>
                    <h5 className="text-lg font-semibold text-white">
                      {stage.stage}
                    </h5>
                  </div>
                  <p className="text-slate-300 mb-2">{stage.description}</p>
                  {idx <= step && (
                    <>
                      <p className="text-slate-400 text-sm italic mb-2">
                        {stage.detail}
                      </p>
                      <div className="bg-slate-700/50 rounded px-3 py-2 text-xs text-cyan-300">
                        🧠 Neural pathway: {stage.neural}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>

            {step < selectedData.somaticProcess.length - 1 && (
              <button
                onClick={() => setStep(step + 1)}
                className="mt-6 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold px-6 py-3 rounded-lg transition-colors flex items-center gap-2"
              >
                Next Step <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>

          {step >= selectedData.somaticProcess.length - 1 && (
            <>
              <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-white mb-4">
                  Body Signals Generated
                </h4>
                <div className="space-y-3">
                  {selectedData.bodySignals.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-4 bg-slate-700/30 p-4 rounded-lg"
                    >
                      <Activity className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="font-semibold text-yellow-400">
                          {item.signal}
                        </div>
                        <div className="text-slate-300 text-sm">
                          {item.meaning}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-white mb-4">
                  Outcome Based on Response
                </h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                    <div className="font-semibold text-red-400 mb-2 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5" />
                      If You Ignore the Signal
                    </div>
                    <p className="text-slate-300 text-sm">
                      {selectedData.outcome.ifIgnored}
                    </p>
                  </div>
                  <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                    <div className="font-semibold text-green-400 mb-2 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5" />
                      If You Heed the Signal
                    </div>
                    <p className="text-slate-300 text-sm">
                      {selectedData.outcome.ifHeeded}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-cyan-400 mb-3">
                  Key Insight
                </h4>
                <p className="text-slate-300">
                  Your body tagged this situation with a marker{' '}
                  <span className="text-yellow-400 font-semibold">before</span>{' '}
                  your conscious mind finished analyzing. This is not
                  mystical—it's your nervous system running compressed pattern
                  recognition on past outcomes. The question is:{' '}
                  <span className="text-white font-semibold">
                    Do you trust it?
                  </span>
                </p>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default SomaticMarkersExplorer;
