/**
 * District Data Cache Manager
 * Handles fetching and caching of district data with offline support
 */

'use client';

import { DistrictDetail } from '@/lib/types';
import { districtCache } from './indexeddb-cache';

export interface FetchOptions {
  forceRefresh?: boolean;
  skipCache?: boolean;
}

export interface CacheMetadata {
  fromCache: boolean;
  timestamp?: number;
  isStale?: boolean;
}

export interface CachedDistrictResult {
  data: DistrictDetail | null;
  metadata: CacheMetadata;
}

const CACHE_VALIDITY_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Fetch district data with cache support
 */
export async function fetchDistrictWithCache(
  slug: string,
  options: FetchOptions = {}
): Promise<CachedDistrictResult> {
  const { forceRefresh = false, skipCache = false } = options;

  // Check if we're online
  const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;

  // Try to fetch from cache first if we're offline or not forcing refresh
  if (!forceRefresh && !skipCache) {
    try {
      const cachedData = await districtCache.get(slug);
      if (cachedData) {
        const cacheAge = Date.now() - cachedData.timestamp;
        const isStale = cacheAge > CACHE_VALIDITY_MS;

        // If offline, return cached data regardless of staleness
        if (!isOnline) {
          return {
            data: cachedData.data,
            metadata: {
              fromCache: true,
              timestamp: cachedData.timestamp,
              isStale,
            },
          };
        }

        // If online but cache is fresh, return cached data
        if (!isStale) {
          return {
            data: cachedData.data,
            metadata: {
              fromCache: true,
              timestamp: cachedData.timestamp,
              isStale: false,
            },
          };
        }
      }
    } catch (error) {
      console.error('Error reading from cache:', error);
    }
  }

  // Fetch fresh data from API
  if (isOnline) {
    try {
      const queryParams = forceRefresh ? '?fresh=true' : '';
      const response = await fetch(`/api/districts/${slug}${queryParams}`, {
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: DistrictDetail = await response.json();

      // Cache the fresh data
      try {
        await districtCache.set(slug, data);
      } catch (error) {
        console.error('Error caching data:', error);
      }

      return {
        data,
        metadata: {
          fromCache: false,
          timestamp: Date.now(),
          isStale: false,
        },
      };
    } catch (error) {
      console.error('Error fetching district data:', error);

      // If fetch fails, try to return cached data as fallback
      try {
        const cachedData = await districtCache.get(slug);
        if (cachedData) {
          return {
            data: cachedData.data,
            metadata: {
              fromCache: true,
              timestamp: cachedData.timestamp,
              isStale: true,
            },
          };
        }
      } catch (cacheError) {
        console.error('Error reading from cache:', cacheError);
      }

      return {
        data: null,
        metadata: {
          fromCache: false,
        },
      };
    }
  } else {
    // Offline and no cache available
    return {
      data: null,
      metadata: {
        fromCache: false,
      },
    };
  }
}

/**
 * Check if district data is cached
 */
export async function isDistrictCached(slug: string): Promise<boolean> {
  try {
    return await districtCache.has(slug);
  } catch (error) {
    console.error('Error checking cache:', error);
    return false;
  }
}

/**
 * Clear all cached district data
 */
export async function clearDistrictCache(): Promise<void> {
  try {
    await districtCache.clear();
  } catch (error) {
    console.error('Error clearing cache:', error);
    throw error;
  }
}

/**
 * Get list of cached districts
 */
export async function getCachedDistricts(): Promise<string[]> {
  try {
    const allCached = await districtCache.getAll();
    return allCached.map((entry) => entry.slug);
  } catch (error) {
    console.error('Error getting cached districts:', error);
    return [];
  }
}

/**
 * Get cache statistics
 */
export async function getCacheStats(): Promise<{
  size: number;
  districts: string[];
}> {
  try {
    const [size, districts] = await Promise.all([
      districtCache.getSize(),
      getCachedDistricts(),
    ]);

    return { size, districts };
  } catch (error) {
    console.error('Error getting cache stats:', error);
    return { size: 0, districts: [] };
  }
}
