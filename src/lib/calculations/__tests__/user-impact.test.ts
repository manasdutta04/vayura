/**
 * User Impact Calculation Tests
 * Tests for the Tree Contribution Impact Breakdown feature
 */

import { 
    calculateOxygenOffset, 
    calculatePercentageOffset, 
    aggregateContributionsByDistrict,
    calculateUserImpact 
} from '../user-impact';
import { TreeContribution, Donation } from '@/lib/types';

describe('calculateOxygenOffset', () => {
    it('should calculate oxygen offset for a given number of trees', () => {
        // Default is 110 kg/year per tree (from ENVIRONMENTAL_CONSTANTS)
        expect(calculateOxygenOffset(1)).toBe(110);
        expect(calculateOxygenOffset(10)).toBe(1100);
        expect(calculateOxygenOffset(100)).toBe(11000);
    });

    it('should return 0 for 0 trees', () => {
        expect(calculateOxygenOffset(0)).toBe(0);
    });
});

describe('calculatePercentageOffset', () => {
    it('should calculate percentage of deficit offset', () => {
        // 110 kg offset / 10000 kg deficit = 1.1%
        expect(calculatePercentageOffset(110, 10000)).toBe(1.1);
        // 550 kg offset / 10000 kg deficit = 5.5%
        expect(calculatePercentageOffset(550, 10000)).toBe(5.5);
    });

    it('should return 0 for 0 or negative deficit', () => {
        expect(calculatePercentageOffset(110, 0)).toBe(0);
        expect(calculatePercentageOffset(110, -100)).toBe(0);
    });

    it('should round to 2 decimal places', () => {
        // 110 / 9999 = 0.01100110011... * 100 = 1.100110011...%
        const result = calculatePercentageOffset(110, 9999);
        expect(result).toBe(1.1);
    });
});

describe('aggregateContributionsByDistrict', () => {
    const mockContributions: TreeContribution[] = [
        {
            id: '1',
            districtId: 'barpeta',
            status: 'VERIFIED',
            treeQuantity: 10,
            state: 'Assam',
            plantedAt: new Date(),
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: '2',
            districtId: 'barpeta',
            status: 'PENDING',
            treeQuantity: 5,
            state: 'Assam',
            plantedAt: new Date(),
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: '3',
            districtId: 'mumbai',
            status: 'VERIFIED',
            treeQuantity: 3,
            state: 'Maharashtra',
            plantedAt: new Date(),
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: '4',
            districtId: 'delhi',
            status: 'REJECTED',
            treeQuantity: 8,
            state: 'Delhi',
            plantedAt: new Date(),
            createdAt: new Date(),
            updatedAt: new Date()
        }
    ];

    const mockDonations: Donation[] = [
        {
            id: 'd1',
            districtId: 'barpeta',
            ngoReference: 'NGO1',
            treeCount: 15,
            donatedAt: new Date(),
            createdAt: new Date()
        }
    ];

    it('should include both VERIFIED and PENDING contributions', () => {
        const result = aggregateContributionsByDistrict(mockContributions, []);
        
        // barpeta: 10 (VERIFIED) + 5 (PENDING) = 15
        const barpeta = result.get('barpeta');
        expect(barpeta).toBeDefined();
        expect(barpeta?.treeCount).toBe(15);
        expect(barpeta?.verifiedTreeCount).toBe(10);
        expect(barpeta?.pendingTreeCount).toBe(5);
    });

    it('should exclude REJECTED contributions', () => {
        const result = aggregateContributionsByDistrict(mockContributions, []);
        
        // delhi has REJECTED status, should not be included
        const delhi = result.get('delhi');
        expect(delhi).toBeUndefined();
    });

    it('should aggregate donations', () => {
        const result = aggregateContributionsByDistrict([], mockDonations);
        
        const barpeta = result.get('barpeta');
        expect(barpeta?.treeCount).toBe(15);
    });

    it('should combine contributions and donations', () => {
        const result = aggregateContributionsByDistrict(mockContributions, mockDonations);
        
        // barpeta: 10 + 5 (contributions) + 15 (donation) = 30
        const barpeta = result.get('barpeta');
        expect(barpeta?.treeCount).toBe(30);
        
        // mumbai: 3 (VERIFIED only)
        const mumbai = result.get('mumbai');
        expect(mumbai?.treeCount).toBe(3);
    });
});

