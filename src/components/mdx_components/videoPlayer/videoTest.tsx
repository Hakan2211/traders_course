import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'; // For volume/speed
import { cn, formatTime } from '@/lib/utils'; // Assuming formatTime is in utils
import PlayIcon from '@/components/icons/playIcon';
import PauseIcon from '@/components/icons/pauseIcon';
import VolumeOnIcon from '@/components/icons/video/volumeIcon';
import VolumeOffIcon from '@/components/icons/video/volumeOffIcon';
import FastForwardIcon from '@/components/icons/video/fastForwardIcon';
import MinimizeIcon from '@/components/icons/video/minimizeIcon';
import MaximizeIcon from '@/components/icons/video/maximizeIcon';
import PictureInPictureIcon from '@/components/icons/video/pictureInPictureIcon';
import LoaderIcon from '@/components/icons/video/loaderIcon';

const controlsVariants = {
  hidden: { opacity: 0, y: 20, transition: { duration: 0.3, ease: 'easeOut' } },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
};

const playerHoverVariants = {
  hover: {
    // Slight scale or shadow emphasis on the container? Optional.
    // boxShadow: '0 30px 60px rgba(0, 0, 0, 0.3)',
    // transition: { duration: 0.4, ease: [0.17, 0.44, 0, 1.05] },
  },
};

