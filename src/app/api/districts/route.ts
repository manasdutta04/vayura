import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';

/**
 * GET /api/districts/[id]/previous
 * Fetches the previous week's data for a specific district to enable trend comparison
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const districtId = params.id;

    if (!districtId) {
      return NextResponse.json(
        { error: 'District ID is required' },
        { status: 400 }
      );
    }

    // Fetch the most recent historical snapshot before the current one
    const snapshotsRef = adminDb
      .collection('district_historical_snapshots')
      .where('districtId', '==', districtId)
      .orderBy('timestamp', 'desc')
      .limit(2); // Get current and previous

    const snapshots = await snapshotsRef.get();

    // If we have at least 2 snapshots, return the second one (previous)
    if (snapshots.docs.length >= 2) {
      const previousSnapshot = snapshots.docs[1].data();
      
      return NextResponse.json({
        population: previousSnapshot.population,
        aqi: previousSnapshot.aqi,
        soilQuality: previousSnapshot.soilQuality,
        disasterFrequency: previousSnapshot.disasterFrequency,
        treesRequired: previousSnapshot.treesRequired,
        oxygenDemand: previousSnapshot.oxygenDemand,
        oxygenSupply: previousSnapshot.oxygenSupply,
      });
    }

    // If only one snapshot exists, no previous data available
    // Return null so frontend can handle gracefully
    return NextResponse.json(null);

  } catch (error) {
    console.error('Error fetching previous district data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch previous data' },
      { status: 500 }
    );
  }
}
