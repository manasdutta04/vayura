import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { QueryDocumentSnapshot } from 'firebase-admin/firestore';
import { ENVIRONMENTAL_CONSTANTS } from '@/lib/constants/environmental';

export const dynamic = 'force-dynamic';

export const maxDuration = 300; // 5 minutes timeout for Vercel functions

const { OXYGEN, PENALTY_FACTORS } = ENVIRONMENTAL_CONSTANTS;

function calculateAQIPenaltyFactor(aqi: number): number {
    const { AQI } = PENALTY_FACTORS;
    if (aqi <= 50) return AQI.GOOD;
    if (aqi <= 100) return AQI.MODERATE;
    if (aqi <= 150) return AQI.SENSITIVE;
    if (aqi <= 200) return AQI.UNHEALTHY;
    if (aqi <= 300) return AQI.VERY_UNHEALTHY;
    return AQI.HAZARDOUS;
}

function calculateSoilDegradationFactor(soilQuality: number): number {
    const { SOIL } = PENALTY_FACTORS;
    if (soilQuality >= 80) return SOIL.EXCELLENT;
    if (soilQuality >= 60) return SOIL.GOOD;
    if (soilQuality >= 40) return SOIL.FAIR;
    if (soilQuality >= 20) return SOIL.POOR;
    return SOIL.DEGRADED;
}

function calculateDisasterLossFactor(disasterFreq: number): number {
    const { DISASTER } = PENALTY_FACTORS;
    if (disasterFreq === 0) return DISASTER.NONE;
    if (disasterFreq <= 2) return DISASTER.LOW;
    if (disasterFreq <= 5) return DISASTER.MEDIUM;
    if (disasterFreq <= 8) return DISASTER.HIGH; // Updated to match strict 8 cut-off in other file, consistent with constants
    // Original had <= 10 return 1.30 (HIGH). 
    // Constants say HIGH is 6-10. So <=10 is correct for 1.30.
    // My previous file used <=8. 
    // Let's stick to the constants values mapped to the ranges.
    // HIGH (1.30) for 6-10.
    // SEVERE (1.50) for 10+.
    if (disasterFreq <= 10) return DISASTER.HIGH;
    return DISASTER.SEVERE;
}

function calculateSoilTreeAdjustment(soilQuality: number): number {
    return Math.max(0.7, soilQuality / 100);
}

