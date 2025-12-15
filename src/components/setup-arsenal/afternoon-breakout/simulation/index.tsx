import React, { useState } from 'react'
import dynamic from '@/lib/dynamic'
import { SimulationMode } from './types'
import InfoPanel from './InfoPanel'
import { RefreshCw, Play, Pause } from 'lucide-react'

const P5Simulation = dynamic(() => import('./SimulationCanvas'), {
  ssr: false,
  loading: () => (
    <div className="h-[400px] w-[600px] bg-slate-900 rounded-xl flex items-center justify-center text-slate-500">
      Loading Physics Engine...
    </div>
  ),
})

const AfternoonSimulationContainer: React.FC = () => {
  const [mode, setMode] = useState<SimulationMode>('breakout')

  return (
    <div className="flex flex-col items-center w-full py-8">
      {/* Mode Switcher */}
      <div className="bg-slate-900 p-1.5 rounded-lg flex items-center border border-slate-700 mb-8 relative">
        <button
          onClick={() => setMode('breakout')}
          className={`relative z-10 px-6 py-2 rounded-md text-sm font-bold transition-all duration-300 ${
            mode === 'breakout'
              ? 'bg-blue-600 text-white shadow-lg'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Breakout Physics
        </button>
        <button
          onClick={() => setMode('fade')}
          className={`relative z-10 px-6 py-2 rounded-md text-sm font-bold transition-all duration-300 ${
            mode === 'fade'
              ? 'bg-red-600 text-white shadow-lg'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Fade Physics
        </button>
      </div>

      <P5Simulation mode={mode} />

      <InfoPanel mode={mode} />
    </div>
  )
}

export default AfternoonSimulationContainer
