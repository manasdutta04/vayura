'use client';

import { useEffect, useState, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/ui/header';
import { Footer } from '@/components/ui/footer';
import { useAuth } from '@/lib/auth-context';
import { formatCompactNumber } from '@/lib/utils/helpers';
import {
    ChallengeWithLeaders,
    ChallengeParticipant,
    ChallengeDetailResponse,
    getChallengeTimeRemaining,
    getChallengeProgress,
    SCOPE_DISPLAY_NAMES,
    STATUS_DISPLAY_INFO,
} from '@/lib/types/challenges';
import {
    Target,
    Trophy,
    Users,
    Clock,
    TreeDeciduous,
    Wind,
    MapPin,
    Building2,
    Globe,
    ArrowLeft,
    Flame,
    Award,
    Crown,
    Medal,
    Calendar,
    CheckCircle,
    Star,
    TrendingUp,
    Zap,
    Share2,
    ExternalLink,
} from 'lucide-react';

// Countdown Timer Component
function CountdownTimer({ endDate, large = false }: { endDate: Date; large?: boolean }) {
    const [timeRemaining, setTimeRemaining] = useState(getChallengeTimeRemaining(endDate));

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeRemaining(getChallengeTimeRemaining(endDate));
        }, 1000);

        return () => clearInterval(timer);
    }, [endDate]);

    if (timeRemaining.isExpired) {
        return (
            <div className={`text-gray-500 font-medium ${large ? 'text-lg' : 'text-sm'}`}>
                Challenge Ended
            </div>
        );
    }

    if (large) {
        return (
            <div className="flex gap-3">
                {timeRemaining.days > 0 && (
                    <div className="bg-white rounded-xl p-3 text-center shadow-sm border border-gray-100 min-w-[70px]">
                        <div className="text-2xl font-bold text-gray-900">{timeRemaining.days}</div>
                        <div className="text-xs text-gray-500 uppercase tracking-wide">Days</div>
                    </div>
                )}
                <div className="bg-white rounded-xl p-3 text-center shadow-sm border border-gray-100 min-w-[70px]">
                    <div className="text-2xl font-bold text-gray-900">{String(timeRemaining.hours).padStart(2, '0')}</div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide">Hours</div>
                </div>
                <div className="bg-white rounded-xl p-3 text-center shadow-sm border border-gray-100 min-w-[70px]">
                    <div className="text-2xl font-bold text-gray-900">{String(timeRemaining.minutes).padStart(2, '0')}</div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide">Mins</div>
                </div>
                <div className="bg-white rounded-xl p-3 text-center shadow-sm border border-gray-100 min-w-[70px]">
                    <div className={`text-2xl font-bold ${timeRemaining.days === 0 ? 'text-orange-600' : 'text-gray-900'}`}>
                        {String(timeRemaining.seconds).padStart(2, '0')}
                    </div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide">Secs</div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-orange-500" />
            <div className="flex gap-1 text-sm font-mono">
                {timeRemaining.days > 0 && (
                    <span className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-900 font-semibold">
                        {timeRemaining.days}d
                    </span>
                )}
                <span className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-900 font-semibold">
                    {String(timeRemaining.hours).padStart(2, '0')}h
                </span>
                <span className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-900 font-semibold">
                    {String(timeRemaining.minutes).padStart(2, '0')}m
                </span>
            </div>
        </div>
    );
}

