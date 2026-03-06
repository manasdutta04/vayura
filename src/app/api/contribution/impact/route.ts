import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { TreeContribution, Donation, DistrictImpact, UserImpactSummary } from '@/lib/types';
import { QueryDocumentSnapshot } from 'firebase-admin/firestore';
import { ENVIRONMENTAL_CONSTANTS } from '@/lib/constants/environmental';

export const dynamic = 'force-dynamic';

function timestampToDate(value: unknown): Date {
    if (!value) return new Date();
    if (typeof value === 'object' && value !== null && 'toDate' in value && typeof (value as { toDate: () => Date }).toDate === 'function') {
        return (value as { toDate: () => Date }).toDate();
    }
    return value instanceof Date ? value : new Date(value as string | number);
}

/**
 * Get oxygen deficit for a district from environmental_data
 */
async function getDistrictOxygenDeficit(districtId: string): Promise<number> {
    try {
        const envSnap = await adminDb.collection('environmental_data')
            .where('districtId', '==', districtId)
            .limit(1)
            .get();

        if (envSnap.empty) {
            return 0;
        }

        const envData = envSnap.docs[0].data();
        // Use the penalty-adjusted demand as the deficit
        // This represents the total oxygen needed for that district
        return envData.oxygenDeficit || envData.penaltyAdjustedDemand || 0;
    } catch (error) {
        console.error('Error fetching district oxygen deficit:', error);
        return 0;
    }
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json(
                { error: 'User ID is required' },
                { status: 400 }
            );
        }

        // Fetch user's verified tree contributions
        const contributionsRef = adminDb.collection('tree_contributions');
        const contributionsSnap = await contributionsRef
            .where('userId', '==', userId)
            .where('status', '==', 'VERIFIED')
            .limit(200)
            .get();

        const contributions = contributionsSnap.docs.map((doc: QueryDocumentSnapshot) => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                plantedAt: timestampToDate(data.plantedAt),
            } as TreeContribution;
        });

        // Fetch user's donations with districtId
        const donationsRef = adminDb.collection('donations');
        const donationsSnap = await donationsRef
            .limit(200)
            .get();

        // Filter donations by user email if available - for now get all and filter in memory
        // In production, you'd want to filter by userId or donorEmail
        const donations = donationsSnap.docs
            .map((doc: QueryDocumentSnapshot) => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    donatedAt: timestampToDate(data.donatedAt),
                } as Donation;
            })
            .filter((d: Donation) => d.districtId); // Only include donations with districtId

        // Aggregate contributions by district
        const districtMap = new Map<string, {
            trees: number;
            oxygenOffset: number;
            districtName: string;
            state?: string;
        }>();

        // Process tree contributions
        for (const contribution of contributions) {
            const districtId = contribution.districtId;
            if (!districtId) continue;

            const existing = districtMap.get(districtId) || { trees: 0, oxygenOffset: 0, districtName: contribution.districtName || 'Unknown', state: contribution.state };
            
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

            const existing = districtMap.get(districtId) || { trees: 0, oxygenOffset: 0, districtName: donation.districtName || 'Unknown', state: donation.state };

            const treeCount = donation.treeCount || 1;
            const oxygenOffset = donation.totalLifespanO2 || 
                (treeCount * ENVIRONMENTAL_CONSTANTS.OXYGEN.PRODUCTION_PER_TREE_KG_YEAR * ENVIRONMENTAL_CONSTANTS.TREES.DEFAULT_LIFESPAN_YEARS);

            existing.trees += treeCount;
            existing.oxygenOffset += oxygenOffset;
            if (donation.districtName) existing.districtName = donation.districtName;
            if (donation.state) existing.state = donation.state;

            districtMap.set(districtId, existing);
        }

        // Get oxygen deficits for each district and calculate impact
        const districtImpacts: DistrictImpact[] = [];
        
        for (const [districtId, data] of districtMap) {
            const districtDeficitKg = await getDistrictOxygenDeficit(districtId);
            const percentOfDeficit = districtDeficitKg > 0 
                ? (data.oxygenOffset / districtDeficitKg) * 100 
                : 0;

            districtImpacts.push({
                districtId,
                districtName: data.districtName,
                state: data.state,
                // New field names
                treeCount: data.trees,
                oxygenOffset: Math.round(data.oxygenOffset * 100) / 100,
                percentageOffset: Math.round(percentOfDeficit * 100) / 100,
                deficit: Math.round(districtDeficitKg * 100) / 100,
                // Legacy field names (backward compatibility)
                treesContributed: data.trees,
                oxygenOffsetKg: Math.round(data.oxygenOffset * 100) / 100,
                districtTotalDeficitKg: Math.round(districtDeficitKg * 100) / 100,
                percentOfDeficitOffset: Math.round(percentOfDeficit * 100) / 100,
            });
        }

        // Sort by percent of deficit offset (most impactful first)
        districtImpacts.sort((a, b) => (b.percentOfDeficitOffset || 0) - (a.percentOfDeficitOffset || 0));

        // Find most impacted district
        const mostImpactedDistrict = districtImpacts.length > 0 ? districtImpacts[0] : null;

        // Calculate totals
        const totalTrees = districtImpacts.reduce((sum, d) => sum + (d.treesContributed || 0), 0);
        const totalOxygenOffset = districtImpacts.reduce((sum, d) => sum + (d.oxygenOffsetKg || 0), 0);

        const impactSummary: UserImpactSummary = {
            userId,
            totalTrees,
            totalOxygenOffsetKg: Math.round(totalOxygenOffset * 100) / 100,
            totalDistricts: districtImpacts.length,
            districtImpacts,
            mostImpactedDistrict: mostImpactedDistrict || undefined,
        };

        return NextResponse.json(impactSummary);
    } catch (error) {
        console.error('Error fetching user impact:', error);
        return NextResponse.json(
            { error: 'Failed to fetch impact data' },
            { status: 500 }
        );
    }
}
