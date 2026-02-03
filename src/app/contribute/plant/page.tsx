'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/ui/header';
import { useAuth } from '@/lib/auth-context';
import { createImagePreview, revokeImagePreview, validateImageFile } from '@/lib/utils/storage';
import { Challenge } from '@/lib/types/challenges';

function PlantContributionForm() {
    const searchParams = useSearchParams();
    const districtId = searchParams.get('districtId') || '';
    const districtName = searchParams.get('districtName') || '';
    const { user } = useAuth();

    const [image, setImage] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [notes, setNotes] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [challenges, setChallenges] = useState<Challenge[]>([]);
    const [selectedChallengeId, setSelectedChallengeId] = useState<string>('');

    useEffect(() => {
        return () => {
            if (previewUrl) revokeImagePreview(previewUrl);
        };
    }, [previewUrl]);

    useEffect(() => {
        async function fetchChallenges() {
            try {
                const res = await fetch('/api/challenges?status=active');
                if (res.ok) {
                    const data = await res.json();
                    setChallenges(data.challenges || []);
                }
            } catch (error) {
                console.error('Error fetching challenges:', error);
            }
        }
        fetchChallenges();
    }, []);

    // Check URL for pre-selected challenge
    useEffect(() => {
        const challengeId = searchParams.get('challengeId');
        if (challengeId) {
            setSelectedChallengeId(challengeId);
        }
    }, [searchParams]);

    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const validation = validateImageFile(file);
        if (!validation.valid) {
            setError(validation.error || 'Invalid image file');
            return;
        }

        if (previewUrl) revokeImagePreview(previewUrl);
        setImage(file);
        setPreviewUrl(createImagePreview(file));
        setError(null);
        setSuccess(null);
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setError(null);
        setSuccess(null);

        if (!districtId) {
            setError('District is required. Navigate from a district page to auto-fill it.');
            return;
        }

        if (!image) {
            setError('Please upload a tree photo.');
            return;
        }

        try {
            setSubmitting(true);
            const formData = new FormData();
            formData.append('districtId', districtId);
            if (user?.uid) formData.append('userId', user.uid);
            if (user?.displayName) formData.append('userName', user.displayName);
            if (user?.email) formData.append('userEmail', user.email);
            if (selectedChallengeId) formData.append('challengeId', selectedChallengeId);
            if (notes) formData.append('notes', notes);
            formData.append('image', image);

            const res = await fetch('/api/contribute/plant', {
                method: 'POST',
                body: formData,
            });

            const json = await res.json();
            if (!res.ok) {
                throw new Error(json.error || 'Failed to submit contribution');
            }

            setSuccess(json.message || 'Tree contribution submitted and pending verification.');
            setImage(null);
            if (previewUrl) revokeImagePreview(previewUrl);
            setPreviewUrl(null);
            setNotes('');
            setSelectedChallengeId('');
        } catch (err: any) {
            setError(err.message || 'Failed to submit contribution');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <main className="min-h-screen bg-gradient-to-br from-nature-50 via-white to-sky-50 pb-20">
            <section className="max-w-3xl mx-auto px-6 pt-10">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Plant a tree for your district
                </h1>
                <p className="text-gray-600 mb-6">
                    Upload a clear photo of the tree you planted. Contributions are tagged to your
                    district and marked as pending until verified.
                </p>

                {!user && (
                    <div className="mb-6 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                        Sign in to link your contribution to your profile. You can still submit
                        anonymously, but some features may be limited.
                    </div>
                )}

                <form
                    onSubmit={handleSubmit}
                    className="bg-white rounded-2xl shadow px-6 py-6 border border-gray-100 space-y-5"
                >
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            District
                        </label>
                        <input
                            type="text"
                            value={districtName || districtId}
                            readOnly
                            className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 text-gray-700 text-sm"
                        />
                        {!districtId && (
                            <p className="mt-1 text-xs text-red-600">
                                District is not set. Go to a district page and click “I planted a
                                tree”.
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tree photo (JPEG/PNG)
                        </label>
                        <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            onChange={handleImageChange}
                            className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-nature-50 file:text-nature-700 hover:file:bg-nature-100"
                        />
                        {previewUrl && (
                            <div className="mt-3">
                                <p className="text-xs text-gray-500 mb-1">Preview</p>
                                <img
                                    src={previewUrl}
                                    alt="Tree preview"
                                    className="rounded-xl border border-gray-200 max-h-64 object-cover"
                                />
                            </div>
                        )}
                    </div>

                    {challenges.length > 0 && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Participate in a Challenge (optional)
                            </label>
                            <select
                                value={selectedChallengeId}
                                onChange={(e) => setSelectedChallengeId(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-nature-500 focus:border-nature-500 outline-none text-sm bg-white"
                            >
                                <option value="">Select a challenge...</option>
                                {challenges.map((challenge) => (
                                    <option key={challenge.id} value={challenge.id}>
                                        {challenge.title} ({challenge.scope})
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Notes (optional)
                        </label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={3}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-nature-500 focus:border-nature-500 outline-none text-sm"
                            placeholder="Where did you plant it? Any species or care details you want to share?"
                        />
                    </div>

                    {error && (
                        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-2 text-sm text-green-700">
                            {success}
                        </div>
                    )}

                    <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-500 max-w-xs">
                            By submitting, you confirm that this photo is authentic and that you
                            consent to it being used for aggregated, anonymized impact reporting.
                        </p>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="inline-flex items-center px-5 py-3 rounded-full bg-nature-600 text-white text-sm font-semibold hover:bg-nature-700 disabled:opacity-60"
                        >
                            {submitting ? 'Submitting...' : 'Submit proof'}
                        </button>
                    </div>
                </form>

                <p className="mt-6 text-xs text-gray-500">
                    This feature is for environmental awareness only. Data is approximate and not
                    intended for medical or policy use.
                </p>

                <p className="mt-4 text-sm text-gray-600">
                    Prefer to support an NGO?{' '}
                    <Link
                        href="https://tree-nation.com/"
                        target="_blank"
                        className="text-nature-700 font-semibold underline"
                    >
                        Donate trees via an external partner
                    </Link>
                    .
                </p>
            </section>
        </main>
    );
}

export default function PlantContributionPage() {
    return (
        <>
            <Header />
            <Suspense fallback={
                <main className="min-h-screen bg-gradient-to-br from-nature-50 via-white to-sky-50 pb-20">
                    <section className="max-w-3xl mx-auto px-6 pt-10">
                        <div className="bg-white rounded-2xl shadow px-6 py-6 border border-gray-100">
                            <div className="animate-pulse">
                                <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
                                <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
                                <div className="h-32 bg-gray-200 rounded mb-4"></div>
                            </div>
                        </div>
                    </section>
                </main>
            }>
                <PlantContributionForm />
            </Suspense>
        </>
    );
}


