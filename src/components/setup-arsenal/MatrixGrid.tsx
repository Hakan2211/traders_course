
import React from 'react';
import { Text, Grid } from '@react-three/drei';
import { TimeFrame, SetupType } from './types';

export const MatrixGrid: React.FC = () => {
  const xLabels = Object.values(TimeFrame);
  const yLabels = Object.values(SetupType);

  return (
    <group>
      {/* Main Floor Grid */}
      <Grid
        position={[0, -10, 0]}
        args={[20, 20]}
        cellSize={1}
        cellThickness={0.5}
        cellColor="#1e293b"
        sectionSize={5}
        sectionThickness={1}
        sectionColor="#3b82f6"
        fadeDistance={30}
        infiniteGrid
      />

      {/* X Axis Labels (Time) */}
      {xLabels.map((label, i) => {
        // Mapping index 0-5 to pos -5 to 5 (step 2)
        const pos = -5 + i * 2;
        return (
          <group key={label} position={[pos, -10.2, 6]}>
            <Text
              color="#94a3b8"
              fontSize={0.4}
              anchorX="center"
              anchorY="middle"
              rotation={[-Math.PI / 2, 0, 0]}
            >
              {label.split(' ')[0]} {/* Shorten label */}
            </Text>
          </group>
        );
      })}

      {/* Y Axis Labels (Type) - Vertical Post */}
      <group position={[-7, 0, 0]}>
        {/* Vertical Line */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.1, 20, 0.1]} />
          <meshStandardMaterial color="#475569" />
        </mesh>

        {yLabels.map((label, i) => {
          // Map index 0-4 to pos 8 to -8 (step 4)
          // BREAKOUT(0) -> 8
          // EVENT(4) -> -8
          const pos = 8 - i * 4;
          return (
            <Text
              key={label}
              position={[-0.4, pos, 0]}
              color="#cbd5e1"
              fontSize={0.5}
              anchorX="right"
              anchorY="middle"
            >
              {label}
            </Text>
          );
        })}
      </group>

      {/* Z Axis Indicators (Risk) - Depth Markers */}
      <group position={[7, -10, 0]}>
        <Text
          position={[0, 0.1, -5]}
          rotation={[-Math.PI / 2, 0, -Math.PI / 2]}
          fontSize={0.5}
          color="#ef4444"
        >
          High Risk (Back)
        </Text>
        <Text
          position={[0, 0.1, 5]}
          rotation={[-Math.PI / 2, 0, -Math.PI / 2]}
          fontSize={0.5}
          color="#22c55e"
        >
          Low Risk (Front)
        </Text>
      </group>
    </group>
  );
};
