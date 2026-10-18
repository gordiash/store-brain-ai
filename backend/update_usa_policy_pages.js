import https from 'https';
import dotenv from 'dotenv';
dotenv.config();

const wpUser = process.env.WP_ADMIN_USER;
const wpPass = process.env.WP_APP_PASSWORD;
const wpAuth = Buffer.from(`${wpUser}:${wpPass}`).toString('base64');

const put = (id, data) => new Promise((resolve) => {
  const postData = JSON.stringify(data);
  const req = https.request(`https://naturaintimo.com/wp-json/wp/v2/pages/${id}`, {
    method: 'PUT',
    headers: {
      'Authorization': 'Basic ' + wpAuth,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  }, (res) => {
    let body = '';
    res.on('data', c => body += c);
    res.on('end', () => resolve({ status: res.statusCode, body }));
  });
  req.write(postData);
  req.end();
});

async function updatePolicyPages() {
  console.log('--- Aktualizacja stron informacyjnych (Shipping & Refund) ---');

  // 1. Page 4515: Shipping & Delivery
  const shippingContent = `<style>
body.page-id-4515 .entry-header, body.page-id-4515 .ast-breadcrumbs-wrapper { display: none; }
body.page-id-4515 .site-content > .ast-container { max-width: 100%; padding: 0; }
body.page-id-4515 .entry-content { margin: 0; }
.ni-policy { color: #30252b; font-family: inherit; }
.ni-policy * { box-sizing: border-box; }
.ni-policy-hero { padding: 70px 24px; text-align: center; background: linear-gradient(135deg, #fffaf7, #f4e9ed); border-radius: 0 0 32px 32px; }
.ni-policy-hero h1 { font-size: clamp(2.2rem, 5vw, 4rem); max-width: 850px; margin: 12px auto; color: #2d1e26; font-weight: 700; }
.ni-policy-wrap { max-width: 1050px; margin: auto; padding: 50px 24px; }
.ni-policy-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px; }
.ni-policy-card { padding: 32px; border: 1px solid #eadde1; border-radius: 18px; background: #fffcf9; box-shadow: 0 8px 24px rgba(67, 39, 49, 0.04); }
.ni-policy-card h2 { margin-top: 0; font-size: 1.4rem; color: #2d1e26; border-bottom: 2px solid #f0e1e6; padding-bottom: 10px; }
.ni-policy-badge { display: inline-block; padding: 4px 10px; border-radius: 6px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; background: #ecd3dc; color: #823a54; margin-bottom: 12px; }
.ni-policy-note { padding: 32px; border-radius: 18px; background: #2d1e26; color: #fff; text-align: center; margin-top: 30px; }
@media (max-width: 768px) { .ni-policy-grid { grid-template-columns: 1fr; } .ni-policy-wrap { padding: 35px 20px; } }
</style>

<div class="ni-policy">
  <section class="ni-policy-hero">
    <span class="ni-policy-badge">Express Air Logistics</span>
    <h1>Shipping & Delivery to the United States</h1>
    <p style="max-width:680px; margin: 12px auto; font-size:1.1rem; line-height:1.6; color:#5c4752;">
      All Natura Intimo orders are carefully tailored, inspected, and dispatched directly from our European headquarters in Poland via <strong>DHL Express Worldwide</strong>.
    </p>
  </section>

  <section class="ni-policy-wrap">
    <div class="ni-policy-grid">
      <div class="ni-policy-card">
        <h2>✈️ Shipping Tiers & Costs</h2>
        <p>We provide ultra-fast express delivery with end-to-end tracking to all 50 U.S. states:</p>
        <ul style="line-height:1.8;">
          <li><strong>Orders $199.00+ USD:</strong> <span style="color:#27ae60; font-weight:700;">100% FREE All-Inclusive</span> (Free DHL Express + All Customs Duties Pre-Paid).</li>
          <li><strong>Orders $150.00 – $198.99 USD:</strong> <span style="color:#27ae60; font-weight:700;">FREE DHL Express Shipping</span> (Flat $14.99 DDP customs processing).</li>
          <li><strong>Orders $99.00 – $149.99 USD:</strong> Flat rate of <strong>$19.99 USD</strong> via DHL Express (+ $14.99 DDP processing).</li>
          <li><strong>Minimum Order:</strong> $99.00 USD for shipping to the United States.</li>
        </ul>
      </div>

      <div class="ni-policy-card">
        <h2>🛡️ Guaranteed DDP (No Surprise Fees)</h2>
        <p>All U.S. orders are cleared under <strong>Incoterms DDP (Delivery Duty Paid)</strong>:</p>
        <p>Every shipment is officially cleared through U.S. Customs prior to final delivery. <strong>You will never receive unexpected invoices, import duties, or carrier collection fees at your door.</strong> The price at checkout is 100% final.</p>
      </div>

      <div class="ni-policy-card">
        <h2>⚡ Transit Time & Tracking</h2>
        <p>Because your lingerie is transported via DHL Express Air:</p>
        <ul style="line-height:1.8;">
          <li><strong>Order Preparation:</strong> 24–48 hours (quality inspection & discreet packaging).</li>
          <li><strong>Air Transit Time:</strong> <strong>2 to 4 business days</strong> door-to-door to anywhere in the continental U.S., Alaska, and Hawaii.</li>
          <li><strong>Real-Time Tracking:</strong> Automated DHL On Demand Delivery (ODD) notifications via email & SMS.</li>
        </ul>
      </div>

      <div class="ni-policy-card">
        <h2>🎀 Discreet Luxury Packaging</h2>
        <p>Every piece of lingerie is packaged with utmost care and elegance:</p>
        <p>Your order arrives in sturdy, tamper-evident protective outer packaging with no external lingerie logos or descriptions, guaranteeing total privacy and protecting delicate European fabrics during flight.</p>
      </div>
    </div>

    <div class="ni-policy-note">
      <h2 style="color:#fff; border-bottom:none;">Questions About Your Shipment?</h2>
      <p style="margin: 8px 0 16px; color:#e0d0d6;">Our customer concierge team is here to assist with tracking, delivery preferences, or customs clearance inquiries.</p>
      <p><a style="color:#ffd700; font-weight:600; text-decoration:none;" href="mailto:sklep@naturaintimo.com">sklep@naturaintimo.com</a></p>
    </div>
  </section>
</div>`;

  console.log('Updating page 4515 (Shipping & Delivery)...');
  const res4515 = await put(4515, { content: shippingContent });
  console.log('Status 4515:', res4515.status);

  // 2. Page 4517: Refund Policy
  const refundContent = `<style>
body.page-id-4517 .entry-header, body.page-id-4517 .ast-breadcrumbs-wrapper { display: none; }
body.page-id-4517 .site-content > .ast-container { max-width: 100%; padding: 0; }
body.page-id-4517 .entry-content { margin: 0; }
.ni-policy { color: #30252b; font-family: inherit; }
.ni-policy * { box-sizing: border-box; }
.ni-policy-hero { padding: 70px 24px; text-align: center; background: linear-gradient(135deg, #fffaf7, #f4e9ed); border-radius: 0 0 32px 32px; }
.ni-policy-hero h1 { font-size: clamp(2.2rem, 5vw, 4rem); max-width: 850px; margin: 12px auto; color: #2d1e26; font-weight: 700; }
.ni-policy-wrap { max-width: 1050px; margin: auto; padding: 50px 24px; }
.ni-policy-card { padding: 32px; border: 1px solid #eadde1; border-radius: 18px; background: #fffcf9; box-shadow: 0 8px 24px rgba(67, 39, 49, 0.04); margin-bottom: 24px; }
.ni-policy-card h2 { margin-top: 0; font-size: 1.35rem; color: #2d1e26; }
</style>

<div class="ni-policy">
  <section class="ni-policy-hero">
    <h1>Returns & Exchanges – USA & International</h1>
    <p style="max-width:680px; margin: 12px auto; font-size:1.1rem; line-height:1.6; color:#5c4752;">
      We want you to feel confident and beautiful in your Natura Intimo lingerie. Here are our guidelines for hassle-free returns.
    </p>
  </section>

  <section class="ni-policy-wrap">
    <div class="ni-policy-card">
      <h2>14-Day Return Window</h2>
      <p>You have <strong>14 days from the date of confirmed delivery</strong> to initiate a return request for eligible items.</p>
    </div>

    <div class="ni-policy-card">
      <h2>Strict Hygiene Standards</h2>
      <p>Due to health and sanitary regulations applicable to intimate apparel, all returned garments must strictly satisfy the following criteria:</p>
      <ul>
        <li>Must be completely unworn, unwashed, and in pristine original condition.</li>
        <li>All original designer tags, labels, and protective hygiene stickers must remain firmly attached and intact.</li>
        <li>Must be returned in original branded boxes and packaging.</li>
      </ul>
      <p><em>Items showing any signs of wear, makeup, perfume fragrance, or removed hygiene seals cannot be accepted for refund and will be returned to the sender.</em></p>
    </div>

    <div class="ni-policy-card">
      <h2>How to Initiate a Return from the USA</h2>
      <p>1. Contact our support team at <a href="mailto:sklep@naturaintimo.com">sklep@naturaintimo.com</a> with your order number and the item(s) you wish to return.</p>
      <p>2. We will issue a Return Merchandise Authorization (RMA) number and detailed return shipping instructions.</p>
      <p>3. Because orders originate from Europe, returns are shipped back to our central warehouse in Poland. Return shipping costs are the responsibility of the customer unless the return is due to our error or a manufacturing defect.</p>
    </div>

    <div class="ni-policy-card">
      <h2>Refund Processing</h2>
      <p>Once your return is received and passes our quality inspection, your refund will be processed back to your original payment method (Stripe/credit card) within 3–5 business days.</p>
    </div>
  </section>
</div>`;

  console.log('Updating page 4517 (Refund Policy)...');
  const res4517 = await put(4517, { content: refundContent });
  console.log('Status 4517:', res4517.status);

  // 3. Page 4565: Checkout – USA & Canada
  const checkoutContent = `<section class="ni-checkout-intro" style="text-align:center; padding: 24px 16px; margin-bottom: 20px;">
  <p style="text-transform:uppercase; letter-spacing:0.18em; font-size:12px; font-weight:700; color:#93566a; margin:0 0 6px;">Natura Intimo</p>
  <h1 style="font-size:2.2rem; margin:0 0 10px; color:#2d1e26;">Secure Checkout</h1>
  <p style="color:#666; font-size:14px; margin:0;">
    Fast delivery via <strong>DHL Express Worldwide</strong> directly from Poland. Guaranteed DDP – all import duties & taxes pre-cleared.
  </p>
</section>
[woocommerce_checkout]`;

  console.log('Updating page 4565 (Checkout)...');
  const res4565 = await put(4565, { content: checkoutContent });
  console.log('Status 4565:', res4565.status);

  console.log('✅ Wszystkie strony informacyjne zaktualizowane pomyślnie!');
}

updatePolicyPages().catch(console.error);