// Progress Bar Component
function ProgressBar({ current, target, large = false }: { current: number; target: number; large?: boolean }) {
    const progress = getChallengeProgress(current, target);
    const isComplete = progress >= 100;

    return (
        <div className="space-y-2">
            <div className="flex justify-between items-end">
                <div>
                    <span className={`font-bold text-gray-900 ${large ? 'text-3xl' : 'text-lg'}`}>
                        {formatCompactNumber(current)}
                    </span>
                    <span className={`text-gray-500 ${large ? 'text-lg' : 'text-sm'}`}>
                        {' '}/ {formatCompactNumber(target)} trees
                    </span>
                </div>
                <span className={`font-bold ${isComplete ? 'text-green-600' : 'text-gray-900'} ${large ? 'text-2xl' : 'text-lg'}`}>
                    {progress}%
                </span>
            </div>
            <div className={`bg-gray-100 rounded-full overflow-hidden ${large ? 'h-4' : 'h-3'}`}>
                <div
                    className={`h-full rounded-full transition-all duration-500 ${isComplete
                            ? 'bg-gradient-to-r from-green-500 to-emerald-400'
                            : progress > 75
                                ? 'bg-gradient-to-r from-green-500 to-green-400'
                                : progress > 50
                                    ? 'bg-gradient-to-r from-yellow-500 to-amber-400'
                                    : progress > 25
                                        ? 'bg-gradient-to-r from-orange-500 to-orange-400'
                                        : 'bg-gradient-to-r from-red-500 to-red-400'
                        }`}
                    style={{ width: `${progress}%` }}
                />
            </div>
        </div>
    );
}

