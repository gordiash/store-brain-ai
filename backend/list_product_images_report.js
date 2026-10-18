import dotenv from 'dotenv';
dotenv.config();
import axios from 'axios';

async function listAllProductImages() {
  const wpUser = process.env.WP_ADMIN_USER;
  const wpPass = process.env.WP_APP_PASSWORD;
  const auth = Buffer.from(`${wpUser}:${wpPass}`).toString('base64');
  const headers = { Authorization: `Basic ${auth}` };

  let page = 1;
  let all = [];
  while (true) {
    const res = await axios.get(`https://naturaintimo.com/wp-json/wc/v3/products?per_page=50&page=${page}`, { headers });
    if (!res.data || res.data.length === 0) break;
    all = all.concat(res.data);
    page++;
  }

  console.log(`Loaded ${all.length} products.`);

  const report = all.map(p => {
    const cats = p.categories.map(c => c.name);
    const isBra = cats.some(c => c.toLowerCase().includes('bra'));
    const isPanty = cats.some(c => c.toLowerCase().includes('pant') || c.toLowerCase().includes('brief'));
    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      permalink: p.permalink,
      type: isBra ? 'BRA' : isPanty ? 'PANTY' : 'OTHER',
      images: p.images.map((img, i) => ({ index: i, id: img.id, src: img.src }))
    };
  });

  console.log(JSON.stringify(report.slice(0, 10), null, 2));
}

listAllProductImages().catch(console.error);
