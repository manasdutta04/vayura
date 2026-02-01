import {
    collection,
    doc,
    getDocs,
    setDoc,
    updateDoc,
    query,
    where,
    orderBy,
    limit,
    Timestamp,
    QueryConstraint,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Collections, District, EnvironmentalData, TreeContribution, LeaderboardEntry } from '@/lib/types/firestore';

/**
 * Check if Firestore is available
 */
function ensureFirestore() {
    if (!db) {
        throw new Error('Firestore is not configured. Please add Firebase credentials to your environment variables.');
    }
}

/**
 * Convert Firestore Timestamp to Date
 */
function timestampToDate(timestamp: unknown): Date {
    if (timestamp instanceof Timestamp) {
        return timestamp.toDate();
    }
    if (timestamp && typeof timestamp === 'object' && 'toDate' in timestamp && typeof timestamp.toDate === 'function') {
        return timestamp.toDate();
    }
    return timestamp instanceof Date ? timestamp : new Date(timestamp as string | number);
}

/**
 * Districts
 */
export async function getDistrict(slug: string): Promise<District | null> {
    ensureFirestore();
    const districtsRef = collection(db, Collections.DISTRICTS);
    const q = query(districtsRef, where('slug', '==', slug), limit(1));
    const snapshot = await getDocs(q);

    if (snapshot.empty) return null;

    const doc = snapshot.docs[0];
    const data = doc.data();

    return {
        id: doc.id,
        ...data,
        createdAt: timestampToDate(data.createdAt),
        updatedAt: timestampToDate(data.updatedAt),
    } as District;
}

export async function getAllDistricts(): Promise<District[]> {
    ensureFirestore();
    const districtsRef = collection(db, Collections.DISTRICTS);
    const snapshot = await getDocs(query(districtsRef, orderBy('name')));

    return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            ...data,
            createdAt: timestampToDate(data.createdAt),
            updatedAt: timestampToDate(data.updatedAt),
        } as District;
    });
}

export async function searchDistricts(searchQuery: string): Promise<District[]> {
    const districtsRef = collection(db, Collections.DISTRICTS);
    const snapshot = await getDocs(districtsRef);

    const searchLower = searchQuery.toLowerCase();

    return snapshot.docs
        .map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                createdAt: timestampToDate(data.createdAt),
                updatedAt: timestampToDate(data.updatedAt),
            } as District;
        })
        .filter(district =>
            district.name.toLowerCase().includes(searchLower) ||
            district.slug.toLowerCase().includes(searchLower) ||
            district.state.toLowerCase().includes(searchLower)
        );
}

/**
 * Environmental Data
 */
export async function getLatestEnvironmentalData(districtId: string): Promise<EnvironmentalData | null> {
    const envRef = collection(db, Collections.ENVIRONMENTAL_DATA);
    const q = query(
        envRef,
        where('districtId', '==', districtId),
        orderBy('timestamp', 'desc'),
        limit(1)
    );

    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;

    const doc = snapshot.docs[0];
    const data = doc.data();

    return {
        id: doc.id,
        ...data,
        timestamp: timestampToDate(data.timestamp),
        createdAt: timestampToDate(data.createdAt),
    } as EnvironmentalData;
}

export async function createEnvironmentalData(data: Omit<EnvironmentalData, 'id' | 'createdAt'>): Promise<string> {
    const envRef = collection(db, Collections.ENVIRONMENTAL_DATA);
    const docRef = doc(envRef);

    await setDoc(docRef, {
        ...data,
        createdAt: Timestamp.now(),
    });

    return docRef.id;
}

/**
 * Tree Contributions
 */
export async function createTreeContribution(data: Omit<TreeContribution, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const contribRef = collection(db, Collections.TREE_CONTRIBUTIONS);
    const docRef = doc(contribRef);

    await setDoc(docRef, {
        ...data,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
    });

    return docRef.id;
}

export async function getTreeContributions(districtId?: string, status?: string): Promise<TreeContribution[]> {
    const contribRef = collection(db, Collections.TREE_CONTRIBUTIONS);
    const constraints: QueryConstraint[] = [orderBy('plantedAt', 'desc')];

    if (districtId) {
        constraints.unshift(where('districtId', '==', districtId));
    }

    if (status) {
        constraints.unshift(where('status', '==', status));
    }

    const q = query(contribRef, ...constraints, limit(50));
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => {
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
}

/**
 * Leaderboard
 */
export async function getLeaderboard(stateFilter?: string): Promise<LeaderboardEntry[]> {
    const leaderboardRef = collection(db, Collections.LEADERBOARD);
    const constraints: QueryConstraint[] = [orderBy('totalTrees', 'desc'), limit(50)];

    if (stateFilter) {
        constraints.unshift(where('districtState', '==', stateFilter));
    }

    const q = query(leaderboardRef, ...constraints);
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc, index) => {
        const data = doc.data();
        return {
            id: doc.id,
            ...data,
            rank: index + 1,
            lastUpdated: timestampToDate(data.lastUpdated),
            createdAt: timestampToDate(data.createdAt),
        } as LeaderboardEntry;
    });
}

export async function updateLeaderboard(districtId: string, updates: Partial<LeaderboardEntry>): Promise<void> {
    const leaderboardRef = doc(db, Collections.LEADERBOARD, districtId);

    await updateDoc(leaderboardRef, {
        ...updates,
        lastUpdated: Timestamp.now(),
    });
}

/**
 * Stats
 */
export async function getGlobalStats() {
    const leaderboardRef = collection(db, Collections.LEADERBOARD);
    const snapshot = await getDocs(leaderboardRef);

    let totalTrees = 0;
    let totalOxygen = 0;

    snapshot.docs.forEach(doc => {
        const data = doc.data();
        totalTrees += data.totalTrees || 0;
        totalOxygen += data.oxygenOffset || 0;
    });

    return {
        totalDistricts: snapshot.size,
        totalTrees,
        totalOxygen,
    };
}