describe('calculateUserImpact', () => {
    const mockContributions: TreeContribution[] = [
        {
            id: '1',
            districtId: 'barpeta',
            status: 'VERIFIED',
            treeQuantity: 10,
            state: 'Assam',
            plantedAt: new Date(),
            createdAt: new Date(),
            updatedAt: new Date()
        }
    ];

    const mockDonations: Donation[] = [];

    const mockDistrictData = new Map<string, { name: string; state?: string; oxygenDeficit: number }>([
        ['barpeta', { name: 'Barpeta', state: 'Assam', oxygenDeficit: 1000000 }], // 1 million kg/year
    ]);

    it('should calculate impact for verified contributions', () => {
        const result = calculateUserImpact(mockContributions, mockDonations, mockDistrictData);

        expect(result.hasContributions).toBe(true);
        expect(result.totalTrees).toBe(10);
        expect(result.totalOxygenOffset).toBe(1100); // 10 * 110
        expect(result.districts).toHaveLength(1);
        expect(result.districts[0].districtName).toBe('Barpeta');
        expect(result.districts[0].oxygenOffset).toBe(1100);
        expect(result.districts[0].percentageOffset).toBe(0.11); // 1100/1000000 * 100
    });

    it('should identify most impacted district', () => {
        const result = calculateUserImpact(mockContributions, mockDonations, mockDistrictData);

        expect(result.mostImpactedDistrict).toBeDefined();
        expect(result.mostImpactedDistrict?.districtId).toBe('barpeta');
    });

    it('should return empty state for no contributions', () => {
        const result = calculateUserImpact([], [], new Map());

        expect(result.hasContributions).toBe(false);
        expect(result.totalTrees).toBe(0);
        expect(result.totalOxygenOffset).toBe(0);
        expect(result.districts).toHaveLength(0);
        expect(result.mostImpactedDistrict).toBeNull();
    });

    it('should skip districts with no data', () => {
        const contributionsWithUnknownDistrict: TreeContribution[] = [
            {
                id: '1',
                districtId: 'unknown-district',
                status: 'VERIFIED',
                treeQuantity: 10,
                state: 'Unknown',
                plantedAt: new Date(),
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ];

        const result = calculateUserImpact(contributionsWithUnknownDistrict, mockDonations, mockDistrictData);

        // Should skip unknown district and return empty
        expect(result.hasContributions).toBe(false);
    });
});

describe('Edge cases', () => {
    it('should handle empty contributions array', () => {
        const result = aggregateContributionsByDistrict([], []);
        expect(result.size).toBe(0);
    });

    it('should handle contributions without districtId', () => {
        const contributions: TreeContribution[] = [
            {
                id: '1',
                districtId: '', // Empty districtId
                status: 'VERIFIED',
                treeQuantity: 10,
                state: 'Assam',
                plantedAt: new Date(),
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ];

        const result = aggregateContributionsByDistrict(contributions, []);
        // Should handle empty string as districtId
        const emptyKey = result.get('');
        expect(emptyKey?.treeCount).toBe(10);
    });

    it('should handle contributions with treeQuantity undefined', () => {
        const contributions: TreeContribution[] = [
            {
                id: '1',
                districtId: 'barpeta',
                status: 'VERIFIED',
                treeQuantity: undefined, // Missing treeQuantity
                state: 'Assam',
                plantedAt: new Date(),
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ];

        const result = aggregateContributionsByDistrict(contributions, []);
        const barpeta = result.get('barpeta');
        // Should default to 1 when treeQuantity is undefined
        expect(barpeta?.treeCount).toBe(1);
    });
});

