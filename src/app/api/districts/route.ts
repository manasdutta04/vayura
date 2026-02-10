import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { DistrictSearchResult } from '@/lib/types';
import { QueryDocumentSnapshot } from 'firebase-admin/firestore';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const q = searchParams.get('q')?.toLowerCase() ?? '';
        const state = searchParams.get('state');

        const districtsRef = adminDb.collection('districts');
        const snapshot = await districtsRef.orderBy('name').limit(100).get();

        const allDistricts = snapshot.docs.map((doc: QueryDocumentSnapshot) => ({
            id: doc.id,
            ...(doc.data() as Omit<DistrictSearchResult, 'id'>),
        })) as DistrictSearchResult[];

        const filtered = allDistricts
            .filter((district) => {
                const matchesQuery = q
                    ? district.name.toLowerCase().includes(q) ||
                    district.slug.toLowerCase().includes(q) ||
                    district.state.toLowerCase().includes(q)
                    : true;
                const matchesState = state ? district.state === state : true;
                return matchesQuery && matchesState;
            })
            .slice(0, 50);

        return NextResponse.json(filtered);
    } catch (error) {
        console.error('Error fetching districts:', error);
        return NextResponse.json(
            { error: 'Failed to fetch districts' },
            { status: 500 }
        );
    }
}
