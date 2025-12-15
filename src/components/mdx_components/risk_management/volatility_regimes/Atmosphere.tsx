
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Regime } from './types';

interface AtmosphereProps {
  regime: Regime;
}

const Atmosphere: React.FC<AtmosphereProps> = ({ regime }) => {
  const lightRef = useRef<THREE.PointLight>(null);

  // Background color ref for smooth transition
  const bgRef = useRef(new THREE.Color('#e0f2fe'));

  useFrame(({ scene }) => {
    let targetColor = new THREE.Color('#e0f2fe'); // Calm blue
    let fogDensity = 0.02;

    if (regime === Regime.NORMAL) {
      targetColor.set('#f0fdf4');
    } else if (regime === Regime.VOLATILE) {
      targetColor.set('#fff7ed');
      fogDensity = 0.05;
    } else if (regime === Regime.CRISIS) {
      targetColor.set('#1a0505'); // Dark ominous
      fogDensity = 0.12;
    }

    // Lerp background color
    bgRef.current.lerp(targetColor, 0.02);
    scene.background = bgRef.current;

    // Update Fog
    if (!scene.fog) {
      scene.fog = new THREE.FogExp2(bgRef.current.getHex(), fogDensity);
    } else {
      const fog = scene.fog as THREE.FogExp2;
      fog.color.copy(bgRef.current);
      fog.density = THREE.MathUtils.lerp(fog.density, fogDensity, 0.01);
    }

    // Lightning effect in Crisis
    if (regime === Regime.CRISIS && lightRef.current) {
      if (Math.random() > 0.96) {
        lightRef.current.intensity = 10 + Math.random() * 20;
        lightRef.current.position.set(
          (Math.random() - 0.5) * 40,
          10 + Math.random() * 10,
          (Math.random() - 0.5) * 40
        );
      } else {
        lightRef.current.intensity = THREE.MathUtils.lerp(
          lightRef.current.intensity,
          0,
          0.2
        );
      }
    } else if (lightRef.current) {
      lightRef.current.intensity = 0;
    }
  });

  return (
    <>
      <ambientLight intensity={regime === Regime.CRISIS ? 0.1 : 0.6} />
      <directionalLight
        position={[10, 20, 10]}
        intensity={regime === Regime.CRISIS ? 0.2 : 1.0}
        castShadow
      />

      {/* Lightning Light */}
      <pointLight ref={lightRef} color="#a5f3fc" distance={50} decay={2} />
    </>
  );
};

export default Atmosphere;
