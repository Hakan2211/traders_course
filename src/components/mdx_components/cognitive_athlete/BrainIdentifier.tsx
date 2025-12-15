
import React, { useState } from 'react';
import {
  Brain,
  Zap,
  Heart,
  Lightbulb,
  ChevronRight,
  RotateCcw,
} from 'lucide-react';

const scenarios = [
  {
    id: 1,
    situation:
      "You're up $500 on a trade. Target is $1,200. After 15 minutes, you start feeling anxious about losing the profit.",
    options: [
      {
        brain: 'reptilian',
        text: 'Exit immediately - lock in the resources before they disappear',
      },
      {
        brain: 'limbic',
        text: 'Feel the dopamine hit and want to secure the pleasure now',
      },
      {
        brain: 'neocortex',
        text: "Check your system's statistics and follow the plan",
      },
    ],
    correct: ['limbic', 'reptilian'],
    explanation:
      'This is primarily your Limbic brain seeking immediate pleasure (dopamine from the win) combined with Reptilian fear of losing resources. Your Neocortex knows the statistical probability favors holding to target.',
  },
  {
    id: 2,
    situation:
      "Your stop loss is hit. You immediately want to enter another trade to 'make it back.'",
    options: [
      {
        brain: 'reptilian',
        text: 'Fight response - attack the market that hurt you',
      },
      { brain: 'limbic', text: 'Need to erase the painful feeling of losing' },
      {
        brain: 'neocortex',
        text: 'Review what went wrong and wait for next valid setup',
      },
    ],
    correct: ['reptilian', 'limbic'],
    explanation:
      "This is classic Reptilian fight response combined with Limbic pain avoidance. You're experiencing revenge trading - your survival brain attacking the 'threat' that hurt you.",
  },
  {
    id: 3,
    situation:
      "A perfect setup appears, but your last three trades were losers. You hesitate and can't pull the trigger.",
    options: [
      {
        brain: 'reptilian',
        text: "Freeze response - recent 'threats' make you immobile",
      },
      { brain: 'limbic', text: 'Fear of feeling that pain again stops you' },
      { brain: 'neocortex', text: 'Recognize this matches your edge criteria' },
    ],
    correct: ['reptilian'],
    explanation:
      "This is your Reptilian brain's freeze response. Recent losses = recent threats. Your survival system is keeping you immobile to avoid another 'predator attack.'",
  },
  {
    id: 4,
    situation:
      'You see traders on Twitter posting huge gains. You feel compelled to make bigger trades to keep up.',
    options: [
      {
        brain: 'reptilian',
        text: "Survive by keeping up with the tribe's success",
      },
      {
        brain: 'limbic',
        text: 'Social comparison triggers FOMO and status anxiety',
      },
      {
        brain: 'neocortex',
        text: 'Stick to your position sizing rules regardless of others',
      },
    ],
    correct: ['limbic'],
    explanation:
      'This is pure Limbic brain - social comparison, tribal status anxiety, and fear of missing out. Your emotional brain is scanning the tribe and feeling left behind.',
  },
  {
    id: 5,
    situation:
      "Your trade is losing. You know you should cut it, but you keep thinking 'just five more minutes' repeatedly.",
    options: [
      { brain: 'reptilian', text: 'Freeze response - paralyzed by the threat' },
      {
        brain: 'limbic',
        text: "Avoiding the painful feeling of admitting you're wrong",
      },
      { brain: 'neocortex', text: 'Execute the stop loss per your rules' },
    ],
    correct: ['reptilian', 'limbic'],
    explanation:
      'Double hijack: Reptilian freeze (paralysis from threat) plus Limbic pain avoidance. Your emotional brain desperately wants to avoid the agony of loss, while your survival brain is stuck.',
  },
  {
    id: 6,
    situation:
      "You're about to enter a trade but suddenly worry 'What if I'm wrong and everyone sees?'",
    options: [
      {
        brain: 'reptilian',
        text: 'Threat of tribal rejection activates survival fear',
      },
      { brain: 'limbic', text: 'Social judgment fear and shame avoidance' },
      { brain: 'neocortex', text: 'Nobody is watching your individual trades' },
    ],
    correct: ['limbic'],
    explanation:
      'Classic Limbic social anxiety. Your emotional brain thinks being wrong = social exclusion = danger. In our evolutionary past, tribal rejection could mean death.',
  },
  {
    id: 7,
    situation:
      'Market suddenly drops hard. Your heart races, palms sweat, and you frantically close all positions.',
    options: [
      {
        brain: 'reptilian',
        text: 'Flight response - escape the immediate danger NOW',
      },
      { brain: 'limbic', text: 'Overwhelming fear and panic' },
      {
        brain: 'neocortex',
        text: 'Assess actual risk to your positions calmly',
      },
    ],
    correct: ['reptilian'],
    explanation:
      'Pure Reptilian flight response. Your survival brain detected a threat (rapid price movement) and triggered the emergency escape protocol - increased heart rate, stress hormones, immediate action.',
  },
  {
    id: 8,
    situation:
      'You obsessively check your P&L every 30 seconds, even though nothing has changed.',
    options: [
      {
        brain: 'reptilian',
        text: 'Hypervigilance - scanning for threats constantly',
      },
      {
        brain: 'limbic',
        text: 'Dopamine-seeking behavior and need for emotional updates',
      },
      {
        brain: 'neocortex',
        text: 'Your P&L at this moment is statistically irrelevant',
      },
    ],
    correct: ['limbic'],
    explanation:
      'This is Limbic dopamine-seeking. Each check is a hit of emotional stimulation - will it feel good (up) or bad (down)? Your reward system is addicted to the updates.',
  },
  {
    id: 9,
    situation:
      "After a big loss, you close your trading platform and can't bring yourself to look at it for days.",
    options: [
      {
        brain: 'reptilian',
        text: 'Flight response - avoiding the source of threat',
      },
      { brain: 'limbic', text: "Can't face the emotional pain and shame" },
      {
        brain: 'neocortex',
        text: 'Review the trade objectively and extract the lesson',
      },
    ],
    correct: ['reptilian', 'limbic'],
    explanation:
      'Reptilian flight (avoiding threat source) combined with Limbic pain avoidance. Your platform = predator that hurt you, so your survival brain keeps you away from it.',
  },
  {
    id: 10,
    situation:
      "You follow a trading guru's every signal because 'they know better' and you don't trust yourself.",
    options: [
      {
        brain: 'reptilian',
        text: 'Fawn response - submit to alpha to stay safe',
      },
      {
        brain: 'limbic',
        text: "Seeking tribe leader's protection and approval",
      },
      { brain: 'neocortex', text: 'Develop and trust your own tested system' },
    ],
    correct: ['reptilian', 'limbic'],
    explanation:
      "Reptilian fawn response (submitting to perceived authority for safety) plus Limbic need for tribal belonging and approval. You're seeking a parent figure to make decisions for you.",
  },
  {
    id: 11,
    situation:
      "You move your stop loss further away 'to give the trade more room' after it's already stopped out.",
    options: [
      {
        brain: 'reptilian',
        text: 'Fight response - refusing to accept the threat',
      },
      { brain: 'limbic', text: 'Desperate to avoid the pain of loss' },
      { brain: 'neocortex', text: 'Honor the predetermined risk parameters' },
    ],
    correct: ['reptilian', 'limbic'],
    explanation:
      "Reptilian fight (refusing to submit to the threat) plus Limbic pain avoidance. Your brains are collaborating to rationalize away the loss you can't emotionally accept.",
  },
  {
    id: 12,
    situation:
      "You take profits at $100 because 'something feels off,' even though your plan says $300.",
    options: [
      { brain: 'reptilian', text: 'Vague threat detection triggering caution' },
      {
        brain: 'limbic',
        text: 'Anxiety and need to secure immediate pleasure',
      },
      { brain: 'neocortex', text: "Trust the system's statistical edge" },
    ],
    correct: ['reptilian', 'limbic'],
    explanation:
      "Your Reptilian brain is sensing 'danger' (profit could disappear) while Limbic wants the pleasure NOW. That 'off' feeling is your survival system, not intuition.",
  },
  {
    id: 13,
    situation:
      "You risk 10% on a single trade because 'you have a really good feeling about this one.'",
    options: [
      {
        brain: 'reptilian',
        text: 'Overconfidence after recent wins = safety illusion',
      },
      {
        brain: 'limbic',
        text: 'Chasing the massive dopamine hit of a big win',
      },
      { brain: 'neocortex', text: 'Maintain consistent 1-2% risk per trade' },
    ],
    correct: ['limbic'],
    explanation:
      "Pure Limbic dopamine chasing. Your emotional brain is hunting that massive pleasure hit from a big win, disguising it as 'conviction' or 'intuition.'",
  },
  {
    id: 14,
    situation:
      "After a losing streak, you decrease position size so much you're trading 0.1% risk per trade.",
    options: [
      {
        brain: 'reptilian',
        text: 'Extreme threat avoidance - make yourself small and invisible',
      },
      { brain: 'limbic', text: 'Protecting yourself from emotional pain' },
      {
        brain: 'neocortex',
        text: "Your edge hasn't changed; maintain proper position sizing",
      },
    ],
    correct: ['reptilian'],
    explanation:
      "Reptilian extreme threat avoidance. After multiple 'attacks,' your survival brain is making you small and cautious - like an animal trying to avoid a predator's notice.",
  },
  {
    id: 15,
    situation:
      "You create complex technical reasons why your losing trade will 'definitely bounce here.'",
    options: [
      {
        brain: 'reptilian',
        text: 'Using intelligence to justify survival response',
      },
      { brain: 'limbic', text: "Can't accept being wrong - ego protection" },
      { brain: 'neocortex', text: 'Admit the thesis is broken and exit' },
    ],
    correct: ['reptilian', 'limbic'],
    explanation:
      "Your Neocortex has been hijacked! It's now working FOR your Reptilian/Limbic brains, creating sophisticated rationalizations for emotional decisions. The smartest form of self-deception.",
  },
];

