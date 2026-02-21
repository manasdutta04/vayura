/**
 * Air Quality Index (AQI) data source
  * Priority:
 * 1. OpenWeatherMap (Real-time API)
 * 2. CPCB Published Averages
 * 3. Gemini AI (Fallback only)
 * 4. Static Fallback
 */

import { getAQIFromOpenWeather, CPCB_AQI_AVERAGES_2024 } from './alternative-apis';

interface AQIData {
    aqi: number;
    pm25?: number;
    pm10?: number;
    timestamp: Date;
    source: string;
}

// Static fallback values (major cities)
const fallbackAQIData: Record<string, number> = {
    'bangalore-urban': 156,
    'mumbai-city': 142,
    'delhi': 287,
    'pune': 134,
    'hyderabad': 178,
    'chennai': 121,
    'kolkata': 203,
    'jaipur': 191,
    'lucknow': 245,
    'ahmedabad': 168,
};

export async function getAQIData(
    latitude: number,
    longitude: number,
    districtSlug?: string,
    districtName?: string,
    stateName?: string
): Promise<AQIData> {

    // =============================
    // 1️⃣ Try OpenWeatherMap (Primary Source)
    // =============================
    try {
        const openWeatherData = await getAQIFromOpenWeather(latitude, longitude);

        if (
            openWeatherData?.aqi &&
            openWeatherData.aqi > 0 &&
            openWeatherData.aqi <= 500
        ) {
            return {
                aqi: openWeatherData.aqi,
                pm25: openWeatherData.pm25,
                pm10: openWeatherData.pm10,
                timestamp: new Date(),
                source: 'openweathermap',
            };
        }
    } catch (error) {
        console.error('[AQI] OpenWeather fetch failed:', error);
    }

    // =============================
    // 2️⃣ CPCB Published Averages
    // =============================
    const cpcbAQI =
        districtSlug &&
        CPCB_AQI_AVERAGES_2024[
            districtSlug as keyof typeof CPCB_AQI_AVERAGES_2024
        ];

    if (cpcbAQI) {
        return {
            aqi: cpcbAQI,
            timestamp: new Date(),
            source: 'cpcb_published_average',
        };
    }

    // =============================
    // 3️⃣ Gemini AI (Fallback Only)
    // =============================
    if (districtName && stateName) {
        try {
            const { fetchDistrictDataWithGemini, validateGeminiData } =
                await import('./gemini-data-fetcher');

            const geminiData = await fetchDistrictDataWithGemini({
                districtName,
                stateName,
                dataType: 'air_quality',
            });

            if (geminiData?.aqi) {
                const validation = validateGeminiData(geminiData);

                if (validation.valid && geminiData.aqi > 0 && geminiData.aqi <= 500) {
                    return {
                        aqi: geminiData.aqi,
                        pm25: geminiData.pm25,
                        timestamp: new Date(),
                        source: 'gemini_ai_fallback',
                    };
                }
            }
        } catch (error) {
            console.error('[AQI] Gemini fallback failed:', error);
        }
    }

    // =============================
    // 4️⃣ Static Fallback (Spec value 100)
    // =============================
    const fallbackAQI =
        fallbackAQIData[districtSlug || ''] || 100;

    return {
        aqi: fallbackAQI,
        timestamp: new Date(),
        source: 'static_estimate',
    };
}
