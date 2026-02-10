/**
 * Oxygen Calculator Tests
 * Tests for oxygen calculation utilities in src/lib/utils/oxygen-calculator.ts
 */

import {
    calculateOxygenRequirements,
    calculateTreeOxygenProduction,
    OxygenCalculationInput,
} from '../oxygen-calculator';
import { ENVIRONMENTAL_CONSTANTS } from '@/lib/constants/environmental';

const { PENALTY_FACTORS } = ENVIRONMENTAL_CONSTANTS;

describe('Oxygen Calculator', () => {
    describe('calculateOxygenRequirements', () => {
        const baseInput: OxygenCalculationInput = {
            district_name: 'Test District',
            population: 100000,
            aqi: 75,
            soil_quality: 70,
            disaster_frequency: 2,
        };

        it('should calculate oxygen requirements for a standard district', () => {
            const result = calculateOxygenRequirements(baseInput);

            expect(result.district_name).toBe('Test District');
            expect(result.population).toBe(100000);
            expect(result.trees_required).toBeGreaterThan(0);
            expect(result.trees_required_hectares).toBeGreaterThan(0);
            expect(result.confidence_level).toBe('high');
        });

        it('should include correct assumptions', () => {
            const result = calculateOxygenRequirements(baseInput);

            expect(result.assumptions).toBeInstanceOf(Array);
            expect(result.assumptions.length).toBeGreaterThanOrEqual(4);
            expect(result.assumptions.some(a => a.includes('human O2 consumption'))).toBe(true);
        });

        it('should include data sources', () => {
            const result = calculateOxygenRequirements(baseInput);

            expect(result.data_sources).toBeInstanceOf(Array);
            expect(result.data_sources.length).toBeGreaterThanOrEqual(3);
            expect(result.data_sources.some(s => s.includes('WHO'))).toBe(true);
        });

        it('should correctly calculate formula breakdown', () => {
            const result = calculateOxygenRequirements(baseInput);
            const breakdown = result.formula_breakdown;

            expect(breakdown.human_o2_demand_liters).toBeGreaterThan(0);
            expect(breakdown.human_o2_demand_kg).toBeGreaterThan(0);
            expect(breakdown.aqi_penalty_factor).toBeGreaterThanOrEqual(1);
            expect(breakdown.soil_degradation_factor).toBeGreaterThanOrEqual(1);
            expect(breakdown.disaster_loss_factor).toBeGreaterThanOrEqual(1);
            expect(breakdown.total_penalty).toBeGreaterThanOrEqual(1);
        });

        describe('AQI Penalty Factors', () => {
            it('should apply no penalty for good AQI (<= 50)', () => {
                const input = { ...baseInput, aqi: 50 };
                const result = calculateOxygenRequirements(input);
                expect(result.formula_breakdown.aqi_penalty_factor).toBe(PENALTY_FACTORS.AQI.GOOD);
            });

            it('should apply moderate penalty for AQI 51-100', () => {
                const input = { ...baseInput, aqi: 75 };
                const result = calculateOxygenRequirements(input);
                expect(result.formula_breakdown.aqi_penalty_factor).toBe(PENALTY_FACTORS.AQI.MODERATE);
            });

            it('should apply sensitive penalty for AQI 101-150', () => {
                const input = { ...baseInput, aqi: 125 };
                const result = calculateOxygenRequirements(input);
                expect(result.formula_breakdown.aqi_penalty_factor).toBe(PENALTY_FACTORS.AQI.SENSITIVE);
            });

            it('should apply unhealthy penalty for AQI 151-200', () => {
                const input = { ...baseInput, aqi: 175 };
                const result = calculateOxygenRequirements(input);
                expect(result.formula_breakdown.aqi_penalty_factor).toBe(PENALTY_FACTORS.AQI.UNHEALTHY);
            });

            it('should apply very unhealthy penalty for AQI 201-300', () => {
                const input = { ...baseInput, aqi: 250 };
                const result = calculateOxygenRequirements(input);
                expect(result.formula_breakdown.aqi_penalty_factor).toBe(PENALTY_FACTORS.AQI.VERY_UNHEALTHY);
            });

            it('should apply hazardous penalty for AQI > 300', () => {
                const input = { ...baseInput, aqi: 350 };
                const result = calculateOxygenRequirements(input);
                expect(result.formula_breakdown.aqi_penalty_factor).toBe(PENALTY_FACTORS.AQI.HAZARDOUS);
            });
        });

        describe('Soil Degradation Factors', () => {
            it('should apply excellent factor for soil quality >= 80', () => {
                const input = { ...baseInput, soil_quality: 85 };
                const result = calculateOxygenRequirements(input);
                expect(result.formula_breakdown.soil_degradation_factor).toBe(PENALTY_FACTORS.SOIL.EXCELLENT);
            });

            it('should apply good factor for soil quality 60-79', () => {
                const input = { ...baseInput, soil_quality: 70 };
                const result = calculateOxygenRequirements(input);
                expect(result.formula_breakdown.soil_degradation_factor).toBe(PENALTY_FACTORS.SOIL.GOOD);
            });

            it('should apply fair factor for soil quality 40-59', () => {
                const input = { ...baseInput, soil_quality: 50 };
                const result = calculateOxygenRequirements(input);
                expect(result.formula_breakdown.soil_degradation_factor).toBe(PENALTY_FACTORS.SOIL.FAIR);
            });

            it('should apply poor factor for soil quality 20-39', () => {
                const input = { ...baseInput, soil_quality: 30 };
                const result = calculateOxygenRequirements(input);
                expect(result.formula_breakdown.soil_degradation_factor).toBe(PENALTY_FACTORS.SOIL.POOR);
            });

            it('should apply degraded factor for soil quality < 20', () => {
                const input = { ...baseInput, soil_quality: 15 };
                const result = calculateOxygenRequirements(input);
                expect(result.formula_breakdown.soil_degradation_factor).toBe(PENALTY_FACTORS.SOIL.DEGRADED);
            });
        });

        describe('Disaster Loss Factors', () => {
            it('should apply low factor for disaster frequency <= 2', () => {
                const input = { ...baseInput, disaster_frequency: 2 };
                const result = calculateOxygenRequirements(input);
                expect(result.formula_breakdown.disaster_loss_factor).toBe(PENALTY_FACTORS.DISASTER.LOW);
            });

            it('should apply medium factor for disaster frequency 3-5', () => {
                const input = { ...baseInput, disaster_frequency: 4 };
                const result = calculateOxygenRequirements(input);
                expect(result.formula_breakdown.disaster_loss_factor).toBe(PENALTY_FACTORS.DISASTER.MEDIUM);
            });

            it('should apply high factor for disaster frequency 6-8', () => {
                const input = { ...baseInput, disaster_frequency: 7 };
                const result = calculateOxygenRequirements(input);
                expect(result.formula_breakdown.disaster_loss_factor).toBe(PENALTY_FACTORS.DISASTER.HIGH);
            });

            it('should apply severe factor for disaster frequency > 8', () => {
                const input = { ...baseInput, disaster_frequency: 10 };
                const result = calculateOxygenRequirements(input);
                expect(result.formula_breakdown.disaster_loss_factor).toBe(PENALTY_FACTORS.DISASTER.SEVERE);
            });
        });

        describe('Confidence Levels', () => {
            it('should return high confidence for valid data', () => {
                const result = calculateOxygenRequirements(baseInput);
                expect(result.confidence_level).toBe('high');
            });

            it('should return medium confidence for slightly out of range data', () => {
                const input = {
                    ...baseInput,
                    population: 500, // Below 1000 threshold
                };
                const result = calculateOxygenRequirements(input);
                expect(result.confidence_level).toBe('medium');
            });

            it('should return low confidence for multiple data issues', () => {
                const input = {
                    ...baseInput,
                    population: 500, // Issue 1
                    aqi: 450, // Issue 2
                    soil_quality: 15, // Issue 3
                };
                const result = calculateOxygenRequirements(input);
                expect(result.confidence_level).toBe('low');
            });

            it('should consider extreme population as an issue', () => {
                const input = {
                    ...baseInput,
                    population: 25000000, // Above 20M threshold
                };
                const result = calculateOxygenRequirements(input);
                expect(['medium', 'low']).toContain(result.confidence_level);
            });
        });

        describe('Edge Cases', () => {
            it('should handle zero population', () => {
                const input = { ...baseInput, population: 0 };
                const result = calculateOxygenRequirements(input);
                expect(result.trees_required).toBe(0);
            });

            it('should handle very large population', () => {
                const input = { ...baseInput, population: 10000000 };
                const result = calculateOxygenRequirements(input);
                expect(result.trees_required).toBeGreaterThan(0);
            });

            it('should handle zero AQI', () => {
                const input = { ...baseInput, aqi: 0 };
                const result = calculateOxygenRequirements(input);
                expect(result.formula_breakdown.aqi_penalty_factor).toBe(1.0);
            });

            it('should handle minimum soil quality', () => {
                const input = { ...baseInput, soil_quality: 0 };
                const result = calculateOxygenRequirements(input);
                // Minimum tree oxygen production should be 70%
                expect(result.formula_breakdown.soil_adjusted_tree_supply_kg).toBeCloseTo(
                    ENVIRONMENTAL_CONSTANTS.OXYGEN.PRODUCTION_PER_TREE_KG_YEAR * 0.7,
                    1
                );
            });

            it('should calculate hectares correctly based on trees per hectare', () => {
                const input = { ...baseInput };
                const result = calculateOxygenRequirements(input);
                const expectedHectares = result.trees_required / ENVIRONMENTAL_CONSTANTS.OXYGEN.TREES_PER_HECTARE;
                expect(result.trees_required_hectares).toBeCloseTo(expectedHectares, 1);
            });
        });

        describe('Calculation Consistency', () => {
            it('should increase trees required with higher population', () => {
                const result1 = calculateOxygenRequirements({ ...baseInput, population: 50000 });
                const result2 = calculateOxygenRequirements({ ...baseInput, population: 100000 });
                expect(result2.trees_required).toBeGreaterThan(result1.trees_required);
            });

            it('should increase trees required with higher AQI (worse air)', () => {
                const result1 = calculateOxygenRequirements({ ...baseInput, aqi: 50 });
                const result2 = calculateOxygenRequirements({ ...baseInput, aqi: 300 });
                expect(result2.trees_required).toBeGreaterThan(result1.trees_required);
            });

            it('should increase trees required with lower soil quality', () => {
                const result1 = calculateOxygenRequirements({ ...baseInput, soil_quality: 90 });
                const result2 = calculateOxygenRequirements({ ...baseInput, soil_quality: 30 });
                expect(result2.trees_required).toBeGreaterThan(result1.trees_required);
            });

            it('should increase trees required with higher disaster frequency', () => {
                const result1 = calculateOxygenRequirements({ ...baseInput, disaster_frequency: 1 });
                const result2 = calculateOxygenRequirements({ ...baseInput, disaster_frequency: 10 });
                expect(result2.trees_required).toBeGreaterThan(result1.trees_required);
            });
        });
    });

    describe('calculateTreeOxygenProduction', () => {
        it('should calculate oxygen production for mature trees', () => {
            const result = calculateTreeOxygenProduction(100, 10);

            expect(result.trees).toBe(100);
            expect(result.age).toBe(10);
            expect(result.age_factor).toBe(1.0);
            expect(result.oxygen_per_tree_kg_per_year).toBe(
                ENVIRONMENTAL_CONSTANTS.OXYGEN.PRODUCTION_PER_TREE_KG_YEAR
            );
            expect(result.total_oxygen_kg_per_year).toBe(
                100 * ENVIRONMENTAL_CONSTANTS.OXYGEN.PRODUCTION_PER_TREE_KG_YEAR
            );
        });

        it('should apply age factor for young trees', () => {
            const result = calculateTreeOxygenProduction(100, 5);

            expect(result.age_factor).toBe(0.5);
            expect(result.oxygen_per_tree_kg_per_year).toBe(
                ENVIRONMENTAL_CONSTANTS.OXYGEN.PRODUCTION_PER_TREE_KG_YEAR * 0.5
            );
        });

        it('should cap age factor at 1.0 for trees older than 10 years', () => {
            const result = calculateTreeOxygenProduction(100, 20);

            expect(result.age_factor).toBe(1.0);
        });

        it('should handle zero trees', () => {
            const result = calculateTreeOxygenProduction(0, 10);

            expect(result.total_oxygen_kg_per_year).toBe(0);
        });

        it('should handle zero age (newly planted)', () => {
            const result = calculateTreeOxygenProduction(100, 0);

            expect(result.age_factor).toBe(0);
            expect(result.total_oxygen_kg_per_year).toBe(0);
        });

        it('should handle very young trees (1 year)', () => {
            const result = calculateTreeOxygenProduction(100, 1);

            expect(result.age_factor).toBe(0.1);
            expect(result.oxygen_per_tree_kg_per_year).toBeCloseTo(
                ENVIRONMENTAL_CONSTANTS.OXYGEN.PRODUCTION_PER_TREE_KG_YEAR * 0.1,
                1
            );
        });

        it('should round results to 2 decimal places', () => {
            const result = calculateTreeOxygenProduction(123, 7);

            const decimalPlaces = (num: number) => {
                const str = num.toString();
                if (str.includes('.')) {
                    return str.split('.')[1].length;
                }
                return 0;
            };

            expect(decimalPlaces(result.oxygen_per_tree_kg_per_year)).toBeLessThanOrEqual(2);
            expect(decimalPlaces(result.total_oxygen_kg_per_year)).toBeLessThanOrEqual(2);
            expect(decimalPlaces(result.age_factor)).toBeLessThanOrEqual(2);
        });

        it('should scale linearly with tree count', () => {
            const result1 = calculateTreeOxygenProduction(50, 10);
            const result2 = calculateTreeOxygenProduction(100, 10);

            expect(result2.total_oxygen_kg_per_year).toBe(result1.total_oxygen_kg_per_year * 2);
        });
    });
});
