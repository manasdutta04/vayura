import { performance } from 'perf_hooks';

export async function runBenchmark(
  testName: string,
  fn: () => Promise<unknown>,
  iterations: number = 5
) {
  console.log(`\n🚀 Starting Benchmark: ${testName}`);
  console.log('-----------------------------------');

  const times: number[] = [];

  // Cold Start (First Run)
  const startCold = performance.now();
  await fn();
  const endCold = performance.now();
  const coldDuration = endCold - startCold;
  console.log(`❄️ Cold Start: ${coldDuration.toFixed(2)}ms`);

  // Warm Runs
  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    await fn();
    const end = performance.now();
    times.push(end - start);
  }

  // Stats
  const avg = times.reduce((a, b) => a + b, 0) / times.length;
  const min = Math.min(...times);
  const max = Math.max(...times);

  console.log(`🔥 Warm Avg:  ${avg.toFixed(2)}ms`);
  console.log(`⚡ Fastest:   ${min.toFixed(2)}ms`);
  console.log(`🐢 Slowest:   ${max.toFixed(2)}ms`);
  console.log('-----------------------------------');

  return { cold: coldDuration, avg };
}