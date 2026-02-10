'use client';

import { useTranslations } from 'next-intl';
import { Header } from '@/components/ui/header';
import { Footer } from '@/components/ui/footer';
import { ShieldCheck, Server, Database, Lock, Eye, AlertCircle, FileText } from 'lucide-react';
import LegalHeader from "@/components/LegalHeader"

const DATA_SOURCES = [
    {
        name: 'Forest Survey of India - ISFR 2021',
        type: 'Government',
        url: 'https://fsi.nic.in/forest-report-2021',
        descKey: 'source1Desc' as const,
        reliability: 'High',
        lastUpdated: '2021'
    },
    {
        name: 'OpenWeatherMap Air Pollution API',
        type: 'API',
        url: 'https://openweathermap.org/api/air-pollution',
        descKey: 'source2Desc' as const,
        reliability: 'High',
        lastUpdated: 'Real-time'
    },
    {
        name: 'Census of India 2021 Projections',
        type: 'Government',
        url: 'https://censusindia.gov.in/',
        descKey: 'source3Desc' as const,
        reliability: 'High',
        lastUpdated: '2021 (Projected)'
    },
    {
        name: 'Central Pollution Control Board',
        type: 'Government',
        url: 'https://cpcb.nic.in/',
        descKey: 'source4Desc' as const,
        reliability: 'High',
        lastUpdated: '2023'
    },
    {
        name: 'Google Gemini AI',
        type: 'AI Model',
        url: 'https://ai.google.dev/',
        descKey: 'source5Desc' as const,
        reliability: 'Medium',
        lastUpdated: 'Continuous'
    },
];

export default function DataPolicy() {
    const t = useTranslations('dataPolicy');

    return (
        <>
            <Header />
            <main className="min-h-screen bg-gray-50 pb-20">
                <div className="max-w-7xl mx-auto px-6 pt-12">

                    {/* Page Header */}
                    <div className="mb-8">
                        <LegalHeader />
                        <h1 className="text-3xl font-semibold text-gray-900 mb-2 tracking-tight">
                            {t('title')}
                        </h1>
                        <p className="text-gray-500 max-w-2xl">
                            {t('subtitle')}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                        {/* Left Column: Data Sources */}
                        <div className="lg:col-span-2 space-y-6">

                            {/* Sources Card */}
                            <section className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                                <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex items-center gap-3">
                                    <Database className="w-5 h-5 text-gray-500" />
                                    <h2 className="font-semibold text-gray-900">{t('validatedSources')}</h2>
                                </div>
                                <div className="divide-y divide-gray-100">
                                    {DATA_SOURCES.map((source, idx) => (
                                        <div key={idx} className="p-6 hover:bg-gray-50 transition-colors group">
                                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-2">
                                                <div>
                                                    <h3 className="font-semibold text-gray-900 group-hover:text-green-600 transition-colors">
                                                        <a href={source.url} target="_blank" rel="noreferrer">
                                                            {source.name}
                                                        </a>
                                                    </h3>
                                                    <div className="flex items-center gap-2 mt-2 mb-3">
                                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider border ${source.type === 'Government' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                                                source.type === 'API' ? 'bg-purple-50 text-purple-700 border-purple-100' :
                                                                    'bg-amber-50 text-amber-700 border-amber-100'
                                                            }`}>
                                                            {source.type}
                                                        </span>
                                                        <span className="flex items-center gap-1 text-[10px] font-medium text-green-700 bg-green-50 px-2 py-0.5 rounded-full border border-green-100">
                                                            <ShieldCheck className="w-3 h-3" />
                                                            {t('reliability', { value: source.reliability })}
                                                        </span>
                                                    </div>
                                                </div>
                                                <span className="text-xs text-gray-400 whitespace-nowrap">
                                                    {t('updated', { value: source.lastUpdated })}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-600 leading-relaxed">
                                                {t(source.descKey)}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            {/* Estimates Note */}
                            <section className="bg-amber-50 rounded-xl border border-amber-100 p-6 flex items-start gap-4">
                                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                                <div>
                                    <h3 className="text-sm font-semibold text-amber-900 mb-1">{t('scientificNoteTitle')}</h3>
                                    <p className="text-sm text-amber-800 leading-relaxed">
                                        {t('scientificNoteText')}
                                    </p>
                                </div>
                            </section>
                        </div>

                        {/* Right Column: Privacy */}
                        <div className="lg:col-span-1 space-y-6">

                            {/* Privacy Card */}
                            <section className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm sticky top-24">
                                <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex items-center gap-3">
                                    <Lock className="w-5 h-5 text-gray-500" />
                                    <h2 className="font-semibold text-gray-900">{t('privacyCommitment')}</h2>
                                </div>
                                <div className="p-6 space-y-8">
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center text-green-600">
                                                <Eye className="w-4 h-4" />
                                            </div>
                                            <h3 className="font-medium text-gray-900">{t('publicContributions')}</h3>
                                        </div>
                                        <p className="text-sm text-gray-500 leading-relaxed">
                                            {t('publicContributionsDesc')}
                                        </p>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                                                <ShieldCheck className="w-4 h-4" />
                                            </div>
                                            <h3 className="font-medium text-gray-900">{t('dataProtection')}</h3>
                                        </div>
                                        <p className="text-sm text-gray-500 leading-relaxed">
                                            {t('dataProtectionDesc')}
                                        </p>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600">
                                                <FileText className="w-4 h-4" />
                                            </div>
                                            <h3 className="font-medium text-gray-900">{t('openSource')}</h3>
                                        </div>
                                        <p className="text-sm text-gray-500 leading-relaxed">
                                            {t('openSourceDesc')}
                                        </p>
                                    </div>
                                </div>
                            </section>
                        </div>

                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}
