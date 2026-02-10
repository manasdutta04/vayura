/**
 * IndexedDB Cache Service for Offline District Data
 * Provides persistent storage for district-level data with TTL support
 */

const DB_NAME = 'vayura-offline-cache';
const DB_VERSION = 1;
const STORES = {
    DISTRICTS: 'districts',
    DISTRICT_DETAILS: 'district_details',
    SEARCH_RESULTS: 'search_results',
    METADATA: 'metadata',
} as const;

// Default TTL: 24 hours in milliseconds
const DEFAULT_TTL = 24 * 60 * 60 * 1000;

// Maximum number of cached districts (LRU eviction)
const MAX_CACHED_DISTRICTS = 10;

export interface CachedItem<T> {
    data: T;
    timestamp: number;
    expiresAt: number;
    accessCount: number;
    lastAccessed: number;
}

export interface CacheMetadata {
    totalCachedDistricts: number;
    lastCleanup: number;
    cacheVersion: string;
}

class IndexedDBCache {
    private db: IDBDatabase | null = null;
    private dbPromise: Promise<IDBDatabase> | null = null;

    /**
     * Initialize the IndexedDB database
     */
    private async initDB(): Promise<IDBDatabase> {
        if (this.db) return this.db;
        if (this.dbPromise) return this.dbPromise;

        this.dbPromise = new Promise((resolve, reject) => {
            if (typeof window === 'undefined' || !window.indexedDB) {
                reject(new Error('IndexedDB is not available'));
                return;
            }

            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onerror = () => {
                console.error('Failed to open IndexedDB:', request.error);
                reject(request.error);
            };

            request.onsuccess = () => {
                this.db = request.result;
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = (event.target as IDBOpenDBRequest).result;

                // Store for district list/search results
                if (!db.objectStoreNames.contains(STORES.DISTRICTS)) {
                    const districtsStore = db.createObjectStore(STORES.DISTRICTS, { keyPath: 'id' });
                    districtsStore.createIndex('slug', 'data.slug', { unique: true });
                    districtsStore.createIndex('lastAccessed', 'lastAccessed', { unique: false });
                }

                // Store for detailed district data
                if (!db.objectStoreNames.contains(STORES.DISTRICT_DETAILS)) {
                    const detailsStore = db.createObjectStore(STORES.DISTRICT_DETAILS, { keyPath: 'slug' });
                    detailsStore.createIndex('lastAccessed', 'lastAccessed', { unique: false });
                }

                // Store for search results
                if (!db.objectStoreNames.contains(STORES.SEARCH_RESULTS)) {
                    const searchStore = db.createObjectStore(STORES.SEARCH_RESULTS, { keyPath: 'query' });
                    searchStore.createIndex('timestamp', 'timestamp', { unique: false });
                }

                // Store for cache metadata
                if (!db.objectStoreNames.contains(STORES.METADATA)) {
                    db.createObjectStore(STORES.METADATA, { keyPath: 'key' });
                }
            };
        });

        return this.dbPromise;
    }

    /**
     * Get item from cache
     */
    async get<T>(storeName: string, key: string): Promise<CachedItem<T> | null> {
        try {
            const db = await this.initDB();
            return new Promise((resolve, reject) => {
                const transaction = db.transaction(storeName, 'readwrite');
                const store = transaction.objectStore(storeName);
                const request = store.get(key);

                request.onsuccess = () => {
                    const result = request.result as CachedItem<T> | undefined;

                    if (!result) {
                        resolve(null);
                        return;
                    }

                    // Check if expired
                    if (Date.now() > result.expiresAt) {
                        // Delete expired item
                        store.delete(key);
                        resolve(null);
                        return;
                    }

                    // Update access metadata
                    result.accessCount++;
                    result.lastAccessed = Date.now();
                    store.put(result);

                    resolve(result);
                };

                request.onerror = () => reject(request.error);
            });
        } catch (error) {
            console.warn('IndexedDB get error:', error);
            return null;
        }
    }

    /**
     * Set item in cache
     */
    async set<T>(storeName: string, key: string, data: T, ttlMs: number = DEFAULT_TTL): Promise<void> {
        try {
            const db = await this.initDB();

            // Enforce cache limits for district details
            if (storeName === STORES.DISTRICT_DETAILS) {
                await this.enforceCacheLimit();
            }

            return new Promise((resolve, reject) => {
                const transaction = db.transaction(storeName, 'readwrite');
                const store = transaction.objectStore(storeName);

                const now = Date.now();
                const cachedItem: CachedItem<T> & { [key: string]: unknown } = {
                    data,
                    timestamp: now,
                    expiresAt: now + ttlMs,
                    accessCount: 1,
                    lastAccessed: now,
                };

                // Add key property based on store type
                if (storeName === STORES.DISTRICTS) {
                    cachedItem['id'] = key;
                } else if (storeName === STORES.DISTRICT_DETAILS) {
                    cachedItem['slug'] = key;
                } else if (storeName === STORES.SEARCH_RESULTS) {
                    cachedItem['query'] = key;
                } else if (storeName === STORES.METADATA) {
                    cachedItem['key'] = key;
                }

                const request = store.put(cachedItem);
                request.onsuccess = () => resolve();
                request.onerror = () => reject(request.error);
            });
        } catch (error) {
            console.warn('IndexedDB set error:', error);
        }
    }

