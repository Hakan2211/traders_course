import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn, formatTime } from '@/lib/utils'
import PlayIcon from '@/components/icons/playIcon'
import PauseIcon from '@/components/icons/pauseIcon'
import VolumeOnIcon from '@/components/icons/video/volumeIcon'
import VolumeOffIcon from '@/components/icons/video/volumeOffIcon'
import FastForwardIcon from '@/components/icons/video/fastForwardIcon'
import MinimizeIcon from '@/components/icons/video/minimizeIcon'
import MaximizeIcon from '@/components/icons/video/maximizeIcon'
import PictureInPictureIcon from '@/components/icons/video/pictureInPictureIcon'
import LoaderIcon from '@/components/icons/video/loaderIcon'

const debounce = (func: (...args: any[]) => void, wait: number) => {
  let timeout: NodeJS.Timeout | undefined
  return (...args: any[]) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

const controlsVariants = {
  hidden: {
    opacity: 0,
    y: 30,
    transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] as const },
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] as const },
  },
}

const playerVariants = {
  hidden: { opacity: 0, scale: 0.98 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.6, ease: [0.2, 0.8, 0.2, 1] as const },
  },
  hover: {
    scale: 1.015,
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
    transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] as const },
  },
}

interface VideoPlayerProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'onAnimationStart' | 'onDrag' | 'onDragEnd' | 'onDragStart'
> {
  src?: string
  poster?: string
  title?: string
  motionViewport?: { once?: boolean; amount?: number }
}

