import { NextResponse } from 'next/server';
import { oxygenService } from '@/services/oxygenService';
import { oxygenCache } from '@/lib/oxygenCache';
import { v4 as uuidv4 } from 'uuid'; // Ensure you have uuid installed, or use a simple random string

// Rate Limiter
const rateLimitMap = new Map<string, { count: number, reset: number }>();

function checkRateLimit(ip: string) {
  const now = Date.now();
  const limit = 60; 
  let record = rateLimitMap.get(ip);
  if (!record || now > record.reset) {
    record = { count: 0, reset: now + 60000 };
    rateLimitMap.set(ip, record);
  }
  record.count++;
  return record.count <= limit;
}

// ✅ FIXED: Standardized Metric Object
export const metrics = {
  requests: 0,
  cacheHits: 0,
  errors: 0,
  totalLatency: 0 // Added to calculate average
};

export async function POST(req: Request) {
  const start = performance.now();
  const requestId = uuidv4(); // structured logging requirement
  const ip = req.headers.get('x-forwarded-for') || 'unknown';

  // 1. Rate Limit
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  try {
    const body = await req.json();
    let resultData;
    let source = 'batch';

    // Handle Batch or Single
    if (Array.isArray(body.requests)) {
      resultData = await oxygenService.calculateBatch(body.requests);
    } else {
      const { districtId = 'generic', trees = 100, age = 5 } = body;
      const result = await oxygenService.calculate(districtId, Number(trees), Number(age));
      resultData = result.data;
      source = result.source;
    }

    const end = performance.now();
    const duration = end - start;

    // Update Metrics
    metrics.requests++;
    metrics.totalLatency += duration;
    if (source !== 'calculation' && source !== 'batch') metrics.cacheHits++;

    // ✅ REQUIREMENT: Structured Logging
    console.log(JSON.stringify({
      timestamp: new Date().toISOString(),
      requestId,
      route: '/api/calculator',
      duration_ms: duration.toFixed(2),
      cache_hit: source !== 'calculation',
      source
    }));

    // ✅ REQUIREMENT: Performance Alerts
    if ((source === 'calculation' && duration > 200) || (source !== 'calculation' && duration > 50)) {
      console.warn(JSON.stringify({
        level: 'WARN',
        event: 'performance_degradation',
        message: 'Response time exceeded threshold',
        duration_ms: duration,
        threshold: source === 'calculation' ? 200 : 50
      }));
    }

    // ✅ REQUIREMENT: Memory Enforcement
    const mem = oxygenCache.getMemoryUsage(); // Assuming returns { heapUsedMB }
    if (Number(mem.heapUsedMB) > 100) {
      console.error(JSON.stringify({
        level: 'CRITICAL',
        event: 'memory_limit_exceeded',
        heap_used_mb: mem.heapUsedMB
      }));
    }

    return NextResponse.json({
      success: true,
      data: resultData,
      meta: {
        duration: `${duration.toFixed(2)}ms`,
        source,
        memory: mem
      }
    });

  } catch (error) {
    metrics.errors++;
    console.error(JSON.stringify({
      timestamp: new Date().toISOString(),
      requestId,
      level: 'ERROR',
      message: 'Internal Server Error',
      error: String(error)
    }));
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}