import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { DistrictSearchResult } from '@/lib/types';
import { QueryDocumentSnapshot } from 'firebase-admin/firestore';
import { cacheService } from '@/services/cacheService';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const q = searchParams.get('q')?.toLowerCase() ?? '';
        const state = searchParams.get('state');

        // Generate cache key for the raw dataset
        const cacheKey = 'districts:all_raw';
        let allDistricts = cacheService.get<DistrictSearchResult[]>(cacheKey);

        if (!allDistricts) {
            console.log('Cache Miss - Fetching from DB');
            const districtsRef = adminDb.collection('districts');
            const snapshot = await districtsRef.orderBy('name').limit(100).get();

            allDistricts = snapshot.docs.map((doc: QueryDocumentSnapshot) => ({
                id: doc.id,
                ...(doc.data() as Omit<DistrictSearchResult, 'id'>),
            })) as DistrictSearchResult[];

            // Store raw result in cache
            cacheService.set(cacheKey, allDistricts);
        } else {
            console.log('Cache Hit');
        }

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
