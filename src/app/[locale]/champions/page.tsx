'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import { Header } from '@/components/ui/header';
import { Footer } from '@/components/ui/footer';
import { DistrictSearch } from '@/components/ui/district-search';
import { useAuth } from '@/lib/auth-context';
import { formatCompactNumber } from '@/lib/utils/helpers';
import {
    ContributorLeaderboardResponse,
    ContributorLeaderboardEntry,
    LeaderboardScope,
    BADGE_DEFINITIONS,
    Badge,
} from '@/lib/types/champions';
import { DistrictSearchResult } from '@/lib/types';
import {
    Trophy,
    Medal,
    Award,
    Crown,
    MapPin,
    Wind,
    TreeDeciduous,
    ChevronDown,
    Star,
    Shield,
    Sparkles,
    Users,
    Target,
    Globe,
    Building2,
    Sprout,
} from 'lucide-react';
import { ReactNode } from 'react';

// Mapping from icon names to components
function getBadgeIcon(iconName: string, className: string): ReactNode {
    switch (iconName) {
        case 'Sprout':
            return <Sprout className={className} />;
        case 'TreeDeciduous':
            return <TreeDeciduous className={className} />;
        case 'Trophy':
            return <Trophy className={className} />;
        case 'Star':
            return <Star className={className} />;
        case 'Shield':
            return <Shield className={className} />;
        case 'Crown':
            return <Crown className={className} />;
        default:
            return <Sparkles className={className} />;
    }
}

const tierIconColors: Record<string, string> = {
    bronze: 'text-orange-600',
    silver: 'text-gray-600',
    gold: 'text-amber-600',
    platinum: 'text-purple-600',
};

// Badge Component
function BadgeDisplay({ badge, size = 'sm' }: { badge: Badge; size?: 'sm' | 'md' | 'lg' }) {
    const definition = BADGE_DEFINITIONS[badge.type];
    const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-5 h-5',
        lg: 'w-6 h-6',
    };
    const iconColor = tierIconColors[definition.tier];

    return (
        <span
            className={`inline-flex items-center justify-center cursor-help transition-transform hover:scale-110`}
            title={`${definition.name}: ${definition.description}`}
        >
            {getBadgeIcon(definition.icon, `${sizeClasses[size]} ${iconColor}`)}
        </span>
    );
}

// Rank Badge Component
function RankBadge({ rank }: { rank: number }) {
    if (rank === 1) {
        return (
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 text-white shadow-lg shadow-amber-200">
                <Crown className="w-5 h-5" />
            </div>
        );
    }
    if (rank === 2) {
        return (
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 text-white shadow-lg shadow-gray-200">
                <Medal className="w-5 h-5" />
            </div>
        );
    }
    if (rank === 3) {
        return (
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-500 text-white shadow-lg shadow-orange-200">
                <Award className="w-5 h-5" />
            </div>
        );
    }
    return (
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 text-gray-600 font-bold text-sm">
            #{rank}
        </div>
    );
}

