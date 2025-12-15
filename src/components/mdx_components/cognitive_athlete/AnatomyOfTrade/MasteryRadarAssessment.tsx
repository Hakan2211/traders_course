
import React, { useState, useMemo } from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts';
import {
  Brain,
  Activity,
  ShieldCheck,
  Zap,
  RefreshCcw,
  ArrowRight,
  RotateCcw,
  Info,
} from 'lucide-react';

// --- Types ---

type Category =
  | 'Biology'
  | 'Discipline'
  | 'Resilience'
  | 'Awareness'
  | 'Process';

interface Question {
  id: number;
  text: string;
  category: Category;
}

interface AssessmentState {
  started: boolean;
  currentQuestionIndex: number;
  answers: Record<number, number>; // questionId -> score (1-10)
  finished: boolean;
}

// --- Data ---

const QUESTIONS: Question[] = [
  {
    id: 1,
    text: 'I measure my HRV daily and adjust my trading size/aggression based on it.',
    category: 'Biology',
  },
  {
    id: 2,
    text: 'I follow a consistent pre-market ritual that primes my nervous system every single session.',
    category: 'Discipline',
  },
  {
    id: 3,
    text: 'I can recognize when my amygdala is attempting a hijack before I click a button.',
    category: 'Awareness',
  },
  {
    id: 4,
    text: 'I successfully intervene within the 6-second window >70% of the time when triggered.',
    category: 'Process',
  },
  {
    id: 5,
    text: 'I journal every trade immediately after closing it, specifically noting emotional state.',
    category: 'Process',
  },
  {
    id: 6,
    text: "I can identify which of my three brains (Reptilian, Limbic, Neocortex) is 'talking' during a trade.",
    category: 'Awareness',
  },
  {
    id: 7,
    text: 'I notice physical warning signals (tight chest, clenched jaw) in real-time.',
    category: 'Awareness',
  },
  {
    id: 8,
    text: 'I hold all positions to stop or target without premature exit based on fear or boredom.',
    category: 'Discipline',
  },
  {
    id: 9,
    text: "I can articulate the opposite case (Devil's Advocate) before entering any trade.",
    category: 'Awareness',
  },
  {
    id: 10,
    text: 'I trade at my optimal position size based on my current state, never increasing due to ego.',
    category: 'Discipline',
  },
  {
    id: 11,
    text: 'I take complete days off from trading regularly to reset cortisol levels.',
    category: 'Biology',
  },
  {
    id: 12,
    text: 'I sleep 7-9 hours consistently and prioritize sleep quality for cognitive function.',
    category: 'Biology',
  },
  {
    id: 13,
    text: 'I can lose money and still feel professional pride if I executed my system well.',
    category: 'Resilience',
  },
  {
    id: 14,
    text: 'I can win money and still be critical of my performance if I executed poorly.',
    category: 'Process',
  },
  {
    id: 15,
    text: 'I have external support (mentor, partner, therapist) or a system to check my blind spots.',
    category: 'Process',
  },
  {
    id: 16,
    text: 'My identity is separate from my trading results (I am not my P&L).',
    category: 'Resilience',
  },
  {
    id: 17,
    text: 'I manage my glucose strategically (not trading hungry or after heavy carb spikes).',
    category: 'Biology',
  },
  {
    id: 18,
    text: 'I take the next trade confidently immediately after a loss without hesitation.',
    category: 'Resilience',
  },
  {
    id: 19,
    text: 'I practice self-compassion rather than harsh self-criticism after making mistakes.',
    category: 'Resilience',
  },
  {
    id: 20,
    text: 'I stick to my rules even when no one is watching and I could get away with breaking them.',
    category: 'Discipline',
  },
];

const CATEGORY_COLORS = {
  Biology: '#10b981', // Emerald
  Discipline: '#3b82f6', // Blue
  Resilience: '#f59e0b', // Amber
  Awareness: '#0ea5e9', // Sky (was Violet)
  Process: '#ec4899', // Pink
};

const CATEGORY_ICONS = {
  Biology: Activity,
  Discipline: ShieldCheck,
  Resilience: Zap,
  Awareness: Brain,
  Process: RefreshCcw,
};