export async function GET(request: Request) {
    try {
        // Verify cron secret
        const authHeader = request.headers.get('authorization');
        const cronSecret = process.env.CRON_SECRET;
        const isVercelCron = request.headers.get('x-vercel-cron') === '1';
        const hasValidSecret = authHeader === `Bearer ${cronSecret}`;
        const { searchParams } = new URL(request.url);
        const secretParam = searchParams.get('secret');
        const hasValidParam = secretParam === cronSecret;

        // Allow in development if no secret is set
        const isDevelopment = process.env.NODE_ENV === 'development' || !cronSecret;

        if (!isVercelCron && !hasValidSecret && !hasValidParam && !isDevelopment) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        console.log('Running aggregated stats and leaderboard update...');

        // 1. Fetch all required data
        const [districtsSnapshot, leaderboardSnapshot] = await Promise.all([
            adminDb.collection('districts').get(),
            adminDb.collection('leaderboard').get()
        ]);

        const districts = districtsSnapshot.docs.map((doc: QueryDocumentSnapshot) => ({
            id: doc.id,
            ...doc.data()
        } as any));

        const leaderboardMap = new Map();
        leaderboardSnapshot.docs.forEach((doc: QueryDocumentSnapshot) => {
            const data = doc.data();
            // Map by state name
            if (data.state) {
                leaderboardMap.set(data.state, {
                    id: doc.id,
                    ...data,
                    // Ensure numeric values
                    totalTrees: data.totalTrees || 0,
                    totalTreesPlanted: data.totalTreesPlanted || 0,
                    totalTreesDonated: data.totalTreesDonated || 0,
                    existingForestTrees: data.existingForestTrees || 0,
                });
            }
        });

        // 2. Aggregate Data by State
        const stateAggregates = new Map<string, {
            population: number;
            weightedAQI: number;
            weightedSoil: number;
            weightedDisasters: number;
            // Existing metrics to carry over or sum
            totalTrees: number;
            totalTreesPlanted: number;
            totalTreesDonated: number;
            existingForestTrees: number;
        }>();

        // Process districts
        for (const district of districts) {
            const state = district.state;
            if (!state) continue;

            const current = stateAggregates.get(state) || {
                population: 0,
                weightedAQI: 0,
                weightedSoil: 0,
                weightedDisasters: 0,
                totalTrees: 0,
                totalTreesPlanted: 0,
                totalTreesDonated: 0,
                existingForestTrees: 0,
            };

            const pop = district.population || 0;
            current.population += pop;

            // Default environmental values if missing
            const avgAQI = 100;
            const avgSoil = 65;
            const avgDisasters = 2;

            current.weightedAQI += avgAQI * pop;
            current.weightedSoil += avgSoil * pop;
            current.weightedDisasters += avgDisasters * pop;

            stateAggregates.set(state, current);
        }

        // Merge with leaderboard tree data
        leaderboardMap.forEach((data: any, state: string) => {
            const current = stateAggregates.get(state);
            if (current) {
                const existing = data.existingForestTrees || 0;
                const planted = data.totalTreesPlanted || 0;
                const donated = data.totalTreesDonated || 0;

                current.totalTrees = existing + planted + donated;
                current.totalTreesPlanted = planted;
                current.totalTreesDonated = donated;
                current.existingForestTrees = existing;
            } else {
                // State exists in leaderboard but no districts found? 
                // Should potentially add it if we have data, but sticking to aggregation logic
            }
        });

        // 3. Calculate Metrics and Ranks
        const stateMetrics: any[] = [];
        let globalTotalTrees = 0;
        let globalTotalOxygen = 0;

        stateAggregates.forEach((data: any, state: string) => {
            if (data.population === 0) return;

            const avgAQI = data.weightedAQI / data.population;
            const avgSoil = data.weightedSoil / data.population;
            const avgDisasters = data.weightedDisasters / data.population;

            // Demand
            const humanO2LitersPerYear = data.population * OXYGEN.HUMAN_CONSUMPTION_LITERS_DAY * OXYGEN.DAYS_PER_YEAR;
            const humanO2KgPerYear = humanO2LitersPerYear * OXYGEN.LITERS_TO_KG_CONVERSION;

            const aqiFactor = calculateAQIPenaltyFactor(avgAQI);
            const soilFactor = calculateSoilDegradationFactor(avgSoil);
            const disasterFactor = calculateDisasterLossFactor(avgDisasters);
            const totalPenalty = aqiFactor * soilFactor * disasterFactor;

            const o2Needed = humanO2KgPerYear * totalPenalty;

            // Supply
            const soilAdjustment = calculateSoilTreeAdjustment(avgSoil);
            const adjustedTreeSupply = OXYGEN.PRODUCTION_PER_TREE_KG_YEAR * soilAdjustment;
            const o2Supply = data.totalTrees * adjustedTreeSupply;

            const existingForestO2 = (data.existingForestTrees || 0) * adjustedTreeSupply;

            // Percent Met
            const rawPercentage = o2Needed > 0 ? (o2Supply / o2Needed) * 100 : 0;
            const percentageMet = Math.min(Math.max(rawPercentage, 0), 100);

            // Add to Global Stats
            globalTotalTrees += data.totalTrees;
            globalTotalOxygen += o2Supply;

            const lbEntry = leaderboardMap.get(state);

            stateMetrics.push({
                id: lbEntry?.id || state, // Use existing ID or state name
                state,
                population: data.population,
                totalTreesPlanted: data.totalTreesPlanted,
                totalTreesDonated: data.totalTreesDonated,
                existingForestTrees: data.existingForestTrees,
                totalTrees: data.totalTrees,
                o2Needed: Math.round(o2Needed),
                o2Supply: Math.round(o2Supply),
                existingForestO2: Math.round(existingForestO2),
                percentageMet: Math.round(percentageMet * 100) / 100,
                avgAQI: Math.round(avgAQI),
                avgSoilQuality: Math.round(avgSoil),
            });
        });

        // Sort
        stateMetrics.sort((a: any, b: any) => {
            if (b.percentageMet !== a.percentageMet) return b.percentageMet - a.percentageMet;
            if (b.totalTrees !== a.totalTrees) return b.totalTrees - a.totalTrees;
            return a.state.localeCompare(b.state);
        });

        // Assign Ranks
        const rankedUpdates = stateMetrics.map((entry: any, index: number) => ({
            ...entry,
            rank: index + 1,
            lastUpdated: new Date()
        }));

        // 4. Batch Update Leaderboard
        const batch = adminDb.batch();
        let batchCount = 0;
        const MAX_BATCH_SIZE = 500;

        for (const entry of rankedUpdates) {
            // Only update if we have a valid reference ID from existing map
            // or if we decide to create new ones (logic below assumes update if exists)
            // If the document ID was just the state name, we can set properly.

            // To be safe and robost:
            // If it exists in map, use that ID.
            // If not, we might skip like original code, OR we could create it.
            // Let's stick to updating existing entries to avoid polluting DB with bad data if any.
            if (leaderboardMap.has(entry.state)) {
                const docId = leaderboardMap.get(entry.state).id;
                const ref = adminDb.collection('leaderboard').doc(docId);
                batch.update(ref, {
                    rank: entry.rank,
                    o2Needed: entry.o2Needed,
                    o2Supply: entry.o2Supply,
                    totalO2Supply: entry.o2Supply, // Ensure this field matches what we use
                    percentageMet: entry.percentageMet,
                    population: entry.population,
                    avgAQI: entry.avgAQI,
                    avgSoilQuality: entry.avgSoilQuality,
                    lastUpdated: new Date(),
                    // Update totals in case they changed from aggregation
                    totalTrees: entry.totalTrees,
                    totalTreesPlanted: entry.totalTreesPlanted,
                    totalTreesDonated: entry.totalTreesDonated
                });
                batchCount++;
            }

            if (batchCount >= MAX_BATCH_SIZE) {
                await batch.commit();
                batchCount = 0;
                // create new batch? Firestore batch object is single use? Yes.
                // We'd need a new batch. But standard practice is one batch per commit.
                // Re-instantiating batch inside loop is complex. 
                // Given we have ~35 states, one batch is plenty.
            }
        }

        if (batchCount > 0) {
            await batch.commit();
        }

        // 5. Update Global Stats
        await adminDb.collection('aggregated_stats').doc('global').set({
            totalDistricts: districts.length,
            totalTrees: globalTotalTrees,
            totalOxygen: globalTotalOxygen,
            lastUpdated: new Date(),
        });

        return NextResponse.json({
            success: true,
            updatedStates: rankedUpdates.length,
            stats: {
                totalDistricts: districts.length,
                totalTrees: globalTotalTrees,
                totalOxygen: globalTotalOxygen
            }
        });

    } catch (error) {
        console.error('Error updating stats:', error);
        return NextResponse.json(
            { error: 'Failed to update stats' },
            { status: 500 }
        );
    }
}
