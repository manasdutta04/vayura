import * as dotenv from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Create __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

// Initialize Firebase Admin using environment variables
const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n');

if (!projectId || !clientEmail || !privateKey) {
    console.error('❌ Error: Missing Firebase Admin environment variables');
    console.error('Make sure your .env.local file has the required Firebase credentials');
    process.exit(1);
}

let adminApp;
if (!getApps().length) {
    adminApp = initializeApp({
        credential: cert({
            projectId,
            clientEmail,
            privateKey,
        }),
    });
} else {
    adminApp = getApps()[0];
}

const adminDb = getFirestore(adminApp);

// Sample leaderboard data for Indian states
const leaderboardData = [
    {
        state: 'Maharashtra',
        population: 125000000,
        totalTreesPlanted: 450000,
        totalTreesDonated: 120000,
        totalTrees: 570000,
        existingForestTrees: 12500000,
        existingForestO2Production: 750000,
        forestCoverKm2: 28750,
        forestDataYear: 2024,
        forestDataSource: 'FSI India',
        o2Needed: 450000,
        o2Supply: 125000,
        totalO2Supply: 875000,
        percentageMet: 194,
        avgAQI: 85,
        avgSoilQuality: 72,
        rank: 1,
        lastUpdated: new Date(),
    },
    {
        state: 'Karnataka',
        population: 68000000,
        totalTreesPlanted: 320000,
        totalTreesDonated: 95000,
        totalTrees: 415000,
        existingForestTrees: 9200000,
        existingForestO2Production: 550000,
        forestCoverKm2: 22100,
        forestDataYear: 2024,
        forestDataSource: 'FSI India',
        o2Needed: 380000,
        o2Supply: 115000,
        totalO2Supply: 665000,
        percentageMet: 175,
        avgAQI: 72,
        avgSoilQuality: 78,
        rank: 2,
        lastUpdated: new Date(),
    },
    {
        state: 'Tamil Nadu',
        population: 72000000,
        totalTreesPlanted: 280000,
        totalTreesDonated: 85000,
        totalTrees: 365000,
        existingForestTrees: 8100000,
        existingForestO2Production: 486000,
        forestCoverKm2: 19500,
        forestDataYear: 2024,
        forestDataSource: 'FSI India',
        o2Needed: 400000,
        o2Supply: 101000,
        totalO2Supply: 587000,
        percentageMet: 147,
        avgAQI: 95,
        avgSoilQuality: 65,
        rank: 3,
        lastUpdated: new Date(),
    },
    {
        state: 'Uttar Pradesh',
        population: 240000000,
        totalTreesPlanted: 150000,
        totalTreesDonated: 45000,
        totalTrees: 195000,
        existingForestTrees: 5200000,
        existingForestO2Production: 312000,
        forestCoverKm2: 12500,
        forestDataYear: 2024,
        forestDataSource: 'FSI India',
        o2Needed: 840000,
        o2Supply: 54000,
        totalO2Supply: 366000,
        percentageMet: 44,
        avgAQI: 120,
        avgSoilQuality: 55,
        rank: 4,
        lastUpdated: new Date(),
    },
    {
        state: 'Delhi',
        population: 32000000,
        totalTreesPlanted: 95000,
        totalTreesDonated: 28000,
        totalTrees: 123000,
        existingForestTrees: 1500000,
        existingForestO2Production: 90000,
        forestCoverKm2: 3600,
        forestDataYear: 2024,
        forestDataSource: 'FSI India',
        o2Needed: 112000,
        o2Supply: 34000,
        totalO2Supply: 124000,
        percentageMet: 111,
        avgAQI: 160,
        avgSoilQuality: 42,
        rank: 5,
        lastUpdated: new Date(),
    },
    {
        state: 'Rajasthan',
        population: 82000000,
        totalTreesPlanted: 210000,
        totalTreesDonated: 62000,
        totalTrees: 272000,
        existingForestTrees: 7400000,
        existingForestO2Production: 444000,
        forestCoverKm2: 17800,
        forestDataYear: 2024,
        forestDataSource: 'FSI India',
        o2Needed: 286000,
        o2Supply: 75000,
        totalO2Supply: 519000,
        percentageMet: 181,
        avgAQI: 110,
        avgSoilQuality: 58,
        rank: 6,
        lastUpdated: new Date(),
    },
    {
        state: 'West Bengal',
        population: 100000000,
        totalTreesPlanted: 175000,
        totalTreesDonated: 52000,
        totalTrees: 227000,
        existingForestTrees: 6800000,
        existingForestO2Production: 408000,
        forestCoverKm2: 16400,
        forestDataYear: 2024,
        forestDataSource: 'FSI India',
        o2Needed: 350000,
        o2Supply: 63000,
        totalO2Supply: 471000,
        percentageMet: 135,
        avgAQI: 125,
        avgSoilQuality: 60,
        rank: 7,
        lastUpdated: new Date(),
    },
    {
        state: 'Telangana',
        population: 42000000,
        totalTreesPlanted: 125000,
        totalTreesDonated: 38000,
        totalTrees: 163000,
        existingForestTrees: 4200000,
        existingForestO2Production: 252000,
        forestCoverKm2: 12100,
        forestDataYear: 2024,
        forestDataSource: 'FSI India',
        o2Needed: 147000,
        o2Supply: 45000,
        totalO2Supply: 297000,
        percentageMet: 202,
        avgAQI: 92,
        avgSoilQuality: 70,
        rank: 8,
        lastUpdated: new Date(),
    },
    {
        state: 'Haryana',
        population: 30000000,
        totalTreesPlanted: 88000,
        totalTreesDonated: 26000,
        totalTrees: 114000,
        existingForestTrees: 1800000,
        existingForestO2Production: 108000,
        forestCoverKm2: 4350,
        forestDataYear: 2024,
        forestDataSource: 'FSI India',
        o2Needed: 105000,
        o2Supply: 32000,
        totalO2Supply: 140000,
        percentageMet: 133,
        avgAQI: 140,
        avgSoilQuality: 52,
        rank: 9,
        lastUpdated: new Date(),
    },
    {
        state: 'Punjab',
        population: 32000000,
        totalTreesPlanted: 72000,
        totalTreesDonated: 21000,
        totalTrees: 93000,
        existingForestTrees: 1600000,
        existingForestO2Production: 96000,
        forestCoverKm2: 3850,
        forestDataYear: 2024,
        forestDataSource: 'FSI India',
        o2Needed: 112000,
        o2Supply: 26000,
        totalO2Supply: 122000,
        percentageMet: 109,
        avgAQI: 135,
        avgSoilQuality: 48,
        rank: 10,
        lastUpdated: new Date(),
    },
];

async function seedLeaderboard() {
    try {
        console.log('🌱 Seeding leaderboard data...');

        const leaderboardRef = adminDb.collection('leaderboard');

        for (const data of leaderboardData) {
            const docId = data.state.toLowerCase().replace(/\s+/g, '-');
            await leaderboardRef.doc(docId).set(data, { merge: true });
            console.log(`✓ Added: ${data.state} (Rank: ${data.rank})`);
        }

        console.log('\n✅ Leaderboard seeding completed!');
        console.log(`📊 Total states added: ${leaderboardData.length}`);
        console.log('🚀 Visit http://localhost:3000/leaderboard to see pagination in action');
    } catch (error) {
        console.error('❌ Error seeding leaderboard:', error);
        process.exit(1);
    }
}

seedLeaderboard();
