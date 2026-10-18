import dotenv from 'dotenv';
dotenv.config();
import axios from 'axios';

async function main() {
  const wpUser = process.env.WP_ADMIN_USER;
  const wpPass = process.env.WP_APP_PASSWORD;
  const auth = Buffer.from(`${wpUser}:${wpPass}`).toString('base64');
  const headers = { Authorization: `Basic ${auth}` };

  console.log('=== STORE READINESS AUDIT FOR US/CA LAUNCH ===\n');

  // 1. Payment Gateways
  const payRes = await axios.get('https://naturaintimo.com/wp-json/wc/v3/payment_gateways', { headers });
  const activeGateways = payRes.data.filter(g => g.enabled).map(g => ({
    id: g.id,
    title: g.title,
    description: g.description,
    method_title: g.method_title
  }));
  console.log('1. Active Payment Gateways:');
  console.log(JSON.stringify(activeGateways, null, 2));

  // 2. Shipping Zones & Methods
  const zonesRes = await axios.get('https://naturaintimo.com/wp-json/wc/v3/shipping/zones', { headers });
  const zonesDetails = [];
  for (const z of zonesRes.data) {
    const locRes = await axios.get(`https://naturaintimo.com/wp-json/wc/v3/shipping/zones/${z.id}/locations`, { headers });
    const methRes = await axios.get(`https://naturaintimo.com/wp-json/wc/v3/shipping/zones/${z.id}/methods`, { headers });
    zonesDetails.push({
      id: z.id,
      name: z.name,
      locations: locRes.data.map(l => `${l.code} (${l.type})`),
      methods: methRes.data.filter(m => m.enabled).map(m => ({
        id: m.id,
        title: m.title,
        method_id: m.method_id,
        cost: m.settings?.cost?.value || m.settings?.min_amount?.value || 'N/A'
      }))
    });
  }
  console.log('\n2. Shipping Zones:');
  console.log(JSON.stringify(zonesDetails, null, 2));

  // 3. Email Settings
  const emailRes = await axios.get('https://naturaintimo.com/wp-json/wc/v3/settings/email', { headers });
  const emailFrom = emailRes.data.find(e => e.id === 'woocommerce_email_from_address')?.value;
  const emailName = emailRes.data.find(e => e.id === 'woocommerce_email_from_name')?.value;
  console.log(`\n3. WooCommerce Transactional Emails:`);
  console.log(`From Name: "${emailName}", From Address: "${emailFrom}"`);

  // 4. Coupons & Promotions
  const coupRes = await axios.get('https://naturaintimo.com/wp-json/wc/v3/coupons?per_page=10', { headers });
  console.log('\n4. Active Coupons:');
  console.log(coupRes.data.map(c => ({
    code: c.code,
    amount: c.amount,
    discount_type: c.discount_type,
    min_spend: c.minimum_amount
  })));

  // 5. Legal Pages Verification
  const pagesRes = await axios.get('https://naturaintimo.com/wp-json/wp/v2/pages?per_page=50', { headers });
  const legalSlugs = ['privacy-policy', 'terms-and-conditions', 'terms-of-service', 'refund-policy', 'shipping-policy', 'contact', 'size-guide', 'faq'];
  const foundPages = pagesRes.data
    .filter(p => legalSlugs.some(s => p.slug.includes(s) || p.slug.includes('regulamin') || p.slug.includes('zwroty')))
    .map(p => ({ id: p.id, title: p.title.rendered, slug: p.slug }));
  console.log('\n5. Found Legal & Support Pages:');
  console.log(foundPages);
}

main().catch(console.error);
