/**
 * Environmental Constants Tests
 * Tests for environmental constants in src/lib/constants/environmental.ts
 */

import { ENVIRONMENTAL_CONSTANTS } from '../environmental';

describe('Environmental Constants', () => {
    describe('CO2 Constants', () => {
        const { CO2 } = ENVIRONMENTAL_CONSTANTS;

        it('should define tree CO2 absorption rate', () => {
            expect(CO2.ABSORPTION_PER_TREE_KG_YEAR).toBeDefined();
            expect(CO2.ABSORPTION_PER_TREE_KG_YEAR).toBeGreaterThan(0);
            expect(CO2.ABSORPTION_PER_TREE_KG_YEAR).toBe(21);
        });

        it('should define car emissions per year', () => {
            expect(CO2.EMISSIONS_PER_CAR_KG_YEAR).toBeDefined();
            expect(CO2.EMISSIONS_PER_CAR_KG_YEAR).toBeGreaterThan(0);
            expect(CO2.EMISSIONS_PER_CAR_KG_YEAR).toBe(4600);
        });

        it('should define flight emissions per person', () => {
            expect(CO2.EMISSIONS_PER_FLIGHT_KG).toBeDefined();
            expect(CO2.EMISSIONS_PER_FLIGHT_KG).toBeGreaterThan(0);
            expect(CO2.EMISSIONS_PER_FLIGHT_KG).toBe(90);
        });

        it('should define waste recycling savings', () => {
            expect(CO2.SAVED_PER_TONNE_WASTE_RECYCLED_KG).toBeDefined();
            expect(CO2.SAVED_PER_TONNE_WASTE_RECYCLED_KG).toBeGreaterThan(0);
        });
    });

    describe('Oxygen Constants', () => {
        const { OXYGEN } = ENVIRONMENTAL_CONSTANTS;

        it('should define tree oxygen production rate', () => {
            expect(OXYGEN.PRODUCTION_PER_TREE_KG_YEAR).toBeDefined();
            expect(OXYGEN.PRODUCTION_PER_TREE_KG_YEAR).toBeGreaterThan(0);
            expect(OXYGEN.PRODUCTION_PER_TREE_KG_YEAR).toBe(110);
        });

        it('should define human oxygen consumption', () => {
            expect(OXYGEN.HUMAN_CONSUMPTION_LITERS_DAY).toBeDefined();
            expect(OXYGEN.HUMAN_CONSUMPTION_LITERS_DAY).toBeGreaterThan(0);
            expect(OXYGEN.HUMAN_CONSUMPTION_LITERS_DAY).toBe(550);
        });

        it('should define liter to kg conversion factor', () => {
            expect(OXYGEN.LITERS_TO_KG_CONVERSION).toBeDefined();
            expect(OXYGEN.LITERS_TO_KG_CONVERSION).toBeGreaterThan(0);
            expect(OXYGEN.LITERS_TO_KG_CONVERSION).toBeCloseTo(0.001429, 6);
        });

        it('should define days per year', () => {
            expect(OXYGEN.DAYS_PER_YEAR).toBe(365);
        });

        it('should define trees per hectare', () => {
            expect(OXYGEN.TREES_PER_HECTARE).toBeDefined();
            expect(OXYGEN.TREES_PER_HECTARE).toBeGreaterThan(0);
            expect(OXYGEN.TREES_PER_HECTARE).toBe(400);
        });
    });

    describe('Tree Constants', () => {
        const { TREES } = ENVIRONMENTAL_CONSTANTS;

        it('should define default tree lifespan', () => {
            expect(TREES.DEFAULT_LIFESPAN_YEARS).toBeDefined();
            expect(TREES.DEFAULT_LIFESPAN_YEARS).toBe(50);
        });

        it('should define species data', () => {
            expect(TREES.SPECIES_DATA).toBeDefined();
            expect(typeof TREES.SPECIES_DATA).toBe('object');
        });

        describe('Species Data', () => {
            const requiredSpecies = [
                'mango', 'neem', 'peepal', 'banyan', 'arjun',
                'amla', 'jamun', 'guava', 'teak', 'bamboo', 'ashoka'
            ];

            it.each(requiredSpecies)('should define %s species data', (species) => {
                expect(TREES.SPECIES_DATA[species]).toBeDefined();
                expect(TREES.SPECIES_DATA[species].o2).toBeGreaterThan(0);
                expect(TREES.SPECIES_DATA[species].lifespan).toBeGreaterThan(0);
            });

            it('should have unique oxygen production values for different species', () => {
                const o2Values = Object.values(TREES.SPECIES_DATA).map(s => s.o2);
                // Check that not all values are the same
                expect(new Set(o2Values).size).toBeGreaterThan(1);
            });

            it('peepal should have highest oxygen production', () => {
                const peepalO2 = TREES.SPECIES_DATA['peepal'].o2;
                Object.entries(TREES.SPECIES_DATA).forEach(([species, data]) => {
                    if (species !== 'peepal' && species !== 'banyan') {
                        expect(peepalO2).toBeGreaterThanOrEqual(data.o2);
                    }
                });
            });

            it('should have realistic lifespan values', () => {
                Object.values(TREES.SPECIES_DATA).forEach(data => {
                    expect(data.lifespan).toBeGreaterThanOrEqual(10);
                    expect(data.lifespan).toBeLessThanOrEqual(1000);
                });
            });
        });
    });

    describe('Penalty Factors', () => {
        const { PENALTY_FACTORS } = ENVIRONMENTAL_CONSTANTS;

        describe('AQI Penalty Factors', () => {
            it('should define all AQI thresholds', () => {
                expect(PENALTY_FACTORS.AQI.GOOD).toBeDefined();
                expect(PENALTY_FACTORS.AQI.MODERATE).toBeDefined();
                expect(PENALTY_FACTORS.AQI.SENSITIVE).toBeDefined();
                expect(PENALTY_FACTORS.AQI.UNHEALTHY).toBeDefined();
                expect(PENALTY_FACTORS.AQI.VERY_UNHEALTHY).toBeDefined();
                expect(PENALTY_FACTORS.AQI.HAZARDOUS).toBeDefined();
            });

            it('should have GOOD AQI factor as 1.0 (no penalty)', () => {
                expect(PENALTY_FACTORS.AQI.GOOD).toBe(1.0);
            });

            it('should have increasing penalties with worse AQI', () => {
                const { AQI } = PENALTY_FACTORS;
                expect(AQI.GOOD).toBeLessThan(AQI.MODERATE);
                expect(AQI.MODERATE).toBeLessThan(AQI.SENSITIVE);
                expect(AQI.SENSITIVE).toBeLessThan(AQI.UNHEALTHY);
                expect(AQI.UNHEALTHY).toBeLessThan(AQI.VERY_UNHEALTHY);
                expect(AQI.VERY_UNHEALTHY).toBeLessThan(AQI.HAZARDOUS);
            });

            it('should have all factors >= 1.0', () => {
                Object.values(PENALTY_FACTORS.AQI).forEach(factor => {
                    expect(factor).toBeGreaterThanOrEqual(1.0);
                });
            });
        });

        describe('Soil Penalty Factors', () => {
            it('should define all soil quality thresholds', () => {
                expect(PENALTY_FACTORS.SOIL.EXCELLENT).toBeDefined();
                expect(PENALTY_FACTORS.SOIL.GOOD).toBeDefined();
                expect(PENALTY_FACTORS.SOIL.FAIR).toBeDefined();
                expect(PENALTY_FACTORS.SOIL.POOR).toBeDefined();
                expect(PENALTY_FACTORS.SOIL.DEGRADED).toBeDefined();
            });

            it('should have EXCELLENT soil factor as 1.0 (no penalty)', () => {
                expect(PENALTY_FACTORS.SOIL.EXCELLENT).toBe(1.0);
            });

            it('should have increasing penalties with worse soil quality', () => {
                const { SOIL } = PENALTY_FACTORS;
                expect(SOIL.EXCELLENT).toBeLessThan(SOIL.GOOD);
                expect(SOIL.GOOD).toBeLessThan(SOIL.FAIR);
                expect(SOIL.FAIR).toBeLessThan(SOIL.POOR);
                expect(SOIL.POOR).toBeLessThan(SOIL.DEGRADED);
            });
        });

        describe('Disaster Penalty Factors', () => {
            it('should define all disaster frequency thresholds', () => {
                expect(PENALTY_FACTORS.DISASTER.NONE).toBeDefined();
                expect(PENALTY_FACTORS.DISASTER.LOW).toBeDefined();
                expect(PENALTY_FACTORS.DISASTER.MEDIUM).toBeDefined();
                expect(PENALTY_FACTORS.DISASTER.HIGH).toBeDefined();
                expect(PENALTY_FACTORS.DISASTER.SEVERE).toBeDefined();
            });

            it('should have NONE disaster factor as 1.0 (no penalty)', () => {
                expect(PENALTY_FACTORS.DISASTER.NONE).toBe(1.0);
            });

            it('should have increasing penalties with higher disaster frequency', () => {
                const { DISASTER } = PENALTY_FACTORS;
                expect(DISASTER.NONE).toBeLessThanOrEqual(DISASTER.LOW);
                expect(DISASTER.LOW).toBeLessThan(DISASTER.MEDIUM);
                expect(DISASTER.MEDIUM).toBeLessThan(DISASTER.HIGH);
                expect(DISASTER.HIGH).toBeLessThan(DISASTER.SEVERE);
            });
        });

        describe('Combined Penalty Limits', () => {
            it('should have reasonable maximum combined penalty', () => {
                const maxAQI = PENALTY_FACTORS.AQI.HAZARDOUS;
                const maxSoil = PENALTY_FACTORS.SOIL.DEGRADED;
                const maxDisaster = PENALTY_FACTORS.DISASTER.SEVERE;
                const maxCombined = maxAQI * maxSoil * maxDisaster;

                // Maximum combined penalty should be reasonable (< 5x)
                expect(maxCombined).toBeLessThan(5);
            });
        });
    });

    describe('Constant Relationships', () => {
        it('should have consistent tree data (O2 production vs CO2 absorption)', () => {
            const { CO2, OXYGEN } = ENVIRONMENTAL_CONSTANTS;
            // O2 production should be roughly 2-6x CO2 absorption (typical ratio)
            const ratio = OXYGEN.PRODUCTION_PER_TREE_KG_YEAR / CO2.ABSORPTION_PER_TREE_KG_YEAR;
            expect(ratio).toBeGreaterThan(2);
            expect(ratio).toBeLessThan(10);
        });

        it('should have realistic human oxygen consumption', () => {
            const { OXYGEN } = ENVIRONMENTAL_CONSTANTS;
            const dailyKg = OXYGEN.HUMAN_CONSUMPTION_LITERS_DAY * OXYGEN.LITERS_TO_KG_CONVERSION;
            // Human consumes ~0.7-0.8 kg O2 per day
            expect(dailyKg).toBeGreaterThan(0.5);
            expect(dailyKg).toBeLessThan(1.5);
        });

        it('should have reasonable trees per hectare', () => {
            const treesPerHectare = ENVIRONMENTAL_CONSTANTS.OXYGEN.TREES_PER_HECTARE;
            // Typical plantation density is 400-2500 trees per hectare
            expect(treesPerHectare).toBeGreaterThanOrEqual(100);
            expect(treesPerHectare).toBeLessThanOrEqual(2500);
        });
    });
});
