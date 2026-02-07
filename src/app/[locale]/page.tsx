'use client';

import Image from 'next/image';
import { useEffect, useMemo, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/i18n/navigation';
import { useAuth } from '@/lib/auth-context';
import { formatCompactNumber } from '@/lib/utils/helpers';
import { Header } from '@/components/ui/header';
import { Footer } from '@/components/ui/footer';
import { AuthModal } from '@/components/ui/auth-modal';
import { DistrictSearch } from '@/components/ui/district-search';
import { ArrowRight, Activity, Sprout, LayoutDashboard, Trophy, Calculator, Heart, User } from 'lucide-react';

function HomeContent() {
  const t = useTranslations();
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [authModalManuallyOpened, setAuthModalManuallyOpened] = useState(false);
  const [stats, setStats] = useState({ totalDistricts: 766, totalTrees: 0, totalOxygen: 0 });

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  const shouldAutoOpenAuthModal = useMemo(() => {
    if (user) return false;
    return searchParams.get('action') === 'login' || searchParams.get('auth_required') === 'true';
  }, [searchParams, user]);

  const showAuthModal = authModalManuallyOpened || shouldAutoOpenAuthModal;

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

  const handleDistrictSelect = (district: { slug: string }) => {
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

  // Feature cards data with translations
  const features = [
    {
      icon: LayoutDashboard,
      color: 'blue',
      title: t('home.features.liveDashboard.title'),
      desc: t('home.features.liveDashboard.description'),
      link: '/dashboard'
    },
    {
      icon: Trophy,
      color: 'yellow',
      title: t('home.features.leaderboard.title'),
      desc: t('home.features.leaderboard.description'),
      link: '/leaderboard'
    },
    {
      icon: Calculator,
      color: 'green',
      title: t('home.features.calculator.title'),
      desc: t('home.features.calculator.description'),
      link: '/calculator'
    },
    {
      icon: Sprout,
      color: 'emerald',
      title: t('home.features.plantTree.title'),
      desc: t('home.features.plantTree.description'),
      link: '/plant'
    },
    {
      icon: Heart,
      color: 'red',
      title: t('home.features.donateTree.title'),
      desc: t('home.features.donateTree.description'),
      link: '/donate'
    },
    {
      icon: User,
      color: 'purple',
      title: t('home.features.contributions.title'),
      desc: t('home.features.contributions.description'),
      link: '/contribution'
    }
  ];

  // How it works steps with translations
  const steps = [
    {
      step: t('home.howItWorks.step1.number'),
      title: t('home.howItWorks.step1.title'),
      desc: t('home.howItWorks.step1.description'),
      color: 'blue'
    },
    {
      step: t('home.howItWorks.step2.number'),
      title: t('home.howItWorks.step2.title'),
      desc: t('home.howItWorks.step2.description'),
      color: 'purple'
    },
    {
      step: t('home.howItWorks.step3.number'),
      title: t('home.howItWorks.step3.title'),
      desc: t('home.howItWorks.step3.description'),
      color: 'green'
    },
  ];

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
              <span>{t('home.hero.badge', { count: stats.totalDistricts })}</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 tracking-tight leading-tight animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
              {t('home.hero.title')} <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-600">
                {t('home.hero.titleHighlight')}
              </span>
            </h1>

            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
              {t('home.hero.subtitle')}
            </p>

            {/* Search Component */}
            <div className="w-full max-w-xl mx-auto mb-12 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300 relative z-20">
              <DistrictSearch onDistrictSelect={handleDistrictSelect} />
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
              <button
                onClick={() => setAuthModalManuallyOpened(true)}
                className="px-6 py-3 bg-gray-900 text-white text-base font-medium rounded-lg hover:bg-gray-800 transition-all hover:scale-105 shadow-lg shadow-gray-900/20 flex items-center gap-2"
              >
                {t('home.hero.joinMovement')}
                <ArrowRight className="w-4 h-4" />
              </button>
              <Link
                href="/methodology"
                className="px-6 py-3 bg-white text-gray-700 text-base font-medium rounded-lg border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all"
              >
                {t('home.hero.viewMethodology')}
              </Link>
            </div>

            {/* Live Stats Ticker */}
            <div className="max-w-5xl mx-auto mb-12 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-500">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white/60 backdrop-blur-md p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center">
                  <span className="text-3xl font-bold text-gray-900 mb-1">{stats.totalDistricts}</span>
                  <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                    {t('home.stats.districts')}
                  </span>
                </div>
                <div className="bg-white/60 backdrop-blur-md p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center">
                  <span className="text-3xl font-bold text-gray-900 mb-1">{formatCompactNumber(stats.totalTrees)}</span>
                  <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                    {t('home.stats.treesPlanted')}
                  </span>
                </div>
                <div className="bg-white/60 backdrop-blur-md p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center">
                  <span className="text-3xl font-bold text-gray-900 mb-1">{formatCompactNumber(stats.totalOxygen)}kg</span>
                  <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                    {t('home.stats.oxygenAdded')}
                  </span>
                </div>
                <div className="bg-white/60 backdrop-blur-md p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center">
                  <span className="text-3xl font-bold text-green-600 mb-1">{t('home.stats.live')}</span>
                  <span className="text-xs text-green-600 font-medium uppercase tracking-wider">
                    {t('home.stats.monitoring')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Grid */}
        <section className="py-24 bg-gray-50/50">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                {t('home.features.title')}
              </h2>
              <p className="text-gray-500 max-w-2xl mx-auto text-lg">
                {t('home.features.subtitle')}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, idx) => (
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
                  <span>{t('home.howItWorks.badge')}</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                  {t('home.howItWorks.title')} <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-600">
                    {t('home.howItWorks.titleHighlight')}
                  </span>
                </h2>
                <div className="space-y-12 relative">
                  {/* Vertical Connecting Line */}
                  <div className="absolute left-[19px] top-4 bottom-4 w-0.5 bg-gradient-to-b from-blue-200 via-purple-200 to-green-200" />

                  {steps.map((item, idx) => (
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

        {/* CTA Section */}
        <section className="py-20 px-6">
          <div className="max-w-5xl mx-auto bg-gradient-to-br from-gray-900 to-blue-900 rounded-3xl p-12 text-center text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

            <div className="relative z-10">
              <h2 className="text-3xl md:text-5xl font-bold mb-6">
                {t('home.cta.title')}
              </h2>
              <p className="text-gray-300 text-lg max-w-2xl mx-auto mb-10">
                {t('home.cta.subtitle')}
              </p>
              <button
                onClick={() => setAuthModalManuallyOpened(true)}
                className="px-8 py-4 bg-white text-gray-900 text-lg font-bold rounded-xl hover:bg-gray-100 transition-colors shadow-lg"
              >
                {t('home.cta.button')}
              </button>
            </div>
          </div>
        </section>
      </div>
      <Footer />

      {/* Auth Modal */}
      <AuthModal isOpen={showAuthModal} onClose={() => setAuthModalManuallyOpened(false)} />
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
