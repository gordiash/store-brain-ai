import dotenv from 'dotenv';
dotenv.config();

const siteUrl = process.env.WOOCOMMERCE_URL || 'https://naturaintimo.com';

async function inspectClasses() {
  const res = await fetch(siteUrl + '/new-arrivals/?v=' + Date.now());
  const html = await res.text();
  const m = html.match(/<li\s+class="([^"]*product[^"]*)"/);
  console.log('Product 1 full class attribute:\n', m ? m[1] : 'NOT FOUND');
}
inspectClasses().catch(console.error);
