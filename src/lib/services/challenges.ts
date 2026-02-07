/**
 * Community Challenges Service
 * Handles all business logic for community challenges
 */

import { adminDb } from '@/lib/firebase-admin';
import {
    Challenge,
    ChallengeWithLeaders,
    ChallengeParticipant,
    ChallengeContribution,
    ChallengeListResponse,
    ChallengeDetailResponse,
    ChallengeScope,
    ChallengeStatus,
    CHALLENGES_COLLECTION,
    CHALLENGE_PARTICIPANTS_COLLECTION,
    CHALLENGE_CONTRIBUTIONS_COLLECTION,
} from '@/lib/types/challenges';

// Get Firestore instance
function getDb() {
    return adminDb;
}

// Convert Firestore timestamp to Date
function toDate(timestamp: unknown): Date {
    if (!timestamp) return new Date();

    const ts = timestamp as { toDate?: () => Date } | null | undefined;
    if (typeof ts?.toDate === 'function') {
        return ts.toDate();
    }

    if (timestamp instanceof Date) return timestamp;
    return new Date(timestamp as string | number);
}

// Determine challenge status based on dates
function determineStatus(startDate: Date, endDate: Date): ChallengeStatus {
    const now = new Date();
    if (now < startDate) return 'upcoming';
    if (now > endDate) return 'completed';
    return 'active';
}

// Get all challenges with optional filtering
export async function getChallenges(
    scope?: ChallengeScope,
    status?: ChallengeStatus,
    limit: number = 20,
    offset: number = 0
): Promise<ChallengeListResponse> {
    const db = getDb();
    let query = db.collection(CHALLENGES_COLLECTION)
        .orderBy('startDate', 'desc');

    if (scope) {
        query = query.where('scope', '==', scope);
    }

    if (status) {
        query = query.where('status', '==', status);
    }

    // Get total count
    const countSnapshot = await query.count().get();
    const total = countSnapshot.data().count;

    // Get paginated results
    const snapshot = await query.limit(limit).offset(offset).get();

    const challenges: ChallengeWithLeaders[] = [];

    for (const doc of snapshot.docs) {
        const data = doc.data();
        const challenge: Challenge = {
            id: doc.id,
            title: data.title,
            description: data.description,
            scope: data.scope,
            type: data.type,
            status: determineStatus(toDate(data.startDate), toDate(data.endDate)),
            districtId: data.districtId,
            districtName: data.districtName,
            state: data.state,
            targetTrees: data.targetTrees || 0,
            currentTrees: data.currentTrees || 0,
            targetO2: data.targetO2 || 0,
            currentO2: data.currentO2 || 0,
            startDate: toDate(data.startDate),
            endDate: toDate(data.endDate),
            totalParticipants: data.totalParticipants || 0,
            individualParticipants: data.individualParticipants || 0,
            ngoParticipants: data.ngoParticipants || 0,
            imageUrl: data.imageUrl,
            createdBy: data.createdBy,
            createdByName: data.createdByName,
            createdAt: toDate(data.createdAt),
            updatedAt: toDate(data.updatedAt),
        };

        // Get top 3 contributors
        const topContributors = await getTopContributors(doc.id, 3);

        challenges.push({
            ...challenge,
            topContributors,
        });
    }

    return {
        challenges,
        total,
        hasMore: offset + limit < total,
    };
}

// Get a single challenge with details
export async function getChallengeById(
    challengeId: string,
    userId?: string
): Promise<ChallengeDetailResponse | null> {
    const db = getDb();
    const doc = await db.collection(CHALLENGES_COLLECTION).doc(challengeId).get();

    if (!doc.exists) {
        return null;
    }

    const data = doc.data()!;
    const challenge: Challenge = {
        id: doc.id,
        title: data.title,
        description: data.description,
        scope: data.scope,
        type: data.type,
        status: determineStatus(toDate(data.startDate), toDate(data.endDate)),
        districtId: data.districtId,
        districtName: data.districtName,
        state: data.state,
        targetTrees: data.targetTrees || 0,
        currentTrees: data.currentTrees || 0,
        targetO2: data.targetO2 || 0,
        currentO2: data.currentO2 || 0,
        startDate: toDate(data.startDate),
        endDate: toDate(data.endDate),
        totalParticipants: data.totalParticipants || 0,
        individualParticipants: data.individualParticipants || 0,
        ngoParticipants: data.ngoParticipants || 0,
        imageUrl: data.imageUrl,
        createdBy: data.createdBy,
        createdByName: data.createdByName,
        createdAt: toDate(data.createdAt),
        updatedAt: toDate(data.updatedAt),
    };

    // Get top contributors
    const topContributors = await getTopContributors(challengeId, 5);
    const leaderboard = await getTopContributors(challengeId, 50);

    // Get user participation if userId provided
    let userParticipation: ChallengeParticipant | undefined;
    if (userId) {
        userParticipation = await getParticipant(challengeId, userId);
    }

    return {
        challenge: {
            ...challenge,
            topContributors,
        },
        userParticipation,
        leaderboard,
    };
}

