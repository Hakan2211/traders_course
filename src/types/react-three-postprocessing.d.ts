declare module '@react-three/postprocessing' {
  import { ReactElement, ComponentType } from 'react';

  export interface EffectComposerProps {
    children?: React.ReactNode;
    disableNormalPass?: boolean;
    [key: string]: any;
  }

  export interface VignetteProps {
    eskil?: boolean;
    offset?: number;
    darkness?: number;
    [key: string]: any;
  }

  export interface ChromaticAberrationProps {
    offset?: any;
    radialModulation?: boolean;
    modulationOffset?: number;
    [key: string]: any;
  }

  export interface NoiseProps {
    opacity?: number;
    blendFunction?: any;
    [key: string]: any;
  }

  export interface BloomProps {
    luminanceThreshold?: number;
    intensity?: number;
    [key: string]: any;
  }

  export const EffectComposer: ComponentType<EffectComposerProps>;
  export const Vignette: ComponentType<VignetteProps>;
  export const ChromaticAberration: ComponentType<ChromaticAberrationProps>;
  export const Noise: ComponentType<NoiseProps>;
  export const Bloom: ComponentType<BloomProps>;
}