const VideoPlayerUI = React.forwardRef<HTMLDivElement, VideoPlayerProps>(
  (
    {
      className,
      src,
      poster,
      title,
      motionViewport = { once: true, amount: 0.3 },
      ...props
    },
    ref,
  ) => {
    const playerContainerRef = React.useRef<HTMLDivElement>(null)
    const videoRef = React.useRef<HTMLVideoElement>(null)
    const controlsTimeoutRef = React.useRef<NodeJS.Timeout | null>(null)

    const [isPlaying, setIsPlaying] = React.useState(false)
    const [duration, setDuration] = React.useState(0)
    const [currentTime, setCurrentTime] = React.useState(0)
    const [isSeeking, setIsSeeking] = React.useState(false)
    const [isLoaded, setIsLoaded] = React.useState(false)
    const [volume, setVolume] = React.useState(1)
    const [isMuted, setIsMuted] = React.useState(false)
    const [playbackRate, setPlaybackRate] = React.useState(1)
    const [isFullscreen, setIsFullscreen] = React.useState(false)
    const [showControls, setShowControls] = React.useState(true)
    const [isInteracting, setIsInteracting] = React.useState(false)
    const [isLoading, setIsLoading] = React.useState(true)

    const setVideoTime = React.useCallback(
      debounce(() => {
        const video = videoRef.current
        if (video && !isSeeking && isLoaded && isFinite(video.currentTime)) {
          setCurrentTime(video.currentTime)
        }
      }, 50),
      [isSeeking, isLoaded],
    )

    React.useEffect(() => {
      const video = videoRef.current
      if (!video) return

      const setVideoData = () => {
        if (isFinite(video.duration)) {
          setDuration(video.duration)
        }
        setCurrentTime(video.currentTime)
        setIsLoaded(true)
        setIsLoading(false)
      }

      const handleVideoEnd = () => {
        setIsPlaying(false)
        setShowControls(true)
      }

      const handlePlay = () => setIsPlaying(true)
      const handlePause = () => setIsPlaying(false)
      const handleVolumeChange = () => {
        setVolume(video.volume)
        setIsMuted(video.muted)
      }
      const handleRateChange = () => setPlaybackRate(video.playbackRate)
      const handleWaiting = () => setIsLoading(true)
      const handlePlaying = () => setIsLoading(false)
      const handleCanPlay = () => {
        if (!isLoaded && isFinite(video.duration)) setVideoData()
        setIsLoading(false)
      }

      const handleError = (e: Event) => {
        console.error('Video Error:', video.error, e)
        setIsLoading(false)
        // Optionally set an error state to display a message
        alert('Error loading video')
      }

      video.addEventListener('loadedmetadata', setVideoData)
      video.addEventListener('canplay', handleCanPlay)
      video.addEventListener('timeupdate', setVideoTime)
      video.addEventListener('ended', handleVideoEnd)
      video.addEventListener('play', handlePlay)
      video.addEventListener('pause', handlePause)
      video.addEventListener('volumechange', handleVolumeChange)
      video.addEventListener('ratechange', handleRateChange)
      video.addEventListener('seeked', () => setIsSeeking(false))
      video.addEventListener('waiting', handleWaiting)
      video.addEventListener('playing', handlePlaying)
      video.addEventListener('error', handleError)

      if (video.readyState >= 1) setVideoData()
      setVolume(video.volume)
      setIsMuted(video.muted)
      setPlaybackRate(video.playbackRate)
      setIsLoading(video.readyState < 3 && video.networkState === 2)

      const handleFullscreenChange = () => {
        setIsFullscreen(!!document.fullscreenElement)
      }
      document.addEventListener('fullscreenchange', handleFullscreenChange)

      return () => {
        video.removeEventListener('loadedmetadata', setVideoData)
        video.removeEventListener('canplay', handleCanPlay)
        video.removeEventListener('timeupdate', setVideoTime)
        video.removeEventListener('ended', handleVideoEnd)
        video.removeEventListener('play', handlePlay)
        video.removeEventListener('pause', handlePause)
        video.removeEventListener('volumechange', handleVolumeChange)
        video.removeEventListener('ratechange', handleRateChange)
        video.removeEventListener('seeked', () => setIsSeeking(false))
        video.removeEventListener('waiting', handleWaiting)
        video.removeEventListener('playing', handlePlaying)
        video.removeEventListener('error', handleError)
        document.removeEventListener('fullscreenchange', handleFullscreenChange)
        if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current)
      }
    }, [src, setVideoTime, isLoaded])

    React.useEffect(() => {
      const video = videoRef.current
      if (!video || !isLoaded) return
      if (isPlaying) {
        video.play().catch(() => setIsPlaying(false))
        hideControls()
      } else {
        video.pause()
        setShowControls(true)
      }
    }, [isPlaying, isLoaded])

    const hideControls = () => {
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current)
      controlsTimeoutRef.current = setTimeout(() => {
        if (!isInteracting && isPlaying) setShowControls(false)
      }, 2500)
    }

    const handleInteractionStart = () => {
      setIsInteracting(true)
      setShowControls(true)
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current)
    }

    const handleInteractionEnd = () => {
      setIsInteracting(false)
      if (isPlaying) hideControls()
    }

    const togglePlayPause = () => isLoaded && setIsPlaying((prev) => !prev)
    const handleSliderValueChange = (value: number[]) => {
      const newTime = value[0]
      if (isLoaded && videoRef.current && isFinite(newTime)) {
        setCurrentTime(newTime)
        if (!isSeeking) setIsSeeking(true)
      }
    }
    const handleSliderValueCommit = (value: number[]) => {
      const newTime = value[0]
      if (isLoaded && videoRef.current && isFinite(newTime)) {
        videoRef.current.currentTime = newTime
      }
    }
    const handleVolumeChange = (value: number[]) => {
      const newVolume = value[0]
      if (videoRef.current) {
        videoRef.current.volume = newVolume
        videoRef.current.muted = newVolume === 0
      }
    }
    const toggleMute = () => {
      if (videoRef.current) {
        videoRef.current.muted = !isMuted
        if (!videoRef.current.muted && videoRef.current.volume === 0) {
          videoRef.current.volume = 0.5
        }
      }
    }
    const handlePlaybackRateChange = (rate: number) => {
      if (videoRef.current) videoRef.current.playbackRate = rate
    }
    const toggleFullscreen = () => {
      const elem = playerContainerRef.current
      if (!elem) return
      if (!document.fullscreenElement) {
        elem.requestFullscreen()
      } else {
        document.exitFullscreen()
      }
    }
    const togglePictureInPicture = async () => {
      const video = videoRef.current
      if (!video || !document.pictureInPictureEnabled) return
      try {
        if (document.pictureInPictureElement === video) {
          await document.exitPictureInPicture()
        } else {
          await video.requestPictureInPicture()
        }
      } catch (error) {
        console.error('PiP Error:', error)
      }
    }

    const PlayPauseIcon = isPlaying ? PauseIcon : PlayIcon
    const VolumeIcon = isMuted || volume === 0 ? VolumeOffIcon : VolumeOnIcon
    const formattedCurrentTime = formatTime(currentTime)
    const formattedDuration = formatTime(duration)
    const sliderValue = isLoaded ? [currentTime] : [0]
    const sliderMax = isLoaded && duration > 0 ? duration : 1

    // --- FOCUS RING CLASSES ---
    // Define common focus ring styles for reuse
    const focusRingClass =
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black/80'
    // Focus ring for items inside popovers (might need different styling)
    const popoverFocusRingClass =
      'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-blue-300'
    // Focus ring for slider thumbs
    const sliderThumbFocusClass =
      '[&>[role="slider"]]:focus-visible:outline-none [&>[role="slider"]]:focus-visible:ring-2 [&>[role="slider"]]:focus-visible:ring-blue-300'
    // --- END FOCUS RING CLASSES ---

    return (
      <motion.div
        ref={playerContainerRef}
        initial="hidden"
        whileInView="visible"
        whileHover="hover"
        viewport={motionViewport}
        variants={playerVariants}
        className={cn(
          'relative w-full max-w-5xl mx-auto my-12 rounded-2xl overflow-hidden',
          'bg-gradient-to-br from-gray-950/90 via-gray-900/85 to-black/90',
          'shadow-xl shadow-black/40 perspective-1000 flex flex-col backdrop-blur-xl',
          className,
        )}
        onMouseEnter={handleInteractionStart}
        onMouseLeave={handleInteractionEnd}
        onMouseMove={handleInteractionStart}
        onFocus={handleInteractionStart} // Keep controls visible when container itself has focus
        onBlur={handleInteractionEnd}
        tabIndex={-1} // Make div focusable to catch focus events, but not via keyboard tabbing
        {...props}
      >
        {/* Glass-like Overlay */}
        <div
          className="absolute inset-0 rounded-2xl pointer-events-none -z-10"
          style={{
            background:
              'linear-gradient(135deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.02) 50%, rgba(0, 0, 0, 0.15))',
            border: '1px solid rgba(255, 255, 255, 0.15)',
          }}
        />

        {/* Video Container */}
        <div className="relative aspect-video">
          <video
            ref={videoRef}
            src={src}
            poster={poster}
            preload="metadata"
            onClick={togglePlayPause}
            onDoubleClick={toggleFullscreen}
            className={cn(
              'w-full h-full object-cover rounded-t-2xl',
              !isLoaded && 'opacity-0',
              // Add basic focus style for video element itself if desired
              // 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500'
            )}
            playsInline
            // Consider adding tabIndex="0" if direct interaction is expected via keyboard,
            // though usually interaction goes through controls.
          />
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/50 via-transparent to-transparent rounded-t-2xl" />

          {/* Loading Indicator */}
          <AnimatePresence>
            {isLoading && (
              <motion.div
                key="loader"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute inset-0 flex items-center justify-center bg-black/60 z-20"
              >
                <LoaderIcon className="w-14 h-14 text-blue-900 animate-spin" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Controls Container */}
        <AnimatePresence>
          {showControls && (
            <motion.div
              key="controls"
              variants={controlsVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className={cn(
                'z-30 px-6 py-4',
                'bg-gradient-to-t from-gray-950/90 via-gray-900/85 to-black/90',
                'backdrop-blur-xl rounded-b-2xl',
              )}
              onClick={(e) => e.stopPropagation()}
              onDoubleClick={(e) => e.stopPropagation()}
            >
              {/* Progress Bar */}
              <Slider
                value={sliderValue}
                max={sliderMax}
                step={0.1}
                disabled={!isLoaded || isLoading}
                onValueChange={handleSliderValueChange}
                onValueCommit={handleSliderValueCommit}
                aria-label="Video progress"
                className={cn(
                  'w-full h-6 -mb-2',
                  '[&>span:first-child]:h-1 [&>span:first-child]:bg-white/20 [&>span:first-child]:rounded-full',
                  '[&>span:first-child>span]:bg-gradient-to-r [&>span:first-child>span]:from-gray-200 [&>span:first-child>span]:via-blue-200 [&>span:first-child>span]:to-blue-300 [&>span:first-child>span]:rounded-full',
                  // Thumb styles including focus
                  '[&>[role="slider"]]:h-4 [&>[role="slider"]]:w-4 [&>[role="slider"]]:bg-blue-100 [&>[role="slider"]]:rounded-full',
                  '[&>[role="slider"]]:shadow-[0_0_10px_rgba(7,89,133,0.8),0_0_20px_rgba(7,89,133,0.4)] [&>[role="slider"]]:border-0',
                  '[&>[role="slider"]]:hover:scale-125 [&>[role="slider"]]:focus-visible:scale-125', // Use focus-visible for scale
                  'transition-all duration-200',
                  (!isLoaded || isLoading) && 'opacity-50 cursor-not-allowed',
                  // Add slider thumb focus class
                  sliderThumbFocusClass,
                )}
              />

              {/* Bottom Controls Row */}
              <div className="flex items-center justify-between gap-4 mt-4">
                {/* Left Controls */}
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={togglePlayPause}
                    disabled={!isLoaded || isLoading}
                    aria-label={isPlaying ? 'Pause video' : 'Play video'}
                    className={cn(
                      'w-12 h-12 rounded-full bg-white/10 hover:bg-blue-900/20 text-white hover:text-blue-200',
                      'transition-all duration-300 hover:scale-110',
                      (!isLoaded || isLoading) &&
                        'opacity-50 cursor-not-allowed',
                      // Add focus ring class
                      focusRingClass,
                    )}
                  >
                    <PlayPauseIcon className="h-6 w-6" />
                  </Button>

                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={toggleMute}
                        aria-label={isMuted ? 'Unmute video' : 'Mute video'}
                        className={cn(
                          'w-10 h-10 text-white   hover:text-blue-200 hover:bg-blue-900/20 rounded-full transition-all duration-300',
                          // Add focus ring class
                          focusRingClass,
                        )}
                      >
                        <VolumeIcon className="h-5 w-5" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-24 p-3 bg-black/90 backdrop-blur-xl border-none rounded-xl shadow-2xl">
                      <Slider
                        value={[isMuted ? 0 : volume]}
                        max={1}
                        step={0.05}
                        onValueChange={handleVolumeChange}
                        aria-label="Volume control"
                        className={cn(
                          'w-full',
                          '[&>span:first-child]:h-1 [&>span:first-child]:bg-white/30',
                          '[&>span:first-child>span]:bg-gradient-to-r [&>span:first-child>span]:from-gray-200 [&>span:first-child>span]:via-blue-200 [&>span:first-child>span]:to-blue-300',
                          // Thumb styles including focus
                          '[&>[role="slider"]]:h-3 [&>[role="slider"]]:w-3 [&>[role="slider"]]:bg-blue-100',
                          '[&>[role="slider"]]:shadow-[0_0_8px_rgba(7,89,133,0.6)]',
                          // Add slider thumb focus class
                          sliderThumbFocusClass,
                        )}
                      />
                    </PopoverContent>
                  </Popover>

                  <span className="text-sm font-medium text-white/90 tabular-nums">
                    {formattedCurrentTime} / {formattedDuration}
                  </span>
                </div>

                {/* Right Controls */}
                <div className="flex items-center gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Playback speed: ${playbackRate}x`}
                        className={cn(
                          'w-10 h-10 text-white hover:text-blue-200 hover:bg-blue-900/20 rounded-full transition-all duration-300',
                          // Add focus ring class
                          focusRingClass,
                        )}
                      >
                        <FastForwardIcon className="h-5 w-5" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-28 p-2 bg-black/90 backdrop-blur-xl  border-none rounded-xl shadow-2xl">
                      {[0.5, 0.75, 1, 1.25, 1.5, 2].map((rate) => (
                        <Button
                          key={rate}
                          variant="ghost"
                          size="sm"
                          onClick={() => handlePlaybackRateChange(rate)}
                          className={cn(
                            'w-full justify-start text-white hover:bg-blue-900/20  hover:text-blue-200 rounded-md', // Added rounded-md for better ring appearance
                            playbackRate === rate && 'bg-blue-900/30',
                            // Add popover item focus ring class
                            popoverFocusRingClass,
                          )}
                        >
                          {rate}x
                        </Button>
                      ))}
                    </PopoverContent>
                  </Popover>

                  {document.pictureInPictureEnabled && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={togglePictureInPicture}
                      aria-label="Toggle Picture-in-Picture"
                      className={cn(
                        'w-10 h-10 text-white hover:text-blue-200 hover:bg-blue-900/20 rounded-full transition-all duration-300',
                        // Add focus ring class
                        focusRingClass,
                      )}
                    >
                      <PictureInPictureIcon className="h-5 w-5" />
                    </Button>
                  )}

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleFullscreen}
                    aria-label={
                      isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'
                    }
                    className={cn(
                      'w-10 h-10 text-white hover:text-blue-200 hover:bg-blue-900/20 rounded-full transition-all duration-300',
                      // Add focus ring class
                      focusRingClass,
                    )}
                  >
                    {isFullscreen ? (
                      <MinimizeIcon className="h-5 w-5" />
                    ) : (
                      <MaximizeIcon className="h-5 w-5" />
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    )
  },
)

VideoPlayerUI.displayName = 'VideoPlayerUI' // Added for better debugging

export { VideoPlayerUI }
