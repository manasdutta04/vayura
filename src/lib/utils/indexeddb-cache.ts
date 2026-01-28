/**
 * IndexedDB Cache Utility for Offline Mode
 * Stores district data locally for offline access
 */

import { DistrictDetail } from '@/lib/types';

const DB_NAME = 'vayura-cache';
const DB_VERSION = 1;
const STORE_NAME = 'districts';
const MAX_CACHED_DISTRICTS = 10; // Keep last 10 districts

export interface CachedDistrictData {
  slug: string;
  data: DistrictDetail;
  timestamp: number;
  lastAccessed: number;
}

class IndexedDBCache {
  private db: IDBDatabase | null = null;

  /**
   * Initialize the IndexedDB database
   */
  async init(): Promise<void> {
    if (this.db) return;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create object store if it doesn't exist
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'slug' });
          store.createIndex('timestamp', 'timestamp', { unique: false });
          store.createIndex('lastAccessed', 'lastAccessed', { unique: false });
        }
      };
    });
  }

  /**
   * Store district data in cache
   */
  async set(slug: string, data: DistrictDetail): Promise<void> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);

      const cacheEntry: CachedDistrictData = {
        slug,
        data,
        timestamp: Date.now(),
        lastAccessed: Date.now(),
      };

      const request = store.put(cacheEntry);

      request.onsuccess = async () => {
        // Clean up old entries if we exceed the limit
        await this.cleanup();
        resolve();
      };
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Retrieve district data from cache
   */
  async get(slug: string): Promise<CachedDistrictData | null> {
    await this.init();
    if (!this.db) return null;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(slug);

      request.onsuccess = () => {
        const result = request.result as CachedDistrictData | undefined;
        if (result) {
          // Update last accessed time
          result.lastAccessed = Date.now();
          store.put(result);
          resolve(result);
        } else {
          resolve(null);
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Check if district data exists in cache
   */
  async has(slug: string): Promise<boolean> {
    await this.init();
    if (!this.db) return false;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(slug);

      request.onsuccess = () => resolve(!!request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get all cached districts
   */
  async getAll(): Promise<CachedDistrictData[]> {
    await this.init();
    if (!this.db) return [];

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Remove old entries to keep cache size manageable
   */
  private async cleanup(): Promise<void> {
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const index = store.index('lastAccessed');
      const request = index.openCursor();

      const entries: { slug: string; lastAccessed: number }[] = [];

      request.onsuccess = () => {
        const cursor = request.result;
        if (cursor) {
          entries.push({
            slug: cursor.value.slug,
            lastAccessed: cursor.value.lastAccessed,
          });
          cursor.continue();
        } else {
          // Sort by last accessed time (oldest first)
          entries.sort((a, b) => a.lastAccessed - b.lastAccessed);

          // Remove oldest entries if we exceed the limit
          const toRemove = entries.slice(0, Math.max(0, entries.length - MAX_CACHED_DISTRICTS));
          toRemove.forEach((entry) => {
            store.delete(entry.slug);
          });

          resolve();
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Clear all cached data
   */
  async clear(): Promise<void> {
    await this.init();
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get cache size (number of cached districts)
   */
  async getSize(): Promise<number> {
    await this.init();
    if (!this.db) return 0;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.count();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
}

// Export singleton instance
export const districtCache = new IndexedDBCache();
