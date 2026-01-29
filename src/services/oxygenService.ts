import { oxygenCache } from '@/lib/oxygenCache';

// Circuit Breaker State
let failureCount = 0;
let lastFailureTime = 0;
const FAILURE_THRESHOLD = 5;
const RESET_TIMEOUT = 30000; // 30 seconds

// Heavy Math Simulation
const performHeavyCalculation = async (trees: number, age: number) => {
  // 1. Circuit Breaker Check
  if (failureCount >= FAILURE_THRESHOLD) {
    if (Date.now() - lastFailureTime < RESET_TIMEOUT) {
      throw new Error('Circuit Breaker Open: Service Temporarily Unavailable');
    }
    failureCount = 0; // Reset after timeout
  }

  try {
    const start = performance.now();
    
    // Simulate complex math loop (CPU load)
    let factor = 1;
    for(let i=0; i<1000; i++) { factor = (factor + i) % 100; }
    
    const OXYGEN_PER_TREE = 118;
    const CARBON_OFFSET = 21;
    const growthFactor = Math.min(Math.log(age + 2), 1.5);
    
    return {
      oxygenProduced: Math.round(trees * OXYGEN_PER_TREE * growthFactor),
      carbonOffset: Math.round(trees * CARBON_OFFSET * growthFactor),
      peopleSupported: Math.floor((trees * OXYGEN_PER_TREE * growthFactor) / 730),
      computeTime: (performance.now() - start).toFixed(2)
    };
  } catch (e) {
    failureCount++;
    lastFailureTime = Date.now();
    throw e;
  }
};

class OxygenService {
  private pendingRequests = new Map<string, Promise<any>>();

  async calculate(districtId: string, trees: number, age: number) {
    const cacheKey = `calc_${districtId}_${trees}_${age}`;

    // 2. Cache Check
    const cached = await oxygenCache.get(cacheKey);
    if (cached) return cached;

    // 3. Request Deduplication
    if (this.pendingRequests.has(cacheKey)) {
      return { data: await this.pendingRequests.get(cacheKey), source: 'deduplicated' };
    }

    const promise = performHeavyCalculation(trees, age)
      .then(async (result) => {
        await oxygenCache.set(cacheKey, result);
        this.pendingRequests.delete(cacheKey);
        return result;
      });

    this.pendingRequests.set(cacheKey, promise);
    return { data: await promise, source: 'calculation' };
  }

  // 4. Batch Processing
  async calculateBatch(requests: Array<{id: string, trees: number, age: number}>) {
    return Promise.all(requests.map(req => this.calculate(req.id, req.trees, req.age)));
  }
}

export const oxygenService = new OxygenService();