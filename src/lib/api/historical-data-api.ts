/**
 * API Integration for Historical Data and Trend Tracking
 * 
 * This module demonstrates how to fetch and store historical data
 * for trend calculation in Vayura
 */

import { DistrictDetail } from '@/lib/types';
import { PreviousData, HistoricalMetrics } from '@/lib/types/trend-types';

/**
 * Fetch previous data for a district from your backend/database
 * This is a placeholder - implement based on your actual data storage
 */
export async function fetchPreviousDistrictData(
  districtId: string
): Promise<PreviousData | null> {
  try {
    // Option 1: Fetch from Firestore with timestamp query
    // Example: Get the most recent snapshot before current date
    
    // Option 2: Store in local storage/cache for client-side comparison
    const cachedData = localStorage.getItem(`district_${districtId}_previous`);
    if (cachedData) {
      return JSON.parse(cachedData);
    }

    // Option 3: Fetch from your API endpoint
    const response = await fetch(`/api/districts/${districtId}/previous`);
    if (response.ok) {
      return await response.json();
    }

    return null;
  } catch (error) {
    console.error('Error fetching previous district data:', error);
    return null;
  }
}

/**
 * Store current district data as historical snapshot
 * Call this whenever district data is updated
 */
export async function storeHistoricalSnapshot(
  districtId: string,
  data: DistrictDetail
): Promise<void> {
  try {
    const snapshot: HistoricalMetrics = {
      timestamp: new Date().toISOString(),
      population: data.population,
      aqi: data.environmentalData.aqi,
      soilQuality: data.environmentalData.soilQuality,
      disasterFrequency: data.environmentalData.disasterFrequency,
      oxygenDemand: data.oxygenCalculation.formula_breakdown.adjusted_o2_demand_kg,
      oxygenSupply: data.oxygenCalculation.formula_breakdown.soil_adjusted_tree_supply_kg,
      treesRequired: data.oxygenCalculation.trees_required,
    };

    // Option 1: Store in Firestore
    // await db.collection('historical_snapshots').add({
    //   districtId,
    //   ...snapshot
    // });

    // Option 2: Store in local cache (for demo/client-side)
    const previousData: PreviousData = {
      population: data.population,
      aqi: data.environmentalData.aqi,
      soilQuality: data.environmentalData.soilQuality,
      disasterFrequency: data.environmentalData.disasterFrequency,
      oxygenDemand: snapshot.oxygenDemand,
      oxygenSupply: snapshot.oxygenSupply,
      treesRequired: snapshot.treesRequired,
    };
    localStorage.setItem(`district_${districtId}_previous`, JSON.stringify(previousData));

    // Option 3: Send to your API endpoint
    // await fetch(`/api/districts/${districtId}/snapshots`, {
    //   method: 'POST',
    //   body: JSON.stringify(snapshot)
    // });

  } catch (error) {
    console.error('Error storing historical snapshot:', error);
  }
}

/**
 * Get all historical snapshots for a district
 * Useful for trend charts and analytics
 */
export async function fetchHistoricalSnapshots(
  districtId: string,
  limit: number = 10
): Promise<HistoricalMetrics[]> {
  try {
    // Fetch from your backend/database
    const response = await fetch(`/api/districts/${districtId}/history?limit=${limit}`);
    if (response.ok) {
      return await response.json();
    }
    return [];
  } catch (error) {
    console.error('Error fetching historical snapshots:', error);
    return [];
  }
}

/**
 * Example Firestore schema for historical snapshots:
 * 
 * Collection: historical_snapshots
 * {
 *   districtId: string,
 *   timestamp: ISO date string,
 *   population: number,
 *   aqi: number,
 *   soilQuality: number,
 *   disasterFrequency: number,
 *   treeCount?: number,
 *   oxygenDemand: number,
 *   oxygenSupply: number,
 *   treesRequired: number
 * }
 * 
 * Indexes needed:
 * - districtId + timestamp (descending)
 */

/**
 * Example API endpoint structure:
 * 
 * GET /api/districts/{districtId}/previous
 * - Returns the most recent previous snapshot
 * 
 * GET /api/districts/{districtId}/history?limit=10
 * - Returns array of historical snapshots
 * 
 * POST /api/districts/{districtId}/snapshots
 * - Stores a new historical snapshot
 */

/**
 * Client-side usage example:
 */
export async function useDistrictWithTrends(districtId: string, currentData: DistrictDetail) {
  // 1. Fetch previous data for trend comparison
  const previousData = await fetchPreviousDistrictData(districtId);

  // 2. Store current data as historical snapshot (optional, can be done server-side)
  await storeHistoricalSnapshot(districtId, currentData);

  // 3. Return data for component
  return {
    currentData,
    previousData,
  };
}
