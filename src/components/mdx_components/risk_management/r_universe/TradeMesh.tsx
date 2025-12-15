
import React, { useLayoutEffect, useRef } from 'react';
import * as THREE from 'three';
import { ThreeEvent } from '@react-three/fiber';
import { Trade } from './types';

interface TradeMeshProps {
  trades: Trade[];
  visibleTradeIds: Set<number>;
  onHover: (trade: Trade | null, x: number, y: number) => void;
}

const tempObject = new THREE.Object3D();
const tempColor = new THREE.Color();

const gradeColorScale = (trade: Trade, isVisible: boolean) => {
  if (!isVisible) {
    return tempColor.set('#0f172a');
  }

  const r = trade.rMultiple;
  if (r >= 5) return tempColor.set('#fbbf24');
  if (r >= 3) return tempColor.set('#10b981');
  if (r > 0) return tempColor.set('#22c55e');
  if (r > -0.5) return tempColor.set('#f87171');
  if (r > -1.2) return tempColor.set('#ef4444');
  return tempColor.set('#991b1b');
};

export const TradeMesh: React.FC<TradeMeshProps> = ({
  trades,
  visibleTradeIds,
  onHover,
}) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const hoveredIdRef = useRef<number | null>(null);

  useLayoutEffect(() => {
    if (!meshRef.current) return;

    const rowLength = 50;
    const spacing = 0.8;

    trades.forEach((trade, index) => {
      const isVisible = visibleTradeIds.has(trade.id);
      const x = (index % rowLength) * spacing - (rowLength * spacing) / 2;
      const z = Math.floor(index / rowLength) * spacing * 1.5;
      const height = Math.max(0.1, Math.abs(trade.rMultiple));
      const scaleY = isVisible ? height : 0;
      const scaleXZ = isVisible ? 0.6 : 0;
      const y = trade.rMultiple >= 0 ? height / 2 : -height / 2;

      tempObject.position.set(x, y, -z);
      tempObject.scale.set(scaleXZ, scaleY, scaleXZ);
      tempObject.updateMatrix();
      meshRef.current!.setMatrixAt(index, tempObject.matrix);

      const color = gradeColorScale(trade, isVisible);
      meshRef.current!.setColorAt(index, color);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) {
      meshRef.current.instanceColor.needsUpdate = true;
    }
  }, [trades, visibleTradeIds]);

  const handlePointerMove = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    const { instanceId } = event;
    if (instanceId === undefined) return;
    const trade = trades[instanceId];
    if (!trade || !visibleTradeIds.has(trade.id)) return;

    if (hoveredIdRef.current !== instanceId) {
      hoveredIdRef.current = instanceId;
      document.body.style.cursor = 'pointer';
    }

    onHover(trade, event.clientX, event.clientY);
  };

  const handlePointerOut = () => {
    hoveredIdRef.current = null;
    document.body.style.cursor = 'auto';
    onHover(null, 0, 0);
  };

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, trades.length]}
      onPointerMove={handlePointerMove}
      onPointerOut={handlePointerOut}
      castShadow
      receiveShadow
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial roughness={0.15} metalness={0.3} vertexColors />
    </instancedMesh>
  );
};
