import dotenv from 'dotenv';
dotenv.config();

const siteUrl = process.env.WOOCOMMERCE_URL || 'https://naturaintimo.com';

async function testCompoundFilters() {
  const fullUrl = `${siteUrl}/new-arrivals/?v=${Date.now()}`;
  console.log('Testing compound filters against:', fullUrl);

  const res = await fetch(fullUrl);
  const html = await res.text();

  const regex = /<li\s+class="([^"]*product[^"]*)"/g;
  let m;
  const products = [];
  while ((m = regex.exec(html)) !== null) {
    products.push(m[1].split(/\s+/));
  }

  console.log(`Loaded ${products.length} products on page.\n`);

  const compoundCases = [
    { name: 'Band 75 + Cup E (Size 75E / 34DD)', check: p => p.includes('ni-f-bra-75e') },
    { name: 'Band 75 + Cup F (Size 75F / 34DDD)', check: p => p.includes('ni-f-bra-75f') },
    { name: 'Band 70 + Cup D (Size 70D / 32D)', check: p => p.includes('ni-f-bra-70d') },
    { name: 'Band 80 + Cup G (Size 80G / 36G)', check: p => p.includes('ni-f-bra-80g') },
    { name: 'Band 85 + Cup H (Size 85H / 38H)', check: p => p.includes('ni-f-bra-85h') },
    { name: 'Gorsenia + Cup H', check: p => p.includes('ni-f-brand-gorsenia') && p.includes('ni-f-cup-h') },
    { name: 'Ava + Band 75', check: p => p.includes('ni-f-brand-ava') && p.includes('ni-f-band-75') },
    { name: 'Gaia + Color Burgundy', check: p => p.includes('ni-f-brand-gaia') && p.includes('ni-f-color-burgundy') },
    { name: 'Briefs Size M + Color Black', check: p => p.includes('ni-f-size-m') && p.includes('ni-f-color-black') },
    { name: 'Briefs Size 2XL + Color Beige', check: p => p.includes('ni-f-size-2xl') && p.includes('ni-f-color-beige') }
  ];

  for (const tc of compoundCases) {
    const matches = products.filter(tc.check).length;
    console.log(`✅ [${tc.name}]: ${matches} matching products`);
  }
}

testCompoundFilters().catch(console.error);
