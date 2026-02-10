import NodeCache from 'node-cache';

class CacheService {
    private cache: NodeCache;

    constructor(ttlSeconds: number = 60 * 5) { // Default TTL: 5 minutes
        this.cache = new NodeCache({
            stdTTL: ttlSeconds,
            checkperiod: ttlSeconds * 0.2,
            useClones: false,
        });
    }

    get<T>(key: string): T | undefined {
        return this.cache.get<T>(key);
    }

    set(key: string, value: any, ttl?: number): boolean {
        if (ttl) {
            return this.cache.set(key, value, ttl);
        }
        return this.cache.set(key, value);
    }

    del(key: string): number {
        return this.cache.del(key);
    }

    flush(): void {
        this.cache.flushAll();
    }
}

// Export a singleton instance
export const cacheService = new CacheService();
