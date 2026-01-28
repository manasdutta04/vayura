'use client';

import { Header } from '@/components/ui/header';
import { Footer } from '@/components/ui/footer';

export default function TermsPage() {
    return (
        <>
            <Header />
            <div className="min-h-screen bg-white">
                <main className="max-w-4xl mx-auto px-6 py-20">
                    <h1 className="text-3xl font-bold text-gray-900 mb-8">Terms of Service</h1>

                    <div className="prose prose-sm prose-gray max-w-none text-gray-600 space-y-6">
                        <p>Last updated: January 2026</p>

                        <section>
                            <h2 className="text-lg font-semibold text-gray-900 mb-3">1. Acceptance of Terms</h2>
                            <p>
                                By accessing and using Vayura (&ldquo;the Platform&rdquo;), you agree to comply with and be bound by these Terms of Service.
                                If you do not agree to these terms, please do not use our services.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-lg font-semibold text-gray-900 mb-3">2. Description of Service</h2>
                            <p>
                                Vayura provides a platform for tracking tree plantations, estimating oxygen impact, and connecting users with environmental NGOs.
                                The impact metrics provided are estimates based on available scientific data and AI analysis.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-lg font-semibold text-gray-900 mb-3">3. User Contributions</h2>
                            <p>
                                Users are responsible for the accuracy of information submitted, including tree plantation photos and location data.
                                We reserve the right to verify, reject, or remove contributions that violate our guidelines or appear fraudulent.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-lg font-semibold text-gray-900 mb-3">4. Intellectual Property</h2>
                            <p>
                                By submitting photos to Vayura, you grant us a non-exclusive, worldwide, royalty-free license to use, display,
                                and reproduce the content for the purpose of operating and promoting the platform and its environmental mission.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-lg font-semibold text-gray-900 mb-3">5. Limitation of Liability</h2>
                            <p>
                                Vayura is provided &ldquo;as is&rdquo; without warranties of any kind. We are not liable for any damages arising from your use of the platform
                                or reliance on the environmental data provided.
                            </p>
                        </section>
                    </div>
                </main>
            </div>
            <Footer />
        </>
    );
}
