import dotenv from 'dotenv';
dotenv.config();
import axios from 'axios';
import fs from 'fs';

async function main() {
  const wpUser = process.env.WP_ADMIN_USER;
  const wpPass = process.env.WP_APP_PASSWORD;
  const auth = Buffer.from(`${wpUser}:${wpPass}`).toString('base64');
  const headers = { Authorization: `Basic ${auth}` };

  let page = 1;
  let allProducts = [];
  while (true) {
    const res = await axios.get(`https://naturaintimo.com/wp-json/wc/v3/products?per_page=100&page=${page}`, { headers });
    if (!res.data || res.data.length === 0) break;
    allProducts = allProducts.concat(res.data);
    page++;
  }

  console.log(`Fetched ${allProducts.length} products.`);

  const summary = allProducts.map(p => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    permalink: p.permalink,
    images: p.images.map(img => ({ id: img.id, src: img.src })),
    variations_count: p.variations.length
  }));

  fs.writeFileSync('backend/products_audit_before.json', JSON.stringify(summary, null, 2));
  console.log('Saved to backend/products_audit_before.json');
}

main().catch(console.error);
