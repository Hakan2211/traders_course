import React from 'react'

interface ProgressBarProps {
  progress: number
}

const ProgressBar: React.FC<ProgressBarProps> = ({ progress }) => {
  return (
    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden mb-8">
      <div
        className="h-full bg-linear-to-r from-blue-500 to-emerald-500 transition-all duration-700 ease-out shadow-[0_0_10px_rgba(59,130,246,0.5)]"
        style={{ width: `${progress}%` }}
      ></div>
    </div>
  )
}

export default ProgressBar
