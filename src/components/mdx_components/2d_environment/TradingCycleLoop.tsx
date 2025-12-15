
import React from 'react';
import { Settings, BarChart3, Target, Play, RefreshCw } from 'lucide-react';

interface CycleStageProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  position: { top: string; left: string; transform: string };
  color: string;
}

const CycleStage: React.FC<CycleStageProps> = ({
  title,
  description,
  icon,
  position,
  color,
}) => {
  return (
    <div
      className="absolute flex flex-col items-center justify-center"
      style={{
        top: position.top,
        left: position.left,
        transform: position.transform,
      }}
    >
      <div
        className="rounded-xl p-4 shadow-lg border-2 min-w-[160px] max-w-[180px] transition-all hover:scale-105"
        style={{
          backgroundColor: 'rgba(59, 130, 246, 0.15)',
          borderColor: color,
        }}
      >
        <div className="flex flex-col items-center text-center gap-2">
          <div className="flex-shrink-0" style={{ color }}>
            {icon}
          </div>
          <h3 className="text-white font-bold text-base">{title}</h3>
          <p className="text-white/80 text-xs leading-relaxed">{description}</p>
        </div>
      </div>
    </div>
  );
};

const TradingCycleLoop: React.FC = () => {
  const radius = 38; // Percentage radius from center (increased for more spacing)
  const centerX = 50;
  const centerY = 50;

  const stages = [
    {
      title: '1. System & Process',
      description:
        'Your routines, rules, and structure that keep you consistent',
      icon: <Settings className="w-6 h-6" />,
      position: {
        top: `${centerY - radius}%`,
        left: `${centerX}%`,
        transform: 'translate(-50%, -35%)',
      },
      color: '#3b82f6',
    },
    {
      title: '2. Strategy',
      description: 'The logic of how you intend to make money',
      icon: <BarChart3 className="w-6 h-6" />,
      position: {
        top: `${centerY}%`,
        left: `${centerX + radius}%`,
        transform: 'translate(-50%, -50%)',
      },
      color: '#10b981',
    },
    {
      title: '3. Setup',
      description:
        "Real-time trade opportunities that fit your strategy's rules",
      icon: <Target className="w-6 h-6" />,
      position: {
        top: `${centerY + radius}%`,
        left: `${centerX}%`,
        transform: 'translate(-50%, -70%)',
      },
      color: '#f59e0b',
    },
    {
      title: '4. Execution',
      description: 'Applying discipline and precision in live conditions',
      icon: <Play className="w-6 h-6" />,
      position: {
        top: `${centerY}%`,
        left: `${centerX - radius}%`,
        transform: 'translate(-50%, -50%)',
      },
      color: '#ef4444',
    },
  ];

  // Calculate arrow paths for circular flow
  // Using SVG arc paths to create smooth circular connections

  const arrowPaths = [
    // From System & Process (top) to Strategy (right)
    {
      d: `M ${centerX} ${centerY - radius} A ${radius} ${radius} 0 0 1 ${
        centerX + radius
      } ${centerY}`,
    },
    // From Strategy (right) to Setup (bottom)
    {
      d: `M ${
        centerX + radius
      } ${centerY} A ${radius} ${radius} 0 0 1 ${centerX} ${centerY + radius}`,
    },
    // From Setup (bottom) to Execution (left)
    {
      d: `M ${centerX} ${centerY + radius} A ${radius} ${radius} 0 0 1 ${
        centerX - radius
      } ${centerY}`,
    },
    // From Execution (left) back to System & Process (top)
    {
      d: `M ${
        centerX - radius
      } ${centerY} A ${radius} ${radius} 0 0 1 ${centerX} ${centerY - radius}`,
    },
  ];

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-8">
      <h2 className="text-white text-2xl font-bold mb-8 text-center">
        The Trading Cycle Loop
      </h2>
      <div
        className="relative w-full max-w-2xl"
        style={{ height: '600px', aspectRatio: '1' }}
      >
        {/* SVG for arrows */}
        <svg
          className="absolute inset-0 w-full h-full"
          style={{ overflow: 'visible' }}
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="10"
              refX="9"
              refY="3"
              orient="auto"
            >
              <polygon points="0 0, 10 3, 0 6" fill="#94a3b8" opacity="0.8" />
            </marker>
          </defs>
          {arrowPaths.map((path, index) => (
            <path
              key={index}
              d={path.d}
              stroke="#94a3b8"
              strokeWidth="0.5"
              fill="none"
              markerEnd="url(#arrowhead)"
              opacity="0.7"
            />
          ))}
        </svg>

        {/* Stages */}
        {stages.map((stage, index) => (
          <CycleStage key={index} {...stage} />
        ))}

        {/* Center icon showing the loop */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="rounded-full bg-gray-800/50 p-4 border-2 border-gray-600">
            <RefreshCw className="w-10 h-10 text-gray-400" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TradingCycleLoop;
