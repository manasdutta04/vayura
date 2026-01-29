import { oxygenCache } from '@/lib/oxygenCache';

// Simulate heavy calculation logic
// In a real scenario, this would process the millions of trees data for a district
const performHeavyCalculation = async (trees: number, age: number) => {
  // Simulate 50ms CPU Latency (as per profiling requirement)
  const start = Date.now();
  while (Date.now() - start < 50); 
  
  // Scientific Calculation Implementation
  const OXYGEN_PER_TREE_KG = 118;
  const CARBON_OFFSET_KG = 21;
  
  // Complex growth factor based on tree age
  const growthFactor = Math.log(age + 1) * 1.5; 
  
  return {
    oxygenProduced: Math.round(trees * OXYGEN_PER_TREE_KG * growthFactor),
    carbonOffset: Math.round(trees * CARBON_OFFSET_KG * growthFactor),
    peopleSupported: Math.floor((trees * OXYGEN_PER_TREE_KG * growthFactor) / 730),
    calculatedAt: new Date().toISOString()
  };
};

class OxygenService {
  // Request Deduplication Map
  // Prevents multiple identical requests from running at the same time
  private pendingRequests = new Map<string, Promise<any>>();

  async calculate(districtId: string, trees: number, age: number) {
    const cacheKey = `calc_${districtId}_${trees}_${age}`;

    // 1. Check Cache
    const cached = await oxygenCache.get(cacheKey);
    if (cached) return cached;

    // 2. Request Deduplication
    if (this.pendingRequests.has(cacheKey)) {
      console.log(`[Dedupe] Merging request for ${cacheKey}`);
      const data = await this.pendingRequests.get(cacheKey);
      return { data, source: 'deduplicated' };
    }

    // 3. Perform Fresh Calculation
    const promise = performHeavyCalculation(trees, age)
      .then(async (result) => {
        await oxygenCache.set(cacheKey, result);
        this.pendingRequests.delete(cacheKey); // Cleanup
        return result;
      })
      .catch(err => {
        this.pendingRequests.delete(cacheKey);
        throw err;
      });

    this.pendingRequests.set(cacheKey, promise);
    
    const data = await promise;
    return { data, source: 'calculation' };
  }
}

export const oxygenService = new OxygenService();