import { NextResponse } from 'next/server';
// ✅ FIXED: Import from correct relative path
import { metrics } from '../oxygen-calculator/route'; 
import { oxygenCache } from '@/lib/oxygenCache';

export async function GET() {
  const mem = oxygenCache.getMemoryUsage();
  
  // ✅ FIXED: Calculate Average Latency
  const avgLatency = metrics.requests > 0 
    ? (metrics.totalLatency / metrics.requests).toFixed(2) 
    : 0;

  return NextResponse.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    metrics: {
      requests: metrics.requests,
      cache_hits: metrics.cacheHits,
      hit_rate: metrics.requests ? (metrics.cacheHits / metrics.requests).toFixed(2) : 0,
      errors: metrics.errors,
      avg_latency_ms: avgLatency, // ✅ REQUIREMENT: Added missing calculation
    },
    system: {
      memory_usage_mb: mem.heapUsedMB,
      cache_entries: mem.cacheSize
    }
  });
}