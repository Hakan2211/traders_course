import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { Mesh } from 'three';
import { useControls, LevaPanel, useCreateStore } from 'leva';
import * as THREE from 'three';

// Colors from the specification
const COLORS = {
  authorized: '#4287f5', // blue
  issued: '#42f5a7', // green
  outstanding: '#f542b3', // pink
  float: '#D4AF37', // gold
  treasury: '#ff8c42', // orange
  restricted: '#888888', // gray
};

interface ShareBoxProps {
  position: [number, number, number];
  size: [number, number, number]; // [width, height, depth]
  color: string;
  label: string;
  opacity: number;
  visible: boolean;
  showLabel: boolean;
  wireframe?: boolean;
}

// Smooth interpolation helper
const lerp = (start: number, end: number, factor: number): number => {
  return start + (end - start) * factor;
};

const ShareBox: React.FC<ShareBoxProps> = ({
  position,
  size,
  color,
  label,
  opacity,
  visible,
  showLabel,
  wireframe = false,
}) => {
  const meshRef = useRef<Mesh>(null);
  const targetOpacity = useRef(opacity);
  const currentOpacity = useRef(opacity);
  const targetVisible = useRef(visible);
  const targetPosition = useRef<[number, number, number]>([...position]);
  const currentPosition = useRef<[number, number, number]>([...position]);
  const targetColor = useRef(new THREE.Color(color));
  const currentColor = useRef(new THREE.Color(color));

  // Update targets when props change
  React.useEffect(() => {
    targetOpacity.current = opacity;
    targetVisible.current = visible;
    targetPosition.current = [...position];
    targetColor.current = new THREE.Color(color);
  }, [opacity, visible, position, color]);

  // Smooth animation
  useFrame(() => {
    if (meshRef.current) {
      // Smooth opacity transition
      currentOpacity.current = lerp(
        currentOpacity.current,
        targetOpacity.current,
        0.1
      );

      // Smooth color transition
      currentColor.current.r = lerp(
        currentColor.current.r,
        targetColor.current.r,
        0.1
      );
      currentColor.current.g = lerp(
        currentColor.current.g,
        targetColor.current.g,
        0.1
      );
      currentColor.current.b = lerp(
        currentColor.current.b,
        targetColor.current.b,
        0.1
      );

      const mat = meshRef.current.material as THREE.MeshStandardMaterial;
      if (mat) {
        mat.opacity = currentOpacity.current;
        mat.color = currentColor.current;
        mat.transparent = true;
      }

      // Smooth position transition
      currentPosition.current[0] = lerp(
        currentPosition.current[0],
        targetPosition.current[0],
        0.1
      );
      currentPosition.current[1] = lerp(
        currentPosition.current[1],
        targetPosition.current[1],
        0.1
      );
      currentPosition.current[2] = lerp(
        currentPosition.current[2],
        targetPosition.current[2],
        0.1
      );
      meshRef.current.position.set(
        currentPosition.current[0],
        currentPosition.current[1],
        currentPosition.current[2]
      );

      // Visibility
      meshRef.current.visible = targetVisible.current;
    }
  });

  if (!visible && currentOpacity.current < 0.01) return null;

  return (
    <group>
      <mesh
        ref={meshRef}
        position={position}
        castShadow
        receiveShadow
        visible={visible}
      >
        <boxGeometry args={size} />
        {wireframe ? (
          <meshStandardMaterial
            color={color}
            wireframe
            transparent
            opacity={currentOpacity.current}
            roughness={0.3}
            metalness={0.2}
          />
        ) : (
          <meshStandardMaterial
            color={color}
            transparent
            opacity={currentOpacity.current}
            roughness={0.3}
            metalness={0.4}
          />
        )}
      </mesh>
      {showLabel && visible && (
        <Html
          position={[position[0], position[1] + size[1] / 2 + 0.3, position[2]]}
          center
        >
          <div
            style={{
              color: 'white',
              textAlign: 'center',
              background: 'rgba(0, 0, 0, 0.8)',
              padding: '8px 12px',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: 'bold',
              pointerEvents: 'none',
              whiteSpace: 'nowrap',
              border: `2px solid ${color}`,
              opacity: 1, // Labels should always be fully opaque when visible
            }}
          >
            {label}
          </div>
        </Html>
      )}
    </group>
  );
};

