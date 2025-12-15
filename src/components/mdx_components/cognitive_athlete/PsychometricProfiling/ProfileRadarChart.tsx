
import React, { useMemo } from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { ProfileData, Strategy, Trait } from './types';

interface ProfileRadarChartProps {
  userProfile: ProfileData;
  strategy: Strategy;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 border border-slate-700 p-3 rounded shadow-xl text-sm">
        <p className="font-bold text-slate-200 mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} style={{ color: entry.color }}>
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export const ProfileRadarChart: React.FC<ProfileRadarChartProps> = ({
  userProfile,
  strategy,
}) => {
  // Transform data for Recharts
  const data = useMemo(() => {
    return (Object.keys(userProfile) as Trait[]).map((trait) => ({
      trait,
      userValue: userProfile[trait],
      strategyValue: strategy.profile[trait],
      fullMark: 10,
    }));
  }, [userProfile, strategy]);

  // Calculate overall mismatch score
  const mismatchScore = useMemo(() => {
    let totalDiff = 0;
    (Object.keys(userProfile) as Trait[]).forEach((trait) => {
      totalDiff += Math.abs(userProfile[trait] - strategy.profile[trait]);
    });
    return totalDiff;
  }, [userProfile, strategy]);

  const isCriticalMismatch = mismatchScore > 15;

  return (
    <div className="relative w-full h-[400px] flex items-center justify-center">
      {/* Background Pulse Effect for Critical Mismatch */}
      {isCriticalMismatch && (
        <div className="absolute inset-0 bg-red-500/10 rounded-full blur-3xl animate-pulse pointer-events-none" />
      )}
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
          <PolarGrid gridType="polygon" stroke="#334155" />
          <PolarAngleAxis
            dataKey="trait"
            tick={{ fill: '#94a3b8', fontSize: 12 }}
          />
          <PolarRadiusAxis
            angle={30}
            domain={[0, 10]}
            tick={false}
            axisLine={false}
          />

          <Radar
            name="Your Profile"
            dataKey="userValue"
            stroke="#3b82f6" // Blue-500
            strokeWidth={3}
            fill="#3b82f6"
            fillOpacity={0.3}
          />

          <Radar
            name={strategy.name}
            dataKey="strategyValue"
            stroke="#eab308" // Yellow-500
            strokeWidth={3}
            fill="#eab308"
            fillOpacity={0.3}
          />
          <Tooltip content={<CustomTooltip />} />
        </RadarChart>
      </ResponsiveContainer>
      {/* Center Label if needed, or visual indicators */}
      <div className="absolute top-2 right-2 flex flex-col gap-2 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-500/30 border border-blue-500 rounded-sm"></div>
          <span className="text-blue-400">You</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-yellow-500/30 border border-yellow-500 rounded-sm"></div>
          <span className="text-yellow-400">Strategy</span>
        </div>
      </div>
    </div>
  );
};
