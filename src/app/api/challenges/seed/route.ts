import { NextResponse } from 'next/server';
import { createChallenge } from '@/lib/services/challenges';
import { ChallengeScope, ChallengeType } from '@/lib/types/challenges';

export const dynamic = 'force-dynamic';

// Sample challenges for seeding the database
const SAMPLE_CHALLENGES = [
    {
        title: 'Plant 1 Lakh Trees in Maharashtra - 30 Days',
        description: 'Join Maharashtra\'s biggest tree plantation drive! Together, we can plant 1 lakh trees across all districts in just 30 days. Every tree counts towards a greener future for our state.',
        scope: 'state' as ChallengeScope,
        type: 'both' as ChallengeType,
        status: 'active' as const,
        state: 'Maharashtra',
        targetTrees: 100000,
        targetO2: 11000000, // 100k trees * 110 kg O2
        startDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // Started 5 days ago
        endDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000), // 25 days remaining
    },
    {
        title: 'Delhi NCR Green Initiative - 50,000 Trees',
        description: 'Combat air pollution in Delhi NCR by planting 50,000 trees. NGOs, individuals, and organizations can participate in this crucial environmental initiative.',
        scope: 'state' as ChallengeScope,
        type: 'both' as ChallengeType,
        status: 'active' as const,
        state: 'Delhi',
        targetTrees: 50000,
        targetO2: 5500000,
        startDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
    },
    {
        title: 'National Oxygen Mission - 10 Lakh Trees',
        description: 'India\'s largest collective tree plantation challenge! Plant 10 lakh trees across all states in 60 days. Be part of this historic environmental movement.',
        scope: 'national' as ChallengeScope,
        type: 'both' as ChallengeType,
        status: 'active' as const,
        targetTrees: 1000000,
        targetO2: 110000000,
        startDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
    },
    {
        title: 'Green Karnataka Week',
        description: 'Celebrate Karnataka\'s environment with a week-long plantation drive. Plant trees in your neighborhood, parks, and public spaces.',
        scope: 'state' as ChallengeScope,
        type: 'plantation' as ChallengeType,
        status: 'active' as const,
        state: 'Karnataka',
        targetTrees: 25000,
        targetO2: 2750000,
        startDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    },
    {
        title: 'Tamil Nadu Coastal Restoration',
        description: 'Restore coastal areas of Tamil Nadu with mangrove and native tree plantations. Protect against erosion and create wildlife habitats.',
        scope: 'state' as ChallengeScope,
        type: 'both' as ChallengeType,
        status: 'upcoming' as const,
        state: 'Tamil Nadu',
        targetTrees: 75000,
        targetO2: 8250000,
        startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 37 * 24 * 60 * 60 * 1000),
    },
    {
        title: 'Gujarat Urban Forest Challenge',
        description: 'Transform urban spaces in Gujarat with Miyawaki forests and urban greenery. Create oxygen-rich zones in cities.',
        scope: 'state' as ChallengeScope,
        type: 'plantation' as ChallengeType,
        status: 'upcoming' as const,
        state: 'Gujarat',
        targetTrees: 40000,
        targetO2: 4400000,
        startDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 44 * 24 * 60 * 60 * 1000),
    },
    {
        title: 'Rajasthan Desert Greening Project',
        description: 'Combat desertification in Rajasthan by planting drought-resistant native trees. Every tree helps prevent sand encroachment.',
        scope: 'state' as ChallengeScope,
        type: 'both' as ChallengeType,
        status: 'active' as const,
        state: 'Rajasthan',
        targetTrees: 60000,
        targetO2: 6600000,
        startDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 22 * 24 * 60 * 60 * 1000),
    },
    {
        title: 'West Bengal Monsoon Plantation Drive',
        description: 'Leverage the monsoon season to maximize tree survival rates. Plant during the optimal growing season in West Bengal.',
        scope: 'state' as ChallengeScope,
        type: 'plantation' as ChallengeType,
        status: 'active' as const,
        state: 'West Bengal',
        targetTrees: 35000,
        targetO2: 3850000,
        startDate: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000),
    },
];

// POST /api/challenges/seed - Seed sample challenges (development only)
export async function POST(request: Request) {
    try {
        // Check for authorization (you might want to add proper auth)
        const { searchParams } = new URL(request.url);
        const secret = searchParams.get('secret');

        if (process.env.NODE_ENV === 'production' && secret !== process.env.SEED_SECRET) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const createdChallenges = [];

        for (const challengeData of SAMPLE_CHALLENGES) {
            try {
                const challenge = await createChallenge(challengeData);
                createdChallenges.push(challenge);
            } catch (err) {
                console.error('Error creating challenge:', challengeData.title, err);
            }
        }

        return NextResponse.json({
            success: true,
            message: `Created ${createdChallenges.length} challenges`,
            challenges: createdChallenges.map(c => ({ id: c.id, title: c.title })),
        });
    } catch (error) {
        console.error('Error seeding challenges:', error);
        return NextResponse.json(
            { error: 'Failed to seed challenges' },
            { status: 500 }
        );
    }
}
