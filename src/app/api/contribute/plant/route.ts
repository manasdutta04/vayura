import { NextResponse } from 'next/server';
import { adminDb, adminStorage } from '@/lib/firebase-admin';
import { TreeContribution } from '@/lib/types';

function timestampToDate(value: unknown): Date {
    if (!value) return new Date();
    if (typeof value === 'object' && value !== null && 'toDate' in value && typeof (value as { toDate: unknown }).toDate === 'function') {
        return (value as { toDate: () => Date }).toDate();
    }
    return value instanceof Date ? value : new Date(value as string | number);
}

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const districtId = formData.get('districtId') as string;
        const userName = formData.get('userName') as string | null;
        const userEmail = formData.get('userEmail') as string | null;
        const notes = formData.get('notes') as string | null;
        const image = formData.get('image') as File;
        const userId = formData.get('userId') as string | null;

        if (!districtId || !image) {
            return NextResponse.json(
                { error: 'District ID and image are required' },
                { status: 400 }
            );
        }

        // Verify district exists
        const districtRef = adminDb.collection('districts').doc(districtId);
        const districtSnap = await districtRef.get();
        if (!districtSnap.exists) {
            return NextResponse.json(
                { error: 'District not found' },
                { status: 404 }
            );
        }

        // Upload image to Firebase Storage (admin SDK)
        const bucket = adminStorage.bucket();
        const extension = image.name.split('.').pop();
        const filename = `tree-${districtId}-${Date.now()}.${extension}`;
        const filepath = `tree-contributions/${userId || 'anonymous'}/${filename}`;
        const arrayBuffer = await image.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const fileRef = bucket.file(filepath);
        await fileRef.save(buffer, {
            contentType: image.type,
            metadata: {
                metadata: {
                    districtId,
                    userId: userId || 'anonymous',
                    userName: userName || 'anonymous',
                },
            },
            public: true,
        });

        const [url] = await fileRef.getSignedUrl({
            action: 'read',
            expires: '2099-12-31',
        });

        // Create Firestore record
        const contribRef = adminDb.collection('tree_contributions').doc();
        await contribRef.set({
            districtId,
            userId: userId || undefined,
            userName: userName || undefined,
            userEmail: userEmail || undefined,
            notes: notes || undefined,
            imageUrl: url,
            storagePath: filepath,
            status: 'PENDING',
            plantedAt: new Date(),
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        const contribution: TreeContribution = {
            id: contribRef.id,
            districtId,
            userId: userId || undefined,
            userName: userName || undefined,
            userEmail: userEmail || undefined,
            notes: notes || undefined,
            imageUrl: url,
            status: 'PENDING',
            plantedAt: new Date(),
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        return NextResponse.json({
            success: true,
            contribution,
            message: 'Tree contribution submitted successfully. Pending verification.',
        });
    } catch (error) {
        console.error('Error creating tree contribution:', error);
        return NextResponse.json(
            { error: 'Failed to submit tree contribution' },
            { status: 500 }
        );
    }
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const districtId = searchParams.get('districtId');
        const status = searchParams.get('status');

        let queryRef = adminDb
            .collection('tree_contributions')
            .orderBy('plantedAt', 'desc')
            .limit(50);

        if (districtId) {
            queryRef = queryRef.where('districtId', '==', districtId);
        }

        if (status) {
            queryRef = queryRef.where('status', '==', status.toUpperCase());
        }

        const snapshot = await queryRef.get();

        const contributions: TreeContribution[] = snapshot.docs.map((docSnap) => {
            const data = docSnap.data();
            return {
                id: docSnap.id,
                ...data,
                plantedAt: timestampToDate(data.plantedAt),
                verifiedAt: data.verifiedAt ? timestampToDate(data.verifiedAt) : undefined,
                createdAt: timestampToDate(data.createdAt),
                updatedAt: timestampToDate(data.updatedAt),
            } as TreeContribution;
        });

        return NextResponse.json(contributions);
    } catch (error) {
        console.error('Error fetching tree contributions:', error);
        return NextResponse.json(
            { error: 'Failed to fetch tree contributions' },
            { status: 500 }
        );
    }
}
