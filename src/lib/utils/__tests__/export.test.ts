/**
 * Export Utility Tests
 * Tests for export functions in src/lib/utils/export.ts
 * @jest-environment jsdom
 */

// Store references to mocks
let mockLink: { click: jest.Mock; href: string; download: string };

beforeAll(() => {
    global.URL.createObjectURL = jest.fn(() => 'blob:http://localhost/test');
    global.URL.revokeObjectURL = jest.fn();
});

beforeEach(() => {
    mockLink = { click: jest.fn(), href: '', download: '' };

    jest.spyOn(document, 'createElement').mockReturnValue(mockLink as unknown as HTMLElement);
    jest.spyOn(document.body, 'appendChild').mockImplementation(() => mockLink as unknown as Node);
    jest.spyOn(document.body, 'removeChild').mockImplementation(() => mockLink as unknown as Node);
    jest.spyOn(document, 'querySelector').mockReturnValue(null);
});

afterEach(() => {
    jest.restoreAllMocks();
});

// Import after mocks are set up
import {
    exportDistrictAsCSV,
    exportDistrictAsJSON,
} from '../export';

describe('Export Utility Functions', () => {
    // Sample district data for testing - using type assertion for test flexibility
    const sampleDistrictData = {
        id: 'dist-1',
        name: 'Test District',
        state: 'Test State',
        slug: 'test-district',
        population: 1000000,
        latitude: 12.9716,
        longitude: 77.5946,
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-02'),
        environmentalData: {
            id: 'env-1',
            districtId: 'dist-1',
            aqi: 150,
            pm25: 85,
            soilQuality: 70,
            disasterFrequency: 2.5,
            dataSource: 'test-source',
            timestamp: new Date('2025-01-01'),
            createdAt: new Date('2025-01-01'),
        },
        oxygenCalculation: {
            population: 1000000,
            district_name: 'Test District',
            human_o2_demand_kg_per_year: 200000000,
            penalty_adjusted_demand_kg_per_year: 266000000,
            per_tree_o2_supply_kg_per_year: 110,
            oxygen_deficit_kg_per_year: 50000000,
            trees_required: 450000,
            trees_required_hectares: 1125,
            confidence_level: 'high' as const,
            data_sources: ['CPCB', 'Soil Health'],
            assumptions: ['Standard tree O2 production'],
            formula_breakdown: {
                human_o2_demand_liters: 287000000000,
                human_o2_demand_kg: 200000000,
                aqi_penalty_factor: 1.15,
                soil_degradation_factor: 1.10,
                disaster_loss_factor: 1.05,
                total_penalty: 1.33,
                adjusted_o2_demand_kg: 266000000,
                per_tree_o2_supply_kg: 110,
                soil_adjusted_tree_supply_kg: 100,
            },
        },
        stats: {
            totalTreesPlanted: 5000,
            totalTreesDonated: 2000,
            totalTrees: 7000,
            oxygenOffset: 770000,
        },
    };

    describe('exportDistrictAsCSV', () => {
        beforeEach(() => {
            jest.clearAllMocks();
            // Reset Blob mock
            global.Blob = jest.fn().mockImplementation((content: BlobPart[], options?: BlobPropertyBag) => ({
                content,
                type: options?.type,
                size: 100,
            }));
        });

        it('should create a CSV blob with correct MIME type', () => {
            exportDistrictAsCSV(sampleDistrictData, 'test-district');

            expect(global.Blob).toHaveBeenCalled();
            const blobCall = (global.Blob as jest.Mock).mock.calls[0];
            expect(blobCall[1].type).toBe('text/csv;charset=utf-8;');
        });

        it('should generate a timestamped filename', () => {
            const mockLink = { click: jest.fn(), href: '', download: '' };
            (document.createElement as jest.Mock).mockReturnValue(mockLink);

            exportDistrictAsCSV(sampleDistrictData, 'test-district');

            expect(mockLink.download).toMatch(/^vayura_test-district_\d{4}-\d{2}-\d{2}\.csv$/);
        });

        it('should trigger a download', () => {
            const mockClick = jest.fn();
            const mockLink = { click: mockClick, href: '', download: '' };
            (document.createElement as jest.Mock).mockReturnValue(mockLink);

            exportDistrictAsCSV(sampleDistrictData, 'test-district');

            expect(mockClick).toHaveBeenCalled();
        });

        it('should handle missing oxygenCalculation gracefully', () => {
            // Intentionally create invalid data to test edge case handling
            const dataWithoutCalc = { ...sampleDistrictData, oxygenCalculation: undefined } as unknown as Parameters<typeof exportDistrictAsCSV>[0];

            expect(() => {
                exportDistrictAsCSV(dataWithoutCalc, 'test-district');
            }).not.toThrow();
        });

        it('should handle missing stats gracefully', () => {
            const dataWithoutStats = { ...sampleDistrictData, stats: undefined };

            expect(() => {
                exportDistrictAsCSV(dataWithoutStats, 'test-district');
            }).not.toThrow();
        });
    });

    describe('exportDistrictAsJSON', () => {
        beforeEach(() => {
            jest.clearAllMocks();
            global.Blob = jest.fn().mockImplementation((content: BlobPart[], options?: BlobPropertyBag) => ({
                content,
                type: options?.type,
                size: 100,
            }));
        });

        it('should create a JSON blob with correct MIME type', () => {
            exportDistrictAsJSON(sampleDistrictData, 'test-district');

            expect(global.Blob).toHaveBeenCalled();
            const blobCall = (global.Blob as jest.Mock).mock.calls[0];
            expect(blobCall[1].type).toBe('application/json;charset=utf-8;');
        });

        it('should generate a timestamped filename with .json extension', () => {
            const mockLink = { click: jest.fn(), href: '', download: '' };
            (document.createElement as jest.Mock).mockReturnValue(mockLink);

            exportDistrictAsJSON(sampleDistrictData, 'test-district');

            expect(mockLink.download).toMatch(/^vayura_test-district_\d{4}-\d{2}-\d{2}\.json$/);
        });

        it('should trigger a download', () => {
            const mockClick = jest.fn();
            const mockLink = { click: mockClick, href: '', download: '' };
            (document.createElement as jest.Mock).mockReturnValue(mockLink);

            exportDistrictAsJSON(sampleDistrictData, 'test-district');

            expect(mockClick).toHaveBeenCalled();
        });

        it('should handle missing oxygenCalculation with status message', () => {
            // Intentionally create invalid data to test edge case handling
            const dataWithoutCalc = { ...sampleDistrictData, oxygenCalculation: undefined } as unknown as Parameters<typeof exportDistrictAsJSON>[0];

            expect(() => {
                exportDistrictAsJSON(dataWithoutCalc, 'test-district');
            }).not.toThrow();
        });

        it('should create properly formatted JSON', () => {
            let capturedContent: string = '';
            global.Blob = jest.fn().mockImplementation((content: BlobPart[]) => {
                capturedContent = content[0] as string;
                return { content, type: 'application/json', size: 100 };
            });

            exportDistrictAsJSON(sampleDistrictData, 'test-district');

            // Should be valid JSON
            expect(() => JSON.parse(capturedContent)).not.toThrow();

            const parsed = JSON.parse(capturedContent);
            expect(parsed.metadata).toBeDefined();
            expect(parsed.location).toBeDefined();
            expect(parsed.environment).toBeDefined();
            expect(parsed.oxygen_analysis).toBeDefined();
            expect(parsed.community_impact).toBeDefined();
        });

        it('should include metadata in JSON export', () => {
            let capturedContent: string = '';
            global.Blob = jest.fn().mockImplementation((content: BlobPart[]) => {
                capturedContent = content[0] as string;
                return { content, type: 'application/json', size: 100 };
            });

            exportDistrictAsJSON(sampleDistrictData, 'test-district');

            const parsed = JSON.parse(capturedContent);
            expect(parsed.metadata.vayura_version).toBe('1.0');
            expect(parsed.metadata.data_type).toBe('district_environmental_health_card');
            expect(parsed.metadata.export_timestamp).toBeDefined();
        });

        it('should include location data in JSON export', () => {
            let capturedContent: string = '';
            global.Blob = jest.fn().mockImplementation((content: BlobPart[]) => {
                capturedContent = content[0] as string;
                return { content, type: 'application/json', size: 100 };
            });

            exportDistrictAsJSON(sampleDistrictData, 'test-district');

            const parsed = JSON.parse(capturedContent);
            expect(parsed.location.district_name).toBe('Test District');
            expect(parsed.location.state).toBe('Test State');
            expect(parsed.location.population).toBe(1000000);
            expect(parsed.location.coordinates.latitude).toBe(12.9716);
            expect(parsed.location.coordinates.longitude).toBe(77.5946);
        });

        it('should include community impact data in JSON export', () => {
            let capturedContent: string = '';
            global.Blob = jest.fn().mockImplementation((content: BlobPart[]) => {
                capturedContent = content[0] as string;
                return { content, type: 'application/json', size: 100 };
            });

            exportDistrictAsJSON(sampleDistrictData, 'test-district');

            const parsed = JSON.parse(capturedContent);
            expect(parsed.community_impact.tree_contributions.planted_locally).toBe(5000);
            expect(parsed.community_impact.tree_contributions.donated_through_ngos).toBe(2000);
            expect(parsed.community_impact.tree_contributions.total_contributed).toBe(7000);
        });
    });
});