// --- Components ---

export default function MasteryRadarAssessment() {
  const [state, setState] = useState<AssessmentState>({
    started: false,
    currentQuestionIndex: 0,
    answers: {},
    finished: false,
  });

  const handleStart = () => {
    setState((prev) => ({ ...prev, started: true }));
  };

  const handleAnswer = (score: number) => {
    const currentQ = QUESTIONS[state.currentQuestionIndex];
    const nextIndex = state.currentQuestionIndex + 1;

    setState((prev) => ({
      ...prev,
      answers: { ...prev.answers, [currentQ.id]: score },
      currentQuestionIndex: nextIndex,
      finished: nextIndex >= QUESTIONS.length,
    }));
  };

  const handleRestart = () => {
    setState({
      started: false,
      currentQuestionIndex: 0,
      answers: {},
      finished: false,
    });
  };

  const results = useMemo(() => {
    if (!state.finished) return null;

    const scores: Record<Category, { total: number; count: number }> = {
      Biology: { total: 0, count: 0 },
      Discipline: { total: 0, count: 0 },
      Resilience: { total: 0, count: 0 },
      Awareness: { total: 0, count: 0 },
      Process: { total: 0, count: 0 },
    };

    let totalScore = 0;
    let maxTotalScore = QUESTIONS.length * 10;

    QUESTIONS.forEach((q) => {
      const score = state.answers[q.id] || 0;
      scores[q.category].total += score;
      scores[q.category].count += 1;
      totalScore += score;
    });

    const chartData = (Object.keys(scores) as Category[]).map((cat) => ({
      subject: cat,
      A: (scores[cat].total / (scores[cat].count * 10)) * 100, // Normalize to 100
      fullMark: 100,
    }));

    return {
      chartData,
      totalScore,
      maxTotalScore,
      percent: Math.round((totalScore / maxTotalScore) * 100),
    };
  }, [state.finished, state.answers]);

  if (!state.started) {
    return <IntroScreen onStart={handleStart} />;
  }

  if (state.finished && results) {
    return <ResultsScreen results={results} onRestart={handleRestart} />;
  }

  return (
    <QuizScreen
      question={QUESTIONS[state.currentQuestionIndex]}
      total={QUESTIONS.length}
      current={state.currentQuestionIndex + 1}
      onAnswer={handleAnswer}
    />
  );
}

// --- Sub-Components ---

function IntroScreen({ onStart }: { onStart: () => void }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 shadow-2xl text-center max-w-2xl mx-auto">
      <div className="flex justify-center mb-6">
        <div className="p-4 bg-blue-500/10 rounded-full">
          <Activity className="w-16 h-16 text-blue-400" />
        </div>
      </div>
      <h2 className="text-3xl font-bold text-white mb-4">The Mastery Radar</h2>
      <p className="text-slate-400 text-lg mb-8 leading-relaxed">
        This is not a pass/fail test. It is a diagnostic tool to visualize the
        "shape" of your trading psychology. You will be rated on 5 axes:{' '}
        <span className="text-emerald-400 font-semibold">Biology</span>,{' '}
        <span className="text-blue-400 font-semibold">Discipline</span>,{' '}
        <span className="text-amber-400 font-semibold">Resilience</span>,{' '}
        <span className="text-sky-400 font-semibold">Awareness</span>, and{' '}
        <span className="text-pink-400 font-semibold">Process</span>.
      </p>

      <div className="bg-slate-800/50 rounded-lg p-6 mb-8 text-left border border-slate-700">
        <h3 className="text-slate-200 font-semibold mb-3 flex items-center gap-2">
          <Info className="w-4 h-4" /> Instructions
        </h3>
        <ul className="space-y-2 text-slate-400 text-sm">
          <li className="flex items-start gap-2">
            <span className="text-blue-500 mt-1">•</span>
            Rate each statement from 1 (Never) to 10 (Always).
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-500 mt-1">•</span>
            Be brutally honest. You cannot improve what you do not measure
            accurately.
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-500 mt-1">•</span>
            There are 20 questions. It takes about 3 minutes.
          </li>
        </ul>
      </div>

      <button
        onClick={onStart}
        className="group relative inline-flex h-12 items-center justify-center overflow-hidden rounded-md bg-blue-600 px-8 font-medium text-white transition-all duration-300 hover:bg-blue-700 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-slate-900"
      >
        <span className="mr-2">Begin Assessment</span>
        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
      </button>
    </div>
  );
}

