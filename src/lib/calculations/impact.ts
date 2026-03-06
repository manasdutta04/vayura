import { TreeContribution, Donation, DistrictImpact, UserImpactSummary } from '@/lib/types';
import { ENVIRONMENTAL_CONSTANTS } from '@/lib/constants/environmental';

interface DistrictSnapshot {
    districtId: string;
    districtName: string;
    state?: string;
    oxygenDeficitKg: number;
}

interface AggregatedDistrictData {
    trees: number;
    oxygenOffset: number;
    districtName: string;
    state?: string;
}

/**
 * Group contributions by district and aggregate data
 * @param contributions - Array of tree contributions
 * @param donations - Array of donations
 * @returns Map of districtId to aggregated data
 */
function groupByDistrict(
    contributions: TreeContribution[],
    donations: Donation[]
): Map<string, AggregatedDistrictData> {
    const districtMap = new Map<string, AggregatedDistrictData>();

    // Process tree contributions
    for (const contribution of contributions) {
        const districtId = contribution.districtId;
        if (!districtId) continue;

        const existing = districtMap.get(districtId) || { 
            trees: 0, 
            oxygenOffset: 0, 
            districtName: contribution.districtName || 'Unknown', 
            state: contribution.state 
        };
        
        const treeQuantity = contribution.treeQuantity || 1;
        const oxygenOffset = contribution.totalLifespanO2 || 
            (treeQuantity * ENVIRONMENTAL_CONSTANTS.OXYGEN.PRODUCTION_PER_TREE_KG_YEAR * ENVIRONMENTAL_CONSTANTS.TREES.DEFAULT_LIFESPAN_YEARS);

        existing.trees += treeQuantity;
        existing.oxygenOffset += oxygenOffset;
        if (contribution.districtName) existing.districtName = contribution.districtName;
        if (contribution.state) existing.state = contribution.state;

        districtMap.set(districtId, existing);
    }

    // Process donations
    for (const donation of donations) {
        const districtId = donation.districtId;
        if (!districtId) continue;

        const existing = districtMap.get(districtId) || { 
            trees: 0, 
            oxygenOffset: 0, 
            districtName: donation.districtName || 'Unknown', 
            state: donation.state 
        };

        const treeCount = donation.treeCount || 1;
        const oxygenOffset = donation.totalLifespanO2 || 
            (treeCount * ENVIRONMENTAL_CONSTANTS.OXYGEN.PRODUCTION_PER_TREE_KG_YEAR * ENVIRONMENTAL_CONSTANTS.TREES.DEFAULT_LIFESPAN_YEARS);

        existing.trees += treeCount;
        existing.oxygenOffset += oxygenOffset;
        if (donation.districtName) existing.districtName = donation.districtName;
        if (donation.state) existing.state = donation.state;

        districtMap.set(districtId, existing);
    }

    return districtMap;
}

/**
 * Calculate percentage of district deficit offset by user contributions
 * @param oxygenOffset - User's oxygen offset for the district
 * @param districtDeficitKg - Total district oxygen deficit
 * @returns Percentage (clamped to 100 max, 2 decimal places)
 */
function calculatePercentageOffset(oxygenOffset: number, districtDeficitKg: number): number {
    // Edge case: if deficit <= 0, percentage is 0
    if (districtDeficitKg <= 0) return 0;
    
    const percentage = (oxygenOffset / districtDeficitKg) * 100;
    
    // Clamp to 100 max
    const clamped = Math.min(percentage, 100);
    
    // Round to 2 decimal places, handle floating point noise
    return Math.round(clamped * 100) / 100;
}

/**
 * Main function to calculate user impact
 * @param contributions - User's tree contributions
 * @param donations - User's donations
 * @param districtSnapshots - Map of districtId to district data including oxygen deficit
 * @param userId - User ID
 * @returns UserImpactSummary with district-wise breakdown
 */
export function calculateUserImpact(
    contributions: TreeContribution[],
    donations: Donation[],
    districtSnapshots: Map<string, DistrictSnapshot>,
    userId: string
): UserImpactSummary {
    // Step 1: Group contributions by district
    const districtMap = groupByDistrict(contributions, donations);

    // Step 2: Calculate impact for each district
    const districtImpacts: DistrictImpact[] = [];
    
    for (const [districtId, data] of districtMap) {
        const snapshot = districtSnapshots.get(districtId);
        const districtDeficitKg = snapshot?.oxygenDeficitKg || 0;
        
        const percentOfDeficit = calculatePercentageOffset(data.oxygenOffset, districtDeficitKg);

        districtImpacts.push({
            districtId,
            districtName: data.districtName,
            state: data.state,
            // New field names
            treeCount: data.trees,
            oxygenOffset: Math.round(data.oxygenOffset * 100) / 100,
            percentageOffset: percentOfDeficit,
            deficit: Math.round(districtDeficitKg * 100) / 100,
            // Legacy field names (backward compatibility)
            treesContributed: data.trees,
            oxygenOffsetKg: Math.round(data.oxygenOffset * 100) / 100,
            districtTotalDeficitKg: Math.round(districtDeficitKg * 100) / 100,
            percentOfDeficitOffset: percentOfDeficit,
        });
    }

    // Step 3: Sort by percentage of deficit offset (most impactful first)
    districtImpacts.sort((a, b) => {
        // Primary: highest percentage offset
        const aPercent = a.percentOfDeficitOffset || 0;
        const bPercent = b.percentOfDeficitOffset || 0;
        if (bPercent !== aPercent) {
            return bPercent - aPercent;
        }
        // Tie-breaker: higher oxygen offset
        return (b.oxygenOffsetKg || 0) - (a.oxygenOffsetKg || 0);
    });

    // Find most impacted district (first after sorting)
    const mostImpactedDistrict = districtImpacts.length > 0 ? districtImpacts[0] : null;

    // Calculate totals
    const totalTrees = districtImpacts.reduce((sum, d) => sum + (d.treesContributed || 0), 0);
    const totalOxygenOffset = districtImpacts.reduce((sum, d) => sum + (d.oxygenOffsetKg || 0), 0);

    return {
        userId,
        totalTrees,
        totalOxygenOffsetKg: Math.round(totalOxygenOffset * 100) / 100,
        totalDistricts: districtImpacts.length,
        districtImpacts,
        mostImpactedDistrict: mostImpactedDistrict || undefined,
    };
}

/**
 * Validate that district data contains required fields
 * @param snapshot - District snapshot data
 * @returns Whether the snapshot has valid data for impact calculation
 */
export function isValidDistrictSnapshot(snapshot: DistrictSnapshot): boolean {
    return !!(
        snapshot.districtId &&
        snapshot.districtName &&
        typeof snapshot.oxygenDeficitKg === 'number'
    );
}
