// Core domain types for the application
import type { LeaderboardEntry } from './firestore';

export interface District {
    id: string;
    name: string;
    slug: string;
    state: string;
    population: number;
    latitude: number;
    longitude: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface EnvironmentalData {
    id: string;
    districtId: string;
    aqi: number;
    pm25?: number;
    soilQuality: number;
    disasterFrequency: number;
    recommendations?: TreeRecommendation[];
    dataSource?: string;
    timestamp: Date;
    createdAt: Date;
}

export type ContributionStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';

export interface TreeContribution {
    id: string;
    districtId: string;
    districtName?: string;
    state?: string;
    treeName?: string;
    treeQuantity?: number;
    totalLifespanO2?: number; // Total O2 production over tree's lifespan (kg)
    o2ProductionPerYear?: number; // O2 production per tree per year (kg)
    estimatedLifespan?: number; // Estimated tree lifespan in years
    estimatedAge?: number; // Estimated current age in years
    healthScore?: number; // Health score 0-100
    speciesConfidence?: 'high' | 'medium' | 'low'; // Confidence in species identification
    analysisNotes?: string; // Notes from AI analysis
    userId?: string; // Firebase Auth UID
    type?: 'plantation' | 'donation';
    status: ContributionStatus;
    userName?: string;
    userEmail?: string;
    notes?: string;
    imageUrl?: string;
    storagePath?: string;
    latitude?: number;
    longitude?: number;
    plantedAt: Date;
    verifiedAt?: Date;
    verifiedBy?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface Donation {
    id: string;
    districtId: string;
    ngoReference: string;
    treeCount: number;
    externalId?: string;
    donorEmail?: string;
    amount?: number;
    donatedAt: Date;
    createdAt: Date;
    // Display fields for verified donations
    districtName?: string;
    state?: string;
    treeName?: string;
    totalLifespanO2?: number;
}

// Re-export from firestore for consistency
export type { LeaderboardEntry } from './firestore';

// API Response types

export interface FormulaBreakdown {
    human_o2_demand_liters: number;
    human_o2_demand_kg: number;
    aqi_penalty_factor: number;
    soil_degradation_factor: number;
    disaster_loss_factor: number;
    total_penalty: number;
    adjusted_o2_demand_kg: number;
    per_tree_o2_supply_kg: number;
    soil_adjusted_tree_supply_kg: number;
}

export interface OxygenCalculation {
    district_name: string;
    population: number;
    human_o2_demand_kg_per_year: number;
    penalty_adjusted_demand_kg_per_year: number;
    per_tree_o2_supply_kg_per_year: number;
    oxygen_deficit_kg_per_year: number;
    trees_required: number;
    trees_required_hectares: number;
    formula_breakdown: FormulaBreakdown;
    assumptions: string[];
    confidence_level: 'high' | 'medium' | 'low';
    data_sources: string[];
}

export interface TreeRecommendation {
    speciesName: string;
    scientificName?: string;
    suitabilityScore: number; // 0-100
    survivalProbability: number; // 0-100
    oxygenEfficiency: 'high' | 'medium' | 'low';
    soilSuitability: string;
    climateSuitability: string;
    nativeStatus: 'native' | 'introduced' | 'endemic';
    description: string;
}

export interface DistrictDetail extends District {
    environmentalData: EnvironmentalData;
    oxygenCalculation: OxygenCalculation;
    leaderboard?: LeaderboardEntry;
    recommendations?: TreeRecommendation[];
    stats?: {
        totalTreesPlanted: number;
        totalTreesDonated: number;
        totalTrees: number;
        oxygenOffset: number;
    };
}

export interface DistrictSearchResult {
    id: string;
    name: string;
    slug: string;
    state: string;
    population: number;
}

// AQI Categories for color coding
export type AQICategory = 'good' | 'moderate' | 'unhealthy' | 'veryUnhealthy' | 'hazardous';

export interface AQICategoryInfo {
    category: AQICategory;
    color: string;
    label: string;
    description: string;
}

// Image upload types
export interface ImageUploadResult {
    url: string;
    key: string;
}

// Error types
export interface APIError {
    error: string;
    message: string;
    statusCode: number;
}
