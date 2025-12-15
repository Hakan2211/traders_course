import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { Mesh } from 'three';
import { useControls, LevaPanel, useCreateStore } from 'leva';

// Market data based on 2023 numbers
interface MarketData {
  name: string;
  totalSize: number; // in trillions
  dailyVolume: number; // in trillions
  annualVolume: number; // in trillions
  color: string;
  description: string;
}

const MAX_BOX_HEIGHT = 4;
const MIN_BOX_HEIGHT_LOG = 0.2;
const MIN_BOX_HEIGHT_LINEAR = 0.02;

const marketData: MarketData[] = [
  {
    name: 'Equities',
    totalSize: 117,
    dailyVolume: 0.5,
    annualVolume: 125,
    color: '#4287f5',
    description:
      'Public stocks = 36% of global investable assets. Grew by $12T in 2023 alone',
  },
  {
    name: 'Bonds',
    totalSize: 125, // Average of $116-133T
    dailyVolume: 1,
    annualVolume: 250,
    color: '#42f5a7',
    description: 'The biggest asset class. 54% of the global portfolio',
  },
  {
    name: 'Forex',
    totalSize: 118, // Notional value
    dailyVolume: 7.5,
    annualVolume: 1900,
    color: '#f542b3',
    description: 'Daily volume jumped 9.7% from 2022. Insane liquidity',
  },
  {
    name: 'Derivatives',
    totalSize: 600, // Notional value, minimum
    dailyVolume: 0, // varies significantly
    annualVolume: 0,
    color: '#f5d242',
    description:
      'The monster. Mostly interest-rate and equity derivatives. 137B contracts',
  },
  {
    name: 'Commodities',
    totalSize: 3.5, // Average of $3-4T
    dailyVolume: 0.1,
    annualVolume: 25,
    color: '#8142f5',
    description: 'Surged 27% in one year. Energy and metals lead the way',
  },
  {
    name: 'Crypto',
    totalSize: 2, // Average of $1.6-2.4T
    dailyVolume: 0.1,
    annualVolume: 36,
    color: '#f54242',
    description: 'Doubled year-over-year to $2T+ market cap',
  },
];

interface MarketBoxProps {
  position: [number, number, number];
  market: MarketData;
  height: number;
  useLogScale: boolean;
  showLabels: boolean;
  scaleType: 'totalSize' | 'dailyVolume' | 'annualVolume';
}

const MarketBox: React.FC<MarketBoxProps> = ({
  position,
  market,
  height,
  useLogScale,
  showLabels,
  scaleType,
}) => {
  const boxRef = useRef<Mesh>(null);
  const boxWidth = 0.6;
  const boxDepth = 0.6;

  // Subtle animation
  useFrame((state) => {
    if (boxRef.current) {
      const t = state.clock.getElapsedTime() * 0.3;
      boxRef.current.rotation.y = Math.sin(t * 0.5) * 0.05;
    }
  });

  const formatTrillions = (value: number): string => {
    if (value >= 100) return `$${value.toFixed(0)}T`;
    if (value >= 10) return `$${value.toFixed(1)}T`;
    return `$${value.toFixed(2)}T`;
  };

  return (
    <group position={position}>
      {/* Box */}
      <mesh ref={boxRef} position={[0, height / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[boxWidth, height, boxDepth]} />
        <meshStandardMaterial
          color={market.color}
          roughness={0.3}
          metalness={0.4}
          transparent
          opacity={0.9}
        />
      </mesh>

      {/* Label above box */}
      {showLabels && (
        <>
          <Html position={[0, height + 0.5, 0]} center>
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
                border: `2px solid ${market.color}`,
              }}
            >
              {market.name}
              <br />
              <span
                style={{ fontSize: '12px', fontWeight: 'normal', opacity: 0.9 }}
              >
                {formatTrillions(
                  market[scaleType as keyof MarketData] as number
                )}
              </span>
            </div>
          </Html>
        </>
      )}
    </group>
  );
};

interface MarketSizesProps {
  useLogScale?: boolean;
  showLabels?: boolean;
  scaleType?: 'totalSize' | 'dailyVolume' | 'annualVolume';
}

