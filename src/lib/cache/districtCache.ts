/**
 * District Cache Service
 * High-level API for caching district data with offline support
 */

import { indexedDBCache, STORES, DEFAULT_TTL } from './indexedDB';
import type { DistrictDetail, DistrictSearchResult } from '@/lib/types';

export type CacheSource = 'network' | 'cache' | 'stale-cache';

export interface CachedDistrictResult<T> {
    data: T;
    source: CacheSource;
    cachedAt?: number;
    isStale?: boolean;
}

/**
 * Cache district search results
 */
export async function cacheSearchResults(
    query: string,
    results: DistrictSearchResult[]
): Promise<void> {
    if (!query.trim()) return;

    const normalizedQuery = query.toLowerCase().trim();
    await indexedDBCache.set(
        STORES.SEARCH_RESULTS,
        normalizedQuery,
        results,
        DEFAULT_TTL
    );
}

/**
 * Get cached search results
 */
export async function getCachedSearchResults(
    query: string
): Promise<CachedDistrictResult<DistrictSearchResult[]> | null> {
    if (!query.trim()) return null;

    const normalizedQuery = query.toLowerCase().trim();
    const cached = await indexedDBCache.get<DistrictSearchResult[]>(
        STORES.SEARCH_RESULTS,
        normalizedQuery
    );

    if (!cached) return null;

    const now = Date.now();
    const isStale = now > cached.expiresAt;

    return {
        data: cached.data,
        source: isStale ? 'stale-cache' : 'cache',
        cachedAt: cached.timestamp,
        isStale,
    };
}

/**
 * Cache district detail data
 */
export async function cacheDistrictDetail(
    slug: string,
    detail: DistrictDetail
): Promise<void> {
    await indexedDBCache.set(
        STORES.DISTRICT_DETAILS,
        slug,
        detail,
        DEFAULT_TTL
    );

    // Also cache in districts store for search
    await indexedDBCache.set(
        STORES.DISTRICTS,
        detail.id,
        {
            id: detail.id,
            name: detail.name,
            slug: detail.slug,
            state: detail.state,
            population: detail.population,
        } as DistrictSearchResult,
        DEFAULT_TTL
    );
}

/**
 * Get cached district detail
 */
export async function getCachedDistrictDetail(
    slug: string
): Promise<CachedDistrictResult<DistrictDetail> | null> {
    const cached = await indexedDBCache.get<DistrictDetail>(
        STORES.DISTRICT_DETAILS,
        slug
    );

    if (!cached) return null;

    const now = Date.now();
    const isStale = now > cached.expiresAt;

    return {
        data: cached.data,
        source: isStale ? 'stale-cache' : 'cache',
        cachedAt: cached.timestamp,
        isStale,
    };
}

/**
 * Get all cached districts (for offline browsing)
 */
export async function getAllCachedDistricts(): Promise<DistrictSearchResult[]> {
    const cached = await indexedDBCache.getAll<DistrictSearchResult>(STORES.DISTRICTS);
    return cached.map(item => item.data);
}

/**
 * Get all cached district details
 */
export async function getAllCachedDistrictDetails(): Promise<Array<{
    slug: string;
    name: string;
    state: string;
    cachedAt: number;
}>> {
    const cached = await indexedDBCache.getAll<DistrictDetail>(STORES.DISTRICT_DETAILS);
    return cached.map(item => ({
        slug: item.data.slug,
        name: item.data.name,
        state: item.data.state,
        cachedAt: item.timestamp,
    }));
}

/**
 * Get recently accessed districts
 */
export async function getRecentDistricts(limit: number = 5): Promise<DistrictSearchResult[]> {
    const cached = await indexedDBCache.getAll<DistrictDetail>(STORES.DISTRICT_DETAILS);

    // Sort by lastAccessed descending
    cached.sort((a, b) => b.lastAccessed - a.lastAccessed);

    return cached.slice(0, limit).map(item => ({
        id: item.data.id,
        name: item.data.name,
        slug: item.data.slug,
        state: item.data.state,
        population: item.data.population,
    }));
}

/**
 * Clear specific district from cache
 */
export async function clearDistrictCache(slug: string): Promise<void> {
    await indexedDBCache.delete(STORES.DISTRICT_DETAILS, slug);
}

/**
 * Clear all cache
 */
export async function clearAllCache(): Promise<void> {
    await indexedDBCache.clearAll();
}

/**
 * Get cache statistics
 */
export async function getCacheStats() {
    return indexedDBCache.getStats();
}

/**
 * Cleanup expired cache entries
 */
export async function cleanupCache(): Promise<number> {
    return indexedDBCache.cleanup();
}

/**
 * Check if cache is available (IndexedDB supported)
 */
export function isCacheAvailable(): boolean {
    if (typeof window === 'undefined') return false;
    return 'indexedDB' in window;
}
