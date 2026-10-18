import dotenv from 'dotenv';
dotenv.config();
import axios from 'axios';
import https from 'https';

async function fixFullBustLanding() {
  const wpUser = process.env.WP_ADMIN_USER;
  const wpPass = process.env.WP_APP_PASSWORD;
  const auth = Buffer.from(`${wpUser}:${wpPass}`).toString('base64');
  const headers = { Authorization: `Basic ${auth}` };

  const style = `<style>
.entry-header, .ast-breadcrumbs-wrapper { display: none !important; }
.site-content > .ast-container { max-width: 100% !important; padding: 0 !important; }
.entry-content { margin: 0 !important; }
.ni-fb { --ink: #30252b; --rose: #8e4f63; --blush: #f7eef1; --cream: #fffaf7; color: var(--ink); font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
.ni-fb * { box-sizing: border-box; }
.ni-fb-hero { padding: 75px 24px; text-align: center; background: linear-gradient(135deg, #fffaf7, #f1dfe5); border-radius: 0 0 36px 36px; }
.ni-fb-kicker { text-transform: uppercase; letter-spacing: .16em; font-size: .8rem; font-weight: 700; color: var(--rose); margin-bottom: 10px; }
.ni-fb-hero h1 { font-size: clamp(2rem, 5vw, 3.6rem); max-width: 900px; margin: 10px auto 16px; line-height: 1.15; color: var(--ink); font-weight: 800; }
.ni-fb-hero p { max-width: 720px; margin: auto; font-size: 1.05rem; line-height: 1.7; color: #5a4852; }
.ni-fb-trust-row { display: flex; justify-content: center; gap: 14px; margin-top: 24px; flex-wrap: wrap; }
.ni-fb-badge { background: #fff; border: 1px solid #ebdce1; border-radius: 20px; padding: 7px 16px; font-weight: 600; font-size: 0.88rem; box-shadow: 0 2px 6px rgba(0,0,0,0.03); }
.ni-fb-wrap { max-width: 1180px; margin: auto; padding: 50px 24px 70px; }
.ni-fb-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; margin-bottom: 50px; }
.ni-fb-card { padding: 28px; border: 1px solid #eadde1; border-radius: 20px; background: var(--cream); box-shadow: 0 6px 20px rgba(67,39,49,.04); }
.ni-fb-card h2 { font-size: 1.25rem; margin-top: 0; color: #823a54; margin-bottom: 10px; font-weight: 700; }
.ni-fb-card p { line-height: 1.65; font-size: 0.95rem; color: #4a3a42; margin: 0; }
.ni-fb-products-title { text-align: center; font-size: 2.1rem; margin-bottom: 10px; color: var(--ink); font-weight: 800; }
.ni-fb-products-sub { text-align: center; color: #665; max-width: 680px; margin: 0 auto 36px; line-height: 1.6; font-size: 1rem; }
.ni-fb-products-grid { display: grid !important; grid-template-columns: repeat(4, 1fr) !important; gap: 24px !important; margin-bottom: 50px !important; }
.ni-fb-products-grid > p, .ni-fb-products-grid > br { display: none !important; margin: 0 !important; padding: 0 !important; }
.ni-fb-pcard { background: #fff; border: 1px solid #eadde1; border-radius: 16px; overflow: hidden; display: flex; flex-direction: column; transition: transform 0.2s, box-shadow 0.2s; box-shadow: 0 4px 16px rgba(0,0,0,0.04); height: 100%; position: relative; }
.ni-fb-pcard:hover { transform: translateY(-4px); box-shadow: 0 12px 28px rgba(67,39,49,0.12); }
.ni-fb-pmedia { position: relative; width: 100%; height: 320px; overflow: hidden; background: #faf5f7; display: block; }
.ni-fb-pmedia img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform 0.3s; }
.ni-fb-pcard:hover .ni-fb-pmedia img { transform: scale(1.03); }
.ni-fb-ptag { position: absolute; top: 12px; left: 12px; background: rgba(48,37,43,0.85); color: #fff; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 20px; text-transform: uppercase; letter-spacing: 0.05em; z-index: 2; }
.ni-fb-pbody { padding: 18px; display: flex; flex-direction: column; flex-grow: 1; justify-content: space-between; }
.ni-fb-pname { font-size: 1.05rem; font-weight: 700; margin: 0 0 6px; line-height: 1.35; color: var(--ink); }
.ni-fb-pname a { color: var(--ink); text-decoration: none; }
.ni-fb-pname a:hover { color: var(--rose); }
.ni-fb-psizes { font-size: 0.85rem; color: #823a54; font-weight: 600; margin-bottom: 14px; }
.ni-fb-pfooter { display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #f3e9ec; padding-top: 12px; margin-top: auto; }
.ni-fb-pprice { font-size: 1.25rem; font-weight: 800; color: #30252b; }
.ni-fb-pbtn { display: inline-block; padding: 8px 14px; background: #8e4f63; color: #fff !important; text-decoration: none !important; font-size: 0.85rem; font-weight: 700; border-radius: 8px; transition: background 0.2s; }
.ni-fb-pbtn:hover { background: #6f3b4c; }
.ni-fb-cta { text-align: center; padding: 48px 24px; border-radius: 24px; background: var(--ink); color: #fff; margin-top: 30px; }
.ni-fb-cta h2 { font-size: 1.9rem; margin-top: 0; color: #fff; font-weight: 800; }
.ni-fb-cta p { color: #f1dfe5; max-width: 650px; margin: 0 auto; line-height: 1.6; }
.ni-fb-cta a { display: inline-block; margin-top: 18px; padding: 13px 28px; border-radius: 999px; background: #fff; color: var(--ink) !important; text-decoration: none; font-weight: 700; }
@media (max-width: 1024px) {
  .ni-fb-products-grid { grid-template-columns: repeat(2, 1fr) !important; }
  .ni-fb-grid { grid-template-columns: 1fr; }
}
@media (max-width: 600px) {
  .ni-fb-products-grid { grid-template-columns: 1fr !important; }
  .ni-fb-wrap { padding: 36px 16px; }
  .ni-fb-hero { padding: 50px 16px; }
}
</style>`;

  const bodyHtml = `<main class="ni-fb"><section class="ni-fb-hero"><div class="ni-fb-kicker">Dedicated Full-Bust & Plus-Cup Collection</div><h1>European Full-Bust Bras: Engineered DD+ Support & Uncompromising Lift</h1><p>Say goodbye to digging wires, overflowing cups, and flimsy bands. Discover handcrafted European bra engineering featuring multi-part seamed cups, firm supportive wings, and sizes reaching US 30G, 32H, 34I, 36J, up to 48 band.</p><div class="ni-fb-trust-row"><span class="ni-fb-badge">✨ Cup Sizes B through K (US DD–M)</span><span class="ni-fb-badge">📐 European Centimeter Precision Fit</span><span class="ni-fb-badge">✈️ DHL Express DDP Pre-Cleared</span></div></section><section class="ni-fb-wrap"><div class="ni-fb-grid"><div class="ni-fb-card"><h2>Why Polish Full-Bust Engineering?</h2><p>Boutique ateliers like Gorsenia, Ava, and Gaia are celebrated globally by bra fitters for their specialized cup architecture. Rather than scaling up standard cups, they engineer deep, narrow-underwire cups that lift projected tissue forward without east-west spillage.</p></div><div class="ni-fb-card"><h2>Multi-Part Supportive Construction</h2><p>Featuring 3- and 4-piece cups with integrated side support slings, reinforced lower cup laminates, and firm powernet back wings. Every detail is balanced to transfer breast weight comfortably from delicate shoulders to the ribcage.</p></div><div class="ni-fb-card"><h2>Finding Your Standard US Equivalent</h2><p>European sizing increments by true centimetre intervals. For example, EU 75G corresponds to US 34G (UK 34F), and EU 80I translates to US 36I. Visit our interactive <a href="/size-guide/">Size Guide & Converter</a> for instant translations.</p></div></div><h2 class="ni-fb-products-title">Featured Full-Bust & Full-Cup Styles</h2><p class="ni-fb-products-sub">Hand-selected bestsellers engineered for full-bust projection, all-day stability, and breathtaking European aesthetics.</p><div class="ni-fb-products-grid"><div class="ni-fb-pcard"><a href="/produkt/bra-soft-gorsenia-g-014-nadine/" class="ni-fb-pmedia"><span class="ni-fb-ptag">Full Cup K-630</span><img src="https://naturaintimo.com/wp-content/uploads/2026/09/414790.jpg" alt="Gorsenia Nadine Soft Bra" loading="lazy" /></a><div class="ni-fb-pbody"><div><h3 class="ni-fb-pname"><a href="/produkt/bra-soft-gorsenia-g-014-nadine/">Gorsenia Nadine Soft Bra Multicolor</a></h3><div class="ni-fb-psizes">Sizes: 65F – 115D (US 30G – 50D)</div></div><div class="ni-fb-pfooter"><span class="ni-fb-pprice">$95.99</span><a href="/produkt/bra-soft-gorsenia-g-014-nadine/" class="ni-fb-pbtn">Select Size</a></div></div></div><div class="ni-fb-pcard"><a href="/produkt/bra-soft-gorsenia-k-441-1-luisse-2/" class="ni-fb-pmedia"><span class="ni-fb-ptag">Full Cup K-441</span><img src="https://naturaintimo.com/wp-content/uploads/2026/09/359337.jpg" alt="Gorsenia Luisse Soft Bra" loading="lazy" /></a><div class="ni-fb-pbody"><div><h3 class="ni-fb-pname"><a href="/produkt/bra-soft-gorsenia-k-441-1-luisse-2/">Gorsenia Luisse Soft Bra Black</a></h3><div class="ni-fb-psizes">Sizes: 65F – 110D (US 30G – 48D)</div></div><div class="ni-fb-pfooter"><span class="ni-fb-pprice">$88.99</span><a href="/produkt/bra-soft-gorsenia-k-441-1-luisse-2/" class="ni-fb-pbtn">Select Size</a></div></div></div><div class="ni-fb-pcard"><a href="/produkt/bra-semi-soft-ava-2110-maxi/" class="ni-fb-pmedia"><span class="ni-fb-ptag">Maxi Semi-Soft</span><img src="https://naturaintimo.com/wp-content/uploads/2026/09/361057.jpg" alt="Ava 2110 Maxi Semi-Soft Bra" loading="lazy" /></a><div class="ni-fb-pbody"><div><h3 class="ni-fb-pname"><a href="/produkt/bra-semi-soft-ava-2110-maxi/">Ava 2110 Maxi Semi-Soft Bra</a></h3><div class="ni-fb-psizes">Sizes: 75L – 105E (US 34L – 46DD)</div></div><div class="ni-fb-pfooter"><span class="ni-fb-pprice">$76.99</span><a href="/produkt/bra-semi-soft-ava-2110-maxi/" class="ni-fb-pbtn">Select Size</a></div></div></div><div class="ni-fb-pcard"><a href="/produkt/bra-soft-gorsenia-k-496-paradise/" class="ni-fb-pmedia"><span class="ni-fb-ptag">Full Cup K-496</span><img src="https://naturaintimo.com/wp-content/uploads/2026/09/384060.jpg" alt="Gorsenia Paradise Soft Bra" loading="lazy" /></a><div class="ni-fb-pbody"><div><h3 class="ni-fb-pname"><a href="/produkt/bra-soft-gorsenia-k-496-paradise/">Gorsenia Paradise Soft Bra Black</a></h3><div class="ni-fb-psizes">Sizes: 70I – 100G (US 32I – 44G)</div></div><div class="ni-fb-pfooter"><span class="ni-fb-pprice">$87.99</span><a href="/produkt/bra-soft-gorsenia-k-496-paradise/" class="ni-fb-pbtn">Select Size</a></div></div></div></div><div class="ni-fb-cta"><h2>Need Personal Full-Bust Fit Guidance?</h2><p>Tell us your snug underbust measurement and fullest bust reading in inches or centimeters. Our master fit specialists will pinpoint your optimal European cup and sister size.</p><a href="mailto:support@naturaintimo.com">Email Our Fit Specialists</a></div></section></main>`;

  const fullContent = `<!-- wp:html -->\n${style}\n${bodyHtml}\n<!-- /wp:html -->`;

  console.log('Updating page 6931 (Full Bust Bras DD+)...');
  const res = await axios.put('https://naturaintimo.com/wp-json/wp/v2/pages/6931', {
    content: fullContent
  }, { headers });

  console.log('Successfully updated Full Bust Bras page layout! Status:', res.status);
}

fixFullBustLanding().catch(console.error);