    /**
     * Delete item from cache
     */
    async delete(storeName: string, key: string): Promise<void> {
        try {
            const db = await this.initDB();
            return new Promise((resolve, reject) => {
                const transaction = db.transaction(storeName, 'readwrite');
                const store = transaction.objectStore(storeName);
                const request = store.delete(key);
                request.onsuccess = () => resolve();
                request.onerror = () => reject(request.error);
            });
        } catch (error) {
            console.warn('IndexedDB delete error:', error);
        }
    }

    /**
     * Get all items from a store
     */
    async getAll<T>(storeName: string): Promise<CachedItem<T>[]> {
        try {
            const db = await this.initDB();
            return new Promise((resolve, reject) => {
                const transaction = db.transaction(storeName, 'readonly');
                const store = transaction.objectStore(storeName);
                const request = store.getAll();

                request.onsuccess = () => {
                    const results = (request.result || []) as CachedItem<T>[];
                    // Filter out expired items
                    const validResults = results.filter(item => Date.now() <= item.expiresAt);
                    resolve(validResults);
                };
                request.onerror = () => reject(request.error);
            });
        } catch (error) {
            console.warn('IndexedDB getAll error:', error);
            return [];
        }
    }

    /**
     * Enforce LRU cache limit for district details
     */
    private async enforceCacheLimit(): Promise<void> {
        try {
            const db = await this.initDB();

            return new Promise((resolve) => {
                const transaction = db.transaction(STORES.DISTRICT_DETAILS, 'readwrite');
                const store = transaction.objectStore(STORES.DISTRICT_DETAILS);
                const countRequest = store.count();

                countRequest.onsuccess = () => {
                    const count = countRequest.result;

                    if (count >= MAX_CACHED_DISTRICTS) {
                        // Get all items sorted by lastAccessed (oldest first)
                        const index = store.index('lastAccessed');
                        const cursorRequest = index.openCursor();
                        let deletedCount = 0;
                        const toDelete = count - MAX_CACHED_DISTRICTS + 1;

                        cursorRequest.onsuccess = (event) => {
                            const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
                            if (cursor && deletedCount < toDelete) {
                                cursor.delete();
                                deletedCount++;
                                cursor.continue();
                            } else {
                                resolve();
                            }
                        };

                        cursorRequest.onerror = () => resolve();
                    } else {
                        resolve();
                    }
                };

                countRequest.onerror = () => resolve();
            });
        } catch (error) {
            console.warn('Cache limit enforcement error:', error);
        }
    }

    /**
     * Clear all cache data
     */
    async clearAll(): Promise<void> {
        try {
            const db = await this.initDB();

            const storeNames = Object.values(STORES);
            const transaction = db.transaction(storeNames, 'readwrite');

            for (const storeName of storeNames) {
                transaction.objectStore(storeName).clear();
            }

            return new Promise((resolve, reject) => {
                transaction.oncomplete = () => resolve();
                transaction.onerror = () => reject(transaction.error);
            });
        } catch (error) {
            console.warn('IndexedDB clearAll error:', error);
        }
    }

    /**
     * Get cache statistics
     */
    async getStats(): Promise<{
        districtCount: number;
        detailsCount: number;
        searchCount: number;
        totalSize: number;
    }> {
        try {
            const db = await this.initDB();

            const stats = {
                districtCount: 0,
                detailsCount: 0,
                searchCount: 0,
                totalSize: 0,
            };

            const transaction = db.transaction(Object.values(STORES), 'readonly');

            const countPromises = [
                new Promise<number>((resolve) => {
                    const req = transaction.objectStore(STORES.DISTRICTS).count();
                    req.onsuccess = () => resolve(req.result);
                    req.onerror = () => resolve(0);
                }),
                new Promise<number>((resolve) => {
                    const req = transaction.objectStore(STORES.DISTRICT_DETAILS).count();
                    req.onsuccess = () => resolve(req.result);
                    req.onerror = () => resolve(0);
                }),
                new Promise<number>((resolve) => {
                    const req = transaction.objectStore(STORES.SEARCH_RESULTS).count();
                    req.onsuccess = () => resolve(req.result);
                    req.onerror = () => resolve(0);
                }),
            ];

            const [districtCount, detailsCount, searchCount] = await Promise.all(countPromises);

            stats.districtCount = districtCount;
            stats.detailsCount = detailsCount;
            stats.searchCount = searchCount;

            return stats;
        } catch (error) {
            console.warn('IndexedDB getStats error:', error);
            return {
                districtCount: 0,
                detailsCount: 0,
                searchCount: 0,
                totalSize: 0,
            };
        }
    }

    /**
     * Cleanup expired entries
     */
    async cleanup(): Promise<number> {
        let deletedCount = 0;

        try {
            const db = await this.initDB();
            const now = Date.now();

            for (const storeName of Object.values(STORES)) {
                if (storeName === STORES.METADATA) continue;

                const transaction = db.transaction(storeName, 'readwrite');
                const store = transaction.objectStore(storeName);
                const request = store.openCursor();

                await new Promise<void>((resolve) => {
                    request.onsuccess = (event) => {
                        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
                        if (cursor) {
                            const item = cursor.value as CachedItem<unknown>;
                            if (now > item.expiresAt) {
                                cursor.delete();
                                deletedCount++;
                            }
                            cursor.continue();
                        } else {
                            resolve();
                        }
                    };
                    request.onerror = () => resolve();
                });
            }
        } catch (error) {
            console.warn('IndexedDB cleanup error:', error);
        }

        return deletedCount;
    }
}

// Export singleton instance
export const indexedDBCache = new IndexedDBCache();

// Export store names for external use
export { STORES };

// Export TTL constant
export { DEFAULT_TTL, MAX_CACHED_DISTRICTS };
