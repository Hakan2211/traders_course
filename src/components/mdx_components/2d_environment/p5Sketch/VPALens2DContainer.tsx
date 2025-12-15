
import React, { useEffect, useMemo, useRef, useState } from 'react';
import EnvironmentWrapper from '@/components/mdx_components/2d_environment/environmentWrapper';
import { VPALens2D, VPAMode, VPAPattern } from './VPALens2D';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Fallback lightweight toggle since there is no Switch export in current UI set
const ToggleRow: React.FC<{
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}> = ({ checked, onChange, label }) => {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm text-muted-foreground">{label}</span>
      <Button
        variant={checked ? 'default' : 'secondary'}
        size="sm"
        onClick={() => onChange(!checked)}
      >
        {checked ? 'On' : 'Off'}
      </Button>
    </div>
  );
};

const PATTERNS: { key: VPAPattern; label: string }[] = [
  { key: 'accumulation', label: 'Accumulation' },
  { key: 'distribution', label: 'Distribution' },
  { key: 'testing', label: 'Testing' },
  { key: 'sellingClimax', label: 'Selling Climax' },
  { key: 'buyingClimax', label: 'Buying Climax' },
];

const MODES: { key: VPAMode; label: string }[] = [
  { key: 'micro', label: 'Micro' },
  { key: 'macro', label: 'Macro' },
  { key: 'global', label: 'Global' },
];

const TOTAL_BARS = 40;

const VPALens2DContainer: React.FC = () => {
  const [mode, setMode] = useState<VPAMode>('micro');
  const [pattern, setPattern] = useState<VPAPattern>('accumulation');
  const [step, setStep] = useState<number>(1);
  const [playing, setPlaying] = useState<boolean>(false);
  const [showInsights, setShowInsights] = useState<boolean>(true);
  const [hoverReading, setHoverReading] = useState<string | null>(null);
  const [dualView, setDualView] = useState<boolean>(false);
  const playRef = useRef(playing);
  const stepRef = useRef(step);

  useEffect(() => {
    playRef.current = playing;
  }, [playing]);
  useEffect(() => {
    stepRef.current = step;
  }, [step]);

  // Auto-advance
  useEffect(() => {
    const id = setInterval(() => {
      if (!playRef.current) return;
      setStep((s) => {
        if (s >= TOTAL_BARS) return TOTAL_BARS;
        return s + 1;
      });
    }, 500);
    return () => clearInterval(id);
  }, []);

  // Reset step when pattern changes
  useEffect(() => {
    setStep(1);
  }, [pattern]);

  return (
    <div className="relative w-full">
      <EnvironmentWrapper height="620px">
        <div className="w-full h-full flex">
          {/* Left: Canvas */}
          <div className="h-full" style={{ width: '60%' }}>
            <VPALens2D
              mode={mode}
              pattern={pattern}
              step={step}
              showInsights={showInsights}
              onHoverReadingChange={setHoverReading}
              totalBars={TOTAL_BARS}
              onStepChange={(n) => setStep(n)}
              dualView={dualView}
            />
          </div>

          {/* Right: Panel */}
          <div className="h-full" style={{ width: '40%' }}>
            <div className="h-full w-full p-5 flex flex-col gap-4 bg-gradient-to-b from-slate-900/30 to-slate-900/10">
              <div>
                <h3 className="text-base font-semibold mb-1">
                  The Three-Level VPA Lens
                </h3>
                <p className="text-xs text-muted-foreground">
                  Observe effort (volume) vs result (candle) across Micro,
                  Macro, and Global views.
                </p>
              </div>

              {/* Zoom selector */}
              <div>
                <Label className="text-xs">Zoom</Label>
                <div className="mt-2 flex gap-2">
                  {MODES.map((m) => (
                    <Button
                      key={m.key}
                      variant={mode === m.key ? 'default' : 'secondary'}
                      size="sm"
                      onClick={() => setMode(m.key)}
                    >
                      {m.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Pattern selector */}
              <div>
                <Label className="text-xs">Pattern</Label>
                <div className="mt-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-between"
                      >
                        {PATTERNS.find((p) => p.key === pattern)?.label}
                        <span className="ml-2 opacity-70">▼</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="start"
                      className="w-56 bg-slate-800 border-slate-700 text-white"
                    >
                      <DropdownMenuLabel className="text-white font-semibold">
                        Select VPA Concept
                      </DropdownMenuLabel>
                      {PATTERNS.map((p) => (
                        <DropdownMenuItem
                          key={p.key}
                          onClick={() => setPattern(p.key)}
                          className="text-white cursor-pointer hover:bg-slate-700 hover:text-white focus:bg-slate-700 focus:text-white"
                        >
                          {p.label}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-2">
                <Button size="sm" onClick={() => setPlaying((v) => !v)}>
                  {playing ? 'Pause' : 'Play'}
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setStep((s) => Math.max(1, s - 1))}
                >
                  Step ◀
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setStep((s) => Math.min(TOTAL_BARS, s + 1))}
                >
                  Step ▶
                </Button>
              </div>

              {/* Step slider */}
              <div className="mt-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Step Through Candles</Label>
                  <span className="text-xs tabular-nums text-muted-foreground">
                    {step} / {TOTAL_BARS}
                  </span>
                </div>
                <div className="mt-3">
                  <Slider
                    value={[step]}
                    min={1}
                    max={TOTAL_BARS}
                    step={1}
                    onValueChange={(v) => setStep(v[0] ?? 1)}
                  />
                </div>
              </div>

              {/* Toggles */}
              <div className="mt-1">
                <ToggleRow
                  checked={showInsights}
                  onChange={setShowInsights}
                  label="Toggle Insights"
                />
                <ToggleRow
                  checked={dualView}
                  onChange={setDualView}
                  label="Dual View Mode"
                />
              </div>

              {/* Live reading */}
              <div className="mt-1">
                <Label className="text-xs">Hover Reading</Label>
                <div className="mt-2 text-xs text-muted-foreground min-h-[44px]">
                  {hoverReading ??
                    'Hover a candle to see its micro VPA reading.'}
                </div>
              </div>

              <div className="mt-auto border-t border-border/50 pt-3 space-y-1">
                <p className="text-[11px] leading-relaxed text-muted-foreground">
                  Tips: Look for rising volume confirming a trend (healthy),
                  falling volume in trend (exhaustion), high volume with small
                  bodies (absorption), and context shifts from Micro ➜ Macro ➜
                  Global.
                </p>
              </div>
            </div>
          </div>
        </div>
      </EnvironmentWrapper>
    </div>
  );
};

export default VPALens2DContainer;
