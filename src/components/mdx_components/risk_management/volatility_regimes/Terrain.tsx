
import React, { useRef, useLayoutEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { noise2D } from './utils/noise';
import { Regime } from './types';

interface TerrainProps {
  atrMultiplier: number;
  regime: Regime;
}

const Terrain: React.FC<TerrainProps> = ({ atrMultiplier, regime }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const geometryRef = useRef<THREE.PlaneGeometry>(null);

  // Memoize base geometry parameters
  const { width, depth, segments } = useMemo(
    () => ({
      width: 40,
      depth: 40,
      segments: 128,
    }),
    []
  );

  // Create colors for interpolation
  const colors = useMemo(
    () => ({
      calmLow: new THREE.Color('#0ea5e9'), // Sky blue
      calmHigh: new THREE.Color('#22c55e'), // Green
      normalLow: new THREE.Color('#166534'), // Dark green
      normalHigh: new THREE.Color('#eab308'), // Yellow
      volatileLow: new THREE.Color('#ea580c'), // Orange
      volatileHigh: new THREE.Color('#b91c1c'), // Red
      crisisLow: new THREE.Color('#450a0a'), // Deep red
      crisisHigh: new THREE.Color('#000000'), // Black
    }),
    []
  );

  useFrame(({ clock }) => {
    if (!geometryRef.current || !meshRef.current) return;
    const time = clock.getElapsedTime();
    const positionAttribute = geometryRef.current.attributes.position;
    const colorAttribute = geometryRef.current.attributes.color;

    // Safety check for vertex count match
    const vertexCount = positionAttribute.count;

    // Intensity factors based on ATR
    const heightFactor = 1.5 * atrMultiplier;
    const speed = 0.2 + atrMultiplier * 0.1;
    const roughness = atrMultiplier * 1.5;

    for (let i = 0; i < vertexCount; i++) {
      const x = positionAttribute.getX(i);
      const y = positionAttribute.getY(i); // This is Z in world space because rotation

      // Calculate noise-based height
      // We use multiple octaves for detail
      let z =
        noise2D(x * 0.1 + time * speed * 0.2, y * 0.1 + time * speed * 0.2) *
        heightFactor;
      z += noise2D(x * 0.3, y * 0.3) * (heightFactor * 0.3);

      // Add jaggedness in high volatility
      if (atrMultiplier > 1.5) {
        z +=
          Math.abs(noise2D(x * roughness, y * roughness)) *
          (atrMultiplier * 0.4);
      }

      // Smooth valleys in calm, sharp peaks in crisis
      if (regime === Regime.CALM) {
        z = Math.sin(z * 0.5);
      } else if (regime === Regime.CRISIS) {
        z = Math.pow(Math.abs(z), 1.2) * Math.sign(z);
      }

      // Update Z (Height)
      positionAttribute.setZ(i, z);

      // Color Interpolation
      let targetColorLow, targetColorHigh;
      if (regime === Regime.CALM) {
        targetColorLow = colors.calmLow;
        targetColorHigh = colors.calmHigh;
      } else if (regime === Regime.NORMAL) {
        targetColorLow = colors.normalLow;
        targetColorHigh = colors.normalHigh;
      } else if (regime === Regime.VOLATILE) {
        targetColorLow = colors.volatileLow;
        targetColorHigh = colors.volatileHigh;
      } else {
        targetColorLow = colors.crisisLow;
        targetColorHigh = colors.crisisHigh;
      }

      // Mix based on height
      const mixFactor = THREE.MathUtils.clamp(
        (z + heightFactor) / (2 * heightFactor),
        0,
        1
      );

      const r = THREE.MathUtils.lerp(
        targetColorLow.r,
        targetColorHigh.r,
        mixFactor
      );
      const g = THREE.MathUtils.lerp(
        targetColorLow.g,
        targetColorHigh.g,
        mixFactor
      );
      const b = THREE.MathUtils.lerp(
        targetColorLow.b,
        targetColorHigh.b,
        mixFactor
      );

      colorAttribute.setXYZ(i, r, g, b);
    }

    positionAttribute.needsUpdate = true;
    colorAttribute.needsUpdate = true;
    geometryRef.current.computeVertexNormals();
  });

  // Initial geometry setup
  useLayoutEffect(() => {
    if (geometryRef.current) {
      // Add color attribute
      const count = geometryRef.current.attributes.position.count;
      geometryRef.current.setAttribute(
        'color',
        new THREE.BufferAttribute(new Float32Array(count * 3), 3)
      );
    }
  }, []);

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]}>
      <planeGeometry
        ref={geometryRef}
        args={[width, depth, segments, segments]}
      />
      <meshStandardMaterial
        vertexColors
        roughness={0.8}
        metalness={0.1}
        flatShading={regime === Regime.CRISIS || regime === Regime.VOLATILE}
        wireframe={false}
      />
    </mesh>
  );
};

export default Terrain;
