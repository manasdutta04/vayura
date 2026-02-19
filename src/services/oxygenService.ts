import { oxygenCache } from '@/lib/oxygenCache';
import { calculateOxygenRequirements } from '../lib/utils/oxygen-calculator';
import { allIndianDistricts } from '../lib/data/all-indian-districts';
import { getDistrictAQI } from '@/lib/services/aqiService';

let failureCount = 0;
const FAILURE_THRESHOLD = 5;
const RESET_TIMEOUT = 60000;
let lastFailureTime = 0;

class OxygenService {
  private pendingRequests = new Map<string, Promise<unknown>>();

  async calculate(districtId: string, trees: number, age: number) {
    const cacheKey = `calc_${districtId}_${trees}_${age}`;

    // 1️⃣ Cache
    const cached = await oxygenCache.get(cacheKey);
    if (cached) return cached;

    // 2️⃣ Deduplication
    if (this.pendingRequests.has(cacheKey)) {
      return { data: await this.pendingRequests.get(cacheKey), source: 'deduplicated' };
    }

    // 3️⃣ Circuit Breaker
    if (failureCount >= FAILURE_THRESHOLD) {
      if (Date.now() - lastFailureTime < RESET_TIMEOUT) {
        throw new Error('Circuit Breaker Open');
      }
      failureCount = 0;
    }

    const promise = (async () => {
      try {
        // 4️⃣ District Data
        const districtData = allIndianDistricts.find(
          d => d.slug === districtId || d.name === districtId
        );

        const districtName = districtData?.name || districtId;
        const latitude = districtData?.latitude;
        const longitude = districtData?.longitude;
        const slug = districtData?.slug || districtId;

        // 5️⃣ Real AQI
        const aqi =
          latitude && longitude
            ? await getDistrictAQI({
                latitude,
                longitude,
                slug,
                districtName,
                stateName: districtData?.state,
              })
            : 150;

        // 6️⃣ Performance Timer (Only Calculation)
        const start = performance.now();

        const result = calculateOxygenRequirements({
          district_name: districtName,
          population: districtData?.population || 1000000,
          aqi,
          soil_quality: districtData?.soil_quality || 70,
          disaster_frequency: districtData?.disaster_frequency || 2,
        });

        const duration = performance.now() - start;

        if (duration > 50) {
          console.warn(
            JSON.stringify({
              level: 'WARN',
              event: 'wasm_evaluation_needed',
              duration_ms: duration,
              districtId,
            })
          );
        }

        await oxygenCache.set(cacheKey, result);
        this.pendingRequests.delete(cacheKey);

        return result;
      } catch (err) {
        failureCount++;
        lastFailureTime = Date.now();
        this.pendingRequests.delete(cacheKey);
        throw err;
      }
    })();

    this.pendingRequests.set(cacheKey, promise);
    return { data: await promise, source: 'calculation' };
  }

  async calculateBatch(
    requests: Array<{ id: string; trees: number; age: number }>
  ) {
    return Promise.all(
      requests.map(req => this.calculate(req.id, req.trees, req.age))
    );
  }
}

export const oxygenService = new OxygenService();
