'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useNetworkStatus, type NetworkStatus } from '@/lib/hooks/useNetworkStatus';
import {
    getCacheStats,
    cleanupCache,
    clearAllCache,
    getAllCachedDistrictDetails,
    isCacheAvailable,
} from '@/lib/cache';

export type DataSource = 'network' | 'cache' | 'stale-cache' | 'unknown';

export interface CacheState {
    isOnline: boolean;
    networkStatus: NetworkStatus;
    cacheAvailable: boolean;
    stats: {
        districtCount: number;
        detailsCount: number;
        searchCount: number;
        totalSize: number;
    };
    cachedDistricts: Array<{
        slug: string;
        name: string;
        state: string;
        cachedAt: number;
    }>;
    currentDataSource: DataSource;
    isLoading: boolean;
}

export interface OfflineContextValue extends CacheState {
    refreshCacheStats: () => Promise<void>;
    clearCache: () => Promise<void>;
    cleanupExpired: () => Promise<number>;
    setCurrentDataSource: (source: DataSource) => void;
    setIsLoading: (loading: boolean) => void;
}

const defaultStats = {
    districtCount: 0,
    detailsCount: 0,
    searchCount: 0,
    totalSize: 0,
};

const OfflineContext = createContext<OfflineContextValue | undefined>(undefined);

export interface OfflineProviderProps {
    children: ReactNode;
}

export function OfflineProvider({ children }: OfflineProviderProps) {
    const networkStatus = useNetworkStatus();
    const [stats, setStats] = useState(defaultStats);
    const [cachedDistricts, setCachedDistricts] = useState<CacheState['cachedDistricts']>([]);
    const [currentDataSource, setCurrentDataSource] = useState<DataSource>('unknown');
    const [isLoading, setIsLoading] = useState(false);
    const [cacheAvailable] = useState(() => isCacheAvailable());

    const refreshCacheStats = useCallback(async () => {
        if (!cacheAvailable) return;

        try {
            const [newStats, districts] = await Promise.all([
                getCacheStats(),
                getAllCachedDistrictDetails(),
            ]);
            setStats(newStats);
            setCachedDistricts(districts);
        } catch (error) {
            console.warn('Failed to refresh cache stats:', error);
        }
    }, [cacheAvailable]);

    const clearCache = useCallback(async () => {
        if (!cacheAvailable) return;

        try {
            await clearAllCache();
            setStats(defaultStats);
            setCachedDistricts([]);
        } catch (error) {
            console.warn('Failed to clear cache:', error);
        }
    }, [cacheAvailable]);

    const cleanupExpired = useCallback(async () => {
        if (!cacheAvailable) return 0;

        try {
            const deleted = await cleanupCache();
            await refreshCacheStats();
            return deleted;
        } catch (error) {
            console.warn('Failed to cleanup cache:', error);
            return 0;
        }
    }, [cacheAvailable, refreshCacheStats]);

    // Initial load and periodic refresh
    useEffect(() => {
        // Defer state-updating async work outside the effect body to satisfy strict hooks linting.
        const initialRefresh = setTimeout(() => {
            void refreshCacheStats();
            void cleanupExpired();
        }, 0);

        // Refresh stats periodically (every 5 minutes)
        const interval = setInterval(() => {
            void refreshCacheStats();
        }, 5 * 60 * 1000);

        return () => {
            clearTimeout(initialRefresh);
            clearInterval(interval);
        };
    }, [refreshCacheStats, cleanupExpired]);

    const effectiveDataSource: DataSource =
        !networkStatus.isOnline && currentDataSource === 'network'
            ? 'cache'
            : currentDataSource;

    const value: OfflineContextValue = {
        isOnline: networkStatus.isOnline,
        networkStatus,
        cacheAvailable,
        stats,
        cachedDistricts,
        currentDataSource: effectiveDataSource,
        isLoading,
        refreshCacheStats,
        clearCache,
        cleanupExpired,
        setCurrentDataSource,
        setIsLoading,
    };

    return (
        <OfflineContext.Provider value={value}>
            {children}
        </OfflineContext.Provider>
    );
}

export function useOffline(): OfflineContextValue {
    const context = useContext(OfflineContext);
    if (!context) {
        throw new Error('useOffline must be used within an OfflineProvider');
    }
    return context;
}

/**
 * Hook for components that need to handle offline state
 */
export function useOfflineData() {
    const { isOnline, currentDataSource, stats, cachedDistricts } = useOffline();

    return {
        isOnline,
        isOffline: !isOnline,
        currentDataSource,
        hasCachedData: stats.detailsCount > 0,
        cachedDistrictCount: stats.detailsCount,
        cachedDistricts,
    };
}
