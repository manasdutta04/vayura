'use client';

import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { Header } from '@/components/ui/header';
import { Footer } from '@/components/ui/footer';
import { useAuth } from '@/lib/auth-context';
import { formatCompactNumber } from '@/lib/utils/helpers';
import {
    ChallengeWithLeaders,
    ChallengeListResponse,
    ChallengeScope,
    ChallengeStatus,
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
    ChevronRight,
    Filter,
    Flame,
    Award,
    Crown,
    Medal,
    Calendar,
    TrendingUp,
    Zap,
} from 'lucide-react';

// Countdown Timer Component
function CountdownTimer({ endDate }: { endDate: Date }) {
    const [timeRemaining, setTimeRemaining] = useState(getChallengeTimeRemaining(endDate));

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeRemaining(getChallengeTimeRemaining(endDate));
        }, 1000);

        return () => clearInterval(timer);
    }, [endDate]);

    if (timeRemaining.isExpired) {
        return (
            <div className="text-sm text-gray-500 font-medium">
                Challenge Ended
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
                {timeRemaining.days === 0 && (
                    <span className="bg-orange-100 px-1.5 py-0.5 rounded text-orange-700 font-semibold animate-pulse">
                        {String(timeRemaining.seconds).padStart(2, '0')}s
                    </span>
                )}
            </div>
        </div>
    );
}

