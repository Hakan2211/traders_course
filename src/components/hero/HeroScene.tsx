
import React, { useRef, Suspense } from 'react';
import {
  Canvas,
  useFrame,
  useLoader,
  extend,
  Object3DNode,
} from '@react-three/fiber';
import {
  Text3D,
  Center,
  Float,
  OrbitControls,
  useMatcapTexture,
} from '@react-three/drei';
import * as THREE from 'three';
import { TTFLoader } from 'three/examples/jsm/loaders/TTFLoader.js';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { suspend } from 'suspend-react';

// 1. Define the custom ShaderMaterial
class WaveMaterial extends THREE.ShaderMaterial {
  constructor() {
    super({
      uniforms: {
        uTime: { value: 0 },
        uTexture: { value: new THREE.Texture() },
      },
      vertexShader: `
        uniform float uTime;
        varying vec2 vUv;
        void main() {
          vUv = uv;
          vec3 pos = position;
          // Create a wave effect based on X position and Time
          pos.z += sin(pos.x * 2.0 + uTime) * 0.3;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D uTexture;
        varying vec2 vUv;
        void main() {
          vec4 textureColor = texture2D(uTexture, vUv);
          // Darken and tint the texture slightly to make text pop
          gl_FragColor = vec4(textureColor.rgb * 0.5, 1.0);
        }
      `,
    });
  }
}

// 2. Extend R3F to include the custom material
extend({ WaveMaterial });

// Add TS support for the custom element
declare global {
  namespace JSX {
    interface IntrinsicElements {
      waveMaterial: Object3DNode<WaveMaterial, typeof WaveMaterial>;
    }
  }
}

// 3. Background Component
const BackgroundPlane = () => {
  const materialRef = useRef<WaveMaterial>(null);

  // Load the texture
  const texture = useLoader(THREE.TextureLoader, '/images/hero-bg.jpg');

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
    }
  });

  return (
    <mesh position={[0, 0, -2]}>
      {/* 16:9 aspect ratio plane */}
      <planeGeometry args={[16, 9, 32, 32]} />
      {/* @ts-ignore - types for custom shader material are tricky in R3F */}
      <waveMaterial ref={materialRef} uniforms-uTexture-value={texture} />
    </mesh>
  );
};

// 4. Text Component using TTF Loader
const TitleText = ({ url }: { url: string }) => {
  // Suspend-react handles the async loading of the font
  const font = suspend(async () => {
    const loader = new TTFLoader();
    const json = await new Promise<any>((resolve) => loader.load(url, resolve));
    return json;
  }, [url]);

  // Load Matcap Texture using the hook
  const [matcap] = useMatcapTexture('C09E5C_DAD2B9_654429_81582D', 1024);

  return (
    // Moved Float position down by -1 on Y axis to lower the text
    <Float
      speed={2}
      rotationIntensity={0.5}
      floatIntensity={0.4}
      position={[0, -2.5, 0]}
    >
      <Center>
        <Text3D
          font={font}
          size={1.2}
          height={0.2}
          curveSegments={12}
          bevelEnabled
          bevelThickness={0.02}
          bevelSize={0.02}
          bevelOffset={0}
          bevelSegments={5}
        >
          Welcome
          <meshMatcapMaterial matcap={matcap} />
        </Text3D>
      </Center>
    </Float>
  );
};

// 5. Main Scene Component
export default function HeroScene() {
  // Available fonts:
  // Inter (original): 'https://api.fontsource.org/v1/fonts/inter/latin-900-normal.ttf'
  // Paprika: 'https://api.fontsource.org/v1/fonts/paprika/latin-400-normal.ttf'
  // Moon Dance: 'https://api.fontsource.org/v1/fonts/moon-dance/latin-400-normal.ttf'

  // Currently using Moon Dance as requested
  const fontUrl =
    'https://api.fontsource.org/v1/fonts/style-script/latin-400-normal.ttf';

  return (
    // Changed bg-black to bg-[#0E131B] to match app background
    <div className="w-full h-[60vh] relative bg-[#0E131B]">
      <Canvas camera={{ position: [0, 0, 10], fov: 45 }}>
        <Suspense fallback={null}>
          <ambientLight intensity={0.5} />
          <spotLight
            position={[10, 10, 10]}
            angle={0.15}
            penumbra={1}
            intensity={1}
          />
          <pointLight position={[-10, -10, -10]} intensity={0.5} />

          <BackgroundPlane />
          <TitleText url={fontUrl} />

          <OrbitControls
            enableZoom={false}
            enablePan={false}
            maxPolarAngle={Math.PI / 2}
            minPolarAngle={Math.PI / 2}
            maxAzimuthAngle={Math.PI / 30}
            minAzimuthAngle={-Math.PI / 30}
          />
        </Suspense>
      </Canvas>
      {/* Gradient overlay for subtle transition */}
      <div className="absolute bottom-0 left-0 w-full h-[200px] bg-gradient-to-t from-[#0E131B] to-transparent pointer-events-none" />
      <div className="absolute top-0 left-0 w-full h-[200px] bg-gradient-to-b from-[#0E131B] to-transparent pointer-events-none" />
      {/* Left Fade */}
      <div className="absolute top-0 left-0 h-full w-[150px] bg-gradient-to-r from-[#0E131B] to-transparent pointer-events-none" />
      {/* Right Fade */}
      <div className="absolute top-0 right-0 h-full w-[150px] bg-gradient-to-l from-[#0E131B] to-transparent pointer-events-none" />
    </div>
  );
}
