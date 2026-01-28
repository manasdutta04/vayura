export interface MetricSnapshot {
    timestamp: Date;
    totalTrees: number;
    totalOxygen: number;
    avgAQI: number;
    totalDistricts: number;
    contributionCount: number;
}

export interface RegionalAnalytics {
    regionName: string; // District or State name
    regionType: 'district' | 'state' | 'national';
    metrics: {
        totalTrees: number;
        oxygenProduction: number;
        avgAQI: number;
        population: number;
        oxygenDemand: number;
        oxygenGap: number;
    };
    trends: MetricSnapshot[];
}

export interface ComparativeAnalytics {
    subject: RegionalAnalytics;
    benchmark: RegionalAnalytics; // National or State average
}

export interface PredictiveInsights {
    projectedOxygen2030: number;
    treesNeededForSelfSufficiency: number;
    estimatedYearsToGoal: number;
    currentGrowthRate: number; // trees per month
    aiSummary?: string;
    recommendations?: string[];
}

export interface AnalyticsData {
    globalMetrics: MetricSnapshot;
    regionalData: RegionalAnalytics[];
    comparative: ComparativeAnalytics[];
    predictive: PredictiveInsights;
    timeSeries: MetricSnapshot[];
}
