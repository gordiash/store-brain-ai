import dotenv from 'dotenv';
dotenv.config();

const siteUrl = process.env.WOOCOMMERCE_URL || 'https://naturaintimo.com';

async function testUrl(urlPath) {
  const fullUrl = siteUrl + urlPath + (urlPath.includes('?') ? '&' : '?') + 'v=' + Date.now();
  console.log('\n======================================================');
  console.log('Testing URL:', fullUrl);
  console.log('======================================================');

  const res = await fetch(fullUrl);
  const html = await res.text();

  const regex = /<li\s+class="([^"]*product[^"]*)"/g;
  let m;
  const products = [];
  while ((m = regex.exec(html)) !== null) {
    const classList = m[1].split(/\s+/);
    products.push(classList);
  }

  console.log('Total products on page:', products.length);

  const testCases = [
    { type: 'brand', val: 'ava' },
    { type: 'brand', val: 'gaia' },
    { type: 'brand', val: 'gorsenia' },
    { type: 'color', val: 'black' },
    { type: 'color', val: 'beige' },
    { type: 'color', val: 'white' },
    { type: 'color', val: 'navy' },
    { type: 'color', val: 'burgundy' },
    { type: 'color', val: 'mocha' },
    { type: 'price', val: 'under-75' },
    { type: 'price', val: '75-90' },
    { type: 'price', val: 'over-90' },
    { type: 'size', val: 's' },
    { type: 'size', val: 'm' },
    { type: 'size', val: 'l' },
    { type: 'size', val: 'xl' },
    { type: 'size', val: '2xl' },
    { type: 'size', val: '3xl' },
    { type: 'band', val: '65' },
    { type: 'band', val: '70' },
    { type: 'band', val: '75' },
    { type: 'band', val: '80' },
    { type: 'band', val: '85' },
    { type: 'band', val: '90' },
    { type: 'band', val: '95' },
    { type: 'band', val: '100' },
    { type: 'cup', val: 'b' },
    { type: 'cup', val: 'c' },
    { type: 'cup', val: 'd' },
    { type: 'cup', val: 'e' },
    { type: 'cup', val: 'f' },
    { type: 'cup', val: 'g' },
    { type: 'cup', val: 'h' },
    { type: 'cup', val: 'i' },
    { type: 'cup', val: 'j' },
    { type: 'cup', val: 'k' },
    { type: 'cup', val: 'l' },
    { type: 'cup', val: 'm' }
  ];

  for (const tc of testCases) {
    let matchCount = 0;
    const targetClass = 'ni-f-' + tc.type + '-' + tc.val;
    for (const p of products) {
      if (p.includes(targetClass)) matchCount++;
    }
    console.log(`Filter ${tc.type.padEnd(6)} = ${tc.val.padEnd(10)} (${targetClass}) => Matches: ${matchCount}`);
  }
}

async function runAll() {
  await testUrl('/new-arrivals/');
  await testUrl('/product-category/bras/');
}

runAll().catch(console.error);
