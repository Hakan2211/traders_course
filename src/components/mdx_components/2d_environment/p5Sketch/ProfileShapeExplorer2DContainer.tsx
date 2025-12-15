
import React, { useEffect, useMemo, useRef, useState } from 'react';
import EnvironmentWrapper from '@/components/mdx_components/2d_environment/environmentWrapper';
import { ProfileShape, ProfileShapeExplorer2D } from './ProfileShapeExplorer2D';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const SHAPES: {
  key: ProfileShape;
  label: string;
  hint: string;
  short: string;
}[] = [
  {
    key: 'd_shape',
    label: 'D-shape',
    hint: 'Balanced (mean reversion)',
    short: 'D',
  },
  {
    key: 'p_shape',
    label: 'P-shape',
    hint: 'Short-covering (buyers winning)',
    short: 'P',
  },
  {
    key: 'b_shape',
    label: 'b-shape',
    hint: 'Liquidation (sellers dominating)',
    short: 'b',
  },
  {
    key: 'trend',
    label: 'Trend / Skewed',
    hint: 'One-directional auction with tail',
    short: 'Trend',
  },
  {
    key: 'double_distribution',
    label: 'Double Distribution',
    hint: 'Two value zones separated by LVN',
    short: 'DD',
  },
];

const ToggleRow: React.FC<{
  label: string;
  checked: boolean;
  onClick: () => void;
}> = ({ label, checked, onClick }) => {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <Button
        size="sm"
        variant={checked ? 'default' : 'secondary'}
        onClick={onClick}
      >
        {checked ? 'On' : 'Off'}
      </Button>
    </div>
  );
};

const ProfileShapeExplorer2DContainer: React.FC = () => {
  const [shape, setShape] = useState<ProfileShape>('d_shape');
  const [showVWAP, setShowVWAP] = useState<boolean>(true);
  const [showValueArea, setShowValueArea] = useState<boolean>(true);
  const [showNodes, setShowNodes] = useState<boolean>(true);
  const [hoverInfo, setHoverInfo] = useState<string | null>(null);

  return (
    <div className="relative w-full my-6">
      <EnvironmentWrapper height="520px">
        <div className="w-full h-full flex">
          {/* Left: Canvas */}
          <div className="h-full" style={{ width: '65%' }}>
            <ProfileShapeExplorer2D
              selectedShape={shape}
              showVWAP={showVWAP}
              showValueArea={showValueArea}
              showNodes={showNodes}
              onHoverInfo={setHoverInfo}
            />
          </div>

          {/* Right: Controls */}
          <div className="h-full" style={{ width: '35%' }}>
            <div className="h-full w-full p-4 flex flex-col gap-3 bg-gradient-to-b from-slate-900/30 to-slate-900/10">
              <div>
                <h3 className="text-base font-semibold mb-1">
                  Profile Shape Explorer
                </h3>
                <p className="text-xs text-muted-foreground">
                  See how value distribution changes with market structure.
                </p>
              </div>

              <div>
                <Label className="text-xs">Profiles</Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  <TooltipProvider delayDuration={150}>
                    {SHAPES.map((s) => (
                      <Tooltip key={s.key}>
                        <TooltipTrigger asChild>
                          <Button
                            size="sm"
                            variant={shape === s.key ? 'default' : 'secondary'}
                            onClick={() => setShape(s.key)}
                          >
                            {s.short}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <div className="text-xs">
                            <div className="font-semibold">{s.label}</div>
                            <div className="opacity-90">{s.hint}</div>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    ))}
                  </TooltipProvider>
                </div>
              </div>

              <div className="mt-1">
                <Label className="text-xs">Overlays</Label>
                <div className="mt-2 space-y-1">
                  <ToggleRow
                    label="Show VWAP"
                    checked={showVWAP}
                    onClick={() => setShowVWAP((v) => !v)}
                  />
                  <ToggleRow
                    label="Show Value Area (68.2%)"
                    checked={showValueArea}
                    onClick={() => setShowValueArea((v) => !v)}
                  />
                  <ToggleRow
                    label="Show HVN/LVN markers"
                    checked={showNodes}
                    onClick={() => setShowNodes((v) => !v)}
                  />
                </div>
              </div>

              <div className="mt-2">
                <Label className="text-xs">Hover Reading</Label>
                <div className="mt-2 text-xs text-muted-foreground min-h-[44px]">
                  {hoverInfo ?? 'Hover levels on the canvas for details.'}
                </div>
              </div>

              <div className="mt-auto border-t border-border/50 pt-3 space-y-1">
                <p className="text-[11px] leading-relaxed text-muted-foreground">
                  POC shows where most business occurred. Value Area highlights
                  agreement. LVNs often act as “fast lanes”; HVNs as magnets.
                  Watch VWAP relative to value for tone.
                </p>
              </div>
            </div>
          </div>
        </div>
      </EnvironmentWrapper>
    </div>
  );
};

export default ProfileShapeExplorer2DContainer;