function QuizScreen({
  question,
  total,
  current,
  onAnswer,
}: {
  question: Question;
  total: number;
  current: number;
  onAnswer: (score: number) => void;
}) {
  const Icon = CATEGORY_ICONS[question.category];
  const color = CATEGORY_COLORS[question.category];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 shadow-2xl max-w-2xl mx-auto min-h-[500px] flex flex-col">
      {/* Header / Progress */}
      <div className="flex justify-between items-center mb-8">
        <span className="text-slate-500 font-mono text-sm uppercase tracking-wider">
          Question {current} / {total}
        </span>
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 border border-slate-700">
          <Icon className="w-4 h-4" style={{ color }} />
          <span
            className="text-xs font-bold uppercase tracking-wide"
            style={{ color }}
          >
            {question.category}
          </span>
        </div>
      </div>

      {/* Question */}
      <div className="flex-grow flex flex-col justify-center mb-10">
        <h3 className="text-2xl font-medium text-slate-100 leading-normal text-center">
          "{question.text}"
        </h3>
      </div>

      {/* Controls */}
      <div className="space-y-4">
        <div className="flex justify-between text-xs text-slate-500 uppercase font-bold tracking-wider px-1">
          <span>Never</span>
          <span>Always</span>
        </div>
        <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
            <button
              key={num}
              onClick={() => onAnswer(num)}
              className="aspect-square rounded-lg border border-slate-700 bg-slate-800 hover:bg-blue-600 hover:border-blue-500 text-slate-300 hover:text-white transition-all duration-200 font-medium text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900 active:scale-95"
            >
              {num}
            </button>
          ))}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-800 h-1 mt-8 rounded-full overflow-hidden">
        <div
          className="bg-blue-500 h-full transition-all duration-500 ease-out"
          style={{ width: `${((current - 1) / total) * 100}%` }}
        />
      </div>
    </div>
  );
}

