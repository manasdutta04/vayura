// Run with: node scripts/load-test.js
/* eslint-disable @typescript-eslint/no-require-imports */
const http = require('http');

const TOTAL_REQUESTS = 500;
const CONCURRENCY = 50; // 50 concurrent requests
const URL = 'http://localhost:3000/api/calculator';

const runRequest = () => {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const req = http.request(URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, time: Date.now() - start }));
    });
    
    req.on('error', reject);
    req.write(JSON.stringify({ districtId: 'load-test', trees: 100, age: 5 }));
    req.end();
  });
};

async function runLoadTest() {
  console.log(`🚀 Starting Load Test: ${TOTAL_REQUESTS} requests, ${CONCURRENCY} concurrent...`);
  const start = Date.now();
  
  const promises = [];
  for (let i = 0; i < TOTAL_REQUESTS; i++) {
    promises.push(runRequest());
    if (promises.length >= CONCURRENCY) {
      await Promise.all(promises);
      promises.length = 0;
    }
  }
  
  await Promise.all(promises); // Finish remaining
  const duration = (Date.now() - start) / 1000;
  const reqPerSec = TOTAL_REQUESTS / duration;
  
  console.log(`\n📊 Results:`);
  console.log(`   Time: ${duration.toFixed(2)}s`);
  console.log(`   Throughput: ${reqPerSec.toFixed(2)} req/sec`);
  
  if (reqPerSec > 50) console.log('✅ PASS: >50 req/sec achieved');
  else console.log('❌ FAIL: <50 req/sec');
}

runLoadTest();
