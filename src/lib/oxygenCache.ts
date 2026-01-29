import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import { db } from './firebase'; // Ensure this points to your firebase.ts

// Simple In-Memory LRU Cache (No npm packages required)
class MemoryCache<K, V> {
  private capacity: number;
  private cache: Map<K, V>;

  constructor(capacity: number) {
    this.capacity = capacity;
    this.cache = new Map();
  }

  get(key: K): V | undefined {
    if (!this.cache.has(key)) return undefined;
    // Refresh item (move to end)
    const val = this.cache.get(key)!;
    this.cache.delete(key);
    this.cache.set(key, val);
    return val;
  }

  set(key: K, value: V): void {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.capacity) {
      // Remove oldest item (first key)
      const firstKey = this.cache.keys().next().value;
      if (firstKey) this.cache.delete(firstKey);
    }
    this.cache.set(key, value);
  }
}

// Global instance to persist across requests in serverless environment
// Capacity: 100 most active districts
const hotCache = new MemoryCache<string, any>(100);

export const oxygenCache = {
  /**
   * Tries to get data from Memory -> Firestore.
   * Returns null if calculation is needed.
   */
  async getCachedCalculation(districtId: string) {
    const cacheKey = `oxygen_calc_${districtId}`;

    // 1. Check Memory (Hot Path) ⚡
    const memResult = hotCache.get(cacheKey);
    if (memResult) {
      console.log(`[CACHE] Memory Hit for ${districtId}`);
      return { data: memResult, source: 'memory' };
    }

    // 2. Check Firestore (Warm Path) ☁️
    try {
      const docRef = doc(db, 'oxygen_cache', districtId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        // Check TTL (Time To Live) - e.g., 24 hours
        const now = Timestamp.now().toMillis();
        const cachedAt = data.cachedAt?.toMillis() || 0;
        const OneDay = 24 * 60 * 60 * 1000;

        if (now - cachedAt < OneDay) {
          console.log(`[CACHE] Firestore Hit for ${districtId}`);
          // Hydrate memory cache for next time
          hotCache.set(cacheKey, data.result);
          return { data: data.result, source: 'firestore' };
        }
      }
    } catch (error) {
      console.warn('[CACHE] Firestore read failed, skipping cache', error);
    }

    // 3. Cache Miss (Cold Path) ❄️
    console.log(`[CACHE] Miss for ${districtId} - Calculation required`);
    return null;
  },

  /**
   * Saves result to Memory & Firestore
   */
  async setCachedCalculation(districtId: string, result: any) {
    const cacheKey = `oxygen_calc_${districtId}`;

    // 1. Save to Memory
    hotCache.set(cacheKey, result);

    // 2. Save to Firestore (Fire and Forget - don't await strictly if performance matters)
    try {
      const docRef = doc(db, 'oxygen_cache', districtId);
      await setDoc(docRef, {
        result,
        cachedAt: Timestamp.now(),
        districtId
      });
    } catch (error) {
      console.error('[CACHE] Failed to save to Firestore', error);
    }
  }
};