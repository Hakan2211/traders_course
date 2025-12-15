import type { ReactNode, CSSProperties } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface InfoGridProps {
  children: ReactNode;
  className?: string;
  gap?: string;
  // Wrapper container props
  containerClassName?: string;
  containerBackgroundColor?: string;
  containerPadding?: string;
  containerBorderRadius?: string;
  showContainer?: boolean;
}

interface InfoGridItemProps {
  title: string;
  value: ReactNode;
  description: ReactNode;
  icon?: ReactNode;
  className?: string;
  contentClassName?: string;
  headerClassName?: string;
  iconWrapperClassName?: string;
  titleClassName?: string;
  valueClassName?: string;
  descriptionClassName?: string;
  accentClassName?: string;
  showAccent?: boolean;
  // Color customization props
  backgroundColor?: string;
  borderColor?: string;
  textColor?: string;
  titleColor?: string;
  valueColor?: string;
  descriptionColor?: string;
  iconBackgroundColor?: string;
  iconColor?: string;
  accentColor?: string;
}

const defaultCardStyles = {
  backgroundColor: '#131a26',
  borderColor: '#182538',
  textColor: '#e2e8f0',
  titleColor: '#f1f5f9',
  valueColor: '#ffffff',
  descriptionColor: '#94a3b8',
  iconBackgroundColor: 'rgba(24, 37, 56, 0.6)',
  iconColor: '#60a5fa',
  accentColor: '#3b82f6',
};

export const InfoGrid = ({
  children,
  className,
  gap,
  containerClassName,
  containerBackgroundColor,
  containerPadding,
  containerBorderRadius,
  showContainer = false,
}: InfoGridProps) => {
  const gridContent = (
    <div
      className={cn(
        'grid grid-cols-1 gap-4 my-8 w-full md:gap-6 md:grid-cols-2',
        className
      )}
      style={gap ? { gap } : undefined}
    >
      {children}
    </div>
  );

  if (!showContainer && !containerBackgroundColor && !containerClassName) {
    return gridContent;
  }

  const containerStyle: CSSProperties = {};
  if (containerBackgroundColor) {
    containerStyle.backgroundColor = containerBackgroundColor;
  } else if (showContainer) {
    containerStyle.backgroundColor = '#0a0f1a';
  }
  if (containerPadding) {
    containerStyle.padding = containerPadding;
  } else if (showContainer) {
    containerStyle.padding = '1.5rem';
  }
  if (containerBorderRadius) {
    containerStyle.borderRadius = containerBorderRadius;
  }

  return (
    <div
      className={cn(
        'rounded-2xl my-8',
        !containerPadding && showContainer && 'p-6 md:p-8',
        containerClassName
      )}
      style={containerStyle}
    >
      {gridContent}
    </div>
  );
};

export const InfoGridItem = ({
  title,
  value,
  description,
  icon,
  className,
  contentClassName,
  headerClassName,
  iconWrapperClassName,
  titleClassName,
  valueClassName,
  descriptionClassName,
  accentClassName,
  showAccent = true,
  backgroundColor = defaultCardStyles.backgroundColor,
  borderColor = defaultCardStyles.borderColor,
  textColor = defaultCardStyles.textColor,
  titleColor = defaultCardStyles.titleColor,
  valueColor = defaultCardStyles.valueColor,
  descriptionColor = defaultCardStyles.descriptionColor,
  iconBackgroundColor = defaultCardStyles.iconBackgroundColor,
  iconColor = defaultCardStyles.iconColor,
  accentColor = defaultCardStyles.accentColor,
}: InfoGridItemProps) => {
  const cardStyle: CSSProperties = {
    backgroundColor,
    borderColor,
    color: textColor,
  };

  return (
    <Card
      className={cn(
        'group relative w-full min-w-0 overflow-hidden rounded-2xl border-2 shadow-sm transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/20',
        className
      )}
      style={cardStyle}
    >
      {showAccent && (
        <span
          className={cn(
            'pointer-events-none absolute inset-x-4 top-0 h-1 rounded-b-full opacity-80 transition-opacity duration-300 group-hover:opacity-100 md:inset-x-6',
            accentClassName
          )}
          style={{ backgroundColor: accentColor }}
        />
      )}
      <CardContent
        className={cn('p-4 space-y-4 md:p-6 md:space-y-6', contentClassName)}
      >
        <div
          className={cn('flex items-center gap-3 md:gap-4', headerClassName)}
        >
          {icon && (
            <span
              className={cn(
                'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all duration-300 group-hover:scale-110 md:h-11 md:w-11',
                iconWrapperClassName
              )}
              style={{
                backgroundColor: iconBackgroundColor,
                color: iconColor,
              }}
            >
              {icon}
            </span>
          )}
          <h3
            className={cn(
              'text-base font-semibold tracking-tight min-w-0 flex-1 md:text-lg',
              titleClassName
            )}
            style={{ color: titleColor }}
          >
            {title}
          </h3>
        </div>
        <p
          className={cn(
            'text-3xl font-extrabold tracking-tight md:text-4xl',
            valueClassName
          )}
          style={{ color: valueColor }}
        >
          {value}
        </p>
        <p
          className={cn(
            'text-xs leading-relaxed md:text-sm',
            descriptionClassName
          )}
          style={{ color: descriptionColor }}
        >
          {description}
        </p>
      </CardContent>
    </Card>
  );
};
