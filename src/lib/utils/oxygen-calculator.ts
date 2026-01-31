/**
 * Oxygen Calculation Utilities
 * Implements the same logic as the Python microservice for fallback when service is unavailable
 */

// Constants based on scientific research
const HUMAN_O2_CONSUMPTION_LITERS_PER_DAY = 550; // Average adult oxygen consumption
const LITERS_TO_KG_O2_CONVERSION = 1.429 / 1000; // Oxygen density at STP (kg/L)
const DAYS_PER_YEAR = 365;
const BASE_TREE_O2_SUPPLY_KG_PER_YEAR = 110; // Mature tree oxygen production
const TREES_PER_HECTARE = 400; // Typical plantation density

export interface OxygenCalculationInput {
    district_name: string;
    population: number;
    aqi: number;
    soil_quality: number;
    disaster_frequency: number;
}

export interface FormulaBreakdown {
    human_o2_demand_liters: number;
    human_o2_demand_kg: number;
    aqi_penalty_factor: number;
    soil_degradation_factor: number;
    disaster_loss_factor: number;
    total_penalty: number;
    adjusted_o2_demand_kg: number;
    per_tree_o2_supply_kg: number;
    soil_adjusted_tree_supply_kg: number;
}

export interface OxygenCalculation {
    district_name: string;
    population: number;
    human_o2_demand_kg_per_year: number;
    penalty_adjusted_demand_kg_per_year: number;
    per_tree_o2_supply_kg_per_year: number;
    oxygen_deficit_kg_per_year: number;
    trees_required: number;
    trees_required_hectares: number;
    formula_breakdown: FormulaBreakdown;
    assumptions: string[];
    confidence_level: 'high' | 'medium' | 'low';
    data_sources: string[];
}

function calculateAQIPenaltyFactor(aqi: number): number {
    /**
     * Calculate oxygen demand penalty based on AQI.
     * Higher AQI = more pollution = more health stress = higher O2 demand
     */
    if (aqi <= 50) return 1.0;
    if (aqi <= 100) return 1.05;
    if (aqi <= 150) return 1.15;
    if (aqi <= 200) return 1.30;
    if (aqi <= 300) return 1.50;
    return 1.75;
}

function calculateSoilDegradationFactor(soilQuality: number): number {
    /**
     * Calculate impact of soil degradation on oxygen balance.
     * Poor soil = less vegetation = less natural O2 production = higher effective demand
     */
    if (soilQuality >= 80) return 1.0;
    if (soilQuality >= 60) return 1.10;
    if (soilQuality >= 40) return 1.25;
    if (soilQuality >= 20) return 1.40;
    return 1.60;
}

function calculateDisasterLossFactor(disasterFrequency: number): number {
    /**
     * Calculate environmental loss due to disasters.
     * Frequent disasters = vegetation loss = reduced oxygen sources
     */
    if (disasterFrequency <= 2) return 1.05;
    if (disasterFrequency <= 5) return 1.15;
    if (disasterFrequency <= 8) return 1.30;
    return 1.50;
}

function calculateSoilTreeAdjustment(soilQuality: number): number {
    /**
     * Adjust tree oxygen production based on soil quality.
     * Better soil = healthier trees = more oxygen production
     */
    // Linear scaling: 100% soil quality = 100% O2 production
    // 50% soil quality = 70% O2 production (minimum viable)
    return Math.max(0.7, soilQuality / 100);
}

function determineConfidenceLevel(data: OxygenCalculationInput): 'high' | 'medium' | 'low' {
    /**
     * Determine confidence level based on data quality and ranges.
     */
    let issues = 0;
    
    // Check for typical population ranges (1000 - 20M for districts)
    if (data.population < 1000 || data.population > 20_000_000) {
        issues += 1;
    }
    
    // Check AQI (typical Indian cities: 50-300)
    if (data.aqi > 400) {
        issues += 1;
    }
    
    // Check soil quality
    if (data.soil_quality < 20) {
        issues += 1;
    }
    
    // Check disaster frequency
    if (data.disaster_frequency > 9) {
        issues += 1;
    }
    
    if (issues === 0) return 'high';
    if (issues <= 2) return 'medium';
    return 'low';
}

