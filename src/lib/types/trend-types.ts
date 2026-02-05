/**
 * Type definitions for historical data and trend tracking
 * Extends the existing types in Vayura to support trend indicators
 */

// Historical snapshot of district metrics
export interface HistoricalMetrics {
  timestamp: string; // ISO date string
  population: number;
  aqi: number;
  soilQuality: number;
  disasterFrequency: number;
  treeCount?: number;
  oxygenDemand: number;
  oxygenSupply: number;
  treesRequired: number;
}

// Previous period data for trend comparison
export interface PreviousData {
  population?: number;
  aqi?: number;
  soilQuality?: number;
  disasterFrequency?: number;
  treeCount?: number;
  oxygenDemand?: number;
  oxygenSupply?: number;
  treesRequired?: number;
  co2Absorption?: number;
  plantationProgress?: number;
}

// Extended DistrictDetail with historical data
export interface DistrictDetailWithTrends {
  // ... existing DistrictDetail fields
  id: string;
  name: string;
  state: string;
  slug: string;
  population: number;
  environmentalData: {
    aqi: number;
    soilQuality: number;
    disasterFrequency: number;
    dataSource?: string;
  };
  oxygenCalculation: {
    trees_required: number;
    formula_breakdown: {
      human_o2_demand_kg: number;
      adjusted_o2_demand_kg: number;
      soil_adjusted_tree_supply_kg: number;
      aqi_penalty_factor: number;
      soil_degradation_factor: number;
      disaster_loss_factor: number;
    };
    assumptions: string[];
    data_sources: string[];
    confidence_level: string;
  };
  
  // New fields for trend tracking
  previousData?: PreviousData;
  lastUpdated?: string;
  historicalSnapshots?: HistoricalMetrics[];
}

// Trend metadata for a specific metric
export interface MetricTrend {
  current: number;
  previous: number | null;
  direction: 'up' | 'down' | 'stable';
  percentageChange: number;
  isSignificant: boolean;
}

// Collection of all trends for a district
export interface DistrictTrends {
  population: MetricTrend;
  aqi: MetricTrend;
  soilQuality: MetricTrend;
  disasterFrequency: MetricTrend;
  treesRequired: MetricTrend;
  oxygenDemand: MetricTrend;
  oxygenSupply: MetricTrend;
}