const MarketSizes: React.FC<MarketSizesProps> = ({
  useLogScale: initialUseLogScale = true,
  showLabels: initialShowLabels = true,
  scaleType: initialScaleType = 'totalSize',
}) => {
  // Create a scoped Leva store so the panel renders inside this component
  const levaStore = useCreateStore();

  // Leva controls bound to the local store
  const {
    useLogScale,
    showLabels,
    scaleType: scaleTypeRaw,
  } = useControls(
    'Market Visualization',
    {
      scaleType: {
        value: initialScaleType,
        options: ['totalSize', 'dailyVolume', 'annualVolume'] as const,
        label: 'Scale Type',
      },
      useLogScale: {
        value: initialUseLogScale,
        label: 'Logarithmic Scale',
      },
      showLabels: {
        value: initialShowLabels,
        label: 'Show Labels',
      },
    },
    { store: levaStore }
  );

  const scaleType = scaleTypeRaw as
    | 'totalSize'
    | 'dailyVolume'
    | 'annualVolume';

  // Filter markets with valid data for the selected scale type
  const validMarkets = marketData.filter((market) => {
    const value = market[scaleType as keyof MarketData] as number;
    return value > 0;
  });

  // Calculate max value for scaling
  const maxValue = Math.max(
    ...validMarkets.map((m) => m[scaleType as keyof MarketData] as number)
  );

  // Scale function
  const scaleValue = (value: number): number => {
    if (useLogScale) {
      // Logarithmic scaling: log10(value) / log10(maxValue) * max height
      const safeValue = Math.max(value, 0.1); // Prevent log(0)
      const safeMax = Math.max(maxValue, 0.1);
      const logValue = Math.log10(safeValue);
      const logMax = Math.log10(safeMax);
      const normalized = logMax === 0 ? 1 : logValue / logMax;
      return Math.max(normalized * MAX_BOX_HEIGHT, MIN_BOX_HEIGHT_LOG);
    }

    // Linear scaling: direct proportion to the largest market
    const normalized = maxValue > 0 ? Math.max(value, 0) / maxValue : 0;
    return Math.max(normalized * MAX_BOX_HEIGHT, MIN_BOX_HEIGHT_LINEAR);
  };

  // Calculate heights for each market
  const marketsWithHeights = validMarkets.map((market) => ({
    ...market,
    height: scaleValue(market[scaleType as keyof MarketData] as number),
  }));

  // Sort by height for better visual arrangement
  marketsWithHeights.sort((a, b) => b.height - a.height);

  // Position markets in a row
  const spacing = 1.5;
  const startX = -(marketsWithHeights.length - 1) * spacing * 0.5;

  return (
    <>
      {/* Scoped Leva Panel inside the canvas container */}
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
            /* Try to catch the Leva root regardless of generated class names */
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
            titleBar={{ title: 'Market Visualization' }}
          />
        </div>
      </Html>

      {/* Markets */}
      {marketsWithHeights.map((market, index) => (
        <MarketBox
          key={market.name}
          position={[startX + index * spacing, 0, 0]}
          market={market}
          height={market.height}
          useLogScale={useLogScale}
          showLabels={showLabels}
          scaleType={scaleType}
        />
      ))}

      {/* Scale indicator */}
      {showLabels && (
        <group position={[0, -2, 0]}>
          <Html center>
            <div
              style={{
                color: '#aaa',
                fontSize: '12px',
                textAlign: 'center',
                background: 'rgba(0, 0, 0, 0.6)',
                padding: '6px 12px',
                borderRadius: '4px',
                whiteSpace: 'nowrap',
              }}
            >
              Scale: {useLogScale ? 'Logarithmic' : 'Linear'} ({scaleType})
            </div>
          </Html>
        </group>
      )}

      {/* Ground plane for reference */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[-1.5, 0, 0]}
        scale={[-1.5, 1, 1]}
        receiveShadow
      >
        <planeGeometry args={[15, 5]} />
        <meshStandardMaterial color="#e7e5e4" roughness={0.8} metalness={0.1} />
      </mesh>
    </>
  );
};

export default MarketSizes;