// Get top contributors for a challenge
async function getTopContributors(
    challengeId: string,
    limit: number
): Promise<ChallengeParticipant[]> {
    const db = getDb();
    const snapshot = await db.collection(CHALLENGE_PARTICIPANTS_COLLECTION)
        .where('challengeId', '==', challengeId)
        .orderBy('treesContributed', 'desc')
        .limit(limit)
        .get();

    return snapshot.docs.map((doc, index: number) => {
        const data = doc.data();
        return {
            id: doc.id,
            challengeId: data.challengeId,
            userId: data.userId,
            userName: data.userName,
            userEmail: data.userEmail,
            photoURL: data.photoURL,
            participantType: data.participantType,
            ngoName: data.ngoName,
            treesContributed: data.treesContributed || 0,
            o2Impact: data.o2Impact || 0,
            rank: index + 1,
            joinedAt: toDate(data.joinedAt),
            lastContributionAt: data.lastContributionAt ? toDate(data.lastContributionAt) : undefined,
        };
    });
}

// Get participant by challenge and user
async function getParticipant(
    challengeId: string,
    userId: string
): Promise<ChallengeParticipant | undefined> {
    const db = getDb();
    const snapshot = await db.collection(CHALLENGE_PARTICIPANTS_COLLECTION)
        .where('challengeId', '==', challengeId)
        .where('userId', '==', userId)
        .limit(1)
        .get();

    if (snapshot.empty) return undefined;

    const doc = snapshot.docs[0];
    const data = doc.data();

    // Get rank
    const rankSnapshot = await db.collection(CHALLENGE_PARTICIPANTS_COLLECTION)
        .where('challengeId', '==', challengeId)
        .where('treesContributed', '>', data.treesContributed || 0)
        .count()
        .get();

    const rank = rankSnapshot.data().count + 1;

    return {
        id: doc.id,
        challengeId: data.challengeId,
        userId: data.userId,
        userName: data.userName,
        userEmail: data.userEmail,
        photoURL: data.photoURL,
        participantType: data.participantType,
        ngoName: data.ngoName,
        treesContributed: data.treesContributed || 0,
        o2Impact: data.o2Impact || 0,
        rank,
        joinedAt: toDate(data.joinedAt),
        lastContributionAt: data.lastContributionAt ? toDate(data.lastContributionAt) : undefined,
    };
}

// Join a challenge
export async function joinChallenge(
    challengeId: string,
    userId: string,
    userName: string,
    userEmail?: string,
    photoURL?: string,
    participantType: 'individual' | 'ngo' = 'individual',
    ngoName?: string
): Promise<ChallengeParticipant | null> {
    const db = getDb();

    // Check if challenge exists and is active
    const challengeDoc = await db.collection(CHALLENGES_COLLECTION).doc(challengeId).get();
    if (!challengeDoc.exists) return null;

    const challengeData = challengeDoc.data()!;
    const status = determineStatus(toDate(challengeData.startDate), toDate(challengeData.endDate));
    if (status !== 'active' && status !== 'upcoming') {
        return null; // Can't join completed or cancelled challenges
    }

    // Check if already joined
    const existingSnapshot = await db.collection(CHALLENGE_PARTICIPANTS_COLLECTION)
        .where('challengeId', '==', challengeId)
        .where('userId', '==', userId)
        .limit(1)
        .get();

    if (!existingSnapshot.empty) {
        // Already joined, return existing
        const doc = existingSnapshot.docs[0];
        const data = doc.data();
        return {
            id: doc.id,
            challengeId: data.challengeId,
            userId: data.userId,
            userName: data.userName,
            userEmail: data.userEmail,
            photoURL: data.photoURL,
            participantType: data.participantType,
            ngoName: data.ngoName,
            treesContributed: data.treesContributed || 0,
            o2Impact: data.o2Impact || 0,
            joinedAt: toDate(data.joinedAt),
            lastContributionAt: data.lastContributionAt ? toDate(data.lastContributionAt) : undefined,
        };
    }

    // Create new participant
    const now = new Date();
    const participantData = {
        challengeId,
        userId,
        userName,
        userEmail,
        photoURL,
        participantType,
        ngoName,
        treesContributed: 0,
        o2Impact: 0,
        joinedAt: now,
    };

    const docRef = await db.collection(CHALLENGE_PARTICIPANTS_COLLECTION).add(participantData);

    // Update challenge participant counts
    const incrementField = participantType === 'ngo' ? 'ngoParticipants' : 'individualParticipants';
    await db.collection(CHALLENGES_COLLECTION).doc(challengeId).update({
        totalParticipants: (challengeData.totalParticipants || 0) + 1,
        [incrementField]: (challengeData[incrementField] || 0) + 1,
        updatedAt: now,
    });

    return {
        id: docRef.id,
        ...participantData,
        rank: undefined,
        lastContributionAt: undefined,
    };
}

