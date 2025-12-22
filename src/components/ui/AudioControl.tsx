import React from 'react'
import { motion } from 'framer-motion'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useAudio } from '@/context/AudioContext'

interface AudioControlProps {
  className?: string
}

export const AudioControl: React.FC<AudioControlProps> = ({
  className = '',
}) => {
  const { isPlaying, toggleAudio, isOnAllowedRoute } = useAudio()

  // Don't render if not on an allowed route (e.g., landing page)
  if (!isOnAllowedRoute) {
    return null
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={toggleAudio}
            className={`cursor-pointer flex items-center justify-center gap-3 p-2 rounded-full transition-all group ${className}`}
          >
            {/* Visualizer */}
            <div className="flex items-center gap-[3px] h-4 overflow-hidden">
              {[1, 2, 3, 4].map((bar) => (
                <motion.div
                  key={bar}
                  className={`w-[2px] rounded-full transition-colors ${
                    isPlaying ? 'bg-[#B0811C]' : 'bg-zinc-400'
                  }`}
                  animate={{
                    height: isPlaying ? [4, 16, 6, 12, 4] : [4, 8, 4],
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    repeatType: 'reverse',
                    ease: 'easeInOut',
                    delay: bar * 0.15,
                  }}
                  style={{ height: 4 }}
                />
              ))}
            </div>
          </button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{isPlaying ? 'Pause music' : 'Play music'}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
