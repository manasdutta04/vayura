'use client';

import { getAllNgos } from '@/lib/ngo/registry';
import { Header } from '@/components/ui/header';
import { Footer } from '@/components/ui/footer';
import { ExternalLink, CheckCircle, XCircle, Info, ShieldCheck, FileText, Map, Users, UploadCloud } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { createImagePreview, revokeImagePreview, validateImageFile } from '@/lib/utils/storage';
import { DistrictSearch } from '@/components/ui/district-search';
import { DistrictSearchResult } from '@/lib/types';
import Link from 'next/link';
import { toast } from 'sonner';

export default function DonatePage() {
    const ngos = getAllNgos();
    const { user } = useAuth();
    const router = useRouter();

    // Verification State
    const fileInputRef = useRef<HTMLInputElement>(null);
    const dropZoneRef = useRef<HTMLDivElement>(null);
    const [image, setImage] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [treeQuantity, setTreeQuantity] = useState<number>(1);
    const [treeName, setTreeName] = useState('');
    const [selectedDistrict, setSelectedDistrict] = useState<DistrictSearchResult | null>(null);
    const [submitting, setSubmitting] = useState(false);

    // Cleanup preview on unmount
    useEffect(() => {
        return () => {
            if (previewUrl) revokeImagePreview(previewUrl);
        };
    }, [previewUrl]);


    // Verification Handlers
    const handleImageFile = (file: File) => {
        const validation = validateImageFile(file);
        if (!validation.valid) {
            toast.error(validation.error || 'Invalid image file');
            return;
        }
        if (previewUrl) revokeImagePreview(previewUrl);
        setImage(file);
        setPreviewUrl(createImagePreview(file));
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

    const handleSubmitVerification = async (event: React.FormEvent) => {
        event.preventDefault();
        
        if (!user) {
            toast.error('Please sign in to verify your donation');
            return;
        }

        if (!selectedDistrict) {
            toast.error('Please select the district where trees were donated');
            return;
        }

        if (!image) {
            toast.error('Please upload your donation receipt or certificate');
            return;
        }

        if (!treeName.trim()) {
            toast.error('Please enter the plant/tree name');
            return;
        }

        const toastId = toast.loading("Verifying your donation...");

        try {
            setSubmitting(true);
            const formData = new FormData();
            formData.append('districtId', selectedDistrict.id);
            formData.append('districtName', selectedDistrict.name);
            formData.append('state', selectedDistrict.state);
            formData.append('districtName', selectedDistrict.name);
            formData.append('state', selectedDistrict.state);
            formData.append('treeName', treeName.trim());
            formData.append('treeQuantity', treeQuantity.toString());
            formData.append('contributionType', 'donation');

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
                throw new Error(json.error || 'Failed to submit verification');
            }

            toast.success('Donation verified successfully!', {
                id: toastId,
                description: 'Added to your contributions.'
            });

            setImage(null);
            if (previewUrl) revokeImagePreview(previewUrl);
            setPreviewUrl(null);
            setTreeName('');
            setTreeQuantity(1);
            setSelectedDistrict(null);

            setTimeout(() => {
                router.push('/contribution');
            }, 2000);

        } catch (err: any) {
            toast.error(err.message || 'Failed to submit verification', {
                id: toastId
            });
        } finally {
            setSubmitting(false);
        }
    };


    return (
        <>
            <Header />
            <div className="min-h-screen bg-gray-50 text-gray-900">
                {/* Hero Section */}
                <div className="bg-white border-b border-gray-200">
                    <div className="max-w-7xl mx-auto px-6 py-12">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            Donate & Verify
                        </h1>
                        <p className="text-gray-600 max-w-2xl">
                            Support trusted NGOs or verify your existing donations to track environmental impact.
                        </p>
                        <div className="mt-6 flex flex-wrap gap-3">
                            <a
                                href="https://github.com/manasdutta04/vayura/tree/main/src/lib/ngo/adapters"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm group"
                            >
                                <Users className="w-4 h-4 text-gray-500 group-hover:text-gray-900 transition-colors" />
                                <span>Add NGO via PR</span>
                            </a>
                        </div>
                    </div>
                </div>

                {/* Dashboard-style Layout */}
                <div className="max-w-7xl mx-auto px-6 py-8">
                    <div className="flex flex-col lg:flex-row gap-8">

                        {/* Left Column: NGOs Listing (Flex-grow to take available space) */}
                        <div className="lg:w-2/3 space-y-8">
                            <div className="mb-6">
                                <h2 className="text-xl font-bold text-gray-900 mb-1">Trusted Partners</h2>
                                <p className="text-sm text-gray-600">Select an NGO to support tree planting initiatives.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {ngos.map((ngo) => (
                                    <div key={ngo.id} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex flex-col overflow-hidden">
                                        {/* Card Header */}
                                        <div className="p-5 border-b border-gray-100 bg-gray-50/50">
                                            <div className="flex justify-between items-start mb-3">
                                                <div className="h-10 w-10 bg-white rounded-lg border border-gray-200 flex items-center justify-center font-bold text-lg text-nature-600 shadow-sm">
                                                    {ngo.name.charAt(0)}
                                                </div>
                                                <div className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border flex items-center gap-1
                                                    ${ngo.transparency.level === 'Platinum' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                        ngo.transparency.level === 'Gold' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                                            'bg-gray-100 text-gray-700 border-gray-200'}`}>
                                                    <ShieldCheck className="w-3 h-3" />
                                                    {ngo.transparency.level}
                                                </div>
                                            </div>
                                            <h2 className="text-lg font-bold text-gray-900 mb-1">{ngo.name}</h2>
                                            <p className="text-sm text-gray-600 line-clamp-2 h-10">
                                                {ngo.description}
                                            </p>
                                        </div>

                                        {/* Transparency Score */}
                                        <div className="p-5 flex-grow">
                                            <div className="mb-4">
                                                <div className="flex justify-between items-end mb-1">
                                                    <span className="text-xs font-semibold text-gray-700">Transparency</span>
                                                    <span className="text-lg font-bold text-nature-600">{ngo.transparency.score}/100</span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                                    <div
                                                        className={`h-2 rounded-full ${ngo.transparency.score >= 90 ? 'bg-green-500' :
                                                            ngo.transparency.score >= 80 ? 'bg-amber-500' : 'bg-gray-500'
                                                            }`}
                                                        style={{ width: `${ngo.transparency.score}%` }}
                                                    ></div>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <TransparencyItem
                                                    label="Financial Audits"
                                                    active={ngo.transparency.breakdown.financials}
                                                    icon={<FileText className="w-3 h-3" />}
                                                />
                                                <TransparencyItem
                                                    label="Impact (GPS)"
                                                    active={ngo.transparency.breakdown.impactTracking}
                                                    icon={<Map className="w-3 h-3" />}
                                                />
                                                <TransparencyItem
                                                    label="Open Data"
                                                    active={ngo.transparency.breakdown.openData}
                                                    icon={<DatabaseIcon className="w-3 h-3" />}
                                                />
                                            </div>
                                        </div>

                                        {/* Action Footer */}
                                        <div className="p-5 pt-0 mt-auto">
                                            <a
                                                href={ngo.donationLink}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white py-2.5 px-4 rounded-lg hover:bg-gray-800 transition-colors font-medium text-sm"
                                                onClick={() => {
                                                    toast.info("Opening donation page...", {
                                                        description: "Thank you for supporting this NGO!"
                                                    });
                                                }}
                                            >
                                                Donate
                                                <ExternalLink className="w-3 h-3" />
                                            </a>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Disclaimer in left column footer */}
                            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mt-8">
                                <div className="flex gap-3">
                                    <Info className="w-5 h-5 text-blue-600 flex-shrink-0" />
                                    <div>
                                        <h3 className="text-sm font-semibold text-blue-900 mb-1">Transparency Score Methodology</h3>
                                        <p className="text-xs text-blue-800 leading-relaxed">
                                            Scores are calculated based on public availability of Audited Financial Reports,
                                            precision of Impact Tracking (GPS), Open Data access, and third-party verification.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Verify Donation Sidebar */}
                        <div className="lg:w-1/3">
                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 sticky top-8">
                                <div className="mb-6">
                                    <h2 className="text-xl font-bold text-gray-900 mb-2">Verify Donation</h2>
                                    <p className="text-sm text-gray-600">
                                        Already donated? Upload receipt to track impact and oxygen.
                                    </p>
                                </div>

                                {!user ? (
                                    <div className="text-center py-6 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                                        <p className="text-gray-600 mb-3 text-sm">Sign in to verify your donation.</p>
                                        <Link href="/signin" className="inline-block bg-gray-900 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-800 transition-colors">
                                            Sign In
                                        </Link>
                                    </div>
                                ) : (
                                    <form onSubmit={handleSubmitVerification} className="space-y-5">
                                        {/* District Selection */}
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5">
                                                Location
                                            </label>
                                            <DistrictSearch
                                                onDistrictSelect={(district) => {
                                                    setSelectedDistrict(district);
                                                }}
                                            />
                                            {selectedDistrict && (
                                                <p className="mt-1.5 text-xs text-green-600 font-medium truncate">
                                                    📍 {selectedDistrict.name}, {selectedDistrict.state}
                                                </p>
                                            )}
                                        </div>

                                        {/* Tree Name & Quantity Row */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5">
                                                    Plant Name
                                                </label>
                                                <input
                                                    type="text"
                                                    value={treeName}
                                                    onChange={(e) => setTreeName(e.target.value)}
                                                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-1 focus:ring-gray-900 focus:border-gray-900 outline-none text-sm text-gray-900 bg-white"
                                                    placeholder="e.g. Mango"
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

                                        {/* Receipt Upload */}
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5">
                                                Receipt / Certificate
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
                                                            alt="Receipt preview"
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

                                        <button
                                            type="submit"
                                            disabled={submitting}
                                            className="w-full px-4 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                        >
                                            {submitting ? 'Verifying...' : 'Verify Donation'}
                                        </button>
                                    </form>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
}

function TransparencyItem({ label, active, icon }: { label: string, active: boolean, icon: any }) {
    return (
        <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-gray-600">
                {icon}
                <span>{label}</span>
            </div>
            {active ? (
                <CheckCircle className="w-3.5 h-3.5 text-green-600" />
            ) : (
                <XCircle className="w-3.5 h-3.5 text-gray-300" />
            )}
        </div>
    );
}

function DatabaseIcon({ className }: { className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <ellipse cx="12" cy="5" rx="9" ry="3" />
            <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
            <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
        </svg>
    );
}