'use client';

import { useTranslations } from 'next-intl';
import { Header } from '@/components/ui/header';
import { Footer } from '@/components/ui/footer';
import LegalHeader from "@/components/LegalHeader"

export default function TermsPage() {
    const t = useTranslations('terms');

    return (
        <>
            <Header />
            <div className="min-h-screen bg-white">
                <main className="max-w-4xl mx-auto px-6 py-20">
                    <LegalHeader />
                    <h1 className="text-3xl font-bold text-gray-900 mb-8">{t('title')}</h1>

                    <div className="prose prose-sm prose-gray max-w-none text-gray-600 space-y-6">
                        <p>{t('lastUpdated')}</p>

                        <section>
                            <h2 className="text-lg font-semibold text-gray-900 mb-3">{t('section1Title')}</h2>
                            <p>{t('section1Text')}</p>
                        </section>

                        <section>
                            <h2 className="text-lg font-semibold text-gray-900 mb-3">{t('section2Title')}</h2>
                            <p>{t('section2Text')}</p>
                        </section>

                        <section>
                            <h2 className="text-lg font-semibold text-gray-900 mb-3">{t('section3Title')}</h2>
                            <p>{t('section3Text')}</p>
                        </section>

                        <section>
                            <h2 className="text-lg font-semibold text-gray-900 mb-3">{t('section4Title')}</h2>
                            <p>{t('section4Text')}</p>
                        </section>

                        <section>
                            <h2 className="text-lg font-semibold text-gray-900 mb-3">{t('section5Title')}</h2>
                            <p>{t('section5Text')}</p>
                        </section>
                    </div>
                </main>
            </div>
            <Footer />
        </>
    );
}
