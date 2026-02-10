
async function testCache() {
    const url1 = 'http://localhost:3000/api/districts?q=a';
    const url2 = 'http://localhost:3000/api/districts?q=b';

    console.log('--- Request 1 (Query "a" - Expect Cache Miss) ---');
    const start1 = Date.now();
    try {
        const res1 = await fetch(url1);
        const json1 = await res1.json();
        const time1 = Date.now() - start1;
        console.log(`Response Time: ${time1}ms`);
    } catch (e) {
        console.log('Error fetching:', e.message);
    }

    // Wait a bit
    await new Promise(resolve => setTimeout(resolve, 1000));

    console.log('\n--- Request 2 (Query "b" - Expect Cache Hit with new strategy) ---');
    const start2 = Date.now();
    try {
        const res2 = await fetch(url2);
        const json2 = await res2.json();
        const time2 = Date.now() - start2;
        console.log(`Response Time: ${time2}ms`);
    } catch (e) {
        console.log('Error fetching:', e.message);
    }
}

testCache();
