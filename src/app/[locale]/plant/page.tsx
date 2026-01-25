'use client';

import { useEffect, useState, useRef, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/ui/header';
import { Footer } from '@/components/ui/footer';
import { useAuth } from '@/lib/auth-context';
import { createImagePreview, revokeImagePreview, validateImageFile } from '@/lib/utils/storage';
import { DistrictSearchResult } from '@/lib/types';
import { DistrictSearch } from '@/components/ui/district-search';
import { Leaf, Camera, MapPin, Award, Info, CheckCircle, UploadCloud, AlertCircle } from 'lucide-react';
import Link from 'next/link';

function PlantPageContent() {
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const dropZoneRef = useRef<HTMLDivElement>(null);

    const [image, setImage] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [treeQuantity, setTreeQuantity] = useState<number>(1);
    const [treeName, setTreeName] = useState('');
    const [selectedDistrict, setSelectedDistrict] = useState<DistrictSearchResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    // Redirect if not authenticated
    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/?auth_required=true');
        }
    }, [user, authLoading, router]);

    useEffect(() => {
        return () => {
            if (previewUrl) revokeImagePreview(previewUrl);
        };
    }, [previewUrl]);

    const handleImageFile = (file: File) => {
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

    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) handleImageFile(file);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) handleImageFile(file);
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setError(null);
        setSuccess(null);

        if (!selectedDistrict) {
            setError('Please select a district');
            return;
        }

        if (!image) {
            setError('Please upload a tree photo');
            return;
        }

        if (!treeName.trim()) {
            setError('Please enter the tree name');
            return;
        }

        if (treeQuantity < 1) {
            setError('Please enter a valid number of trees');
            return;
        }

        try {
            setSubmitting(true);
            const formData = new FormData();
            formData.append('districtId', selectedDistrict.id);
            formData.append('districtName', selectedDistrict.name);
            formData.append('state', selectedDistrict.state);
            formData.append('treeName', treeName.trim());
            formData.append('treeQuantity', treeQuantity.toString());
            // Default contributionType is 'plantation' for this page
            formData.append('contributionType', 'plantation');

            if (user?.uid) formData.append('userId', user.uid);
            if (user?.displayName) formData.append('userName', user.displayName);
            if (user?.email) formData.append('userEmail', user.email);
            formData.append('image', image);

            const res = await fetch('/api/plant', {
                method: 'POST',
                body: formData,
            });

            const json = await res.json();
            if (!res.ok) {
                throw new Error(json.error || 'Failed to submit contribution');
            }

            setSuccess('Tree contribution submitted successfully!');
            setImage(null);
            if (previewUrl) revokeImagePreview(previewUrl);
            setPreviewUrl(null);
            setTreeName('');
            setTreeQuantity(1);
            setSelectedDistrict(null);

            // Redirect to contribution page after 2 seconds
            setTimeout(() => {
                router.push('/contribution');
            }, 2000);
        } catch (err: any) {
            setError(err.message || 'Failed to submit contribution');
        } finally {
            setSubmitting(false);
        }
    };

    if (authLoading) {
        return (
            <>
                <Header />
                <div className="min-h-screen bg-gray-50">
                    <div className="max-w-7xl mx-auto px-6 py-12">
                        <div className="animate-pulse space-y-6">
                            <div className="h-8 w-48 bg-gray-200 rounded"></div>
                            <div className="h-5 w-96 bg-gray-100 rounded"></div>
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
                                {[...Array(3)].map((_, idx) => (
                                    <div key={idx} className="h-64 bg-white rounded-xl border border-gray-200"></div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    // Allow rendering the layout (will redirect if !user in useEffect)
    if (!user) return null;

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900">
            <Header />

            {/* Hero Section */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-6 py-12">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Plant & Earn
                    </h1>
                    <p className="text-gray-600 max-w-2xl">
                        Plant trees, upload proof, and track oxygen production to climb the leaderboard.
                    </p>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-6 py-8">
                <div className="flex flex-col lg:flex-row gap-8">

                    {/* Left Column: Information & Guidelines */}
                    <div className="lg:w-2/3 space-y-6">

                        {/* How it Works Card */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                    <Leaf className="w-5 h-5 text-nature-600" />
                                    How it Works
                                </h2>
                            </div>
                            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="text-center">
                                    <div className="bg-green-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 text-green-600">
                                        <Leaf className="w-6 h-6" />
                                    </div>
                                    <h3 className="font-semibold text-gray-900 mb-1">1. Plant a Tree</h3>
                                    <p className="text-sm text-gray-500">Plant a tree in your local area or backyard.</p>
                                </div>
                                <div className="text-center">
                                    <div className="bg-blue-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 text-blue-600">
                                        <Camera className="w-6 h-6" />
                                    </div>
                                    <h3 className="font-semibold text-gray-900 mb-1">2. Upload Proof</h3>
                                    <p className="text-sm text-gray-500">Take a photo and upload it here for verification.</p>
                                </div>
                                <div className="text-center">
                                    <div className="bg-amber-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 text-amber-600">
                                        <Award className="w-6 h-6" />
                                    </div>
                                    <h3 className="font-semibold text-gray-900 mb-1">3. Track Oxygen</h3>
                                    <p className="text-sm text-gray-500">See how much oxygen your trees produce based on species.</p>
                                </div>
                            </div>
                        </div>

                        {/* Guidelines Card */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                    <CheckCircle className="w-5 h-5 text-nature-600" />
                                    Submission Guidelines
                                </h2>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="flex gap-3">
                                    <Camera className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <h3 className="text-sm font-semibold text-gray-900">Clear Photos Required</h3>
                                        <p className="text-sm text-gray-500">Ensure the sapling is clearly visible. Avoid blurry or dark images.</p>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <h3 className="text-sm font-semibold text-gray-900">Correct Location</h3>
                                        <p className="text-sm text-gray-500">Select the district where the tree was actually planted.</p>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <AlertCircle className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <h3 className="text-sm font-semibold text-gray-900">No Fakes</h3>
                                        <p className="text-sm text-gray-500">Stock images or duplicate submissions will be rejected by our AI verification system.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* AI Message */}
                        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                            <div className="flex gap-3">
                                <Info className="w-5 h-5 text-blue-600 flex-shrink-0" />
                                <div>
                                    <h3 className="text-sm font-semibold text-blue-900 mb-1">Powered by AI</h3>
                                    <p className="text-xs text-blue-800 leading-relaxed">
                                        Vayura uses Gemini Vision AI to analyze tree species, estimate age, and calculate potential oxygen production.
                                    </p>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* Right Column: Submission Form */}
                    <div className="lg:w-1/3">
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 sticky top-8">
                            <div className="mb-6">
                                <h2 className="text-xl font-bold text-gray-900 mb-2">Submission Form</h2>
                                <p className="text-sm text-gray-600">
                                    Fill in the details below.
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-5">
                                {/* District Selection */}
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5">
                                        District
                                    </label>
                                    <DistrictSearch
                                        onDistrictSelect={(district) => {
                                            setSelectedDistrict(district);
                                            setError(null);
                                        }}
                                    />
                                    {selectedDistrict ? (
                                        <p className="mt-1.5 text-xs text-green-600 font-medium truncate">
                                            📍 {selectedDistrict.name}, {selectedDistrict.state}
                                        </p>
                                    ) : (
                                        <p className="mt-1.5 text-xs text-gray-500">Where was it planted?</p>
                                    )}
                                </div>

                                {/* Tree Name & Quantity Row */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5">
                                            Species
                                        </label>
                                        <input
                                            type="text"
                                            value={treeName}
                                            onChange={(e) => setTreeName(e.target.value)}
                                            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-1 focus:ring-gray-900 focus:border-gray-900 outline-none text-sm text-gray-900 bg-white"
                                            placeholder="e.g. Neem"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5">
                                            Quantity
                                        </label>
                                        <input
                                            type="number"
                                            min="1"
                                            value={treeQuantity}
                                            onChange={(e) => setTreeQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                                            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-1 focus:ring-gray-900 focus:border-gray-900 outline-none text-sm text-gray-900 bg-white"
                                            placeholder="Qty"
                                        />
                                    </div>
                                </div>

                                {/* Image Upload */}
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5">
                                        Photo Evidence
                                    </label>
                                    <div
                                        ref={dropZoneRef}
                                        onDragOver={handleDragOver}
                                        onDragLeave={handleDragLeave}
                                        onDrop={handleDrop}
                                        onClick={() => fileInputRef.current?.click()}
                                        className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${isDragging
                                            ? 'border-gray-900 bg-gray-50'
                                            : 'border-gray-300 hover:border-gray-400'
                                            }`}
                                    >
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/jpeg,image/png,image/webp"
                                            onChange={handleImageChange}
                                            className="hidden"
                                        />
                                        {previewUrl ? (
                                            <div className="space-y-2">
                                                <img
                                                    src={previewUrl}
                                                    alt="Tree preview"
                                                    className="mx-auto rounded-lg max-h-32 object-contain"
                                                    draggable={false}
                                                />
                                                <p className="text-xs text-gray-500">Click to change</p>
                                            </div>
                                        ) : (
                                            <div className="py-2">
                                                <UploadCloud className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                                                <p className="text-xs text-gray-600">
                                                    <span className="font-medium underline">Upload</span> or drop
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {error && (
                                    <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                                        {error}
                                    </div>
                                )}

                                {success && (
                                    <div className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-xs text-green-700">
                                        {success}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full px-4 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {submitting ? 'Analyzing & Submitting...' : 'Submit Contribution'}
                                </button>

                                <p className="text-[10px] text-gray-400 text-center">
                                    By submitting, you agree to our terms and confirm this photo is authentic.
                                </p>
                            </form>
                        </div>
                    </div>

                </div>
            </main>
            <Footer />
        </div>
    );
}

export default function PlantPage() {
    return (
        <Suspense fallback={
            <>
                <Header />
                <div className="min-h-screen bg-gray-50">
                    <div className="max-w-7xl mx-auto px-6 py-12">
                        <div className="animate-pulse space-y-6">
                            <div className="h-8 w-48 bg-gray-200 rounded"></div>
                            <div className="h-5 w-96 bg-gray-100 rounded"></div>
                        </div>
                    </div>
                </div>
                <Footer />
            </>
        }>
            <PlantPageContent />
        </Suspense>
    );
}