function VideoTest({ src }: { src: string }) {
  return (
    <motion.div
      // ref={playerContainerRef} // Use this ref for fullscreen
      initial="hidden" // You can keep initial animation if you like
      whileInView="visible"
      whileHover="hover"
      // viewport={motionViewport}
      variants={{ ...controlsVariants, ...playerHoverVariants }} // Reusing controls variant for entry
      className={cn(
        'relative group aspect-video w-full max-w-4xl  mx-auto my-8 rounded-xl md:rounded-2xl overflow-hidden',
        'bg-[red]',
        'focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2 focus-within:ring-offset-black' // Focus outline for accessibility
        // className
      )}
      // onMouseEnter={handleInteractionStart}
      // onMouseLeave={handleInteractionEnd}
      // onMouseMove={handleInteractionStart} // Reset timer on move
      // onFocus={handleInteractionStart} // Show on focus
      // onBlur={handleInteractionEnd} // Hide on blur
      // {...props}
    >
      {/* --- Video Layer --- */}
      <video
        // ref={videoRef}
        src={src}
        // poster={poster}
        preload="metadata" // Changed from auto for faster initial load
        // onClick={togglePlayPause} // Toggle play/pause on video click
        // onDoubleClick={toggleFullscreen} // Common UX: double click for fullscreen
        className={cn(
          'w-full h-full object-cover block'
          // !isLoaded && 'opacity-0' // Hide video until loaded to prevent flash
        )}
        playsInline // Important for mobile browsers
      />

      {/* --- Loading Indicator --- */}
      <AnimatePresence>
        {/* {isLoading && ( */}
        <motion.div
          key="loader"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 flex items-center justify-center bg-black/50 z-20"
          aria-label="Loading video..."
        >
          <LoaderIcon className="w-12 h-12 text-white animate-spin" />
        </motion.div>
        {/* )} */}
      </AnimatePresence>

      {/* --- Controls Layer --- */}
      <AnimatePresence>
        {/* {showControls && ( */}
        <motion.div
          key="controls"
          variants={controlsVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          className={cn(
            'absolute bottom-0 left-0 right-0 z-10 px-4 py-3 md:px-6 md:py-4',
            'bg-gradient-to-t from-black/80 via-black/60 to-transparent' // Softer gradient up
            // 'bg-black/70 backdrop-blur-md', // Alternative solid blur background
          )}
          // Prevent clicks on the control bar from bubbling to the video click handler
          onClick={(e) => e.stopPropagation()}
          onDoubleClick={(e) => e.stopPropagation()} // Prevent double click fullscreen on controls
        >
          {/* --- Progress Bar --- */}
          <Slider
            // value={sliderValue}
            // max={sliderMax}
            step={0.1} // Fine-grained steps
            // disabled={!isLoaded || isLoading}
            // onValueChange={handleSliderValueChange}
            // onValueCommit={handleSliderValueCommit}
            aria-label="Video progress"
            className={cn(
              'relative flex w-full touch-none select-none items-center group/slider h-5 cursor-pointer -mb-2', // Increased hit area
              // (!isLoaded || isLoading) && 'opacity-50 cursor-not-allowed',
              // Track styling
              '[&>span:first-child]:h-[5px] [&>span:first-child]:w-full [&>span:first-child]:rounded-full [&>span:first-child]:bg-white/20',
              // Range (progress) styling
              '[&>span:first-child>span]:h-full [&>span:first-child>span]:rounded-full [&>span:first-child>span]:bg-white',
              '[&>span:first-child>span]:transition-all [&>span:first-child>span]:duration-75 [&>span:first-child>span]:ease-out',
              // Thumb styling (initially small, grows on hover)
              '[&>[role="slider"]]:block [&>[role="slider"]]:h-3 [&>[role="slider"]]:w-3 [&>[role="slider"]]:rounded-full',
              '[&>[role="slider"]]:bg-white [&>[role="slider"]]:shadow-[0_0_0_2px_rgba(0,0,0,0.3)]',
              '[&>[role="slider"]]:transition-transform [&>[role="slider"]]:duration-150 [&>[role="slider"]]:ease-out',
              '[&>[role="slider"]]:focus-visible:outline-none [&>[role="slider"]]:focus-visible:ring-2 [&>[role="slider"]]:focus-visible:ring-blue-400/60 [&>[role="slider"]]:focus-visible:ring-offset-2 [&>[role="slider"]]:focus-visible:ring-offset-black',
              'group-hover/slider:[&>[role="slider"]]:scale-[1.4]', // Scale thumb on slider hover
              // (!isLoaded || isLoading) &&
              //   '[&>[role="slider"]]:cursor-not-allowed',
              // isLoaded &&
              //   !isLoading &&
              '[&>[role="slider"]]:cursor-grab [&>[role="slider"]]:active:cursor-grabbing'
            )}
          />

          {/* --- Bottom Controls Row --- */}
          <div className="flex items-center justify-between gap-4 mt-3">
            {/* Left Controls */}
            <div className="flex items-center gap-2 md:gap-3">
              {/* Play/Pause Button */}
              <Button
                variant="ghost"
                size="icon"
                // onClick={togglePlayPause}
                // disabled={!isLoaded || isLoading}
                // aria-label={isPlaying ? 'Pause video' : 'Play video'}
                className="text-white hover:bg-white/10 rounded-full"
              >
                <PlayIcon className="h-5 w-5 md:h-6 md:w-6 fill-current" />
              </Button>

              {/* Volume Control Popover */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    // onClick={toggleMute} // Can still click icon to mute/unmute quickly
                    // aria-label={isMuted ? 'Unmute video' : 'Mute video'}
                    className="text-white hover:bg-white/10 rounded-full"
                  >
                    <VolumeOnIcon className="h-5 w-5 md:h-6 md:w-6" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-2 bg-black/80 backdrop-blur-sm border-white/10 rounded-lg shadow-xl">
                  <Slider
                    // value={[isMuted ? 0 : volume]}
                    max={1}
                    step={0.05}
                    //onValueChange={handleVolumeChange}
                    aria-label="Volume control"
                    className={cn(
                      'w-20 h-2', // Vertical slider needs height adjustment maybe
                      '[&>span:first-child]:h-[4px] [&>span:first-child]:bg-white/30',
                      '[&>span:first-child>span]:bg-white',
                      '[&>[role="slider"]]:h-3 [&>[role="slider"]]:w-3 [&>[role="slider"]]:bg-white',
                      '[&>[role="slider"]]:border-none [&>[role="slider"]]:shadow-sm'
                      // Consider orientation="vertical" if desired, needs more styling
                    )}
                  />
                </PopoverContent>
              </Popover>

              {/* Time Display */}
              <span className="text-xs md:text-sm font-mono text-white/80 tabular-nums">
                {/* {formattedCurrentTime} / {formattedDuration} */}
                0.01 / 0.22
              </span>
            </div>

            {/* Right Controls */}
            <div className="flex items-center gap-1 md:gap-2">
              {/* Playback Speed Control Popover (Optional) */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    // aria-label={`Playback speed: ${playbackRate}x`}
                    className="text-white hover:bg-white/10 rounded-full"
                  >
                    <FastForwardIcon className="h-5 w-5 md:h-6 md:w-6" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-1 bg-black/80 backdrop-blur-sm border-white/10 rounded-lg shadow-xl">
                  {[0.5, 0.75, 1, 1.25, 1.5, 2].map((rate) => (
                    <Button
                      key={rate}
                      variant="ghost"
                      size="sm"
                      // onClick={() => handlePlaybackRateChange(rate)}
                      className={cn(
                        'w-full justify-start text-white hover:bg-white/10'
                        // playbackRate === rate && 'bg-white/20 font-semibold'
                      )}
                    >
                      {rate}x
                    </Button>
                  ))}
                </PopoverContent>
              </Popover>

              {/* Picture-in-Picture Button (Optional) */}
              {document.pictureInPictureEnabled && (
                <Button
                  variant="ghost"
                  size="icon"
                  //onClick={togglePictureInPicture}
                  aria-label="Toggle Picture-in-Picture"
                  className="text-white hover:bg-white/10 rounded-full"
                >
                  <PictureInPictureIcon className="h-5 w-5 md:h-6 md:w-6" />
                </Button>
              )}

              {/* Fullscreen Button */}
              <Button
                variant="ghost"
                size="icon"
                //  onClick={toggleFullscreen}
                //  aria-label={
                //    isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'
                //  }
                className="text-white hover:bg-white/10 rounded-full"
              >
                {/* {isFullscreen ? (
                    <MinimizeIcon className="h-5 w-5 md:h-6 md:w-6" />
                  ) : (
                    <MaximizeIcon className="h-5 w-5 md:h-6 md:w-6" />
                  )} */}
              </Button>
            </div>
          </div>
        </motion.div>
        {/* )} */}
      </AnimatePresence>
    </motion.div>
  );
}

export default VideoTest;
