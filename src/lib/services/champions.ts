/**
 * District Champions Service
 * Handles badge calculation, contributor rankings, and leaderboard generation
 */

import { adminDb } from '@/lib/firebase-admin';
import {
    Badge,
    BadgeType,
    BADGE_DEFINITIONS,
    ContributorProfile,
    ContributorLeaderboardEntry,
    ContributorLeaderboardResponse,
    LeaderboardScope,
    CONTRIBUTORS_COLLECTION,
} from '@/lib/types/champions';

// Calculate badges for a user based on their contributions
export function calculateBadges(
    verifiedTrees: number,
    districtRank: number | null,
    stateRank: number | null,
    existingBadges: Badge[] = [],
    districtInfo?: { id: string; name: string; state: string }
): Badge[] {
    const badges: Badge[] = [...existingBadges];
    const now = new Date();

    const hasBadge = (type: BadgeType) => badges.some(b => b.type === type);

    // Green Starter - First verified contribution
    if (verifiedTrees >= 1 && !hasBadge('GREEN_STARTER')) {
        badges.push({
            id: `badge_green_starter_${Date.now()}`,
            type: 'GREEN_STARTER',
            name: BADGE_DEFINITIONS.GREEN_STARTER.name,
            description: BADGE_DEFINITIONS.GREEN_STARTER.description,
            icon: BADGE_DEFINITIONS.GREEN_STARTER.icon,
            earnedAt: now,
        });
    }

    // Oxygen Guardian - 10+ verified trees
    if (verifiedTrees >= 10 && !hasBadge('OXYGEN_GUARDIAN')) {
        badges.push({
            id: `badge_oxygen_guardian_${Date.now()}`,
            type: 'OXYGEN_GUARDIAN',
            name: BADGE_DEFINITIONS.OXYGEN_GUARDIAN.name,
            description: BADGE_DEFINITIONS.OXYGEN_GUARDIAN.description,
            icon: BADGE_DEFINITIONS.OXYGEN_GUARDIAN.icon,
            earnedAt: now,
        });
    }

    // Eco Warrior - 50+ verified trees
    if (verifiedTrees >= 50 && !hasBadge('ECO_WARRIOR')) {
        badges.push({
            id: `badge_eco_warrior_${Date.now()}`,
            type: 'ECO_WARRIOR',
            name: BADGE_DEFINITIONS.ECO_WARRIOR.name,
            description: BADGE_DEFINITIONS.ECO_WARRIOR.description,
            icon: BADGE_DEFINITIONS.ECO_WARRIOR.icon,
            earnedAt: now,
        });
    }

    // Forest Legend - 100+ verified trees
    if (verifiedTrees >= 100 && !hasBadge('FOREST_LEGEND')) {
        badges.push({
            id: `badge_forest_legend_${Date.now()}`,
            type: 'FOREST_LEGEND',
            name: BADGE_DEFINITIONS.FOREST_LEGEND.name,
            description: BADGE_DEFINITIONS.FOREST_LEGEND.description,
            icon: BADGE_DEFINITIONS.FOREST_LEGEND.icon,
            earnedAt: now,
        });
    }

    // District Champion - Top contributor in district
    if (districtRank === 1 && districtInfo && !hasBadge('DISTRICT_CHAMPION')) {
        badges.push({
            id: `badge_district_champion_${districtInfo.id}_${Date.now()}`,
            type: 'DISTRICT_CHAMPION',
            name: BADGE_DEFINITIONS.DISTRICT_CHAMPION.name,
            description: BADGE_DEFINITIONS.DISTRICT_CHAMPION.description,
            icon: BADGE_DEFINITIONS.DISTRICT_CHAMPION.icon,
            earnedAt: now,
            districtId: districtInfo.id,
            districtName: districtInfo.name,
            state: districtInfo.state,
        });
    }

    // State Champion - Top contributor in state
    if (stateRank === 1 && districtInfo && !hasBadge('STATE_CHAMPION')) {
        badges.push({
            id: `badge_state_champion_${districtInfo.state}_${Date.now()}`,
            type: 'STATE_CHAMPION',
            name: BADGE_DEFINITIONS.STATE_CHAMPION.name,
            description: BADGE_DEFINITIONS.STATE_CHAMPION.description,
            icon: BADGE_DEFINITIONS.STATE_CHAMPION.icon,
            earnedAt: now,
            state: districtInfo.state,
        });
    }

    return badges;
}