// Record a contribution to a challenge
export async function recordChallengeContribution(
    challengeId: string,
    contributionId: string,
    userId: string,
    treeCount: number,
    o2Impact: number
): Promise<boolean> {
    const db = getDb();

    // Get participant
    const participantSnapshot = await db.collection(CHALLENGE_PARTICIPANTS_COLLECTION)
        .where('challengeId', '==', challengeId)
        .where('userId', '==', userId)
        .limit(1)
        .get();

    if (participantSnapshot.empty) {
        return false; // User hasn't joined this challenge
    }

    const participantDoc = participantSnapshot.docs[0];
    const participantData = participantDoc.data();
    const now = new Date();

    // Check if contribution already recorded
    const existingContribution = await db.collection(CHALLENGE_CONTRIBUTIONS_COLLECTION)
        .where('challengeId', '==', challengeId)
        .where('contributionId', '==', contributionId)
        .limit(1)
        .get();

    if (!existingContribution.empty) {
        return true; // Already recorded
    }

    // Record the contribution
    await db.collection(CHALLENGE_CONTRIBUTIONS_COLLECTION).add({
        challengeId,
        contributionId,
        participantId: participantDoc.id,
        userId,
        treeCount,
        o2Impact,
        contributedAt: now,
    });

    // Update participant stats
    await participantDoc.ref.update({
        treesContributed: (participantData.treesContributed || 0) + treeCount,
        o2Impact: (participantData.o2Impact || 0) + o2Impact,
        lastContributionAt: now,
    });

    // Update challenge stats
    const challengeDoc = await db.collection(CHALLENGES_COLLECTION).doc(challengeId).get();
    if (challengeDoc.exists) {
        const challengeData = challengeDoc.data()!;
        await challengeDoc.ref.update({
            currentTrees: (challengeData.currentTrees || 0) + treeCount,
            currentO2: (challengeData.currentO2 || 0) + o2Impact,
            updatedAt: now,
        });
    }

    return true;
}

// Get active challenges for a location (for plant/donate pages)
export async function getActiveChallengesForLocation(
    districtId?: string,
    state?: string
): Promise<Challenge[]> {
    const db = getDb();
    const now = new Date();

    // Get all active challenges
    const snapshot = await db.collection(CHALLENGES_COLLECTION)
        .where('startDate', '<=', now)
        .where('endDate', '>=', now)
        .get();

    const challenges: Challenge[] = [];

    for (const doc of snapshot.docs) {
        const data = doc.data();
        const challenge: Challenge = {
            id: doc.id,
            title: data.title,
            description: data.description,
            scope: data.scope,
            type: data.type,
            status: 'active',
            districtId: data.districtId,
            districtName: data.districtName,
            state: data.state,
            targetTrees: data.targetTrees || 0,
            currentTrees: data.currentTrees || 0,
            targetO2: data.targetO2 || 0,
            currentO2: data.currentO2 || 0,
            startDate: toDate(data.startDate),
            endDate: toDate(data.endDate),
            totalParticipants: data.totalParticipants || 0,
            individualParticipants: data.individualParticipants || 0,
            ngoParticipants: data.ngoParticipants || 0,
            imageUrl: data.imageUrl,
            createdBy: data.createdBy,
            createdByName: data.createdByName,
            createdAt: toDate(data.createdAt),
            updatedAt: toDate(data.updatedAt),
        };

        // Filter based on scope and location
        if (challenge.scope === 'national') {
            challenges.push(challenge);
        } else if (challenge.scope === 'state' && challenge.state === state) {
            challenges.push(challenge);
        } else if (challenge.scope === 'district' && challenge.districtId === districtId) {
            challenges.push(challenge);
        }
    }

    return challenges;
}

// Create a new challenge (admin only in the future)
export async function createChallenge(
    data: Omit<Challenge, 'id' | 'currentTrees' | 'currentO2' | 'totalParticipants' | 'individualParticipants' | 'ngoParticipants' | 'createdAt' | 'updatedAt'>
): Promise<Challenge> {
    const db = getDb();
    const now = new Date();

    const challengeData = {
        ...data,
        currentTrees: 0,
        currentO2: 0,
        totalParticipants: 0,
        individualParticipants: 0,
        ngoParticipants: 0,
        createdAt: now,
        updatedAt: now,
    };

    // Remove undefined values to prevent Firestore errors
    const cleanedData = Object.fromEntries(
        Object.entries(challengeData).filter(([_, value]) => value !== undefined)
    );

    const docRef = await db.collection(CHALLENGES_COLLECTION).add(cleanedData);

    return {
        id: docRef.id,
        ...challengeData,
    };
}

// Get user's challenges they've joined
export async function getUserChallenges(userId: string): Promise<ChallengeWithLeaders[]> {
    const db = getDb();

    // Get all participation records for user
    const participantSnapshot = await db.collection(CHALLENGE_PARTICIPANTS_COLLECTION)
        .where('userId', '==', userId)
        .get();

    const challengeIds = participantSnapshot.docs.map((doc) => doc.data().challengeId);

    if (challengeIds.length === 0) return [];

    const challenges: ChallengeWithLeaders[] = [];

    // Get each challenge (Firestore doesn't support 'in' with more than 10 items)
    for (const challengeId of challengeIds.slice(0, 10)) {
        const result = await getChallengeById(challengeId);
        if (result) {
            challenges.push(result.challenge);
        }
    }

    return challenges;
}
