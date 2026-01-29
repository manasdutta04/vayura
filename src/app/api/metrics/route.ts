import { NextResponse } from 'next/server';
import { metrics } from '../calculator/route'; // Import shared metrics
import { oxygenCache } from '@/lib/oxygenCache';

export async function GET() {
  const mem = oxygenCache.getMemoryUsage();
  
  return NextResponse.json({
    status: 'healthy',
    uptime: process.uptime(),
    throughput: {
      total_requests: metrics.totalRequests,
      cache_hits: metrics.cacheHits,
      hit_rate: metrics.totalRequests ? (metrics.cacheHits / metrics.totalRequests).toFixed(2) : 0,
      errors: metrics.errors
    },
    performance: {
      avg_latency_ms: metrics.avgLatency.toFixed(2),
      memory_usage_mb: mem.heapUsed.toFixed(2),
      cache_items: mem.cacheSize
    }
  });
}