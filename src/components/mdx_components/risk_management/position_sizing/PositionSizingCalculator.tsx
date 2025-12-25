import React, { useState, useEffect, useMemo } from 'react'
import {
  CalculatorMode,
  CalculatorState,
  CalculationResult,
  RiskScoreItem,
  PortfolioItem,
} from '../types'
import { RiskGauge } from './RiskGauge'
import {
  LucideShield,
  LucideAlertTriangle,
  LucideSkull,
  LucideCheckCircle,
  LucideCalculator,
  LucideTrendingUp,
  LucideActivity,
  LucideList,
} from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

// --- Constants ---
const INITIAL_STATE: CalculatorState = {
  accountSize: 10000,
  riskPercent: 1.0,
  entryPrice: 150,
  stopLoss: 145,
  atrValue: 2.5,
  atrMultiplier: 2,
  winRate: 50,
  rewardRatio: 2,
  kellyFraction: 0.25,
  riskScore: 1.0,
}

const RISK_CHECKLIST_ITEMS: RiskScoreItem[] = [
  { id: '1', label: 'Trend Aligned (Daily)', checked: true, points: 1 },
  { id: '2', label: 'Key Support/Resistance', checked: true, points: 1 },
  { id: '3', label: 'Volume Confirmation', checked: false, points: 1 },
  { id: '4', label: 'Risk/Reward > 1:2', checked: true, points: 1 },
  { id: '5', label: 'Market Sentiment', checked: false, points: 1 },
]

