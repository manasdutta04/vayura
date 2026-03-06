/**
 * User Impact Calculation Utilities
 * Calculates district-wise impact of user's tree contributions
 */

import { ENVIRONMENTAL_CONSTANTS } from '@/lib/constants/environmental';
import { TreeContribution, Donation, DistrictImpact, UserImpact, OxygenCalculation } from '@/lib/types';

const { OXYGEN } = ENVIRONMENTAL_CONSTANTS;

/**
 * Calculate oxygen offset for a given number of trees
 * Uses the standard annual oxygen production per mature tree
 * 
 * @param treeCount - Number of trees
 * @returns Oxygen offset in kg/year
 */
export function calculateOxygenOffset(treeCount: number): number {
    return treeCount * OXYGEN.PRODUCTION_PER_TREE_KG_YEAR;
}

/**
 * Calculate percentage of district deficit offset by user's contribution
 * 
 * @param oxygenOffset - User's oxygen offset in kg/year
 * @param districtDeficit - District's total oxygen deficit in kg/year
 * @returns Percentage of deficit offset (0-100+)
 */
export function calculatePercentageOffset(oxygenOffset: number, districtDeficit: number): number {
    if (districtDeficit <= 0) {
        // If deficit is 0 or negative (surplus), treat as 0% offset
        return 0;
    }
    const percentage = (oxygenOffset / districtDeficit) * 100;
    return Math.round(percentage * 100) / 100; // Round to 2 decimal places
}

/**
 * Aggregate contributions by district
 * 
 * @param contributions - Array of tree contributions
 * @param donations - Array of donations
 * @returns Map of districtId to tree count with verification status
 */
export function aggregateContributionsByDistrict(
    contributions: TreeContribution[],
    donations: Donation[]
): Map<string, { treeCount: number; state?: string; pendingTreeCount?: number; verifiedTreeCount?: number }> {
    const districtMap = new Map<string, { treeCount: number; state?: string; pendingTreeCount?: number; verifiedTreeCount?: number }>();

    // Include both VERIFIED and PENDING contributions
    const validContributions = contributions.filter(c => c.status === 'VERIFIED' || c.status === 'PENDING');
    
    for (const contribution of validContributions) {
        const districtId = contribution.districtId;
        const treeQuantity = contribution.treeQuantity || 1;
        
        const existing = districtMap.get(districtId);
        if (existing) {
            existing.treeCount += treeQuantity;
            if (contribution.status === 'VERIFIED') {
                existing.verifiedTreeCount = (existing.verifiedTreeCount || 0) + treeQuantity;
            } else if (contribution.status === 'PENDING') {
                existing.pendingTreeCount = (existing.pendingTreeCount || 0) + treeQuantity;
            }
        } else {
            districtMap.set(districtId, { 
                treeCount: treeQuantity,
                state: contribution.state,
                verifiedTreeCount: contribution.status === 'VERIFIED' ? treeQuantity : 0,
                pendingTreeCount: contribution.status === 'PENDING' ? treeQuantity : 0
            });
        }
    }

    // Aggregate donations
    for (const donation of donations) {
        const districtId = donation.districtId;
        const treeCount = donation.treeCount || 0;
        
        if (treeCount > 0) {
            const existing = districtMap.get(districtId);
            if (existing) {
                existing.treeCount += treeCount;
            } else {
                districtMap.set(districtId, { 
                    treeCount,
                    state: donation.state
                });
            }
        }
    }

    return districtMap;
}

/**
 * Calculate user impact breakdown by district
 * 
 * @param contributions - Array of tree contributions
 * @param donations - Array of donations
 * @param districtData - Map of districtId to district info (name, state, oxygen deficit)
 * @returns UserImpact object with district-wise breakdown
 */
export function calculateUserImpact(
    contributions: TreeContribution[],
    donations: Donation[],
    districtData: Map<string, { name: string; state?: string; oxygenDeficit: number }>
): UserImpact {
    // Aggregate contributions by district
    const districtContributions = aggregateContributionsByDistrict(contributions, donations);

    const districts: DistrictImpact[] = [];
    let totalTrees = 0;
    let totalOxygenOffset = 0;

    // Calculate impact for each district
    for (const [districtId, data] of districtContributions) {
        const districtInfo = districtData.get(districtId);
        
        if (!districtInfo) {
            // Skip if district data not available
            continue;
        }

        const oxygenOffset = calculateOxygenOffset(data.treeCount);
        const percentageOffset = calculatePercentageOffset(oxygenOffset, districtInfo.oxygenDeficit);

        totalTrees += data.treeCount;
        totalOxygenOffset += oxygenOffset;

        districts.push({
            districtId,
            districtName: districtInfo.name,
            state: data.state || districtInfo.state,
            treeCount: data.treeCount,
            oxygenOffset: Math.round(oxygenOffset * 100) / 100,
            percentageOffset,
            deficit: districtInfo.oxygenDeficit,
        });
    }

    // Sort by percentage offset (highest first)
    districts.sort((a, b) => b.percentageOffset - a.percentageOffset);

    // Find most impacted district (highest percentage offset)
    const mostImpactedDistrict = districts.length > 0 ? districts[0] : null;

    return {
        districts,
        mostImpactedDistrict,
        totalTrees,
        totalOxygenOffset: Math.round(totalOxygenOffset * 100) / 100,
        hasContributions: totalTrees > 0,
    };
}

/**
 * Extract oxygen deficit from district oxygen calculation
 * 
 * @param oxygenCalculation - Oxygen calculation object from district
 * @returns Oxygen deficit in kg/year
 */
export function getOxygenDeficit(oxygenCalculation: OxygenCalculation | null | undefined): number {
    if (!oxygenCalculation) {
        return 0;
    }
    // The deficit represents how much oxygen is needed to meet demand
    // This is the penalty_adjusted_demand since we assume no existing trees
    return oxygenCalculation.penalty_adjusted_demand_kg_per_year || 
           oxygenCalculation.oxygen_deficit_kg_per_year || 
           0;
}

