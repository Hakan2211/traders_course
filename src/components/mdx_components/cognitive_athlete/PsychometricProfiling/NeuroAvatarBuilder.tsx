
import React, { useState, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import {
  OrbitControls,
  Torus,
  Icosahedron,
  Sparkles,
  Float,
  Text,
} from '@react-three/drei';
import * as THREE from 'three';
import {
  Brain,
  Activity,
  Zap,
  Shield,
  Target,
  Search,
  MousePointer2,
} from 'lucide-react';
import { Traits, INITIAL_TRAITS, Archetype } from './types';

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      group: any;
      meshStandardMaterial: any;
      color: any;
      ambientLight: any;
      pointLight: any;
    }
  }
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      group: any;
      meshStandardMaterial: any;
      color: any;
      ambientLight: any;
      pointLight: any;
    }
  }
}

// --- Logic: Archetype Calculation ---
const calculateArchetype = (traits: Traits): Archetype => {
  const {
    openness,
    conscientiousness,
    extraversion,
    neuroticism,
    dopamine,
    riskTolerance,
  } = traits;

  if (extraversion > 7 && dopamine < 4 && riskTolerance > 6) {
    return {
      name: 'THE HYPER-SCALPER',
      description:
        'High energy, needs constant stimulation. Thrives in chaos but needs strict rules.',
      color: '#facc15', // Yellow
      skills: ['Rapid Pattern Recognition', 'Execution Speed', 'Flow State'],
      weaknesses: ['Overtrading', 'Boredom', 'Impatience'],
    };
  }

  if (neuroticism > 7) {
    return {
      name: 'THE DEFENSIVE SENTINEL',
      description:
        "Highly sensitive to risk. Your superpower is risk management, provided you don't freeze.",
      color: '#ef4444', // Red
      skills: ['Risk Assessment', 'Capital Preservation', 'Detailed Planning'],
      weaknesses: ['Analysis Paralysis', 'Fear of Entry', 'Panic Exits'],
    };
  }

  if (conscientiousness > 7 && openness < 5) {
    return {
      name: 'THE SYSTEMATIC MACHINE',
      description:
        'Methodical, disciplined, and consistent. You execute the plan without emotion.',
      color: '#22c55e', // Green
      skills: ['Discipline', 'Consistency', 'Journaling'],
      weaknesses: ['Inflexibility', 'Adaptation Speed', 'Creativity'],
    };
  }

  if (openness > 7 && conscientiousness > 6) {
    return {
      name: 'THE MACRO STRATEGIST',
      description:
        'Big picture thinker. You connect dots others miss across long timeframes.',
      color: '#3b82f6', // Blue
      skills: ['Thesis Generation', 'Market Structure', 'Patience'],
      weaknesses: [
        'Execution Timing',
        'Missing Short-term Moves',
        'Complexity Bias',
      ],
    };
  }

  if (dopamine > 7 && extraversion < 5) {
    return {
      name: 'THE SNIPER',
      description:
        'Patient and calm. You wait days for the perfect setup and strike once.',
      color: '#a855f7', // Purple
      skills: ['Patience', 'Precision', 'Emotional Stability'],
      weaknesses: ['Hesitation', 'Perfectionism', 'Low Frequency'],
    };
  }

  return {
    name: 'THE ADAPTIVE HYBRID',
    description:
      'Balanced profile. You can adapt to multiple styles but must define your own edge.',
    color: '#ffffff',
    skills: ['Flexibility', 'Balance', 'Learning'],
    weaknesses: ['Jack of all trades, master of none', 'Lack of conviction'],
  };
};