interface ShareCakeSlicerProps {
  authorizedSize?: number; // Base unit (default: 1 = 100M shares)
  issuedRatio?: number; // 0-1, default 0.6
  treasuryRatio?: number; // 0-1, default 0.0833 (5M / 60M)
  floatRatio?: number; // 0-1, default 0.6364 (35M / 55M)
}

const ShareCakeSlicer: React.FC<ShareCakeSlicerProps> = ({
  authorizedSize: initialAuthorizedSize = 1,
  issuedRatio: initialIssuedRatio = 0.6,
  treasuryRatio: initialTreasuryRatio = 0.0833,
  floatRatio: initialFloatRatio = 0.6364,
}) => {
  const levaStore = useCreateStore();

  // Leva controls
  const {
    step,
    authorizedSize,
    issuedRatio,
    treasuryRatio,
    floatRatio,
    showLabels,
    showWireframes,
  } = useControls(
    'Share Cake Slicer',
    {
      step: {
        value: 0,
        min: 0,
        max: 5,
        step: 1,
        label: 'Step',
      },
      authorizedSize: {
        value: initialAuthorizedSize,
        min: 0.5,
        max: 2,
        step: 0.1,
        label: 'Authorized Size',
      },
      issuedRatio: {
        value: initialIssuedRatio,
        min: 0,
        max: 1,
        step: 0.01,
        label: 'Issued Ratio',
      },
      treasuryRatio: {
        value: initialTreasuryRatio,
        min: 0,
        max: 0.5,
        step: 0.01,
        label: 'Treasury Ratio',
      },
      floatRatio: {
        value: initialFloatRatio,
        min: 0,
        max: 1,
        step: 0.01,
        label: 'Float Ratio',
      },
      showLabels: {
        value: true,
        label: 'Show Labels',
      },
      showWireframes: {
        value: false,
        label: 'Show Wireframes',
      },
    },
    { store: levaStore }
  );

  // Calculate dimensions
  const boxWidth = authorizedSize * 0.9;
  const boxDepth = authorizedSize * 0.8;

  // Calculate heights
  const authorizedHeight = authorizedSize;
  const issuedHeight = authorizedSize * issuedRatio;
  const treasuryHeight = issuedHeight * treasuryRatio;
  const outstandingHeight = issuedHeight - treasuryHeight;
  const restrictedHeight = outstandingHeight * (1 - floatRatio);
  const floatHeight = outstandingHeight * floatRatio;

  // Calculate values in millions (for labels)
  const authorizedM = Math.round(authorizedSize * 100);
  const issuedM = Math.round(issuedHeight * 100);
  const treasuryM = Math.round(treasuryHeight * 100);
  const outstandingM = Math.round(outstandingHeight * 100);
  const restrictedM = Math.round(restrictedHeight * 100);
  const floatM = Math.round(floatHeight * 100);

  // Position calculations
  // Center everything at origin (0,0,0)
  const authorizedY = authorizedHeight / 2;
  const issuedY = issuedHeight / 2;
  const treasuryY = issuedHeight - treasuryHeight / 2; // Top of issued block
  const outstandingY = outstandingHeight / 2;
  const restrictedY = outstandingHeight - restrictedHeight / 2; // Top of outstanding block
  const floatY = floatHeight / 2;

  // Horizontal offsets for "cut out" pieces
  const treasuryOffsetX = 1.5; // Slide right
  const restrictedOffsetX = -1.5; // Slide left

  // Visibility and opacity based on step
  // Logic: Issued shows until step 3, then Outstanding replaces it
  // Outstanding shows from step 3-4, then Float replaces it at step 5
  const stepVisibility = useMemo(() => {
    return {
      authorized: step >= 1,
      issued: step >= 2 && step < 3, // Only show when Treasury hasn't been cut yet
      treasury: step >= 3,
      outstanding: step >= 3 && step < 5, // Show from step 3 until Restricted is cut
      restricted: step >= 5,
      float: step >= 5,
    };
  }, [step]);

  const stepOpacity = useMemo(() => {
    return {
      authorized: step >= 1 ? 0.3 : 0, // Transparent wireframe
      issued: step >= 2 && step < 3 ? 0.9 : 0,
      treasury: step >= 3 ? 0.9 : 0,
      outstanding: step >= 3 && step < 5 ? 0.9 : 0,
      restricted: step >= 5 ? 0.9 : 0,
      float: step >= 5 ? 1.0 : 0, // Most prominent
    };
  }, [step]);

  // Treasury position: starts at top of Issued, then slides horizontally when step >= 3
  const treasuryX = step >= 3 ? treasuryOffsetX : 0;
  const treasuryZ = step >= 3 ? 0.2 : 0; // Slight forward offset when detached
  // Treasury Y position: starts at top of issued block, then moves up as it slides out
  const treasuryYPosition =
    step >= 3
      ? issuedHeight - treasuryHeight / 2 // Keep at original position
      : issuedHeight - treasuryHeight / 2;

  // Restricted position: starts at top of Outstanding, then slides horizontally when step >= 5
  const restrictedX = step >= 5 ? restrictedOffsetX : 0;
  const restrictedZ = step >= 5 ? 0.2 : 0; // Slight forward offset when detached
  // Restricted Y position: starts at top of outstanding block
  const restrictedYPosition = outstandingHeight - restrictedHeight / 2;

  return (
    <>
      {/* Leva Panel */}
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
            titleBar={{ title: 'Share Cake Slicer' }}
          />
        </div>
      </Html>

      {/* Authorized Shares - Large transparent container */}
      <ShareBox
        position={[0, authorizedY, 0]}
        size={[boxWidth, authorizedHeight, boxDepth]}
        color={COLORS.authorized}
        label={`Authorized Shares (${authorizedM}M)`}
        opacity={stepOpacity.authorized}
        visible={stepVisibility.authorized}
        showLabel={showLabels}
        wireframe={showWireframes || true} // Always wireframe for authorized
      />

      {/* Issued Shares - Bottom portion of authorized */}
      <ShareBox
        position={[0, issuedY, 0]}
        size={[boxWidth * 0.95, issuedHeight, boxDepth * 0.95]}
        color={COLORS.issued}
        label={`Issued Shares (${issuedM}M)`}
        opacity={stepOpacity.issued}
        visible={stepVisibility.issued}
        showLabel={showLabels}
        wireframe={showWireframes}
      />

      {/* Treasury Shares - Cut out from top of issued, slides right */}
      <ShareBox
        position={[treasuryX, treasuryYPosition, treasuryZ]}
        size={[boxWidth * 0.95, treasuryHeight, boxDepth * 0.95]}
        color={COLORS.treasury}
        label={`Treasury Shares (${treasuryM}M)`}
        opacity={stepOpacity.treasury}
        visible={stepVisibility.treasury}
        showLabel={showLabels}
        wireframe={showWireframes}
      />

      {/* Outstanding Shares - Remaining after treasury removed */}
      {/* Starts green at step 3, changes to pink at step 4 */}
      <ShareBox
        position={[0, outstandingY, 0]}
        size={[boxWidth * 0.95, outstandingHeight, boxDepth * 0.95]}
        color={step >= 4 ? COLORS.outstanding : COLORS.issued}
        label={`Outstanding Shares (${outstandingM}M)`}
        opacity={stepOpacity.outstanding}
        visible={stepVisibility.outstanding}
        showLabel={showLabels}
        wireframe={showWireframes}
      />

      {/* Restricted/Insider Shares - Cut out from top of outstanding, slides left */}
      <ShareBox
        position={[restrictedX, restrictedYPosition, restrictedZ]}
        size={[boxWidth * 0.95, restrictedHeight, boxDepth * 0.95]}
        color={COLORS.restricted}
        label={`Restricted/Insider (${restrictedM}M)`}
        opacity={stepOpacity.restricted}
        visible={stepVisibility.restricted}
        showLabel={showLabels}
        wireframe={showWireframes}
      />

      {/* The Float - The golden core, bottom of outstanding */}
      <ShareBox
        position={[0, floatY, 0]}
        size={[boxWidth * 0.95, floatHeight, boxDepth * 0.95]}
        color={COLORS.float}
        label={`The Float (${floatM}M)`}
        opacity={stepOpacity.float}
        visible={stepVisibility.float}
        showLabel={showLabels}
        wireframe={showWireframes}
      />

      {/* Ground plane for reference */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[5, 5]} />
        <meshStandardMaterial color="#2a2a2a" roughness={0.8} metalness={0.1} />
      </mesh>
    </>
  );
};

export default ShareCakeSlicer;
