import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        // Read from pre-aggregated stats document
        const statsDoc = await adminDb.collection('aggregated_stats').doc('global').get();

        if (!statsDoc.exists) {
            // Fallback: return zeros if aggregated stats not yet created
            // Stats will be populated on first cron run
            console.warn('Aggregated stats document not found. Run /api/cron/update-stats to initialize.');
            return NextResponse.json({
                totalDistricts: 0,
                totalTrees: 0,
                totalOxygen: 0,
            });
        }

        const data = statsDoc.data();

        return NextResponse.json({
            totalDistricts: data?.totalDistricts || 0,
            totalTrees: data?.totalTrees || 0,
            totalOxygen: data?.totalOxygen || 0,
        });
    } catch (error: unknown) {
        // Check if it's a Firestore API disabled error
        const errorObj = error as { code?: number; reason?: string; message?: string };
        if (errorObj?.code === 7 || errorObj?.reason === 'SERVICE_DISABLED' ||
            errorObj?.message?.includes('Cloud Firestore API has not been used') ||
            errorObj?.message?.includes('SERVICE_DISABLED')) {
            console.warn('Firestore API not enabled - returning demo stats for development');
            return NextResponse.json({
                totalDistricts: 4, // Mock data for testing
                totalTrees: 125000,
                totalOxygen: 187500,
            });
        }

        // Log error only for unexpected issues
        console.error('Error fetching stats:', error);
        return NextResponse.json(
            { totalDistricts: 0, totalTrees: 0, totalOxygen: 0 },
            { status: 500 }
        );
    }
}
