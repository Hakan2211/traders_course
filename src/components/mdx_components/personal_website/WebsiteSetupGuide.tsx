import React, { useState } from 'react'
import StepCard from './StepCard'
import ProgressBar from './ProgressBar'
import { steps } from './data'

const WebsiteSetupGuide: React.FC = () => {
  const [completedSteps, setCompletedSteps] = useState<number[]>([])
  const [activeStepId, setActiveStepId] = useState<number>(1)

  const toggleStep = (id: number) => {
    setCompletedSteps((prev) => {
      if (prev.includes(id)) {
        return prev.filter((stepId) => stepId !== id)
      } else {
        return [...prev, id]
      }
    })
  }

  const progress = Math.round((completedSteps.length / steps.length) * 100)

  return (
    <div className="max-w-3xl mx-auto my-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Setup Progress</h2>
        <p className="text-slate-400 mb-4">
          Follow these steps to get your trading blog online.
        </p>
        <ProgressBar progress={progress} />
      </div>

      <div className="space-y-4">
        {steps.map((step) => (
          <StepCard
            key={step.id}
            step={step}
            isCompleted={completedSteps.includes(step.id)}
            isActive={activeStepId === step.id}
            onToggle={() => toggleStep(step.id)}
            onClick={() => setActiveStepId(step.id)}
          />
        ))}
      </div>

      {progress === 100 && (
        <div className="mt-8 p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-center animate-in fade-in zoom-in duration-500">
          <div className="text-4xl mb-3">🎉</div>
          <h3 className="text-xl font-bold text-emerald-400 mb-2">
            Congratulations!
          </h3>
          <p className="text-slate-300">
            You've successfully set up the foundation for your trading website.
            <br />
            Time to start documenting your journey!
          </p>
        </div>
      )}
    </div>
  )
}

export default WebsiteSetupGuide
