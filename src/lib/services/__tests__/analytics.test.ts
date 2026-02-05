import { getAnalyticsData } from '../analytics';

describe('Analytics Service', () => {
  it('should return mock data when Firebase is not configured', async () => {
    // Ensure environment variable is not set for test
    const originalEnv = process.env.FIREBASE_PROJECT_ID;
    delete process.env.FIREBASE_PROJECT_ID;

    const data = await getAnalyticsData();

    expect(data).toBeDefined();
    expect(data.globalMetrics).toBeDefined();
    expect(data.timeSeries.length).toBeGreaterThan(0);
    expect(data.regionalData.length).toBeGreaterThan(0);
    expect(data.predictive).toBeDefined();

    // Restore env
    process.env.FIREBASE_PROJECT_ID = originalEnv;
  });

  it('should return cached data if available and not expired', async () => {
    const data1 = await getAnalyticsData();
    const data2 = await getAnalyticsData();

    // Since it's mock data and random, if it's cached, it should be identical
    expect(data1).toBe(data2);
  });
});
