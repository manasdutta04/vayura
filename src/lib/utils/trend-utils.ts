/**
 * Trend calculation utilities for Vayura
 * Compares current values with previous values to determine trend direction
 */

export type TrendDirection = 'up' | 'down' | 'stable';

export interface TrendResult {
  direction: TrendDirection;
  percentageChange: number;
  isSignificant: boolean;
}

/**
 * Calculate the trend direction between current and previous values
 * @param currentValue - The current metric value
 * @param previousValue - The previous metric value
 * @param threshold - Percentage threshold to consider change as significant (default: 2%)
 * @returns TrendResult object with direction, percentage change, and significance
 */
export function getTrend(
  currentValue: number,
  previousValue: number | null | undefined,
  threshold: number = 2
): TrendResult {
  // If no previous value, consider it stable
  if (previousValue === null || previousValue === undefined || previousValue === 0) {
    return {
      direction: 'stable',
      percentageChange: 0,
      isSignificant: false,
    };
  }

  // Calculate percentage change
  const percentageChange = ((currentValue - previousValue) / previousValue) * 100;
  const absoluteChange = Math.abs(percentageChange);

  // Determine if change is significant based on threshold
  const isSignificant = absoluteChange >= threshold;

  // Determine direction
  let direction: TrendDirection = 'stable';
  if (isSignificant) {
    direction = percentageChange > 0 ? 'up' : 'down';
  }

  return {
    direction,
    percentageChange,
    isSignificant,
  };
}

/**
 * Get trend for inverted metrics (where lower is better, e.g., AQI, pollution)
 * @param currentValue - The current metric value
 * @param previousValue - The previous metric value
 * @param threshold - Percentage threshold to consider change as significant (default: 2%)
 * @returns TrendResult object with inverted direction interpretation
 */
export function getInvertedTrend(
  currentValue: number,
  previousValue: number | null | undefined,
  threshold: number = 2
): TrendResult {
  const trend = getTrend(currentValue, previousValue, threshold);
  
  // Invert the direction for inverted metrics
  if (trend.direction === 'up') {
    return { ...trend, direction: 'down' };
  } else if (trend.direction === 'down') {
    return { ...trend, direction: 'up' };
  }
  
  return trend;
}

/**
 * Format percentage change for display
 * @param percentageChange - The percentage change value
 * @returns Formatted string with sign and percentage
 */
export function formatPercentageChange(percentageChange: number): string {
  const sign = percentageChange > 0 ? '+' : '';
  return `${sign}${percentageChange.toFixed(1)}%`;
}

/**
 * Get trend color based on direction and whether metric is inverted
 * @param direction - The trend direction
 * @param isInverted - Whether the metric is inverted (lower is better)
 * @returns Color class for the trend
 */
export function getTrendColor(direction: TrendDirection, isInverted: boolean = false): string {
  if (direction === 'stable') return 'text-gray-500';
  
  if (isInverted) {
    // For inverted metrics (like AQI), down is good, up is bad
    return direction === 'down' ? 'text-green-600' : 'text-red-600';
  } else {
    // For normal metrics, up is good, down is bad
    return direction === 'up' ? 'text-green-600' : 'text-red-600';
  }
}

/**
 * Get background color for trend badge
 * @param direction - The trend direction
 * @param isInverted - Whether the metric is inverted (lower is better)
 * @returns Background color class for the trend badge
 */
export function getTrendBgColor(direction: TrendDirection, isInverted: boolean = false): string {
  if (direction === 'stable') return 'bg-gray-100';
  
  if (isInverted) {
    return direction === 'down' ? 'bg-green-50' : 'bg-red-50';
  } else {
    return direction === 'up' ? 'bg-green-50' : 'bg-red-50';
  }
}
