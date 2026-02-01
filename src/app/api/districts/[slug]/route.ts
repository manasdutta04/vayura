import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { getAQIData } from '@/lib/data-sources/air-quality';
import { getSoilQualityData } from '@/lib/data-sources/soil-quality';
import { getDisasterData } from '@/lib/data-sources/disasters';
import { fetchPlantationRecommendations } from '@/lib/data-sources/gemini-data-fetcher';
import { DistrictDetail, EnvironmentalData, OxygenCalculation } from '@/lib/types';
import { calculateOxygenRequirements } from '@/lib/utils/oxygen-calculator';
import { QueryDocumentSnapshot } from 'firebase-admin/firestore';

export const dynamic = 'force-dynamic';

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

function timestampToDate(value: any): Date {
    if (!value) return new Date();
    if (typeof value.toDate === 'function') return value.toDate();
    return value instanceof Date ? value : new Date(value);
}

export async function GET(
    request: Request,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params;

        if (!slug) {
            return NextResponse.json(
                { error: 'District slug is required' },
                { status: 400 }
            );
        }

        // Fetch district by slug
        const districtsRef = adminDb.collection('districts');
        const districtSnap = await districtsRef.where('slug', '==', slug).limit(1).get();

        if (districtSnap.empty) {
            return NextResponse.json(
                { error: 'District not found' },
                { status: 404 }
            );
        }

        const districtDoc = districtSnap.docs[0];
        const district = { id: districtDoc.id, ...(districtDoc.data() as any) };

        // Fetch latest environmental data (cached 24h)
        // Get all env data for this district and sort in memory to avoid index requirement
        const envRef = adminDb.collection('environmental_data');
        const envSnap = await envRef
            .where('districtId', '==', district.id)
            .get();

        let envData: EnvironmentalData | null = null;
        const now = Date.now();

        if (!envSnap.empty) {
            // Sort by timestamp in memory (newest first)
            const sortedDocs = envSnap.docs.sort((a: QueryDocumentSnapshot, b: QueryDocumentSnapshot) => {
                const aTime = a.data().timestamp?.toDate?.() || a.data().timestamp || new Date(0);
                const bTime = b.data().timestamp?.toDate?.() || b.data().timestamp || new Date(0);
                return new Date(bTime).getTime() - new Date(aTime).getTime();
            });

            const envDoc = sortedDocs[0];
            const data = envDoc.data();
            envData = {
                id: envDoc.id,
                ...data,
                timestamp: timestampToDate(data.timestamp),
                createdAt: timestampToDate(data.createdAt),
            } as EnvironmentalData;
        }

        const url = new URL(request.url);
        const forceFresh = url.searchParams.get('fresh') === 'true';

        const isStale = !envData || forceFresh || (now - envData.timestamp.getTime() > ONE_DAY_MS);

        if (isStale) {
            const [aqiData, soilData, disasterData, recommendations] = await Promise.all([
                getAQIData(district.latitude, district.longitude, district.slug, district.name, district.state),
                getSoilQualityData(district.slug, district.name, district.state),
                getDisasterData(district.slug, district.name, district.state),
                fetchPlantationRecommendations(district.name, district.state),
            ]);

            const newEnvRef = adminDb.collection('environmental_data').doc();
            await newEnvRef.set({
                districtId: district.id,
                aqi: aqiData.aqi,
                pm25: aqiData.pm25,
                soilQuality: soilData.soilQuality,
                disasterFrequency: disasterData.disasterFrequency,
                recommendations: recommendations,
                dataSource: `${aqiData.source},${soilData.source},${disasterData.source},Gemini AI`,
                timestamp: new Date(),
                createdAt: new Date(),
            });

            envData = {
                id: newEnvRef.id,
                districtId: district.id,
                aqi: aqiData.aqi,
                pm25: aqiData.pm25,
                soilQuality: soilData.soilQuality,
                disasterFrequency: disasterData.disasterFrequency,
                recommendations: recommendations,
                dataSource: `${aqiData.source},${soilData.source},${disasterData.source},Gemini AI`,
                timestamp: new Date(),
                createdAt: new Date(),
            };
        }

        if (!envData) {
            return NextResponse.json(
                { error: 'Environmental data unavailable' },
                { status: 503 }
            );
        }

        // Calculate oxygen requirements
        // Try Python service first, fallback to local calculation
        let oxygenCalculation: OxygenCalculation;
        const pythonServiceUrl = process.env.PYTHON_SERVICE_URL;

        if (pythonServiceUrl && pythonServiceUrl !== 'http://localhost:8000') {
            try {
                const calcResponse = await fetch(`${pythonServiceUrl}/calculate`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        district_name: district.name,
                        population: district.population,
                        aqi: envData.aqi,
                        soil_quality: envData.soilQuality,
                        disaster_frequency: envData.disasterFrequency,
                    }),
                    cache: 'no-store',
                    signal: AbortSignal.timeout(5000), // 5 second timeout
                });

                if (calcResponse.ok) {
                    oxygenCalculation = await calcResponse.json();
                } else {
                    throw new Error('Python service returned error');
                }
            } catch (error) {
                console.warn('Python service unavailable, using local calculation:', error);
                // Fallback to local calculation
                oxygenCalculation = calculateOxygenRequirements({
                    district_name: district.name,
                    population: district.population,
                    aqi: envData.aqi,
                    soil_quality: envData.soilQuality,
                    disaster_frequency: envData.disasterFrequency,
                });
            }
        } else {
            // Use local calculation (no Python service configured)
            oxygenCalculation = calculateOxygenRequirements({
                district_name: district.name,
                population: district.population,
                aqi: envData.aqi,
                soil_quality: envData.soilQuality,
                disaster_frequency: envData.disasterFrequency,
            });
        }

        // Fetch district-level tree contributions
        const contributionsRef = adminDb.collection('tree_contributions');
        const contributionsSnap = await contributionsRef
            .where('districtId', '==', district.id)
            .where('status', '==', 'VERIFIED')
            .get();

        const totalTreesPlanted = contributionsSnap.docs.reduce((sum: number, doc: QueryDocumentSnapshot) => {
            const data = doc.data();
            return sum + (data.treeQuantity || 1);
        }, 0);

        // Fetch district-level donations
        const donationsRef = adminDb.collection('donations');
        const donationsSnap = await donationsRef
            .where('districtId', '==', district.id)
            .get();

        const totalTreesDonated = donationsSnap.docs.reduce((sum: number, doc: QueryDocumentSnapshot) => {
            const data = doc.data();
            return sum + (data.treeCount || 0);
        }, 0);

        const totalTrees = totalTreesPlanted + totalTreesDonated;
        const oxygenOffset = totalTrees * 110; // 110 kg/year per tree

        const stats = {
            totalTreesPlanted,
            totalTreesDonated,
            totalTrees,
            oxygenOffset,
        };

        const response: DistrictDetail = {
            ...district,
            environmentalData: envData,
            oxygenCalculation,
            recommendations: envData.recommendations,
            stats, // state-level contribution stats
        };

        return NextResponse.json(response);
    } catch (error: any) {
        console.error('Error fetching district details:', error);
        console.error('Error stack:', error?.stack);
        console.error('Error message:', error?.message);

        // Provide more detailed error information in development
        const errorMessage = process.env.NODE_ENV === 'development'
            ? error?.message || 'Failed to fetch district details'
            : 'Failed to fetch district details';

        return NextResponse.json(
            { error: errorMessage, details: process.env.NODE_ENV === 'development' ? error?.stack : undefined },
            { status: 500 }
        );
    }
}
