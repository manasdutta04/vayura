/**
 * Gemini AI-Powered Data Fetcher
 * Uses Google Gemini API (free tier) to fetch and structure district data
 * from various sources including government portals and public information
 */

import { TreeRecommendation } from '../types';

interface GeminiConfig {
    apiKey: string;
    model: string;
}

const config: GeminiConfig = {
    apiKey: process.env.GEMINI_API_KEY || '',
    model: 'gemini-2.5-flash', // Current free tier model
};

interface DistrictDataRequest {
    districtName: string;
    stateName: string;
    dataType: 'population' | 'air_quality' | 'soil_quality' | 'disasters' | 'recommendations' | 'all';
}

interface GeminiDistrictData {
    population?: number;
    populationYear?: number;
    aqi?: number;
    pm25?: number;
    soilQuality?: number;
    disasterFrequency?: number;
    commonDisasters?: string[];
    recommendations?: TreeRecommendation[];
    sources?: string[];
    confidence?: 'high' | 'medium' | 'low';
}

/**
 * Fetch district data using Gemini AI
 */
export async function fetchDistrictDataWithGemini(
    request: DistrictDataRequest
): Promise<GeminiDistrictData | null> {
    if (!config.apiKey) {
        console.warn('GEMINI_API_KEY not configured');
        return null;
    }

    try {
        const prompt = buildPrompt(request);

        // Use v1beta API for gemini-2.5-flash
        const apiVersion = 'v1beta';
        const modelName = 'gemini-2.5-flash';
        const response = await fetch(
            `https://generativelanguage.googleapis.com/${apiVersion}/models/${modelName}:generateContent?key=${config.apiKey}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: prompt
                        }]
                    }],
                    generationConfig: {
                        temperature: 0.1, // Low temperature for factual data
                        topK: 1,
                        topP: 1,
                        maxOutputTokens: 2048,
                    },
                }),
                next: { revalidate: 86400 } // Cache for 24 hours
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            let errorData;
            try {
                errorData = JSON.parse(errorText);
            } catch {
                errorData = { error: errorText };
            }
            console.error('Gemini API error:', response.status, errorData);

            // If model not found, the API will fallback to other data sources
            // Don't throw, just return null to allow fallback
            return null;
        }

        const data = await response.json();
        const text = data.candidates[0]?.content?.parts[0]?.text;

        if (!text) {
            console.error('Gemini response missing text candidate');
            return null;
        }

        // Parse JSON response from Gemini
        const result = parseGeminiResponse(text);

        return result;
    } catch (error) {
        console.error('Error fetching data with Gemini:', error);
        return null;
    }
}

/**
 * Build prompt for Gemini based on data type
 */
function buildPrompt(request: DistrictDataRequest): string {
    const { districtName, stateName, dataType } = request;

    const basePrompt = `You are an environmental data expert for India. Provide accurate data for ${districtName} district in ${stateName} state.
    
    CRITICAL INSTRUCTIONS:
    - Prefer official sources (CPCB, Census, NDMA, State Pollution Control Boards).
    - If exact real-time data is missing, calculate a scientific estimate based on:
      1. Nearby industrial clusters or urban density (for AQI/Soil).
      2. Proximity to rivers/hills (for Disasters).
      3. Historical data trends for this specific region.
    - NEVER return null or empty data. Always generate a realistic, specific estimate.
    - Return data in STRICT JSON format.
    - Include "Estimate (based on local factors)" in the source list if estimated.
    
    `;

    const prompts: Record<string, string> = {
        population: `${basePrompt}
    Task: Provide population data for ${districtName}.
    
    Return JSON:
    {
      "population": <number, e.g. 1500000>,
      "populationYear": <year, e.g. 2024>,
      "sources": ["source name"],
      "confidence": "high|medium|low"
    }`,

        air_quality: `${basePrompt}
    Task: Provide Air Quality Index (AQI) for ${districtName}.
    
    Return JSON:
    {
      "aqi": <number, 0-500>,
      "pm25": <number>,
      "sources": ["source name"],
      "confidence": "high|medium|low"
    }`,

        soil_quality: `${basePrompt}
    Task: Provide soil quality index (0-100) for ${districtName}.
    Consider: 100=pristine forest, 50=average agriculture, 0=degraded/urban.
    
    Return JSON:
    {
      "soilQuality": <number, 0-100>,
      "sources": ["source name"],
      "confidence": "high|medium|low"
    }`,

        disasters: `${basePrompt}
    Task: Provide disaster risk data for ${districtName}.
    Frequency scale: 0 (safe) to 10 (highly prone).
    
    Return JSON:
    {
      "disasterFrequency": <number, 0-10>,
      "commonDisasters": ["Flood", "Drought", "Cyclone", "Heatwave"],
      "sources": ["source name"],
      "confidence": "high|medium|low"
    }`,

        recommendations: `${basePrompt}
    Task: Recommend the top 3-5 tree species for plantation in ${districtName}, ${stateName}.
    Consider local climate (temp/rainfall/humidity), soil type, native status, and oxygen efficiency.
    
    Return JSON:
    {
      "recommendations": [
        {
          "speciesName": "Common Name",
          "scientificName": "Scientific Name",
          "suitabilityScore": <0-100>,
          "survivalProbability": <0-100>,
          "oxygenEfficiency": "high|medium|low",
          "soilSuitability": "Brief description of soil needs",
          "climateSuitability": "Brief description of climate needs",
          "nativeStatus": "native|introduced|endemic",
          "description": "Short explanation of why this tree is good for this district"
        }
      ],
      "sources": ["forestry/ecological research sources"],
      "confidence": "high|medium|low"
    }`,

        all: `${basePrompt}
    Task: Provide comprehensive environmental data and tree recommendations for ${districtName}.
    
    Return JSON:
    {
      "population": <number>,
      "populationYear": <year>,
      "aqi": <number>,
      "pm25": <number>,
      "soilQuality": <number>,
      "disasterFrequency": <number>,
      "commonDisasters": ["type1", "type2"],
      "recommendations": [
        {
          "speciesName": "Name",
          "scientificName": "Scientific",
          "suitabilityScore": 90,
          "survivalProbability": 85,
          "oxygenEfficiency": "high",
          "soilSuitability": "...",
          "climateSuitability": "...",
          "nativeStatus": "native",
          "description": "..."
        }
      ],
      "sources": ["source1"],
      "confidence": "high|medium|low"
    }`,
    };

    return prompts[dataType] || prompts.all;
}

/**
 * Parse Gemini's JSON response
 */
function parseGeminiResponse(text: string): GeminiDistrictData | null {
    try {
        // Extract JSON from markdown code blocks if present
        const jsonMatch = text.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/) ||
            text.match(/(\{[\s\S]*\})/);

        if (!jsonMatch) {
            console.error('No JSON found in Gemini response');
            return null;
        }

        const jsonStr = jsonMatch[1];
        const parsed = JSON.parse(jsonStr);

        return {
            population: parsed.population,
            populationYear: parsed.populationYear,
            aqi: parsed.aqi,
            pm25: parsed.pm25,
            soilQuality: parsed.soilQuality,
            disasterFrequency: parsed.disasterFrequency,
            commonDisasters: parsed.commonDisasters,
            recommendations: parsed.recommendations,
            sources: parsed.sources,
            confidence: parsed.confidence || 'medium',
        };
    } catch (error) {
        console.error('Error parsing Gemini response:', error);
        console.error('Response text:', text);
        return null;
    }
}

/**
 * Fetch all district data at once using Gemini
 */
export async function fetchCompleteDistrictData(
    districtName: string,
    stateName: string
): Promise<GeminiDistrictData | null> {
    return fetchDistrictDataWithGemini({
        districtName,
        stateName,
        dataType: 'all',
    });
}

/**
 * Fetch plantation recommendations for a district
 */
export async function fetchPlantationRecommendations(
    districtName: string,
    stateName: string
): Promise<TreeRecommendation[]> {
    if (!config.apiKey) {
        console.warn('GEMINI_API_KEY not configured, returning mock recommendations');
        return getMockRecommendations(districtName, stateName);
    }

    const data = await fetchDistrictDataWithGemini({
        districtName,
        stateName,
        dataType: 'recommendations',
    });

    return data?.recommendations || getMockRecommendations(districtName, stateName);
}

/**
 * Fallback mock recommendations for development/testing
 */
function getMockRecommendations(district: string, state: string): TreeRecommendation[] {
    return [
        {
            speciesName: "Neem",
            scientificName: "Azadirachta indica",
            suitabilityScore: 95,
            survivalProbability: 90,
            oxygenEfficiency: "high",
            soilSuitability: "Well-drained sandy or loamy soil",
            climateSuitability: "Hot and dry climate, drought resistant",
            nativeStatus: "native",
            description: `Neem is exceptionally well-suited for ${district}. It is a hardy tree that provides excellent shade and has significant medicinal properties while being highly efficient at producing oxygen.`
        },
        {
            speciesName: "Banyan",
            scientificName: "Ficus benghalensis",
            suitabilityScore: 88,
            survivalProbability: 85,
            oxygenEfficiency: "high",
            soilSuitability: "Adaptable to various soil types",
            climateSuitability: "Tropical and subtropical climate",
            nativeStatus: "native",
            description: "The Banyan tree is known for its massive canopy and ability to produce large amounts of oxygen. It is a keystone species that supports local biodiversity."
        },
        {
            speciesName: "Peepal",
            scientificName: "Ficus religiosa",
            suitabilityScore: 92,
            survivalProbability: 88,
            oxygenEfficiency: "high",
            soilSuitability: "Deep, well-drained soil",
            climateSuitability: "Wide range of temperatures",
            nativeStatus: "native",
            description: "Peepal is unique for its ability to release oxygen even at night (Crassulacean Acid Metabolism). It is culturally significant and highly resilient."
        }
    ];
}

/**
 * Validate and normalize Gemini data
 */
export function validateGeminiData(data: GeminiDistrictData): {
    valid: boolean;
    errors: string[];
} {
    const errors: string[] = [];

    // Validate population
    if (data.population !== undefined) {
        if (data.population < 1000 || data.population > 50000000) {
            errors.push('Population out of reasonable range');
        }
    }

    // Validate AQI
    if (data.aqi !== undefined) {
        if (data.aqi < 0 || data.aqi > 500) {
            errors.push('AQI out of valid range (0-500)');
        }
    }

    // Validate soil quality
    if (data.soilQuality !== undefined) {
        if (data.soilQuality < 0 || data.soilQuality > 100) {
            errors.push('Soil quality out of valid range (0-100)');
        }
    }

    // Validate disaster frequency
    if (data.disasterFrequency !== undefined) {
        if (data.disasterFrequency < 0 || data.disasterFrequency > 20) {
            errors.push('Disaster frequency out of reasonable range');
        }
    }

    // Validate recommendations
    if (data.recommendations !== undefined) {
        if (!Array.isArray(data.recommendations)) {
            errors.push('Recommendations must be an array');
        } else if (data.recommendations.length > 0) {
            data.recommendations.forEach((rec, index) => {
                if (!rec.speciesName) errors.push(`Recommendation ${index} missing speciesName`);
                if (typeof rec.survivalProbability !== 'number') errors.push(`Recommendation ${index} missing survivalProbability`);
            });
        }
    }

    return {
        valid: errors.length === 0,
        errors,
    };
}

