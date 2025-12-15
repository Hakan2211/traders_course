
import React, { useState, useEffect, useRef } from 'react';
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
} from 'framer-motion';
import {
  Play,
  Pause,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Sector {
  name: string;
  etfs: string[];
  volumeChange: string;
  icon: string;
}

interface Phase {
  id: number;
  name: string;
  shortName: string;
  color: string;
  sectors: Sector[];
  volumeCharacteristics: string;
  position: number; // 0-3 for quadrant position
}

const PHASES: Phase[] = [
  {
    id: 0,
    name: 'Early Recovery',
    shortName: 'Early Recovery',
    color: '#f97316', // Orange
    sectors: [
      {
        name: 'Financials',
        etfs: ['XLF', 'KBE', 'KRE'],
        volumeChange: '+150%',
        icon: '🏦',
      },
      {
        name: 'Industrials',
        etfs: ['XLI', 'IYT', 'CAT'],
        volumeChange: '+140%',
        icon: '🏭',
      },
      {
        name: 'Consumer Discretionary',
        etfs: ['XLY', 'AMZN', 'TSLA'],
        volumeChange: '+130%',
        icon: '🛒',
      },
    ],
    volumeCharacteristics: 'Volume surges in cyclicals as optimism returns',
    position: 0, // Top-left
  },
  {
    id: 1,
    name: 'Mid Expansion',
    shortName: 'Mid Expansion',
    color: '#22c55e', // Light green
    sectors: [
      {
        name: 'Technology',
        etfs: ['XLK', 'QQQ', 'SMH'],
        volumeChange: '+180%',
        icon: '💻',
      },
      {
        name: 'Growth Stocks',
        etfs: ['IWF', 'ARKK', 'TQQQ'],
        volumeChange: '+170%',
        icon: '📈',
      },
      {
        name: 'Consumer Discretionary',
        etfs: ['XLY', 'AMZN', 'NFLX'],
        volumeChange: '+160%',
        icon: '🛍️',
      },
    ],
    volumeCharacteristics: 'Momentum dominates, high volume in market leaders',
    position: 1, // Top-right
  },
  {
    id: 2,
    name: 'Late Cycle',
    shortName: 'Late Cycle',
    color: '#eab308', // Yellow
    sectors: [
      {
        name: 'Energy',
        etfs: ['XLE', 'USO', 'XOM'],
        volumeChange: '+200%',
        icon: '⚡',
      },
      {
        name: 'Materials',
        etfs: ['XLB', 'FCG', 'GLD'],
        volumeChange: '+190%',
        icon: '⛏️',
      },
      {
        name: 'Commodities',
        etfs: ['DBC', 'GSG', 'PDBC'],
        volumeChange: '+180%',
        icon: '🛢️',
      },
    ],
    volumeCharacteristics: 'Rotation into inflation hedges and real assets',
    position: 2, // Bottom-right
  },
  {
    id: 3,
    name: 'Recession',
    shortName: 'Recession',
    color: '#3b82f6', // Light blue
    sectors: [
      {
        name: 'Utilities',
        etfs: ['XLU', 'VPU', 'NEE'],
        volumeChange: '+160%',
        icon: '⚡',
      },
      {
        name: 'Consumer Staples',
        etfs: ['XLP', 'PG', 'KO'],
        volumeChange: '+150%',
        icon: '🛒',
      },
      {
        name: 'Healthcare',
        etfs: ['XLV', 'IBB', 'JNJ'],
        volumeChange: '+140%',
        icon: '🏥',
      },
    ],
    volumeCharacteristics: 'Defensive volume spikes, risk-off flows accelerate',
    position: 3, // Bottom-left
  },
];

const TOTAL_PHASES = PHASES.length;
const AUTO_PLAY_INTERVAL = 3000; // 3 seconds per phase

interface HoverInfo {
  sector: Sector | null;
  x: number;
  y: number;
}

const EconomicCycleRotation: React.FC = () => {
  const [currentPhase, setCurrentPhase] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hoverInfo, setHoverInfo] = useState<HoverInfo>({
    sector: null,
    x: 0,
    y: 0,
  });
  const [hoveredSectorIndex, setHoveredSectorIndex] = useState<number | null>(
    null
  );
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const containerRef = useRef<HTMLDivElement>(null);
  const playRef = useRef(isPlaying);

  // Calculate rotation angle to move active phase to top (north)
  const rotationAngle = -(currentPhase * 90); // -90 degrees per phase

  const rotationMotion = useSpring(rotationAngle, {
    stiffness: 100,
    damping: 20,
  });

  useEffect(() => {
    playRef.current = isPlaying;
  }, [isPlaying]);

  // Update motion value when rotation angle changes
  useEffect(() => {
    rotationMotion.set(rotationAngle);
  }, [rotationAngle, rotationMotion]);

  // Track container dimensions
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDimensions({
          width: rect.width || 800,
          height: rect.height || 600,
        });
      }
    };

    // Use ResizeObserver for better dimension tracking
    if (containerRef.current) {
      const resizeObserver = new ResizeObserver(updateDimensions);
      resizeObserver.observe(containerRef.current);

      // Initial update
      updateDimensions();

      return () => {
        resizeObserver.disconnect();
      };
    }
  }, []);

  // Auto-play loop
  useEffect(() => {
    const interval = setInterval(() => {
      if (!playRef.current) return;
      setCurrentPhase((prev) => {
        const next = prev + 1;
        if (next >= TOTAL_PHASES) {
          return 0; // Loop back to start
        }
        return next;
      });
    }, AUTO_PLAY_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  const currentPhaseData = PHASES[currentPhase];

  const resetToStart = () => {
    setCurrentPhase(0);
    setIsPlaying(false);
  };

  const handlePhaseSelect = (value: string) => {
    setCurrentPhase(parseInt(value));
    setIsPlaying(false);
  };

  const handleStepBack = () => {
    setCurrentPhase((prev) => Math.max(0, prev - 1));
    setIsPlaying(false);
  };

  const handleStepForward = () => {
    setCurrentPhase((prev) => {
      const next = prev + 1;
      if (next >= TOTAL_PHASES) {
        return 0; // Loop back to start
      }
      return next;
    });
    setIsPlaying(false);
  };

  // Handle mouse move for hover detection
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!containerRef.current) return;

    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const viewBoxWidth = 1000;
    const viewBoxHeight = 1000;

    // Convert mouse coordinates to viewBox coordinates
    const scaleX = viewBoxWidth / rect.width;
    const scaleY = viewBoxHeight / rect.height;
    const mx = (e.clientX - rect.left) * scaleX;
    const my = (e.clientY - rect.top) * scaleY;

    const centerX = viewBoxWidth / 2;
    const centerY = viewBoxHeight / 2;

    const dx = mx - centerX;
    const dy = my - centerY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    const radius = Math.min(viewBoxWidth, viewBoxHeight) * 0.35;
    const sectorRadius = radius * 0.75;
    const sectorCenterRadius = radius * 0.3;

    // Check if mouse is over a sector
    if (
      dist > sectorCenterRadius - sectorRadius &&
      dist < sectorCenterRadius + sectorRadius
    ) {
      // Calculate angle relative to center
      let angle = Math.atan2(dy, dx);
      // Normalize to 0-2PI
      if (angle < 0) angle += Math.PI * 2;

      // Adjust for rotation (convert degrees to radians)
      const rotationRad = (rotationAngle * Math.PI) / 180;
      const adjustedAngle = (angle - rotationRad + Math.PI * 2) % (Math.PI * 2);

      // Define sector geometry
      const quarter = (Math.PI * 2) / 4;
      const gap = 0.02;
      const span = quarter - gap;
      const baseStart = -Math.PI / 2 - span / 2; // Start at north for index 0

      // Find which sector
      let normalizedAngle =
        (adjustedAngle - baseStart + Math.PI * 2) % (Math.PI * 2);
      const sectorIndex = Math.floor(normalizedAngle / quarter) % 4;

      if (sectorIndex >= 0 && sectorIndex < 4) {
        setHoveredSectorIndex(sectorIndex);
        const phase = PHASES[sectorIndex];
        if (phase && phase.sectors.length > 0) {
          // Use screen coordinates for tooltip positioning
          setHoverInfo({
            sector: phase.sectors[0], // Show first sector on hover
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
          });
        }
      } else {
        setHoveredSectorIndex(null);
        setHoverInfo({ sector: null, x: 0, y: 0 });
      }
    } else {
      setHoveredSectorIndex(null);
      setHoverInfo({ sector: null, x: 0, y: 0 });
    }
  };

  const handleMouseLeave = () => {
    setHoveredSectorIndex(null);
    setHoverInfo({ sector: null, x: 0, y: 0 });
  };

  // Helper function to create SVG arc path for pie slice
  // The arc is positioned at centerRadius from origin, with radius as the arc radius
  const createArcPath = (
    startAngle: number,
    endAngle: number,
    radius: number,
    centerRadius: number
  ): string => {
    // Inner radius (closer to center)
    const innerRadius = Math.max(0, centerRadius - radius);
    // Outer radius (further from center)
    const outerRadius = centerRadius + radius;

    // Calculate points on inner and outer arcs
    const innerStartX = Math.cos(startAngle) * innerRadius;
    const innerStartY = Math.sin(startAngle) * innerRadius;
    const innerEndX = Math.cos(endAngle) * innerRadius;
    const innerEndY = Math.sin(endAngle) * innerRadius;

    const outerStartX = Math.cos(startAngle) * outerRadius;
    const outerStartY = Math.sin(startAngle) * outerRadius;
    const outerEndX = Math.cos(endAngle) * outerRadius;
    const outerEndY = Math.sin(endAngle) * outerRadius;

    const largeArcFlag = endAngle - startAngle > Math.PI ? 1 : 0;

    return [
      `M ${innerStartX} ${innerStartY}`, // Move to inner start
      `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 1 ${innerEndX} ${innerEndY}`, // Arc along inner edge
      `L ${outerEndX} ${outerEndY}`, // Line to outer end
      `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 0 ${outerStartX} ${outerStartY}`, // Arc along outer edge
      'Z', // Close path
    ].join(' ');
  };

  return (
    <div className="w-full h-full flex flex-col p-6 gap-4">
      {/* Header */}
      <div className="text-center mb-2">
        <h3 className="text-xl font-semibold text-white mb-1">
          The Economic Cycle & Volume Rotation
        </h3>
        <p className="text-sm text-muted-foreground">
          Watch how capital rotates through sectors across the business cycle
        </p>
      </div>

      {/* Main Visualization Area */}
      <div
        ref={containerRef}
        className="flex-1 relative bg-gradient-to-b from-[#0f0f14] to-[#0a0a0f] rounded-lg overflow-hidden min-h-0 flex items-center justify-center"
      >
        {(() => {
          // Use a fixed coordinate system for consistent positioning
          const viewBoxWidth = 1000;
          const viewBoxHeight = 1000;
          const centerX = viewBoxWidth / 2;
          const centerY = viewBoxHeight / 2;
          const radius = Math.min(viewBoxWidth, viewBoxHeight) * 0.35;
          const sectorRadius = radius * 0.75;
          const sectorCenterRadius = radius * 0.3;

          return (
            <svg
              viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
              preserveAspectRatio="xMidYMid meet"
              className="w-full h-full"
              style={{ maxWidth: '100%', maxHeight: '100%' }}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            >
              <defs>
                <linearGradient
                  id="bgGradient"
                  x1="0%"
                  y1="0%"
                  x2="0%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor="rgb(15, 15, 20)" />
                  <stop offset="100%" stopColor="rgb(10, 10, 15)" />
                </linearGradient>
              </defs>

              {/* Background gradient */}
              <rect
                width={viewBoxWidth}
                height={viewBoxHeight}
                fill="url(#bgGradient)"
                className="pointer-events-none"
              />

              {/* Particles/flow indicators when playing - separate rotating group */}
              {isPlaying && (
                <g transform={`translate(${centerX}, ${centerY})`}>
                  <motion.g
                    animate={{
                      rotate: [0, 360],
                    }}
                    transition={{
                      duration: 10,
                      repeat: Infinity,
                      ease: 'linear',
                    }}
                  >
                    {Array.from({ length: 12 }).map((_, i) => {
                      const particleRadius = radius * 0.4;
                      const baseAngle = (i * Math.PI * 2) / 12;

                      return (
                        <circle
                          key={i}
                          cx={Math.cos(baseAngle) * particleRadius}
                          cy={Math.sin(baseAngle) * particleRadius}
                          r="3"
                          fill="rgb(255, 200, 100)"
                          opacity={0.59}
                        />
                      );
                    })}
                  </motion.g>
                </g>
              )}

              {/* Rotating group for sectors */}
              <g transform={`translate(${centerX}, ${centerY})`}>
                <motion.g
                  style={{
                    rotate: rotationMotion,
                  }}
                >
                  {PHASES.map((phase, index) => {
                    const quarter = (Math.PI * 2) / 4;
                    const gap = 0.02;
                    const span = quarter - gap;
                    const baseStart = -Math.PI / 2 - span / 2;
                    const startAngle = baseStart + index * quarter;
                    const endAngle = startAngle + span;
                    const isActive = currentPhase === index;
                    const isHovered = hoveredSectorIndex === index;

                    // Calculate label position
                    const labelAngle = (startAngle + endAngle) / 2;
                    const labelRadius = sectorRadius * 0.6;
                    const labelX = Math.cos(labelAngle) * labelRadius;
                    const labelY = Math.sin(labelAngle) * labelRadius;

                    return (
                      <g key={phase.id}>
                        {/* Sector arc */}
                        <motion.path
                          d={createArcPath(
                            startAngle,
                            endAngle,
                            sectorRadius,
                            sectorCenterRadius
                          )}
                          fill={phase.color}
                          opacity={isHovered ? 0.78 : 0.7}
                          stroke="white"
                          strokeWidth={isActive ? 2 : 1.5}
                          strokeOpacity={isActive ? 0.86 : 0.47}
                          initial={false}
                          animate={{
                            opacity: isHovered ? 0.78 : 0.7,
                          }}
                          transition={{ duration: 0.2 }}
                        />

                        {/* Sector label */}
                        <g
                          transform={`translate(${labelX}, ${labelY}) rotate(${
                            (labelAngle * 180) / Math.PI + 90
                          })`}
                        >
                          <text
                            x="0"
                            y="-30"
                            textAnchor="middle"
                            dominantBaseline="middle"
                            fill="white"
                            fontSize="20"
                            fontWeight="normal"
                            className="font-sans"
                          >
                            {phase.shortName}
                          </text>

                          {/* Phase number badge */}
                          <circle cx="0" cy="10" r="22.5" fill={phase.color} />
                          <text
                            x="0"
                            y="10"
                            textAnchor="middle"
                            dominantBaseline="middle"
                            fill="white"
                            fontSize="20"
                            fontWeight="bold"
                            className="font-sans"
                          >
                            {index + 1}
                          </text>
                        </g>
                      </g>
                    );
                  })}
                </motion.g>
              </g>
            </svg>
          );
        })()}

        {/* Current phase indicator */}
        <motion.div
          className="absolute top-5 left-5 bg-white/12 border border-white/31 rounded-lg p-3 flex items-center gap-3 min-w-[250px]"
          initial={false}
          key={currentPhase}
        >
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: currentPhaseData.color }}
          />
          <div className="flex-1">
            <div className="text-xs text-white/80 mb-0.5">Current Phase:</div>
            <div
              className="text-sm font-normal"
              style={{ color: currentPhaseData.color }}
            >
              {currentPhaseData.name}
            </div>
          </div>
          <div className="text-xs text-gray-400 tabular-nums">
            {currentPhase + 1}/{TOTAL_PHASES}
          </div>
        </motion.div>

        {/* Hover tooltip */}
        <AnimatePresence>
          {hoverInfo.sector && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute pointer-events-none z-10 bg-gray-900/95 border border-gray-700 rounded-lg p-3 shadow-xl max-w-[250px]"
              style={{
                left: `${hoverInfo.x + 20}px`,
                top: `${hoverInfo.y - 20}px`,
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">{hoverInfo.sector.icon}</span>
                <h4 className="text-sm font-semibold text-white">
                  {hoverInfo.sector.name}
                </h4>
              </div>
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground">ETFs:</div>
                <div className="flex flex-wrap gap-1">
                  {hoverInfo.sector.etfs.map((etf, idx) => (
                    <span
                      key={idx}
                      className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded"
                    >
                      {etf}
                    </span>
                  ))}
                </div>
                <div className="text-xs text-green-400 mt-2">
                  Volume: {hoverInfo.sector.volumeChange}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Phase Info */}
      <motion.div
        key={currentPhase}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="bg-gray-800/30 rounded-lg p-4 border border-gray-700/50"
      >
        <div className="mb-3">
          <h4 className="text-base font-normal text-white mb-2">
            Leading Sectors in {currentPhaseData.name}
          </h4>
        </div>
        <div className="flex flex-wrap">
          {currentPhaseData.sectors.map((sector, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
              className={`flex items-center gap-2 bg-gray-700/30 px-4 py-3 ${
                idx === 0
                  ? 'rounded-l-lg'
                  : idx === currentPhaseData.sectors.length - 1
                  ? 'rounded-r-lg'
                  : ''
              } ${idx > 0 ? 'border-l border-gray-600/50 -ml-[1px]' : ''}`}
            >
              <span className="text-2xl">{sector.icon}</span>
              <div>
                <div className="text-sm font-normal text-white">
                  {sector.name}
                </div>
                <div className="text-xs text-muted-foreground">
                  {sector.etfs.join(', ')}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Controls */}
      <div className="space-y-4">
        {/* Playback Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            size="sm"
            onClick={() => setIsPlaying(!isPlaying)}
            variant={isPlaying ? 'default' : 'secondary'}
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4 mr-2" />
                Pause
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Play
              </>
            )}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleStepBack}
            disabled={currentPhase === 0}
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Step Back
          </Button>
          <Button size="sm" variant="outline" onClick={handleStepForward}>
            Step Forward
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
          <Button size="sm" variant="outline" onClick={resetToStart}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Phase:</span>
            <select
              value={currentPhase.toString()}
              onChange={(e) => handlePhaseSelect(e.target.value)}
              className="w-[200px] h-9 text-sm bg-gray-800 border border-gray-700 rounded-md px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {PHASES.map((phase) => (
                <option key={phase.id} value={phase.id.toString()}>
                  {phase.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EconomicCycleRotation;
