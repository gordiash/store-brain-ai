import dotenv from 'dotenv';
dotenv.config();
import axios from 'axios';

async function updateTerms() {
  const wpUser = process.env.WP_ADMIN_USER;
  const wpPass = process.env.WP_APP_PASSWORD;
  const auth = Buffer.from(`${wpUser}:${wpPass}`).toString('base64');
  const headers = { Authorization: `Basic ${auth}` };

  const res = await axios.get('https://naturaintimo.com/wp-json/wp/v2/pages/4554', { headers });
  let content = res.data.content.rendered;

  const oldSec6 = `<section>\n<h2>6. Shipping to the United States and Canada</h2>\n<p>Orders are dispatched from Poland. FedEx Economy shipping is charged at <strong>PLN 200 per order</strong>; checkout displays the converted amount in the active store currency. Delivery estimates are not guarantees. Customs processing, weather, peak periods and carrier disruption may cause delays. Full details are available on our <a href="/shipping-delivery/">Shipping &amp; Delivery</a> page.</p>\n</section>`;

  const newSec6 = `<section>\n<h2>6. Shipping to the United States and Canada</h2>\n<p>Orders are prepared in Poland and dispatched via <strong>DHL Express Worldwide</strong> (2–4 business days delivery) for U.S. orders, and tracked international shipping for Canadian orders. Standard shipping is $19.99 USD, and orders of <strong>$150 USD or more qualify for FREE DHL Express Shipping</strong>. A minimum order threshold of $99 USD applies to U.S. deliveries. Delivery estimates are carrier targets. Full details are available on our <a href="/shipping-delivery/">Shipping &amp; Delivery</a> page.</p>\n</section>`;

  const oldSec7 = `<section>\n<h2>7. Duties, taxes and import charges</h2>\n<p>Unless checkout expressly states otherwise, import duties, sales taxes, customs charges, brokerage or carrier handling fees are not included in the product or shipping price and are the recipient’s responsibility. You are responsible for complying with import rules at the destination.</p>\n</section>`;

  const newSec7 = `<section>\n<h2>7. Guaranteed DDP (Delivery Duty Paid) & Customs Clearance</h2>\n<p>For orders shipped to the <strong>United States</strong>, Natura Intimo provides a <strong>Guaranteed DDP (Delivery Duty Paid)</strong> experience. All shipments are pre-cleared through U.S. Customs. Orders under $199 USD include an all-inclusive $14.99 USD customs & duty pre-clearance charge at checkout, while orders of <strong>$199 USD or more receive 100% complimentary duty coverage paid by Natura Intimo</strong>. <strong>No unexpected duties, customs brokerage, or carrier fees will ever be collected upon delivery.</strong> For Canadian orders, deliveries are fulfilled DAP with destination GST/HST and duties assessed according to Canadian CBSA regulations.</p>\n</section>`;

  if (!content.includes('PLN 200 per order')) {
    console.error('Old content string not found in 4554!');
    process.exit(1);
  }

  content = content.replace(oldSec6, newSec6).replace(oldSec7, newSec7);

  const updateRes = await axios.put('https://naturaintimo.com/wp-json/wp/v2/pages/4554', { content }, { headers });
  console.log('Successfully updated Terms & Conditions (page 4554):', updateRes.data.title.rendered);
}

updateTerms().catch(err => {
  console.error('Error updating terms:', err.response ? err.response.data : err.message);
  process.exit(1);
});
