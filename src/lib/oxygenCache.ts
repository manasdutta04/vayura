import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// 1. Memoization: In-Memory L1 Cache
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const memoizationMap = new Map<string, { value: any; expiry: number }>();

export const oxygenCache = {
  // Check RAM first (fastest)
  getMemoized(key: string) {
    const cached = memoizationMap.get(key);
    if (cached && Date.now() < cached.expiry) {
      return cached.value;
    }
    return null;
  },

  // Save to RAM
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setMemoized(key: string, value: any, ttlSeconds: number = 300) {
    memoizationMap.set(key, {
      value,
      expiry: Date.now() + (ttlSeconds * 1000)
    });
    
    // Safety: Prevent memory leaks
    if (memoizationMap.size > 1000) {
      const firstKey = memoizationMap.keys().next().value;
      if (firstKey) memoizationMap.delete(firstKey);
    }
  },

  // 2. Firestore Cache (L2)
  async get(key: string) {
    // Check L1 (Memory)
    const mem = this.getMemoized(key);
    if (mem) return { data: mem, source: 'memory_memoized' };

    // Check L2 (Firestore)
    try {
      const docRef = doc(db, 'oxygen_cache', key);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data();
        // 24h TTL for Firestore
        const now = Date.now();
        const cachedTime = data.timestamp?.toMillis ? data.timestamp.toMillis() : data.timestamp;
        
        if (now - cachedTime < 86400000) {
          this.setMemoized(key, data.result); // Hydrate L1
          return { data: data.result, source: 'firestore' };
        }
      }
    } catch (e) {
      console.warn('Cache read warning:', e);
    }
    return null;
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async set(key: string, result: any) {
    this.setMemoized(key, result); // Write L1
    // Write L2 (Fire & Forget)
    setDoc(doc(db, 'oxygen_cache', key), {
      result,
      timestamp: Timestamp.now(),
      districtId: key
    }).catch(e => console.error('Cache write error:', e));
  },

  // Monitoring Helper
  getMemoryUsage() {
    return {
      cacheSize: memoizationMap.size,
      heapUsedMB: (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)
    };
  }
};