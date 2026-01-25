'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Header } from '@/components/ui/header';
import { Footer } from '@/components/ui/footer';
import { DistrictSearch } from '@/components/ui/district-search';
import { DistrictResults } from '@/components/ui/district-results';
import { formatCompactNumber } from '@/lib/utils/helpers';
import { DistrictSearchResult, DistrictDetail } from '@/lib/types';
import { TreeDeciduous, Heart, Wind, Calculator, BarChart3, Lightbulb, ArrowRight, Sprout, Leaf } from 'lucide-react';

export default function Dashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [userStats, setUserStats] = useState({
    totalTreesPlanted: 0,
    totalTreesDonated: 0,
    totalTrees: 0,
    totalO2Impact: 0,
    verifiedContributions: 0,
  });
  const [selectedDistrict, setSelectedDistrict] = useState<DistrictSearchResult | null>(null);
  const [districtDetail, setDistrictDetail] = useState<DistrictDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [districtNotFound, setDistrictNotFound] = useState(false);

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/?auth_required=true');
    }
  }, [user, loading, router]);

  // Fetch user contributions
  useEffect(() => {
    async function fetchUserStats() {
      if (!user) return;

      try {
        const response = await fetch(`/api/contribution?userId=${user.uid}&userEmail=${encodeURIComponent(user.email || '')}`);
        if (response.ok) {
          const data = await response.json();
          setUserStats({
            totalTreesPlanted: data.stats?.totalTreesPlanted || 0,
            totalTreesDonated: data.stats?.totalTreesDonated || 0,
            totalTrees: data.stats?.totalTrees || 0,
            totalO2Impact: data.stats?.totalO2Impact || 0,
            verifiedContributions: data.stats?.verifiedContributions || 0,
          });
        }
      } catch (error) {
        console.error('Error fetching user stats:', error);
      }
    }
    fetchUserStats();
  }, [user]);

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-white pb-20">
          <div className="max-w-7xl mx-auto px-6">
            {/* Header Skeleton */}
            <div className="pt-12 pb-8 border-b border-gray-100 animate-pulse">
              <div className="h-8 w-64 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 w-96 bg-gray-100 rounded"></div>
            </div>

            {/* Stats Grid Skeleton */}
            <div className="py-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[...Array(3)].map((_, idx) => (
                  <div key={idx} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm animate-pulse">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
                      <div className="h-6 w-16 bg-gray-100 rounded-full"></div>
                    </div>
                    <div className="h-4 w-24 bg-gray-100 rounded mb-2"></div>
                    <div className="h-10 w-32 bg-gray-200 rounded mb-3"></div>
                    <div className="h-3 w-40 bg-gray-100 rounded"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (!user) return null;

  return (
    <>
      <Header />
      <div className="min-h-screen bg-white pb-20">
        <div className="max-w-7xl mx-auto px-6">

          {/* Dashboard Header */}
          <section className="pt-12 pb-8 border-b border-gray-100">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h1 className="text-3xl font-semibold text-gray-900 mb-2 tracking-tight">
                  Welcome back, <span className="text-gray-600">{user?.displayName || user?.email?.split('@')[0]}</span>
                </h1>
                <p className="text-gray-500">
                  Track your environmental impact and explore district data
                </p>
              </div>
              <div className="text-right hidden md:block">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Current Impact</p>
                <p className="text-green-600 font-medium flex items-center justify-end gap-2">
                  <Sprout className="w-4 h-4" />
                  Making India Greener
                </p>
              </div>
            </div>
          </section>

          {/* Stats Grid */}
          <section className="py-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Planted Stats */}
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow group">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-green-50 p-3 rounded-xl group-hover:bg-green-100 transition-colors">
                    <TreeDeciduous className="w-6 h-6 text-green-600" />
                  </div>
                  <span className="text-xs font-medium text-green-600 bg-green-50 px-2.5 py-1 rounded-full">
                    Active
                  </span>
                </div>
                <div>
                  <p className="text-gray-500 text-sm font-medium mb-1">Trees Planted</p>
                  <div className="flex items-baseline gap-2">
                    <h3 className="text-4xl font-bold text-gray-900 tracking-tight">
                      {userStats.totalTreesPlanted}
                    </h3>
                    <span className="text-sm text-gray-400">trees</span>
                  </div>
                  <p className="text-xs text-green-600 mt-3 flex items-center gap-1">
                    <Leaf className="w-3 h-3" />
                    {userStats.verifiedContributions > 0 ? `${userStats.verifiedContributions} verified` : 'Start your journey today'}
                  </p>
                </div>
              </div>

              {/* Donated Stats */}
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow group">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-amber-50 p-3 rounded-xl group-hover:bg-amber-100 transition-colors">
                    <Heart className="w-6 h-6 text-amber-600" />
                  </div>
                  <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full">
                    Supported
                  </span>
                </div>
                <div>
                  <p className="text-gray-500 text-sm font-medium mb-1">Trees Donated</p>
                  <div className="flex items-baseline gap-2">
                    <h3 className="text-4xl font-bold text-gray-900 tracking-tight">
                      {userStats.totalTreesDonated}
                    </h3>
                    <span className="text-sm text-gray-400">donated</span>
                  </div>
                  <p className="text-xs text-amber-600 mt-3 font-medium">
                    Through trusted NGOs
                  </p>
                </div>
              </div>

              {/* Oxygen Stats */}
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow group">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-blue-50 p-3 rounded-xl group-hover:bg-blue-100 transition-colors">
                    <Wind className="w-6 h-6 text-blue-600" />
                  </div>
                  <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
                    Impact
                  </span>
                </div>
                <div>
                  <p className="text-gray-500 text-sm font-medium mb-1">Lifetime Oxygen</p>
                  <div className="flex items-baseline gap-2">
                    <h3 className="text-4xl font-bold text-gray-900 tracking-tight">
                      {formatCompactNumber(userStats.totalO2Impact)}
                    </h3>
                    <span className="text-sm text-gray-400">kg O₂</span>
                  </div>
                  <p className="text-xs text-blue-600 mt-3 font-medium">
                    Estimated lifetime production
                  </p>
                </div>
              </div>
            </div>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-12">
            {/* Left Column - Search & Results */}
            <div className="lg:col-span-2 space-y-8">
              {/* District Search Section */}
              <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    Search District Intelligence
                  </h2>
                  <p className="text-gray-500 text-sm">
                    Access detailed environmental reports, oxygen deficit data, and planting targets for any district in India.
                  </p>
                </div>

                <div className="bg-gray-50/50 rounded-xl p-1">
                  <DistrictSearch
                    onDistrictSelect={async (district) => {
                      setSelectedDistrict(district);
                      setLoadingDetail(true);
                      setDistrictDetail(null);
                      setDistrictNotFound(false);

                      try {
                        const response = await fetch(`/api/districts/${district.slug}`);
                        if (response.ok) {
                          const data = await response.json();
                          setDistrictDetail(data);
                          setDistrictNotFound(false);
                        } else if (response.status === 404) {
                          setDistrictNotFound(true);
                        } else {
                          console.error('Failed to load district details');
                          setDistrictNotFound(true);
                        }
                      } catch (error) {
                        console.error('Error loading district details:', error);
                        setDistrictNotFound(true);
                      } finally {
                        setLoadingDetail(false);
                      }
                    }}
                    districtNotFound={districtNotFound}
                    notFoundDistrictName={selectedDistrict?.name}
                    loadingDistrict={loadingDetail}
                  />
                </div>
              </section>

              {/* District Results Section */}
              {(selectedDistrict || loadingDetail) && (
                <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  {loadingDetail ? (
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 animate-pulse">
                      <div className="space-y-4">
                        <div className="h-6 w-48 bg-gray-200 rounded"></div>
                        <div className="h-4 w-full bg-gray-100 rounded"></div>
                        <div className="h-4 w-3/4 bg-gray-100 rounded"></div>
                        <div className="grid grid-cols-2 gap-4 mt-6">
                          {[...Array(4)].map((_, i) => (
                            <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : districtDetail ? (
                    <DistrictResults data={districtDetail} />
                  ) : null}
                </section>
              )}
            </div>

            {/* Right Column - Quick Actions & Facts */}
            <div className="lg:col-span-1 space-y-6">

              {/* Take Action Section */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  Take Action
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                </h2>

                <div className="space-y-3">
                  {/* Plant a Tree Card */}
                  <button
                    onClick={() => router.push('/plant')}
                    className="w-full flex items-center gap-4 p-4 rounded-xl bg-green-50 hover:bg-green-100 border border-green-100 hover:border-green-200 transition-all group text-left"
                  >
                    <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center text-green-600 shadow-sm group-hover:scale-105 transition-transform">
                      <TreeDeciduous className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-green-900 group-hover:text-green-700">Plant a Tree</h3>
                      <p className="text-xs text-green-700/80">Upload proof & earn badges</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-green-400 ml-auto group-hover:translate-x-1 transition-transform" />
                  </button>

                  {/* Donate Card */}
                  <button
                    onClick={() => router.push('/donate')}
                    className="w-full flex items-center gap-4 p-4 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-100 hover:border-amber-200 transition-all group text-left"
                  >
                    <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center text-amber-600 shadow-sm group-hover:scale-105 transition-transform">
                      <Heart className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-amber-900 group-hover:text-amber-700">Donate Trees</h3>
                      <p className="text-xs text-amber-700/80">Support local NGOs</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-amber-400 ml-auto group-hover:translate-x-1 transition-transform" />
                  </button>

                  {/* Leaderboard Card */}
                  <button
                    onClick={() => router.push('/leaderboard')}
                    className="w-full flex items-center gap-4 p-4 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-100 hover:border-blue-200 transition-all group text-left"
                  >
                    <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center text-blue-600 shadow-sm group-hover:scale-105 transition-transform">
                      <BarChart3 className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-blue-900 group-hover:text-blue-700">Leaderboard</h3>
                      <p className="text-xs text-blue-700/80">Check state rankings</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-blue-400 ml-auto group-hover:translate-x-1 transition-transform" />
                  </button>

                  {/* Calculator Card */}
                  <button
                    onClick={() => router.push('/calculator')}
                    className="w-full flex items-center gap-4 p-4 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-100 hover:border-purple-200 transition-all group text-left"
                  >
                    <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center text-purple-600 shadow-sm group-hover:scale-105 transition-transform">
                      <Calculator className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-purple-900 group-hover:text-purple-700">Impact Calc</h3>
                      <p className="text-xs text-purple-700/80">Calculate your offset</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-purple-400 ml-auto group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>

              {/* Did You Know Card */}
              <div className="bg-yellow-50 rounded-2xl p-6 border border-yellow-100 relative overflow-hidden">
                <div className="absolute -right-6 -top-6 w-24 h-24 bg-yellow-100 rounded-full opacity-50 blur-2xl"></div>
                <div className="flex items-start gap-3 relative z-10">
                  <div className="bg-yellow-100 p-2 rounded-lg text-yellow-600">
                    <Lightbulb className="w-5 h-5 fill-yellow-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-yellow-900 mb-1">Did you know?</h3>
                    <p className="text-sm text-yellow-800/80 leading-relaxed">
                      A single mature tree can absorb approximately <span className="font-bold text-yellow-900">48 pounds</span> of CO₂ per year and release enough oxygen for two people!
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
