import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const highlightVariants = cva('px-1.5 py-0.5 rounded-md font-medium', {
  variants: {
    variant: {
      yellow:
        'bg-[var(--background-topic-yellow)] text-[var(--text-color-primary-900)] dark:text-[var(--text-color-primary-900)]',
      blue: 'bg-[var(--background-topic-blue)] text-[var(--text-color-primary-900)] dark:text-blue-200',
      green:
        'bg-[var(--background-topic-green)] text-[var(--text-color-primary-900)] dark:text-green-200',
      red: 'bg-[var(--background-topic-red)] text-[var(--text-color-primary-900)] dark:text-red-200',
      black: 'bg-slate-900 text-white dark:text-white',
      accent: 'bg-[var(--module-badge)] text-white',
      info: 'bg-[var(--alert-info)] text-[var(--alert-info-icon)] dark:bg-[var(--alert-info)] dark:text-[var(--alert-info-icon)]',
      success:
        'bg-[var(--alert-success)] text-[var(--success-icon)] dark:bg-[var(--alert-success)] dark:text-[var(--alert-success-icon)]',
      warning:
        'bg-[var(--alert-warning)] text-[var(--alert-warning-icon)] dark:bg-[var(--alert-warning)] dark:text-[var(--alert-warning-icon)]',
      danger:
        'bg-[var(--alert-danger)] text-[var(--alert-danger-icon)] dark:bg-[var(--alert-danger)] dark:text-[var(--alert-danger-icon)]',
    },
  },
  defaultVariants: {
    variant: 'yellow',
  },
});

export interface HighlightProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof highlightVariants> {
  children: React.ReactNode;
}

export function Highlight({
  children,
  className,
  variant,
  ...props
}: HighlightProps) {
  return (
    <span className={cn(highlightVariants({ variant }), className)} {...props}>
      {children}
    </span>
  );
}
