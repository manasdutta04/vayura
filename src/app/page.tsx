'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { formatCompactNumber } from '@/lib/utils/helpers';
import { Header } from '@/components/ui/header';
import { Footer } from '@/components/ui/footer';
import { AuthModal } from '@/components/ui/auth-modal';
import { DistrictSearch } from '@/components/ui/district-search'; // IMPORT ADDED
import { ArrowRight, Leaf, Wind, Activity, BarChart3, TreeDeciduous, ShieldCheck, Globe, Sprout, LayoutDashboard, Trophy, Calculator, Heart, User } from 'lucide-react';

function HomeContent() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [stats, setStats] = useState({ totalDistricts: 766, totalTrees: 0, totalOxygen: 0 });

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  // Open AuthModal if query param exists
  useEffect(() => {
    if (searchParams.get('action') === 'login' && !user) {
      setShowAuthModal(true);
    }
  }, [searchParams, user]);

  // Show auth modal if auth_required param is present
  useEffect(() => {
    if (searchParams?.get('auth_required') === 'true') {
      setShowAuthModal(true);
    }
  }, [searchParams]);

  // Fetch stats
  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch('/api/stats');
        if (response.ok) {
          const data = await response.json();
          setStats(prev => ({ ...data, totalDistricts: data.totalDistricts || prev.totalDistricts }));
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    }
    fetchStats();
  }, []);

  const handleDistrictSelect = (district: any) => {
    // Navigate to the specific district page
    router.push(`/district/${district.slug}`);
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-white">
          <div className="max-w-5xl mx-auto px-6 pt-32 pb-20">
            <div className="animate-pulse space-y-8">
              <div className="text-center space-y-4">
                <div className="h-16 w-3/4 bg-gray-200 rounded-lg mx-auto"></div>
                <div className="h-6 w-1/2 bg-gray-100 rounded mx-auto"></div>
                <div className="h-12 w-48 bg-gray-200 rounded-md mx-auto mt-12"></div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (user) return null;

  return (
    <>
      <Header />
      <div className="min-h-screen bg-white overflow-hidden">
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 px-6">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-50 via-white to-white pointer-events-none" />
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-green-50/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

          <div className="max-w-6xl mx-auto text-center relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-50 border border-green-100 text-green-700 text-sm font-medium mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <Sprout className="w-4 h-4" />
              <span>Monitoring {stats.totalDistricts} Districts Across India</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 tracking-tight leading-tight animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
              District Oxygen <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-600">Intelligence</span>
            </h1>

            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
              Discover your district's environmental health with AI-powered analysis. Track oxygen demand, soil quality, and join the movement to restore balance.
            </p>
            
            {/* NEW SEARCH COMPONENT PLACED HERE */}
            <div className="w-full max-w-xl mx-auto mb-12 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300 relative z-20">
               <DistrictSearch onDistrictSelect={handleDistrictSelect} />
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
              <button
                onClick={() => setShowAuthModal(true)}
                className="px-6 py-3 bg-gray-900 text-white text-base font-medium rounded-lg hover:bg-gray-800 transition-all hover:scale-105 shadow-lg shadow-gray-900/20 flex items-center gap-2"
              >
                Join the Movement
                <ArrowRight className="w-4 h-4" />
              </button>
              <Link
                href="/methodology"
                className="px-6 py-3 bg-white text-gray-700 text-base font-medium rounded-lg border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all"
              >
                View Methodology
              </Link>
            </div>

            {/* Live Stats Ticker */}
            <div className="max-w-5xl mx-auto mb-12 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-500">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white/60 backdrop-blur-md p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center">
                  <span className="text-3xl font-bold text-gray-900 mb-1">{stats.totalDistricts}</span>
                  <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">Districts</span>
                </div>
                <div className="bg-white/60 backdrop-blur-md p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center">
                  <span className="text-3xl font-bold text-gray-900 mb-1">{formatCompactNumber(stats.totalTrees)}</span>
                  <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">Trees Planted</span>
                </div>
                <div className="bg-white/60 backdrop-blur-md p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center">
                  <span className="text-3xl font-bold text-gray-900 mb-1">{formatCompactNumber(stats.totalOxygen)}kg</span>
                  <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">Oxygen Added</span>
                </div>
                <div className="bg-white/60 backdrop-blur-md p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center">
                  <span className="text-3xl font-bold text-green-600 mb-1">Live</span>
                  <span className="text-xs text-green-600 font-medium uppercase tracking-wider">Monitoring</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Grid & Rest of Page (Unchanged but included for context) */}
        <section className="py-24 bg-gray-50/50">
            {/* ... Rest of your existing page content ... */}
            {/* To save space, I am keeping the structure above intact. 
                The important part is the Hero section update above. 
                The rest of the file stays the same as your upload. 
                If you copy the entire file above, ensure you include the rest of the sections below `Feature Grid`.
            */}
             <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Explore Vayura
              </h2>
              <p className="text-gray-500 max-w-2xl mx-auto text-lg">
                Powerful tools to monitor the environment, track your impact, and take action.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  icon: LayoutDashboard,
                  color: 'blue',
                  title: 'Live Dashboard',
                  desc: 'Real-time environmental monitoring with AQI, soil health, and disaster alerts for every district.',
                  link: '/dashboard'
                },
                {
                  icon: Trophy,
                  color: 'yellow',
                  title: 'Leaderboard',
                  desc: 'Compete with other eco-warriors and see who is making the biggest difference across India.',
                  link: '/leaderboard'
                },
                {
                  icon: Calculator,
                  color: 'green',
                  title: 'CO₂ Calculator',
                  desc: 'Calculate your personal carbon footprint and understand your environmental impact.',
                  link: '/calculator'
                },
                {
                  icon: Sprout,
                  color: 'emerald',
                  title: 'Plant a Tree',
                  desc: 'Take direct action by planting native trees in deforested areas with verified tracking.',
                  link: '/plant'
                },
                {
                  icon: Heart,
                  color: 'red',
                  title: 'Donate Tree',
                  desc: 'Support local verified NGOs to plant and maintain trees on your behalf.',
                  link: '/donate'
                },
                {
                  icon: User,
                  color: 'purple',
                  title: 'My Contributions',
                  desc: 'Track your personal planting history, certificates, and impact milestones.',
                  link: '/contribution'
                }
              ].map((feature, idx) => (
                <Link href={feature.link} key={idx} className="group bg-white rounded-2xl p-8 border border-gray-100 hover:border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 relative overflow-hidden">
                  <div className={`absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity`}>
                    <ArrowRight className={`w-5 h-5 text-${feature.color}-500 -rotate-45 group-hover:rotate-0 transition-transform duration-300`} />
                  </div>
                  <div className={`w-14 h-14 bg-${feature.color}-50 rounded-2xl flex items-center justify-center text-${feature.color}-600 mb-6 group-hover:scale-110 transition-transform`}>
                    <feature.icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-green-600 transition-colors">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.desc}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-24 bg-white">
          <div className="max-w-6xl mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-sm font-medium mb-6">
                  <Activity className="w-4 h-4" />
                  <span>The Process</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                  From Analysis to <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-600">Restoration</span>
                </h2>
                <div className="space-y-12 relative">
                  {/* Vertical Connecting Line */}
                  <div className="absolute left-[19px] top-4 bottom-4 w-0.5 bg-gradient-to-b from-blue-200 via-purple-200 to-green-200" />

                  {[
                    {
                      step: '01',
                      title: 'Select District',
                      desc: 'Choose any Indian district to view its environmental report card.',
                      color: 'blue'
                    },
                    {
                      step: '02',
                      title: 'Analyze Deficit',
                      desc: 'Our AI calculates the precise oxygen gap based on population and pollution.',
                      color: 'purple'
                    },
                    {
                      step: '03',
                      title: 'Plant & Restore',
                      desc: 'Contribute trees directly or donate to verified local NGOs.',
                      color: 'green'
                    },
                  ].map((item, idx) => (
                    <div key={idx} className="flex gap-6 relative">
                      <div className={`flex-shrink-0 w-10 h-10 rounded-full bg-${item.color}-50 border-2 border-${item.color}-100 text-${item.color}-600 flex items-center justify-center font-bold text-sm relative z-10 shadow-sm transition-transform hover:scale-110 bg-white`}>
                        {item.step}
                      </div>
                      <div className="pt-1">
                        <h4 className={`text-xl font-bold text-gray-900 mb-2 flex items-center gap-2 group cursor-default transition-colors hover:text-${item.color}-600`}>
                          {item.title}
                        </h4>
                        <p className="text-gray-600 text-lg leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Visual Element */}
              <div className="relative group perspective-1000 flex justify-center items-center">
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-100 to-green-100 rounded-3xl -rotate-6 transform scale-95 opacity-50 group-hover:rotate-0 transition-transform duration-500" />
                <div className="relative z-10 transform transition-all duration-500 hover:scale-[1.02] shadow-2xl rounded-3xl overflow-hidden bg-white/50 border border-white/50 p-2">
                  <Image
                    src="/demo.png"
                    alt="Vayura Process Demo"
                    width={1000}
                    height={700}
                    quality={100}
                    priority
                    unoptimized
                    className="rounded-2xl object-cover w-full h-auto shadow-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Improved CTA Section */}
        <section className="py-20 px-6">
          <div className="max-w-5xl mx-auto bg-gradient-to-br from-gray-900 to-blue-900 rounded-3xl p-12 text-center text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

            <div className="relative z-10">
              <h2 className="text-3xl md:text-5xl font-bold mb-6">
                Ready to make an impact?
              </h2>
              <p className="text-gray-300 text-lg max-w-2xl mx-auto mb-10">
                Join thousands of citizens using Vayura to monitor their local environment and take verified climate action.
              </p>
              <button
                onClick={() => setShowAuthModal(true)}
                className="px-8 py-4 bg-white text-gray-900 text-lg font-bold rounded-xl hover:bg-gray-100 transition-colors shadow-lg"
              >
                Join Vayura Now
              </button>
            </div>
          </div>
        </section>
      </div>
      <Footer />

      {/* Auth Modal */}
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <>
        <Header />
        <div className="min-h-screen bg-white">
          <div className="max-w-5xl mx-auto px-6 pt-32 pb-20">
            <div className="animate-pulse space-y-8">
              <div className="text-center space-y-4">
                <div className="h-16 w-3/4 bg-gray-200 rounded-lg mx-auto"></div>
                <div className="h-6 w-1/2 bg-gray-100 rounded mx-auto"></div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </>
    }>
      <HomeContent />
    </Suspense>
  );
}