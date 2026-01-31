/**
 * District Champions Program Types
 * Defines types for contributor rankings and achievement badges
 */

// Achievement Badge Types
export type BadgeType =
    | 'GREEN_STARTER'      // 🌱 First verified contribution
    | 'OXYGEN_GUARDIAN'    // 🌳 Significant contribution milestone (10+ trees)
    | 'DISTRICT_CHAMPION'  // 🏆 Top contributor in a district
    | 'STATE_CHAMPION'     // ⭐ Top contributor in a state
    | 'ECO_WARRIOR'        // 🛡️ 50+ verified trees
    | 'FOREST_LEGEND';     // 👑 100+ verified trees

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
    GREEN_STARTER: {
        type: 'GREEN_STARTER',
        name: 'Green Starter',
        description: 'Made your first verified contribution',
        icon: 'Sprout',
        requirement: '1 verified tree',
        tier: 'bronze',
    },
    OXYGEN_GUARDIAN: {
        type: 'OXYGEN_GUARDIAN',
        name: 'Oxygen Guardian',
        description: 'Significant environmental impact achieved',
        icon: 'TreeDeciduous',
        requirement: '10+ verified trees',
        tier: 'silver',
    },
    DISTRICT_CHAMPION: {
        type: 'DISTRICT_CHAMPION',
        name: 'District Champion',
        description: 'Top contributor in your district',
        icon: 'Trophy',
        requirement: '#1 in district',
        tier: 'gold',
    },
    STATE_CHAMPION: {
        type: 'STATE_CHAMPION',
        name: 'State Champion',
        description: 'Top contributor in your state',
        icon: 'Star',
        requirement: '#1 in state',
        tier: 'platinum',
    },
    ECO_WARRIOR: {
        type: 'ECO_WARRIOR',
        name: 'Eco Warrior',
        description: 'Committed environmental warrior',
        icon: 'Shield',
        requirement: '50+ verified trees',
        tier: 'gold',
    },
    FOREST_LEGEND: {
        type: 'FOREST_LEGEND',
        name: 'Forest Legend',
        description: 'Legendary contribution to the planet',
        icon: 'Crown',
        requirement: '100+ verified trees',
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
