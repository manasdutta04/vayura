/**
 * Confidence Score Calculator
 * 
 * Calculates a confidence score (0-100%) based on:
 * - Real-time cities → 70-85% (with live AQI data)
 * - Estimated cities → 30-50% (AI-estimated environmental data)
 * - Fallback-only → <30% (static/default data only)
 * 
 * Factor weights are configurable for easy adjustments.
 */

export interface ConfidenceFactors {
  hasRealtimeAQI: boolean;
  aqiSource: string;
  usedGemini: boolean;
  populationYear: number;
  dataFreshnessHours: number;
}

export interface ConfidenceWeights {
  realtimeAQI: number;
  fallbackAQI: number;
  geminiData: number;
  fallbackDataset: number;
  recentPopulation: number;
  oldPopulation: number;
  freshData: number;
  staleData: number;
}

export const DEFAULT_CONFIDENCE_WEIGHTS: ConfidenceWeights = {
  realtimeAQI: 30,
  fallbackAQI: 10,
  geminiData: 25,
  fallbackDataset: 15,
  recentPopulation: 25,
  oldPopulation: 10,
  freshData: 15,
  staleData: 0,
};

const CURRENT_YEAR = new Date().getFullYear();
// Consider population "recent" if within 3 years
// This reflects realistic update frequency of demographic datasets (census-based)
// rather than real-time data sources
const MAX_POPULATION_AGE_YEARS = 3;

/**
 * Determines if AQI source is from Gemini (AI-estimated)
 */
function isGeminiAQI(source: string): boolean {
  return source === 'gemini_ai_fallback';
}

/**
 * Determines if population data is recent (within MAX_POPULATION_AGE_YEARS)
 */
function isRecentPopulation(populationYear: number): boolean {
  // Handle invalid/unknown population year as old
  if (!populationYear || populationYear < 1900 || populationYear > CURRENT_YEAR + 1) {
    return false;
  }
  return CURRENT_YEAR - populationYear <= MAX_POPULATION_AGE_YEARS;
}

/**
 * Determines if data is fresh (within last 24 hours)
 * 0 hours means data is fresh (just updated)
 */
function isFreshData(freshnessHours: number): boolean {
  return freshnessHours >= 0 && freshnessHours <= 24;
}

/**
 * Calculate confidence score based on data quality factors
 * 
 * Score ranges:
 * - Real-time cities (live AQI): 70-85%
 * - Estimated cities (AI-estimated): 30-50%
 * - Fallback-only (static data): <30%
 * 
 * @param factors - Object containing data quality factors
 * @param weights - Optional custom weights (uses defaults if not provided)
 * @returns Confidence score between 0-100
 */
export function calculateConfidenceScore(
  factors: ConfidenceFactors,
  weights: ConfidenceWeights = DEFAULT_CONFIDENCE_WEIGHTS
): number {
  let score = 0;

  // AQI Source Score - Primary factor for confidence differentiation
  if (factors.hasRealtimeAQI) {
    // Real-time AQI: High confidence (30 points)
    score += weights.realtimeAQI;
  } else if (isGeminiAQI(factors.aqiSource)) {
    // Gemini AI-estimated: Medium confidence (25 points)
    score += weights.geminiData;
  } else {
    // Fallback/static data: Low confidence (10 points)
    score += weights.fallbackAQI;
  }

  // Population Data Score
  if (isRecentPopulation(factors.populationYear)) {
    score += weights.recentPopulation;
  } else {
    score += weights.oldPopulation;
  }

  // Gemini Data Usage Score (if used for any data)
  // This boosts estimated cities to the 30-50% range
  if (factors.usedGemini) {
    score += weights.geminiData;
  }

  // Data Freshness Score - Recent data adds confidence
  if (isFreshData(factors.dataFreshnessHours)) {
    score += weights.freshData;
  }
  // No points added for stale data (already accounted in other factors)

  // Clamp score to 0-100 range
  return Math.min(100, Math.max(0, score));
}

/**
 * Get confidence level category based on score
 */
export function getConfidenceLevel(score: number): 'high' | 'medium' | 'low' {
  if (score >= 80) return 'high';
  if (score >= 50) return 'medium';
  return 'low';
}

/**
 * Get color for confidence badge
 */
export function getConfidenceColor(score: number): string {
  if (score >= 80) return '#22c55e'; // green-500
  if (score >= 50) return '#eab308'; // yellow-500
  return '#ef4444'; // red-500
}

/**
 * Get CSS color class for confidence badge
 */
export function getConfidenceColorClass(score: number): string {
  if (score >= 80) return 'bg-green-100 text-green-800 border-green-300';
  if (score >= 50) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
  return 'bg-red-100 text-red-800 border-red-300';
}

/**
 * Get tooltip text explaining confidence score calculation
 */
export function getConfidenceTooltipText(factors: ConfidenceFactors): string {
  const parts: string[] = [];

  // AQI source
  if (factors.hasRealtimeAQI) {
    parts.push('Real-time AQI data');
  } else if (isGeminiAQI(factors.aqiSource)) {
    parts.push('AI-estimated AQI');
  } else {
    parts.push('Static AQI estimate');
  }

  // Population
  if (isRecentPopulation(factors.populationYear)) {
    parts.push(`Population data from ${factors.populationYear}`);
  } else {
    parts.push(`Older population data (${factors.populationYear})`);
  }

  // Data freshness
  if (isFreshData(factors.dataFreshnessHours)) {
    parts.push('Data refreshed within 24 hours');
  } else {
    parts.push('Data may be outdated');
  }

  return parts.join(' • ');
}

/**
 * Get a descriptive label for the confidence score category
 */
export function getConfidenceDescription(score: number): string {
  if (score >= 70) return 'High confidence - Real-time data available';
  if (score >= 30) return 'Medium confidence - AI-estimated data';
  return 'Low confidence - Static/fallback data only';
}

/**
 * Get a short label for the confidence score
 */
export function getConfidenceLabel(score: number): string {
  if (score >= 70) return 'Real-time';
  if (score >= 30) return 'Estimated';
  return 'Fallback';
}
