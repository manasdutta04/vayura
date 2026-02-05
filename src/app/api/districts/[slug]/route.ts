import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { storeDistrictSnapshot } from '@/lib/utils/district-snapshot-helper';

export const dynamic = 'force-dynamic';

/**
 * GET /api/districts/detail/[slug]
 * Fetches detailed district information and stores a historical snapshot
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const slug = params.slug;

    if (!slug) {
      return NextResponse.json(
        { error: 'District slug is required' },
        { status: 400 }
      );
    }

    // Fetch district data from Firestore
    const districtQuery = await adminDb
      .collection('districts')
      .where('slug', '==', slug)
      .limit(1)
      .get();

    if (districtQuery.empty) {
      return NextResponse.json(
        { error: 'District not found' },
        { status: 404 }
      );
    }

    const districtDoc = districtQuery.docs[0];
    const districtData = {
      id: districtDoc.id,
      ...districtDoc.data(),
    };

    // Store historical snapshot asynchronously (don't wait for it)
    // This runs in the background and won't slow down the response
    storeDistrictSnapshot(districtData).catch((error) => {
      console.error('Failed to store snapshot:', error);
    });

    return NextResponse.json(districtData);

  } catch (error) {
    console.error('Error fetching district detail:', error);
    return NextResponse.json(
      { error: 'Failed to fetch district data' },
      { status: 500 }
    );
  }
}