// Get or create contributor profile
export async function getContributorProfile(userId: string): Promise<ContributorProfile | null> {
    try {
        const doc = await adminDb.collection(CONTRIBUTORS_COLLECTION).doc(userId).get();
        if (!doc.exists) return null;

        const data = doc.data();
        return {
            userId: doc.id,
            ...data,
            badges: data?.badges || [],
            lastUpdated: data?.lastUpdated?.toDate() || new Date(),
            firstContributionAt: data?.firstContributionAt?.toDate(),
            lastContributionAt: data?.lastContributionAt?.toDate(),
        } as ContributorProfile;
    } catch (error) {
        console.error('Error fetching contributor profile:', error);
        return null;
    }
}

// Update contributor profile with latest stats
export async function updateContributorProfile(
    userId: string,
    userName: string,
    userEmail?: string,
    photoURL?: string
): Promise<ContributorProfile | null> {
    try {
        // Fetch all verified contributions for this user
        const contributionsSnap = await adminDb.collection('tree_contributions')
            .where('userId', '==', userId)
            .where('status', '==', 'VERIFIED')
            .get();

        let totalTreesPlanted = 0;
        let totalO2Impact = 0;
        let firstContributionAt: Date | undefined;
        let lastContributionAt: Date | undefined;
        let primaryDistrictId: string | undefined;
        let primaryDistrictName: string | undefined;
        let primaryState: string | undefined;

        // Track contributions by district for ranking
        const districtContributions: Record<string, { count: number; name: string; state: string }> = {};

        contributionsSnap.docs.forEach((doc: FirebaseFirestore.QueryDocumentSnapshot) => {
            const data = doc.data();
            const quantity = data.treeQuantity || 1;
            totalTreesPlanted += quantity;

            // Calculate O2 impact
            if (data.totalLifespanO2) {
                totalO2Impact += data.totalLifespanO2;
            } else {
                totalO2Impact += quantity * 110 * 50; // Default: 110 kg/year * 50 years
            }

            // Track dates
            const plantedAt = data.plantedAt?.toDate() || new Date();
            if (!firstContributionAt || plantedAt < firstContributionAt) {
                firstContributionAt = plantedAt;
            }
            if (!lastContributionAt || plantedAt > lastContributionAt) {
                lastContributionAt = plantedAt;
            }

            // Track district contributions
            const districtId = data.districtId;
            if (districtId) {
                if (!districtContributions[districtId]) {
                    districtContributions[districtId] = {
                        count: 0,
                        name: data.districtName || 'Unknown',
                        state: data.state || 'Unknown',
                    };
                }
                districtContributions[districtId].count += quantity;
            }
        });

        // Find primary district (most contributions)
        let maxContributions = 0;
        for (const [districtId, info] of Object.entries(districtContributions)) {
            if (info.count > maxContributions) {
                maxContributions = info.count;
                primaryDistrictId = districtId;
                primaryDistrictName = info.name;
                primaryState = info.state;
            }
        }

        // Fetch donations
        const donationsSnap = await adminDb.collection('donations')
            .where('userId', '==', userId)
            .get();

        let totalTreesDonated = 0;
        donationsSnap.docs.forEach((doc: FirebaseFirestore.QueryDocumentSnapshot) => {
            const data = doc.data();
            totalTreesDonated += data.treeCount || 0;
        });

        const totalTrees = totalTreesPlanted + totalTreesDonated;

        // Get existing profile for badges
        const existingProfile = await getContributorProfile(userId);
        const existingBadges = existingProfile?.badges || [];

        // Calculate rankings (simplified - in production, use batch processing)
        let districtRank: number | undefined;
        let stateRank: number | undefined;

        if (primaryDistrictId) {
            // Get district ranking
            const districtContributors = await getTopContributorsForDistrict(primaryDistrictId, 100);
            const userIndex = districtContributors.findIndex(c => c.userId === userId);
            districtRank = userIndex >= 0 ? userIndex + 1 : undefined;

            // Get state ranking
            if (primaryState) {
                const stateContributors = await getTopContributorsForState(primaryState, 100);
                const stateIndex = stateContributors.findIndex(c => c.userId === userId);
                stateRank = stateIndex >= 0 ? stateIndex + 1 : undefined;
            }
        }

        // Calculate badges
        const badges = calculateBadges(
            totalTreesPlanted,
            districtRank ?? null,
            stateRank ?? null,
            existingBadges,
            primaryDistrictId ? {
                id: primaryDistrictId,
                name: primaryDistrictName || 'Unknown',
                state: primaryState || 'Unknown',
            } : undefined
        );

        const profile: ContributorProfile = {
            userId,
            userName,
            userEmail,
            photoURL,
            totalTreesPlanted,
            totalTreesDonated,
            totalTrees,
            totalO2Impact,
            verifiedContributions: contributionsSnap.size,
            districtRank,
            districtId: primaryDistrictId,
            districtName: primaryDistrictName,
            stateRank,
            state: primaryState,
            badges,
            firstContributionAt,
            lastContributionAt,
            lastUpdated: new Date(),
        };

        // Save to Firestore
        await adminDb.collection(CONTRIBUTORS_COLLECTION).doc(userId).set(profile, { merge: true });

        return profile;
    } catch (error) {
        console.error('Error updating contributor profile:', error);
        return null;
    }
}

