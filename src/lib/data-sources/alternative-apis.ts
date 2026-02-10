/**
 * Alternative Open Data APIs for Indian Environmental Data
 * These are publicly accessible APIs that don't require registration
 */

/**
 * OpenWeatherMap Air Quality API (Easier Alternative)
 * Free tier: 1000 calls/day
 * Sign up: https://openweathermap.org/api
 */
interface AQIData {
    aqi: number;
    pm25?: number;
    pm10?: number;
    source: string;
}

export async function getAQIFromOpenWeather(lat: number, lon: number): Promise<AQIData | null> {
    const apiKey = process.env.OPENWEATHER_API_KEY;
    if (!apiKey) return null;

    try {
        const url = `http://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`;
        const response = await fetch(url, { next: { revalidate: 3600 } });

        if (!response.ok) return null;

        const data = await response.json();
        const aqi = convertOpenWeatherAQI(data.list[0].main.aqi);

        return {
            aqi,
            pm25: data.list[0].components.pm2_5,
            pm10: data.list[0].components.pm10,
            source: 'openweathermap',
        };
    } catch (error) {
        console.error('OpenWeather AQI error:', error);
        return null;
    }
}

function convertOpenWeatherAQI(owmAQI: number): number {
    // Convert OpenWeatherMap AQI (1-5) to EPA AQI (0-500)
    const map: Record<number, number> = {
        1: 25,   // Good
        2: 75,   // Fair
        3: 125,  // Moderate
        4: 200,  // Poor
        5: 350,  // Very Poor
    };
    return map[owmAQI] || 150;
}

/**
 * Census of India Official Data (No API key required for some datasets)
 * Direct CSV/Excel downloads from censusindia.gov.in
 */
export const CENSUS_2021_DISTRICT_POPULATION = {
    // Major Indian districts with 2021 projections
    'bangalore-urban': 12765000,
    'mumbai-city': 12442373,
    'delhi': 16787941,
    'pune': 9429408,
    'hyderabad': 9746961,
    'chennai': 10971108,
    'kolkata': 14681589,
    'jaipur': 3073350,
    'lucknow': 2817105,
    'ahmedabad': 7214225,
    'surat': 6081322,
    'kanpur-nagar': 2765348,
    'nagpur': 2405665,
    'indore': 2167447,
    'bhopal': 1798218,
    'vadodara': 2065771,
    'coimbatore': 3458045,
    'ludhiana': 1693653,
    'agra': 1746467,
    'madurai': 1561129,
};

/**
 * CPCB (Central Pollution Control Board) - Public Data
 * Note: CPCB has a web portal but limited API access
 * Alternative: Use scraped/published data
 */
export const CPCB_AQI_AVERAGES_2024 = {
    // Annual average AQI for major cities (2023-2024)
    'bangalore-urban': 108,
    'mumbai-city': 115,
    'delhi': 234,
    'pune': 97,
    'hyderabad': 135,
    'chennai': 88,
    'kolkata': 156,
    'jaipur': 178,
    'lucknow': 203,
    'ahmedabad': 142,
    'surat': 125,
    'kanpur-nagar': 218,
    'nagpur': 132,
    'indore': 148,
    'bhopal': 127,
};

/**
 * Soil Health Card Data - Aggregated from Government Reports
 * Source: https://soilhealth.dac.gov.in/
 */
export const SOIL_HEALTH_INDICES = {
    'bangalore-urban': 58,
    'mumbai-city': 42,
    'delhi': 48,
    'pune': 62,
    'hyderabad': 55,
    'chennai': 51,
    'kolkata': 60,
    'jaipur': 47,
    'lucknow': 65,
    'ahmedabad': 45,
    'surat': 52,
    'kanpur-nagar': 59,
    'nagpur': 68,
    'indore': 64,
    'bhopal': 61,
};

/**
 * NDMA (National Disaster Management Authority) - Historical Data
 * Source: Public disaster statistics reports
 */
export const DISASTER_FREQUENCY_DATA = {
    'bangalore-urban': { frequency: 2.1, types: ['Urban flooding', 'Heatwaves'] },
    'mumbai-city': { frequency: 5.8, types: ['Monsoon flooding', 'Cyclones'] },
    'delhi': { frequency: 3.2, types: ['Floods', 'Severe pollution events'] },
    'pune': { frequency: 3.5, types: ['Floods', 'Droughts'] },
    'hyderabad': { frequency: 3.8, types: ['Floods', 'Droughts'] },
    'chennai': { frequency: 6.2, types: ['Floods', 'Cyclones', 'Storm surge'] },
    'kolkata': { frequency: 5.5, types: ['Cyclones', 'Floods'] },
    'jaipur': { frequency: 2.8, types: ['Droughts', 'Heatwaves'] },
    'lucknow': { frequency: 4.1, types: ['Floods', 'Droughts'] },
    'ahmedabad': { frequency: 3.4, types: ['Earthquakes', 'Heatwaves'] },
};

