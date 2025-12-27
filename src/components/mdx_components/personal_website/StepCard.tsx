import React, { useState } from 'react'
import { Step } from './types'

interface StepCardProps {
  step: Step
  isCompleted: boolean
  isActive: boolean
  onToggle: () => void
  onClick: () => void
}

const StepCard: React.FC<StepCardProps> = ({
  step,
  isCompleted,
  isActive,
  onToggle,
  onClick,
}) => {
  const [copied, setCopied] = useState(false)

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (step.command) {
      navigator.clipboard.writeText(step.command)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleLinkClick = (e: React.MouseEvent) => {
    e.stopPropagation()
  }

  return (
    <div
      onClick={onClick}
      className={`relative group p-6 rounded-2xl border transition-all duration-300 cursor-pointer ${
        isActive
          ? 'bg-slate-900 border-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.1)]'
          : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
      } ${isCompleted ? 'opacity-80' : ''}`}
    >
      <div className="flex items-start gap-5">
        <div
          className={`shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-xl transition-colors ${
            isCompleted
              ? 'bg-emerald-500/20 text-emerald-400'
              : isActive
                ? 'bg-blue-500/20 text-blue-400'
                : 'bg-slate-800 text-slate-400'
          }`}
        >
          <i className={step.icon}></i>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h3
              className={`text-lg font-semibold truncate ${isActive ? 'text-white' : 'text-slate-300'}`}
            >
              {step.id}. {step.title}
            </h3>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onToggle()
              }}
              className={`shrink-0 w-6 h-6 rounded-full border flex items-center justify-center transition-all ${
                isCompleted
                  ? 'bg-emerald-500 border-emerald-500 text-white'
                  : 'border-slate-700 text-transparent hover:border-slate-500'
              }`}
            >
              <i className="fa-solid fa-check text-[10px]"></i>
            </button>
          </div>

          <p className="text-slate-400 text-sm leading-relaxed mb-4">
            {step.description}
          </p>

          {isActive && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
                {step.benefits.map((benefit, i) => (
                  <div
                    key={i}
                    className="flex items-center text-xs text-slate-500"
                  >
                    <i className="fa-solid fa-circle-check text-emerald-500/60 mr-2 text-[8px]"></i>
                    {benefit}
                  </div>
                ))}
              </div>

              {step.url && (
                <a
                  href={step.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleLinkClick}
                  className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors w-full sm:w-auto"
                >
                  Visit {new URL(step.url).hostname}
                  <i className="fa-solid fa-arrow-up-right-from-square ml-2 text-xs"></i>
                </a>
              )}

              {step.command && (
                <div className="mt-2">
                  <div className="flex items-center justify-between bg-black/40 rounded-lg p-3 border border-slate-800 group/code">
                    <code className="text-emerald-400 text-sm font-mono break-all">
                      {step.command}
                    </code>
                    <button
                      onClick={handleCopy}
                      className="ml-3 p-2 text-slate-500 hover:text-white transition-colors"
                      title="Copy to clipboard"
                    >
                      <i
                        className={`fa-solid ${copied ? 'fa-check text-emerald-500' : 'fa-copy'}`}
                      ></i>
                    </button>
                  </div>
                  {copied && (
                    <span className="text-[10px] text-emerald-500 mt-1 block font-medium">
                      Command copied!
                    </span>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default StepCard
