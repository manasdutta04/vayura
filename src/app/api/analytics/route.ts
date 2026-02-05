import { NextResponse } from 'next/server';
import { getAnalyticsData } from '@/lib/services/analytics';
import { adminDb } from '@/lib/firebase-admin';

// Force dynamic to avoid build-time Firestore calls
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        // Check for admin authorization (optional: can be done via middleware or in page)
        // For now, we'll just fetch the data. 
        // Real admin check would involve verifying Firebase ID token and custom claims.
        
        const data = await getAnalyticsData();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error fetching analytics:', error);
        return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
    }
}
