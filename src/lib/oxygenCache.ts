import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Simple In-Memory Cache for Memoization
const memoizationMap = new Map<string, { value: any; expiry: number }>();

export const oxygenCache = {
  // Memoization: Check RAM before anything else
  getMemoized(key: string) {
    const cached = memoizationMap.get(key);
    if (cached && Date.now() < cached.expiry) {
      return cached.value;
    }
    return null;
  },

  setMemoized(key: string, value: any, ttlSeconds: number = 300) {
    memoizationMap.set(key, {
      value,
      expiry: Date.now() + (ttlSeconds * 1000)
    });
    
    // Memory Usage Protection: Clear if too big
    if (memoizationMap.size > 1000) {
      const firstKey = memoizationMap.keys().next().value;
      if (firstKey) memoizationMap.delete(firstKey);
    }
  },

  // Firestore Cache (L2)
  async get(key: string) {
    // 1. Check Memoization (L1)
    const mem = this.getMemoized(key);
    if (mem) return { data: mem, source: 'memory_memoized' };

    // 2. Check Firestore (L2)
    try {
      const docRef = doc(db, 'oxygen_cache', key);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data();
        const now = Date.now();
        const cachedTime = data.timestamp?.toMillis ? data.timestamp.toMillis() : data.timestamp;
        
        // 24h TTL for Firestore
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

  async set(key: string, result: any) {
    this.setMemoized(key, result);
    setDoc(doc(db, 'oxygen_cache', key), {
      result,
      timestamp: Timestamp.now(),
      districtId: key
    }).catch(e => console.error('Cache write error:', e));
  },

  // Monitoring Requirement
  getMemoryUsage() {
    return {
      cacheSize: memoizationMap.size,
      heapUsed: process.memoryUsage().heapUsed / 1024 / 1024 // MB
    };
  }
};