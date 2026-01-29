import { NextResponse } from 'next/server';
import { oxygenService } from '@/services/oxygenService';
import { performance } from 'perf_hooks';

export async function POST(req: Request) {
  const start = performance.now();
  
  try {
    const body = await req.json();
    const { districtId = 'default', trees = 100, age = 5 } = body;

    // Call the optimized service
    const result = await oxygenService.calculate(districtId, Number(trees), Number(age));

    const end = performance.now();
    const duration = (end - start).toFixed(2);
    
    // Structured Logging for monitoring
    console.log(JSON.stringify({
      level: 'INFO',
      event: 'oxygen_calculation',
      districtId,
      duration_ms: Number(duration),
      source: result.source,
      timestamp: new Date().toISOString()
    }));

    return NextResponse.json({
      success: true,
      data: result.data,
      meta: {
        duration: `${duration}ms`,
        source: result.source,
        cacheHit: result.source !== 'calculation'
      }
    });

  } catch (error) {
    console.error('Calculation Error:', error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}