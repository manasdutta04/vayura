// File: src/app/challenges/create/page.tsx
// User interface for creating new environmental challenges

'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/ui/header';
import { Footer } from '@/components/ui/footer';
import { DistrictSearch } from '@/components/ui/district-search';
import { useAuth } from '@/lib/auth-context';
import { formatCompactNumber } from '@/lib/utils/helpers';
import { DistrictSearchResult } from '@/lib/types';
import {
    ChallengeScope,
    ChallengeType,
    SCOPE_DISPLAY_NAMES,
} from '@/lib/types/challenges';
import {
    Target,
    Globe,
    Building2,
    MapPin,
    Calendar,
    TreeDeciduous,
    Wind,
    ArrowLeft,
    Info,
    AlertCircle,
    Sparkles,
    CheckCircle,
    Zap,
} from 'lucide-react';

function CreateChallengeContent() {
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();

    // Form state
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [scope, setScope] = useState<ChallengeScope>('district');
    const [type, setType] = useState<ChallengeType>('both');
    const [selectedDistrict, setSelectedDistrict] = useState<DistrictSearchResult | null>(null);
    const [selectedState, setSelectedState] = useState<string>('');
    const [targetTrees, setTargetTrees] = useState<number>(1000);
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');
    
    // UI state
    const [showPreview, setShowPreview] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    // States list for state-level challenges
    const [states, setStates] = useState<string[]>([]);

    // Redirect if not authenticated
    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/?auth_required=true');
        }
    }, [user, authLoading, router]);

    // Fetch states list
    useEffect(() => {
        async function fetchStates() {
            try {
                const res = await fetch('/api/leaderboard?limit=50');
                if (res.ok) {
                    const data = await res.json();
                    const stateList = data
                        .map((entry: any) => entry.state)
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

    // Set default dates (start: tomorrow, end: 30 days from now)
    useEffect(() => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const end = new Date();
        end.setDate(end.getDate() + 31);
        
        setStartDate(tomorrow.toISOString().split('T')[0]);
        setEndDate(end.toISOString().split('T')[0]);
    }, []);

    // Calculated values
    const targetO2 = targetTrees * 110;
    const durationDays = startDate && endDate 
        ? Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24))
        : 0;

    // Validation
    const canSubmit = () => {
        if (!title || title.length < 10 || title.length > 100) return false;
        if (!description || description.length < 50 || description.length > 500) return false;
        if (targetTrees < 100) return false;
        if (!startDate || !endDate) return false;
        if (durationDays < 7 || durationDays > 365) return false;
        if (scope === 'district' && !selectedDistrict) return false;
        if (scope === 'state' && !selectedState) return false;
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!canSubmit() || !user) return;

        setSubmitting(true);
        setError(null);

        try {
            const res = await fetch('/api/challenges/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user.uid,
                    userName: user.displayName || 'Anonymous',
                    title,
                    description,
                    scope,
                    type,
                    districtId: selectedDistrict?.id,
                    districtName: selectedDistrict?.name,
                    state: scope === 'district' ? selectedDistrict?.state : selectedState,
                    targetTrees,
                    startDate,
                    endDate,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to create challenge');
            }

            setSuccess(true);
            setTimeout(() => {
                router.push(`/challenges/${data.challenge.id}`);
            }, 2000);
        } catch (err: any) {
            setError(err.message || 'Failed to create challenge');
        } finally {
            setSubmitting(false);
        }
    };

    if (authLoading) {
        return (
            <>
                <Header />
                <div className="min-h-screen bg-gradient-to-b from-green-50/30 to-white flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
                </div>
                <Footer />
            </>
        );
    }

    if (!user) return null;

    if (success) {
        return (
            <>
                <Header />
                <div className="min-h-screen bg-gradient-to-b from-green-50/30 to-white flex items-center justify-center px-6">
                    <div className="max-w-md w-full bg-white rounded-2xl border border-gray-200 shadow-lg p-8 text-center">
                        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="w-8 h-8 text-green-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Challenge Created!</h2>
                        <p className="text-gray-600 mb-6">
                            Your challenge has been published successfully. Redirecting...
                        </p>
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600 mx-auto" />
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-green-50/30 to-white">
            <Header />

            <main className="max-w-5xl mx-auto px-6 py-8">
                {/* Back Link */}
                <Link
                    href="/challenges"
                    className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors mb-6"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Challenges
                </Link>

                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 text-white flex items-center justify-center shadow-lg">
                            <Sparkles className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Create Challenge</h1>
                            <p className="text-gray-600">Design a community environmental goal</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Form Column */}
                    <div className="lg:col-span-2 space-y-6">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Basic Info Card */}
                            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                                <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                                    <h2 className="font-bold text-gray-900 flex items-center gap-2">
                                        <Info className="w-5 h-5 text-gray-400" />
                                        Basic Information
                                    </h2>
                                </div>
                                <div className="p-6 space-y-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                            Challenge Title *
                                        </label>
                                        <input
                                            type="text"
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            placeholder="e.g., Plant 10,000 Trees in Maharashtra - 30 Days"
                                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                                            maxLength={100}
                                        />
                                        <p className="text-xs text-gray-500 mt-1">
                                            {title.length}/100 characters (min 10)
                                        </p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                            Description *
                                        </label>
                                        <textarea
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            placeholder="Describe your challenge goals, why it matters, and what you hope to achieve..."
                                            rows={4}
                                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none resize-none"
                                            maxLength={500}
                                        />
                                        <p className="text-xs text-gray-500 mt-1">
                                            {description.length}/500 characters (min 50)
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Scope & Type Card */}
                            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                                <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                                    <h2 className="font-bold text-gray-900 flex items-center gap-2">
                                        <Target className="w-5 h-5 text-gray-400" />
                                        Challenge Scope & Type
                                    </h2>
                                </div>
                                <div className="p-6 space-y-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Scope Level *
                                        </label>
                                        <div className="grid grid-cols-3 gap-3">
                                            {(['district', 'state', 'national'] as ChallengeScope[]).map((s) => (
                                                <button
                                                    key={s}
                                                    type="button"
                                                    onClick={() => setScope(s)}
                                                    className={`px-4 py-3 rounded-lg font-medium transition-all flex flex-col items-center gap-2 ${
                                                        scope === s
                                                            ? 'bg-gray-900 text-white shadow-md'
                                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                    }`}
                                                >
                                                    {s === 'national' && <Globe className="w-5 h-5" />}
                                                    {s === 'state' && <Building2 className="w-5 h-5" />}
                                                    {s === 'district' && <MapPin className="w-5 h-5" />}
                                                    <span className="text-sm">{SCOPE_DISPLAY_NAMES[s]}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Location Selection */}
                                    {scope === 'district' && (
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                                Select District *
                                            </label>
                                            <DistrictSearch onDistrictSelect={setSelectedDistrict} />
                                            {selectedDistrict && (
                                                <p className="text-sm text-green-600 mt-1.5 flex items-center gap-1">
                                                    <CheckCircle className="w-4 h-4" />
                                                    {selectedDistrict.name}, {selectedDistrict.state}
                                                </p>
                                            )}
                                        </div>
                                    )}

                                    {scope === 'state' && (
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                                Select State *
                                            </label>
                                            <select
                                                value={selectedState}
                                                onChange={(e) => setSelectedState(e.target.value)}
                                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none bg-white"
                                            >
                                                <option value="">Choose a state...</option>
                                                {states.map((state) => (
                                                    <option key={state} value={state}>
                                                        {state}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    )}

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Contribution Type *
                                        </label>
                                        <div className="grid grid-cols-3 gap-3">
                                            {(['plantation', 'donation', 'both'] as ChallengeType[]).map((t) => (
                                                <button
                                                    key={t}
                                                    type="button"
                                                    onClick={() => setType(t)}
                                                    className={`px-4 py-3 rounded-lg font-medium transition-all ${
                                                        type === t
                                                            ? 'bg-green-600 text-white shadow-md'
                                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                    }`}
                                                >
                                                    <span className="text-sm capitalize">{t}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Goals & Timeline Card */}
                            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                                <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                                    <h2 className="font-bold text-gray-900 flex items-center gap-2">
                                        <Calendar className="w-5 h-5 text-gray-400" />
                                        Goals & Timeline
                                    </h2>
                                </div>
                                <div className="p-6 space-y-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                            Target Trees *
                                        </label>
                                        <input
                                            type="number"
                                            value={targetTrees}
                                            onChange={(e) => setTargetTrees(Math.max(100, parseInt(e.target.value) || 100))}
                                            min={100}
                                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">
                                            Minimum: 100 trees • Est. O₂ Impact: {formatCompactNumber(targetO2)} kg
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                                Start Date *
                                            </label>
                                            <input
                                                type="date"
                                                value={startDate}
                                                onChange={(e) => setStartDate(e.target.value)}
                                                min={new Date().toISOString().split('T')[0]}
                                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                                End Date *
                                            </label>
                                            <input
                                                type="date"
                                                value={endDate}
                                                onChange={(e) => setEndDate(e.target.value)}
                                                min={startDate}
                                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                                            />
                                        </div>
                                    </div>

                                    {durationDays > 0 && (
                                        <div className={`rounded-lg p-3 ${
                                            durationDays < 7 || durationDays > 365
                                                ? 'bg-red-50 border border-red-200'
                                                : 'bg-green-50 border border-green-200'
                                        }`}>
                                            <p className={`text-sm font-medium ${
                                                durationDays < 7 || durationDays > 365
                                                    ? 'text-red-700'
                                                    : 'text-green-700'
                                            }`}>
                                                Duration: {durationDays} days
                                                {durationDays < 7 && ' (Minimum 7 days required)'}
                                                {durationDays > 365 && ' (Maximum 365 days allowed)'}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Error Display */}
                            {error && (
                                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 flex items-start gap-3">
                                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-medium text-red-900">Error</p>
                                        <p className="text-sm text-red-700">{error}</p>
                                    </div>
                                </div>
                            )}

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={!canSubmit() || submitting}
                                className="w-full px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg shadow-green-200 hover:shadow-xl hover:shadow-green-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {submitting ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                                        Creating Challenge...
                                    </>
                                ) : (
                                    <>
                                        <Zap className="w-5 h-5" />
                                        Publish Challenge
                                    </>
                                )}
                            </button>
                        </form>
                    </div>

                    {/* Preview/Tips Column */}
                    <div className="space-y-6">
                        {/* Tips Card */}
                        <div className="bg-blue-50 rounded-2xl border border-blue-100 p-6 sticky top-8">
                            <h3 className="font-bold text-blue-900 mb-4 flex items-center gap-2">
                                <Info className="w-5 h-5" />
                                Tips for Success
                            </h3>
                            <ul className="space-y-3 text-sm text-blue-800">
                                <li className="flex gap-2">
                                    <span>•</span>
                                    <span>Set realistic, achievable targets based on your community size</span>
                                </li>
                                <li className="flex gap-2">
                                    <span>•</span>
                                    <span>Clearly explain why this challenge matters to your location</span>
                                </li>
                                <li className="flex gap-2">
                                    <span>•</span>
                                    <span>Include specific details about tree species or donation goals</span>
                                </li>
                                <li className="flex gap-2">
                                    <span>•</span>
                                    <span>Allow enough time for meaningful participation (30+ days recommended)</span>
                                </li>
                                <li className="flex gap-2">
                                    <span>•</span>
                                    <span>Share your challenge on social media to reach more people</span>
                                </li>
                            </ul>
                        </div>

                        {/* Preview Card */}
                        {title && (
                            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                                <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                                    <h3 className="font-bold text-gray-900 text-sm">Preview</h3>
                                </div>
                                <div className="p-4">
                                    <h4 className="font-bold text-gray-900 text-sm mb-2 line-clamp-2">{title}</h4>
                                    {description && (
                                        <p className="text-xs text-gray-600 mb-3 line-clamp-2">{description}</p>
                                    )}
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="bg-gray-50 rounded-lg p-2 text-center">
                                            <div className="flex items-center justify-center gap-1 mb-1">
                                                <TreeDeciduous className="w-3 h-3 text-green-600" />
                                            </div>
                                            <div className="text-xs font-bold text-gray-900">{formatCompactNumber(targetTrees)}</div>
                                            <div className="text-[10px] text-gray-500">Target</div>
                                        </div>
                                        <div className="bg-gray-50 rounded-lg p-2 text-center">
                                            <div className="flex items-center justify-center gap-1 mb-1">
                                                <Wind className="w-3 h-3 text-blue-600" />
                                            </div>
                                            <div className="text-xs font-bold text-gray-900">{formatCompactNumber(targetO2)}</div>
                                            <div className="text-[10px] text-gray-500">kg O₂</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}

export default function CreateChallengePage() {
    return (
        <Suspense
            fallback={
                <>
                    <Header />
                    <div className="min-h-screen bg-gradient-to-b from-green-50/30 to-white flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
                    </div>
                    <Footer />
                </>
            }
        >
            <CreateChallengeContent />
        </Suspense>
    );
}