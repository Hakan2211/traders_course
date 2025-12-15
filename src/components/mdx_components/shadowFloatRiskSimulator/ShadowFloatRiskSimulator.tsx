
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

type MessageType = 'info' | 'warning' | 'danger' | 'success';

type ScenarioType = 'drift' | 'rally' | 'squeeze' | 'gap';
type Scenario = { type: ScenarioType; duration: number } | null;

type PricePoint = { price: number; time: number };

type SimulatorState = {
  accountSize: number;
  balance: number;
  entryPrice: number | null;
  currentPrice: number;
  shares: number;
  stopLoss: number | null;
  inPosition: boolean;
  priceHistory: PricePoint[];
  timeInTrade: number;
  violatedRules: string[];
  marginCallTriggered: boolean;
  tradeStartTime: number | null;
  lastClosedPnl: number;
  cumulativeClosedPnl: number;
  tradeCount: number;
  maxTrades: number;
};

type Message = {
  id: string;
  type: MessageType;
  text: string;
};

function formatCurrency(value: number): string {
  return `$${value.toFixed(2)}`;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

const MAX_MESSAGES = 20;

export default function ShadowFloatRiskSimulator() {
  const [inputs, setInputs] = useState({
    accountSize: 100_000,
    entryPrice: 100,
    shares: 500,
    stopLoss: 110,
  });

  const [state, setState] = useState<SimulatorState>({
    accountSize: 100_000,
    balance: 100_000,
    entryPrice: null,
    currentPrice: 100,
    shares: 0,
    stopLoss: null,
    inPosition: false,
    priceHistory: [],
    timeInTrade: 0,
    violatedRules: [],
    marginCallTriggered: false,
    tradeStartTime: null,
    lastClosedPnl: 0,
    cumulativeClosedPnl: 0,
    tradeCount: 0,
    maxTrades: 10,
  });

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      type: 'info',
      text: '📘 Welcome to the Shadow Float Simulator. Set up your short trade above and click "Enter Short Position" to begin.',
    },
  ]);

  const [scenario, setScenario] = useState<Scenario>(null);
  const [showMarginModal, setShowMarginModal] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartContainerRef = useRef<HTMLDivElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const stateRef = useRef<SimulatorState>(state);

  const addMessage = useCallback((type: MessageType, text: string) => {
    setMessages((prev) => {
      const next = [
        ...prev,
        { id: `${Date.now()}-${Math.random()}`, type, text },
      ];
      if (next.length > MAX_MESSAGES) next.shift();
      return next;
    });
  }, []);

  const riskCalcs = useMemo(() => {
    const positionSize = inputs.entryPrice * inputs.shares;
    const riskPerShare = Math.abs(inputs.stopLoss - inputs.entryPrice);
    const totalRisk = riskPerShare * inputs.shares;
    const riskPct = (totalRisk / inputs.accountSize) * 100;
    return { positionSize, riskPerShare, totalRisk, riskPct };
  }, [inputs.accountSize, inputs.entryPrice, inputs.shares, inputs.stopLoss]);

  // Keep latest state in a ref so the RAF loop never reads stale closures
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const onEnterShort = useCallback(() => {
    if (state.inPosition) return;
    if (state.tradeCount >= state.maxTrades) {
      addMessage('warning', `⛔ Trade limit reached (${state.maxTrades}).`);
      return;
    }
    if (inputs.stopLoss <= inputs.entryPrice) {
      addMessage(
        'danger',
        '❌ Stop loss must be ABOVE entry price for shorts!'
      );
      return;
    }

    const positionSize = inputs.entryPrice * inputs.shares;
    const totalRisk = (inputs.stopLoss - inputs.entryPrice) * inputs.shares;
    const riskPct = (totalRisk / inputs.accountSize) * 100;

    const violations: string[] = [];
    if (riskPct > 2) {
      violations.push('Risk exceeds 2% of account');
      addMessage(
        'warning',
        `⚠️ RULE VIOLATION: You're risking ${riskPct.toFixed(
          1
        )}% of your account. Max should be 2%.`
      );
    }
    if (inputs.stopLoss > inputs.entryPrice * 1.15) {
      violations.push('Stop loss too wide (>15%)');
      addMessage(
        'warning',
        `⚠️ RULE VIOLATION: Stop loss is ${(
          (inputs.stopLoss / inputs.entryPrice - 1) *
          100
        ).toFixed(1)}% away. That's too wide!`
      );
    }

    setState((prev) => {
      const isFirstTrade = prev.tradeCount === 0 && !prev.inPosition;
      const nextBalance = isFirstTrade ? inputs.accountSize : prev.balance;
      return {
        ...prev,
        accountSize: inputs.accountSize,
        balance: nextBalance,
        entryPrice: inputs.entryPrice,
        currentPrice: inputs.entryPrice,
        shares: inputs.shares,
        stopLoss: inputs.stopLoss,
        inPosition: true,
        // Seed two points so the chart draws immediately
        priceHistory: [
          { price: inputs.entryPrice, time: 0 },
          { price: inputs.entryPrice, time: 1 },
        ],
        timeInTrade: 0,
        marginCallTriggered: false,
        violatedRules: violations,
        tradeStartTime: Date.now(),
      };
    });

    addMessage(
      'info',
      `🔻 SHORT ENTERED: ${inputs.shares} shares at ${formatCurrency(
        inputs.entryPrice
      )}`
    );
    addMessage(
      'info',
      `⛔ Stop Loss set at ${formatCurrency(inputs.stopLoss)} (${(
        (inputs.stopLoss / inputs.entryPrice - 1) *
        100
      ).toFixed(1)}% above entry)`
    );
    if (violations.length === 0) {
      addMessage(
        'success',
        '✅ All risk management rules followed. Good discipline!'
      );
    }
  }, [
    inputs.accountSize,
    inputs.entryPrice,
    inputs.shares,
    inputs.stopLoss,
    addMessage,
  ]);

  const coverPosition = useCallback(() => {
    setState((prev) => {
      if (!prev.inPosition || prev.entryPrice == null || prev.stopLoss == null)
        return prev;
      const pnl = (prev.entryPrice - prev.currentPrice) * prev.shares;
      const pnlPct =
        ((prev.currentPrice - prev.entryPrice) / prev.entryPrice) * -100;
      const newBalance = prev.balance + pnl;

      if (pnl > 0) {
        addMessage(
          'success',
          `✅ POSITION COVERED: Profit of ${formatCurrency(
            pnl
          )} (+${pnlPct.toFixed(1)}%)`
        );
      } else {
        addMessage(
          'danger',
          `❌ POSITION COVERED: Loss of ${formatCurrency(
            Math.abs(pnl)
          )} (${pnlPct.toFixed(1)}%)`
        );
      }
      addMessage(
        'info',
        `💰 New account balance: ${formatCurrency(newBalance)}`
      );

      const maxProfitPerShare = Math.max(
        ...prev.priceHistory.map((h) => (prev.entryPrice as number) - h.price)
      );
      const maxProfitTotal = maxProfitPerShare * prev.shares;
      if (pnl > 0 && pnl < maxProfitTotal * 0.5) {
        addMessage(
          'warning',
          `⚠️ You left money on the table. Max profit was ${formatCurrency(
            maxProfitTotal
          )}, you took ${formatCurrency(pnl)}.`
        );
      }

      const updated = {
        ...prev,
        balance: newBalance,
        inPosition: false,
        lastClosedPnl: pnl,
        cumulativeClosedPnl: prev.cumulativeClosedPnl + pnl,
        tradeCount: Math.min(prev.tradeCount + 1, prev.maxTrades),
      };
      // Feedback on trades
      addMessage(
        'info',
        `🧮 Trades: ${Math.min(updated.tradeCount, updated.maxTrades)} / ${
          updated.maxTrades
        }. Cumulative P/L: ${formatCurrency(updated.cumulativeClosedPnl)}`
      );
      return updated;
    });
  }, [
    addMessage,
    state.inPosition,
    state.tradeCount,
    state.maxTrades,
    inputs.accountSize,
    inputs.entryPrice,
    inputs.shares,
    inputs.stopLoss,
  ]);

  const onResetSession = useCallback(() => {
    setScenario(null);
    setShowMarginModal(false);
    setState((prev) => ({
      accountSize: inputs.accountSize,
      balance: inputs.accountSize,
      entryPrice: null,
      currentPrice: 100,
      shares: 0,
      stopLoss: null,
      inPosition: false,
      priceHistory: [],
      timeInTrade: 0,
      violatedRules: [],
      marginCallTriggered: false,
      tradeStartTime: null,
      lastClosedPnl: 0,
      cumulativeClosedPnl: 0,
      tradeCount: 0,
      maxTrades: prev.maxTrades,
    }));
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        type: 'info',
        text: '📘 Welcome to the Shadow Float Simulator. Set up your short trade above and click "Enter Short Position" to begin.',
      },
    ]);
    addMessage('info', '↺ Session reset. Balance restored to Account Size.');
  }, [inputs.accountSize, addMessage]);

  const applyScenario = useCallback(
    (draft: SimulatorState, currentScenario: Scenario): SimulatorState => {
      if (!currentScenario) return draft;
      let nextPrice = draft.currentPrice;
      let nextDuration = currentScenario.duration;
      switch (currentScenario.type) {
        case 'drift':
          nextPrice -= 0.15;
          nextDuration--;
          break;
        case 'rally':
          nextPrice += 0.3;
          nextDuration--;
          break;
        case 'squeeze':
          nextPrice += 1.2 + Math.random() * 0.8;
          nextDuration--;
          break;
        case 'gap':
          if (nextDuration === 60 && draft.entryPrice != null) {
            const gapSize = draft.entryPrice * 0.15;
            nextPrice += gapSize;
            addMessage(
              'danger',
              `⚡ GAP UP! Price jumped ${formatCurrency(
                gapSize
              )} overnight. Your stop was useless!`
            );
          }
          nextDuration--;
          break;
      }
      setScenario(
        nextDuration <= 0
          ? null
          : {
              ...(currentScenario as NonNullable<Scenario>),
              duration: nextDuration,
            }
      );
      return { ...draft, currentPrice: nextPrice };
    },
    [addMessage]
  );

  // Main animation loop
  useEffect(() => {
    function resizeCanvasToContainer(
      canvas: HTMLCanvasElement,
      container: HTMLElement
    ) {
      const { clientWidth, clientHeight } = container;
      if (canvas.width !== clientWidth || canvas.height !== clientHeight) {
        canvas.width = clientWidth;
        canvas.height = clientHeight;
      }
    }

    const tick = () => {
      let nextState: SimulatorState | null = null;
      setState((prev) => {
        let draft = prev;
        if (prev.inPosition) {
          draft = { ...prev, timeInTrade: prev.timeInTrade + 1 };
          // Scenario or random walk (slight upward bias)
          if (scenario) {
            draft = applyScenario(draft, scenario);
          } else {
            const change = (Math.random() - 0.45) * 0.5;
            draft.currentPrice = clamp(
              draft.currentPrice + change,
              50,
              Number.POSITIVE_INFINITY
            );
          }
          draft.priceHistory = [
            ...draft.priceHistory,
            { price: draft.currentPrice, time: draft.timeInTrade },
          ];
          if (draft.priceHistory.length > 200) draft.priceHistory.shift();

          // Violations
          if (draft.entryPrice != null && draft.stopLoss != null) {
            // Stop loss
            if (
              draft.currentPrice >= draft.stopLoss &&
              !draft.marginCallTriggered
            ) {
              addMessage(
                'danger',
                '🛑 STOP LOSS HIT! Position automatically closed.'
              );
              setTimeout(() => coverPosition(), 500);
            } else {
              // Margin call check
              const pnl =
                (draft.entryPrice - draft.currentPrice) * draft.shares;
              const accountEquity = draft.balance + pnl;
              const marginUsed = draft.entryPrice * draft.shares;
              const marginLevel = (accountEquity / marginUsed) * 100;
              if (marginLevel < 30 && !draft.marginCallTriggered) {
                draft.marginCallTriggered = true;
                addMessage(
                  'danger',
                  '🚨 MARGIN CALL! Your broker is force-liquidating your position!'
                );
                setShowMarginModal(true);
                setTimeout(() => coverPosition(), 1500);
              }

              // Emotional cues
              const pnlPct =
                ((draft.currentPrice - draft.entryPrice) / draft.entryPrice) *
                -100;
              const lossPct = Math.abs(Math.min(0, pnlPct));
              if (lossPct > 5 && lossPct < 8 && draft.timeInTrade % 30 === 0) {
                addMessage(
                  'warning',
                  `😰 Position down ${lossPct.toFixed(
                    1
                  )}%. Are you still confident in this trade?`
                );
              }
              if (lossPct > 10 && draft.timeInTrade % 20 === 0) {
                addMessage(
                  'danger',
                  `😱 Position down ${lossPct.toFixed(
                    1
                  )}%! This is serious pain. Cover or hold?`
                );
              }
              if (pnlPct > 5 && pnlPct < 8 && draft.timeInTrade % 40 === 0) {
                addMessage(
                  'success',
                  `💰 Nice profit at +${pnlPct.toFixed(
                    1
                  )}%. Consider taking some off the table!`
                );
              }
            }
          }
        }
        nextState = draft;
        return draft;
      });

      // Draw using the freshly computed state
      const canvas = canvasRef.current;
      const container = chartContainerRef.current;
      if (canvas && container && nextState) {
        resizeCanvasToContainer(canvas, container);
        drawChart(nextState);
      }
      animationRef.current = requestAnimationFrame(tick);
    };

    animationRef.current = requestAnimationFrame(tick);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applyScenario, scenario, coverPosition, addMessage]);

  // Also redraw whenever core state changes (ensures live updates even if RAF is throttled)
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = chartContainerRef.current;
    if (!canvas || !container) return;
    const { clientWidth, clientHeight } = container;
    if (canvas.width !== clientWidth || canvas.height !== clientHeight) {
      canvas.width = clientWidth;
      canvas.height = clientHeight;
    }
    drawChart(state);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    state.priceHistory,
    state.currentPrice,
    state.inPosition,
    state.entryPrice,
    state.stopLoss,
  ]);

  const onTriggerScenario = useCallback(
    (type: ScenarioType) => {
      if (!state.inPosition) {
        addMessage('warning', 'Enter a position first!');
        return;
      }
      setScenario({ type, duration: 60 });
      if (type === 'drift')
        addMessage(
          'info',
          '📉 Market entering slow downtrend. Your thesis is working!'
        );
      if (type === 'rally')
        addMessage(
          'warning',
          '📈 Bull rally forming. Shorts getting squeezed!'
        );
      if (type === 'squeeze')
        addMessage(
          'danger',
          '🚀 SHORT SQUEEZE TRIGGERED! Massive buying pressure!'
        );
      if (type === 'gap') addMessage('danger', '⚡ Overnight gap incoming...');
    },
    [state.inPosition, addMessage]
  );

  const drawChart = useCallback((chartState: SimulatorState) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Ensure we always have something to draw
    const history =
      chartState.priceHistory.length >= 2
        ? chartState.priceHistory
        : chartState.priceHistory.length === 1
        ? [chartState.priceHistory[0], chartState.priceHistory[0]]
        : [
            { price: chartState.currentPrice, time: 0 },
            { price: chartState.currentPrice, time: 1 },
          ];

    const padding = 40;
    const chartWidth = canvas.width - padding * 2;
    const chartHeight = canvas.height - padding * 2;
    const prices = history.map((h) => h.price);
    let minPrice = Math.min(...prices);
    let maxPrice = Math.max(...prices);
    if (minPrice === maxPrice) {
      // Expand a flat range slightly so lines/labels render meaningfully
      minPrice = minPrice * 0.99;
      maxPrice = maxPrice * 1.01;
    } else {
      minPrice = minPrice * 0.98;
      maxPrice = maxPrice * 1.02;
    }
    const priceRange = maxPrice - minPrice || Math.max(1, maxPrice * 0.01);

    // Grid
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
      const y = padding + (chartHeight / 5) * i;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(canvas.width - padding, y);
      ctx.stroke();
      const price = maxPrice - (priceRange / 5) * i;
      ctx.fillStyle = '#666';
      ctx.font =
        '11px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace';
      ctx.textAlign = 'right';
      ctx.fillText(`$${price.toFixed(2)}`, padding - 5, y + 4);
    }

    // Price line
    ctx.beginPath();
    ctx.strokeStyle = '#00aaff';
    ctx.lineWidth = 2;
    history.forEach((point, i) => {
      const x = padding + (i / (history.length - 1)) * chartWidth;
      const y =
        padding +
        chartHeight -
        ((point.price - minPrice) / priceRange) * chartHeight;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    if (
      chartState.inPosition &&
      chartState.entryPrice != null &&
      chartState.stopLoss != null
    ) {
      // Entry line
      const entryY =
        padding +
        chartHeight -
        ((chartState.entryPrice - minPrice) / priceRange) * chartHeight;
      ctx.strokeStyle = '#ffaa00';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(padding, entryY);
      ctx.lineTo(canvas.width - padding, entryY);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#ffaa00';
      ctx.font =
        'bold 12px system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial';
      ctx.textAlign = 'left';
      ctx.fillText(
        `ENTRY: $${chartState.entryPrice.toFixed(2)}`,
        padding + 5,
        entryY - 5
      );

      // Stop line
      const stopY =
        padding +
        chartHeight -
        ((chartState.stopLoss - minPrice) / priceRange) * chartHeight;
      ctx.strokeStyle = '#ff4444';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(padding, stopY);
      ctx.lineTo(canvas.width - padding, stopY);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#ff4444';
      ctx.fillText(
        `STOP: $${chartState.stopLoss.toFixed(2)}`,
        padding + 5,
        stopY + 15
      );
    }
  }, []);

  const onInputChange = <K extends keyof typeof inputs>(
    key: K,
    value: number
  ) => {
    setInputs((prev) => ({ ...prev, [key]: value }));
  };

  const pnlInfo = useMemo(() => {
    if (!state.inPosition || state.entryPrice == null) {
      return { pnl: 0, pnlPct: 0 };
    }
    const pnl = (state.entryPrice - state.currentPrice) * state.shares;
    const pnlPct =
      ((state.currentPrice - state.entryPrice) / state.entryPrice) * -100;
    return { pnl, pnlPct };
  }, [state.currentPrice, state.entryPrice, state.inPosition, state.shares]);

  const marginInfo = useMemo(() => {
    if (!state.inPosition || state.entryPrice == null) {
      return { level: 100, category: 'HEALTHY' as const, widthPct: 100 };
    }
    const pnl = (state.entryPrice - state.currentPrice) * state.shares;
    const accountEquity = state.balance + pnl;
    const marginUsed = state.entryPrice * state.shares;
    const level = (accountEquity / marginUsed) * 100;
    let category: 'HEALTHY' | 'WARNING' | 'DANGER!' = 'HEALTHY';
    if (level <= 30) category = 'DANGER!';
    else if (level <= 50) category = 'WARNING';
    return { level, category, widthPct: clamp(level, 0, 100) };
  }, [
    state.balance,
    state.currentPrice,
    state.entryPrice,
    state.inPosition,
    state.shares,
  ]);

  const emotionInfo = useMemo(() => {
    if (!state.inPosition || state.entryPrice == null) {
      return {
        label: 'CALM',
        widthPct: 10,
        className: 'bg-gradient-to-r from-green-400 to-green-500 text-black',
      };
    }
    const pnlPct =
      ((state.currentPrice - state.entryPrice) / state.entryPrice) * -100;
    const lossPct = Math.abs(Math.min(0, pnlPct));
    const pct = clamp(lossPct * 5, 0, 100);
    if (pct < 25)
      return {
        label: 'CALM',
        widthPct: Math.max(10, pct),
        className: 'bg-gradient-to-r from-green-400 to-green-500 text-black',
      };
    if (pct < 50)
      return {
        label: 'CONCERNED',
        widthPct: pct,
        className: 'bg-gradient-to-r from-yellow-300 to-amber-500 text-black',
      };
    if (pct < 75)
      return {
        label: 'FEARFUL',
        widthPct: pct,
        className: 'bg-gradient-to-r from-amber-500 to-red-500 text-white',
      };
    return {
      label: 'PANIC!',
      widthPct: pct,
      className: 'bg-gradient-to-r from-red-500 to-red-700 text-white',
    };
  }, [state.currentPrice, state.entryPrice, state.inPosition]);

  return (
    <div className="mx-auto max-w-[1600px] p-5 text-zinc-200 bg-gradient-to-br from-gray-950/90 via-gray-900/85 to-black/90 border border-gray-700/40 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.65)] backdrop-blur-2xl">
      {/* Header */}
      <div className="mb-5 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-center backdrop-blur">
        <h1 className="mb-1 text-xl font-bold text-red-400 drop-shadow-[0_0_20px_rgba(248,113,113,0.4)]">
          ⚠️ Shadow Float Risk Management Simulator
        </h1>
        <p className="text-xs text-zinc-400">
          Experience the emotional and financial pressure of short selling in
          real-time
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.5fr,1fr]">
        {/* Left column - Chart & Messages */}
        <div className="flex flex-col gap-4">
          {/* Chart Panel */}
          <div className="flex flex-col rounded-xl border border-white/10 bg-gradient-to-br from-slate-950/85 via-slate-900/80 to-gray-900/80 p-4 backdrop-blur">
            <div className="mb-3 flex items-center gap-2 text-base font-bold text-white">
              📈 Live Price Action
            </div>
            <div
              ref={chartContainerRef}
              className="relative h-[350px] overflow-hidden rounded-lg bg-black/30"
            >
              <canvas ref={canvasRef} className="h-full w-full" />
              <div className="pointer-events-none absolute left-3 top-3 z-10 rounded-lg bg-black/80 px-3 py-1.5 text-xl font-extrabold backdrop-blur-sm">
                {formatCurrency(state.currentPrice)}
              </div>
              <div className="absolute bottom-2 left-2 right-2 z-10 flex gap-1.5">
                <button
                  className="flex-1 rounded-md border border-white/20 bg-white/10 px-2 py-1.5 text-[10px] font-medium transition hover:border-red-400 hover:bg-white/20"
                  onClick={() => onTriggerScenario('drift')}
                >
                  📉 Slow Drift
                </button>
                <button
                  className="flex-1 rounded-md border border-white/20 bg-white/10 px-2 py-1.5 text-[10px] font-medium transition hover:border-red-400 hover:bg-white/20"
                  onClick={() => onTriggerScenario('rally')}
                >
                  📈 Bull Rally
                </button>
                <button
                  className="flex-1 rounded-md border border-white/20 bg-white/10 px-2 py-1.5 text-[10px] font-medium transition hover:border-red-400 hover:bg-white/20"
                  onClick={() => onTriggerScenario('squeeze')}
                >
                  🚀 SQUEEZE
                </button>
                <button
                  className="flex-1 rounded-md border border-white/20 bg-white/10 px-2 py-1.5 text-[10px] font-medium transition hover:border-red-400 hover:bg-white/20"
                  onClick={() => onTriggerScenario('gap')}
                >
                  ⚡ Gap Up
                </button>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex h-[300px] flex-col rounded-xl border border-white/10 bg-gradient-to-br from-slate-950/85 via-slate-900/80 to-gray-900/80 p-4 backdrop-blur">
            <div className="mb-3 flex items-center gap-2 text-base font-bold text-white">
              💬 Trade Log & Violations
            </div>
            <div className="flex flex-1 flex-col gap-1.5 overflow-y-auto">
              <AnimatePresence initial={false}>
                {messages.map((m) => (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.25 }}
                    className={
                      'rounded-lg border-l-4 px-2.5 py-1.5 text-xs leading-relaxed ' +
                      (m.type === 'info'
                        ? 'border-cyan-400 bg-cyan-500/15 text-cyan-100'
                        : m.type === 'warning'
                        ? 'border-amber-400 bg-amber-500/15 text-amber-200'
                        : m.type === 'danger'
                        ? 'border-red-400 bg-red-500/15 text-red-300'
                        : 'border-green-400 bg-green-500/15 text-green-200')
                    }
                  >
                    {m.text}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Right column - Controls & Status */}
        <div className="flex flex-col gap-4">
          {/* Trade Setup */}
          <div className="flex flex-col rounded-xl border border-white/10 bg-gradient-to-br from-slate-950/85 via-slate-900/80 to-gray-900/80 p-4 backdrop-blur">
            <div className="mb-3 flex items-center gap-2 text-base font-bold text-white">
              🎯 Trade Setup
            </div>
            <div className="flex flex-col gap-2.5">
              {/* Account Size */}
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between text-xs text-zinc-400">
                  <span>Account Size</span>
                  <span className="font-bold text-red-300">
                    ${inputs.accountSize.toLocaleString()}
                  </span>
                </div>
                <input
                  type="number"
                  className="w-full rounded-lg border border-white/20 bg-white/5 px-2 py-1.5 text-sm text-white outline-none transition focus:border-red-400 focus:bg-white/10"
                  min={10000}
                  max={1_000_000}
                  step={10000}
                  value={inputs.accountSize}
                  onChange={(e) =>
                    onInputChange('accountSize', Number(e.target.value))
                  }
                />
              </div>

              {/* Entry Price */}
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between text-xs text-zinc-400">
                  <span>Entry Price</span>
                  <span className="font-bold text-red-300">
                    ${inputs.entryPrice.toFixed(2)}
                  </span>
                </div>
                <input
                  type="number"
                  className="w-full rounded-lg border border-white/20 bg-white/5 px-2 py-1.5 text-sm text-white outline-none transition focus:border-red-400 focus:bg-white/10"
                  min={10}
                  max={500}
                  step={0.5}
                  value={inputs.entryPrice}
                  onChange={(e) =>
                    onInputChange('entryPrice', Number(e.target.value))
                  }
                />
              </div>

              {/* Shares */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-xs text-zinc-400">
                  <span>Number of Shares</span>
                  <span className="font-bold text-red-300">
                    {inputs.shares}
                  </span>
                </div>
                <input
                  type="range"
                  min={100}
                  max={2000}
                  step={100}
                  value={inputs.shares}
                  onChange={(e) =>
                    onInputChange('shares', Number(e.target.value))
                  }
                  className="h-2 cursor-pointer appearance-none rounded-full bg-white/20 accent-red-500"
                />
              </div>

              {/* Stop Loss */}
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between text-xs text-zinc-400">
                  <span>Stop Loss Price</span>
                  <span className="font-bold text-red-300">
                    ${inputs.stopLoss.toFixed(2)}
                  </span>
                </div>
                <input
                  type="number"
                  className="w-full rounded-lg border border-white/20 bg-white/5 px-2 py-1.5 text-sm text-white outline-none transition focus:border-red-400 focus:bg-white/10"
                  min={10}
                  max={500}
                  step={0.5}
                  value={inputs.stopLoss}
                  onChange={(e) =>
                    onInputChange('stopLoss', Number(e.target.value))
                  }
                />
              </div>

              {/* Risk box */}
              <div className="rounded-lg border border-cyan-500/40 bg-cyan-500/10 p-2.5 text-[11px] leading-relaxed text-cyan-100">
                <div className="mb-1 font-semibold text-cyan-200">
                  ⚡ Risk Calculation:
                </div>
                <div>
                  Position Size: ${riskCalcs.positionSize.toLocaleString()}
                </div>
                <div>Risk/Share: ${riskCalcs.riskPerShare.toFixed(2)}</div>
                <div>Total Risk: ${riskCalcs.totalRisk.toLocaleString()}</div>
                <div className="mt-0.5">
                  Risk % of Account:{' '}
                  <span
                    className={
                      riskCalcs.riskPct > 2
                        ? 'font-bold text-red-400'
                        : 'font-bold text-green-400'
                    }
                  >
                    {riskCalcs.riskPct.toFixed(1)}%
                  </span>
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  className="flex-1 rounded-lg bg-gradient-to-br from-red-500 to-red-700 px-3 py-2 text-xs font-bold uppercase tracking-wide text-white shadow-lg transition hover:-translate-y-0.5 hover:shadow-red-500/40 disabled:opacity-50 disabled:hover:translate-y-0"
                  onClick={onEnterShort}
                  disabled={
                    state.inPosition || state.tradeCount >= state.maxTrades
                  }
                >
                  🔻 SHORT
                </button>
                <button
                  className="flex-1 rounded-lg bg-gradient-to-br from-green-400 to-green-600 px-3 py-2 text-xs font-bold uppercase tracking-wide text-black shadow-lg transition hover:-translate-y-0.5 hover:shadow-green-400/40 disabled:opacity-50 disabled:hover:translate-y-0"
                  onClick={coverPosition}
                  disabled={!state.inPosition}
                >
                  ✅ COVER
                </button>
              </div>
              <div className="mt-2 flex justify-end">
                <button
                  className="rounded-lg border border-white/20 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/10"
                  onClick={onResetSession}
                >
                  ↺ Reset Session
                </button>
              </div>
            </div>
          </div>

          {/* Account Status */}
          <div className="flex flex-1 flex-col rounded-xl border border-white/10 bg-gradient-to-br from-slate-950/85 via-slate-900/80 to-gray-900/80 p-4 backdrop-blur">
            <div className="mb-3 flex items-center gap-2 text-base font-bold text-white">
              📊 Account Status
            </div>
            <div className="flex flex-1 flex-col rounded-lg border border-white/10 bg-black/40 p-3">
              <div className="flex items-center justify-between border-b border-white/5 py-1.5 text-xs">
                <span className="text-zinc-500">Account Balance</span>
                <span className="font-bold">
                  {formatCurrency(state.balance)}
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-white/5 py-1.5 text-xs">
                <span className="text-zinc-500">Position P/L</span>
                <span
                  className={
                    'font-bold ' +
                    (pnlInfo.pnl > 0
                      ? 'text-green-400'
                      : pnlInfo.pnl < 0
                      ? 'text-red-400'
                      : 'text-amber-300')
                  }
                >
                  {pnlInfo.pnl >= 0 ? '+' : ''}
                  {formatCurrency(pnlInfo.pnl)} ({pnlInfo.pnl >= 0 ? '+' : ''}
                  {pnlInfo.pnlPct.toFixed(2)}%)
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-white/5 py-1.5 text-xs">
                <span className="text-zinc-500">Closed P/L</span>
                <span
                  className={
                    'font-bold ' +
                    (state.lastClosedPnl > 0
                      ? 'text-green-400'
                      : state.lastClosedPnl < 0
                      ? 'text-red-400'
                      : 'text-amber-300')
                  }
                >
                  {state.lastClosedPnl >= 0 ? '+' : ''}
                  {formatCurrency(state.lastClosedPnl)}
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-white/5 py-1.5 text-xs">
                <span className="text-zinc-500">Entry Price</span>
                <span className="font-bold">
                  {state.entryPrice != null
                    ? formatCurrency(state.entryPrice)
                    : '-'}
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-white/5 py-1.5 text-xs">
                <span className="text-zinc-500">Current Price</span>
                <span className="font-bold">
                  {formatCurrency(state.currentPrice)}
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-white/5 py-1.5 text-xs">
                <span className="text-zinc-500">Cumulative Closed P/L</span>
                <span
                  className={
                    'font-bold ' +
                    (state.cumulativeClosedPnl > 0
                      ? 'text-green-400'
                      : state.cumulativeClosedPnl < 0
                      ? 'text-red-400'
                      : 'text-amber-300')
                  }
                >
                  {state.cumulativeClosedPnl >= 0 ? '+' : ''}
                  {formatCurrency(state.cumulativeClosedPnl)}
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-white/5 py-1.5 text-xs">
                <span className="text-zinc-500">Shares Short</span>
                <span className="font-bold">{state.shares}</span>
              </div>
              <div className="flex items-center justify-between py-1.5 text-xs">
                <span className="text-zinc-500">Stop Loss</span>
                <span className="font-bold">
                  {state.stopLoss != null
                    ? formatCurrency(state.stopLoss)
                    : '-'}
                </span>
              </div>
              <div className="mt-2 flex items-center justify-between rounded-md bg-white/5 px-2 py-1.5 text-[11px]">
                <span className="text-zinc-400">Trades</span>
                <span className="font-semibold text-white">
                  {state.tradeCount} / {state.maxTrades}
                </span>
              </div>
            </div>

            {/* Margin health */}
            <div className="mt-auto pt-3">
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3">
                <div className="mb-2 text-center text-[10px] font-bold uppercase tracking-wide text-red-300">
                  ⚠️ Margin Health
                </div>
                <div className="h-6 w-full overflow-hidden rounded-full bg-black/50">
                  <motion.div
                    className={
                      'flex h-full items-center justify-center text-[10px] font-bold ' +
                      (marginInfo.category === 'HEALTHY'
                        ? 'bg-gradient-to-r from-green-400 to-green-300 text-black'
                        : marginInfo.category === 'WARNING'
                        ? 'bg-gradient-to-r from-yellow-300 to-amber-500 text-black'
                        : 'bg-gradient-to-r from-amber-500 to-red-600 text-white')
                    }
                    animate={{ width: `${marginInfo.widthPct}%` }}
                    transition={{ type: 'spring', stiffness: 120, damping: 20 }}
                  >
                    {marginInfo.category}
                  </motion.div>
                </div>
              </div>

              {/* Emotion meter */}
              <div className="mt-3 rounded-lg bg-black/40 p-3">
                <div className="mb-2 text-center text-[10px] font-bold uppercase tracking-wide text-zinc-400">
                  😰 Psychological Pressure
                </div>
                <div className="h-8 w-full overflow-hidden rounded-full bg-white/10">
                  <motion.div
                    className={`flex h-full items-center justify-center text-xs font-bold ${emotionInfo.className}`}
                    animate={{ width: `${emotionInfo.widthPct}%` }}
                    transition={{ duration: 0.4 }}
                  >
                    {emotionInfo.label}
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Margin Call Modal */}
      <AnimatePresence>
        {showMarginModal && state.entryPrice != null && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="max-w-md rounded-xl border-2 border-red-500 bg-gradient-to-br from-[#1a1a2e] to-[#2a1a1a] p-6"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
            >
              <div className="mb-3 text-center text-2xl font-bold text-red-400">
                🚨 MARGIN CALL TRIGGERED
              </div>
              <div className="mb-4 text-sm leading-7 text-zinc-200">
                <p className="font-semibold">
                  Your account equity has fallen below minimum margin
                  requirements.
                </p>
                <p className="mt-2">
                  When your losses become too large relative to your account
                  size, brokers are legally required to liquidate your position
                  to prevent you from owing them money.
                </p>
              </div>
              <div className="mb-4 rounded-md bg-black/40 p-4">
                <div className="flex items-center justify-between border-b border-white/10 py-2 text-sm">
                  <span>Entry Price:</span>
                  <span>{formatCurrency(state.entryPrice)}</span>
                </div>
                <div className="flex items-center justify-between border-b border-white/10 py-2 text-sm">
                  <span>Liquidation Price:</span>
                  <span>{formatCurrency(state.currentPrice)}</span>
                </div>
                <div className="flex items-center justify-between py-2 text-sm">
                  <span>Loss:</span>
                  <span className="font-bold text-red-400">
                    -
                    {formatCurrency(
                      (state.currentPrice - state.entryPrice) * state.shares
                    )}
                  </span>
                </div>
              </div>
              <p className="mb-4 text-sm text-red-300">
                This is why position sizing and stop losses are NON-NEGOTIABLE
                in short selling.
              </p>
              <div className="flex justify-center">
                <button
                  className="rounded-md bg-gradient-to-br from-red-500 to-red-700 px-4 py-2 font-bold text-white shadow hover:-translate-y-0.5 hover:shadow-red-500/40"
                  onClick={() => setShowMarginModal(false)}
                >
                  I Understand
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
