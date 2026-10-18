import https from 'https';

const pages = [
  { name: 'Homepage (Front Page)', url: 'https://naturaintimo.com/' },
  { name: 'Bras Category Page', url: 'https://naturaintimo.com/bras/' },
  { name: 'Full-Bust Landing Page', url: 'https://naturaintimo.com/full-bust-bras/' },
  { name: 'Panties Category Page', url: 'https://naturaintimo.com/panties/' },
  { name: 'Product: Ava Divine 2271', url: 'https://naturaintimo.com/product/bra-soft-ava-2271-divine-champagne-wine/' },
  { name: 'Product: Gorsenia Luisse', url: 'https://naturaintimo.com/product/bra-soft-gorsenia-k-441-1-luisse-black/' },
  { name: 'Refund Policy (Legal/DDP)', url: 'https://naturaintimo.com/refund-policy/' },
  { name: 'Terms & Conditions', url: 'https://naturaintimo.com/terms-conditions-usa-canada/' },
  { name: 'Shipping & Delivery', url: 'https://naturaintimo.com/shipping-delivery/' }
];

function testRequest(url) {
  return new Promise((resolve, reject) => {
    const start = process.hrtime.bigint();
    let ttfb = 0;
    const req = https.get(url, (res) => {
      ttfb = Number(process.hrtime.bigint() - start) / 1e6; // ms
      let bytes = 0;
      res.on('data', (chunk) => (bytes += chunk.length));
      res.on('end', () => {
        const total = Number(process.hrtime.bigint() - start) / 1e6;
        resolve({
          statusCode: res.statusCode,
          cache: res.headers['x-litespeed-cache'] || 'none',
          ttfb: Math.round(ttfb),
          total: Math.round(total),
          kb: Math.round(bytes / 1024)
        });
      });
    });
    req.on('error', reject);
  });
}

async function main() {
  console.log('='.repeat(80));
  console.log('NATURA INTIMO SPEED & PERFORMANCE BENCHMARK (POST-OPTIMIZATION)');
  console.log('='.repeat(80));
  console.log('Page Name'.padEnd(30) + 'Status'.padEnd(8) + 'Cache'.padEnd(8) + 'TTFB'.padEnd(10) + 'Total'.padEnd(10) + 'Size');
  console.log('-'.repeat(80));

  for (const page of pages) {
    const res = await testRequest(page.url);
    console.log(
      page.name.padEnd(30) +
      String(res.statusCode).padEnd(8) +
      res.cache.padEnd(8) +
      (res.ttfb + ' ms').padEnd(10) +
      (res.total + ' ms').padEnd(10) +
      res.kb + ' KB'
    );
  }
  console.log('='.repeat(80));
}

main().catch(console.error);
