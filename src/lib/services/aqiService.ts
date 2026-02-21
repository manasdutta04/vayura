/**
 * AQI Service
 * Orchestrates:
 * - Cache first strategy
 * - Fetching from air-quality data source
 * - Automatic caching
 */

import { getAQIData } from '../data-sources/air-quality';
import {
    getCachedDistrictAQI,
    cacheDistrictAQI,
} from '../cache/districtCache';

export interface AQIServiceParams {
    latitude: number;
    longitude: number;
    slug: string;
    districtName?: string;
    stateName?: string;
}

export async function getDistrictAQI(params: AQIServiceParams): Promise<number> {
    const { latitude, longitude, slug, districtName, stateName } = params;

    try {
        // ===============================
        // 1️⃣ Check Cache First
        // ===============================
        const cached = await getCachedDistrictAQI(slug);

if (cached) {
    return cached.data.aqi;
}

        // ===============================
        // 2️⃣ Fetch Fresh Data
        // ===============================
        const freshData = await getAQIData(
            latitude,
            longitude,
            slug,
            districtName,
            stateName
        );

        const validAQI =
            freshData.aqi && freshData.aqi > 0 && freshData.aqi <= 500
                ? freshData.aqi
                : 150;

        // ===============================
        // 3️⃣ Cache It
        // ===============================
        await cacheDistrictAQI(slug, validAQI);

        return validAQI;
    } catch (error) {
        console.error('[AQI Service] Failed to get AQI:', error);

        // ===============================
        // 4️⃣ Safe Fallback
        // ===============================
        return 150; // Moderate fallback
    }
}
