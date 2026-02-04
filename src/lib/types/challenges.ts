/**
 * Community Challenges Types
 * Defines types for collective, time-bound environmental goals
 */

// Challenge scope levels
export type ChallengeScope = 'district' | 'state' | 'national';

// Challenge status
export type ChallengeStatus = 'upcoming' | 'active' | 'completed' | 'cancelled';

// Challenge type - what kind of contribution is being tracked
export type ChallengeType = 'plantation' | 'donation' | 'both';

// Participant type
export type ParticipantType = 'individual' | 'ngo';

// Challenge participant
export interface ChallengeParticipant {
    id: string;
    challengeId: string;
    userId: string;
    userName: string;
    userEmail?: string;
    photoURL?: string;
    participantType: ParticipantType;
    ngoName?: string;
    treesContributed: number;
    o2Impact: number;
    rank?: number;
    joinedAt: Date;
    lastContributionAt?: Date;
}

// Challenge contribution - links a tree contribution to a challenge
export interface ChallengeContribution {
    id: string;
    challengeId: string;
    contributionId: string;
    participantId: string;
    userId: string;
    treeCount: number;
    o2Impact: number;
    contributedAt: Date;
}

// Main Challenge interface
export interface Challenge {
    id: string;
    title: string;
    description: string;
    scope: ChallengeScope;
    type: ChallengeType;
    status: ChallengeStatus;

    // Location targeting
    districtId?: string;
    districtName?: string;
    state?: string;

    // Goals and progress
    targetTrees: number;
    currentTrees: number;
    targetO2: number; // in kg
    currentO2: number;

    // Timing
    startDate: Date;
    endDate: Date;

    // Participation stats
    totalParticipants: number;
    individualParticipants: number;
    ngoParticipants: number;

    // Featured image (optional)
    imageUrl?: string;

    // Creator info
    createdBy?: string;
    createdByName?: string;

    // Timestamps
    createdAt: Date;
    updatedAt: Date;
}

// Challenge with top contributors for display
export interface ChallengeWithLeaders extends Challenge {
    topContributors: ChallengeParticipant[];
}

// Challenge list response
export interface ChallengeListResponse {
    challenges: ChallengeWithLeaders[];
    total: number;
    hasMore: boolean;
}

// Challenge detail response
export interface ChallengeDetailResponse {
    challenge: ChallengeWithLeaders;
    userParticipation?: ChallengeParticipant;
    leaderboard: ChallengeParticipant[];
}

// Join challenge request
export interface JoinChallengeRequest {
    challengeId: string;
    userId: string;
    userName: string;
    userEmail?: string;
    photoURL?: string;
    participantType: ParticipantType;
    ngoName?: string;
}

// Contribute to challenge request
export interface ContributeToChallengeRequest {
    challengeId: string;
    contributionId: string;
    userId: string;
    treeCount: number;
    o2Impact: number;
}

// Firestore collection names
export const CHALLENGES_COLLECTION = 'challenges';
export const CHALLENGE_PARTICIPANTS_COLLECTION = 'challenge_participants';
export const CHALLENGE_CONTRIBUTIONS_COLLECTION = 'challenge_contributions';

// Helper to calculate remaining time
export function getChallengeTimeRemaining(endDate: Date): {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isExpired: boolean;
} {
    const now = new Date();
    const diff = new Date(endDate).getTime() - now.getTime();

    if (diff <= 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true };
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return { days, hours, minutes, seconds, isExpired: false };
}

// Helper to calculate progress percentage
export function getChallengeProgress(current: number, target: number): number {
    if (target <= 0) return 0;
    const progress = (current / target) * 100;
    return Math.min(Math.round(progress * 10) / 10, 100); // Round to 1 decimal, cap at 100
}

// Challenge scope display names
export const SCOPE_DISPLAY_NAMES: Record<ChallengeScope, string> = {
    district: 'District',
    state: 'State',
    national: 'National',
};

// Challenge status display info
export const STATUS_DISPLAY_INFO: Record<ChallengeStatus, { label: string; color: string }> = {
    upcoming: { label: 'Coming Soon', color: 'blue' },
    active: { label: 'Active', color: 'green' },
    completed: { label: 'Completed', color: 'gray' },
    cancelled: { label: 'Cancelled', color: 'red' },
};
