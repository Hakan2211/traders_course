
import React from 'react';
import {
  Play,
  BarChart3,
  Scale,
  Brain,
  BookOpen,
  Settings,
} from 'lucide-react';

interface PyramidLayerProps {
  label: string;
  icon: React.ReactNode;
  bottomWidth: number; // Percentage width at bottom of this layer
  topWidth: number; // Percentage width at top of this layer
  order: number; // Layer order from top (1) to bottom (6)
  totalLayers: number;
}

const PyramidLayer: React.FC<PyramidLayerProps> = ({
  label,
  icon,
  bottomWidth,
  topWidth,
  order,
  totalLayers,
}) => {
  const heightPercent = 100 / totalLayers;

  // Calculate horizontal offsets to center the trapezoid
  // Top edge should align with the bottom edge of the layer above
  const bottomLeftOffset = (100 - bottomWidth) / 2;
  const topLeftOffset = (100 - topWidth) / 2;

  // Create trapezoid using clip-path for angled sides
  // Points: top-left, top-right, bottom-right, bottom-left
  const clipPath = `polygon(
    ${topLeftOffset}% 0%,
    ${topLeftOffset + topWidth}% 0%,
    ${bottomLeftOffset + bottomWidth}% 100%,
    ${bottomLeftOffset}% 100%
  )`;

  return (
    <div
      className="relative flex items-center justify-center"
      style={{
        width: '100%',
        height: `${heightPercent}%`,
        clipPath: clipPath,
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        border: '1px solid rgba(59, 130, 246, 0.4)',
        borderRadius: '6px',
        transition: 'all 0.3s ease',
      }}
    >
      <div className="flex items-center gap-3 z-10 px-4 py-2">
        <div className="flex-shrink-0">{icon}</div>
        <span className="text-white font-medium text-xs sm:text-sm md:text-base">
          {label}
        </span>
      </div>
    </div>
  );
};

const TradingPyramid: React.FC = () => {
  const layers = [
    {
      label: 'Execution & Performance',
      icon: <Play className="w-5 h-5 text-pink-400" fill="currentColor" />,
      bottomWidth: 50,
      topWidth: 40,
    },
    {
      label: 'Strategy & Analysis',
      icon: <BarChart3 className="w-5 h-5 text-green-400" />,
      bottomWidth: 60,
      topWidth: 50,
    },
    {
      label: 'Risk & Money Management',
      icon: <Scale className="w-5 h-5 text-yellow-400" />,
      bottomWidth: 70,
      topWidth: 60,
    },
    {
      label: 'Psychology & Behavior',
      icon: <Brain className="w-5 h-5 text-pink-400" />,
      bottomWidth: 80,
      topWidth: 70,
    },
    {
      label: 'Knowledge & Learning',
      icon: <BookOpen className="w-5 h-5 text-green-400" />,
      bottomWidth: 90,
      topWidth: 80,
    },
    {
      label: 'Systems & Process',
      icon: <Settings className="w-5 h-5 text-gray-400" />,
      bottomWidth: 95,
      topWidth: 90,
    },
  ];

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-8">
      <h2 className="text-white text-2xl font-bold mb-8 text-center">
        The Trading Pyramid
      </h2>
      <div className="relative w-full max-w-2xl" style={{ height: '500px' }}>
        {/* Center the pyramid */}
        <div className="absolute inset-0 flex flex-col items-center justify-end">
          {layers.map((layer, index) => (
            <PyramidLayer
              key={index}
              label={layer.label}
              icon={layer.icon}
              bottomWidth={layer.bottomWidth}
              topWidth={layer.topWidth}
              order={index + 1}
              totalLayers={layers.length}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default TradingPyramid;
