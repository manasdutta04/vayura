'use client';

import { getConfidenceColorClass, getConfidenceLevel, getConfidenceTooltipText } from '@/lib/calculations/confidence';
import { HelpCircle } from 'lucide-react';

interface ConfidenceBadgeProps {
  score: number;
  factors?: {
    hasRealtimeAQI: boolean;
    aqiSource: string;
    usedGemini: boolean;
    populationYear: number;
    dataFreshnessHours: number;
  };
  showTooltip?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function ConfidenceBadge({
  score,
  factors,
  showTooltip = true,
  size = 'md'
}: ConfidenceBadgeProps) {
  const level = getConfidenceLevel(score);
  const colorClass = getConfidenceColorClass(score);

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-2',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  // Use dynamic tooltip if factors are provided, otherwise fallback to static
  const tooltipText = factors ? getConfidenceTooltipText(factors) : "Confidence score is based on data freshness, AQI source, and data aggregation method.";

  const getLevelLabel = () => {
    switch (level) {
      case 'high':
        return 'High Confidence';
      case 'medium':
        return 'Medium Confidence';
      case 'low':
        return 'Low Confidence';
    }
  };

  return (
    <div className="relative inline-flex items-center gap-1.5">
      <span
        className={`inline-flex items-center rounded-full border font-medium ${colorClass} ${sizeClasses[size]}`}
        title={showTooltip ? tooltipText : undefined}
      >
        <span className="mr-1.5">{score}%</span>
        <span className="opacity-80">{getLevelLabel()}</span>
      </span>

      {showTooltip && (
        <div className="group relative inline-flex items-center">
          <HelpCircle className={`${iconSizes[size]} text-gray-400 cursor-help hover:text-gray-600`} />
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 shadow-lg">
            <div className="font-semibold mb-1">How confidence is calculated:</div>
            <div className="text-gray-300">{tooltipText}</div>
            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"></div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Compact version of confidence badge for inline use
 */
export function ConfidenceIndicator({ score }: { score: number }) {
  const level = getConfidenceLevel(score);
  
  const colors = {
    high: 'bg-green-500',
    medium: 'bg-yellow-500',
    low: 'bg-red-500',
  };

  return (
    <div className="flex items-center gap-1.5" title={`Confidence: ${score}%`}>
      <div className={`w-2 h-2 rounded-full ${colors[level]}`} />
      <span className="text-xs text-gray-500">{score}%</span>
    </div>
  );
}
