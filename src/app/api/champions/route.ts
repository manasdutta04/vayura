import { NextResponse } from 'next/server';
import {
    getContributorLeaderboard,
    updateContributorProfile,
    getContributorProfile
} from '@/lib/services/champions';
import { LeaderboardScope } from '@/lib/types/champions';

export const dynamic = 'force-dynamic';

// GET /api/champions - Fetch contributor leaderboard
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const scope = (searchParams.get('scope') || 'national') as LeaderboardScope;
        const scopeId = searchParams.get('scopeId') || undefined;
        const limit = parseInt(searchParams.get('limit') || '50', 10);
        const userId = searchParams.get('userId') || undefined;

        // If requesting a specific user's profile
        if (userId && searchParams.get('profile') === 'true') {
            const profile = await getContributorProfile(userId);
            if (!profile) {
                return NextResponse.json(
                    { error: 'Contributor not found' },
                    { status: 404 }
                );
            }
            return NextResponse.json(profile);
        }

        // Get leaderboard
        const leaderboard = await getContributorLeaderboard(scope, scopeId, limit);

        // If userId provided, mark current user in the response
        if (userId) {
            leaderboard.entries = leaderboard.entries.map(entry => ({
                ...entry,
                isCurrentUser: entry.userId === userId,
            }));
        }

        return NextResponse.json(leaderboard, {
            headers: {
                'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
            },
        });
    } catch (error) {
        console.error('Error fetching champions leaderboard:', error);
        return NextResponse.json(
            { error: 'Failed to fetch leaderboard' },
            { status: 500 }
        );
    }
}

// POST /api/champions - Update contributor profile (called after contribution)
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { userId, userName, userEmail, photoURL } = body;

        if (!userId) {
            return NextResponse.json(
                { error: 'userId is required' },
                { status: 400 }
            );
        }

        const profile = await updateContributorProfile(
            userId,
            userName || 'Anonymous',
            userEmail,
            photoURL
        );

        if (!profile) {
            return NextResponse.json(
                { error: 'Failed to update profile' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            profile,
        });
    } catch (error) {
        console.error('Error updating contributor profile:', error);
        return NextResponse.json(
            { error: 'Failed to update profile' },
            { status: 500 }
        );
    }
}