// Get top contributors for a district
export async function getTopContributorsForDistrict(
    districtId: string,
    limit: number = 10
): Promise<ContributorLeaderboardEntry[]> {
    try {
        // Aggregate contributions by user for this district
        const contributionsSnap = await adminDb.collection('tree_contributions')
            .where('districtId', '==', districtId)
            .where('status', '==', 'VERIFIED')
            .get();

        const userContributions: Record<string, {
            userName: string;
            totalTrees: number;
            totalO2Impact: number;
            verifiedContributions: number;
        }> = {};

        contributionsSnap.docs.forEach((doc: FirebaseFirestore.QueryDocumentSnapshot) => {
            const data = doc.data();
            const userId = data.userId;
            if (!userId) return;

            if (!userContributions[userId]) {
                userContributions[userId] = {
                    userName: data.userName || 'Anonymous',
                    totalTrees: 0,
                    totalO2Impact: 0,
                    verifiedContributions: 0,
                };
            }

            const quantity = data.treeQuantity || 1;
            userContributions[userId].totalTrees += quantity;
            userContributions[userId].totalO2Impact += data.totalLifespanO2 || (quantity * 110 * 50);
            userContributions[userId].verifiedContributions += 1;
        });

        // Sort by total trees and get top entries
        const sorted = Object.entries(userContributions)
            .sort((a, b) => b[1].totalTrees - a[1].totalTrees)
            .slice(0, limit);

        // Fetch user profiles for badges
        const entries: ContributorLeaderboardEntry[] = await Promise.all(
            sorted.map(async ([userId, stats], index) => {
                const profile = await getContributorProfile(userId);
                return {
                    rank: index + 1,
                    userId,
                    userName: stats.userName,
                    photoURL: profile?.photoURL,
                    totalTrees: stats.totalTrees,
                    totalO2Impact: stats.totalO2Impact,
                    verifiedContributions: stats.verifiedContributions,
                    badges: profile?.badges || [],
                };
            })
        );

        return entries;
    } catch (error) {
        console.error('Error fetching district contributors:', error);
        return [];
    }
}

