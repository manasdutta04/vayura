import { NextResponse } from 'next/server';

/**
 * Mock district search endpoint for testing
 */

const mockDistricts = [
    {
        id: '1',
        name: 'Mumbai',
        slug: 'mumbai',
        state: 'Maharashtra',
    },
    {
        id: '2',
        name: 'Delhi',
        slug: 'delhi',
        state: 'Delhi',
    },
    {
        id: '3',
        name: 'Bangalore Urban',
        slug: 'bangalore-urban',
        state: 'Karnataka',
    },
    {
        id: '4',
        name: 'Kolkata',
        slug: 'kolkata',
        state: 'West Bengal',
    },
    {
        id: '5',
        name: 'Chennai',
        slug: 'chennai',
        state: 'Tamil Nadu',
    },
    {
        id: '6',
        name: 'Hyderabad',
        slug: 'hyderabad',
        state: 'Telangana',
    },
];

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const q = searchParams.get('q')?.toLowerCase() ?? '';
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 200));
        
        const filtered = mockDistricts.filter((district) => {
            return (
                district.name.toLowerCase().includes(q) ||
                district.slug.toLowerCase().includes(q) ||
                district.state.toLowerCase().includes(q)
            );
        });
        
        return NextResponse.json(filtered);
    } catch (error) {
        console.error('Error in mock districts search:', error);
        return NextResponse.json(
            { error: 'Failed to search districts' },
            { status: 500 }
        );
    }
}
