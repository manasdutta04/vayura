import { NextResponse } from 'next/server';
import { oxygenService } from '@/services/oxygenService';
import { oxygenCache } from '@/lib/oxygenCache';

// 1. Rate Limiter (IP Based)
const rateLimitMap = new Map<string, { count: number, reset: number }>();

function checkRateLimit(ip: string) {
  const now = Date.now();
  const limit = 60; // 60 requests per minute
  
  let record = rateLimitMap.get(ip);
  if (!record || now > record.reset) {
    record = { count: 0, reset: now + 60000 };
    rateLimitMap.set(ip, record);
  }
  
  record.count++;
  return record.count <= limit;
}

// Global Metrics Store
export const metrics = {
  requests: 0,
  cacheHits: 0,
  errors: 0
};

export async function POST(req: Request) {
  // Rate Limit Check
  const ip = req.headers.get('x-forwarded-for') || 'unknown';
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  try {
    const body = await req.json();
    
    // Batch Request Handler
    if (Array.isArray(body.requests)) {
        const results = await oxygenService.calculateBatch(body.requests);
        return NextResponse.json({ success: true, data: results });
    }

    // Single Request
    const { districtId = 'generic', trees = 100, age = 5 } = body;
    const result = await oxygenService.calculate(districtId, Number(trees), Number(age));

    // Update Metrics
    metrics.requests++;
    if (result.source !== 'calculation') metrics.cacheHits++;

    return NextResponse.json({
      success: true,
      data: result.data,
      meta: {
        source: result.source,
        memory: oxygenCache.getMemoryUsage()
      }
    });

  } catch (error) {
    metrics.errors++;
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}