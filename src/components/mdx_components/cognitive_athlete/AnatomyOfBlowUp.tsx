
import React, { useEffect, useRef, useState } from 'react';
import {
  AreaChart,
  Area,
  YAxis,
  ResponsiveContainer,
  LineChart,
  Line,
  ReferenceLine,
} from 'recharts';
import { Heart, Brain, DollarSign, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export interface TimelineEvent {
  id: string;
  time: string;
  price: number;
  heartRate: number;
  cognitiveFunction: number; // 0-100
  pnl: number;
  shares: number;
  narrative: string;
  action?: 'BUY' | 'SELL' | 'HOLD' | 'PANIC BUY' | 'MARGIN CALL';
  isHijackMoment?: boolean;
}

export interface ChartDataPoint {
  time: string;
  price: number;
  heartRate: number;
  cognitiveFunction: number;
}

const timelineData: TimelineEvent[] = [
  {
    id: 'step1',
    time: '10:47:00',
    price: 142.0,
    heartRate: 72,
    cognitiveFunction: 100,
    pnl: -200,
    shares: 4000,
    narrative:
      'Thomas is long 4000 shares. Risk is defined. Heart rate is resting. Rational brain is fully in control.',
    action: 'HOLD',
  },
  {
    id: 'step2',
    time: '10:47:30',
    price: 139.5,
    heartRate: 110,
    cognitiveFunction: 80,
    pnl: -10000,
    shares: 4000,
    narrative:
      'Support breaks. Price drops $2.50 in seconds. Stop loss triggers... but Thomas hesitates. "It\'s just stop hunting," he rationalizes.',
    action: 'HOLD',
  },
  {
    id: 'step3',
    time: '10:48:00',
    price: 139.0,
    heartRate: 125,
    cognitiveFunction: 60,
    pnl: -12000,
    shares: 4000,
    narrative:
      'Loss hits $12k. Chest tightens. Adrenaline surges. The internal voice screams "GET OUT" but another says "WAIT".',
    action: 'HOLD',
  },
  {
    id: 'step4',
    time: '10:48:15',
    price: 138.0,
    heartRate: 140,
    cognitiveFunction: 35,
    pnl: -16000,
    shares: 4000,
    narrative:
      'Tunnel vision sets in. Breathing is shallow. Time distorts. Prefrontal cortex is losing blood flow.',
    action: 'HOLD',
  },
  {
    id: 'step5',
    time: '10:48:23',
    price: 137.5,
    heartRate: 145,
    cognitiveFunction: 10,
    pnl: -18000,
    shares: 8000,
    narrative:
      'AMYGDALA HIJACK COMPLETE. Logic is offline. Survival instinct kicks in. He doesn\'t exit. He doubles down to "fix" the pain.',
    action: 'PANIC BUY',
    isHijackMoment: true,
  },
  {
    id: 'step6',
    time: '10:49:00',
    price: 136.0,
    heartRate: 142,
    cognitiveFunction: 15,
    pnl: -30000,
    shares: 8000,
    narrative:
      'Price continues to drop. Now holding 8,000 shares. The loss is compounding twice as fast. He is paralyzed.',
    action: 'HOLD',
  },
  {
    id: 'step7',
    time: '10:55:00',
    price: 130.0,
    heartRate: 150,
    cognitiveFunction: 5,
    pnl: -48000,
    shares: 10000,
    narrative:
      "Total despair. He adds more at the bottom. The broker's risk system flags the account.",
    action: 'PANIC BUY',
  },
  {
    id: 'step8',
    time: '10:56:00',
    price: 129.0,
    heartRate: 120, // Drop due to resignation/shock
    cognitiveFunction: 20,
    pnl: -51347,
    shares: 0,
    narrative:
      'Margin Call. Broker liquidates everything. $51,347 gone. 10 minutes later, the stock bounces.',
    action: 'MARGIN CALL',
  },
];

export const AnatomyOfBlowUp: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Intersection Observer to detect which text block is in view
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Number(entry.target.getAttribute('data-index'));
            setActiveStep(index);
          }
        });
      },
      {
        root: null,
        rootMargin: '-40% 0px -40% 0px', // Active when element is in the middle 20% of screen
        threshold: 0,
      }
    );

    stepRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, []);

  const currentData = timelineData[activeStep];
  const isHijack = currentData.isHijackMoment;

  // Prepare chart data: we want to show history up to the current step
  const chartData = timelineData.map((d, i) => ({
    ...d,
    active: i === activeStep,
    past: i <= activeStep,
  }));

  return (
    <div className="w-full bg-gradient-to-br from-gray-950 via-gray-900 to-black border-y rounded-lg border-gray-800 my-12 relative isolate">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="py-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            The Anatomy of a Blow-up
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Scroll to replay Thomas's physiological and financial collapse.
            Watch how cognitive function inversely correlates with heart rate.
          </p>
        </div>

        {/* Mobile Dashboard (Sticky Top inside container) */}
        <div className="lg:hidden sticky top-16 z-40 bg-gray-900/95 backdrop-blur-sm border-b border-gray-800 -mx-4 px-4 py-3 mb-8 shadow-xl">
          <div className="grid grid-cols-3 gap-2 items-center">
            <div className="bg-gray-950 p-2 rounded text-center border border-gray-800">
              <div className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">
                Price
              </div>
              <div className="text-emerald-400 font-mono font-bold text-lg">
                ${currentData.price.toFixed(2)}
              </div>
            </div>
            <div className="bg-gray-950 p-2 rounded text-center border border-gray-800">
              <div className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">
                Heart Rate
              </div>
              <div
                className={`${
                  currentData.heartRate > 120
                    ? 'text-red-500 animate-pulse'
                    : 'text-rose-400'
                } font-mono font-bold text-lg`}
              >
                {currentData.heartRate}{' '}
                <span className="text-xs text-gray-600">BPM</span>
              </div>
            </div>
            <div className="bg-gray-950 p-2 rounded text-center border border-gray-800">
              <div className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">
                IQ Level
              </div>
              <div
                className={`font-mono font-bold text-lg ${
                  currentData.cognitiveFunction < 40
                    ? 'text-red-500'
                    : 'text-blue-400'
                }`}
              >
                {currentData.cognitiveFunction}%
              </div>
            </div>
          </div>
          {/* Mini Progress Bar for IQ */}
          <div className="w-full h-1 bg-gray-800 mt-3 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                currentData.cognitiveFunction < 40
                  ? 'bg-red-600'
                  : currentData.cognitiveFunction < 70
                  ? 'bg-yellow-500'
                  : 'bg-blue-500'
              }`}
              style={{ width: `${currentData.cognitiveFunction}%` }}
            />
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 pb-24">
          {/* LEFT: Scrollable Narrative */}
          <div className="w-full lg:w-1/3 flex flex-col gap-[60vh] py-[10vh]">
            {timelineData.map((step, index) => (
              <div
                key={step.id}
                ref={(el) => {
                  stepRefs.current[index] = el;
                }}
                data-index={index}
                className={`transition-all duration-500 p-6 rounded-xl border ${
                  activeStep === index
                    ? 'bg-gray-800/90 border-gray-600 shadow-xl scale-100 opacity-100'
                    : 'bg-gray-900/50 border-gray-800 scale-95 opacity-40 blur-[1px]'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <Badge className="bg-blue-600 hover:bg-blue-500 text-white border-transparent">
                    {step.time}
                  </Badge>
                  {step.action === 'PANIC BUY' && (
                    <Badge variant="destructive" className="animate-pulse">
                      PANIC BUY
                    </Badge>
                  )}
                  {step.action === 'MARGIN CALL' && (
                    <Badge variant="destructive">LIQUIDATION</Badge>
                  )}
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  {step.action === 'HOLD' ? 'Holding & Hoping' : step.action}
                </h3>
                <p className="text-gray-300 leading-relaxed text-lg">
                  {step.narrative}
                </p>
                <div className="mt-4 pt-4 border-t border-gray-700 flex justify-between text-sm">
                  <span className="text-gray-400">Loss:</span>
                  <span
                    className={`font-mono font-bold ${
                      step.pnl < -10000 ? 'text-red-500' : 'text-gray-200'
                    }`}
                  >
                    ${Math.abs(step.pnl).toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* RIGHT: Sticky Dashboard (Desktop) */}
          <div className="hidden lg:block lg:w-2/3 relative">
            <div className="sticky top-24 h-[600px] bg-gray-950 rounded-2xl border border-gray-800 p-6 shadow-2xl overflow-hidden flex flex-col gap-6">
              {/* Hijack Overlay */}
              {isHijack && (
                <div className="absolute inset-0 bg-red-900/20 z-20 flex items-center justify-center pointer-events-none animate-in fade-in duration-300">
                  <div className="bg-red-600 text-white px-8 py-4 rounded-xl shadow-2xl border-4 border-red-500 transform rotate-12 scale-125">
                    <h2 className="text-4xl font-black uppercase tracking-tighter">
                      AMYGDALA HIJACK
                    </h2>
                    <p className="text-center font-bold mt-1">LOGIC OFFLINE</p>
                  </div>
                </div>
              )}

              {/* Top: Stock Chart */}
              <div className="h-1/3 w-full bg-gray-900/50 rounded-lg p-4 border border-gray-800/50 relative">
                <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-500" />
                  <span className="text-sm font-bold text-gray-300">
                    Stock Price
                  </span>
                </div>
                <div className="absolute top-4 right-4 z-10">
                  <span className="text-2xl font-mono font-bold text-white">
                    ${currentData.price.toFixed(2)}
                  </span>
                </div>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
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
                          stopColor="#10b981"
                          stopOpacity={0.1}
                        />
                        <stop
                          offset="95%"
                          stopColor="#10b981"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <YAxis domain={['auto', 'auto']} hide />
                    <Area
                      type="monotone"
                      dataKey="price"
                      stroke="#10b981"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorPrice)"
                      isAnimationActive={false}
                    />
                    {/* Current Position Dot */}
                    <ReferenceLine x={activeStep} stroke="none">
                      <line />
                    </ReferenceLine>
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Middle: Heart Rate */}
              <div className="h-1/3 w-full bg-gray-900/50 rounded-lg p-4 border border-gray-800/50 relative">
                <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
                  <Heart
                    className={`w-4 h-4 ${
                      currentData.heartRate > 120
                        ? 'text-red-500 animate-pulse'
                        : 'text-rose-500'
                    }`}
                  />
                  <span className="text-sm font-bold text-gray-300">
                    Heart Rate (BPM)
                  </span>
                </div>
                <div className="absolute top-4 right-4 z-10">
                  <span
                    className={`text-3xl font-mono font-bold ${
                      currentData.heartRate > 130
                        ? 'text-red-500'
                        : 'text-rose-400'
                    }`}
                  >
                    {currentData.heartRate}
                  </span>
                </div>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <YAxis domain={[60, 160]} hide />
                    <Line
                      type="monotone"
                      dataKey="heartRate"
                      stroke="#ef4444"
                      strokeWidth={3}
                      dot={false}
                      isAnimationActive={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Bottom: Cognitive Function */}
              <div className="flex-1 flex flex-col justify-center bg-gray-900/50 rounded-lg p-6 border border-gray-800/50 relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Brain className="w-5 h-5 text-blue-400" />
                    <span className="text-sm font-bold text-gray-300">
                      Cognitive Function (IQ)
                    </span>
                  </div>
                  <span
                    className={`text-2xl font-bold ${
                      currentData.cognitiveFunction < 40
                        ? 'text-red-500'
                        : currentData.cognitiveFunction < 70
                        ? 'text-yellow-500'
                        : 'text-blue-400'
                    }`}
                  >
                    {currentData.cognitiveFunction}%
                  </span>
                </div>

                <div className="w-full bg-gray-800 h-8 rounded-full overflow-hidden relative border border-gray-700">
                  <div
                    className={`h-full transition-all duration-700 ease-out flex items-center justify-end pr-2 ${
                      currentData.cognitiveFunction < 40
                        ? 'bg-red-600'
                        : currentData.cognitiveFunction < 70
                        ? 'bg-yellow-500'
                        : 'bg-blue-500'
                    }`}
                    style={{ width: `${currentData.cognitiveFunction}%` }}
                  ></div>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2 text-xs text-gray-500 text-center uppercase tracking-wider font-semibold">
                  <div
                    className={
                      currentData.cognitiveFunction < 30
                        ? 'text-red-500 font-bold'
                        : ''
                    }
                  >
                    Survival Mode
                  </div>
                  <div
                    className={
                      currentData.cognitiveFunction >= 30 &&
                      currentData.cognitiveFunction < 80
                        ? 'text-yellow-500 font-bold'
                        : ''
                    }
                  >
                    Emotional
                  </div>
                  <div
                    className={
                      currentData.cognitiveFunction >= 80
                        ? 'text-blue-500 font-bold'
                        : ''
                    }
                  >
                    Rational
                  </div>
                </div>
                {currentData.cognitiveFunction < 40 && (
                  <div className="mt-4 p-3 bg-red-950/30 border border-red-900/50 rounded flex gap-3 items-center">
                    <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
                    <p className="text-sm text-red-300">
                      <strong>Warning:</strong> Prefrontal cortex inhibited.
                      Executive decision making is currently offline.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
