
import React, { useEffect, useMemo, useState } from 'react';
import EnvironmentWrapper from '@/components/mdx_components/2d_environment/environmentWrapper';
import VWAPLaboratory2D from '@/components/mdx_components/2d_environment/p5Sketch/VWAPLaboratory2D';
import {
  AnchorPreset,
  VWAPTrade,
  anchorSummariesFromSeries,
  computeAnchorSeries,
  computeSessionStats,
  mergeTrades,
} from '@/components/mdx_components/2d_environment/p5Sketch/vwapLabMath';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip';

type ScenarioKey = 'balanced' | 'trend';

interface ScenarioDefinition {
  key: ScenarioKey;
  label: string;
  description: string;
  generateTrades: () => VWAPTrade[];
  anchorBlueprints: Omit<AnchorPreset, 'startTime'>[];
  volumeRange: [number, number];
}

const createBalancedTrades = (length = 160): VWAPTrade[] => {
  const trades: VWAPTrade[] = [];
  for (let i = 0; i < length; i++) {
    const time = i * 0.5;
    const base =
      100 +
      Math.sin(i / 6) * 1.25 +
      Math.sin(i / 17) * 0.75 +
      Math.sin(i / 3) * 0.35;
    const price = parseFloat(base.toFixed(2));
    const pulse = i % 16 === 0 ? 420 : 0;
    const volume = Math.max(
      140,
      Math.round(520 + Math.sin(i / 4) * 150 + pulse + (i % 9 === 0 ? 110 : 0))
    );
    trades.push({
      id: `balanced-${i}`,
      time,
      price,
      volume,
      source: 'scenario',
    });
  }
  return trades;
};

const createTrendTrades = (length = 170): VWAPTrade[] => {
  const trades: VWAPTrade[] = [];
  for (let i = 0; i < length; i++) {
    const time = i * 0.5;
    const drift = i * 0.16;
    const base =
      98 +
      drift +
      Math.sin(i / 5) * 0.65 +
      Math.cos(i / 13) * 0.35 -
      Math.sin(i / 11) * 0.4;
    const price = parseFloat(base.toFixed(2));
    const impulse = i % 13 === 0 ? 520 : 0;
    const volume = Math.max(
      220,
      Math.round(
        480 +
          i * 2.8 +
          Math.sin(i / 4) * 120 +
          impulse +
          (i % 7 === 0 ? 200 : 0)
      )
    );
    trades.push({
      id: `trend-${i}`,
      time,
      price,
      volume,
      source: 'scenario',
    });
  }
  return trades;
};

const SCENARIOS: Record<ScenarioKey, ScenarioDefinition> = {
  balanced: {
    key: 'balanced',
    label: 'Balanced Day',
    description:
      'Value rotates around VWAP (D-shape). Fade extremes, respect magnets.',
    generateTrades: () => createBalancedTrades(),
    anchorBlueprints: [
      {
        id: 'session-open',
        label: 'Session Open',
        description: 'Baseline at 9:30 AM — institutions benchmark here.',
        color: '#fbbf24',
        startIndex: 0,
      },
      {
        id: 'lvn-dip',
        label: 'Midday LVN Sweep',
        description: '11:00 probe into rejection zone. Great AVWAP anchor.',
        color: '#38bdf8',
        startIndex: 60,
      },
      {
        id: 'power-hour',
        label: 'Power Hour Balance',
        description: '14:30 rotation sets closing bias.',
        color: '#c084fc',
        startIndex: 120,
      },
    ],
    volumeRange: [120, 1800],
  },
  trend: {
    key: 'trend',
    label: 'Trend Day',
    description: 'Gap-and-go character. VWAP slopes up, pullbacks shallow.',
    generateTrades: () => createTrendTrades(),
    anchorBlueprints: [
      {
        id: 'gap-open',
        label: 'Gap Anchor',
        description: 'Opening drive after overnight imbalance.',
        color: '#fb923c',
        startIndex: 0,
      },
      {
        id: 'breakout',
        label: 'VWAP Breakout',
        description: 'First clean break from balance; buyers take control.',
        color: '#34d399',
        startIndex: 40,
      },
      {
        id: 'pullback',
        label: 'Pullback Reset',
        description: 'Higher-low retrace; new anchored VWAP for late longs.',
        color: '#a78bfa',
        startIndex: 95,
      },
    ],
    volumeRange: [200, 2200],
  },
};

