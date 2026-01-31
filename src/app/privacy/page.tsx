'use client';

import { Header } from '@/components/ui/header';
import { Footer } from '@/components/ui/footer';
import LegalHeader from "@/components/LegalHeader";

export default function PrivacyPage() {
    return (
        <>
            <Header />
            <div className="min-h-screen bg-white">
                <main className="max-w-4xl mx-auto px-6 py-20">
                    <LegalHeader />
                    <h1 className="text-3xl font-bold text-gray-900 mb-8">Privacy Policy</h1>

                    <div className="prose prose-sm prose-gray max-w-none text-gray-600 space-y-6">
                        <p>Last updated: January 2026</p>

                        <section>
                            <h2 className="text-lg font-semibold text-gray-900 mb-3">1. Information We Collect</h2>
                            <p>
                                We collect information you provide directly to us, including your name, email address, and tree plantation data
                                (photos, location, species). We use Google OAuth for authentication and do not store your password.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-lg font-semibold text-gray-900 mb-3">2. How We Use Your Information</h2>
                            <p>
                                We use your information to:
                            </p>
                            <ul className="list-disc pl-5 space-y-1">
                                <li>Verify and track your environmental contributions.</li>
                                <li>Calculate and display your oxygen impact.</li>
                                <li>Maintain the public leaderboard (displaying your name and aggregate impact).</li>
                                <li>Improve our AI models for tree recognition.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-lg font-semibold text-gray-900 mb-3">3. Data Sharing</h2>
                            <p>
                                We do not sell your personal data. We may share aggregated, anonymized environmental data with researchers or partners.
                                Your individual contribution details (tree photo, rough location) may be visible publicly on the platform to verify impact.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-lg font-semibold text-gray-900 mb-3">4. Your Rights</h2>
                            <p>
                                You verified users can request the deletion of their account and associated personal data by contacting us.
                                Some contribution data may be retained in an anonymized format to maintain the integrity of our environmental records.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-lg font-semibold text-gray-900 mb-3">5. Contact Us</h2>
                            <p>
                                If you have any questions about this Privacy Policy, please contact us at https://github.com/manasdutta04/vayura
                            </p>
                        </section>
                    </div>
                </main>
            </div>
            <Footer />
        </>
    );
}
