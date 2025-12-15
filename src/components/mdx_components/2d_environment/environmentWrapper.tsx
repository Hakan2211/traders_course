import React from 'react';
import { cn } from '@/lib/utils';

interface EnvironmentWrapperProps {
  width?: string;
  height?: string;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}

const EnvironmentWrapper: React.FC<EnvironmentWrapperProps> = ({
  width = '100%',
  height = '300px',
  className,
  children,
  style = {},
}) => {
  const wrapperStyle: React.CSSProperties = {
    width: width,
    height: height,
    position: 'relative',
    overflow: 'hidden',
    ...style,
  };

  return (
    <div
      className={cn(
        'bg-gradient-to-br from-gray-950/90 via-gray-900/85 to-black/90 dark:bg-slate-800',
        'border border-gray-700/50 shadow-[0_10px_40px_rgba(0,0,0,0.6)]',
        'rounded-2xl backdrop-blur-2xl',
        'flex items-center justify-center',
        'my-8',
        className
      )}
      style={wrapperStyle}
      aria-label="2D Environment"
    >
      {/* Inner div prevents flex centering from shrinking content unexpectedly */}
      <div className="w-full h-full relative">{children}</div>
    </div>
  );
};

export default EnvironmentWrapper;