const BrainIcon = ({
  brain,
}: {
  brain: 'reptilian' | 'limbic' | 'neocortex';
}) => {
  const colors = {
    reptilian: {
      bg: 'bg-red-500/10',
      border: 'border-red-500/30',
      text: 'text-red-400',
    },
    limbic: {
      bg: 'bg-yellow-500/10',
      border: 'border-yellow-500/30',
      text: 'text-yellow-400',
    },
    neocortex: {
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/30',
      text: 'text-blue-400',
    },
  };

  const icons = {
    reptilian: Zap,
    limbic: Heart,
    neocortex: Lightbulb,
  };

  const Icon = icons[brain];
  const color = colors[brain];

  return (
    <div className={`p-2 rounded-lg ${color.bg} border ${color.border}`}>
      <Icon className={`w-5 h-5 ${color.text}`} />
    </div>
  );
};

export default function BrainIdentifier() {
  const [currentScenario, setCurrentScenario] = useState(0);
  const [selectedBrains, setSelectedBrains] = useState<string[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });

  const scenario = scenarios[currentScenario];

  const handleSelect = (brain: string) => {
    if (showResult) return;

    if (selectedBrains.includes(brain)) {
      setSelectedBrains(selectedBrains.filter((b) => b !== brain));
    } else {
      setSelectedBrains([...selectedBrains, brain]);
    }
  };

  const handleSubmit = () => {
    const isCorrect =
      selectedBrains.length === scenario.correct.length &&
      selectedBrains.every((brain) => scenario.correct.includes(brain));

    setScore((prev) => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1,
    }));
    setShowResult(true);
  };

  const handleNext = () => {
    if (currentScenario < scenarios.length - 1) {
      setCurrentScenario(currentScenario + 1);
      setSelectedBrains([]);
      setShowResult(false);
    }
  };

  const handleReset = () => {
    setCurrentScenario(0);
    setSelectedBrains([]);
    setShowResult(false);
    setScore({ correct: 0, total: 0 });
  };

  const isCorrect =
    showResult &&
    selectedBrains.length === scenario.correct.length &&
    selectedBrains.every((brain) => scenario.correct.includes(brain));

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 my-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Brain className="w-10 h-10 text-blue-400" />
            <h1 className="text-4xl font-bold text-white">Which Brain Am I?</h1>
          </div>
          <p className="text-slate-300 text-lg">
            Identify which brain is controlling your trading decisions
          </p>

          {/* Progress */}
          <div className="mt-6 flex items-center justify-center gap-4">
            <div className="text-slate-400">
              Scenario {currentScenario + 1} of {scenarios.length}
            </div>
            <div className="text-slate-400">•</div>
            <div className="text-slate-400">
              Score: {score.correct}/{score.total}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4 w-full bg-slate-700/30 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-500"
              style={{
                width: `${((currentScenario + 1) / scenarios.length) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* Scenario Card */}
        <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-8 mb-6">
          {/* Situation */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">
              Situation:
            </h2>
            <p className="text-lg text-slate-300 leading-relaxed">
              {scenario.situation}
            </p>
          </div>

          {/* Options */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white mb-4">
              Which brain(s) are driving this behavior? (Select all that apply)
            </h3>

            {scenario.options.map((option, idx) => {
              const isSelected = selectedBrains.includes(option.brain);
              const isCorrectAnswer = scenario.correct.includes(option.brain);
              const showCorrect = showResult && isCorrectAnswer;
              const showIncorrect =
                showResult && isSelected && !isCorrectAnswer;

              return (
                <button
                  key={idx}
                  onClick={() => handleSelect(option.brain)}
                  disabled={showResult}
                  className={`w-full p-4 rounded-xl border-2 transition-all text-left flex items-start gap-4 ${
                    showCorrect
                      ? 'border-green-500 bg-green-500/10'
                      : showIncorrect
                      ? 'border-red-500 bg-red-500/10'
                      : isSelected
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-slate-600 bg-slate-800/30 hover:border-slate-500'
                  } ${showResult ? 'cursor-default' : 'cursor-pointer'}`}
                >
                  <BrainIcon brain={option.brain as any} />
                  <div className="flex-1">
                    <div className="font-semibold text-white capitalize mb-1">
                      {option.brain} Brain
                    </div>
                    <div className="text-slate-300">{option.text}</div>
                  </div>
                  {showCorrect && (
                    <div className="text-green-400 text-sm font-semibold">
                      ✓ Correct
                    </div>
                  )}
                  {showIncorrect && (
                    <div className="text-red-400 text-sm font-semibold">
                      ✗ Incorrect
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Submit Button */}
          {!showResult && (
            <button
              onClick={handleSubmit}
              disabled={selectedBrains.length === 0}
              className="w-full mt-6 py-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Check Answer
            </button>
          )}

          {/* Result */}
          {showResult && (
            <div
              className={`mt-6 p-6 rounded-xl border-2 ${
                isCorrect
                  ? 'bg-green-500/10 border-green-500/30'
                  : 'bg-yellow-500/10 border-yellow-500/30'
              }`}
            >
              <div className="flex items-start gap-3 mb-4">
                <div
                  className={`text-2xl ${
                    isCorrect ? 'text-green-400' : 'text-yellow-400'
                  }`}
                >
                  {isCorrect ? '✓' : '⚠'}
                </div>
                <div>
                  <h3
                    className={`text-xl font-bold mb-2 ${
                      isCorrect ? 'text-green-400' : 'text-yellow-400'
                    }`}
                  >
                    {isCorrect ? 'Correct!' : 'Not Quite'}
                  </h3>
                  <p className="text-slate-300 leading-relaxed">
                    {scenario.explanation}
                  </p>
                </div>
              </div>

              {/* Next Button */}
              {currentScenario < scenarios.length - 1 ? (
                <button
                  onClick={handleNext}
                  className="w-full mt-4 py-3 bg-white text-slate-900 font-semibold rounded-xl hover:bg-slate-100 transition-all flex items-center justify-center gap-2"
                >
                  Next Scenario
                  <ChevronRight className="w-5 h-5" />
                </button>
              ) : (
                <div className="mt-4 text-center">
                  <div className="text-2xl font-bold text-white mb-4">
                    Final Score: {score.correct}/{score.total} (
                    {Math.round((score.correct / score.total) * 100)}%)
                  </div>
                  <button
                    onClick={handleReset}
                    className="py-3 px-6 bg-white text-slate-900 font-semibold rounded-xl hover:bg-slate-100 transition-all inline-flex items-center gap-2"
                  >
                    <RotateCcw className="w-5 h-5" />
                    Start Over
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Brain Legend */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <Zap className="w-5 h-5 text-red-400" />
              <h4 className="font-semibold text-white">Reptilian</h4>
            </div>
            <p className="text-sm text-slate-300">
              Fight, Flight, Freeze, Fawn. Pure survival instinct. 500M years
              old.
            </p>
          </div>

          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <Heart className="w-5 h-5 text-yellow-400" />
              <h4 className="font-semibold text-white">Limbic</h4>
            </div>
            <p className="text-sm text-slate-300">
              Emotions, social status, pleasure-seeking, pain avoidance. 200M
              years old.
            </p>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <Lightbulb className="w-5 h-5 text-blue-400" />
              <h4 className="font-semibold text-white">Neocortex</h4>
            </div>
            <p className="text-sm text-slate-300">
              Logic, planning, analysis, self-control. 2-3M years old.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
