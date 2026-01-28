/**
 * Firestore Database Collections and Types
 * Replaces Prisma schema with Firebase Firestore
 */

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
    status: ContributionStatus;
    userName?: string;
    userEmail?: string;
    notes?: string;
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
    userId?: string; // Firebase Auth UID
    ngoReference: string;
    treeCount: number;
    externalId?: string;
    donorEmail?: string;
    amount?: number;
    donatedAt: Date;
    createdAt: Date;
}

export interface LeaderboardEntry {
    id: string;
    state: string;
    population?: number;
    totalTreesPlanted: number;
    totalTreesDonated: number;
    totalTrees: number;
    existingForestTrees?: number; // Estimated from FSI forest cover data
    existingForestO2Production?: number; // kg/year from existing forests
    forestCoverKm2?: number; // Total forest + tree cover (km²)
    forestDataYear?: number; // Year of forest data
    forestDataSource?: string; // Source attribution
    o2Needed?: number; // kg/year
    o2Supply?: number; // kg/year from user-planted trees
    totalO2Supply?: number; // kg/year from all trees (existing + user-planted)
    percentageMet?: number; // percentage of O2 need met
    oxygenOffset?: number; // legacy field
    avgAQI?: number;
    avgSoilQuality?: number;
    rank?: number;
    lastUpdated?: Date;
    createdAt?: Date;
}

export interface UserProfile {
    id: string; // Firebase Auth UID
    name?: string;
    email: string;
    phone?: string;
    bio?: string;
    photoURL?: string;
    address?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface AggregatedStats {
    totalDistricts: number;
    totalTrees: number;
    totalOxygen: number;
    lastUpdated: Date;
}

// Firestore collection names
export const Collections = {
    DISTRICTS: 'districts',
    ENVIRONMENTAL_DATA: 'environmental_data',
    TREE_CONTRIBUTIONS: 'tree_contributions',
    DONATIONS: 'donations',
    LEADERBOARD: 'leaderboard',
    AGGREGATED_STATS: 'aggregated_stats',
    USERS: 'users',
} as const;