// Leaderboard Entry Component
function LeaderboardEntry({
    participant,
    isCurrentUser = false,
}: {
    participant: ChallengeParticipant;
    isCurrentUser?: boolean;
}) {
    const isTop3 = participant.rank && participant.rank <= 3;

    const rankBadge = () => {
        if (!participant.rank) return null;
        if (participant.rank === 1) {
            return (
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 text-white shadow-lg shadow-amber-200">
                    <Crown className="w-5 h-5" />
                </div>
            );
        }
        if (participant.rank === 2) {
            return (
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 text-white shadow-lg shadow-gray-200">
                    <Medal className="w-5 h-5" />
                </div>
            );
        }
        if (participant.rank === 3) {
            return (
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-500 text-white shadow-lg shadow-orange-200">
                    <Award className="w-5 h-5" />
                </div>
            );
        }
        return (
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 text-gray-600 font-bold text-sm">
                #{participant.rank}
            </div>
        );
    };

    return (
        <div
            className={`flex items-center gap-4 p-4 rounded-xl transition-all duration-200 ${isCurrentUser
                    ? 'bg-green-50 border-2 border-green-200 shadow-sm'
                    : isTop3
                        ? 'bg-gradient-to-r from-amber-50/50 to-white border border-amber-100'
                        : 'bg-white hover:bg-gray-50 border border-gray-100'
                }`}
        >
            {rankBadge()}

            {/* User Avatar */}
            <div className="relative">
                {participant.photoURL ? (
                    <img
                        src={participant.photoURL}
                        alt={participant.userName}
                        className="w-12 h-12 rounded-full object-cover border-2 border-white shadow"
                    />
                ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-white font-bold text-lg shadow">
                        {participant.userName[0]?.toUpperCase() || '?'}
                    </div>
                )}
                {isCurrentUser && (
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                        <Star className="w-3 h-3 text-white fill-white" />
                    </div>
                )}
            </div>

            {/* User Info */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900 truncate">
                        {participant.userName}
                        {isCurrentUser && (
                            <span className="ml-2 text-xs font-medium text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                                You
                            </span>
                        )}
                    </h3>
                </div>
                {participant.participantType === 'ngo' && participant.ngoName && (
                    <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                        <Building2 className="w-3 h-3" />
                        {participant.ngoName}
                    </p>
                )}
            </div>

            {/* Stats */}
            <div className="text-right">
                <div className="flex items-center gap-1 justify-end">
                    <TreeDeciduous className="w-4 h-4 text-green-600" />
                    <span className="font-bold text-gray-900">{formatCompactNumber(participant.treesContributed)}</span>
                </div>
                <div className="flex items-center gap-1 justify-end text-sm text-gray-500">
                    <Wind className="w-3 h-3" />
                    <span>{formatCompactNumber(participant.o2Impact)} kg O2</span>
                </div>
            </div>
        </div>
    );
}

// Main Content Component
function ChallengeDetailContent() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const [data, setData] = useState<ChallengeDetailResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [joining, setJoining] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const challengeId = params.id as string;

    // Fetch challenge details
    useEffect(() => {
        async function fetchChallenge() {
            setLoading(true);
            try {
                const url = new URL(`/api/challenges`, window.location.origin);
                url.searchParams.set('id', challengeId);
                if (user?.uid) url.searchParams.set('userId', user.uid);

                const res = await fetch(url.toString());
                if (!res.ok) {
                    throw new Error('Challenge not found');
                }
                const result = await res.json();
                setData(result);
            } catch (err) {
                setError('Failed to load challenge');
                console.error('Error fetching challenge:', err);
            } finally {
                setLoading(false);
            }
        }

        if (challengeId) {
            fetchChallenge();
        }
    }, [challengeId, user?.uid]);

    // Handle join challenge
    const handleJoin = async () => {
        if (!user) {
            window.location.href = '/?auth_required=true';
            return;
        }

        setJoining(true);
        try {
            const res = await fetch('/api/challenges', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'join',
                    challengeId,
                    userId: user.uid,
                    userName: user.displayName || 'Anonymous',
                    userEmail: user.email,
                    photoURL: user.photoURL,
                    participantType: 'individual',
                }),
            });

            if (res.ok) {
                // Refresh data
                const url = new URL(`/api/challenges`, window.location.origin);
                url.searchParams.set('id', challengeId);
                url.searchParams.set('userId', user.uid);
                const refreshRes = await fetch(url.toString());
                if (refreshRes.ok) {
                    const result = await refreshRes.json();
                    setData(result);
                }
            }
        } catch (err) {
            console.error('Error joining challenge:', err);
        } finally {
            setJoining(false);
        }
    };

    // Share challenge
    const handleShare = async () => {
        const url = window.location.href;
        if (navigator.share) {
            try {
                await navigator.share({
                    title: data?.challenge.title,
                    text: data?.challenge.description,
                    url,
                });
            } catch {
                // User cancelled
            }
        } else {
            await navigator.clipboard.writeText(url);
            alert('Link copied to clipboard!');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-green-50/30 to-white">
                <Header />
                <main className="max-w-4xl mx-auto px-6 py-8">
                    <div className="animate-pulse space-y-6">
                        <div className="h-8 w-32 bg-gray-200 rounded" />
                        <div className="h-10 w-3/4 bg-gray-200 rounded" />
                        <div className="h-6 w-full bg-gray-100 rounded" />
                        <div className="h-4 w-full bg-gray-100 rounded-full" />
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-green-50/30 to-white">
                <Header />
                <main className="max-w-4xl mx-auto px-6 py-8">
                    <div className="text-center py-12">
                        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                            <Target className="w-8 h-8 text-red-400" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">Challenge Not Found</h2>
                        <p className="text-gray-500 mb-6">This challenge may have been removed or doesn't exist.</p>
                        <Link
                            href="/challenges"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Challenges
                        </Link>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    const { challenge, userParticipation, leaderboard } = data;
    const isActive = challenge.status === 'active';
    const isUpcoming = challenge.status === 'upcoming';
    const hasJoined = !!userParticipation;

    return (
        <div className="min-h-screen bg-gradient-to-b from-green-50/30 to-white">
            <Header />

            <main className="max-w-4xl mx-auto px-6 py-8">
                {/* Back Link */}
                <Link
                    href="/challenges"
                    className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors mb-6"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Challenges
                </Link>

                {/* Challenge Header */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-6">
                    <div className="p-6">
                        {/* Status and Meta */}
                        <div className="flex flex-wrap items-center gap-3 mb-4">
                            <span
                                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${STATUS_DISPLAY_INFO[challenge.status].color === 'green'
                                        ? 'bg-green-100 text-green-700 border-green-200'
                                        : STATUS_DISPLAY_INFO[challenge.status].color === 'blue'
                                            ? 'bg-blue-100 text-blue-700 border-blue-200'
                                            : 'bg-gray-100 text-gray-700 border-gray-200'
                                    }`}
                            >
                                {isActive && <Flame className="w-4 h-4" />}
                                {STATUS_DISPLAY_INFO[challenge.status].label}
                            </span>
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-600 font-medium">
                                {challenge.scope === 'national' && <Globe className="w-4 h-4" />}
                                {challenge.scope === 'state' && <Building2 className="w-4 h-4" />}
                                {challenge.scope === 'district' && <MapPin className="w-4 h-4" />}
                                {SCOPE_DISPLAY_NAMES[challenge.scope]} Challenge
                            </span>
                            {(challenge.districtName || challenge.state) && (
                                <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-50 rounded-full text-sm text-green-700 font-medium">
                                    <MapPin className="w-4 h-4" />
                                    {challenge.districtName && `${challenge.districtName}, `}
                                    {challenge.state}
                                </span>
                            )}
                        </div>

                        {/* Title */}
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                            {challenge.title}
                        </h1>

                        {/* Description */}
                        <p className="text-gray-600 mb-6">
                            {challenge.description}
                        </p>

                        {/* Progress */}
                        <ProgressBar current={challenge.currentTrees} target={challenge.targetTrees} large />

                        {/* Countdown */}
                        {isActive && (
                            <div className="mt-6 pt-6 border-t border-gray-100">
                                <div className="flex items-center justify-between flex-wrap gap-4">
                                    <div>
                                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">
                                            Time Remaining
                                        </h3>
                                        <CountdownTimer endDate={new Date(challenge.endDate)} large />
                                    </div>
                                    <div className="flex gap-3">
                                        <button
                                            onClick={handleShare}
                                            className="p-3 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                                            title="Share Challenge"
                                        >
                                            <Share2 className="w-5 h-5" />
                                        </button>
                                        {!hasJoined && (isActive || isUpcoming) && (
                                            <button
                                                onClick={handleJoin}
                                                disabled={joining}
                                                className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all shadow-lg shadow-green-200 hover:shadow-xl hover:shadow-green-300 flex items-center gap-2 disabled:opacity-50"
                                            >
                                                <Zap className="w-5 h-5" />
                                                {joining ? 'Joining...' : 'Join Challenge'}
                                            </button>
                                        )}
                                        {hasJoined && (
                                            <Link
                                                href="/plant"
                                                className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all shadow-lg shadow-green-200 hover:shadow-xl hover:shadow-green-300 flex items-center gap-2"
                                            >
                                                <TreeDeciduous className="w-5 h-5" />
                                                Contribute Trees
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {isUpcoming && (
                            <div className="mt-6 pt-6 border-t border-gray-100">
                                <div className="flex items-center gap-2 text-blue-600">
                                    <Calendar className="w-5 h-5" />
                                    <span className="font-medium">
                                        Starts {new Date(challenge.startDate).toLocaleDateString('en-IN', {
                                            weekday: 'long',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                        })}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Stats Bar */}
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div className="text-center">
                            <div className="flex items-center justify-center gap-1 text-gray-600 mb-1">
                                <TreeDeciduous className="w-4 h-4" />
                            </div>
                            <div className="text-xl font-bold text-gray-900">{formatCompactNumber(challenge.currentTrees)}</div>
                            <div className="text-xs text-gray-500 uppercase tracking-wide">Trees Planted</div>
                        </div>
                        <div className="text-center">
                            <div className="flex items-center justify-center gap-1 text-gray-600 mb-1">
                                <Wind className="w-4 h-4" />
                            </div>
                            <div className="text-xl font-bold text-gray-900">{formatCompactNumber(challenge.currentO2)}</div>
                            <div className="text-xs text-gray-500 uppercase tracking-wide">kg O2 Impact</div>
                        </div>
                        <div className="text-center">
                            <div className="flex items-center justify-center gap-1 text-gray-600 mb-1">
                                <Users className="w-4 h-4" />
                            </div>
                            <div className="text-xl font-bold text-gray-900">{formatCompactNumber(challenge.totalParticipants)}</div>
                            <div className="text-xs text-gray-500 uppercase tracking-wide">Participants</div>
                        </div>
                        <div className="text-center">
                            <div className="flex items-center justify-center gap-1 text-gray-600 mb-1">
                                <Building2 className="w-4 h-4" />
                            </div>
                            <div className="text-xl font-bold text-gray-900">{formatCompactNumber(challenge.ngoParticipants)}</div>
                            <div className="text-xs text-gray-500 uppercase tracking-wide">NGOs Joined</div>
                        </div>
                    </div>
                </div>

                {/* User Participation Card */}
                {hasJoined && userParticipation && (
                    <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl p-6 mb-6 text-white shadow-lg">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                                <CheckCircle className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg">You're Participating!</h3>
                                <p className="text-green-100 text-sm">Keep contributing to climb the leaderboard</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4 bg-white/10 rounded-xl p-4">
                            <div className="text-center">
                                <div className="text-2xl font-bold">{formatCompactNumber(userParticipation.treesContributed)}</div>
                                <div className="text-xs text-green-100 uppercase">Your Trees</div>
                            </div>
                            <div className="text-center border-x border-white/20">
                                <div className="text-2xl font-bold">{formatCompactNumber(userParticipation.o2Impact)}</div>
                                <div className="text-xs text-green-100 uppercase">kg O2</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold">#{userParticipation.rank || '-'}</div>
                                <div className="text-xs text-green-100 uppercase">Your Rank</div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Leaderboard */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="p-5 border-b border-gray-100 bg-gray-50/50">
                        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <Trophy className="w-5 h-5 text-amber-500" />
                            Challenge Leaderboard
                        </h2>
                    </div>
                    <div className="p-4 space-y-3">
                        {leaderboard.length === 0 ? (
                            <div className="text-center py-8">
                                <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                                    <Users className="w-7 h-7 text-gray-400" />
                                </div>
                                <h3 className="font-semibold text-gray-900 mb-1">No Contributors Yet</h3>
                                <p className="text-sm text-gray-500">Be the first to contribute to this challenge!</p>
                            </div>
                        ) : (
                            leaderboard.map((participant) => (
                                <LeaderboardEntry
                                    key={participant.id}
                                    participant={participant}
                                    isCurrentUser={participant.userId === user?.uid}
                                />
                            ))
                        )}
                    </div>
                </div>

                {/* CTA Section */}
                {!hasJoined && (isActive || isUpcoming) && (
                    <div className="mt-8 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-8 text-white text-center shadow-xl">
                        <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-80" />
                        <h3 className="text-2xl font-bold mb-2">Ready to Join?</h3>
                        <p className="text-green-100 mb-6 max-w-md mx-auto">
                            Join this challenge and start contributing trees to make a collective impact!
                        </p>
                        <button
                            onClick={handleJoin}
                            disabled={joining}
                            className="px-8 py-3 bg-white text-green-700 font-semibold rounded-xl hover:bg-green-50 transition-colors shadow-lg flex items-center gap-2 mx-auto disabled:opacity-50"
                        >
                            <Zap className="w-5 h-5" />
                            {joining ? 'Joining...' : 'Join Challenge Now'}
                        </button>
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
}

// Main Page Export
export default function ChallengeDetailPage() {
    return (
        <Suspense
            fallback={
                <>
                    <Header />
                    <div className="min-h-screen bg-gradient-to-b from-green-50/30 to-white flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
                    </div>
                    <Footer />
                </>
            }
        >
            <ChallengeDetailContent />
        </Suspense>
    );
}
