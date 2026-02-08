'use client';

import { useState, useEffect, useCallback } from 'react';
import { useIsOnline } from '@/lib/hooks/useNetworkStatus';
import {
    getCachedDistrictDetail,
    cacheDistrictDetail,
    type CacheSource,
} from '@/lib/cache';
import type { DistrictDetail } from '@/lib/types';

export interface UseDistrictDataResult {
    data: DistrictDetail | null;
    loading: boolean;
    error: string | null;
    source: CacheSource | 'loading';
    cachedAt: number | null;
    isStale: boolean;
    refresh: () => Promise<void>;
    isRefreshing: boolean;
}

/**
 * Hook for fetching district data with offline support
 * Automatically uses cache when offline
 */
export function useDistrictData(slug: string | null): UseDistrictDataResult {
    const getErrorMessage = (err: unknown, fallback: string) =>
        err instanceof Error ? err.message : fallback;

    const isOnline = useIsOnline();
    const [data, setData] = useState<DistrictDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [source, setSource] = useState<CacheSource | 'loading'>('loading');
    const [cachedAt, setCachedAt] = useState<number | null>(null);
    const [isStale, setIsStale] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const fetchFromNetwork = useCallback(async (districtSlug: string): Promise<DistrictDetail | null> => {
        const response = await fetch(`/api/districts/${districtSlug}`, {
            cache: 'no-store',
        });

        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('District not found');
            }
            throw new Error('Failed to fetch district data');
        }

        return response.json();
    }, []);

    const fetchData = useCallback(async (forceRefresh = false) => {
        if (!slug) {
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // First, try to get cached data for instant display
            const cached = await getCachedDistrictDetail(slug);

            if (cached && !forceRefresh) {
                // Show cached data immediately
                setData(cached.data);
                setSource(cached.source);
                setCachedAt(cached.cachedAt || null);
                setIsStale(cached.isStale || false);
                setLoading(false);

                // If online and cache is not stale, we're done
                // If online and cache is stale, fetch fresh data in background
                if (isOnline && cached.isStale) {
                    try {
                        const freshData = await fetchFromNetwork(slug);
                        if (freshData) {
                            setData(freshData);
                            setSource('network');
                            setCachedAt(null);
                            setIsStale(false);
                            await cacheDistrictDetail(slug, freshData);
                        }
                    } catch {
                        // Keep showing cached data if network fails
                    }
                }
                return;
            }

            // If online, fetch from network
            if (isOnline || forceRefresh) {
                try {
                    const networkData = await fetchFromNetwork(slug);
                    if (networkData) {
                        setData(networkData);
                        setSource('network');
                        setCachedAt(null);
                        setIsStale(false);

                        // Cache the fresh data
                        await cacheDistrictDetail(slug, networkData);
                    }
                } catch (networkError: unknown) {
                    // If network fails and we have cached data, use it
                    if (cached) {
                        setData(cached.data);
                        setSource(cached.source);
                        setCachedAt(cached.cachedAt || null);
                        setIsStale(cached.isStale || false);
                    } else {
                        throw networkError;
                    }
                }
            } else {
                // Offline with no cache
                setError('No cached data available. Please connect to the internet.');
                setSource('cache');
            }
        } catch (err: unknown) {
            setError(getErrorMessage(err, 'Failed to load district data'));
        } finally {
            setLoading(false);
        }
    }, [slug, isOnline, fetchFromNetwork]);

    const refresh = useCallback(async () => {
        if (!isOnline) return;

        setIsRefreshing(true);
        try {
            await fetchData(true);
        } finally {
            setIsRefreshing(false);
        }
    }, [fetchData, isOnline]);

    // Initial fetch
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Refetch when coming back online
    useEffect(() => {
        if (isOnline && isStale && !loading) {
            refresh();
        }
    }, [isOnline, isStale, loading, refresh]);

    return {
        data,
        loading,
        error,
        source,
        cachedAt,
        isStale,
        refresh,
        isRefreshing,
    };
}
