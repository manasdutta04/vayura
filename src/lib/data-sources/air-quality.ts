/**
 * Air Quality Index (AQI) data source
 * Uses Gemini AI, OpenWeatherMap, and published CPCB data
 */

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { getAQIFromOpenWeather, CPCB_AQI_AVERAGES_2024 } from './alternative-apis';

interface AQIData {
    aqi: number;
    pm25?: number;
    pm10?: number;
    timestamp: Date;
    source: string;
}

// Fallback AQI data (typical values for Indian cities)
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

export async function getAQIData(latitude: number, longitude: number, districtSlug?: string, districtName?: string, stateName?: string): Promise<AQIData> {
    // Try Gemini AI first for intelligent data fetching
    if (districtName && stateName) {
        try {
            const { fetchDistrictDataWithGemini, validateGeminiData } = await import('./gemini-data-fetcher');
            const geminiData = await fetchDistrictDataWithGemini({
                districtName,
                stateName,
                dataType: 'air_quality',
            });

            if (geminiData && geminiData.aqi) {
                const validation = validateGeminiData(geminiData);
                if (validation.valid) {
                    return {
                        aqi: geminiData.aqi,
                        pm25: geminiData.pm25,
                        timestamp: new Date(),
                        source: `gemini_ai (${geminiData.sources?.join(', ') || 'multiple sources'})`,
                    };
                }
            }
        } catch (error) {
            console.error('Gemini AI fetch failed:', error);
        }
    }

    // Try OpenWeatherMap second
    const apiKey = process.env.OPENWEATHER_API_KEY;
    if (apiKey && apiKey !== 'your_openweather_api_key') {
        try {
            const response = await fetch(
                `http://api.openweathermap.org/data/2.5/air_pollution?lat=${latitude}&lon=${longitude}&appid=${apiKey}`,
                { next: { revalidate: 3600 } } // Cache for 1 hour
            );

            if (response.ok) {
                const data = await response.json();
                const aqi = data.list[0].main.aqi;
                const components = data.list[0].components;

                // Convert OpenWeatherMap AQI (1-5) to EPA AQI (0-500)
                const convertedAQI = convertOpenWeatherAQI(aqi);

                return {
                    aqi: convertedAQI,
                    pm25: components.pm2_5,
                    pm10: components.pm10,
                    timestamp: new Date(),
                    source: 'openweathermap',
                };
            }
        } catch (error) {
            console.error('Failed to fetch AQI from OpenWeatherMap:', error);
        }
    }

    // Fallback to CPCB published averages (more accurate than estimates)
    const cpcbAQI = districtSlug ? CPCB_AQI_AVERAGES_2024[districtSlug as keyof typeof CPCB_AQI_AVERAGES_2024] : undefined;
    const fallbackAQI = cpcbAQI || fallbackAQIData[districtSlug || ''] || 150;

    return {
        aqi: fallbackAQI,
        timestamp: new Date(),
        source: cpcbAQI ? 'cpcb_published_average' : 'estimate',
    };
}

/**
 * Convert OpenWeatherMap AQI scale (1-5) to EPA AQI scale (0-500)
 */
function convertOpenWeatherAQI(owmAQI: number): number {
    const conversionMap: Record<number, number> = {
        1: 25,   // Good
        2: 75,   // Fair
        3: 125,  // Moderate
        4: 200,  // Poor
        5: 350,  // Very Poor
    };

    return conversionMap[owmAQI] || 150;
}
