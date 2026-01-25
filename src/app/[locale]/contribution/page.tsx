'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { Header } from '@/components/ui/header';
import { Footer } from '@/components/ui/footer';
import { formatCompactNumber } from '@/lib/utils/helpers';
import { TreeContribution, Donation } from '@/lib/types';
import { ContributorProfile, BADGE_DEFINITIONS } from '@/lib/types/champions';
import { BadgeShowcase, NextBadgeProgress } from '@/components/ui/badge-display';
import { TreeDeciduous, Heart, Wind, Calendar, MapPin, CheckCircle, Clock, XCircle, Trophy, Medal, Award, Sparkles, Sprout, Star } from 'lucide-react';

interface ContributionStats {
    totalTreesPlanted: number;
    totalTreesDonated: number;
    totalTrees: number;
    totalO2Impact: number;
    verifiedContributions: number;
    pendingContributions: number;
    rejectedContributions: number;
    verifiedPlantationsCount?: number;
}

interface ContributionData {
    contributions: (TreeContribution & { districtName: string })[];
    donations: Donation[];
    stats: ContributionStats;
}

export default function ContributionPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [data, setData] = useState<ContributionData | null>(null);
    const [profile, setProfile] = useState<ContributorProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/?auth_required=true');
        }
    }, [user, authLoading, router]);

    useEffect(() => {
        async function fetchContributions() {
            if (!user) return;

            try {
                const response = await fetch(
                    `/api/contribution?userId=${user.uid}&userEmail=${encodeURIComponent(user.email || '')}`
                );
                if (response.ok) {
                    const contributionData = await response.json();
                    setData(contributionData);
                }
            } catch (error) {
                console.error('Error fetching contributions:', error);
            } finally {
                setLoading(false);
            }
        }

        if (user) {
            fetchContributions();
        }
    }, [user]);

    // Fetch contributor profile with badges
    useEffect(() => {
        async function fetchProfile() {
            if (!user) return;

            try {
                // First update the profile (calculates badges)
                await fetch('/api/champions', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        userId: user.uid,
                        userName: user.displayName || 'Anonymous',
                        userEmail: user.email,
                        photoURL: user.photoURL,
                    }),
                });

                // Then fetch the updated profile
                const response = await fetch(`/api/champions?userId=${user.uid}&profile=true`);
                if (response.ok) {
                    const profileData = await response.json();
                    setProfile(profileData);
                }
            } catch (error) {
                console.error('Error fetching contributor profile:', error);
            }
        }

        if (user && !loading) {
            fetchProfile();
        }
    }, [user, loading]);

    if (authLoading || loading) {
        return (
            <>
                <Header />
                <div className="min-h-screen flex items-center justify-center bg-gray-50">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                </div>
            </>
        );
    }

    if (!user) return null;

    const stats = data?.stats || {
        totalTreesPlanted: 0,
        totalTreesDonated: 0,
        totalTrees: 0,
        totalO2Impact: 0,
        verifiedContributions: 0,
        pendingContributions: 0,
        rejectedContributions: 0,
    };

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900">
            <Header />

            <main className="max-w-7xl mx-auto px-6 py-12">
                <div className="mb-10">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">My Impact</h1>
                    <p className="text-gray-600">Track your environmental contributions and oxygen generation.</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-medium text-gray-500">Trees Planted</h3>
                            <div className="bg-green-50 p-2 rounded-lg">
                                <TreeDeciduous className="w-5 h-5 text-green-600" />
                            </div>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <p className="text-3xl font-bold text-gray-900">{stats.totalTreesPlanted}</p>
                            <span className="text-sm text-gray-500">trees</span>
                        </div>
                        <p className="text-xs text-green-600 mt-2 font-medium">
                            {stats.verifiedPlantationsCount !== undefined
                                ? `${stats.verifiedPlantationsCount} verified`
                                : (stats.verifiedContributions > 0 ? `${stats.verifiedContributions} verified` : '0 verified')
                            }
                        </p>
                    </div>

                    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-medium text-gray-500">Trees Donated</h3>
                            <div className="bg-amber-50 p-2 rounded-lg">
                                <Heart className="w-5 h-5 text-amber-600" />
                            </div>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <p className="text-3xl font-bold text-gray-900">{stats.totalTreesDonated}</p>
                            <span className="text-sm text-gray-500">supported</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                            Via trusted NGOs
                        </p>
                    </div>

                    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-medium text-gray-500">Lifetime Oxygen</h3>
                            <div className="bg-blue-50 p-2 rounded-lg">
                                <Wind className="w-5 h-5 text-blue-600" />
                            </div>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <p className="text-3xl font-bold text-gray-900">{formatCompactNumber(stats.totalO2Impact)}</p>
                            <span className="text-sm text-gray-500">kg</span>
                        </div>
                        <p className="text-xs text-blue-600 mt-2 font-medium">
                            Estimated impact
                        </p>
                    </div>
                </div>

                {/* Champions & Badges Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* Badges Card */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-amber-50 to-orange-50 flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-amber-500" />
                                <h2 className="font-bold text-gray-900">My Badges</h2>
                            </div>
                            <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full font-medium">
                                {profile?.badges.length || 0} earned
                            </span>
                        </div>
                        <div className="p-6">
                            {profile?.badges && profile.badges.length > 0 ? (
                                <BadgeShowcase badges={profile.badges} />
                            ) : (
                                <div className="text-center py-4">
                                    <p className="text-sm text-gray-500">No badges earned yet</p>
                                    <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                                        Get your first verified contribution to earn <Sprout className="w-4 h-4 text-green-500" /> Green Starter!
                                    </p>
                                </div>
                            )}
                            {/* Next badge progress */}
                            {stats.totalTreesPlanted < 10 && stats.totalTreesPlanted > 0 && (
                                <div className="mt-4 pt-4 border-t border-gray-100">
                                    <NextBadgeProgress
                                        currentTrees={stats.totalTreesPlanted}
                                        nextBadgeType="OXYGEN_GUARDIAN"
                                        requiredTrees={10}
                                    />
                                </div>
                            )}
                            {stats.totalTreesPlanted >= 10 && stats.totalTreesPlanted < 50 && (
                                <div className="mt-4 pt-4 border-t border-gray-100">
                                    <NextBadgeProgress
                                        currentTrees={stats.totalTreesPlanted}
                                        nextBadgeType="ECO_WARRIOR"
                                        requiredTrees={50}
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Rankings Card */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-green-50 to-emerald-50 flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <Trophy className="w-5 h-5 text-green-600" />
                                <h2 className="font-bold text-gray-900">My Rankings</h2>
                            </div>
                            <Link
                                href="/champions"
                                className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium hover:bg-green-200 transition-colors"
                            >
                                View Leaderboard →
                            </Link>
                        </div>
                        <div className="p-6">
                            {profile && (profile.districtRank || profile.stateRank) ? (
                                <div className="space-y-4">
                                    {/* District Rank */}
                                    {profile.districtRank && (
                                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${profile.districtRank === 1
                                                    ? 'bg-gradient-to-br from-yellow-400 to-amber-500 text-white'
                                                    : profile.districtRank <= 3
                                                        ? 'bg-gradient-to-br from-gray-300 to-gray-400 text-white'
                                                        : 'bg-gray-200 text-gray-600'
                                                    }`}>
                                                    {profile.districtRank === 1 ? (
                                                        <Medal className="w-5 h-5" />
                                                    ) : (
                                                        <span className="font-bold text-sm">#{profile.districtRank}</span>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-900 text-sm">District Rank</p>
                                                    <p className="text-xs text-gray-500">{profile.districtName}</p>
                                                </div>
                                            </div>
                                            {profile.districtRank === 1 && (
                                                <Trophy className="w-6 h-6 text-amber-500" />
                                            )}
                                        </div>
                                    )}

                                    {/* State Rank */}
                                    {profile.stateRank && (
                                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${profile.stateRank === 1
                                                    ? 'bg-gradient-to-br from-purple-400 to-indigo-500 text-white'
                                                    : profile.stateRank <= 3
                                                        ? 'bg-gradient-to-br from-gray-300 to-gray-400 text-white'
                                                        : 'bg-gray-200 text-gray-600'
                                                    }`}>
                                                    {profile.stateRank === 1 ? (
                                                        <Award className="w-5 h-5" />
                                                    ) : (
                                                        <span className="font-bold text-sm">#{profile.stateRank}</span>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-900 text-sm">State Rank</p>
                                                    <p className="text-xs text-gray-500">{profile.state}</p>
                                                </div>
                                            </div>
                                            {profile.stateRank === 1 && (
                                                <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
                                            )}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center py-6">
                                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                                        <Trophy className="w-6 h-6 text-gray-400" />
                                    </div>
                                    <p className="text-sm text-gray-500">Not ranked yet</p>
                                    <p className="text-xs text-gray-400 mt-1">Get verified contributions to appear on the leaderboard</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Content Section */}
                <div className="space-y-8">
                    {/* Contributions List */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                            <h2 className="font-bold text-gray-900">Activity History</h2>
                        </div>

                        {data && data.contributions.length === 0 && data.donations.length === 0 ? (
                            <div className="p-12 text-center">
                                <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                                    <TreeDeciduous className="w-8 h-8" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No activity yet</h3>
                                <p className="text-gray-500 mb-6 max-w-sm mx-auto">Start your journey by planting a tree or supporting a partner NGO.</p>
                                <div className="flex justify-center gap-4">
                                    <a href="/plant" className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors">
                                        Plant Tree
                                    </a>
                                    <a href="/donate" className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                                        Donate
                                    </a>
                                </div>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {/* Combine and sort contributions and donations could be done here, but sticking to separate lists for simpler implementation first or visual separation */}
                                {data?.contributions.map((contribution) => (
                                    <div key={contribution.id} className="p-6 hover:bg-gray-50 transition-colors">
                                        <div className="flex flex-col sm:flex-row justify-between gap-4">
                                            <div className="flex gap-4">
                                                <div className="flex-shrink-0 mt-1">
                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center
                                                        ${contribution.status === 'VERIFIED' ? 'bg-green-100 text-green-600' :
                                                            contribution.status === 'PENDING' ? 'bg-amber-100 text-amber-600' :
                                                                'bg-red-100 text-red-600'}`}>
                                                        {contribution.status === 'VERIFIED' ? <CheckCircle className="w-5 h-5" /> :
                                                            contribution.status === 'PENDING' ? <Clock className="w-5 h-5" /> :
                                                                <XCircle className="w-5 h-5" />}
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="flex items-baseline gap-2 mb-1">
                                                        <span className="font-semibold text-gray-900">
                                                            Planted {contribution.treeQuantity} {contribution.treeName}
                                                        </span>
                                                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide
                                                            ${contribution.status === 'VERIFIED' ? 'bg-green-50 text-green-700 border border-green-200' :
                                                                contribution.status === 'PENDING' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                                                                    'bg-red-50 text-red-700 border border-red-200'}`}>
                                                            {contribution.status}
                                                        </span>
                                                    </div>

                                                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
                                                        <span className="flex items-center gap-1">
                                                            <MapPin className="w-3.5 h-3.5" />
                                                            {contribution.districtName}, {contribution.state}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <Calendar className="w-3.5 h-3.5" />
                                                            {new Date(contribution.plantedAt).toLocaleDateString()}
                                                        </span>
                                                        {contribution.totalLifespanO2 && (
                                                            <span className="flex items-center gap-1 text-green-600 font-medium">
                                                                <Wind className="w-3.5 h-3.5" />
                                                                {formatCompactNumber(contribution.totalLifespanO2)} kg O₂
                                                            </span>
                                                        )}
                                                    </div>

                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {data?.donations.map((donation) => (
                                    <div key={donation.id} className="p-6 hover:bg-gray-50 transition-colors">
                                        <div className="flex flex-col sm:flex-row justify-between gap-4">
                                            <div className="flex gap-4">
                                                <div className="flex-shrink-0 mt-1">
                                                    <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
                                                        <Heart className="w-5 h-5" />
                                                    </div>
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-900 mb-1">
                                                        Donated {donation.treeCount} {donation.treeName || 'Trees'} via {donation.ngoReference}
                                                    </p>
                                                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
                                                        <span className="flex items-center gap-1">
                                                            <Calendar className="w-3.5 h-3.5" />
                                                            {new Date(donation.donatedAt).toLocaleDateString()}
                                                        </span>
                                                        {donation.amount && (
                                                            <span className="font-medium text-gray-700">
                                                                ₹{donation.amount.toLocaleString('en-IN')}
                                                            </span>
                                                        )}
                                                        {donation.districtName && (
                                                            <span className="flex items-center gap-1">
                                                                <MapPin className="w-3.5 h-3.5" />
                                                                {donation.districtName}, {donation.state}
                                                            </span>
                                                        )}
                                                        {donation.totalLifespanO2 && (
                                                            <span className="flex items-center gap-1 text-green-600 font-medium">
                                                                <Wind className="w-3.5 h-3.5" />
                                                                {formatCompactNumber(donation.totalLifespanO2)} kg O₂
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
