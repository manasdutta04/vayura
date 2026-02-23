/**
 * District Champions Program Types
 * Defines types for contributor rankings and achievement badges
 */

// Achievement Badge Types
export type BadgeType =
    | 'seedling'
    | 'green_thumb'
    | 'eco_warrior'
    | 'oxygen_hero'
    | 'forest_guardian'
    | 'master_planter';

export interface Badge {
    id: string;
    type: BadgeType;
    name: string;
    description: string;
    icon: string;
    earnedAt: Date;
    // For location-based badges
    districtId?: string;
    districtName?: string;
    state?: string;
}

export interface BadgeDefinition {
    type: BadgeType;
    name: string;
    description: string;
    icon: string;
    requirement: string;
    tier: 'bronze' | 'silver' | 'gold' | 'platinum';
}

// All badge definitions
export const BADGE_DEFINITIONS: Record<BadgeType, BadgeDefinition> = {
    seedling: {
        type: 'seedling',
        name: 'Seedling Planter',
        description: 'Planted your first tree!',
        requirement: 'Plant 1 tree',
        icon: 'Sprout',
        tier: 'bronze',
    },
    green_thumb: {
        type: 'green_thumb',
        name: 'Green Thumb',
        description: 'A growing contribution to the environment.',
        requirement: 'Plant 5 trees',
        icon: 'TreeDeciduous',
        tier: 'bronze',
    },
    eco_warrior: {
        type: 'eco_warrior',
        name: 'Eco Warrior',
        description: 'Making a significant impact on your district.',
        requirement: 'Plant 25 trees',
        icon: 'Shield',
        tier: 'silver',
    },
    oxygen_hero: {
        type: 'oxygen_hero',
        name: 'Oxygen Hero',
        description: 'Providing clean air for dozens of people.',
        requirement: 'Plant 50 trees',
        icon: 'Wind',
        tier: 'gold',
    },
    forest_guardian: {
        type: 'forest_guardian',
        name: 'Forest Guardian',
        description: 'Protecting and restoring entire ecosystems.',
        requirement: 'Plant 100 trees',
        icon: 'Trophy',
        tier: 'platinum',
    },
    master_planter: {
        type: 'master_planter',
        name: 'Master Planter',
        description: 'Leading India towards a greener future.',
        requirement: 'Plant 250+ trees',
        icon: 'Crown',
        tier: 'platinum',
    },
};

// Contributor Profile with rankings
export interface ContributorProfile {
    userId: string;
    userName: string;
    userEmail?: string;
    photoURL?: string;

    // Contribution Stats
    totalTreesPlanted: number;
    totalTreesDonated: number;
    totalTrees: number;
    totalO2Impact: number;
    verifiedContributions: number;

    // Rankings
    districtRank?: number;
    districtId?: string;
    districtName?: string;
    stateRank?: number;
    state?: string;
    nationalRank?: number;

    // Badges
    badges: Badge[];

    // Timestamps
    firstContributionAt?: Date;
    lastContributionAt?: Date;
    lastUpdated: Date;
}

// Leaderboard Entry for Contributors
export interface ContributorLeaderboardEntry {
    rank: number;
    userId: string;
    userName: string;
    photoURL?: string;
    totalTrees: number;
    totalO2Impact: number;
    verifiedContributions: number;
    badges: Badge[];
    districtName?: string;
    state?: string;
    isCurrentUser?: boolean;
}

// Leaderboard Types
export type LeaderboardScope = 'district' | 'state' | 'national';

export interface ContributorLeaderboardResponse {
    scope: LeaderboardScope;
    scopeId?: string;
    scopeName?: string;
    entries: ContributorLeaderboardEntry[];
    totalContributors: number;
    lastUpdated: Date;
}

// Firestore collection for contributor profiles
export const CONTRIBUTORS_COLLECTION = 'contributor_profiles';