// Progress Bar Component
function ProgressBar({ current, target, showLabel = true }: { current: number; target: number; showLabel?: boolean }) {
    const progress = getChallengeProgress(current, target);
    const isComplete = progress >= 100;

    return (
        <div className="space-y-1.5">
            {showLabel && (
                <div className="flex justify-between text-xs">
                    <span className="text-gray-600">
                        <span className="font-semibold text-gray-900">{formatCompactNumber(current)}</span> of {formatCompactNumber(target)} trees
                    </span>
                    <span className={`font-semibold ${isComplete ? 'text-green-600' : 'text-gray-900'}`}>
                        {progress}%
                    </span>
                </div>
            )}
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
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

// Scope Icon Component
function ScopeIcon({ scope, className = 'w-4 h-4' }: { scope: ChallengeScope; className?: string }) {
    switch (scope) {
        case 'national':
            return <Globe className={className} />;
        case 'state':
            return <Building2 className={className} />;
        case 'district':
            return <MapPin className={className} />;
    }
}

// Status Badge Component
function StatusBadge({ status }: { status: ChallengeStatus }) {
    const info = STATUS_DISPLAY_INFO[status];
    const colorClasses = {
        green: 'bg-green-100 text-green-700 border-green-200',
        blue: 'bg-blue-100 text-blue-700 border-blue-200',
        gray: 'bg-gray-100 text-gray-700 border-gray-200',
        red: 'bg-red-100 text-red-700 border-red-200',
    };

    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${colorClasses[info.color as keyof typeof colorClasses]}`}>
            {status === 'active' && <Flame className="w-3 h-3" />}
            {info.label}
        </span>
    );
}

// Top Contributor Avatar
function ContributorAvatar({ photoURL, userName, rank }: { photoURL?: string; userName: string; rank: number }) {
    const rankIcons: Record<number, React.ReactNode> = {
        1: <Crown className="w-3 h-3 text-amber-500" />,
        2: <Medal className="w-3 h-3 text-gray-400" />,
        3: <Award className="w-3 h-3 text-orange-400" />,
    };

    return (
        <div className="relative">
            {photoURL ? (
                <img
                    src={photoURL}
                    alt={userName}
                    className="w-8 h-8 rounded-full object-cover border-2 border-white shadow-sm"
                />
            ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-white text-xs font-semibold border-2 border-white shadow-sm">
                    {userName[0]?.toUpperCase() || '?'}
                </div>
            )}
            {rank <= 3 && (
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center shadow-sm">
                    {rankIcons[rank]}
                </div>
            )}
        </div>
    );
}

// Challenge Card Component
function ChallengeCard({ challenge, onJoin }: { challenge: ChallengeWithLeaders; onJoin?: (id: string) => void }) {
    const isActive = challenge.status === 'active';
    const isUpcoming = challenge.status === 'upcoming';

    return (
        <div className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-gray-300 ${isActive ? 'border-green-200' : 'border-gray-200'
            }`}>
            {/* Card Header */}
            <div className="relative p-5 pb-4">
                {/* Status and Scope */}
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <StatusBadge status={challenge.status} />
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 rounded-full text-xs text-gray-600 font-medium">
                            <ScopeIcon scope={challenge.scope} className="w-3 h-3" />
                            {SCOPE_DISPLAY_NAMES[challenge.scope]}
                        </span>
                    </div>
                    {isActive && <CountdownTimer endDate={new Date(challenge.endDate)} />}
                    {isUpcoming && (
                        <div className="flex items-center gap-1 text-xs text-blue-600 font-medium">
                            <Calendar className="w-3.5 h-3.5" />
                            Starts {new Date(challenge.startDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                        </div>
                    )}
                </div>

                {/* Title and Description */}
                <h3 className="text-lg font-bold text-gray-900 mb-1.5 line-clamp-2">
                    {challenge.title}
                </h3>
                <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                    {challenge.description}
                </p>

                {/* Location Tag */}
                {(challenge.districtName || challenge.state) && (
                    <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
                        <MapPin className="w-3.5 h-3.5" />
                        {challenge.districtName && `${challenge.districtName}, `}
                        {challenge.state}
                    </div>
                )}

                {/* Progress */}
                <ProgressBar current={challenge.currentTrees} target={challenge.targetTrees} />
            </div>

            {/* Stats Bar */}
            <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 grid grid-cols-3 gap-4">
                <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-gray-600 mb-0.5">
                        <TreeDeciduous className="w-3.5 h-3.5" />
                    </div>
                    <div className="text-sm font-bold text-gray-900">{formatCompactNumber(challenge.currentTrees)}</div>
                    <div className="text-[10px] text-gray-500 uppercase tracking-wide">Trees</div>
                </div>
                <div className="text-center border-x border-gray-200">
                    <div className="flex items-center justify-center gap-1 text-gray-600 mb-0.5">
                        <Wind className="w-3.5 h-3.5" />
                    </div>
                    <div className="text-sm font-bold text-gray-900">{formatCompactNumber(challenge.currentO2)}</div>
                    <div className="text-[10px] text-gray-500 uppercase tracking-wide">kg O2</div>
                </div>
                <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-gray-600 mb-0.5">
                        <Users className="w-3.5 h-3.5" />
                    </div>
                    <div className="text-sm font-bold text-gray-900">{formatCompactNumber(challenge.totalParticipants)}</div>
                    <div className="text-[10px] text-gray-500 uppercase tracking-wide">Joined</div>
                </div>
            </div>

            {/* Top Contributors */}
            {challenge.topContributors.length > 0 && (
                <div className="px-5 py-3 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-xs text-gray-500 font-medium">
                            <Trophy className="w-3.5 h-3.5 text-amber-500" />
                            Top Contributors
                        </div>
                        <div className="flex -space-x-2">
                            {challenge.topContributors.slice(0, 4).map((contributor, idx) => (
                                <ContributorAvatar
                                    key={contributor.id}
                                    photoURL={contributor.photoURL}
                                    userName={contributor.userName}
                                    rank={idx + 1}
                                />
                            ))}
                            {challenge.topContributors.length > 4 && (
                                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-semibold text-gray-600 border-2 border-white">
                                    +{challenge.topContributors.length - 4}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Action Footer */}
            <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-between">
                <Link
                    href={`/challenges/${challenge.id}`}
                    className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-1"
                >
                    View Details
                    <ChevronRight className="w-4 h-4" />
                </Link>
                {(isActive || isUpcoming) && (
                    <button
                        onClick={() => onJoin?.(challenge.id)}
                        className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm font-semibold rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all shadow-sm hover:shadow-md flex items-center gap-1.5"
                    >
                        <Zap className="w-4 h-4" />
                        Join Challenge
                    </button>
                )}
            </div>
        </div>
    );
}

// Filter Tabs Component
function FilterTabs({
    activeScope,
    activeStatus,
    onScopeChange,
    onStatusChange,
}: {
    activeScope: ChallengeScope | 'all';
    activeStatus: ChallengeStatus | 'all';
    onScopeChange: (scope: ChallengeScope | 'all') => void;
    onStatusChange: (status: ChallengeStatus | 'all') => void;
}) {
    const scopes: (ChallengeScope | 'all')[] = ['all', 'national', 'state', 'district'];
    const statuses: (ChallengeStatus | 'all')[] = ['all', 'active', 'upcoming', 'completed'];

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm space-y-4">
            {/* Scope Filter */}
            <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Scope
                </label>
                <div className="flex flex-wrap gap-2">
                    {scopes.map((scope) => (
                        <button
                            key={scope}
                            onClick={() => onScopeChange(scope)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${activeScope === scope
                                    ? 'bg-gray-900 text-white shadow-md'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            {scope === 'all' ? (
                                <Filter className="w-3.5 h-3.5" />
                            ) : (
                                <ScopeIcon scope={scope} className="w-3.5 h-3.5" />
                            )}
                            {scope === 'all' ? 'All Scopes' : SCOPE_DISPLAY_NAMES[scope]}
                        </button>
                    ))}
                </div>
            </div>

            {/* Status Filter */}
            <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Status
                </label>
                <div className="flex flex-wrap gap-2">
                    {statuses.map((status) => (
                        <button
                            key={status}
                            onClick={() => onStatusChange(status)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${activeStatus === status
                                    ? 'bg-gray-900 text-white shadow-md'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            {status === 'all' ? 'All' : STATUS_DISPLAY_INFO[status].label}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}

// Main Content Component
function ChallengesPageContent() {
    const { user } = useAuth();
    const [challenges, setChallenges] = useState<ChallengeWithLeaders[]>([]);
    const [loading, setLoading] = useState(true);
    const [scopeFilter, setScopeFilter] = useState<ChallengeScope | 'all'>('all');
    const [statusFilter, setStatusFilter] = useState<ChallengeStatus | 'all'>('active');
    const [joiningId, setJoiningId] = useState<string | null>(null);

    // Fetch challenges
    useEffect(() => {
        async function fetchChallenges() {
            setLoading(true);
            try {
                const params = new URLSearchParams();
                if (scopeFilter !== 'all') params.set('scope', scopeFilter);
                if (statusFilter !== 'all') params.set('status', statusFilter);
                params.set('limit', '20');

                const res = await fetch(`/api/challenges?${params.toString()}`);
                if (res.ok) {
                    const data: ChallengeListResponse = await res.json();
                    setChallenges(data.challenges);
                }
            } catch (error) {
                console.error('Error fetching challenges:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchChallenges();
    }, [scopeFilter, statusFilter]);

    // Handle join challenge
    const handleJoinChallenge = async (challengeId: string) => {
        if (!user) {
            // Redirect to homepage with auth prompt
            window.location.href = '/?auth_required=true';
            return;
        }

        setJoiningId(challengeId);
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
                // Navigate to challenge detail
                window.location.href = `/challenges/${challengeId}`;
            } else {
                console.error('Failed to join challenge');
            }
        } catch (error) {
            console.error('Error joining challenge:', error);
        } finally {
            setJoiningId(null);
        }
    };

    // Stats summary
    const activeChallenges = challenges.filter(c => c.status === 'active');
    const totalTrees = challenges.reduce((sum, c) => sum + c.currentTrees, 0);
    const totalParticipants = challenges.reduce((sum, c) => sum + c.totalParticipants, 0);

    return (
        <div className="min-h-screen bg-gradient-to-b from-green-50/30 to-white">
            <Header />

            <main className="max-w-7xl mx-auto px-6 py-8">
                {/* Hero Section */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 text-white mb-4 shadow-lg shadow-green-200">
                        <Target className="w-8 h-8" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Community Challenges
                    </h1>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        Join collective, time-bound environmental goals. Collaborate with individuals
                        and NGOs to achieve large-scale tree plantation targets across India.
                    </p>
                </div>

                {/* Stats Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                                <Flame className="w-6 h-6 text-green-600" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-gray-900">{activeChallenges.length}</div>
                                <div className="text-sm text-gray-500">Active Challenges</div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                                <TreeDeciduous className="w-6 h-6 text-emerald-600" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-gray-900">{formatCompactNumber(totalTrees)}</div>
                                <div className="text-sm text-gray-500">Trees Planted</div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                                <Users className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-gray-900">{formatCompactNumber(totalParticipants)}</div>
                                <div className="text-sm text-gray-500">Total Participants</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="mb-8">
                    <FilterTabs
                        activeScope={scopeFilter}
                        activeStatus={statusFilter}
                        onScopeChange={setScopeFilter}
                        onStatusChange={setStatusFilter}
                    />
                </div>

                {/* Challenges Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {loading && (
                        <>
                            {[...Array(4)].map((_, idx) => (
                                <div key={idx} className="bg-white rounded-2xl border border-gray-200 p-5 animate-pulse">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="h-5 w-16 bg-gray-200 rounded-full" />
                                        <div className="h-5 w-20 bg-gray-100 rounded-full" />
                                    </div>
                                    <div className="h-6 w-3/4 bg-gray-200 rounded mb-2" />
                                    <div className="h-4 w-full bg-gray-100 rounded mb-4" />
                                    <div className="h-3 w-full bg-gray-100 rounded-full mb-4" />
                                    <div className="grid grid-cols-3 gap-4 py-3 border-t border-gray-100">
                                        <div className="text-center">
                                            <div className="h-6 w-12 bg-gray-200 rounded mx-auto mb-1" />
                                            <div className="h-3 w-10 bg-gray-100 rounded mx-auto" />
                                        </div>
                                        <div className="text-center border-x border-gray-100">
                                            <div className="h-6 w-12 bg-gray-200 rounded mx-auto mb-1" />
                                            <div className="h-3 w-10 bg-gray-100 rounded mx-auto" />
                                        </div>
                                        <div className="text-center">
                                            <div className="h-6 w-12 bg-gray-200 rounded mx-auto mb-1" />
                                            <div className="h-3 w-10 bg-gray-100 rounded mx-auto" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </>
                    )}

                    {!loading && challenges.length === 0 && (
                        <div className="col-span-full bg-white rounded-2xl border border-gray-200 p-12 text-center">
                            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                                <Target className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                No Challenges Found
                            </h3>
                            <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                                {statusFilter === 'active'
                                    ? 'There are no active challenges at the moment. Check back soon!'
                                    : 'No challenges match your current filters. Try adjusting the filters.'}
                            </p>
                            <button
                                onClick={() => {
                                    setScopeFilter('all');
                                    setStatusFilter('all');
                                }}
                                className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                                Clear Filters
                            </button>
                        </div>
                    )}

                    {!loading && challenges.map((challenge) => (
                        <ChallengeCard
                            key={challenge.id}
                            challenge={challenge}
                            onJoin={handleJoinChallenge}
                        />
                    ))}
                </div>

                {/* CTA Section */}
                <div className="mt-12 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-8 text-white text-center shadow-xl">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-white/20 mb-4">
                        <TrendingUp className="w-7 h-7" />
                    </div>
                    <h3 className="text-2xl font-bold mb-3">Ready to Make an Impact?</h3>
                    <p className="text-green-100 mb-6 max-w-lg mx-auto">
                        Join a challenge today and contribute to collective environmental goals.
                        Every tree you plant brings us closer to a greener India!
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <Link
                            href="/plant"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-green-700 rounded-lg font-semibold hover:bg-green-50 transition-colors shadow-lg"
                        >
                            <TreeDeciduous className="w-5 h-5" />
                            Plant a Tree
                        </Link>
                        <Link
                            href="/donate"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-green-500/20 text-white border border-white/30 rounded-lg font-semibold hover:bg-green-500/30 transition-colors"
                        >
                            <Trophy className="w-5 h-5" />
                            Donate Trees
                        </Link>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}

// Main Page Export
export default function ChallengesPage() {
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
            <ChallengesPageContent />
        </Suspense>
    );
}