const numberFormatter = new Intl.NumberFormat(undefined, {
  maximumFractionDigits: 2,
});

const compactFormatter = new Intl.NumberFormat(undefined, {
  notation: 'compact',
  maximumFractionDigits: 2,
});

const VWAPLaboratory2DContainer: React.FC = () => {
  const [scenarioKey, setScenarioKey] = useState<ScenarioKey>('balanced');
  const scenarioDefinition = SCENARIOS[scenarioKey];

  const baseTrades = useMemo(
    () => scenarioDefinition.generateTrades(),
    [scenarioDefinition]
  );

  const [playhead, setPlayhead] = useState(() =>
    Math.floor(baseTrades.length * 0.35)
  );
  const [manualTrades, setManualTrades] = useState<VWAPTrade[]>([]);
  const [showSessionVWAP, setShowSessionVWAP] = useState(true);
  const [showBands, setShowBands] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [priceDraft, setPriceDraft] = useState(
    () => baseTrades[0]?.price ?? 100
  );
  const [volumeDraft, setVolumeDraft] = useState(
    () => scenarioDefinition.volumeRange[0]
  );
  const [activeAnchorIds, setActiveAnchorIds] = useState<string[]>(() =>
    scenarioDefinition.anchorBlueprints[0]
      ? [scenarioDefinition.anchorBlueprints[0].id]
      : []
  );

  // Reset state when scenario changes
  useEffect(() => {
    setPlayhead(Math.floor(baseTrades.length * 0.3));
    setManualTrades([]);
    setActiveAnchorIds(
      scenarioDefinition.anchorBlueprints[0]
        ? [scenarioDefinition.anchorBlueprints[0].id]
        : []
    );
    setPriceDraft(
      baseTrades[Math.floor(baseTrades.length * 0.3)]?.price ?? 100
    );
    setVolumeDraft(scenarioDefinition.volumeRange[0]);
  }, [baseTrades, scenarioDefinition]);

  // Playback effect
  useEffect(() => {
    if (!isPlaying) return;
    const id = window.setInterval(() => {
      setPlayhead((prev) => {
        if (prev >= baseTrades.length) {
          window.clearInterval(id);
          setIsPlaying(false);
          return baseTrades.length;
        }
        return Math.min(prev + 2, baseTrades.length);
      });
    }, 220);
    return () => window.clearInterval(id);
  }, [isPlaying, baseTrades.length]);

  const priceDomain = useMemo<[number, number]>(() => {
    const prices = baseTrades.map((trade) => trade.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    return [Math.floor(min - 1.5), Math.ceil(max + 1.5)];
  }, [baseTrades]);

  const anchorsWithTimes = useMemo<AnchorPreset[]>(() => {
    return scenarioDefinition.anchorBlueprints.map((anchor) => {
      const index = Math.min(anchor.startIndex, baseTrades.length - 1);
      return {
        ...anchor,
        startIndex: index,
        startTime: baseTrades[index]?.time ?? 0,
      };
    });
  }, [scenarioDefinition, baseTrades]);

  const selectedAnchors = anchorsWithTimes.filter((anchor) =>
    activeAnchorIds.includes(anchor.id)
  );

  const visibleTrades = useMemo(() => {
    const scenarioSlice = baseTrades.slice(
      0,
      Math.min(playhead, baseTrades.length)
    );
    return mergeTrades(scenarioSlice, manualTrades);
  }, [baseTrades, playhead, manualTrades]);

  const sessionStats = useMemo(
    () => computeSessionStats(visibleTrades),
    [visibleTrades]
  );

  const anchorSeriesMap = useMemo(
    () => computeAnchorSeries(visibleTrades, selectedAnchors),
    [visibleTrades, selectedAnchors]
  );
  const anchorSummaries = useMemo(
    () => anchorSummariesFromSeries(anchorSeriesMap),
    [anchorSeriesMap]
  );

  const progress = useMemo(() => {
    if (!baseTrades.length) return 0;
    return Math.min(playhead, baseTrades.length) / baseTrades.length;
  }, [playhead, baseTrades.length]);

  const handleInjectTrade = () => {
    if (!visibleTrades.length) return;
    const lastTime = visibleTrades[visibleTrades.length - 1]?.time ?? 0;
    const boundedPrice = Math.min(
      Math.max(priceDraft, priceDomain[0]),
      priceDomain[1]
    );
    const boundedVolume = Math.min(
      Math.max(volumeDraft, scenarioDefinition.volumeRange[0]),
      scenarioDefinition.volumeRange[1]
    );

    const newTrade: VWAPTrade = {
      id: `manual-${Date.now()}`,
      price: parseFloat(boundedPrice.toFixed(2)),
      volume: Math.round(boundedVolume),
      time: lastTime + 0.4 + manualTrades.length * 0.02,
      source: 'manual',
    };
    setManualTrades((prev) => [...prev, newTrade]);
  };

  const toggleAnchor = (anchorId: string) => {
    setActiveAnchorIds((prev) => {
      if (prev.includes(anchorId)) {
        return prev.filter((id) => id !== anchorId);
      }
      return [...prev, anchorId];
    });
  };

  const handleRewind = () => {
    setPlayhead(1);
    setIsPlaying(true);
  };

  const handlePlayPause = () => {
    if (playhead >= baseTrades.length) {
      setPlayhead(1);
    }
    setIsPlaying((prev) => !prev);
  };

  return (
    <div className="relative w-full my-6">
      <EnvironmentWrapper height="970px">
        <div className="w-full h-full flex">
          <div className="flex-1 h-full">
            <VWAPLaboratory2D
              trades={visibleTrades}
              activeAnchors={selectedAnchors}
              scenarioLabel={scenarioDefinition.label}
              showSessionVWAP={showSessionVWAP}
              showDeviationBands={showBands}
              totalScenarioTrades={baseTrades.length}
              processedScenarioTrades={Math.min(playhead, baseTrades.length)}
              isPlaying={isPlaying}
            />
          </div>
          <div className="w-[380px] h-full overflow-y-auto">
            <div className="h-full w-full p-5 flex flex-col gap-5 bg-gradient-to-b from-slate-950/85 via-slate-900/75 to-slate-950/65 border-l border-white/5">
              <div className="space-y-2">
                <h3 className="text-base font-semibold">VWAP Laboratory</h3>
                <p className="text-xs text-muted-foreground">
                  Inject trades, anchor VWAP to events, and watch the math
                  update in real time.
                </p>
              </div>

              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
                  Day-Type Scenario
                </Label>
                <div className="flex flex-wrap gap-2">
                  {(Object.keys(SCENARIOS) as ScenarioKey[]).map((key) => (
                    <Button
                      key={key}
                      size="sm"
                      variant={scenarioKey === key ? 'default' : 'secondary'}
                      onClick={() => {
                        setScenarioKey(key);
                        setIsPlaying(false);
                      }}
                    >
                      {SCENARIOS[key].label}
                    </Button>
                  ))}
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">
                  {scenarioDefinition.description}
                </p>
              </div>

              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
                  Playback
                </Label>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" onClick={handlePlayPause}>
                    {isPlaying ? 'Pause' : 'Play'}
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleRewind}>
                    Rewind &amp; Play
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() =>
                      setPlayhead((prev) =>
                        Math.min(prev + 5, baseTrades.length)
                      )
                    }
                  >
                    Step +5
                  </Button>
                </div>
                <div className="mt-2">
                  <div className="flex justify-between text-[11px] text-muted-foreground">
                    <span>{(progress * 100).toFixed(0)}% processed</span>
                    <span>
                      {Math.min(playhead, baseTrades.length)} /{' '}
                      {baseTrades.length} trades
                    </span>
                  </div>
                  <div className="h-1.5 bg-slate-800/80 rounded-full mt-1 overflow-hidden">
                    <div
                      className="h-full bg-sky-400 transition-all duration-300"
                      style={{ width: `${Math.min(progress * 100, 100)}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
                  Session Visuals
                </Label>
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant={showSessionVWAP ? 'default' : 'secondary'}
                    onClick={() => setShowSessionVWAP((v) => !v)}
                  >
                    Session VWAP
                  </Button>
                  <Button
                    size="sm"
                    variant={showBands ? 'default' : 'secondary'}
                    onClick={() => setShowBands((v) => !v)}
                  >
                    Std Dev Bands
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
                  Anchored VWAPs
                </Label>
                <TooltipProvider delayDuration={100}>
                  <div className="flex flex-wrap gap-2">
                    {anchorsWithTimes.map((anchor) => (
                      <Tooltip key={anchor.id}>
                        <TooltipTrigger asChild>
                          <Button
                            size="sm"
                            variant={
                              activeAnchorIds.includes(anchor.id)
                                ? 'default'
                                : 'secondary'
                            }
                            onClick={() => toggleAnchor(anchor.id)}
                            className="flex items-center gap-2"
                          >
                            <span
                              className="w-2.5 h-2.5 rounded-full"
                              style={{ backgroundColor: anchor.color }}
                            />
                            {anchor.label}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs text-xs leading-relaxed">
                          {anchor.description}
                        </TooltipContent>
                      </Tooltip>
                    ))}
                  </div>
                </TooltipProvider>
                <div className="mt-2 space-y-1 text-[11px] text-muted-foreground">
                  {anchorsWithTimes.map((anchor) => {
                    const summary = anchorSummaries.find(
                      (s) => s.id === anchor.id
                    );
                    const activated = summary?.activated ?? false;
                    const value = summary?.vwap ?? null;
                    return (
                      <div
                        key={anchor.id}
                        className="flex items-center justify-between"
                      >
                        <span className="flex items-center gap-2">
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: anchor.color }}
                          />
                          {anchor.label}
                        </span>
                        {activeAnchorIds.includes(anchor.id) ? (
                          activated && value !== null ? (
                            <span className="font-semibold text-emerald-300">
                              {numberFormatter.format(value)}
                            </span>
                          ) : (
                            <span>Waiting for trigger</span>
                          )
                        ) : (
                          <span className="text-muted-foreground/70">Off</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
                  Inject Trades
                </Label>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-[11px] text-muted-foreground">
                      <span>Price: {priceDraft.toFixed(2)}</span>
                      <span>
                        Range {priceDomain[0]} – {priceDomain[1]}
                      </span>
                    </div>
                    <Slider
                      min={priceDomain[0]}
                      max={priceDomain[1]}
                      step={0.05}
                      value={[priceDraft]}
                      onValueChange={(val) => {
                        if (typeof val[0] === 'number') {
                          setPriceDraft(val[0]);
                        }
                      }}
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-[11px] text-muted-foreground">
                      <span>
                        Volume: {Math.round(volumeDraft).toLocaleString()}
                      </span>
                      <span>
                        Range {scenarioDefinition.volumeRange[0]} –{' '}
                        {scenarioDefinition.volumeRange[1]}
                      </span>
                    </div>
                    <Slider
                      min={scenarioDefinition.volumeRange[0]}
                      max={scenarioDefinition.volumeRange[1]}
                      step={25}
                      value={[volumeDraft]}
                      onValueChange={(val) => {
                        if (typeof val[0] === 'number') {
                          setVolumeDraft(val[0]);
                        }
                      }}
                    />
                  </div>
                  <Button size="sm" onClick={handleInjectTrade}>
                    Inject Trade
                  </Button>
                  <p className="text-[11px] text-muted-foreground">
                    Manual trades append to the timeline so you can stress-test
                    VWAP.
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-white/5 text-[12px] space-y-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge
                    variant="outline"
                    className="text-[11px] bg-slate-900/60 text-slate-100 border-slate-700"
                  >
                    Session VWAP{' '}
                    {numberFormatter.format(sessionStats.vwap || 0)}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="text-[11px] bg-slate-900/60 text-slate-100 border-slate-700"
                  >
                    Σ Price×Vol{' '}
                    {compactFormatter.format(sessionStats.numerator || 0)}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="text-[11px] bg-slate-900/60 text-slate-100 border-slate-700"
                  >
                    Σ Volume{' '}
                    {compactFormatter.format(sessionStats.denominator || 0)}
                  </Badge>
                </div>
                <div className="text-muted-foreground">
                  Manual trades injected: {manualTrades.length}
                </div>
              </div>
            </div>
          </div>
        </div>
      </EnvironmentWrapper>
    </div>
  );
};

export default VWAPLaboratory2DContainer;
