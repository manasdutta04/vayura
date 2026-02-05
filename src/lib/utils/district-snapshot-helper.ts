import { adminDb } from '@/lib/firebase-admin';

/**
 * Store a historical snapshot of district data
 * Call this whenever district data is fetched/calculated
 */
export async function storeDistrictSnapshot(districtData: any) {
  try {
    const snapshot = {
      districtId: districtData.id,
      districtSlug: districtData.slug,
      districtName: districtData.name,
      state: districtData.state,
      timestamp: new Date(),
      
      // Core metrics
      population: districtData.population,
      aqi: districtData.environmentalData.aqi,
      soilQuality: districtData.environmentalData.soilQuality,
      disasterFrequency: districtData.environmentalData.disasterFrequency,
      
      // Oxygen metrics
      treesRequired: districtData.oxygenCalculation.trees_required,
      oxygenDemand: districtData.oxygenCalculation.formula_breakdown.adjusted_o2_demand_kg,
      oxygenSupply: districtData.oxygenCalculation.formula_breakdown.soil_adjusted_tree_supply_kg,
    };

    // Store in Firestore
    await adminDb.collection('district_historical_snapshots').add(snapshot);

    console.log(`Snapshot stored for district: ${districtData.name}`);
  } catch (error) {
    console.error('Error storing district snapshot:', error);
    // Don't throw - this is a non-critical operation
  }
}

/**
 * Clean up old snapshots (keep last 30 days only)
 * Run this periodically via a cron job
 */
export async function cleanupOldSnapshots() {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const oldSnapshots = await adminDb
      .collection('district_historical_snapshots')
      .where('timestamp', '<', thirtyDaysAgo)
      .get();

    const batch = adminDb.batch();
    oldSnapshots.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    await batch.commit();
    console.log(`Cleaned up ${oldSnapshots.size} old snapshots`);
  } catch (error) {
    console.error('Error cleaning up old snapshots:', error);
  }
}
