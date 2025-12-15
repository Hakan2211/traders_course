
import * as React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { formatTime } from '@/lib/utils';
import PauseIcon from '@/components/icons/pauseIcon';
import PlayIcon from '@/components/icons/playIcon';

const debounce = (func: (...args: any[]) => void, wait: number) => {
  let timeout: NodeJS.Timeout | undefined;
  return (...args: any[]) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

const playerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 120, damping: 20, mass: 0.8 },
  },
};

const cardHoverVariants = {
  hover: {
    transform: 'translateY(-4px)',
    boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)',
    transition: { duration: 0.4, ease: [0.17, 0.44, 0, 1.05] },
  },
};

interface VoiceoverPlayerProps
  extends Omit<
    React.HTMLAttributes<HTMLDivElement>,
    'onAnimationStart' | 'onDrag' | 'onDragEnd' | 'onDragStart'
  > {
  src: string;
  title?: string;
  description?: string;
  motionViewport?: { once?: boolean; amount?: number };
}

const VoiceoverPlayer = React.forwardRef<HTMLDivElement, VoiceoverPlayerProps>(
  (
    {
      className,
      src,
      title,
      description,
      motionViewport = { once: true, amount: 0.3 },
      ...props
    },
    ref
  ) => {
    const audioRef = React.useRef<HTMLAudioElement>(null);
    const [isPlaying, setIsPlaying] = React.useState(false);
    const [duration, setDuration] = React.useState(0);
    const [currentTime, setCurrentTime] = React.useState(0);
    const [isSeeking, setIsSeeking] = React.useState(false);
    const [isLoaded, setIsLoaded] = React.useState(false);

    const setAudioTime = React.useCallback(
      debounce(() => {
        const audio = audioRef.current;
        if (audio && !isSeeking && isLoaded && isFinite(audio.currentTime)) {
          setCurrentTime(audio.currentTime);
        }
      }, 50),
      [isSeeking, isLoaded, audioRef]
    );

    React.useEffect(() => {
      const audio = audioRef.current;
      if (!audio) return;

      const setAudioData = () => {
        if (isFinite(audio.duration)) {
          setDuration(audio.duration);
          setIsLoaded(true);
        }
        setCurrentTime(audio.currentTime);
      };

      const handleAudioEnd = () => {
        setIsPlaying(false);
        setCurrentTime(0);
      };

      const handleCanPlay = () => {
        if (!isLoaded && isFinite(audio.duration)) setAudioData();
      };

      audio.addEventListener('loadedmetadata', setAudioData);
      audio.addEventListener('canplay', handleCanPlay);
      audio.addEventListener('timeupdate', setAudioTime);
      audio.addEventListener('ended', handleAudioEnd);
      audio.addEventListener('seeked', () => setIsSeeking(false));

      if (audio.readyState >= 1) setAudioData();
      if (!isPlaying && audio.readyState >= 1)
        setCurrentTime(audio.currentTime);

      return () => {
        audio.removeEventListener('loadedmetadata', setAudioData);
        audio.removeEventListener('canplay', handleCanPlay);
        audio.removeEventListener('timeupdate', setAudioTime);
        audio.removeEventListener('ended', handleAudioEnd);
        audio.removeEventListener('seeked', () => setIsSeeking(false));
      };
    }, [src, setAudioTime]);

    React.useEffect(() => {
      const audio = audioRef.current;
      if (audio) {
        if (isPlaying)
          audio.play().catch((e) => {
            console.error(e);
            setIsPlaying(false);
          });
        else audio.pause();
      }
    }, [isPlaying]);

    const togglePlayPause = () => {
      if (!isLoaded) return;
      setIsPlaying((prev) => !prev);
    };

    const handleSliderValueChange = (value: number[]) => {
      const newTime = value[0];
      if (isLoaded && audioRef.current && isFinite(newTime)) {
        setCurrentTime(newTime);
        if (!isSeeking) setIsSeeking(true);
      }
    };

    const handleSliderValueCommit = (value: number[]) => {
      const newTime = value[0];
      if (isLoaded && audioRef.current && isFinite(newTime)) {
        audioRef.current.currentTime = newTime;
      } else {
        setIsSeeking(false);
      }
    };

    const Icon = isPlaying ? PauseIcon : PlayIcon;
    const formattedCurrentTime = formatTime(currentTime);
    const formattedDuration = formatTime(duration);
    const sliderValue = isLoaded ? [currentTime] : [0];
    const sliderMax = isLoaded && duration > 0 ? duration : 1;

    return (
      <motion.div
        ref={ref}
        initial="hidden"
        whileInView="visible"
        whileHover="hover"
        viewport={motionViewport}
        variants={{ ...playerVariants, ...cardHoverVariants }}
        className={cn(
          'relative max-w-2xl w-full my-8 p-6 md:p-8 bg-gradient-to-br from-gray-950/90 via-gray-900/85 to-black/90 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-gray-700/50',
          'flex items-center gap-4 md:gap-6',
          className
        )}
      >
        <div
          className="absolute inset-0 rounded-3xl -z-10"
          style={{
            background:
              'linear-gradient(135deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.02) 50%, rgba(0, 0, 0, 0.15))',
            border: '1px solid rgba(255, 255, 255, 0.15)',
          }}
        />
        <Button
          variant="ghost"
          size="icon"
          onClick={togglePlayPause}
          disabled={!isLoaded}
          aria-label={isPlaying ? 'Pause voiceover' : 'Play voiceover'}
          className={cn(
            'relative z-10 flex-shrink-0 rounded-full w-12 h-12 md:w-14 md:h-14 bg-gray-800/60 border border-gray-600/40 text-white/90 hover:text-white transition-all duration-200 ease-out',
            'hover:bg-gray-700/70 hover:scale-105 focus-visible:scale-105 focus-visible:bg-gray-700/80 focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900',
            !isLoaded && 'opacity-40 cursor-not-allowed'
          )}
        >
          <Icon className="h-6 w-6 fill-current" />
        </Button>
        <div className="relative z-10 flex flex-col w-full gap-2">
          {title && (
            <p className="text-base md:text-lg font-semibold text-white tracking-tight truncate">
              {title}
            </p>
          )}
          {description && (
            <p className="text-xs md:text-sm text-gray-300 tracking-wide truncate">
              {description}
            </p>
          )}
          <div className="flex items-center gap-3 w-full mt-1">
            <Slider
              value={sliderValue}
              max={sliderMax}
              step={0.1}
              disabled={!isLoaded}
              onValueChange={handleSliderValueChange}
              onValueCommit={handleSliderValueCommit}
              aria-label="Audio progress"
              className={cn(
                'relative flex w-full touch-none select-none items-center group',
                'flex-grow cursor-pointer',
                !isLoaded && 'opacity-50 cursor-not-allowed',
                '[&>span:first-child]:h-1 [&>span:first-child]:w-full [&>span:first-child]:rounded-full [&>span:first-child]:bg-gray-700/40',
                !isLoaded && '[&>span:first-child]:bg-gray-600/30',
                '[&>span:first-child>span]:h-full [&>span:first-child>span]:rounded-full [&>span:first-child>span]:bg-gradient-to-r [&>span:first-child>span]:from-gray-200 [&>span:first-child>span]:via-blue-200 [&>span:first-child>span]:to-blue-300',
                '[&>span:first-child>span]:transition-all [&>span:first-child>span]:duration-75 [&>span:first-child>span]:ease-out',
                !isLoaded && '[&>span:first-child>span]:bg-gray-500/50',
                '[&>[role="slider"]]:block [&>[role="slider"]]:h-4 [&>[role="slider"]]:w-4 [&>[role="slider"]]:rounded-full [&>[role="slider"]]:border-2 [&>[role="slider"]]:border-gray-900/80',
                '[&>[role="slider"]]:bg-gradient-to-br [&>[role="slider"]]:from-white [&>[role="slider"]]:to-gray-100 [&>[role="slider"]]:shadow-[0_2px_8px_rgba(0,0,0,0.3)]',
                '[&>[role="slider"]]:transition-all [&>[role="slider"]]:duration-150 [&>[role="slider"]]:ease-out',
                '[&>[role="slider"]]:focus-visible:outline-none [&>[role="slider"]]:focus-visible:ring-2 [&>[role="slider"]]:focus-visible:ring-blue-400/60 [&>[role="slider"]]:focus-visible:ring-offset-2 [&>[role="slider"]]:focus-visible:ring-offset-gray-900',
                'group-hover:[&>[role="slider"]]:scale-110 group-active:[&>[role="slider"]]:scale-125',
                !isLoaded && '[&>[role="slider"]]:cursor-not-allowed',
                isLoaded &&
                  '[&>[role="slider"]]:cursor-grab [&>[role="slider"]]:active:cursor-grabbing'
              )}
            />
            <span className="text-xs font-mono text-gray-300 tabular-nums w-[7.5em] text-right flex-shrink-0">
              {formattedCurrentTime} / {formattedDuration}
            </span>
          </div>
        </div>
        <audio
          ref={audioRef}
          src={src}
          preload="metadata"
          className="absolute opacity-0 w-0 h-0"
        />
      </motion.div>
    );
  }
);
VoiceoverPlayer.displayName = 'VoiceoverPlayer';

export { VoiceoverPlayer };
