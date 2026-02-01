// File: src/app/api/challenges/create/route.ts
// API Route for creating new user-generated challenges

import { NextResponse } from 'next/server';
import { createChallenge } from '@/lib/services/challenges';
import { ChallengeScope, ChallengeType } from '@/lib/types/challenges';

export const dynamic = 'force-dynamic';

// POST /api/challenges/create - Create a new challenge
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const {
            userId,
            userName,
            title,
            description,
            scope,
            type,
            districtId,
            districtName,
            state,
            targetTrees,
            startDate,
            endDate,
        } = body;

        // Validation
        if (!userId || !userName) {
            return NextResponse.json(
                { error: 'Authentication required. Please sign in to create challenges.' },
                { status: 401 }
            );
        }

        if (!title || title.length < 10 || title.length > 100) {
            return NextResponse.json(
                { error: 'Title must be between 10 and 100 characters' },
                { status: 400 }
            );
        }

        if (!description || description.length < 50 || description.length > 500) {
            return NextResponse.json(
                { error: 'Description must be between 50 and 500 characters' },
                { status: 400 }
            );
        }

        if (!scope || !['district', 'state', 'national'].includes(scope)) {
            return NextResponse.json(
                { error: 'Invalid challenge scope' },
                { status: 400 }
            );
        }

        if (!type || !['plantation', 'donation', 'both'].includes(type)) {
            return NextResponse.json(
                { error: 'Invalid challenge type' },
                { status: 400 }
            );
        }

        if (!targetTrees || targetTrees < 100) {
            return NextResponse.json(
                { error: 'Target must be at least 100 trees' },
                { status: 400 }
            );
        }

        // Location validation based on scope
        if (scope === 'district' && (!districtId || !districtName || !state)) {
            return NextResponse.json(
                { error: 'District information required for district-level challenges' },
                { status: 400 }
            );
        }

        if (scope === 'state' && !state) {
            return NextResponse.json(
                { error: 'State information required for state-level challenges' },
                { status: 400 }
            );
        }

        // Date validation
        const start = new Date(startDate);
        const end = new Date(endDate);
        const now = new Date();

        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            return NextResponse.json(
                { error: 'Invalid date format' },
                { status: 400 }
            );
        }

        if (end <= start) {
            return NextResponse.json(
                { error: 'End date must be after start date' },
                { status: 400 }
            );
        }

        const durationDays = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
        if (durationDays < 7) {
            return NextResponse.json(
                { error: 'Challenge must be at least 7 days long' },
                { status: 400 }
            );
        }

        if (durationDays > 365) {
            return NextResponse.json(
                { error: 'Challenge cannot exceed 1 year' },
                { status: 400 }
            );
        }

        // Determine status based on dates
        let status: 'upcoming' | 'active';
        if (start > now) {
            status = 'upcoming';
        } else {
            status = 'active';
        }

        // Calculate target O2 (110 kg per tree per year)
        const targetO2 = targetTrees * 110;

        // Create the challenge
        const challenge = await createChallenge({
            title: title.trim(),
            description: description.trim(),
            scope: scope as ChallengeScope,
            type: type as ChallengeType,
            status,
            districtId,
            districtName,
            state,
            targetTrees,
            targetO2,
            startDate: start,
            endDate: end,
            createdBy: userId,
            createdByName: userName,
        });

        if (!challenge) {
            return NextResponse.json(
                { error: 'Failed to create challenge' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            challenge,
            message: 'Challenge created successfully! It will appear in the challenges list.',
        });
    } catch (error) {
        console.error('Error creating challenge:', error);
        return NextResponse.json(
            { error: 'Failed to create challenge. Please try again.' },
            { status: 500 }
        );
    }
}