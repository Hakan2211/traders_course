
import { Html } from '@react-three/drei';
import { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh, Group } from 'three';

interface FloatBoxProps {
  position: [number, number, number];
  scale: number;
  color: string;
  label: string;
  clicked: boolean;
  onClick: () => void;
  onPointerOver: () => void;
  onPointerOut: () => void;
  stiffness: number;
  damping: number;
  mass: number;
  duration: number;
}

function FloatBox({
  position,
  scale,
  color,
  label,
  clicked,
  onClick,
  onPointerOver,
  onPointerOut,
  stiffness,
  damping,
  mass,
  duration,
}: FloatBoxProps) {
  const meshRef = useRef<Mesh>(null);
  const groupRef = useRef<Group>(null);
  const targetY = clicked ? 4 : 0;
  const currentY = useRef(0);
  const velocity = useRef(0);

  useFrame((_, delta) => {
    if (meshRef.current && groupRef.current) {
      // Spring physics simulation with proper time scaling
      const dt = Math.min(delta, 0.1); // Cap delta to prevent large jumps
      const springForce = (targetY - currentY.current) * stiffness;
      const dampingForce = velocity.current * damping;
      const acceleration = (springForce - dampingForce) / mass;

      velocity.current += acceleration * dt;
      currentY.current += velocity.current * dt;

      // Apply position to the mesh
      meshRef.current.position.y = currentY.current;
      // Update group position so label follows
      groupRef.current.position.y = currentY.current;
    }
  });

  // Calculate label position relative to box size
  const labelOffsetY = scale * 0.5 + 0.5;

  return (
    <group ref={groupRef} position={[position[0], 0, position[2]]}>
      <Html
        position={[0, labelOffsetY, 0]}
        center
        style={{ pointerEvents: 'none' }}
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
            whiteSpace: 'nowrap',
            border: `2px solid ${color}`,
          }}
        >
          {label}
        </div>
      </Html>
      <mesh
        ref={meshRef}
        onClick={onClick}
        onPointerOver={onPointerOver}
        onPointerOut={onPointerOut}
        position={[0, 0, 0]}
        scale={scale}
        receiveShadow
        castShadow
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </group>
  );
}

function InteractiveFloat() {
  const [clicked, setClicked] = useState([false, false, false]);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    document.body.style.cursor = hovered ? 'pointer' : 'auto';
  }, [hovered]);

  const handleClick = (index: number) => {
    setClicked((prev) => {
      const newClicked = [...prev];
      newClicked[index] = !newClicked[index];
      return newClicked;
    });
  };

  return (
    <>
      {/* Additional lighting for better visibility */}
      <pointLight position={[10, 10, 10]} />

      <FloatBox
        position={[-4, 0, 0]}
        scale={0.1}
        color="#D11A1A"
        label="1M Float"
        clicked={clicked[0]}
        onClick={() => handleClick(0)}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        stiffness={200}
        damping={8}
        mass={1}
        duration={2}
      />

      <FloatBox
        position={[-1, 0, 0]}
        scale={1}
        color="#74B350"
        label="10M Float"
        clicked={clicked[1]}
        onClick={() => handleClick(1)}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        stiffness={150}
        damping={20}
        mass={3}
        duration={2}
      />

      <FloatBox
        position={[4, 0, 0]}
        scale={5}
        color="#E1CA36"
        label="50M Float"
        clicked={clicked[2]}
        onClick={() => handleClick(2)}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        stiffness={60}
        damping={80}
        mass={3}
        duration={1}
      />

      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -4, 0]}>
        <planeGeometry args={[20, 50]} />
        <meshStandardMaterial color={'#4A5659'} />
      </mesh>
    </>
  );
}

export default InteractiveFloat;