// Leaderboard Entry Component
function LeaderboardEntryRow({
    entry,
    showLocation = true,
}: {
    entry: ContributorLeaderboardEntry;
    showLocation?: boolean;
}) {
    const isTop3 = entry.rank <= 3;

    return (
        <div
            className={`flex items-center gap-4 p-4 rounded-xl transition-all duration-200 ${entry.isCurrentUser
                ? 'bg-green-50 border-2 border-green-200 shadow-sm'
                : isTop3
                    ? 'bg-gradient-to-r from-amber-50/50 to-white border border-amber-100'
                    : 'bg-white hover:bg-gray-50 border border-gray-100'
                }`}
        >
            <RankBadge rank={entry.rank} />

            {/* User Avatar */}
            <div className="relative">
                {entry.photoURL ? (
                    <img
                        src={entry.photoURL}
                        alt={entry.userName}
                        className="w-12 h-12 rounded-full object-cover border-2 border-white shadow"
                    />
                ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-white font-bold text-lg shadow">
                        {entry.userName[0]?.toUpperCase() || '?'}
                    </div>
                )}
                {entry.isCurrentUser && (
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                        <Star className="w-3 h-3 text-white fill-white" />
                    </div>
                )}
            </div>

            {/* User Info */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900 truncate">
                        {entry.userName}
                        {entry.isCurrentUser && (
                            <span className="ml-2 text-xs font-medium text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                                You
                            </span>
                        )}
                    </h3>
                </div>
                {showLocation && (entry.districtName || entry.state) && (
                    <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3" />
                        {entry.districtName && `${entry.districtName}, `}
                        {entry.state}
                    </p>
                )}
            </div>

            {/* Badges */}
            <div className="hidden sm:flex items-center gap-1">
                {entry.badges.slice(0, 4).map((badge) => (
                    <BadgeDisplay key={badge.id} badge={badge} size="sm" />
                ))}
                {entry.badges.length > 4 && (
                    <span className="text-xs text-gray-400">+{entry.badges.length - 4}</span>
                )}
            </div>

            {/* Stats */}
            <div className="text-right">
                <div className="flex items-center gap-1 justify-end">
                    <TreeDeciduous className="w-4 h-4 text-green-600" />
                    <span className="font-bold text-gray-900">{formatCompactNumber(entry.totalTrees)}</span>
                </div>
                <div className="flex items-center gap-1 justify-end text-sm text-gray-500">
                    <Wind className="w-3 h-3" />
                    <span>{formatCompactNumber(entry.totalO2Impact)} kg O₂</span>
                </div>
            </div>
        </div>
    );
}

// Scope Selector Component
function ScopeSelector({
    scope,
    onScopeChange,
    selectedDistrict,
    selectedState,
    onDistrictSelect,
    onStateSelect,
    states,
}: {
    scope: LeaderboardScope;
    onScopeChange: (scope: LeaderboardScope) => void;
    selectedDistrict: DistrictSearchResult | null;
    selectedState: string | null;
    onDistrictSelect: (district: DistrictSearchResult | null) => void;
    onStateSelect: (state: string | null) => void;
    states: string[];
}) {
    return (
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className="flex flex-wrap gap-2 mb-4">
                <button
                    onClick={() => onScopeChange('national')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${scope === 'national'
                        ? 'bg-gray-900 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                >
                    <Globe className="w-4 h-4" />
                    National
                </button>
                <button
                    onClick={() => onScopeChange('state')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${scope === 'state'
                        ? 'bg-gray-900 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                >
                    <Building2 className="w-4 h-4" />
                    By State
                </button>
                <button
                    onClick={() => onScopeChange('district')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${scope === 'district'
                        ? 'bg-gray-900 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                >
                    <MapPin className="w-4 h-4" />
                    By District
                </button>
            </div>

            {scope === 'state' && (
                <div className="relative">
                    <select
                        value={selectedState || ''}
                        onChange={(e) => onStateSelect(e.target.value || null)}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 appearance-none cursor-pointer focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    >
                        <option value="">Select a State</option>
                        {states.map((state) => (
                            <option key={state} value={state}>
                                {state}
                            </option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
            )}

            {scope === 'district' && (
                <div>
                    <DistrictSearch
                        onDistrictSelect={(district) => onDistrictSelect(district)}
                    />
                    {selectedDistrict && (
                        <p className="mt-2 text-sm text-green-600 font-medium flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {selectedDistrict.name}, {selectedDistrict.state}
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}

// Main Content Component
function ChampionsPageContent() {
    const { user } = useAuth();
    const searchParams = useSearchParams();
    const [scope, setScope] = useState<LeaderboardScope>('national');
    const [selectedDistrict, setSelectedDistrict] = useState<DistrictSearchResult | null>(null);
    const [selectedState, setSelectedState] = useState<string | null>(null);
    const [leaderboard, setLeaderboard] = useState<ContributorLeaderboardResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [states, setStates] = useState<string[]>([]);

    // Fetch list of states
    useEffect(() => {
        async function fetchStates() {
            try {
                const res = await fetch('/api/leaderboard?limit=50');
                if (res.ok) {
                    const data = await res.json();
                    const stateList = data
                        .map((entry: { state: string }) => entry.state)
                        .filter((s: string) => s && s.trim().length > 0)
                        .sort();
                    setStates([...new Set(stateList)] as string[]);
                }
            } catch (error) {
                console.error('Error fetching states:', error);
            }
        }
        fetchStates();
    }, []);

    // Fetch leaderboard based on scope
    useEffect(() => {
        async function fetchLeaderboard() {
            setLoading(true);
            try {
                let url = `/api/champions?scope=${scope}&limit=50`;

                if (scope === 'district' && selectedDistrict) {
                    url += `&scopeId=${selectedDistrict.id}`;
                } else if (scope === 'state' && selectedState) {
                    url += `&scopeId=${encodeURIComponent(selectedState)}`;
                }

                if (user?.uid) {
                    url += `&userId=${user.uid}`;
                }

                const res = await fetch(url);
                if (res.ok) {
                    const data = await res.json();
                    setLeaderboard(data);
                }
            } catch (error) {
                console.error('Error fetching champions leaderboard:', error);
            } finally {
                setLoading(false);
            }
        }

        // Only fetch if we have the required scopeId for district/state scopes
        if (scope === 'national' || (scope === 'district' && selectedDistrict) || (scope === 'state' && selectedState)) {
            fetchLeaderboard();
        } else {
            setLeaderboard(null);
            setLoading(false);
        }
    }, [scope, selectedDistrict, selectedState, user?.uid]);

    return (
        <div className="min-h-screen bg-gradient-to-b from-green-50/50 to-white">
            <Header />

            <main className="max-w-4xl mx-auto px-6 py-8">
                {/* Hero Section */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-white mb-4 shadow-lg shadow-amber-200">
                        <Trophy className="w-8 h-8" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        District Champions
                    </h1>
                    <p className="text-gray-600 max-w-lg mx-auto">
                        Celebrating the top contributors making a real impact on India&apos;s environment.
                        Plant trees, earn badges, and climb the leaderboard!
                    </p>
                </div>

                {/* Badge Legend */}
                <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 shadow-sm">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-amber-500" />
                        Achievement Badges
                    </h3>
                    <div className="flex flex-wrap gap-4">
                        {Object.values(BADGE_DEFINITIONS).map((badge) => (
                            <div key={badge.type} className="flex items-center gap-2">
                                {getBadgeIcon(badge.icon, `w-5 h-5 ${tierIconColors[badge.tier]}`)}
                                <div>
                                    <p className="text-xs font-semibold text-gray-900">{badge.name}</p>
                                    <p className="text-[10px] text-gray-500">{badge.requirement}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Scope Selector */}
                <div className="mb-6">
                    <ScopeSelector
                        scope={scope}
                        onScopeChange={setScope}
                        selectedDistrict={selectedDistrict}
                        selectedState={selectedState}
                        onDistrictSelect={setSelectedDistrict}
                        onStateSelect={setSelectedState}
                        states={states}
                    />
                </div>

                {/* Leaderboard */}
                <div className="space-y-3">
                    {/* Header */}
                    {leaderboard && leaderboard.scopeName && (
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                <Users className="w-5 h-5 text-gray-400" />
                                Top Contributors
                                {scope !== 'national' && (
                                    <span className="text-green-600">
                                        in {leaderboard.scopeName}
                                    </span>
                                )}
                            </h2>
                            <span className="text-sm text-gray-500">
                                {leaderboard.totalContributors} contributors
                            </span>
                        </div>
                    )}

                    {/* Loading State */}
                    {loading && (
                        <div className="space-y-3">
                            {[...Array(5)].map((_, idx) => (
                                <div key={idx} className="bg-white rounded-xl border border-gray-100 p-4 animate-pulse">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-gray-200" />
                                        <div className="w-12 h-12 rounded-full bg-gray-200" />
                                        <div className="flex-1 space-y-2">
                                            <div className="h-4 w-32 bg-gray-200 rounded" />
                                            <div className="h-3 w-24 bg-gray-100 rounded" />
                                        </div>
                                        <div className="text-right space-y-2">
                                            <div className="h-4 w-16 bg-gray-200 rounded ml-auto" />
                                            <div className="h-3 w-20 bg-gray-100 rounded ml-auto" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Empty State */}
                    {!loading && (!leaderboard || leaderboard.entries.length === 0) && (
                        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                                <Target className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                {scope !== 'national' && !(selectedDistrict || selectedState)
                                    ? `Select a ${scope} to view contributors`
                                    : 'No contributors yet'}
                            </h3>
                            <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                                {scope !== 'national' && !(selectedDistrict || selectedState)
                                    ? `Choose a ${scope} from the dropdown above to see the leaderboard.`
                                    : 'Be the first to plant a tree and claim the top spot!'}
                            </p>
                            {(scope === 'national' || selectedDistrict || selectedState) && (
                                <Link
                                    href="/plant"
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-medium shadow-lg shadow-green-200 hover:shadow-xl hover:shadow-green-300 transition-all"
                                >
                                    <TreeDeciduous className="w-5 h-5" />
                                    Plant a Tree Now
                                </Link>
                            )}
                        </div>
                    )}

                    {/* Leaderboard Entries */}
                    {!loading && leaderboard && leaderboard.entries.length > 0 && (
                        <>
                            {leaderboard.entries.map((entry) => (
                                <LeaderboardEntryRow
                                    key={entry.userId}
                                    entry={entry}
                                    showLocation={scope === 'national'}
                                />
                            ))}
                        </>
                    )}
                </div>

                {/* CTA Section */}
                <div className="mt-12 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-8 text-white text-center shadow-xl">
                    <h3 className="text-2xl font-bold mb-3">Ready to Become a Champion?</h3>
                    <p className="text-green-100 mb-6 max-w-lg mx-auto">
                        Every tree you plant brings you closer to earning badges and climbing the leaderboard.
                        Start your journey today!
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
                            <Shield className="w-5 h-5" />
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
export default function ChampionsPage() {
    return (
        <Suspense
            fallback={
                <>
                    <Header />
                    <div className="min-h-screen bg-gradient-to-b from-green-50/50 to-white flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
                    </div>
                    <Footer />
                </>
            }
        >
            <ChampionsPageContent />
        </Suspense>
    );
}
