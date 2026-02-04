import { NextResponse } from 'next/server';
import {
    getChallenges,
    getChallengeById,
    joinChallenge,
    recordChallengeContribution,
    getUserChallenges,
} from '@/lib/services/challenges';
import { ChallengeScope, ChallengeStatus } from '@/lib/types/challenges';

export const dynamic = 'force-dynamic';

// GET /api/challenges - Fetch challenges with optional filtering
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const scope = searchParams.get('scope') as ChallengeScope | undefined;
        const status = searchParams.get('status') as ChallengeStatus | undefined;
        const challengeId = searchParams.get('id');
        const userId = searchParams.get('userId');
        const userChallenges = searchParams.get('userChallenges') === 'true';
        const limit = parseInt(searchParams.get('limit') || '20', 10);
        const offset = parseInt(searchParams.get('offset') || '0', 10);

        // Get user's joined challenges
        if (userChallenges && userId) {
            const challenges = await getUserChallenges(userId);
            return NextResponse.json({
                challenges,
                total: challenges.length,
                hasMore: false,
            });
        }

        // Get single challenge detail
        if (challengeId) {
            const result = await getChallengeById(challengeId, userId || undefined);
            if (!result) {
                return NextResponse.json(
                    { error: 'Challenge not found' },
                    { status: 404 }
                );
            }
            return NextResponse.json(result);
        }

        // Get list of challenges
        const result = await getChallenges(scope, status, limit, offset);
        return NextResponse.json(result, {
            headers: {
                'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
            },
        });
    } catch (error) {
        console.error('Error fetching challenges:', error);
        return NextResponse.json(
            { error: 'Failed to fetch challenges' },
            { status: 500 }
        );
    }
}

// POST /api/challenges - Join a challenge or record contribution
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { action, challengeId, userId, userName, userEmail, photoURL, participantType, ngoName, contributionId, treeCount, o2Impact } = body;

        if (!challengeId || !userId) {
            return NextResponse.json(
                { error: 'challengeId and userId are required' },
                { status: 400 }
            );
        }

        if (action === 'join') {
            // Join a challenge
            const participant = await joinChallenge(
                challengeId,
                userId,
                userName || 'Anonymous',
                userEmail,
                photoURL,
                participantType || 'individual',
                ngoName
            );

            if (!participant) {
                return NextResponse.json(
                    { error: 'Failed to join challenge' },
                    { status: 400 }
                );
            }

            return NextResponse.json({
                success: true,
                participant,
            });
        } else if (action === 'contribute') {
            // Record a contribution
            if (!contributionId || typeof treeCount !== 'number') {
                return NextResponse.json(
                    { error: 'contributionId and treeCount are required for contributions' },
                    { status: 400 }
                );
            }

            const success = await recordChallengeContribution(
                challengeId,
                contributionId,
                userId,
                treeCount,
                o2Impact || treeCount * 110 // Default O2 impact
            );

            if (!success) {
                return NextResponse.json(
                    { error: 'Failed to record contribution. User may not have joined the challenge.' },
                    { status: 400 }
                );
            }

            return NextResponse.json({
                success: true,
            });
        } else {
            return NextResponse.json(
                { error: 'Invalid action. Use "join" or "contribute"' },
                { status: 400 }
            );
        }
    } catch (error) {
        console.error('Error processing challenge action:', error);
        return NextResponse.json(
            { error: 'Failed to process request' },
            { status: 500 }
        );
    }
}
