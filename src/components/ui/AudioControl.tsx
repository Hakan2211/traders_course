import React, { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface AudioControlProps {
  src: string
  className?: string
}

export const AudioControl: React.FC<AudioControlProps> = ({
  src,
  className = '',
}) => {
  const [isPlaying, setIsPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    const attemptPlay = async () => {
      if (audioRef.current) {
        try {
          await audioRef.current.play()
          setIsPlaying(true)
        } catch (error) {
          console.log('Autoplay prevented by browser policy:', error)
          setIsPlaying(false)
        }
      }
    }

    attemptPlay()
  }, [])

  const toggleAudio = () => {
    if (!audioRef.current) return

    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play().catch((e) => {
        console.error('Audio playback failed:', e)
      })
    }
    setIsPlaying(!isPlaying)
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={toggleAudio}
            className={`cursor-pointer flex items-center justify-center gap-3 p-2 rounded-full transition-all group ${className}`}
          >
            <audio ref={audioRef} src={src} loop />

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
