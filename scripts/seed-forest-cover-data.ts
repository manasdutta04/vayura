/**
 * Seed script to populate initial tree estimates based on Forest Survey of India data
 * Data source: India State of Forest Report (ISFR) 2021
 * URL: https://fsi.nic.in/forest-report-2021
 * 
 * Note: This uses forest cover area to ESTIMATE tree count
 * Formula: Forest Cover (km²) × 100 (hectares/km²) × 500 (trees/hectare)
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as dotenv from 'dotenv';

dotenv.config();

const app = initializeApp({
    credential: cert({
        projectId: process.env.FIREBASE_ADMIN_PROJECT_ID!,
        clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL!,
        privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY!.replace(/\\n/g, '\n'),
    }),
});

const db = getFirestore(app);

/**
 * Forest cover data from ISFR 2021
 * Source: Forest Survey of India
 * Coverage: Total forest + tree cover (km²)
 */
const stateForestCoverData: Record<string, {
    forestCoverKm2: number;
    treeOutsideForestKm2: number;
    totalCoverKm2: number;
    dataYear: number;
}> = {
    "Andhra Pradesh": { forestCoverKm2: 37307, treeOutsideForestKm2: 7764, totalCoverKm2: 45071, dataYear: 2021 },
    "Arunachal Pradesh": { forestCoverKm2: 66964, treeOutsideForestKm2: 457, totalCoverKm2: 67421, dataYear: 2021 },
    "Assam": { forestCoverKm2: 27813, treeOutsideForestKm2: 2059, totalCoverKm2: 29872, dataYear: 2021 },
    "Bihar": { forestCoverKm2: 7344, treeOutsideForestKm2: 2474, totalCoverKm2: 9818, dataYear: 2021 },
    "Chhattisgarh": { forestCoverKm2: 55717, treeOutsideForestKm2: 4302, totalCoverKm2: 60019, dataYear: 2021 },
    "Delhi": { forestCoverKm2: 199, treeOutsideForestKm2: 33, totalCoverKm2: 232, dataYear: 2021 },
    "Goa": { forestCoverKm2: 2252, treeOutsideForestKm2: 183, totalCoverKm2: 2435, dataYear: 2021 },
    "Gujarat": { forestCoverKm2: 23497, treeOutsideForestKm2: 5359, totalCoverKm2: 28856, dataYear: 2021 },
    "Haryana": { forestCoverKm2: 1608, treeOutsideForestKm2: 1233, totalCoverKm2: 2841, dataYear: 2021 },
    "Himachal Pradesh": { forestCoverKm2: 27692, treeOutsideForestKm2: 610, totalCoverKm2: 28302, dataYear: 2021 },
    "Jammu and Kashmir": { forestCoverKm2: 22383, treeOutsideForestKm2: 788, totalCoverKm2: 23171, dataYear: 2021 },
    "Jharkhand": { forestCoverKm2: 23737, treeOutsideForestKm2: 2875, totalCoverKm2: 26612, dataYear: 2021 },
    "Karnataka": { forestCoverKm2: 43356, treeOutsideForestKm2: 6689, totalCoverKm2: 50045, dataYear: 2021 },
    "Kerala": { forestCoverKm2: 21144, treeOutsideForestKm2: 2474, totalCoverKm2: 23618, dataYear: 2021 },
    "Madhya Pradesh": { forestCoverKm2: 77493, treeOutsideForestKm2: 8562, totalCoverKm2: 86055, dataYear: 2021 },
    "Maharashtra": { forestCoverKm2: 50778, treeOutsideForestKm2: 10234, totalCoverKm2: 61012, dataYear: 2021 },
    "Odisha": { forestCoverKm2: 51619, treeOutsideForestKm2: 3673, totalCoverKm2: 55292, dataYear: 2021 },
    "Punjab": { forestCoverKm2: 3083, treeOutsideForestKm2: 816, totalCoverKm2: 3899, dataYear: 2021 },
    "Rajasthan": { forestCoverKm2: 16580, treeOutsideForestKm2: 8467, totalCoverKm2: 25047, dataYear: 2021 },
    "Tamil Nadu": { forestCoverKm2: 26413, treeOutsideForestKm2: 5107, totalCoverKm2: 31520, dataYear: 2021 },
    "Telangana": { forestCoverKm2: 26904, treeOutsideForestKm2: 3770, totalCoverKm2: 30674, dataYear: 2021 },
    "Uttar Pradesh": { forestCoverKm2: 14864, treeOutsideForestKm2: 5737, totalCoverKm2: 20601, dataYear: 2021 },
    "Uttarakhand": { forestCoverKm2: 34651, treeOutsideForestKm2: 689, totalCoverKm2: 35340, dataYear: 2021 },
    "West Bengal": { forestCoverKm2: 17395, treeOutsideForestKm2: 2911, totalCoverKm2: 20306, dataYear: 2021 },
};

// Conversion factors
const HECTARES_PER_KM2 = 100;
const TREES_PER_HECTARE_MODERATE = 500; // Conservative estimate for mixed forests
const KG_O2_PER_TREE_YEAR = 110;

async function seedForestData() {
    console.log('Starting forest cover data seed...\n');

    const leaderboardRef = db.collection('leaderboard');
    let updated = 0;

    for (const [state, data] of Object.entries(stateForestCoverData)) {
        // Calculate estimated existing trees
        const estimatedTrees = Math.round(
            data.totalCoverKm2 * HECTARES_PER_KM2 * TREES_PER_HECTARE_MODERATE
        );

        // Calculate O2 production from existing trees
        const estimatedO2Production = Math.round(estimatedTrees * KG_O2_PER_TREE_YEAR);

        // Find the leaderboard entry for this state
        const snapshot = await leaderboardRef.where('state', '==', state).get();

        if (snapshot.empty) {
            console.log(`⚠️  State not found in leaderboard: ${state}`);
            continue;
        }

        const doc = snapshot.docs[0];
        // Update with estimated existing forest trees
        // Note: This is SEPARATE from user-planted trees
        await doc.ref.update({
            existingForestTrees: estimatedTrees,
            existingForestO2Production: estimatedO2Production,
            forestCoverKm2: data.totalCoverKm2,
            forestDataYear: data.dataYear,
            forestDataSource: 'Forest Survey of India - ISFR 2021',
            lastUpdated: new Date(),
        });

        updated++;
        console.log(`✓ ${state}:`);
        console.log(`  Forest Cover: ${data.totalCoverKm2.toLocaleString()} km²`);
        console.log(`  Estimated Trees: ${estimatedTrees.toLocaleString()}`);
        console.log(`  Estimated O₂: ${estimatedO2Production.toLocaleString()} kg/year`);
        console.log();
    }

    console.log(`\n✓ Successfully seeded forest data for ${updated} states`);
    console.log(`\nNote: These are ESTIMATES based on forest cover.`);
    console.log(`User-planted trees are tracked separately.`);
}

seedForestData()
    .then(() => {
        console.log('\nDone!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('Error seeding forest data:', error);
        process.exit(1);
    });

