import { NextResponse } from 'next/server';
import { oxygenService } from '@/services/oxygenService';
import { oxygenCache } from '@/lib/oxygenCache';

// Simple In-Memory Rate Limiter (IP based)
const rateLimitMap = new Map<string, { count: number, reset: number }>();

function checkRateLimit(ip: string) {
  const now = Date.now();
  const window = 60000; // 1 minute
  const limit = 60; // 60 req/min

  let record = rateLimitMap.get(ip);
  if (!record || now > record.reset) {
    record = { count: 0, reset: now + window };
    rateLimitMap.set(ip, record);
  }

  record.count++;
  return record.count <= limit;
}

// Metrics Storage (for /api/metrics endpoint)
export const metrics = {
  totalRequests: 0,
  cacheHits: 0,
  errors: 0,
  avgLatency: 0
};

export async function POST(req: Request) {
  const start = performance.now();
  // Get IP (Generic fallback)
  const ip = req.headers.get('x-forwarded-for') || 'unknown';

  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  try {
    const body = await req.json();
    
    // Handle Batch Requests
    if (Array.isArray(body.requests)) {
        const results = await oxygenService.calculateBatch(body.requests);
        return NextResponse.json({ success: true, data: results });
    }

    // Single Request
    const { districtId = 'generic', trees = 100, age = 5 } = body;
    const result = await oxygenService.calculate(districtId, Number(trees), Number(age));

    // Update Metrics
    const latency = performance.now() - start;
    metrics.totalRequests++;
    metrics.avgLatency = (metrics.avgLatency * (metrics.totalRequests - 1) + latency) / metrics.totalRequests;
    if (result.source !== 'calculation') metrics.cacheHits++;

    return NextResponse.json({
      success: true,
      data: result.data,
      meta: {
        duration: `${latency.toFixed(2)}ms`,
        source: result.source,
        memory: oxygenCache.getMemoryUsage()
      }
    });

  } catch (error) {
    metrics.errors++;
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}