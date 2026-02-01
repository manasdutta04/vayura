import { NextResponse } from 'next/server';

/**
 * Mock district data for testing offline mode
 * This endpoint provides test data without requiring Firebase
 */

const mockDistricts = [
    {
        id: '1',
        name: 'Mumbai',
        slug: 'mumbai',
        state: 'Maharashtra',
        population: 12442373,
        latitude: 19.076,
        longitude: 72.8777,
    },
    {
        id: '2',
        name: 'Delhi',
        slug: 'delhi',
        state: 'Delhi',
        population: 16787941,
        latitude: 28.7041,
        longitude: 77.1025,
    },
    {
        id: '3',
        name: 'Bangalore Urban',
        slug: 'bangalore-urban',
        state: 'Karnataka',
        population: 12765000,
        latitude: 12.9716,
        longitude: 77.5946,
    },
    {
        id: '4',
        name: 'Kolkata',
        slug: 'kolkata',
        state: 'West Bengal',
        population: 14681589,
        latitude: 22.5726,
        longitude: 88.3639,
    },
];

const mockDistrictDetails: Record<string, any> = {
    'mumbai': {
        id: '1',
        name: 'Mumbai',
        slug: 'mumbai',
        state: 'Maharashtra',
        population: 12442373,
        latitude: 19.076,
        longitude: 72.8777,
        environmentalData: {
            aqi: 142,
            pm25: 65,
            soilQuality: 42,
            disasterFrequency: 2.5,
            dataSource: 'mock_data',
        },
        oxygenCalculation: {
            trees_required: 2488475,
            formula_breakdown: {
                human_o2_demand_kg: 2980894650,
                aqi_penalty_factor: 1.42,
                soil_degradation_factor: 1.58,
                disaster_loss_factor: 1.08,
                adjusted_o2_demand_kg: 6857342891,
                soil_adjusted_tree_supply_kg: 46.2,
            },
            assumptions: [
                'Average adult O₂ consumption: 550L/day',
                'Mature tree O₂ production: 110kg/year',
                'Soil quality affects tree productivity',
            ],
            confidence_level: 'medium',
        },
        treesPlanted: 0,
    },
    'delhi': {
        id: '2',
        name: 'Delhi',
        slug: 'delhi',
        state: 'Delhi',
        population: 16787941,
        latitude: 28.7041,
        longitude: 77.1025,
        environmentalData: {
            aqi: 234,
            pm25: 110,
            soilQuality: 48,
            disasterFrequency: 1.8,
            dataSource: 'mock_data',
        },
        oxygenCalculation: {
            trees_required: 4196985,
            formula_breakdown: {
                human_o2_demand_kg: 4021906515,
                aqi_penalty_factor: 2.34,
                soil_degradation_factor: 1.52,
                disaster_loss_factor: 1.05,
                adjusted_o2_demand_kg: 14945678234,
                soil_adjusted_tree_supply_kg: 52.8,
            },
            assumptions: [
                'Average adult O₂ consumption: 550L/day',
                'Mature tree O₂ production: 110kg/year',
                'Soil quality affects tree productivity',
            ],
            confidence_level: 'medium',
        },
        treesPlanted: 0,
    },
    'bangalore-urban': {
        id: '3',
        name: 'Bangalore Urban',
        slug: 'bangalore-urban',
        state: 'Karnataka',
        population: 12765000,
        latitude: 12.9716,
        longitude: 77.5946,
        environmentalData: {
            aqi: 108,
            pm25: 48,
            soilQuality: 58,
            disasterFrequency: 1.2,
            dataSource: 'mock_data',
        },
        oxygenCalculation: {
            trees_required: 1914825,
            formula_breakdown: {
                human_o2_demand_kg: 3059617500,
                aqi_penalty_factor: 1.08,
                soil_degradation_factor: 1.42,
                disaster_loss_factor: 1.03,
                adjusted_o2_demand_kg: 4827563218,
                soil_adjusted_tree_supply_kg: 63.8,
            },
            assumptions: [
                'Average adult O₂ consumption: 550L/day',
                'Mature tree O₂ production: 110kg/year',
                'Soil quality affects tree productivity',
            ],
            confidence_level: 'high',
        },
        treesPlanted: 0,
    },
    'kolkata': {
        id: '4',
        name: 'Kolkata',
        slug: 'kolkata',
        state: 'West Bengal',
        population: 14681589,
        latitude: 22.5726,
        longitude: 88.3639,
        environmentalData: {
            aqi: 156,
            pm25: 72,
            soilQuality: 60,
            disasterFrequency: 3.8,
            dataSource: 'mock_data',
        },
        oxygenCalculation: {
            trees_required: 2936318,
            formula_breakdown: {
                human_o2_demand_kg: 3518020870,
                aqi_penalty_factor: 1.56,
                soil_degradation_factor: 1.40,
                disaster_loss_factor: 1.14,
                adjusted_o2_demand_kg: 8745321654,
                soil_adjusted_tree_supply_kg: 66.0,
            },
            assumptions: [
                'Average adult O₂ consumption: 550L/day',
                'Mature tree O₂ production: 110kg/year',
                'Soil quality affects tree productivity',
            ],
            confidence_level: 'medium',
        },
        treesPlanted: 0,
    },
};

export async function GET(
    request: Request,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params;
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 300));
        
        const district = mockDistrictDetails[slug];
        
        if (!district) {
            return NextResponse.json(
                { error: 'District not found' },
                { status: 404 }
            );
        }
        
        return NextResponse.json(district);
    } catch (error) {
        console.error('Error in mock district API:', error);
        return NextResponse.json(
            { error: 'Failed to fetch district data' },
            { status: 500 }
        );
    }
}
