import React, { useState, useEffect, useRef } from 'react'
import { GameScene } from './GameScene'
import { performFlip, formatMoney } from './logic'
import { GameState, CONSTANTS, FlipResult } from './types'
import { CanvasWrapper } from '@/components/mdx_components/canvas3d/canvasWrapper'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Card } from '@/components/ui/card'
import { Play, RotateCcw } from 'lucide-react'

export const CoinFlipGame = () => {
  const [gameState, setGameState] = useState<GameState>({
    capital: CONSTANTS.STARTING_CAPITAL,
    betSize: 100,
    history: [],
    isFlipping: false,
    flipsRemaining: 100, // Optional limit
    expectedArithmetic: CONSTANTS.STARTING_CAPITAL,
    gameStatus: 'idle',
  })

  const [lastResult, setLastResult] = useState<FlipResult | null>(null)

  const handleFlip = () => {
    if (gameState.isFlipping || gameState.capital <= 0) return

    // Start Flip Animation
    setGameState((prev) => ({
      ...prev,
      isFlipping: true,
      gameStatus: 'playing',
    }))

    // Calculate result immediately but wait to show it
    const nextId = gameState.history.length + 1
    const result = performFlip(
      gameState.capital,
      gameState.betSize,
      gameState.expectedArithmetic,
      nextId,
    )

    // Wait for animation
    setTimeout(() => {
      setLastResult(result)
      setGameState((prev) => ({
        ...prev,
        capital: result.capitalAfter,
        expectedArithmetic: result.expectedArithmetic,
        history: [...prev.history, result],
        isFlipping: false,
        flipsRemaining: prev.flipsRemaining - 1,
      }))
    }, CONSTANTS.ANIMATION_DURATION_MS)
  }

  const resetGame = () => {
    setGameState({
      capital: CONSTANTS.STARTING_CAPITAL,
      betSize: 100,
      history: [],
      isFlipping: false,
      flipsRemaining: 100,
      expectedArithmetic: CONSTANTS.STARTING_CAPITAL,
      gameStatus: 'idle',
    })
    setLastResult(null)
  }

  const handleBetSizeChange = (value: number[]) => {
    setGameState((prev) => ({ ...prev, betSize: value[0] }))
  }

  return (
    <div className="flex flex-col space-y-6 my-8">
      <div className="flex flex-col md:flex-row gap-6">
        {/* 3D Scene */}
        <div className="w-full md:w-2/3 h-[500px]">
          <CanvasWrapper
            height="100%"
            cameraSettings={{ position: [0, 3, 10], fov: 45 }}
            enableControls={true}
            enableEnvironment={false}
          >
            <GameScene gameState={gameState} currentResult={lastResult} />
          </CanvasWrapper>
        </div>

        {/* Controls & Stats */}
        <div className="w-full md:w-1/3 space-y-4">
          <Card className="p-6 bg-slate-900 border-slate-800 text-slate-100">
            <h3 className="text-xl font-bold mb-4 text-emerald-400">
              Control Panel
            </h3>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-slate-400">
                    Bet Size (% of Capital)
                  </span>
                  <span className="font-mono font-bold text-emerald-400">
                    {gameState.betSize}%
                  </span>
                </div>
                <Slider
                  value={[gameState.betSize]}
                  min={1}
                  max={100}
                  step={1}
                  onValueChange={handleBetSizeChange}
                  disabled={gameState.isFlipping}
                  className="py-2"
                />
              </div>

              <div className="pt-2">
                <Button
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-6 text-lg"
                  onClick={handleFlip}
                  disabled={gameState.isFlipping || gameState.capital <= 1}
                >
                  {gameState.isFlipping ? 'Flipping...' : 'FLIP COIN'}
                  {!gameState.isFlipping && <Play className="ml-2 h-5 w-5" />}
                </Button>
              </div>

              <div className="pt-2">
                <Button
                  variant="outline"
                  className="w-full border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800"
                  onClick={resetGame}
                >
                  <RotateCcw className="mr-2 h-4 w-4" /> Reset Game
                </Button>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-slate-900 border-slate-800 text-slate-100">
            <h3 className="text-xl font-bold mb-4 text-blue-400">Stats</h3>

            <div className="space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                <span className="text-sm text-slate-400">Current Capital</span>
                <span
                  className={`font-mono font-bold text-lg ${
                    gameState.capital >= CONSTANTS.STARTING_CAPITAL
                      ? 'text-green-400'
                      : 'text-red-400'
                  }`}
                >
                  {formatMoney(gameState.capital)}
                </span>
              </div>

              <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                <span className="text-sm text-slate-400">
                  Linear Expectation
                </span>
                <span className="font-mono text-slate-300">
                  {formatMoney(gameState.expectedArithmetic)}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400">Flip #</span>
                <span className="font-mono text-slate-300">
                  {gameState.history.length}
                </span>
              </div>

              {lastResult && (
                <div
                  className={`mt-4 p-3 rounded bg-opacity-20 text-center font-bold ${
                    lastResult.isWin
                      ? 'bg-green-500 text-green-400'
                      : 'bg-red-500 text-red-400'
                  }`}
                >
                  {lastResult.isWin ? 'WIN +50%' : 'LOSS -40%'}
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* History Log */}
      {gameState.history.length > 0 && (
        <Card className="p-4 bg-slate-950 border-slate-800 max-h-48 overflow-y-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase border-b border-slate-800">
              <tr>
                <th className="px-2 py-1">#</th>
                <th className="px-2 py-1">Outcome</th>
                <th className="px-2 py-1">Bet Size</th>
                <th className="px-2 py-1 text-right">Result</th>
                <th className="px-2 py-1 text-right">Balance</th>
              </tr>
            </thead>
            <tbody className="text-slate-300">
              {gameState.history
                .slice()
                .reverse()
                .map((flip) => (
                  <tr
                    key={flip.id}
                    className="border-b border-slate-900 hover:bg-slate-900/50"
                  >
                    <td className="px-2 py-1 text-slate-500">{flip.id}</td>
                    <td
                      className={`px-2 py-1 font-bold ${
                        flip.isWin ? 'text-green-500' : 'text-red-500'
                      }`}
                    >
                      {flip.side}
                    </td>
                    <td className="px-2 py-1">{flip.betSize}%</td>
                    <td
                      className={`px-2 py-1 text-right ${
                        flip.isWin ? 'text-green-400' : 'text-red-400'
                      }`}
                    >
                      {flip.changePercent > 0 ? '+' : ''}
                      {flip.changePercent.toFixed(1)}%
                    </td>
                    <td className="px-2 py-1 text-right font-mono text-slate-400">
                      {formatMoney(flip.capitalAfter)}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  )
}