// Get top contributors for a state
export async function getTopContributorsForState(
    state: string,
    limit: number = 10
): Promise<ContributorLeaderboardEntry[]> {
    try {
        // Aggregate contributions by user for this state
        const contributionsSnap = await adminDb.collection('tree_contributions')
            .where('state', '==', state)
            .where('status', '==', 'VERIFIED')
            .get();

        const userContributions: Record<string, {
            userName: string;
            districtName: string;
            totalTrees: number;
            totalO2Impact: number;
            verifiedContributions: number;
        }> = {};

        contributionsSnap.docs.forEach((doc: FirebaseFirestore.QueryDocumentSnapshot) => {
            const data = doc.data();
            const userId = data.userId;
            if (!userId) return;

            if (!userContributions[userId]) {
                userContributions[userId] = {
                    userName: data.userName || 'Anonymous',
                    districtName: data.districtName || 'Unknown',
                    totalTrees: 0,
                    totalO2Impact: 0,
                    verifiedContributions: 0,
                };
            }

            const quantity = data.treeQuantity || 1;
            userContributions[userId].totalTrees += quantity;
            userContributions[userId].totalO2Impact += data.totalLifespanO2 || (quantity * 110 * 50);
            userContributions[userId].verifiedContributions += 1;
        });

        // Sort by total trees and get top entries
        const sorted = Object.entries(userContributions)
            .sort((a, b) => b[1].totalTrees - a[1].totalTrees)
            .slice(0, limit);

        // Fetch user profiles for badges
        const entries: ContributorLeaderboardEntry[] = await Promise.all(
            sorted.map(async ([userId, stats], index) => {
                const profile = await getContributorProfile(userId);
                return {
                    rank: index + 1,
                    userId,
                    userName: stats.userName,
                    photoURL: profile?.photoURL,
                    totalTrees: stats.totalTrees,
                    totalO2Impact: stats.totalO2Impact,
                    verifiedContributions: stats.verifiedContributions,
                    badges: profile?.badges || [],
                    districtName: stats.districtName,
                    state,
                };
            })
        );

        return entries;
    } catch (error) {
        console.error('Error fetching state contributors:', error);
        return [];
    }
}

// Get national leaderboard
export async function getNationalLeaderboard(
    limit: number = 50
): Promise<ContributorLeaderboardEntry[]> {
    try {
        // Fetch top contributor profiles ordered by total trees
        const profilesSnap = await adminDb.collection(CONTRIBUTORS_COLLECTION)
            .orderBy('totalTrees', 'desc')
            .limit(limit)
            .get();

        const entries: ContributorLeaderboardEntry[] = profilesSnap.docs.map((doc: FirebaseFirestore.QueryDocumentSnapshot, index: number) => {
            const data = doc.data();
            return {
                rank: index + 1,
                userId: doc.id,
                userName: data.userName || 'Anonymous',
                photoURL: data.photoURL,
                totalTrees: data.totalTrees || 0,
                totalO2Impact: data.totalO2Impact || 0,
                verifiedContributions: data.verifiedContributions || 0,
                badges: data.badges || [],
                districtName: data.districtName,
                state: data.state,
            };
        });

        return entries;
    } catch (error) {
        console.error('Error fetching national leaderboard:', error);
        return [];
    }
}

// Get leaderboard based on scope
export async function getContributorLeaderboard(
    scope: LeaderboardScope,
    scopeId?: string,
    limit: number = 50
): Promise<ContributorLeaderboardResponse> {
    let entries: ContributorLeaderboardEntry[] = [];
    let scopeName: string | undefined;

    switch (scope) {
        case 'district':
            if (scopeId) {
                entries = await getTopContributorsForDistrict(scopeId, limit);
                // Get district name
                const districtDoc = await adminDb.collection('districts').doc(scopeId).get();
                scopeName = districtDoc.data()?.name;
            }
            break;
        case 'state':
            if (scopeId) {
                entries = await getTopContributorsForState(scopeId, limit);
                scopeName = scopeId;
            }
            break;
        case 'national':
            entries = await getNationalLeaderboard(limit);
            scopeName = 'India';
            break;
    }

    return {
        scope,
        scopeId,
        scopeName,
        entries,
        totalContributors: entries.length,
        lastUpdated: new Date(),
    };
}
