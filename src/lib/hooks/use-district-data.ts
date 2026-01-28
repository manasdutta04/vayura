/**
 * Hook for fetching district data with caching support
 */

'use client';

import { useEffect, useState, useCallback } from 'react';
import { DistrictDetail } from '@/lib/types';
import {
  fetchDistrictWithCache,
  CacheMetadata,
  FetchOptions,
} from '@/lib/utils/district-cache-manager';

interface UseDistrictDataResult {
  data: DistrictDetail | null;
  loading: boolean;
  error: Error | null;
  metadata: CacheMetadata;
  refresh: () => Promise<void>;
}

/**
 * Hook to fetch and cache district data with offline support
 */
export function useDistrictData(slug: string | null): UseDistrictDataResult {
  const [data, setData] = useState<DistrictDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [metadata, setMetadata] = useState<CacheMetadata>({ fromCache: false });

  const fetchData = useCallback(
    async (options: FetchOptions = {}) => {
      if (!slug) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const result = await fetchDistrictWithCache(slug, options);

        if (result.data) {
          setData(result.data);
          setMetadata(result.metadata);
        } else {
          setError(new Error('District not found'));
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch district data'));
      } finally {
        setLoading(false);
      }
    },
    [slug]
  );

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Refresh function
  const refresh = useCallback(async () => {
    await fetchData({ forceRefresh: true });
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    metadata,
    refresh,
  };
}
