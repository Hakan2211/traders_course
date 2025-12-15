import React, { useRef } from 'react';
import { Html } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { Mesh } from 'three';
import { useControls, LevaPanel, useCreateStore } from 'leva';

interface EquitiesNestedProps {
  position?: [number, number, number];
  showLabels?: boolean;
  usShare?: number; // 0-1
  usLargeShare?: number; // 0-1 within US
}

const EquitiesNested: React.FC<EquitiesNestedProps> = ({
  position = [0, -0.8, 0],
  showLabels: initialShowLabels = true,
  usShare = 0.491,
  usLargeShare = 0.87,
}) => {
  // Create a scoped Leva store
  const levaStore = useCreateStore();

  // Leva controls
  const { showLabels, explodeLevel1, explodeLevel2 } = useControls(
    'Equities Breakdown',
    {
      showLabels: {
        value: initialShowLabels,
        label: 'Show Labels',
      },
      explodeLevel1: {
        value: 0.8,
        min: 0,
        max: 2,
        step: 0.05,
        label: 'US vs World Spacing',
      },
      explodeLevel2: {
        value: 0.15,
        min: 0,
        max: 1,
        step: 0.05,
        label: 'Large vs Small Spacing',
      },
    },
    { store: levaStore }
  );

  const boxDepth = 1.2;
  const height = 3.2;
  const totalWidth = 4;

  // Proportions
  const clampedUS = Math.min(0.99, Math.max(0.01, usShare));
  const clampedUSLarge = Math.min(0.99, Math.max(0.01, usLargeShare));

  const usWidth = totalWidth * clampedUS;
  const rowWidth = totalWidth * (1 - clampedUS);
  const usLargeWidth = usWidth * clampedUSLarge;
  const usSmallWidth = usWidth * (1 - clampedUSLarge);

  // Vibrant, distinct colors
  const colorROW = '#a855f7'; // Purple for Rest of World
  const colorUSLarge = '#10b981'; // Green for US Large-cap
  const colorUSSmall = '#f59e0b'; // Orange for US Small-cap

  const usLargeRef = useRef<Mesh>(null);
  const usSmallRef = useRef<Mesh>(null);
  const rowRef = useRef<Mesh>(null);

  // Subtle hover animation
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (usLargeRef.current) {
      usLargeRef.current.rotation.y = Math.sin(t * 0.3) * 0.03;
    }
    if (usSmallRef.current) {
      usSmallRef.current.rotation.y = Math.sin(t * 0.35) * 0.03;
    }
    if (rowRef.current) {
      rowRef.current.rotation.y = Math.sin(t * 0.28) * 0.03;
    }
  });

  // Calculate positions with spacing
  const usX = -(totalWidth / 2) + usWidth / 2;
  const rowX = totalWidth / 2 - rowWidth / 2;
  const spacingOffset = explodeLevel1;

  return (
    <>
      {/* Scoped Leva Panel */}
      <Html fullscreen prepend zIndexRange={[100, 0]}>
        <div
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            transform: 'scale(0.95)',
            transformOrigin: 'top right',
            pointerEvents: 'auto',
            zIndex: 1000,
          }}
        >
          <style>{`
            div[class^="leva-"][data-theme],
            div[class*=" leva-"][data-theme],
            .leva__root,
            .leva-root,
            .leva-panel {
              position: relative !important;
              top: auto !important;
              right: auto !important;
              bottom: auto !important;
              left: auto !important;
            }
          `}</style>
          <LevaPanel
            store={levaStore}
            fill={false}
            titleBar={{ title: 'Equities Breakdown' }}
          />
        </div>
      </Html>

      <group position={position}>
        {/* Level 1: US Equities (will be split further) */}
        <group position={[usX - spacingOffset, 0, 0]}>
          {/* US Large-cap */}
          <mesh
            ref={usLargeRef}
            position={[-explodeLevel2 / 2, height / 2, 0]}
            castShadow
            receiveShadow
          >
            <boxGeometry args={[usLargeWidth, height, boxDepth]} />
            <meshStandardMaterial
              color={colorUSLarge}
              roughness={0.25}
              metalness={0.5}
              transparent={false}
            />
          </mesh>

          {/* US Small-cap */}
          <mesh
            ref={usSmallRef}
            position={[usLargeWidth + explodeLevel2 / 2, height / 2, 0]}
            castShadow
            receiveShadow
          >
            <boxGeometry args={[usSmallWidth, height, boxDepth]} />
            <meshStandardMaterial
              color={colorUSSmall}
              roughness={0.25}
              metalness={0.5}
              transparent={false}
            />
          </mesh>

          {/* Labels for US boxes */}
          {showLabels && (
            <>
              <Html position={[-explodeLevel2 / 2, height + 0.5, 0]} center>
                <div
                  style={{
                    color: 'white',
                    textAlign: 'center',
                    background: 'rgba(0, 0, 0, 0.85)',
                    padding: '8px 14px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 700,
                    pointerEvents: 'none',
                    border: `3px solid ${colorUSLarge}`,
                    whiteSpace: 'nowrap',
                    boxShadow: `0 0 20px ${colorUSLarge}60`,
                  }}
                >
                  US Large-Cap
                  <br />
                  <span style={{ fontSize: '11px', opacity: 0.9 }}>
                    87% • $54T
                  </span>
                </div>
              </Html>
              <Html
                position={[usLargeWidth + explodeLevel2 / 2, height + 0.5, 0]}
                center
              >
                <div
                  style={{
                    color: 'white',
                    textAlign: 'center',
                    background: 'rgba(0, 0, 0, 0.85)',
                    padding: '8px 14px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 700,
                    pointerEvents: 'none',
                    border: `3px solid ${colorUSSmall}`,
                    whiteSpace: 'nowrap',
                    boxShadow: `0 0 20px ${colorUSSmall}60`,
                  }}
                >
                  US Small-Cap
                  <br />
                  <span style={{ fontSize: '11px', opacity: 0.9 }}>
                    13% • $8T
                  </span>
                </div>
              </Html>
              {/* US container label */}
              <Html position={[usLargeWidth / 2, height + 1.2, 0]} center>
                <div
                  style={{
                    color: 'white',
                    textAlign: 'center',
                    background: 'rgba(59, 130, 246, 0.15)',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: 700,
                    pointerEvents: 'none',
                    border: '2px solid rgba(59, 130, 246, 0.5)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  US Equities • 49.1% • $62.2T
                </div>
              </Html>
            </>
          )}
        </group>

        {/* Rest of World */}
        <group position={[rowX + spacingOffset, 0, 0]}>
          <mesh
            ref={rowRef}
            position={[0, height / 2, 0]}
            castShadow
            receiveShadow
          >
            <boxGeometry args={[rowWidth, height, boxDepth]} />
            <meshStandardMaterial
              color={colorROW}
              roughness={0.25}
              metalness={0.5}
              transparent={false}
            />
          </mesh>

          {showLabels && (
            <Html position={[0, height + 0.5, 0]} center>
              <div
                style={{
                  color: 'white',
                  textAlign: 'center',
                  background: 'rgba(0, 0, 0, 0.85)',
                  padding: '8px 14px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 700,
                  pointerEvents: 'none',
                  border: `3px solid ${colorROW}`,
                  whiteSpace: 'nowrap',
                  boxShadow: `0 0 20px ${colorROW}60`,
                }}
              >
                🌍 Rest of World
                <br />
                <span style={{ fontSize: '11px', opacity: 0.9 }}>
                  51% • $65T
                </span>
              </div>
            </Html>
          )}
        </group>

        {/* Ground plane for reference */}
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0, 0]}
          receiveShadow
        >
          <planeGeometry args={[12, 8]} />
          <meshStandardMaterial
            color="#e7e5e4"
            roughness={0.9}
            metalness={0.1}
          />
        </mesh>
      </group>
    </>
  );
};

export default EquitiesNested;
