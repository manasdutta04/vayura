import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

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
        const districtsRef = adminDb.collection('districts');
        // Fetch all districts. For 700+ districts, this is manageable in one call.
        const snapshot = await districtsRef.get();

        const districts = snapshot.docs.map((doc: any) => {
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

        return NextResponse.json(districts);
    } catch (error) {
        console.error('Error fetching map data:', error);
        return NextResponse.json(
            { error: 'Failed to fetch map data' },
            { status: 500 }
        );
    }
}
