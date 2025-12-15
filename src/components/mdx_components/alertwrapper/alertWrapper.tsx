'use client'; // Required for Framer Motion hooks and event handlers

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

import CircleCheckBigIcon from '@/components/icons/successIcon';
import InfoIcon from '@/components/icons/infoIcon';
import TriangleAlertIcon from '@/components/icons/warningIcon';
import ShieldAlertIcon from '@/components/icons/dangerIcon';

// --- Refined Base Styles with Apple-Like Sophistication ---
const alertVariants = cva(
  'relative w-full overflow-hidden rounded-3xl border border-opacity-10 p-6 shadow-2xl backdrop-blur-xl bg-opacity-90 transition-all duration-300',
  {
    variants: {
      variant: {
        info: 'bg-gradient-to-br from-blue-500/20 via-blue-400/10 to-blue-300/20 border-blue-500/25 text-blue-400/60 dark:from-blue-700/25 dark:via-blue-900/15 dark:to-transparent dark:text-blue-100',
        success:
          'bg-gradient-to-br from-green-500/20 via-green-400/10 to-green-300/20 border-green-500/25 text-green-400/60 dark:from-green-700/25 dark:via-green-900/15 dark:to-transparent dark:text-green-100',
        warning:
          'bg-gradient-to-br from-yellow-500/25 via-yellow-400/10 to-yellow-300/20 border-yellow-500/30 text-yellow-400/60 dark:from-yellow-700/30 dark:via-yellow-900/15 dark:to-transparent dark:text-yellow-100',
        danger:
          'bg-gradient-to-br from-red-500/20 via-red-400/10 to-red-300/20 border-red-500/25 text-red-400/60 dark:from-red-700/25 dark:via-red-900/15 dark:to-transparent dark:text-red-100',
      },
    },
    defaultVariants: {
      variant: 'info',
    },
  }
);

// --- Luxurious Icon Container with Bloom and Metallic Sheen ---
const iconContainerVariants = cva(
  'absolute z-10 flex h-10 w-10 items-center justify-center rounded-full border border-opacity-30 shadow-md backdrop-blur-lg bg-opacity-95 transition-transform duration-300',
  {
    variants: {
      variant: {
        info: 'bg-gradient-to-br from-blue-500 to-blue-700 text-white border-blue-400/40',
        success:
          'bg-gradient-to-br from-green-500 to-green-700 text-white border-green-400/40',
        warning:
          'bg-gradient-to-br from-yellow-500 to-yellow-700 text-white border-yellow-400/40',
        danger:
          'bg-gradient-to-br from-red-500 to-red-700 text-white border-red-400/40',
      },
    },
    defaultVariants: {
      variant: 'info',
    },
  }
);

// --- Icon Mapping ---
const alertIcons = {
  info: InfoIcon,
  success: CircleCheckBigIcon,
  warning: TriangleAlertIcon,
  danger: ShieldAlertIcon,
};

// --- Component Props ---
interface AlertProps
  extends Omit<
      React.HTMLAttributes<HTMLDivElement>,
      'onDrag' | 'onDragStart' | 'onDragEnd' | 'onAnimationStart'
    >,
    VariantProps<typeof alertVariants> {
  variant: 'info' | 'success' | 'warning' | 'danger';
}

// --- Enhanced Framer Motion Animations with Elegance ---
// const alertMotionVariants = {
//   hidden: { opacity: 0, y: 30, scale: 0.92 },
//   visible: {
//     opacity: 1,
//     y: 0,
//     scale: 1,
//     transition: {
//       type: 'spring',
//       stiffness: 150,
//       damping: 20,
//       mass: 0.5,
//       opacity: { duration: 0.6, ease: 'easeOut' },
//       y: { duration: 0.7, ease: [0.16, 1, 0.3, 1] }, // Smooth bezier curve
//       scale: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
//     },
//   },
// };

// const iconMotionVariants = {
//   hidden: { scale: 0, opacity: 0, rotate: -45 },
//   visible: {
//     scale: 1,
//     opacity: 1,
//     rotate: 0,
//     transition: {
//       type: 'spring',
//       stiffness: 250,
//       damping: 18,
//       mass: 0.3,
//       delay: 0.2,
//     },
//   },
// };

// --- The Luxurious Alert Component ---
const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant, children, ...props }, ref) => {
    const IconComponent = alertIcons[variant];
    const Icon = React.useMemo(() => IconComponent, [IconComponent]);

    return (
      <motion.div
        ref={ref}
        initial="hidden"
        animate="visible"
        // variants={alertMotionVariants}
        className={cn(
          alertVariants({ variant }),
          'relative my-8 hover:shadow-3xl',
          className
        )}
        role="alert"
        {...props}
      >
        {/* Icon with Bloom Effect and Metallic Finish */}
        <motion.div
          //   variants={iconMotionVariants}
          className={cn(iconContainerVariants({ variant }), ' hover:scale-110')}
          aria-hidden="true"
          style={
            {
              boxShadow:
                'inset 0 2px 4px rgba(255, 255, 255, 0.4), 0 6px 20px rgba(0, 0, 0, 0.2), 0 0 15px var(--glow-color)', // Glossy + bloom
              '--glow-color':
                variant === 'info'
                  ? 'rgba(59, 130, 246, 0.5)'
                  : variant === 'success'
                  ? 'rgba(34, 197, 94, 0.5)'
                  : variant === 'warning'
                  ? 'rgba(234, 179, 8, 0.5)'
                  : 'rgba(239, 68, 68, 0.5)',
            } as React.CSSProperties
          }
        >
          <Icon className="h-7 w-7 drop-shadow-md" />
        </motion.div>

        {/* Content Area with Polished Spacing */}
        <div className="ml-16 pt-3 pr-5">{children}</div>

        {/* Radiant Background Glow */}
        <motion.div
          className="absolute inset-0 -z-10 rounded-3xl pointer-events-none"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.2, scale: 1 }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
          style={{
            background: `radial-gradient(circle at 10% 30%, ${
              variant === 'info'
                ? 'rgba(59, 130, 246, 0.4)'
                : variant === 'success'
                ? 'rgba(34, 197, 94, 0.4)'
                : variant === 'warning'
                ? 'rgba(234, 179, 8, 0.4)'
                : 'rgba(239, 68, 68, 0.4)'
            }, transparent 80%)`,
            filter: 'blur(20px)',
          }}
        />

        {/* Subtle Reflective Overlay */}
        <div
          className="absolute inset-0 rounded-3xl -z-5 opacity-20"
          style={{
            background:
              'linear-gradient(135deg, rgba(255, 255, 255, 0.2), transparent 50%)',
            pointerEvents: 'none',
          }}
        />
      </motion.div>
    );
  }
);
Alert.displayName = 'Alert';

// --- Refined AlertTitle with Typographic Elegance ---
const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn(
      'mb-2 font-semibold text-[1.3em] leading-tight tracking-tight text-opacity-95 drop-shadow-sm',
      className
    )}
    {...props}
  />
));
AlertTitle.displayName = 'AlertTitle';

// --- Polished AlertDescription ---
const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'text-[0.95em] leading-relaxed opacity-90 tracking-wide text-[var(--text-color-primary-800)]',
      className
    )}
    {...props}
  />
));
AlertDescription.displayName = 'AlertDescription';

export { Alert, AlertTitle, AlertDescription };