export const PositionSizingCalculator: React.FC = () => {
  const [mode, setMode] = useState<CalculatorMode>('BASIC')
  const [inputs, setInputs] = useState<CalculatorState>(INITIAL_STATE)
  const [checklist, setChecklist] =
    useState<RiskScoreItem[]>(RISK_CHECKLIST_ITEMS)
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([])

  // Update inputs helper
  const updateInput = (key: keyof CalculatorState, value: number) => {
    setInputs((prev) => ({ ...prev, [key]: value }))
  }

  // Toggle checklist item
  const toggleChecklist = (id: string) => {
    setChecklist((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item,
      ),
    )
  }

  // --- Logic ---

  // Calculate Risk Score Multiplier
  const riskScoreMultiplier = useMemo(() => {
    const totalPoints = checklist.length
    const checkedPoints = checklist.filter((i) => i.checked).length
    const ratio = checkedPoints / totalPoints

    // Simple grading logic
    if (ratio >= 0.8) return 1.0 // A Grade
    if (ratio >= 0.6) return 0.75 // B Grade
    if (ratio >= 0.4) return 0.5 // C Grade
    return 0.0 // D Grade
  }, [checklist])

  // Main Calculation Effect
  const result: CalculationResult = useMemo(() => {
    let effectiveRiskPercent = inputs.riskPercent
    let stopDistance = Math.abs(inputs.entryPrice - inputs.stopLoss)

    // Mode Overrides
    if (mode === 'ATR') {
      stopDistance = inputs.atrValue * inputs.atrMultiplier
      // In ATR mode, stop loss visual is derived, but calculation uses distance
    } else if (mode === 'KELLY') {
      const w = inputs.winRate / 100
      const r = inputs.rewardRatio
      // Kelly % = W - (1-W)/R
      const fullKelly = w - (1 - w) / r
      // Ensure not negative
      const k = Math.max(0, fullKelly) * 100
      effectiveRiskPercent = k * inputs.kellyFraction
    } else if (mode === 'SCORE') {
      effectiveRiskPercent = inputs.riskPercent * riskScoreMultiplier
    }

    const riskAmount = inputs.accountSize * (effectiveRiskPercent / 100)

    // Avoid division by zero
    const positionSize =
      stopDistance > 0 ? Math.floor(riskAmount / stopDistance) : 0
    const totalPositionValue = positionSize * inputs.entryPrice
    const leverageUsed =
      inputs.accountSize > 0 ? totalPositionValue / inputs.accountSize : 0

    let riskLevel: CalculationResult['riskLevel'] = 'SAFE'
    let message = 'Professional risk management.'

    if (effectiveRiskPercent > 10) {
      riskLevel = 'RUIN'
      message = 'IMMINENT ACCOUNT DESTRUCTION.'
    } else if (effectiveRiskPercent > 5) {
      if (mode === 'KELLY') {
        riskLevel = 'AGGRESSIVE'
        message = 'Kelly Optimal: High growth, high volatility.'
      } else if (mode === 'SCORE') {
        riskLevel = 'AGGRESSIVE'
        message = 'High conviction setup. Ensure risk is accepted.'
      } else {
        riskLevel = 'DANGER'
        message = 'High risk of ruin. Reduce immediately.'
      }
    } else if (effectiveRiskPercent > 2) {
      riskLevel = 'CAUTION'
      message = 'Elevated risk. Drawdowns will be painful.'
    }

    return {
      riskAmount,
      positionSize,
      totalPositionValue,
      leverageUsed,
      stopDistance,
      riskLevel,
      message,
    }
  }, [inputs, mode, checklist, riskScoreMultiplier])

  // Portfolio Heat Calculation
  const currentHeat = portfolio.reduce((sum, item) => sum + item.percentRisk, 0)
  const projectedHeat =
    currentHeat + (result.riskAmount / inputs.accountSize) * 100

  // Chart Data (Drawdown Simulation)
  const chartData = useMemo(() => {
    const data = []
    let balance = inputs.accountSize
    const riskP = result.riskAmount / inputs.accountSize

    // Simulate 10 consecutive losses
    for (let i = 0; i <= 10; i++) {
      data.push({
        trade: i,
        balance: Math.round(balance),
      })
      balance = balance - balance * riskP
    }
    return data
  }, [inputs.accountSize, result.riskAmount])

  // --- Render Helpers ---

  const renderModeTabs = () => (
    <div className="flex space-x-1 bg-gray-900 p-1 rounded-lg mb-6">
      {(['BASIC', 'ATR', 'KELLY', 'SCORE'] as CalculatorMode[]).map((m) => (
        <button
          key={m}
          onClick={() => setMode(m)}
          className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${
            mode === m
              ? 'bg-blue-600 text-white shadow-lg'
              : 'text-gray-400 hover:text-white hover:bg-gray-800'
          }`}
        >
          {m}
        </button>
      ))}
    </div>
  )

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'SAFE':
        return 'text-green-500'
      case 'CAUTION':
        return 'text-yellow-500'
      case 'DANGER':
        return 'text-red-500'
      case 'RUIN':
        return 'text-red-600 animate-pulse'
      case 'AGGRESSIVE':
        return 'text-purple-500'
      default:
        return 'text-gray-500'
    }
  }

  const addTradeToPortfolio = () => {
    if (projectedHeat > 10) return // Prevent suicide
    const newItem: PortfolioItem = {
      id: Date.now().toString(),
      symbol: `Trade ${portfolio.length + 1}`,
      riskAmount: result.riskAmount,
      percentRisk: (result.riskAmount / inputs.accountSize) * 100,
    }
    setPortfolio([...portfolio, newItem])
  }

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl shadow-2xl overflow-hidden flex flex-col">
      {/* Header */}
      <div className="bg-gray-900 px-6 py-4 border-b border-gray-700 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <LucideShield className="w-5 h-5 text-blue-500" />
          <h3 className="font-bold text-gray-100 tracking-wider text-sm">
            FORTRESS CALCULATOR
          </h3>
        </div>
        <span className="text-xs text-gray-500 font-mono">v1.0</span>
      </div>

      <div className="p-6">
        {renderModeTabs()}

        {/* INPUTS */}
        <div className="space-y-4 mb-8">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-xs text-gray-400 uppercase font-bold">
                Account Size ($)
              </label>
              <input
                type="number"
                value={inputs.accountSize}
                onChange={(e) =>
                  updateInput('accountSize', Number(e.target.value))
                }
                className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white focus:border-blue-500 focus:outline-none font-mono"
              />
            </div>

            {mode !== 'KELLY' && mode !== 'SCORE' && (
              <div className="col-span-2">
                <label className="text-xs text-gray-400 uppercase font-bold">
                  Risk % Per Trade
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={inputs.riskPercent}
                  onChange={(e) =>
                    updateInput('riskPercent', Number(e.target.value))
                  }
                  className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white focus:border-blue-500 focus:outline-none font-mono"
                />
              </div>
            )}

            <div>
              <label className="text-xs text-gray-400 uppercase font-bold">
                Entry Price
              </label>
              <input
                type="number"
                value={inputs.entryPrice}
                onChange={(e) =>
                  updateInput('entryPrice', Number(e.target.value))
                }
                className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white focus:border-blue-500 focus:outline-none font-mono"
              />
            </div>

            {mode === 'BASIC' || mode === 'KELLY' || mode === 'SCORE' ? (
              <div>
                <label className="text-xs text-gray-400 uppercase font-bold">
                  Stop Price
                </label>
                <input
                  type="number"
                  value={inputs.stopLoss}
                  onChange={(e) =>
                    updateInput('stopLoss', Number(e.target.value))
                  }
                  className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white focus:border-blue-500 focus:outline-none font-mono"
                />
              </div>
            ) : (
              // ATR INPUTS
              <>
                <div>
                  <label className="text-xs text-gray-400 uppercase font-bold">
                    ATR Value
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    value={inputs.atrValue}
                    onChange={(e) =>
                      updateInput('atrValue', Number(e.target.value))
                    }
                    className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white focus:border-blue-500 focus:outline-none font-mono"
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-gray-400 uppercase font-bold">
                    ATR Multiplier (x{inputs.atrMultiplier})
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    step="0.5"
                    value={inputs.atrMultiplier}
                    onChange={(e) =>
                      updateInput('atrMultiplier', Number(e.target.value))
                    }
                    className="w-full"
                  />
                </div>
              </>
            )}

            {/* KELLY INPUTS */}
            {mode === 'KELLY' && (
              <>
                <div>
                  <label className="text-xs text-gray-400 uppercase font-bold">
                    Win Rate (%)
                  </label>
                  <input
                    type="number"
                    value={inputs.winRate}
                    onChange={(e) =>
                      updateInput('winRate', Number(e.target.value))
                    }
                    className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white focus:border-blue-500 focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 uppercase font-bold">
                    R:R Ratio (1:?)
                  </label>
                  <input
                    type="number"
                    value={inputs.rewardRatio}
                    onChange={(e) =>
                      updateInput('rewardRatio', Number(e.target.value))
                    }
                    className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white focus:border-blue-500 focus:outline-none font-mono"
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-gray-400 uppercase font-bold">
                    Kelly Fraction
                  </label>
                  <div className="flex space-x-2 mt-1">
                    {[0.5, 0.25, 0.125].map((f) => (
                      <button
                        key={f}
                        onClick={() => updateInput('kellyFraction', f)}
                        className={`px-3 py-1 text-xs rounded border ${
                          inputs.kellyFraction === f
                            ? 'bg-blue-600 border-blue-500'
                            : 'border-gray-600 hover:bg-gray-800'
                        }`}
                      >
                        1/{1 / f}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* SCORE INPUTS */}
            {mode === 'SCORE' && (
              <div className="col-span-2 bg-gray-900 p-3 rounded border border-gray-700">
                <label className="text-xs text-gray-400 uppercase font-bold block mb-2">
                  Setup Checklist
                </label>
                {checklist.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center space-x-2 mb-2"
                  >
                    <input
                      type="checkbox"
                      checked={item.checked}
                      onChange={() => toggleChecklist(item.id)}
                      className="accent-blue-500 w-4 h-4 rounded cursor-pointer"
                    />
                    <span className="text-sm text-gray-300">{item.label}</span>
                  </div>
                ))}
                <div className="mt-2 text-right text-xs font-mono">
                  Grade Score:{' '}
                  <span
                    className={
                      riskScoreMultiplier >= 0.75
                        ? 'text-green-400'
                        : 'text-yellow-400'
                    }
                  >
                    {(riskScoreMultiplier * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RISK GAUGE */}
        <div className="mb-6 bg-gray-900 rounded-lg p-4 border border-gray-700 shadow-inner">
          <RiskGauge
            riskPercent={(result.riskAmount / inputs.accountSize) * 100}
            customStatus={
              result.riskLevel === 'AGGRESSIVE'
                ? { label: 'AGGRESSIVE', color: '#a855f7' }
                : undefined
            }
          />
        </div>

        {/* RESULTS CARD */}
        <div
          className={`p-4 rounded-lg border-l-4 mb-6 ${
            result.riskLevel === 'SAFE'
              ? 'bg-green-900/20 border-green-500'
              : result.riskLevel === 'CAUTION'
                ? 'bg-yellow-900/20 border-yellow-500'
                : result.riskLevel === 'AGGRESSIVE'
                  ? 'bg-purple-900/20 border-purple-500'
                  : 'bg-red-900/20 border-red-500'
          }`}
        >
          <h4
            className={`text-sm font-bold uppercase mb-1 ${getRiskColor(
              result.riskLevel,
            )} flex items-center`}
          >
            {result.riskLevel === 'SAFE' && (
              <LucideCheckCircle className="w-4 h-4 mr-2" />
            )}
            {result.riskLevel === 'CAUTION' && (
              <LucideAlertTriangle className="w-4 h-4 mr-2" />
            )}
            {(result.riskLevel === 'DANGER' || result.riskLevel === 'RUIN') && (
              <LucideSkull className="w-4 h-4 mr-2" />
            )}
            {result.riskLevel === 'AGGRESSIVE' && (
              <LucideTrendingUp className="w-4 h-4 mr-2" />
            )}
            {result.riskLevel} LEVEL
          </h4>
          <p className="text-xs text-gray-400 mb-4">{result.message}</p>

          <div className="grid grid-cols-2 gap-y-4 font-mono text-sm">
            <div>
              <span className="text-gray-500 block text-xs uppercase">
                Position Size
              </span>
              <span className="text-xl font-bold text-white">
                {result.positionSize}
              </span>{' '}
              <span className="text-xs text-gray-500">units</span>
            </div>
            <div>
              <span className="text-gray-500 block text-xs uppercase">
                Risk Amount
              </span>
              <span className="text-xl font-bold text-white">
                ${result.riskAmount.toFixed(2)}
              </span>
            </div>
            <div>
              <span className="text-gray-500 block text-xs uppercase">
                Total Value
              </span>
              <span className="text-white">
                ${result.totalPositionValue.toLocaleString()}
              </span>
            </div>
            <div>
              <span className="text-gray-500 block text-xs uppercase">
                Leverage
              </span>
              <span className="text-white">
                {result.leverageUsed.toFixed(1)}x
              </span>
            </div>
          </div>
        </div>

        {/* DRAWDOWN SIMULATION CHART */}
        <div className="mb-6">
          <h4 className="text-xs font-bold text-gray-500 uppercase mb-2 flex items-center">
            <LucideTrendingUp className="w-4 h-4 mr-1" /> 10-Loss Simulation
          </h4>
          <div className="h-24 w-full bg-gray-900 rounded border border-gray-700 pt-2 pr-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <XAxis dataKey="trade" hide />
                <YAxis domain={['auto', 'auto']} hide />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    fontSize: '12px',
                  }}
                  itemStyle={{ color: '#e2e8f0' }}
                  formatter={(value: number) => [
                    `$${value.toLocaleString()}`,
                    'Balance',
                  ]}
                  labelFormatter={(label) => `Loss #${label}`}
                />
                <Line
                  type="monotone"
                  dataKey="balance"
                  stroke={result.riskLevel === 'SAFE' ? '#22c55e' : '#ef4444'}
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[10px] text-gray-500 mt-1 italic text-center">
            Projected balance after 10 consecutive losses
          </p>
        </div>

        {/* PORTFOLIO HEAT */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-xs font-bold text-gray-500 uppercase flex items-center">
              <LucideActivity className="w-4 h-4 mr-1" /> Portfolio Heat
            </h4>
            <span
              className={`text-xs font-mono font-bold ${
                projectedHeat > 10
                  ? 'text-red-500'
                  : projectedHeat > 6
                    ? 'text-yellow-500'
                    : 'text-blue-500'
              }`}
            >
              {projectedHeat.toFixed(2)}% / 10%
            </span>
          </div>

          {/* Heat Bar */}
          <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden flex">
            <div
              className="h-full bg-blue-600 opacity-60"
              style={{ width: `${Math.min(currentHeat, 100) * 10}%` }} // Multiply by 10 because scale is 0-10%
            ></div>
            <div
              className={`h-full ${
                projectedHeat > 10 ? 'bg-red-500' : 'bg-blue-400'
              } animate-pulse`}
              style={{
                width: `${
                  Math.min(
                    (result.riskAmount / inputs.accountSize) * 100,
                    100,
                  ) * 10
                }%`,
              }}
            ></div>
          </div>
          <button
            onClick={addTradeToPortfolio}
            disabled={projectedHeat > 10}
            className="w-full mt-3 py-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-bold uppercase rounded text-gray-200 transition-colors flex items-center justify-center"
          >
            <LucideList className="w-3 h-3 mr-2" /> Add To Heat Tracker
          </button>
        </div>
      </div>
    </div>
  )
}
