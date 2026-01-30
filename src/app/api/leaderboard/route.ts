import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { QueryDocumentSnapshot } from 'firebase-admin/firestore';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const limitParam = parseInt(searchParams.get('limit') || '35', 10);

        // Simple optimized query: fetched pre-calculated ranks
        // This reduces reads from ~1000+ (all districts) to just the number of states (requested limit)
        const snapshot = await adminDb.collection('leaderboard')
            .orderBy('rank', 'asc')
            .limit(limitParam)
            .get();

        const leaderboard = snapshot.docs
            .map((doc: QueryDocumentSnapshot) => ({
                id: doc.id,
                ...doc.data()
            } as any))
            // Filter out invalid entries without state names
            .filter((entry: any) => entry.state && entry.state.trim().length > 0);

        return NextResponse.json(leaderboard, {
            headers: {
                'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=600',
            },
        });
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        return NextResponse.json(
            { error: 'Failed to fetch leaderboard' },
            { status: 500 }
        );
    }
}
