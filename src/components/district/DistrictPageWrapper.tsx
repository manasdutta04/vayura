'use client';

import { useEffect } from 'react';
import { useOffline } from '@/lib/context/OfflineContext';
import { cacheDistrictDetail } from '@/lib/cache';
import { DataSourceBadge } from '@/components/ui/OfflineIndicator';
import type { DistrictDetail } from '@/lib/types';

interface DistrictPageWrapperProps {
    district: DistrictDetail;
    slug: string;
    children: React.ReactNode;
}

/**
 * Client-side wrapper that caches district data for offline use
 * and displays data source information
 */
export function DistrictPageWrapper({ district, slug, children }: DistrictPageWrapperProps) {
    const { setCurrentDataSource, refreshCacheStats } = useOffline();

    useEffect(() => {
        // Cache the district data when it's loaded from the server
        const cacheData = async () => {
            try {
                await cacheDistrictDetail(slug, district);
                await refreshCacheStats();
                setCurrentDataSource('network');
            } catch (error) {
                console.warn('Failed to cache district data:', error);
            }
        };

        cacheData();
    }, [district, slug, setCurrentDataSource, refreshCacheStats]);

    return <>{children}</>;
}

interface DistrictDataSourceProps {
    source: 'network' | 'cache' | 'stale-cache';
    cachedAt?: number;
    onRefresh?: () => void;
    isRefreshing?: boolean;
}

/**
 * Component to display data source for district pages
 */
export function DistrictDataSource({
    source,
    cachedAt,
    onRefresh,
    isRefreshing
}: DistrictDataSourceProps) {
    return (
        <div className="mb-4">
            <DataSourceBadge
                source={source}
                cachedAt={cachedAt}
                onRefresh={onRefresh}
                isRefreshing={isRefreshing}
            />
        </div>
    );
}