export function calculateOxygenRequirements(data: OxygenCalculationInput): OxygenCalculation {
    /**
     * Main calculation function for district oxygen demand and tree requirements.
     * 
     * Formula:
     * 1. Base human O2 demand = population × daily O2 consumption × days/year
     * 2. Apply penalty factors (AQI, soil, disasters)
     * 3. Calculate tree O2 supply (adjusted for soil quality)
     * 4. Determine deficit and trees needed
     */
    
    // Step 1: Calculate base human oxygen demand
    const humanO2LitersPerDay = data.population * HUMAN_O2_CONSUMPTION_LITERS_PER_DAY;
    const humanO2LitersPerYear = humanO2LitersPerDay * DAYS_PER_YEAR;
    const humanO2KgPerYear = humanO2LitersPerYear * LITERS_TO_KG_O2_CONVERSION;
    
    // Step 2: Calculate penalty factors
    const aqiFactor = calculateAQIPenaltyFactor(data.aqi);
    const soilFactor = calculateSoilDegradationFactor(data.soil_quality);
    const disasterFactor = calculateDisasterLossFactor(data.disaster_frequency);
    
    // Combined penalty (multiplicative)
    const totalPenalty = aqiFactor * soilFactor * disasterFactor;
    
    // Adjusted oxygen demand
    const adjustedO2Demand = humanO2KgPerYear * totalPenalty;
    
    // Step 3: Calculate tree oxygen supply (adjusted for soil)
    const soilAdjustment = calculateSoilTreeAdjustment(data.soil_quality);
    const adjustedTreeO2Supply = BASE_TREE_O2_SUPPLY_KG_PER_YEAR * soilAdjustment;
    
    // Step 4: Calculate deficit and trees required
    // Note: We assume zero current tree coverage for conservative estimate
    const oxygenDeficit = adjustedO2Demand;
    const treesRequired = Math.ceil(oxygenDeficit / adjustedTreeO2Supply);
    const treesRequiredHectares = treesRequired / TREES_PER_HECTARE;
    
    // Determine confidence level
    const confidenceLevel = determineConfidenceLevel(data);
    
    // Create formula breakdown for transparency
    const formulaBreakdown: FormulaBreakdown = {
        human_o2_demand_liters: humanO2LitersPerYear,
        human_o2_demand_kg: humanO2KgPerYear,
        aqi_penalty_factor: aqiFactor,
        soil_degradation_factor: soilFactor,
        disaster_loss_factor: disasterFactor,
        total_penalty: totalPenalty,
        adjusted_o2_demand_kg: adjustedO2Demand,
        per_tree_o2_supply_kg: BASE_TREE_O2_SUPPLY_KG_PER_YEAR,
        soil_adjusted_tree_supply_kg: adjustedTreeO2Supply,
    };
    
    // Build assumptions list
    const assumptions = [
        `Average human O2 consumption: ${HUMAN_O2_CONSUMPTION_LITERS_PER_DAY} L/day`,
        `Mature tree O2 production: ${BASE_TREE_O2_SUPPLY_KG_PER_YEAR} kg/year`,
        'Calculations assume no existing tree coverage (conservative estimate)',
        'Tree plantation density: 400 trees per hectare',
        'O2 demand penalties based on AQI, soil quality, and disaster frequency',
    ];
    
    // Data sources
    const dataSources = [
        'WHO: Human oxygen consumption standards',
        'USDA Forest Service: Tree oxygen production research',
        'EPA: Air Quality Index categories',
    ];
    
    return {
        district_name: data.district_name,
        population: data.population,
        human_o2_demand_kg_per_year: Math.round(humanO2KgPerYear * 100) / 100,
        penalty_adjusted_demand_kg_per_year: Math.round(adjustedO2Demand * 100) / 100,
        per_tree_o2_supply_kg_per_year: Math.round(adjustedTreeO2Supply * 100) / 100,
        oxygen_deficit_kg_per_year: Math.round(oxygenDeficit * 100) / 100,
        trees_required: treesRequired,
        trees_required_hectares: Math.round(treesRequiredHectares * 100) / 100,
        formula_breakdown: formulaBreakdown,
        assumptions,
        confidence_level: confidenceLevel,
        data_sources: dataSources,
    };
}

/**
 * Simple calculation for oxygen production from trees
 * Used by oxygen calculator service for quick estimates
 * 
 * @param trees - Number of trees
 * @param age - Average age of trees in years
 * @returns Oxygen production data
 */
export function calculateTreeOxygenProduction(trees: number, age: number) {
    // Age factor: trees reach full production capacity at 10+ years
    const ageFactor = Math.min(age / 10, 1);
    const oxygenPerTree = BASE_TREE_O2_SUPPLY_KG_PER_YEAR * ageFactor;
    const totalOxygen = trees * oxygenPerTree;

    return {
        trees,
        age,
        oxygen_per_tree_kg_per_year: Math.round(oxygenPerTree * 100) / 100,
        total_oxygen_kg_per_year: Math.round(totalOxygen * 100) / 100,
        age_factor: Math.round(ageFactor * 100) / 100,
    };
}

