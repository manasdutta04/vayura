import { adminDb } from '@/lib/firebase-admin';
import { AnalyticsData, MetricSnapshot, RegionalAnalytics, PredictiveInsights, ComparativeAnalytics } from '@/lib/types/analytics';
import { Collections } from '@/lib/types/firestore';
import { QueryDocumentSnapshot } from 'firebase-admin/firestore';

export async function getAnalyticsData(): Promise<AnalyticsData> {
    // 1. Fetch all districts for regional data
    const districtsSnapshot = await adminDb.collection(Collections.DISTRICTS).get();
    const districts = districtsSnapshot.docs.map((doc: QueryDocumentSnapshot) => ({ id: doc.id, ...doc.data() } as any));

    // 2. Fetch all contributions for time-series
    const contributionsSnapshot = await adminDb.collection(Collections.TREE_CONTRIBUTIONS).get();
    const contributions = contributionsSnapshot.docs.map((doc: QueryDocumentSnapshot) => doc.data());

    // 3. Fetch all donations
    const donationsSnapshot = await adminDb.collection(Collections.DONATIONS).get();
    const donations = donationsSnapshot.docs.map((doc: QueryDocumentSnapshot) => doc.data());

    // 4. Fetch leaderboard for state-level data
    const leaderboardSnapshot = await adminDb.collection('leaderboard').get();
    const leaderboard = leaderboardSnapshot.docs.map((doc: QueryDocumentSnapshot) => doc.data());

    // 5. Aggregate Global Metrics
    const globalStatsDoc = await adminDb.collection('aggregated_stats').doc('global').get();
    const globalStats = globalStatsDoc.data() || { totalTrees: 0, totalOxygen: 0, totalDistricts: 0 };

    const globalMetrics: MetricSnapshot = {
        timestamp: new Date(),
        totalTrees: globalStats.totalTrees || 0,
        totalOxygen: globalStats.totalOxygen || 0,
        avgAQI: 0, // Will calculate below
        totalDistricts: districts.length,
        contributionCount: contributions.length + donations.length,
    };

    // Calculate Average AQI
    let totalAQI = 0;
    let countAQI = 0;
    districts.forEach((d: any) => {
        if (d.avgAQI) {
            totalAQI += d.avgAQI;
            countAQI++;
        }
    });
    globalMetrics.avgAQI = countAQI > 0 ? totalAQI / countAQI : 0;

    // 6. Generate Time Series (Last 6 months)
    const timeSeries = generateTimeSeries(contributions, donations);

    // 7. Regional Analytics
    const regionalData: RegionalAnalytics[] = leaderboard.map((state: any) => {
        const o2Demand = state.o2Needed || (state.population * 550 * 365 * 1.429 / 1000) || 0;
        const o2Supply = state.totalO2Supply || 0;
        
        return {
            regionName: state.state,
            regionType: 'state' as const,
            metrics: {
                totalTrees: state.totalTrees || 0,
                oxygenProduction: o2Supply,
                avgAQI: state.avgAQI || 0,
                population: state.population || 0,
                oxygenDemand: o2Demand,
                oxygenGap: Math.max(0, o2Demand - o2Supply),
            },
            trends: [], // Simplified for now
        };
    }).sort((a: RegionalAnalytics, b: RegionalAnalytics) => b.metrics.totalTrees - a.metrics.totalTrees);

    // 8. Comparative Analytics (State vs National)
    const nationalAvg = {
        totalTrees: globalMetrics.totalTrees / (leaderboard.length || 1),
        oxygenProduction: globalMetrics.totalOxygen / (leaderboard.length || 1),
        avgAQI: globalMetrics.avgAQI,
        oxygenDemand: regionalData.reduce((sum: number, r: RegionalAnalytics) => sum + r.metrics.oxygenDemand, 0) / (leaderboard.length || 1),
    };

    const comparative: ComparativeAnalytics[] = regionalData.slice(0, 5).map((state: RegionalAnalytics) => ({
        subject: state,
        benchmark: {
            regionName: 'National Average',
            regionType: 'national' as const,
            metrics: {
                totalTrees: nationalAvg.totalTrees,
                oxygenProduction: nationalAvg.oxygenProduction,
                avgAQI: nationalAvg.avgAQI,
                population: 0,
                oxygenDemand: nationalAvg.oxygenDemand,
                oxygenGap: Math.max(0, nationalAvg.oxygenDemand - nationalAvg.oxygenProduction),
            },
            trends: [],
        }
    }));

    // 9. Predictive Insights
    // Calculate growth rate from last 3 months
    const last3Months = timeSeries.slice(-3);
    const growthRate = last3Months.length >= 2 
        ? (last3Months[last3Months.length-1].totalTrees - last3Months[0].totalTrees) / (last3Months.length - 1)
        : contributions.length / 12;

    const totalDemand = regionalData.reduce((sum: number, r: RegionalAnalytics) => sum + r.metrics.oxygenDemand, 0);
    const currentO2 = globalMetrics.totalOxygen;
    const o2PerTree = 110; // kg/year
    
    const treesNeeded = Math.max(0, (totalDemand - currentO2) / o2PerTree);
    const yearsToGoal = growthRate > 0 ? (treesNeeded / (growthRate * 12)) : 99;

    const predictive: PredictiveInsights = {
        projectedOxygen2030: currentO2 + (growthRate * 12 * 5 * o2PerTree), // 5 years from now
        treesNeededForSelfSufficiency: Math.round(treesNeeded),
        estimatedYearsToGoal: Math.round(yearsToGoal),
        currentGrowthRate: Math.round(growthRate),
    };

    return {
        globalMetrics,
        regionalData,
        comparative,
        predictive,
        timeSeries,
    };
}

function generateTimeSeries(contributions: any[], donations: any[]): MetricSnapshot[] {
    const months = 6;
    const now = new Date();
    const series: MetricSnapshot[] = [];

    for (let i = months - 1; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);

        const monthContribs = contributions.filter((c: any) => {
            const d = c.plantedAt?.toDate?.() || new Date(c.plantedAt);
            return d <= monthEnd;
        });

        const monthDonations = donations.filter((d: any) => {
            const date = d.donatedAt?.toDate?.() || new Date(d.donatedAt);
            return date <= monthEnd;
        });

        const totalTrees = monthContribs.reduce((sum: number, c: any) => sum + (c.treeQuantity || 0), 0) +
                           monthDonations.reduce((sum: number, d: any) => sum + (d.treeCount || 0), 0);

        series.push({
            timestamp: date,
            totalTrees,
            totalOxygen: totalTrees * 110, // Approx
            avgAQI: 0,
            totalDistricts: 0,
            contributionCount: monthContribs.length + monthDonations.length,
        });
    }

    return series;
}
