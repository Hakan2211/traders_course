import React from 'react';
import {
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
  ResponsiveContainer,
} from 'recharts';
import { Zap } from 'lucide-react';

interface BatteryMeterProps {
  level: number;
}

const BatteryMeter: React.FC<BatteryMeterProps> = ({ level }) => {
  // Determine color based on level
  let fill = '#10b981'; // emerald-500
  if (level < 50) fill = '#ef4444'; // red-500
  else if (level < 80) fill = '#eab308'; // yellow-500

  const data = [
    {
      name: 'Battery',
      value: level,
      fill: fill,
    },
  ];

  return (
    <div className="relative w-full h-64 flex items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart
          innerRadius="70%"
          outerRadius="100%"
          barSize={20}
          data={data}
          startAngle={180}
          endAngle={0}
        >
          <PolarAngleAxis
            type="number"
            domain={[0, 100]}
            angleAxisId={0}
            tick={false}
          />
          <RadialBar
            background={{ fill: '#1e293b' }} // slate-800
            dataKey="value"
            cornerRadius={10}
          />
        </RadialBarChart>
      </ResponsiveContainer>

      {/* Center Text */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/4 text-center">
        <div className="flex items-center justify-center mb-1">
          <Zap
            className={`w-6 h-6 ${level > 20 ? 'animate-pulse' : ''}`}
            fill={fill}
            stroke={fill}
          />
        </div>
        <div className="text-5xl font-bold tracking-tighter text-white">
          {level}%
        </div>
        <div className="text-sm font-medium text-slate-400 mt-2 uppercase tracking-widest">
          Cognitive Charge
        </div>
      </div>
    </div>
  );
};

export default BatteryMeter;
