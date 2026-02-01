import { oxygenCache } from '@/lib/oxygenCache';
// ✅ REQUIREMENT: Use the real calculator logic instead of simulation
// If this import fails, ensure the file exists at this path.
import { calculateOxygenRequirements } from '../lib/utils/oxygen-calculator';
import { allIndianDistricts } from '../lib/data/all-indian-districts';

let failureCount = 0;
const FAILURE_THRESHOLD = 5;
const RESET_TIMEOUT = 60000; // 1 minute
let lastFailureTime = 0;

class OxygenService {
  private pendingRequests = new Map<string, Promise<any>>();

  async calculate(districtId: string, trees: number, age: number) {
    const cacheKey = `calc_${districtId}_${trees}_${age}`;

    // 1. Cache Check
    const cached = await oxygenCache.get(cacheKey);
    if (cached) return cached;

    // 2. Request Deduplication
    if (this.pendingRequests.has(cacheKey)) {
      return { data: await this.pendingRequests.get(cacheKey), source: 'deduplicated' };
    }

    // 3. Execution (With Circuit Breaker)
    if (failureCount >= FAILURE_THRESHOLD) {
      if (Date.now() - lastFailureTime < RESET_TIMEOUT) {
        throw new Error('Circuit Breaker Open: Service Temporarily Unavailable');
      }
      failureCount = 0;
    }

    const promise = (async () => {
      try {
        const start = performance.now();

        // ✅ REQUIREMENT: Real Calculator Integration
        // Find district data for population and other metrics
        const districtData = allIndianDistricts.find(d => d.slug === districtId || d.name === districtId);
        
        const calculationInput = {
          district_name: districtData?.name || districtId,
          population: districtData?.population || 1000000, // Default if not found
          aqi: 150, // Default average AQI
          soil_quality: 70, // Default soil quality
          disaster_frequency: 2 // Default frequency
        };

        const result = calculateOxygenRequirements(calculationInput);
        
        const duration = performance.now() - start;

        // ✅ REQUIREMENT: WebAssembly Evaluation Benchmark
        if (duration > 50) {
          console.warn(JSON.stringify({
            level: 'WARN',
            event: 'wasm_evaluation_needed',
            message: 'Calculation took >50ms, consider moving to WebAssembly',
            duration_ms: duration,
            districtId
          }));
        }

        await oxygenCache.set(cacheKey, result);
        this.pendingRequests.delete(cacheKey);
        return result;
      } catch (e) {
        failureCount++;
        lastFailureTime = Date.now();
        this.pendingRequests.delete(cacheKey);
        throw e;
      }
    })();

    this.pendingRequests.set(cacheKey, promise);
    return { data: await promise, source: 'calculation' };
  }

  // 4. Batch Processing
  async calculateBatch(requests: Array<{id: string, trees: number, age: number}>) {
    return Promise.all(requests.map(req => this.calculate(req.id, req.trees, req.age)));
  }
}

export const oxygenService = new OxygenService();