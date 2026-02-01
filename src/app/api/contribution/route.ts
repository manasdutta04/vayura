import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { TreeContribution, Donation } from '@/lib/types';

// Cache for 1 minute (60 seconds) - shorter cache for user-specific data
export const revalidate = 60;

function timestampToDate(value: unknown): Date {
    if (!value) return new Date();
    if (typeof value === 'object' && value !== null && typeof (value as { toDate?: unknown }).toDate === 'function') {
        return ((value as { toDate: () => Date }).toDate());
    }
    return value instanceof Date ? value : new Date(value as string | number);
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json(
                { error: 'User ID is required' },
                { status: 400 }
            );
        }

        // Fetch user's tree contributions (limit to 100 to prevent quota spikes)
        const contributionsRef = adminDb.collection('tree_contributions');
        const contributionsSnap = await contributionsRef
            .where('userId', '==', userId)
            .limit(100)
            .get();

        const allTreeContributions = contributionsSnap.docs.map((doc) => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                plantedAt: timestampToDate(data.plantedAt),
                verifiedAt: data.verifiedAt ? timestampToDate(data.verifiedAt) : undefined,
                createdAt: timestampToDate(data.createdAt),
                updatedAt: timestampToDate(data.updatedAt),
            } as TreeContribution;
        });

        // Split into "Plantations" and "Donation Verifications"
        // Default to 'plantation' if type is missing (legacy records)
        const plantations = allTreeContributions.filter(c => !c.type || c.type === 'plantation').sort((a, b) => {
            return b.plantedAt.getTime() - a.plantedAt.getTime();
        });

        const donationVerifications = allTreeContributions.filter(c => c.type === 'donation');

        // Fetch user's donations (by email or userId)
        const userEmail = searchParams.get('userEmail');
        let donationsSnap;

        if (userEmail) {
            const donationsRef = adminDb.collection('donations');
            // Fetch without orderBy to avoid index requirement, sort in memory
            // Limit to 100 to prevent quota spikes
            donationsSnap = await donationsRef
                .where('donorEmail', '==', userEmail)
                .limit(100)
                .get();
        } else {
            // If no email, return empty donations
            donationsSnap = { docs: [], empty: true };
        }

        const standardDonations: Donation[] = donationsSnap.docs.map((doc) => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                donatedAt: timestampToDate(data.donatedAt),
                createdAt: timestampToDate(data.createdAt),
            } as Donation;
        });

        // Get district names for plantations and donation verifications
        const districtIds = [...new Set([
            ...plantations.map(c => c.districtId),
            ...donationVerifications.map(c => c.districtId)
        ])];
        const districtsMap = new Map<string, string>();

        // Batch fetch districts to reduce quota usage
        if (districtIds.length > 0) {
            try {
                const districtRefs = districtIds.map(id => adminDb.collection('districts').doc(id));
                const districtDocs = await adminDb.getAll(...districtRefs);

                districtDocs.forEach((doc) => {
                    if (doc.exists) {
                        districtsMap.set(doc.id, doc.data()?.name || 'Unknown');
                    } else {
                        districtsMap.set(doc.id, 'Unknown');
                    }
                });
            } catch (error) {
                console.error('Error batch fetching districts:', error);
                districtIds.forEach(id => districtsMap.set(id, 'Unknown'));
            }
        }

        // Map Donation Verifications to Donation type
        const verifiedDonations: Donation[] = donationVerifications.map(c => ({
            id: c.id,
            districtId: c.districtId,
            ngoReference: 'Verified Donation', // Default for self-verified
            treeCount: c.treeQuantity || 1,
            donatedAt: c.plantedAt,
            createdAt: c.createdAt,
            // Display fields
            districtName: c.districtName || districtsMap.get(c.districtId) || 'Unknown',
            state: c.state,
            treeName: c.treeName,
            totalLifespanO2: c.totalLifespanO2
        }));

        // Merge and sort all donations
        const allDonations = [...standardDonations, ...verifiedDonations].sort((a, b) => {
            return b.donatedAt.getTime() - a.donatedAt.getTime();
        });

        // Calculate stats
        const verifiedPlantations = plantations.filter(c => c.status === 'VERIFIED');
        const pendingPlantations = plantations.filter(c => c.status === 'PENDING');
        const rejectedPlantations = plantations.filter(c => c.status === 'REJECTED');

        // Sum tree quantities
        const totalTreesPlanted = verifiedPlantations.reduce((sum, c) => sum + (c.treeQuantity || 1), 0);
        const totalTreesDonated = allDonations.reduce((sum, d) => sum + (d.treeCount || 0), 0);
        const totalTrees = totalTreesPlanted + totalTreesDonated;

        // Calculate O2 impact (only for plantations + verified donations)
        let totalO2Impact = verifiedPlantations.reduce((sum, c) => {
            if (c.totalLifespanO2) return sum + c.totalLifespanO2;
            return sum + ((c.treeQuantity || 1) * 110 * 50);
        }, 0);

        // Also add O2 from donation verifications if they have it (since they are tree_contributions originally)
        const verifiedDonationVerifications = donationVerifications.filter(c => c.status === 'VERIFIED');
        totalO2Impact += verifiedDonationVerifications.reduce((sum, c) => {
            if (c.totalLifespanO2) return sum + c.totalLifespanO2;
            return sum + ((c.treeQuantity || 1) * 110 * 50);
        }, 0);

        return NextResponse.json({
            contributions: plantations.map(c => ({
                ...c,
                districtName: districtsMap.get(c.districtId) || 'Unknown',
            })),
            donations: allDonations,
            stats: {
                totalTreesPlanted,
                totalTreesDonated,
                totalTrees,
                totalO2Impact,
                verifiedContributions: verifiedPlantations.length + verifiedDonationVerifications.length,
                verifiedPlantationsCount: verifiedPlantations.length,
                pendingContributions: pendingPlantations.length + donationVerifications.filter(c => c.status === 'PENDING').length,
                rejectedContributions: rejectedPlantations.length + donationVerifications.filter(c => c.status === 'REJECTED').length,
            },
        });
    } catch (error) {
        console.error('Error fetching user contributions:', error);
        return NextResponse.json(
            { error: 'Failed to fetch contributions' },
            { status: 500 }
        );
    }
}
