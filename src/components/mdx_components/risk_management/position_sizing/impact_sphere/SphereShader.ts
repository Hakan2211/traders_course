import { shaderMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { extend, Object3DNode } from '@react-three/fiber';

// A custom shader material that handles:
// 1. Color mixing based on Health (Green -> Red -> Grey)
// 2. "Stress" visualization via vertex displacement (pulsing)
// 3. "Cracks" visualization via noise function in fragment shader
export const ImpactMaterial = shaderMaterial(
  {
    uTime: 0,
    uColorHealth: new THREE.Color('#10b981'), // Green-500
    uColorStress: new THREE.Color('#f59e0b'), // Amber-500
    uColorCritical: new THREE.Color('#ef4444'), // Red-500
    uColorDead: new THREE.Color('#334155'), // Slate-700
    uHealth: 1.0, // 1.0 = healthy, 0.0 = dead
    uStress: 0.0, // 0.0 = calm, 1.0 = panic
    uHover: 0.0,
  },
  // Vertex Shader
  `
    varying vec2 vUv;
    varying vec3 vNormal;
    varying float vDisplacement;
    uniform float uTime;
    uniform float uStress;
    uniform float uHover;

    // Simplex noise for organic displacement
    vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
    vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

    float snoise(vec3 v) {
      const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
      const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);

      vec3 i  = floor(v + dot(v, C.yyy) );
      vec3 x0 = v - i + dot(i, C.xxx) ;

      vec3 g = step(x0.yzx, x0.xyz);
      vec3 l = 1.0 - g;
      vec3 i1 = min( g.xyz, l.zxy );
      vec3 i2 = max( g.xyz, l.zxy );

      vec3 x1 = x0 - i1 + C.xxx;
      vec3 x2 = x0 - i2 + C.yyy;
      vec3 x3 = x0 - D.yyy;

      i = mod289(i);
      vec4 p = permute( permute( permute(
                i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
              + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
              + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));

      float n_ = 0.142857142857;
      vec3  ns = n_ * D.wyz - D.xzx;

      vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

      vec4 x_ = floor(j * ns.z);
      vec4 y_ = floor(j - 7.0 * x_ );

      vec4 x = x_ *ns.x + ns.yyyy;
      vec4 y = y_ *ns.x + ns.yyyy;
      vec4 h = 1.0 - abs(x) - abs(y);

      vec4 b0 = vec4( x.xy, y.xy );
      vec4 b1 = vec4( x.zw, y.zw );

      vec4 s0 = floor(b0)*2.0 + 1.0;
      vec4 s1 = floor(b1)*2.0 + 1.0;
      vec4 sh = -step(h, vec4(0.0));

      vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
      vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;

      vec3 p0 = vec3(a0.xy,h.x);
      vec3 p1 = vec3(a0.zw,h.y);
      vec3 p2 = vec3(a1.xy,h.z);
      vec3 p3 = vec3(a1.zw,h.w);

      vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
      p0 *= norm.x;
      p1 *= norm.y;
      p2 *= norm.z;
      p3 *= norm.w;

      vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
      m = m * m;
      return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1),
                                    dot(p2,x2), dot(p3,x3) ) );
    }

    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      
      // Displacement Logic:
      // High stress = fast, sharp pulsing
      // Low stress = slow, gentle breathing
      float pulseSpeed = 1.0 + (uStress * 5.0);
      float pulseIntensity = 0.02 + (uStress * 0.15);
      
      // Add hover effect
      pulseIntensity += uHover * 0.05;

      float noise = snoise(position + (uTime * pulseSpeed * 0.2));
      vDisplacement = noise;

      vec3 newPosition = position + normal * (noise * pulseIntensity);
      
      gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
    }
  `,
  // Fragment Shader
  `
    varying vec2 vUv;
    varying vec3 vNormal;
    varying float vDisplacement;
    
    uniform vec3 uColorHealth;
    uniform vec3 uColorStress;
    uniform vec3 uColorCritical;
    uniform vec3 uColorDead;
    
    uniform float uHealth;
    uniform float uStress;
    uniform float uHover;
    uniform float uTime;

    void main() {
      // 1. Base Color Interpolation
      // Map uHealth (0.0 - 1.0) to gradient
      // 0.0 = Dead, 0.3 = Critical, 0.6 = Stressed, 1.0 = Healthy
      
      vec3 baseColor = uColorHealth;
      
      if (uHealth <= 0.0) {
        baseColor = uColorDead;
      } else if (uHealth < 0.4) {
        baseColor = mix(uColorCritical, uColorStress, (uHealth) / 0.4);
      } else if (uHealth < 0.8) {
        baseColor = mix(uColorStress, uColorHealth, (uHealth - 0.4) / 0.4);
      } else {
         baseColor = uColorHealth;
      }

      // 2. Add "Cracks" based on displacement valleys and Stress
      // If stress is high, darken the lows of the noise displacement
      float crackThreshold = 0.0; // Show cracks more as stress increases
      float isCrack = smoothstep(0.0, -0.2, vDisplacement) * uStress;
      
      vec3 finalColor = mix(baseColor, vec3(0.1, 0.05, 0.0), isCrack * 0.8);

      // 3. Fresnel Glow (Rim Light)
      // Stronger when hovering or high energy
      vec3 viewDir = vec3(0.0, 0.0, 1.0); // Simplified view direction
      float fresnel = pow(1.0 - dot(vNormal, viewDir), 3.0);
      vec3 glowColor = mix(uColorHealth, uColorCritical, uStress);
      
      // If dead, no glow
      if (uHealth <= 0.0) {
        fresnel = 0.0;
      }

      finalColor += glowColor * fresnel * (0.5 + uHover);

      gl_FragColor = vec4(finalColor, 1.0);
    }
  `
);

extend({ ImpactMaterial });

// Define the type for the material instance
type ImpactMaterialImpl = {
  uTime: number;
  uColorHealth: THREE.Color;
  uColorStress: THREE.Color;
  uColorCritical: THREE.Color;
  uColorDead: THREE.Color;
  uHealth: number;
  uStress: number;
  uHover: number;
} & THREE.ShaderMaterial;

declare module '@react-three/fiber' {
  interface ThreeElements {
    impactMaterial: Object3DNode<ImpactMaterialImpl, typeof ImpactMaterial>;
  }
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      impactMaterial: Object3DNode<ImpactMaterialImpl, typeof ImpactMaterial>;
    }
  }
}

