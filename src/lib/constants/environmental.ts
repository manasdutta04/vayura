/**
 * Environmental and Scientific Constants
 * Centralized configuration for scientific calculations used across the application.
 * Sources: USDA Forest Service, EPA, IPCC, WHO
 */

export const ENVIRONMENTAL_CONSTANTS = {
    CO2: {
        // Average CO2 absorbed per mature tree per year (kg)
        ABSORPTION_PER_TREE_KG_YEAR: 21,
        // Average car emissions per year (kg)
        EMISSIONS_PER_CAR_KG_YEAR: 4600,
        // Short-haul flight emissions per person (kg)
        EMISSIONS_PER_FLIGHT_KG: 90,
        // CO2 saved per tonne of waste recycled (kg) - Used for comparison metrics
        SAVED_PER_TONNE_WASTE_RECYCLED_KG: 907,
    },

    OXYGEN: {
        // Average oxygen production per mature tree per year (kg)
        PRODUCTION_PER_TREE_KG_YEAR: 110,
        // Average human oxygen consumption (Liters/day)
        HUMAN_CONSUMPTION_LITERS_DAY: 550,
        // Conversion factor from Liters of O2 to Kg of O2 (at STP)
        LITERS_TO_KG_CONVERSION: 1.429 / 1000,
        // Days considered in a year for annual calculations
        DAYS_PER_YEAR: 365,
        // Standard plantation density (trees per hectare)
        TREES_PER_HECTARE: 400,
    },

    TREES: {
        // Default Tree Estimates
        DEFAULT_LIFESPAN_YEARS: 50,

        // Species-specific data (O2 in kg/year, Lifespan in years)
        SPECIES_DATA: {
            'mango': { o2: 140, lifespan: 80 },   // Mangifera indica
            'neem': { o2: 260, lifespan: 200 },   // Azadirachta indica
            'peepal': { o2: 380, lifespan: 1000 }, // Ficus religiosa
            'banyan': { o2: 400, lifespan: 250 },  // Ficus benghalensis
            'arjun': { o2: 240, lifespan: 150 },   // Terminalia arjuna
            'amla': { o2: 125, lifespan: 60 },     // Phyllanthus emblica
            'jamun': { o2: 130, lifespan: 100 },   // Syzygium cumini
            'guava': { o2: 80, lifespan: 40 },     // Psidium guajava
            'teak': { o2: 180, lifespan: 80 },     // Tectona grandis
            'bamboo': { o2: 300, lifespan: 10 },   // Bambusoideae
            'ashoka': { o2: 150, lifespan: 60 },   // Saraca asoca
        } as Record<string, { o2: number; lifespan: number }>,
    },

    PENALTY_FACTORS: {
        AQI: {
            GOOD: 1.0,           // 0-50
            MODERATE: 1.05,      // 51-100
            SENSITIVE: 1.15,     // 101-150
            UNHEALTHY: 1.30,     // 151-200
            VERY_UNHEALTHY: 1.50, // 201-300
            HAZARDOUS: 1.75      // 300+
        },
        SOIL: {
            EXCELLENT: 1.0,      // >= 80%
            GOOD: 1.10,          // 60-79%
            FAIR: 1.25,          // 40-59%
            POOR: 1.40,          // 20-39%
            DEGRADED: 1.60       // < 20%
        },
        DISASTER: {
            NONE: 1.0,          // 0
            LOW: 1.05,          // 1-2
            MEDIUM: 1.15,       // 3-5
            HIGH: 1.30,         // 6-10
            SEVERE: 1.50        // 10+
        }
    }
};
