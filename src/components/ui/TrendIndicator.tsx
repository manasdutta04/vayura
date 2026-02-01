import React from 'react';
import { ArrowUp, ArrowDown, ArrowRight } from 'lucide-react';
import { getTrend, getTrendColor, getTrendBgColor, formatPercentageChange, TrendDirection } from '@/lib/utils/trend-utils';
import { cn } from '@/lib/utils/helpers';

export interface TrendIndicatorProps {
  currentValue: number;
  previousValue: number | null | undefined;
  threshold?: number;
  isInverted?: boolean;
  showPercentage?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'minimal' | 'badge' | 'detailed';
  className?: string;
}

/**
 * TrendIndicator Component
 * Displays a visual indicator showing trend direction (↑ ↓ →)
 * 
 * @param currentValue - Current metric value
 * @param previousValue - Previous metric value for comparison
 * @param threshold - Percentage threshold for significant change (default: 2%)
 * @param isInverted - Whether lower values are better (e.g., AQI, pollution)
 * @param showPercentage - Whether to show percentage change
 * @param size - Icon size variant
 * @param variant - Display style variant
 * @param className - Additional CSS classes
 */
export const TrendIndicator: React.FC<TrendIndicatorProps> = ({
  currentValue,
  previousValue,
  threshold = 2,
  isInverted = false,
  showPercentage = false,
  size = 'md',
  variant = 'minimal',
  className,
}) => {
  const trend = getTrend(currentValue, previousValue, threshold);
  const trendColor = getTrendColor(trend.direction, isInverted);
  const trendBgColor = getTrendBgColor(trend.direction, isInverted);

  // Icon size mapping
  const iconSizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  // Text size mapping
  const textSizeClasses = {
    sm: 'text-[10px]',
    md: 'text-xs',
    lg: 'text-sm',
  };

  // Render icon based on direction
  const renderIcon = () => {
    const iconClass = cn(iconSizeClasses[size], trendColor);
    
    switch (trend.direction) {
      case 'up':
        return <ArrowUp className={iconClass} />;
      case 'down':
        return <ArrowDown className={iconClass} />;
      case 'stable':
      default:
        return <ArrowRight className={iconClass} />;
    }
  };

  // Don't show indicator if no previous value
  if (previousValue === null || previousValue === undefined) {
    return null;
  }

  // Minimal variant - just the icon
  if (variant === 'minimal') {
    return (
      <span className={cn('inline-flex items-center', className)} title={`${formatPercentageChange(trend.percentageChange)} from previous`}>
        {renderIcon()}
      </span>
    );
  }

  // Badge variant - icon with background
  if (variant === 'badge') {
    return (
      <span 
        className={cn(
          'inline-flex items-center gap-1 px-2 py-0.5 rounded-full',
          trendBgColor,
          textSizeClasses[size],
          'font-medium',
          className
        )}
        title={`${formatPercentageChange(trend.percentageChange)} from previous`}
      >
        {renderIcon()}
        {showPercentage && (
          <span className={trendColor}>
            {formatPercentageChange(trend.percentageChange)}
          </span>
        )}
      </span>
    );
  }

  // Detailed variant - icon with percentage and label
  if (variant === 'detailed') {
    return (
      <div className={cn('inline-flex items-center gap-1.5', className)}>
        <span 
          className={cn(
            'inline-flex items-center gap-1 px-2 py-1 rounded-md',
            trendBgColor,
            textSizeClasses[size],
            'font-medium'
          )}
        >
          {renderIcon()}
          <span className={trendColor}>
            {formatPercentageChange(trend.percentageChange)}
          </span>
        </span>
        <span className={cn('text-gray-500', textSizeClasses[size])}>
          vs previous
        </span>
      </div>
    );
  }

  return null;
};

/**
 * Compact TrendArrow - Just the arrow with tooltip
 * Useful for tight spaces in cards and tables
 */
export const TrendArrow: React.FC<Omit<TrendIndicatorProps, 'variant'>> = (props) => {
  return <TrendIndicator {...props} variant="minimal" />;
};

/**
 * TrendBadge - Arrow with percentage in a badge
 * Good for prominent display areas
 */
export const TrendBadge: React.FC<Omit<TrendIndicatorProps, 'variant'>> = (props) => {
  return <TrendIndicator {...props} variant="badge" showPercentage />;
};

/**
 * TrendDetail - Full trend information with label
 * Best for detailed sections and summaries
 */
export const TrendDetail: React.FC<Omit<TrendIndicatorProps, 'variant'>> = (props) => {
  return <TrendIndicator {...props} variant="detailed" />;
};

export default TrendIndicator;
