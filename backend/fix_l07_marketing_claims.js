import dotenv from 'dotenv';
dotenv.config();
import axios from 'axios';
import WooCommerceRestApiPackage from '@woocommerce/woocommerce-rest-api';
const WooCommerceRestApi = WooCommerceRestApiPackage.default;

const api = new WooCommerceRestApi({
  url: process.env.WOOCOMMERCE_URL,
  consumerKey: process.env.WOOCOMMERCE_CONSUMER_KEY,
  consumerSecret: process.env.WOOCOMMERCE_CONSUMER_SECRET,
  version: 'wc/v3'
});

async function runL07() {
  const wpUser = process.env.WP_ADMIN_USER;
  const wpPass = process.env.WP_APP_PASSWORD;
  const auth = Buffer.from(`${wpUser}:${wpPass}`).toString('base64');
  const headers = { Authorization: `Basic ${auth}` };

  console.log('1. Updating Homepage (page 4509)...');
  const resHome = await axios.get('https://naturaintimo.com/wp-json/wp/v2/pages/4509', { headers });
  let homeContent = resHome.data.content.rendered;

  // Replace "Handcrafted lingerie designed for support" -> "European-made lingerie designed for support"
  homeContent = homeContent.replace(
    'Handcrafted lingerie designed for support, elegance, and all-day comfort.',
    'European-made lingerie designed for exceptional support, elegance, and all-day comfort.'
  );

  // Replace badge "Bestseller" -> "Featured Style"
  homeContent = homeContent.replace(
    '<span class="ni-c-badge">Bestseller</span>',
    '<span class="ni-c-badge">Featured Style</span>'
  );

  await axios.put('https://naturaintimo.com/wp-json/wp/v2/pages/4509', { content: homeContent }, { headers });
  console.log('Homepage updated successfully.');

  console.log('2. Updating Refund Policy (page 4517)...');
  const resRefund = await axios.get('https://naturaintimo.com/wp-json/wp/v2/pages/4517', { headers });
  let refundContent = resRefund.data.content.rendered;

  refundContent = refundContent.replace(
    'Due to health and sanitary regulations applicable to intimate apparel',
    'For essential hygiene and safety standards applicable to intimate apparel'
  );

  await axios.put('https://naturaintimo.com/wp-json/wp/v2/pages/4517', { content: refundContent }, { headers });
  console.log('Refund policy updated successfully.');

  console.log('3. Updating Products with unsubstantiated claims...');
  const resProds = await api.get('products?per_page=100');
  let prodsUpdated = 0;

  for (const p of resProds.data) {
    let desc = p.description || '';
    let changed = false;

    if (desc.includes('tailored')) {
      desc = desc.replace(/\btailored\b/gi, 'crafted');
      changed = true;
    }
    if (desc.includes('skin-friendly')) {
      desc = desc.replace(/\bskin-friendly\b/gi, 'comfortable');
      changed = true;
    }

    if (changed) {
      await api.put(`products/${p.id}`, { description: desc });
      console.log(`Updated product ${p.id} (${p.name})`);
      prodsUpdated++;
    }
  }

  console.log(`Updated ${prodsUpdated} products for L-07 compliance.`);
}

runL07().catch(console.error);
