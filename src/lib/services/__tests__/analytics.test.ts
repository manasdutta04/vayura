/**
 * Analytics Service Tests
 * Tests for analytics functions in src/lib/services/analytics.ts
 */

import { getAnalyticsData } from '../analytics';

describe('Analytics Service', () => {
  // Store original env values
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset modules to clear any cached data
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('getAnalyticsData', () => {
    it('should return mock data when Firebase is not configured', async () => {
      // Ensure environment variable is not set for test
      delete process.env.FIREBASE_PROJECT_ID;

      const data = await getAnalyticsData();

      expect(data).toBeDefined();
      expect(data.globalMetrics).toBeDefined();
      expect(data.timeSeries.length).toBeGreaterThan(0);
      expect(data.regionalData.length).toBeGreaterThan(0);
      expect(data.predictive).toBeDefined();
    });

    it('should return cached data if available and not expired', async () => {
      delete process.env.FIREBASE_PROJECT_ID;

      const data1 = await getAnalyticsData();
      const data2 = await getAnalyticsData();

      // Since it's mock data and cached, it should be identical
      expect(data1).toBe(data2);
    });

    it('should include global metrics with correct structure', async () => {
      delete process.env.FIREBASE_PROJECT_ID;

      const data = await getAnalyticsData();

      expect(data.globalMetrics).toHaveProperty('timestamp');
      expect(data.globalMetrics).toHaveProperty('totalTrees');
      expect(data.globalMetrics).toHaveProperty('totalOxygen');
      expect(data.globalMetrics).toHaveProperty('avgAQI');
      expect(data.globalMetrics).toHaveProperty('totalDistricts');
      expect(data.globalMetrics).toHaveProperty('contributionCount');
    });

    it('should include time series with correct structure', async () => {
      delete process.env.FIREBASE_PROJECT_ID;

      const data = await getAnalyticsData();

      expect(Array.isArray(data.timeSeries)).toBe(true);
      expect(data.timeSeries.length).toBe(6); // 6 months

      data.timeSeries.forEach(snapshot => {
        expect(snapshot).toHaveProperty('timestamp');
        expect(snapshot).toHaveProperty('totalTrees');
        expect(snapshot).toHaveProperty('totalOxygen');
      });
    });

    it('should include regional data with correct structure', async () => {
      delete process.env.FIREBASE_PROJECT_ID;

      const data = await getAnalyticsData();

      expect(Array.isArray(data.regionalData)).toBe(true);
      expect(data.regionalData.length).toBeGreaterThan(0);

      data.regionalData.forEach(region => {
        expect(region).toHaveProperty('regionName');
        expect(region).toHaveProperty('regionType');
        expect(region).toHaveProperty('metrics');
        expect(region.metrics).toHaveProperty('totalTrees');
        expect(region.metrics).toHaveProperty('oxygenProduction');
        expect(region.metrics).toHaveProperty('oxygenDemand');
        expect(region.metrics).toHaveProperty('oxygenGap');
      });
    });

    it('should include comparative analytics with correct structure', async () => {
      delete process.env.FIREBASE_PROJECT_ID;

      const data = await getAnalyticsData();

      expect(Array.isArray(data.comparative)).toBe(true);
      expect(data.comparative.length).toBeGreaterThan(0);

      data.comparative.forEach(comparison => {
        expect(comparison).toHaveProperty('subject');
        expect(comparison).toHaveProperty('benchmark');
        expect(comparison.benchmark.regionName).toBe('National Average');
      });
    });

    it('should include predictive insights with correct structure', async () => {
      delete process.env.FIREBASE_PROJECT_ID;

      const data = await getAnalyticsData();

      expect(data.predictive).toHaveProperty('projectedOxygen2030');
      expect(data.predictive).toHaveProperty('treesNeededForSelfSufficiency');
      expect(data.predictive).toHaveProperty('estimatedYearsToGoal');
      expect(data.predictive).toHaveProperty('currentGrowthRate');
    });

    it('should calculate oxygen gap correctly in regional data', async () => {
      delete process.env.FIREBASE_PROJECT_ID;

      const data = await getAnalyticsData();

      data.regionalData.forEach(region => {
        const expectedGap = Math.max(
          0,
          region.metrics.oxygenDemand - region.metrics.oxygenProduction
        );
        expect(region.metrics.oxygenGap).toBe(expectedGap);
      });
    });

    it('should have consistent oxygen calculation in time series', async () => {
      delete process.env.FIREBASE_PROJECT_ID;

      const data = await getAnalyticsData();

      data.timeSeries.forEach(snapshot => {
        // Oxygen should be approximately trees * 110 (production per tree)
        const expectedOxygen = snapshot.totalTrees * 110;
        expect(snapshot.totalOxygen).toBe(expectedOxygen);
      });
    });

    it('should have time series in chronological order', async () => {
      delete process.env.FIREBASE_PROJECT_ID;

      const data = await getAnalyticsData();

      for (let i = 1; i < data.timeSeries.length; i++) {
        const prevTimestamp = new Date(data.timeSeries[i - 1].timestamp).getTime();
        const currTimestamp = new Date(data.timeSeries[i].timestamp).getTime();
        expect(currTimestamp).toBeGreaterThan(prevTimestamp);
      }
    });

    it('should have AI summary and recommendations in mock data', async () => {
      delete process.env.FIREBASE_PROJECT_ID;

      const data = await getAnalyticsData();

      expect(data.predictive.aiSummary).toBeDefined();
      expect(typeof data.predictive.aiSummary).toBe('string');
      expect((data.predictive.aiSummary ?? '').length).toBeGreaterThan(0);

      expect(data.predictive.recommendations).toBeDefined();
      expect(Array.isArray(data.predictive.recommendations)).toBe(true);
      expect(data.predictive.recommendations!.length).toBeGreaterThanOrEqual(3);
    });

    it('should have reasonable predictive values', async () => {
      delete process.env.FIREBASE_PROJECT_ID;

      const data = await getAnalyticsData();

      expect(data.predictive.projectedOxygen2030).toBeGreaterThan(0);
      expect(data.predictive.treesNeededForSelfSufficiency).toBeGreaterThan(0);
      expect(data.predictive.estimatedYearsToGoal).toBeGreaterThan(0);
      expect(data.predictive.currentGrowthRate).toBeGreaterThan(0);
    });

    it('should have known Indian states in mock regional data', async () => {
      delete process.env.FIREBASE_PROJECT_ID;

      const data = await getAnalyticsData();

      const stateNames = data.regionalData.map(r => r.regionName);
      const expectedStates = ['Uttar Pradesh', 'Maharashtra', 'Karnataka', 'Tamil Nadu', 'Gujarat'];

      expectedStates.forEach(state => {
        expect(stateNames).toContain(state);
      });
    });

    it('should have all regional data marked as state type', async () => {
      delete process.env.FIREBASE_PROJECT_ID;

      const data = await getAnalyticsData();

      data.regionalData.forEach(region => {
        expect(region.regionType).toBe('state');
      });
    });
  });
});
