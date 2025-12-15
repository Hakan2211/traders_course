import type { ReactNode, CSSProperties } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const defaultCardStyles = {
  backgroundColor: '#131a26',
  borderColor: '#182538',
  textColor: '#e2e8f0',
  titleColor: '#f1f5f9',
  descriptionColor: '#94a3b8',
  iconBackgroundColor: 'rgba(24, 37, 56, 0.6)',
  iconColor: '#60a5fa',
  accentColor: '#3b82f6',
};

export interface GridListItemConfig {
  title: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  className?: string;
  headerClassName?: string;
  titleClassName?: string;
  iconWrapperClassName?: string;
  contentClassName?: string;
  descriptionClassName?: string;
  accentClassName?: string;
  showAccent?: boolean;
  // Color customization props
  backgroundColor?: string;
  borderColor?: string;
  textColor?: string;
  titleColor?: string;
  descriptionColor?: string;
  iconBackgroundColor?: string;
  iconColor?: string;
  accentColor?: string;
}

interface GridListProps {
  items: GridListItemConfig[];
  className?: string;
  layoutClassName?: string;
  itemClassName?: string;
  headerClassName?: string;
  titleClassName?: string;
  iconWrapperClassName?: string;
  contentClassName?: string;
  descriptionClassName?: string;
  accentClassName?: string;
  showAccent?: boolean;
  gap?: string;
  // Default color props that apply to all items
  backgroundColor?: string;
  borderColor?: string;
  textColor?: string;
  titleColor?: string;
  descriptionColor?: string;
  iconBackgroundColor?: string;
  iconColor?: string;
  accentColor?: string;
  // Wrapper container props
  containerClassName?: string;
  containerBackgroundColor?: string;
  containerPadding?: string;
  containerBorderRadius?: string;
  showContainer?: boolean;
}

export const GridList = ({
  items,
  className,
  layoutClassName,
  itemClassName,
  headerClassName,
  titleClassName,
  iconWrapperClassName,
  contentClassName,
  descriptionClassName,
  accentClassName,
  showAccent,
  gap,
  backgroundColor = defaultCardStyles.backgroundColor,
  borderColor = defaultCardStyles.borderColor,
  textColor = defaultCardStyles.textColor,
  titleColor = defaultCardStyles.titleColor,
  descriptionColor = defaultCardStyles.descriptionColor,
  iconBackgroundColor = defaultCardStyles.iconBackgroundColor,
  iconColor = defaultCardStyles.iconColor,
  accentColor = defaultCardStyles.accentColor,
  containerClassName,
  containerBackgroundColor,
  containerPadding,
  containerBorderRadius,
  showContainer = false,
}: GridListProps) => {
  const gridContent = (
    <div
      className={cn(
        'grid grid-cols-1 gap-4 my-8 w-full md:gap-6 md:grid-cols-2 lg:grid-cols-2',
        layoutClassName,
        className
      )}
      style={gap ? { gap } : undefined}
    >
      {items.map((item, index) => (
        <GridListItem
          key={index}
          {...item}
          className={cn(itemClassName, item.className)}
          headerClassName={cn(headerClassName, item.headerClassName)}
          titleClassName={cn(titleClassName, item.titleClassName)}
          iconWrapperClassName={cn(
            iconWrapperClassName,
            item.iconWrapperClassName
          )}
          contentClassName={cn(contentClassName, item.contentClassName)}
          descriptionClassName={cn(
            descriptionClassName,
            item.descriptionClassName
          )}
          accentClassName={cn(accentClassName, item.accentClassName)}
          showAccent={item.showAccent ?? showAccent}
          backgroundColor={item.backgroundColor ?? backgroundColor}
          borderColor={item.borderColor ?? borderColor}
          textColor={item.textColor ?? textColor}
          titleColor={item.titleColor ?? titleColor}
          descriptionColor={item.descriptionColor ?? descriptionColor}
          iconBackgroundColor={item.iconBackgroundColor ?? iconBackgroundColor}
          iconColor={item.iconColor ?? iconColor}
          accentColor={item.accentColor ?? accentColor}
        />
      ))}
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

export const GridListItem = ({
  title,
  description,
  icon,
  className,
  headerClassName,
  titleClassName,
  iconWrapperClassName,
  contentClassName,
  descriptionClassName,
  accentClassName,
  showAccent = true,
  backgroundColor = defaultCardStyles.backgroundColor,
  borderColor = defaultCardStyles.borderColor,
  textColor = defaultCardStyles.textColor,
  titleColor = defaultCardStyles.titleColor,
  descriptionColor = defaultCardStyles.descriptionColor,
  iconBackgroundColor = defaultCardStyles.iconBackgroundColor,
  iconColor = defaultCardStyles.iconColor,
  accentColor = defaultCardStyles.accentColor,
}: GridListItemConfig) => {
  const cardStyle: CSSProperties = {
    backgroundColor,
    borderColor,
    color: textColor,
  };

  return (
    <Card
      className={cn(
        'group relative h-full w-full min-w-0 overflow-hidden rounded-2xl border-2 shadow-sm transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/20',
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
      <CardHeader
        className={cn(
          'flex flex-row items-center gap-3 p-4 pb-0 md:gap-4 md:p-6',
          headerClassName
        )}
      >
        {icon && (
          <span
            className={cn(
              'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all duration-300 group-hover:scale-110 md:h-10 md:w-10',
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
        <CardTitle
          className={cn(
            'text-sm font-semibold tracking-tight min-w-0 flex-1 md:text-base',
            titleClassName
          )}
          style={{ color: titleColor }}
        >
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent
        className={cn(
          'p-4 pt-3 text-xs leading-relaxed md:p-6 md:pt-4 md:text-sm',
          contentClassName
        )}
      >
        {description && (
          <p
            className={cn(
              'text-xs leading-relaxed md:text-sm',
              descriptionClassName
            )}
            style={{ color: descriptionColor }}
          >
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  );
};
