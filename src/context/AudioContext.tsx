import React, {
  createContext,
  useContext,
  useRef,
  useState,
  useEffect,
  useCallback,
} from 'react'
import { useRouterState } from '@tanstack/react-router'

interface AudioContextType {
  isPlaying: boolean
  toggleAudio: () => void
  isOnAllowedRoute: boolean
}

const AudioContext = createContext<AudioContextType | null>(null)

export const useAudio = () => {
  const context = useContext(AudioContext)
  if (!context) {
    throw new Error('useAudio must be used within an AudioProvider')
  }
  return context
}

interface AudioProviderProps {
  src: string
  allowedRoutes?: string[]
  children: React.ReactNode
}

export const AudioProvider: React.FC<AudioProviderProps> = ({
  src,
  allowedRoutes = ['/'],
  children,
}) => {
  const [isPlaying, setIsPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const wasPlayingBeforeLeaving = useRef(false)

  const routerState = useRouterState()
  const currentPath = routerState.location.pathname
  const isOnAllowedRoute = allowedRoutes.includes(currentPath)

  // Initialize audio element once
  useEffect(() => {
    const audio = new Audio(src)
    audio.loop = true
    audioRef.current = audio

    // Cleanup on unmount
    return () => {
      audio.pause()
      audio.src = ''
      audioRef.current = null
    }
  }, [src])

  // Handle route changes - play/pause based on allowed routes
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    if (isOnAllowedRoute) {
      // Coming back to an allowed route
      const savedPreference = localStorage.getItem('audio_preference')
      // If it's null (first visit) or 'true' (enabled), AND we weren't explicitly paused before
      const isEnabled = savedPreference === null || savedPreference === 'true'
      const shouldPlay =
        isEnabled &&
        (wasPlayingBeforeLeaving.current || savedPreference === 'true')

      if (shouldPlay && audio.paused) {
        audio
          .play()
          .then(() => setIsPlaying(true))
          .catch((error) => {
            console.log('Autoplay prevented by browser policy:', error)
            setIsPlaying(false)
          })
      }
    } else {
      // Leaving to a non-allowed route
      if (!audio.paused) {
        wasPlayingBeforeLeaving.current = true
        audio.pause()
        setIsPlaying(false)
      }
    }
  }, [isOnAllowedRoute])

  const toggleAudio = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying) {
      audio.pause()
      setIsPlaying(false)
      wasPlayingBeforeLeaving.current = false
      localStorage.setItem('audio_preference', 'false')
    } else {
      audio
        .play()
        .then(() => {
          setIsPlaying(true)
          wasPlayingBeforeLeaving.current = true
          localStorage.setItem('audio_preference', 'true')
        })
        .catch((e) => {
          console.error('Audio playback failed:', e)
          setIsPlaying(false)
        })
    }
  }, [isPlaying])

  return (
    <AudioContext.Provider value={{ isPlaying, toggleAudio, isOnAllowedRoute }}>
      {children}
    </AudioContext.Provider>
  )
}
