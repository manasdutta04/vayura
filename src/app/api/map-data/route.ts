import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { allIndianDistricts } from '@/lib/data/all-indian-districts';

interface DistrictData {
    name: string;
    state: string;
    slug: string;
    oxygenSupply: number;
    oxygenDemand: number;
}

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        console.log('GET /api/map-data: Starting fetch');
        const districtsRef = adminDb.collection('districts');
        const snapshot = await districtsRef.get();
        console.log('GET /api/map-data: Snapshot received, docs:', snapshot.docs.length);

        let districts = snapshot.docs.map((doc: any) => {
            const data = doc.data() as DistrictData;
            return {
                id: doc.id,
                name: data.name,
                state: data.state,
                slug: data.slug,
                oxygenSupply: data.oxygenSupply || 0,
                oxygenDemand: data.oxygenDemand || 0,
            };
        });

        // If no data in Firebase, use fallback data
        if (districts.length === 0) {
            console.log('No data in Firebase, using fallback district data');
            districts = allIndianDistricts.map((d, index) => ({
                id: `fallback-${index}`,
                name: d.name,
                state: d.state,
                slug: d.slug,
                // Generate some realistic-looking mock data
                oxygenSupply: Math.floor(Math.random() * 500) + 100,
                oxygenDemand: Math.floor(Math.random() * 500) + 100,
            }));
        }

        return NextResponse.json(districts);
    } catch (error: any) {
        console.error('Error fetching map data:', error);
        return NextResponse.json(
            { error: 'Failed to fetch map data', details: error.message },
            { status: 500 }
        );
    }
}
