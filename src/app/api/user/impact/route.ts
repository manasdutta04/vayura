import { NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase-admin';
import { TreeContribution, Donation, UserImpact } from '@/lib/types';
import { QueryDocumentSnapshot } from 'firebase-admin/firestore';
import { calculateUserImpact } from '@/lib/calculations/user-impact';

export const dynamic = 'force-dynamic';

function timestampToDate(value: unknown): Date {
    if (!value) return new Date();
    if (typeof value === 'object' && value !== null && 'toDate' in value && typeof (value as { toDate: () => Date }).toDate === 'function') {
        return (value as { toDate: () => Date }).toDate();
    }
    return value instanceof Date ? value : new Date(value as string | number);
}

/**
 * Verify Firebase ID token from request headers and ensure it matches the requested userId
 * This prevents IDOR attacks where users could access other users' data
 */
async function verifyAuthenticatedUser(request: Request, requestedUserId: string): Promise<{ authenticated: boolean; error?: string }> {
    try {
        const authHeader = request.headers.get('authorization');
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return { authenticated: false, error: 'Missing or invalid authorization header' };
        }

        const idToken = authHeader.replace('Bearer ', '');
        
        // Verify the ID token
        let decodedToken;
        try {
            decodedToken = await adminAuth.verifyIdToken(idToken);
        } catch (verifyError) {
            console.error('Token verification failed:', verifyError);
            return { authenticated: false, error: 'Invalid or expired token' };
        }

        // Assert that the authenticated user matches the requested userId
        if (decodedToken.uid !== requestedUserId) {
            console.error(`IDOR attempt: Token user ${decodedToken.uid} requested data for ${requestedUserId}`);
            return { authenticated: false, error: 'You can only access your own data' };
        }

        return { authenticated: true };
    } catch (error) {
        console.error('Auth verification error:', error);
        return { authenticated: false, error: 'Authentication failed' };
    }
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

        // Verify authentication - check that the requester owns this userId
        const authResult = await verifyAuthenticatedUser(request, userId);
        if (!authResult.authenticated) {
            return NextResponse.json(
                { error: authResult.error || 'Unauthorized' },
                { status: 401 }
            );
        }

        // Fetch user's tree contributions - query both userId and uid fields
        const contributionsRef = adminDb.collection('tree_contributions');
        
        // Try querying with userId first
        let contributionsSnap = await contributionsRef
            .where('userId', '==', userId)
            .limit(200)
            .get();

        // If no results, try querying with uid field
        if (contributionsSnap.empty) {
            contributionsSnap = await contributionsRef
                .where('uid', '==', userId)
                .limit(200)
                .get();
        }
        const contributions = contributionsSnap.docs.map((doc: QueryDocumentSnapshot) => {
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

        // Fetch user donations
        const userEmail = searchParams.get('userEmail');
        let donations: Donation[] = [];

        if (userEmail) {
            const donationsRef = adminDb.collection('donations');
            const donationsSnap = await donationsRef
                .where('donorEmail', '==', userEmail)
                .limit(200)
                .get();

            donations = donationsSnap.docs.map((doc: QueryDocumentSnapshot) => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    donatedAt: timestampToDate(data.donatedAt),
                    createdAt: timestampToDate(data.createdAt),
                } as Donation;
            });
        }

        // Get unique district IDs from contributions and donations
        const districtIds = new Set<string>();
        
        for (const contribution of contributions) {
            if (contribution.districtId) {
                districtIds.add(contribution.districtId);
            }
        }
        
        for (const donation of donations) {
            if (donation.districtId) {
                districtIds.add(donation.districtId);
            }
        }

        // Batch fetch district oxygen data
        const districtData = new Map<string, { name: string; state?: string; oxygenDeficit: number }>();
        
        // Default oxygen deficit for districts without calculation (based on average Indian district)
        const DEFAULT_OXYGEN_DEFICIT = 50000000; // 50 million kg/year (approximate for a district)
        
        if (districtIds.size > 0) {
            try {
                const districtRefs = Array.from(districtIds).map(id => adminDb.collection('districts').doc(id));
                const districtDocs = await adminDb.getAll(...districtRefs);

                for (const doc of districtDocs) {
                    if (doc.exists) {
                        const data = doc.data() as {
                            name: string;
                            state?: string;
                            oxygenCalculation?: {
                                oxygen_deficit_kg_per_year?: number;
                                penalty_adjusted_demand_kg_per_year?: number;
                            };
                            population?: number;
                        };

                        // Use stored oxygen deficit, or calculate based on population if available
                        let oxygenDeficit = data.oxygenCalculation?.penalty_adjusted_demand_kg_per_year || 
                                            data.oxygenCalculation?.oxygen_deficit_kg_per_year || 
                                            0;
                        
                        // If no oxygen calculation but we have population, estimate deficit
                        // Approximate: 0.5 kg O2 per person per day = 182.5 kg/year per person
                        if (oxygenDeficit === 0 && data.population) {
                            oxygenDeficit = Math.round(data.population * 182.5);
                        }
                        
                        // If still no deficit, use default
                        if (oxygenDeficit === 0) {
                            oxygenDeficit = DEFAULT_OXYGEN_DEFICIT;
                            console.log(`Using default oxygen deficit for district ${doc.id} (${data.name})`);
                        }

                        districtData.set(doc.id, {
                            name: data.name,
                            state: data.state,
                            oxygenDeficit
                        });
                    } else {
                        // District document doesn't exist - add with default deficit
                        console.log(`District ${doc.id} not found, using default oxygen deficit`);
                        districtData.set(doc.id, {
                            name: doc.id,
                            oxygenDeficit: DEFAULT_OXYGEN_DEFICIT
                        });
                    }
                }
            } catch (error) {
                console.error('Error batch fetching districts:', error);
            }
        }

        // Debug: Log district data fetched
        console.log(`Fetched oxygen data for ${districtData.size} districts`);

        // Calculate user impact
        const impact = calculateUserImpact(contributions, donations, districtData);

        // If no contributions, return empty state
        if (!impact.hasContributions) {
            return NextResponse.json({
                districts: [],
                mostImpactedDistrict: null,
                totalTrees: 0,
                totalOxygenOffset: 0,
                hasContributions: false,
            } as UserImpact);
        }

        return NextResponse.json(impact);
    } catch (error) {
        console.error('Error calculating user impact:', error);
        return NextResponse.json(
            { error: 'Failed to calculate user impact' },
            { status: 500 }
        );
    }
}

