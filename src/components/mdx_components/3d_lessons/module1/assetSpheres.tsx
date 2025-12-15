import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Sphere, Html } from '@react-three/drei';
import { Mesh } from 'three';

// Logarithmic scale function to handle the massive differences
const logScale = (value: number): number => {
  return Math.log10(value) * 0.8;
};

interface AssetSphereProps {
  position: [number, number, number];
  name: string;
  dailyVolume: number;
  color: string;
  continent: string;
}

const AssetSphere: React.FC<AssetSphereProps> = ({
  position,
  name,
  dailyVolume,
  color,
  continent,
}) => {
  const radius = logScale(dailyVolume);
  const sphereRef = useRef<Mesh>(null);

  useFrame((state) => {
    if (sphereRef.current) {
      const t = state.clock.getElapsedTime() * 0.5;
      sphereRef.current.position.y = position[1] + Math.sin(t) * 0.1;
    }
  });

  return (
    <group position={position}>
      <Sphere ref={sphereRef} args={[radius, 32, 32]}>
        <meshStandardMaterial
          color={color}
          roughness={0.4}
          metalness={0.3}
          transparent
          opacity={0.8}
        />
      </Sphere>

      <Html position={[0, radius + 0.3, 0]} center>
        <div
          style={{
            color: 'white',
            background: 'rgba(0,0,0,0.7)',
            padding: '5px 10px',
            borderRadius: '4px',
            whiteSpace: 'nowrap',
          }}
        >
          <strong>{name}</strong>
          <br />${dailyVolume}B daily
          <br />
          {continent}
        </div>
      </Html>
    </group>
  );
};

interface AssetData {
  name: string;
  position: [number, number, number];
  dailyVolume: number;
  color: string;
  continent: string;
}

const AssetSpheres: React.FC = () => {
  const assetData: AssetData[] = [
    {
      name: 'Forex',
      position: [-6, 2, 0],
      dailyVolume: 7500,
      color: '#4287f5',
      continent: 'Global',
    },
    {
      name: 'US Equities',
      position: [-2, 2, 0],
      dailyVolume: 167,
      color: '#42f5a7',
      continent: 'North America',
    },
    {
      name: 'EU Equities',
      position: [2, 2, 0],
      dailyVolume: 15,
      color: '#f542b3',
      continent: 'Europe',
    },
    {
      name: 'US Treasuries',
      position: [-4, 0, 0],
      dailyVolume: 232,
      color: '#f5d242',
      continent: 'North America',
    },
    {
      name: 'EU Govt Bonds',
      position: [0, 0, 0],
      dailyVolume: 58,
      color: '#8142f5',
      continent: 'Europe',
    },
    {
      name: 'JP Equities',
      position: [4, 0, 0],
      dailyVolume: 3,
      color: '#f54242',
      continent: 'Asia-Pacific',
    },
    {
      name: 'Mobile Money',
      position: [0, -2, 0],
      dailyVolume: 4.6,
      color: '#42f5f5',
      continent: 'Africa',
    },
  ];

  return (
    <>
      {assetData.map((asset, index) => (
        <AssetSphere key={index} {...asset} />
      ))}

      {/* Legend */}
      <group position={[-8, 4, 0]}>
        {/* <Text fontSize={0.5} color="white">
          Asset Volume Comparison
        </Text>
        <Text fontSize={0.3} position={[0, -0.5, 0]} color="#aaa">
          Size = Log10 of Daily Volume in $B
        </Text> */}
      </group>
    </>
  );
};

export default AssetSpheres;
