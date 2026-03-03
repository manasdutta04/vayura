import {
  calculateConfidenceScore,
  getConfidenceLevel,
  getConfidenceColor,
  getConfidenceColorClass,
  getConfidenceTooltipText,
  DEFAULT_CONFIDENCE_WEIGHTS,
  ConfidenceFactors,
} from '../confidence';

describe('calculateConfidenceScore', () => {
  describe('AQI Source Scoring', () => {
    it('should add 30 points for real-time AQI (openweathermap)', () => {
      const factors: ConfidenceFactors = {
        hasRealtimeAQI: true,
        aqiSource: 'openweathermap',
        usedGemini: false,
        populationYear: 2023,
        dataFreshnessHours: 0,
      };
      const score = calculateConfidenceScore(factors);
      // 30 (realtime AQI) + 25 (recent population) + 15 (fresh data) = 70
      expect(score).toBe(70);
    });

    it('should add 30 points for Gemini AI fallback AQI', () => {
      const factors: ConfidenceFactors = {
        hasRealtimeAQI: false,
        aqiSource: 'gemini_ai_fallback',
        usedGemini: true,
        populationYear: 2023,
        dataFreshnessHours: 0,
      };
      const score = calculateConfidenceScore(factors);
      // 30 (gemini) + 25 (recent population) + 15 (fresh data) + 30 (gemini used) = 100
      expect(score).toBe(100);
    });

    it('should add 10 points for static/fallback AQI', () => {
      const factors: ConfidenceFactors = {
        hasRealtimeAQI: false,
        aqiSource: 'static',
        usedGemini: false,
        populationYear: 2023,
        dataFreshnessHours: 0,
      };
      const score = calculateConfidenceScore(factors);
      // 10 (fallback AQI) + 25 (recent population) + 15 (fresh data) = 50
      expect(score).toBe(50);
    });
  });

  describe('Population Data Scoring', () => {
    it('should add 25 points for recent population data (within 3 years)', () => {
      const currentYear = new Date().getFullYear();
      const factors: ConfidenceFactors = {
        hasRealtimeAQI: false,
        aqiSource: 'static',
        usedGemini: false,
        populationYear: currentYear,
        dataFreshnessHours: 0,
      };
      const score = calculateConfidenceScore(factors);
      // 10 (fallback AQI) + 25 (recent population) + 15 (fresh data) = 50
      expect(score).toBe(50);
    });

    it('should add 15 points for old population data (older than 2 years)', () => {
      const factors: ConfidenceFactors = {
        hasRealtimeAQI: false,
        aqiSource: 'static',
        usedGemini: false,
        populationYear: 2010,
        dataFreshnessHours: 0,
      };
      const score = calculateConfidenceScore(factors);
      // 10 (fallback AQI) + 15 (old population) + 15 (fresh data) = 40
      expect(score).toBe(40);
    });
  });

  describe('Data Freshness Scoring', () => {
    it('should add 15 points for fresh data (within 24 hours)', () => {
      const factors: ConfidenceFactors = {
        hasRealtimeAQI: false,
        aqiSource: 'static',
        usedGemini: false,
        populationYear: 2023,
        dataFreshnessHours: 12,
      };
      const score = calculateConfidenceScore(factors);
      // 10 (fallback AQI) + 25 (recent population) + 15 (fresh data) = 50
      expect(score).toBe(50);
    });

    it('should not add points for stale data (older than 24 hours)', () => {
      const factors: ConfidenceFactors = {
        hasRealtimeAQI: false,
        aqiSource: 'static',
        usedGemini: false,
        populationYear: 2023,
        dataFreshnessHours: 48,
      };
      const score = calculateConfidenceScore(factors);
      // 10 (fallback AQI) + 25 (recent population) + 0 (stale data) = 35
      expect(score).toBe(35);
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing/undefined population year', () => {
      const factors: ConfidenceFactors = {
        hasRealtimeAQI: true,
        aqiSource: 'openweathermap',
        usedGemini: false,
        populationYear: 0,
        dataFreshnessHours: 0,
      };
      const score = calculateConfidenceScore(factors);
      // Should still calculate (0 year treated as old)
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });

    it('should clamp score to maximum of 100', () => {
      const factors: ConfidenceFactors = {
        hasRealtimeAQI: true,
        aqiSource: 'openweathermap',
        usedGemini: true,
        populationYear: 2023,
        dataFreshnessHours: 0,
      };
      const score = calculateConfidenceScore(factors);
      // 30 (realtime AQI) + 25 (recent population) + 15 (fresh data) + 30 (gemini) = 100
      expect(score).toBe(100);
    });

    it('should not return negative scores', () => {
      const factors: ConfidenceFactors = {
        hasRealtimeAQI: false,
        aqiSource: 'unknown',
        usedGemini: false,
        populationYear: 1900,
        dataFreshnessHours: 1000,
      };
      const score = calculateConfidenceScore(factors);
      expect(score).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Custom Weights', () => {
    it('should use custom weights when provided', () => {
      const customWeights = {
        realtimeAQI: 40,
        fallbackAQI: 20,
        geminiData: 40,
        fallbackDataset: 20,
        recentPopulation: 30,
        oldPopulation: 10,
        freshData: 20,
        staleData: 0,
      };
      const factors: ConfidenceFactors = {
        hasRealtimeAQI: true,
        aqiSource: 'openweathermap',
        usedGemini: false,
        populationYear: 2023,
        dataFreshnessHours: 0,
      };
      const score = calculateConfidenceScore(factors, customWeights);
      // 40 (realtime AQI) + 30 (recent population) + 20 (fresh data) = 90
      expect(score).toBe(90);
    });
  });
});

describe('getConfidenceLevel', () => {
  it('should return "high" for scores >= 80', () => {
    expect(getConfidenceLevel(80)).toBe('high');
    expect(getConfidenceLevel(90)).toBe('high');
    expect(getConfidenceLevel(100)).toBe('high');
  });

  it('should return "medium" for scores >= 50 and < 80', () => {
    expect(getConfidenceLevel(50)).toBe('medium');
    expect(getConfidenceLevel(65)).toBe('medium');
    expect(getConfidenceLevel(79)).toBe('medium');
  });

  it('should return "low" for scores < 50', () => {
    expect(getConfidenceLevel(0)).toBe('low');
    expect(getConfidenceLevel(25)).toBe('low');
    expect(getConfidenceLevel(49)).toBe('low');
  });
});

describe('getConfidenceColor', () => {
  it('should return green for high confidence', () => {
    expect(getConfidenceColor(80)).toBe('#22c55e');
    expect(getConfidenceColor(100)).toBe('#22c55e');
  });

  it('should return yellow for medium confidence', () => {
    expect(getConfidenceColor(50)).toBe('#eab308');
    expect(getConfidenceColor(79)).toBe('#eab308');
  });

  it('should return red for low confidence', () => {
    expect(getConfidenceColor(0)).toBe('#ef4444');
    expect(getConfidenceColor(49)).toBe('#ef4444');
  });
});

describe('getConfidenceColorClass', () => {
  it('should return green classes for high confidence', () => {
    expect(getConfidenceColorClass(80)).toBe('bg-green-100 text-green-800 border-green-300');
    expect(getConfidenceColorClass(100)).toBe('bg-green-100 text-green-800 border-green-300');
  });

  it('should return yellow classes for medium confidence', () => {
    expect(getConfidenceColorClass(50)).toBe('bg-yellow-100 text-yellow-800 border-yellow-300');
    expect(getConfidenceColorClass(79)).toBe('bg-yellow-100 text-yellow-800 border-yellow-300');
  });

  it('should return red classes for low confidence', () => {
    expect(getConfidenceColorClass(0)).toBe('bg-red-100 text-red-800 border-red-300');
    expect(getConfidenceColorClass(49)).toBe('bg-red-100 text-red-800 border-red-300');
  });
});

describe('getConfidenceTooltipText', () => {
  it('should generate tooltip text for real-time AQI', () => {
    const factors: ConfidenceFactors = {
      hasRealtimeAQI: true,
      aqiSource: 'openweathermap',
      usedGemini: false,
      populationYear: 2023,
      dataFreshnessHours: 12,
    };
    const tooltip = getConfidenceTooltipText(factors);
    expect(tooltip).toContain('Real-time AQI data');
  });

  it('should generate tooltip text for Gemini AI AQI', () => {
    const factors: ConfidenceFactors = {
      hasRealtimeAQI: false,
      aqiSource: 'gemini_ai_fallback',
      usedGemini: true,
      populationYear: 2023,
      dataFreshnessHours: 12,
    };
    const tooltip = getConfidenceTooltipText(factors);
    expect(tooltip).toContain('AI-estimated AQI');
  });

  it('should generate tooltip text for static AQI', () => {
    const factors: ConfidenceFactors = {
      hasRealtimeAQI: false,
      aqiSource: 'static',
      usedGemini: false,
      populationYear: 2023,
      dataFreshnessHours: 12,
    };
    const tooltip = getConfidenceTooltipText(factors);
    expect(tooltip).toContain('Static AQI estimate');
  });

  it('should mention data freshness', () => {
    const freshFactors: ConfidenceFactors = {
      hasRealtimeAQI: true,
      aqiSource: 'openweathermap',
      usedGemini: false,
      populationYear: 2023,
      dataFreshnessHours: 12,
    };
    const freshTooltip = getConfidenceTooltipText(freshFactors);
    expect(freshTooltip).toContain('Data refreshed within 24 hours');

    const staleFactors: ConfidenceFactors = {
      hasRealtimeAQI: true,
      aqiSource: 'openweathermap',
      usedGemini: false,
      populationYear: 2023,
      dataFreshnessHours: 48,
    };
    const staleTooltip = getConfidenceTooltipText(staleFactors);
    expect(staleTooltip).toContain('Data may be outdated');
  });
});

describe('DEFAULT_CONFIDENCE_WEIGHTS', () => {
  it('should have valid weight values', () => {
    expect(DEFAULT_CONFIDENCE_WEIGHTS.realtimeAQI).toBe(30);
    expect(DEFAULT_CONFIDENCE_WEIGHTS.fallbackAQI).toBe(10);
    expect(DEFAULT_CONFIDENCE_WEIGHTS.geminiData).toBe(30);
    expect(DEFAULT_CONFIDENCE_WEIGHTS.fallbackDataset).toBe(15);
    expect(DEFAULT_CONFIDENCE_WEIGHTS.recentPopulation).toBe(25);
    expect(DEFAULT_CONFIDENCE_WEIGHTS.oldPopulation).toBe(15);
    expect(DEFAULT_CONFIDENCE_WEIGHTS.freshData).toBe(15);
    expect(DEFAULT_CONFIDENCE_WEIGHTS.staleData).toBe(0);
  });
});
