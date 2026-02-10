'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/ui/header';
import { Footer } from '@/components/ui/footer';
import { useOffline } from '@/lib/context/OfflineContext';
import { clearDistrictCache } from '@/lib/cache';
import { Link } from '@/i18n/navigation';
import {
    Database,
    Trash2,
    RefreshCw,
    Wifi,
    WifiOff,
    MapPin,
    Clock,
    HardDrive,
    CheckCircle2,
} from 'lucide-react';
import { cn } from '@/lib/utils/helpers';

export default function CacheManagementPage() {
    const {
        isOnline,
        cacheAvailable,
        stats,
        cachedDistricts,
        refreshCacheStats,
        clearCache,
        cleanupExpired,
    } = useOffline();

    const [isClearing, setIsClearing] = useState(false);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Hide message after 3 seconds
    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => setMessage(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [message]);

    const handleClearAll = async () => {
        setIsClearing(true);
        try {
            await clearCache();
            setMessage({ type: 'success', text: 'All cached data cleared successfully' });
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to clear cache' });
        } finally {
            setIsClearing(false);
        }
    };

    const handleDeleteDistrict = async (slug: string, name: string) => {
        setIsDeleting(slug);
        try {
            await clearDistrictCache(slug);
            await refreshCacheStats();
            setMessage({ type: 'success', text: `Removed ${name} from cache` });
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to remove from cache' });
        } finally {
            setIsDeleting(null);
        }
    };

    const handleCleanup = async () => {
        try {
            const deleted = await cleanupExpired();
            if (deleted > 0) {
                setMessage({ type: 'success', text: `Cleaned up ${deleted} expired entries` });
            } else {
                setMessage({ type: 'success', text: 'No expired entries to clean up' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to cleanup expired entries' });
        }
    };

    const formatDate = (timestamp: number) => {
        return new Date(timestamp).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    if (!cacheAvailable) {
        return (
            <>
                <Header />
                <main className="min-h-screen bg-gradient-to-br from-nature-50 via-white to-sky-50 pb-20">
                    <div className="max-w-4xl mx-auto px-6 pt-10">
                        <div className="text-center py-20">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-100 mb-4">
                                <Database className="w-8 h-8 text-amber-600" />
                            </div>
                            <h1 className="text-2xl font-bold text-gray-900 mb-2">
                                Offline Storage Not Available
                            </h1>
                            <p className="text-gray-600">
                                Your browser doesn&apos;t support offline storage (IndexedDB).
                                Try using a modern browser like Chrome, Firefox, or Edge.
                            </p>
                        </div>
                    </div>
                </main>
                <Footer />
            </>
        );
    }

    return (
        <>
            <Header />
            <main className="min-h-screen bg-gradient-to-br from-nature-50 via-white to-sky-50 pb-20">
                <div className="max-w-4xl mx-auto px-6 pt-10">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 flex items-center gap-3">
                                <Database className="w-8 h-8 text-blue-600" />
                                Offline Cache
                            </h1>
                            <p className="mt-2 text-gray-600">
                                Manage your locally cached district data for offline access.
                            </p>
                        </div>

                        {/* Connection Status */}
                        <div className={cn(
                            'inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium',
                            isOnline
                                ? 'bg-green-50 text-green-700 border border-green-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                        )}>
                            {isOnline ? (
                                <>
                                    <Wifi className="w-4 h-4" />
                                    Online
                                </>
                            ) : (
                                <>
                                    <WifiOff className="w-4 h-4" />
                                    Offline
                                </>
                            )}
                        </div>
                    </div>

                    {/* Message Toast */}
                    {message && (
                        <div className={cn(
                            'mb-6 px-4 py-3 rounded-lg flex items-center gap-2 animate-in slide-in-from-top-2',
                            message.type === 'success'
                                ? 'bg-green-50 text-green-700 border border-green-200'
                                : 'bg-red-50 text-red-700 border border-red-200'
                        )}>
                            {message.type === 'success' && <CheckCircle2 className="w-5 h-5" />}
                            <span>{message.text}</span>
                        </div>
                    )}

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                        <div className="bg-white rounded-2xl p-5 shadow border border-gray-100">
                            <div className="flex items-center gap-3 mb-2">
                                <HardDrive className="w-5 h-5 text-blue-600" />
                                <h3 className="font-semibold text-gray-900">Cached Districts</h3>
                            </div>
                            <p className="text-3xl font-bold text-gray-900">{stats.detailsCount}</p>
                            <p className="text-sm text-gray-500">of 10 max capacity</p>
                        </div>

                        <div className="bg-white rounded-2xl p-5 shadow border border-gray-100">
                            <div className="flex items-center gap-3 mb-2">
                                <Database className="w-5 h-5 text-purple-600" />
                                <h3 className="font-semibold text-gray-900">Search Queries</h3>
                            </div>
                            <p className="text-3xl font-bold text-gray-900">{stats.searchCount}</p>
                            <p className="text-sm text-gray-500">cached search results</p>
                        </div>

                        <div className="bg-white rounded-2xl p-5 shadow border border-gray-100">
                            <div className="flex items-center gap-3 mb-2">
                                <MapPin className="w-5 h-5 text-green-600" />
                                <h3 className="font-semibold text-gray-900">Total Items</h3>
                            </div>
                            <p className="text-3xl font-bold text-gray-900">
                                {stats.districtCount + stats.detailsCount + stats.searchCount}
                            </p>
                            <p className="text-sm text-gray-500">entries in storage</p>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-4 mb-8">
                        <button
                            onClick={handleCleanup}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition-colors"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Cleanup Expired
                        </button>

                        <button
                            onClick={handleClearAll}
                            disabled={isClearing || stats.detailsCount === 0}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-50 text-red-600 font-medium hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Trash2 className={cn('w-4 h-4', isClearing && 'animate-pulse')} />
                            {isClearing ? 'Clearing...' : 'Clear All Cache'}
                        </button>
                    </div>

                    {/* Cached Districts List */}
                    <div className="bg-white rounded-2xl shadow border border-gray-100 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100">
                            <h2 className="text-lg font-semibold text-gray-900">Cached Districts</h2>
                            <p className="text-sm text-gray-500">
                                These districts are available for offline viewing
                            </p>
                        </div>

                        {cachedDistricts.length > 0 ? (
                            <ul className="divide-y divide-gray-100">
                                {cachedDistricts.map((district) => (
                                    <li
                                        key={district.slug}
                                        className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                                                <MapPin className="w-5 h-5 text-blue-600" />
                                            </div>
                                            <div>
                                                <Link
                                                    href={`/district/${district.slug}`}
                                                    className="font-medium text-gray-900 hover:text-blue-600 transition-colors"
                                                >
                                                    {district.name}
                                                </Link>
                                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                                    <span>{district.state}</span>
                                                    <span>•</span>
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="w-3 h-3" />
                                                        Cached {formatDate(district.cachedAt)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => handleDeleteDistrict(district.slug, district.name)}
                                            disabled={isDeleting === district.slug}
                                            className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                                            title="Remove from cache"
                                        >
                                            <Trash2 className={cn(
                                                'w-5 h-5',
                                                isDeleting === district.slug && 'animate-pulse'
                                            )} />
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="px-6 py-12 text-center">
                                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-3">
                                    <Database className="w-6 h-6 text-gray-400" />
                                </div>
                                <h3 className="font-medium text-gray-900 mb-1">No cached districts</h3>
                                <p className="text-sm text-gray-500 mb-4">
                                    Visit district pages to cache them for offline use.
                                </p>
                                <Link
                                    href="/"
                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
                                >
                                    <MapPin className="w-4 h-4" />
                                    Search Districts
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Info Box */}
                    <div className="mt-8 bg-blue-50 rounded-2xl p-6 border border-blue-100">
                        <h3 className="font-semibold text-blue-900 mb-2">How Offline Mode Works</h3>
                        <ul className="space-y-2 text-sm text-blue-800">
                            <li className="flex items-start gap-2">
                                <span className="text-blue-600">•</span>
                                <span>District data is automatically cached when you view a district page.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-blue-600">•</span>
                                <span>Up to 10 districts can be cached at once (oldest are replaced automatically).</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-blue-600">•</span>
                                <span>Cached data expires after 24 hours and will refresh when you&apos;re online.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-blue-600">•</span>
                                <span>When offline, you&apos;ll see a &quot;Cached data&quot; indicator on district pages.</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}