function ResultsScreen({
  results,
  onRestart,
}: {
  results: any;
  onRestart: () => void;
}) {
  const getTier = (p: number) => {
    if (p >= 90)
      return {
        title: 'Elite Mastery',
        color: 'text-emerald-400',
        desc: 'You are operating in the top 1%.',
      };
    if (p >= 75)
      return {
        title: 'Strong Competence',
        color: 'text-blue-400',
        desc: 'Solid foundation, but room to optimize.',
      };
    if (p >= 60)
      return {
        title: 'Developing',
        color: 'text-amber-400',
        desc: 'You have the knowledge, but execution is inconsistent.',
      };
    return {
      title: 'Foundational',
      color: 'text-red-400',
      desc: 'Focus on the basics before adding complexity.',
    };
  };

  const tier = getTier(results.percent);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden max-w-4xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2">
        {/* Left Column: Chart */}
        <div className="p-8 bg-slate-900 flex flex-col items-center justify-center border-b lg:border-b-0 lg:border-r border-slate-800 relative">
          <h3 className="absolute top-6 left-6 text-sm font-mono text-slate-500 uppercase tracking-wider">
            Your Psychology Shape
          </h3>
          <div className="w-full h-[300px] sm:h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart
                cx="50%"
                cy="50%"
                outerRadius="70%"
                data={results.chartData}
              >
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis
                  dataKey="subject"
                  tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }}
                />
                <PolarRadiusAxis
                  angle={30}
                  domain={[0, 100]}
                  tick={false}
                  axisLine={false}
                />
                <Radar
                  name="Mastery"
                  dataKey="A"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  fill="#2563eb"
                  fillOpacity={0.4}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div className="text-center mt-4">
            <span className="text-4xl font-bold text-white">
              {results.percent}%
            </span>
            <div className={`text-lg font-medium ${tier.color}`}>
              {tier.title}
            </div>
            <p className="text-slate-500 text-sm mt-1">{tier.desc}</p>
          </div>
        </div>

        {/* Right Column: Breakdown */}
        <div className="p-8 bg-slate-900/50 backdrop-blur-sm overflow-y-auto max-h-[600px]">
          <h3 className="text-xl font-bold text-white mb-6">
            Detailed Analysis
          </h3>
          <div className="space-y-6">
            {results.chartData.map((item: any) => {
              const score = Math.round(item.A);
              const category = item.subject as Category;
              const Icon = CATEGORY_ICONS[category];
              const color = CATEGORY_COLORS[category];

              let advice = '';
              if (score < 60) advice = getLowScoreAdvice(category);
              else if (score < 85) advice = getMidScoreAdvice(category);
              else advice = getHighScoreAdvice(category);

              return (
                <div
                  key={category}
                  className="bg-slate-800/40 rounded-lg p-4 border border-slate-700/50"
                >
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4" style={{ color }} />
                      <span className="font-semibold text-slate-200">
                        {category}
                      </span>
                    </div>
                    <span
                      className={`font-mono font-bold ${
                        score > 80
                          ? 'text-emerald-400'
                          : score < 60
                          ? 'text-red-400'
                          : 'text-slate-300'
                      }`}
                    >
                      {score}/100
                    </span>
                  </div>
                  <div className="w-full bg-slate-700 h-1.5 rounded-full mb-3">
                    <div
                      className="h-full rounded-full transition-all duration-1000"
                      style={{ width: `${score}%`, backgroundColor: color }}
                    />
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    <span className="text-slate-200 font-medium">Focus:</span>{' '}
                    {advice}
                  </p>
                </div>
              );
            })}
          </div>

          <button
            onClick={onRestart}
            className="mt-8 w-full py-3 rounded-lg border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
          >
            <RotateCcw className="w-4 h-4" />
            Retake Assessment
          </button>
        </div>
      </div>
    </div>
  );
}

// --- Advice Generators ---

function getLowScoreAdvice(cat: Category): string {
  switch (cat) {
    case 'Biology':
      return 'Your hardware is limiting your software. Prioritize sleep and glucose stability before strategy.';
    case 'Discipline':
      return 'You are leaking edge through impulsive actions. Implement strict mechanical rules immediately.';
    case 'Resilience':
      return "Losses are causing too much damage. Work on identity separation and 'losing well'.";
    case 'Awareness':
      return 'You are trading on autopilot. Use physical cues (jaw, breath) to catch stress early.';
    case 'Process':
      return 'Your system is chaotic. Start journaling every single trade and define your 6-second intervention.';
    default:
      return '';
  }
}

function getMidScoreAdvice(cat: Category): string {
  switch (cat) {
    case 'Biology':
      return 'Good baseline. optimize your chronotype (trade at peak hours) and refine your recovery rituals.';
    case 'Discipline':
      return "You follow rules mostly, but slip when stressed. Strengthen your 'Circuit Breaker' protocols.";
    case 'Resilience':
      return "You recover, but it takes time. Focus on reframing losses as 'costs of doing business' faster.";
    case 'Awareness':
      return "You see the hijack coming sometimes. Work on the 'Devil's Advocate' drill to deepen perspective.";
    case 'Process':
      return "You have routines, but they aren't fully automatic. Focus on consistency in your weekly reviews.";
    default:
      return '';
  }
}

function getHighScoreAdvice(cat: Category): string {
  switch (cat) {
    case 'Biology':
      return "Elite physiology. Ensure you maintain this during drawdowns; don't let stress erode your habits.";
    case 'Discipline':
      return 'Excellent. You are now the casino, not the gambler. Watch for complacency.';
    case 'Resilience':
      return "Unshakeable. You can now increase size/risk purely based on math, as emotions won't interfere.";
    case 'Awareness':
      return 'You are fully conscious. Use this surplus mental energy to read market nuance others miss.';
    case 'Process':
      return 'Masterful. Your workflow is a competitive advantage. Mentor others to reinforce your own patterns.';
    default:
      return '';
  }
}