// --- 3D Components ---
const NeuroAvatar = ({
  traits,
  archetypeColor,
}: {
  traits: Traits;
  archetypeColor: string;
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const nervousSystemRef = useRef<THREE.Group>(null);

  // Logic to map traits to visual properties

  // Neuroticism: Blue (Low) -> Red (High). Jitter speed.
  const stressColor = new THREE.Color().setHSL(
    traits.neuroticism > 5 ? 0 : 0.6,
    1,
    0.5
  );
  const stressSpeed = 0.5 + (traits.neuroticism / 10) * 4;

  // Extraversion: Size of energy field and glow intensity
  const energyScale = 0.8 + (traits.extraversion / 10) * 1.5;
  const energyCount = Math.floor(traits.extraversion * 20);

  // Openness: Complexity of geometry (represented by rotation speed and form)
  // const complexitySpeed = 0.2 + (traits.openness / 10); // unused

  // Conscientiousness: Stability (Vertical movement reduced)
  const stability = 1 - traits.conscientiousness / 10;

  useFrame((state) => {
    const t = state.clock.getElapsedTime();

    if (groupRef.current) {
      // Base rotation
      groupRef.current.rotation.y = t * 0.2;
      // Float effect based on stability
      groupRef.current.position.y = Math.sin(t * stability) * 0.2;
    }

    if (coreRef.current) {
      // Core pulse
      const pulse = Math.sin(t * 3) * 0.1 + 1;
      coreRef.current.scale.setScalar(pulse);
    }

    if (nervousSystemRef.current) {
      nervousSystemRef.current.rotation.x = Math.sin(t * stressSpeed) * 0.2;
      nervousSystemRef.current.rotation.z =
        Math.cos(t * stressSpeed * 0.8) * 0.2;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Central Core (The Mind) */}
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
        <Icosahedron args={[1, 1]} ref={coreRef}>
          <meshStandardMaterial
            color={archetypeColor}
            wireframe
            emissive={archetypeColor}
            emissiveIntensity={traits.dopamine / 5}
          />
        </Icosahedron>
      </Float>

      {/* Nervous System (Internal Wiring) */}
      <group ref={nervousSystemRef}>
        <Torus args={[1.5, 0.05, 16, 100]} rotation={[Math.PI / 2, 0, 0]}>
          <meshStandardMaterial
            color={stressColor}
            emissive={stressColor}
            emissiveIntensity={2}
          />
        </Torus>
        <Torus args={[1.2, 0.02, 16, 100]} rotation={[Math.PI / 3, 0, 0]}>
          <meshStandardMaterial
            color={stressColor}
            emissive={stressColor}
            emissiveIntensity={1}
          />
        </Torus>
        <Torus args={[1.8, 0.03, 16, 100]} rotation={[Math.PI / 1.5, 0, 0]}>
          <meshStandardMaterial
            color={stressColor}
            emissive={stressColor}
            emissiveIntensity={1}
          />
        </Torus>
      </group>

      {/* Energy Field (Extraversion) */}
      <Sparkles
        count={energyCount * 3}
        scale={energyScale * 4}
        size={4}
        speed={0.4}
        opacity={0.6}
        color={traits.extraversion > 5 ? '#fbbf24' : '#60a5fa'}
      />

      {/* Risk Tolerance Halo */}
      <Torus args={[2.5, 0.02, 16, 100]} rotation={[Math.PI / 2, 0, 0]}>
        <meshStandardMaterial
          color={traits.riskTolerance > 5 ? '#ef4444' : '#22c55e'}
          transparent
          opacity={0.3}
        />
      </Torus>

      {/* Dynamic Label in 3D Space */}
      <Text
        position={[0, 3.5, 0]}
        fontSize={0.3}
        color={archetypeColor}
        anchorX="center"
        anchorY="middle"
        font="https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Mu4mxM.woff" // Standard font
      >
        HARDWARE DETECTED
      </Text>
    </group>
  );
};

// --- UI Components ---
const TraitSlider = ({
  label,
  value,
  onChange,
  icon: Icon,
  description,
  colorClass,
}: {
  label: string;
  value: number;
  onChange: (val: number) => void;
  icon: any;
  description: string;
  colorClass: string;
}) => (
  <div className="mb-6 group">
    <div className="flex justify-between items-center mb-2">
      <div className="flex items-center gap-2 text-cyan-400">
        <Icon size={18} className={colorClass} />
        <span className="font-mono text-sm uppercase tracking-wider font-bold">
          {label}
        </span>
      </div>
      <span className="text-xs font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
        {value}/10
      </span>
    </div>
    <div className="relative h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
      <div
        className={`absolute top-0 left-0 h-full transition-all duration-300 ${colorClass.replace(
          'text-',
          'bg-'
        )}`}
        style={{ width: `${value * 10}%` }}
      />
      <input
        type="range"
        min="1"
        max="10"
        step="1"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
      />
    </div>
    <p className="text-[10px] text-slate-500 mt-1 h-3 opacity-0 group-hover:opacity-100 transition-opacity">
      {description}
    </p>
  </div>
);

const ArchetypePanel = ({ archetype }: { archetype: Archetype }) => (
  <div className="bg-slate-900/80 backdrop-blur-md border border-slate-700 p-6 rounded-lg relative overflow-hidden mt-4">
    <div
      className="absolute top-0 right-0 w-24 h-24 blur-3xl rounded-full -mr-10 -mt-10 pointer-events-none"
      style={{ backgroundColor: archetype.color, opacity: 0.2 }}
    />

    <div className="flex items-center gap-3 mb-4">
      <Target className="w-6 h-6" style={{ color: archetype.color }} />
      <div>
        <div className="text-[10px] uppercase tracking-[0.2em] text-slate-500">
          Analysis Complete
        </div>
        <h2
          className="text-2xl font-black font-mono uppercase text-white tracking-tight"
          style={{ textShadow: `0 0 10px ${archetype.color}40` }}
        >
          {archetype.name}
        </h2>
      </div>
    </div>

    <p className="text-slate-300 text-sm mb-6 leading-relaxed border-l-2 border-slate-700 pl-4">
      {archetype.description}
    </p>
    <div className="grid grid-cols-2 gap-4">
      <div>
        <h3 className="text-xs uppercase font-bold text-green-400 mb-2 flex items-center gap-1">
          <Activity size={12} /> Strengths
        </h3>
        <ul className="text-xs space-y-1 text-slate-400">
          {archetype.skills.map((skill, i) => (
            <li key={i} className="flex items-center gap-2">
              <span className="w-1 h-1 rounded-full bg-green-500/50"></span>
              {skill}
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h3 className="text-xs uppercase font-bold text-red-400 mb-2 flex items-center gap-1">
          <Shield size={12} /> Vulnerabilities
        </h3>
        <ul className="text-xs space-y-1 text-slate-400">
          {archetype.weaknesses.map((weakness, i) => (
            <li key={i} className="flex items-center gap-2">
              <span className="w-1 h-1 rounded-full bg-red-500/50"></span>
              {weakness}
            </li>
          ))}
        </ul>
      </div>
    </div>
  </div>
);

// --- Main Application ---
export default function NeuroAvatarBuilder() {
  const [traits, setTraits] = useState<Traits>(INITIAL_TRAITS);
  const archetype = useMemo(() => calculateArchetype(traits), [traits]);

  const updateTrait = (key: keyof Traits, value: number) => {
    setTraits((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-cyan-500/30 selection:text-cyan-200 overflow-hidden flex flex-col md:flex-row">
      {/* Left: 3D Visualization Area */}
      <div className="relative w-full md:w-1/2 h-[50vh] md:h-screen bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-900 to-slate-950 border-b md:border-b-0 md:border-r border-slate-800">
        {/* HUD Elements */}
        <div className="absolute top-6 left-6 z-10">
          <h1 className="text-3xl md:text-4xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">
            NEURO-AVATAR
          </h1>
          <p className="text-xs font-mono text-cyan-600/80 mt-1">
            BUILDER V.1.0 // CYBER-PSYCHOMETRICS
          </p>
        </div>
        <div className="absolute top-6 right-6 z-10 flex flex-col items-end gap-1 font-mono text-[10px] text-slate-600">
          <span>SYS.STATUS: ONLINE</span>
          <span>RENDER.ENG: WEBGL</span>
          <span>FPS: 60</span>
        </div>

        {/* 3D Scene */}
        <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
          <color attach="background" args={['#020617']} />
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1} color="#4f46e5" />
          <pointLight
            position={[-10, -10, -10]}
            intensity={0.5}
            color="#ec4899"
          />

          <NeuroAvatar traits={traits} archetypeColor={archetype.color} />

          <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.5} />
          <Sparkles
            count={50}
            scale={10}
            size={2}
            speed={0.2}
            opacity={0.1}
            color="#ffffff"
          />
        </Canvas>

        {/* Mobile/Bottom Overlay for archetype name on small screens */}
        <div className="absolute bottom-4 left-0 w-full text-center md:hidden pointer-events-none">
          <span className="bg-slate-950/80 px-4 py-2 rounded-full border border-slate-800 text-xs font-mono text-cyan-400">
            {archetype.name}
          </span>
        </div>
      </div>

      {/* Right: Control Panel */}
      <div className="w-full md:w-1/2 h-auto md:h-screen overflow-y-auto bg-slate-950 p-6 md:p-8 flex flex-col">
        <div className="mb-8 border-b border-slate-800 pb-4">
          <h2 className="text-sm font-mono text-slate-400 uppercase tracking-widest mb-2">
            Configuration Console
          </h2>
          <p className="text-slate-500 text-xs leading-relaxed">
            Adjust the sliders below to match your psychometric assessment
            results. The Neuro-Avatar will update in real-time to reflect your
            hardware.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-2">
          {/* Column 1: Big 5 */}
          <div className="space-y-1">
            <h3 className="text-xs font-bold text-slate-600 uppercase mb-4 pl-1 border-l-2 border-slate-800">
              Core Personality (Big 5)
            </h3>

            <TraitSlider
              label="Openness"
              value={traits.openness}
              onChange={(v) => updateTrait('openness', v)}
              icon={Search}
              description="Curiosity, imagination, complexity handling."
              colorClass="text-purple-400"
            />

            <TraitSlider
              label="Conscientiousness"
              value={traits.conscientiousness}
              onChange={(v) => updateTrait('conscientiousness', v)}
              icon={Target}
              description="Discipline, organization, reliability."
              colorClass="text-green-400"
            />
            <TraitSlider
              label="Extraversion"
              value={traits.extraversion}
              onChange={(v) => updateTrait('extraversion', v)}
              icon={Zap}
              description="Stimulation seeking, energy, social engagement."
              colorClass="text-yellow-400"
            />
            <TraitSlider
              label="Agreeableness"
              value={traits.agreeableness}
              onChange={(v) => updateTrait('agreeableness', v)}
              icon={MousePointer2}
              description="Cooperation vs. Competition."
              colorClass="text-teal-400"
            />
            <TraitSlider
              label="Neuroticism"
              value={traits.neuroticism}
              onChange={(v) => updateTrait('neuroticism', v)}
              icon={Activity}
              description="Emotional stability and stress response."
              colorClass="text-red-400"
            />
          </div>

          {/* Column 2: Neurochemistry */}
          <div className="space-y-1 mt-6 lg:mt-0">
            <h3 className="text-xs font-bold text-slate-600 uppercase mb-4 pl-1 border-l-2 border-slate-800">
              Neurochemistry & Risk
            </h3>
            <TraitSlider
              label="Baseline Dopamine"
              value={traits.dopamine}
              onChange={(v) => updateTrait('dopamine', v)}
              icon={Brain}
              description="Low = Needs stimulation. High = Patient."
              colorClass="text-pink-400"
            />
            <TraitSlider
              label="Risk Tolerance"
              value={traits.riskTolerance}
              onChange={(v) => updateTrait('riskTolerance', v)}
              icon={Shield}
              description="Amygdala sensitivity and biological risk appetite."
              colorClass="text-orange-400"
            />

            {/* Info Box */}
            <div className="bg-slate-900/50 border border-slate-800 p-4 rounded mt-8">
              <p className="text-[10px] text-slate-400 font-mono leading-relaxed">
                <strong className="text-cyan-400">VISUAL FEEDBACK:</strong>
                <br />• <span className="text-yellow-400">Glow Size</span> =
                Extraversion
                <br />• <span className="text-red-400">Core Jitter/Red</span> =
                High Neuroticism
                <br />• <span className="text-green-400">Stability</span> =
                Conscientiousness
                <br />• <span className="text-purple-400">
                  Core Complexity
                </span>{' '}
                = Openness
              </p>
            </div>
          </div>
        </div>

        {/* Results Panel */}
        <div className="mt-auto pt-6">
          <ArchetypePanel archetype={archetype} />
        </div>
      </div>
    </div>
  );
}
