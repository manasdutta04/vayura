import { adminDb } from '@/lib/firebase-admin';
import { AnalyticsData, MetricSnapshot, RegionalAnalytics, PredictiveInsights, ComparativeAnalytics } from '@/lib/types/analytics';
import { District, LeaderboardEntry, TreeContribution, Donation } from '@/lib/types';
import { QueryDocumentSnapshot } from 'firebase-admin/firestore';

// In-memory cache for analytics data
let cachedData: { data: AnalyticsData; timestamp: number } | null = null;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function getAnalyticsData(): Promise<AnalyticsData> {
    // Check cache
    const now_ts = Date.now();
    if (cachedData && (now_ts - cachedData.timestamp < CACHE_TTL)) {
        return cachedData.data;
    }

    const isConfigured = !!process.env.FIREBASE_PROJECT_ID;

    if (!isConfigured) {
        const mock = getMockAnalyticsData();
        cachedData = { data: mock, timestamp: Date.now() };
        return mock;
    }

    // 1. Fetch all districts for regional data
    const districtsSnapshot = await adminDb.collection('districts').get();
    const districts = districtsSnapshot.docs.map((doc: QueryDocumentSnapshot) => ({ id: doc.id, ...doc.data() } as District & { avgAQI?: number }));

    // 2. Fetch all contributions for time-series
    const contributionsSnapshot = await adminDb.collection('tree_contributions').get();
    const contributions = contributionsSnapshot.docs.map((doc: QueryDocumentSnapshot) => ({ id: doc.id, ...doc.data() } as unknown as TreeContribution));

    // 3. Fetch all donations
    const donationsSnapshot = await adminDb.collection('donations').get();
    const donations = donationsSnapshot.docs.map((doc: QueryDocumentSnapshot) => ({ id: doc.id, ...doc.data() } as unknown as Donation));

    // 4. Fetch leaderboard for state-level data
    const leaderboardSnapshot = await adminDb.collection('leaderboard').get();
    const leaderboard = leaderboardSnapshot.docs.map((doc: QueryDocumentSnapshot) => ({ id: doc.id, ...doc.data() } as LeaderboardEntry));

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
    districts.forEach((d) => {
        if (d.avgAQI) {
            totalAQI += d.avgAQI;
            countAQI++;
        }
    });
    globalMetrics.avgAQI = countAQI > 0 ? totalAQI / countAQI : 0;

    // 6. Generate Time Series (Last 6 months)
    const timeSeries = generateTimeSeries(contributions, donations);

    // 7. Regional Analytics
    const regionalData: RegionalAnalytics[] = leaderboard.map((state: LeaderboardEntry) => {
        const o2Demand = state.o2Needed || ((state.population ?? 0) * 550 * 365 * 1.429 / 1000) || 0;
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
        ? (last3Months[last3Months.length - 1].totalTrees - last3Months[0].totalTrees) / (last3Months.length - 1)
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

    // Add AI insights if Gemini is configured
    if (process.env.GEMINI_API_KEY) {
        try {
            const aiInsights = await generateAIInsights({
                globalMetrics,
                regionalData,
                predictive
            });
            predictive.aiSummary = aiInsights.summary;
            predictive.recommendations = aiInsights.recommendations;
        } catch (error) {
            console.error('Error generating AI insights:', error);
        }
    }

    const result = {
        globalMetrics,
        regionalData,
        comparative,
        predictive,
        timeSeries,
    };

    // Update cache
    cachedData = { data: result, timestamp: Date.now() };

    return result;
}

function generateTimeSeries(contributions: TreeContribution[], donations: Donation[]): MetricSnapshot[] {
    const months = 6;
    const now = new Date();
    const series: MetricSnapshot[] = [];

    for (let i = months - 1; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);

        const monthContribs = contributions.filter((c) => {
            const d = c.plantedAt instanceof Date ? c.plantedAt : (c.plantedAt as unknown as { toDate: () => Date }).toDate();
            return d <= monthEnd;
        });

        const monthDonations = donations.filter((d) => {
            const date = d.donatedAt instanceof Date ? d.donatedAt : (d.donatedAt as unknown as { toDate: () => Date }).toDate();
            return date <= monthEnd;
        });

        const totalTrees = monthContribs.reduce((sum, c) => sum + (c.treeQuantity || 0), 0) +
            monthDonations.reduce((sum, d) => sum + (d.treeCount || 0), 0);

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

function getMockAnalyticsData(): AnalyticsData {
    const now = new Date();
    const timeSeries: MetricSnapshot[] = [];

    for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const baseTrees = 5000 + (5 - i) * 1200;
        timeSeries.push({
            timestamp: date,
            totalTrees: baseTrees,
            totalOxygen: baseTrees * 110,
            avgAQI: 140 - (5 - i) * 8,
            totalDistricts: 766,
            contributionCount: 150 + Math.floor(Math.random() * 100),
        });
    }

    const globalMetrics = timeSeries[timeSeries.length - 1];

    const regions = [
        { name: 'Uttar Pradesh', trees: 1200000, aqi: 180, pop: 240000000 },
        { name: 'Maharashtra', trees: 950000, aqi: 140, pop: 120000000 },
        { name: 'Karnataka', trees: 820000, aqi: 120, pop: 68000000 },
        { name: 'Tamil Nadu', trees: 780000, aqi: 110, pop: 76000000 },
        { name: 'Gujarat', trees: 720000, aqi: 150, pop: 63000000 },
    ];

    const regionalData: RegionalAnalytics[] = regions.map(r => {
        const o2Demand = r.pop * 550 * 365 * 1.429 / 1000;
        const o2Supply = r.trees * 110;
        return {
            regionName: r.name,
            regionType: 'state' as const,
            metrics: {
                totalTrees: r.trees,
                oxygenProduction: o2Supply,
                avgAQI: r.aqi,
                population: r.pop,
                oxygenDemand: o2Demand,
                oxygenGap: Math.max(0, o2Demand - o2Supply),
            },
            trends: [],
        };
    });

    const nationalAvg = {
        totalTrees: 600000,
        oxygenProduction: 600000 * 110,
        avgAQI: 145,
        oxygenDemand: 80000000 * 550 * 365 * 1.429 / 1000,
    };

    const comparative: ComparativeAnalytics[] = regionalData.map(state => ({
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
        },
    }));

    const treesNeeded = 50000000;
    const growthRate = 1200;

    const predictive: PredictiveInsights = {
        projectedOxygen2030: globalMetrics.totalOxygen * 1.5,
        treesNeededForSelfSufficiency: treesNeeded,
        estimatedYearsToGoal: Math.round(treesNeeded / (growthRate * 12)),
        currentGrowthRate: growthRate,
        aiSummary: "Based on current trends, tree planting initiatives are showing strong growth in urban centers. However, rural oxygen production gaps persist due to industrial expansion. A focused effort on fast-growing native species in high-density districts could accelerate self-sufficiency by 15%.",
        recommendations: [
            "Increase planting density in high-AQI districts like Delhi NCR and Lucknow.",
            "Prioritize Peepal and Banyan trees for higher oxygen output per square meter.",
            "Implement community-led 'Oxygen Hubs' in industrial zones."
        ]
    };

    return {
        globalMetrics,
        regionalData,
        comparative,
        predictive,
        timeSeries,
    };
}

async function generateAIInsights(data: {
    globalMetrics: MetricSnapshot;
    regionalData: RegionalAnalytics[];
    predictive: PredictiveInsights;
}): Promise<{ summary: string; recommendations: string[] }> {
    const apiKey = process.env.GEMINI_API_KEY;
    const modelName = 'gemini-1.5-flash';

    const prompt = `As an environmental data analyst for Vayura (an oxygen intelligence platform), analyze this current data and provide a concise summary and 3 strategic recommendations.

Current Data:
- Total Trees: ${data.globalMetrics.totalTrees}
- Total Oxygen Production: ${data.globalMetrics.totalOxygen} kg/year
- National Average AQI: ${data.globalMetrics.avgAQI}
- Trees Needed for Self-Sufficiency: ${data.predictive.treesNeededForSelfSufficiency}
- Estimated Years to Goal: ${data.predictive.estimatedYearsToGoal}
- Current Growth Rate: ${data.predictive.currentGrowthRate} trees/month

Regional Highlights:
${data.regionalData.slice(0, 3).map(r => `- ${r.regionName}: ${r.metrics.totalTrees} trees, Gap: ${r.metrics.oxygenGap} kg`).join('\n')}

Return ONLY a JSON object with this format:
{
  "summary": "concise paragraph (max 3 sentences) analyzing the trend",
  "recommendations": ["recommendation 1", "recommendation 2", "recommendation 3"]
}`;

    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: {
                        temperature: 0.2,
                        maxOutputTokens: 500,
                    },
                }),
            }
        );

        if (!response.ok) throw new Error('Gemini API failed');

        const result = await response.json();
        const text = result.candidates[0]?.content?.parts[0]?.text;

        // Extract JSON from response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error('No JSON found in response');

        return JSON.parse(jsonMatch[0]);
    } catch (error) {
        console.error('Gemini error:', error);
        return {
            summary: "Unable to generate AI summary at this time.",
            recommendations: ["Ensure your planting data is up to date.", "Focus on high-impact urban areas.", "Monitor local AQI trends."]
        };
    }
}
