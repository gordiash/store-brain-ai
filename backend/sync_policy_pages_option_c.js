import dotenv from 'dotenv';
dotenv.config();

const wpUser = process.env.WP_ADMIN_USER;
const wpPass = process.env.WP_APP_PASSWORD;
const siteUrl = process.env.WOOCOMMERCE_URL || 'https://naturaintimo.com';

if (!wpUser || !wpPass) {
  throw new Error('Missing credentials in .env');
}

const wpAuth = 'Basic ' + Buffer.from(`${wpUser}:${wpPass}`).toString('base64');

async function syncPolicyPages() {
  console.log('--- Synchronizacja stron prawno-informacyjnych z market_config.json (Opcja C2) ---\n');

  // 1. Aktualizacja Page 4515 (/shipping-delivery/)
  const res4515 = await fetch(`${siteUrl}/wp-json/wp/v2/pages/4515`, {
    headers: { Authorization: wpAuth }
  });
  const page4515 = await res4515.json();
  let content4515 = page4515.content.raw || page4515.content.rendered;

  // Zastąp stare progi nowymi
  const oldTiers4515Regex = /<ul style="line-height:1\.8; padding-left: 20px;">[\s\S]*?<\/ul>/;
  const newTiers4515Html = `<ul style="line-height:1.8; padding-left: 20px;">
<li><strong>Orders $150.00+ USD:</strong> <span style="color:#27ae60; font-weight:700;">100% FREE All-Inclusive</span> (Free DHL Express Delivery + All Customs Duties Covered by Store).</li>
<li><strong>Orders under $150.00 USD:</strong> Flat rate of <strong>$24.99 USD</strong> via DHL Express (Pre-Cleared DDP — All Duties &amp; Taxes Included, Zero Extra Fees).</li>
<li><strong>Canada Orders ($200.00 CAD+):</strong> <span style="color:#27ae60; font-weight:700;">FREE DHL Express</span> (0% CETA preferential tariff). Flat rate $24.99 CAD for smaller orders.</li>
<li><strong>Minimum Order:</strong> <strong>$0 USD / $0 CAD</strong> (No minimum order required — purchase single bras or accessories).</li>
</ul>`;

  if (oldTiers4515Regex.test(content4515)) {
    content4515 = content4515.replace(oldTiers4515Regex, newTiers4515Html);
  } else {
    console.warn('⚠️ Nie dopasowano regexu dla 4515, sprawdzam zamianę bezpośrednią...');
    content4515 = content4515
      .replace(/Orders \$199\.00\+ USD:[\s\S]*?<\/li>/, 'Orders $150.00+ USD:</strong> <span style="color:#27ae60; font-weight:700;">100% FREE All-Inclusive</span> (Free DHL Express Delivery + All Customs Duties Covered by Store).</li>')
      .replace(/Orders \$150\.00 – \$198\.99 USD:[\s\S]*?<\/li>/, '')
      .replace(/Orders under \$150\.00 USD:[\s\S]*?<\/li>/, 'Orders under $150.00 USD:</strong> Flat rate of <strong>$24.99 USD</strong> via DHL Express (Pre-Cleared DDP — All Duties &amp; Taxes Included, Zero Extra Fees).</li>');
  }

  const put4515 = await fetch(`${siteUrl}/wp-json/wp/v2/pages/4515`, {
    method: 'PUT',
    headers: {
      Authorization: wpAuth,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ content: content4515 })
  });

  if (put4515.ok) {
    console.log('✅ Zaktualizowano Page 4515 (/shipping-delivery/)');
  } else {
    console.error('❌ Błąd aktualizacji Page 4515:', put4515.status);
  }

  // 2. Aktualizacja Page 4554 (/terms-conditions-usa-canada/)
  const res4554 = await fetch(`${siteUrl}/wp-json/wp/v2/pages/4554`, {
    headers: { Authorization: wpAuth }
  });
  const page4554 = await res4554.json();
  let content4554 = page4554.content.raw || page4554.content.rendered;

  content4554 = content4554.replace(
    'Standard shipping is $19.99 USD, and orders of <strong>$150 USD or more qualify for FREE DHL Express Shipping</strong>',
    'Standard shipping is <strong>$24.99 USD</strong> (all customs duties &amp; import clearance included), and orders of <strong>$150 USD or more qualify for 100% FREE DHL Express Shipping</strong>'
  );

  content4554 = content4554.replace(
    /Orders under \$199 USD include an all-inclusive \$14\.99 USD customs &amp; duty pre-clearance charge at checkout, while orders of <strong>\$199 USD or more receive 100% complimentary customs duty coverage paid by Natura Intimo<\/strong>\./,
    'All customs duties, tariffs, and import clearance fees are pre-paid and included in our flat $24.99 rate (or 100% free on orders $150+ USD).'
  );

  const put4554 = await fetch(`${siteUrl}/wp-json/wp/v2/pages/4554`, {
    method: 'PUT',
    headers: {
      Authorization: wpAuth,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ content: content4554 })
  });

  if (put4554.ok) {
    console.log('✅ Zaktualizowano Page 4554 (/terms-conditions-usa-canada/)');
  } else {
    console.error('❌ Błąd aktualizacji Page 4554:', put4554.status);
  }
}

syncPolicyPages().catch(console.error);
