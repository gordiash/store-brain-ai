import dotenv from 'dotenv';
dotenv.config();
import axios from 'axios';

async function createFullBustLanding() {
  const wpUser = process.env.WP_ADMIN_USER;
  const wpPass = process.env.WP_APP_PASSWORD;
  const auth = Buffer.from(`${wpUser}:${wpPass}`).toString('base64');
  const headers = { Authorization: `Basic ${auth}` };

  const content = `<style>
.entry-header, .ast-breadcrumbs-wrapper { display: none; }
.site-content > .ast-container { max-width: 100%; padding: 0; }
.entry-content { margin: 0; }
.ni-fb { --ink: #30252b; --rose: #8e4f63; --blush: #f7eef1; --cream: #fffaf7; color: var(--ink); font-family: inherit; }
.ni-fb * { box-sizing: border-box; }
.ni-fb-hero { padding: 90px 24px; text-align: center; background: linear-gradient(135deg, #fffaf7, #f1dfe5); border-radius: 0 0 42px 42px; }
.ni-fb-kicker { text-transform: uppercase; letter-spacing: .16em; font-size: .8rem; font-weight: 700; color: var(--rose); margin-bottom: 8px; }
.ni-fb-hero h1 { font-size: clamp(2.4rem, 6vw, 4.4rem); max-width: 900px; margin: 12px auto 18px; line-height: 1.08; color: var(--ink); }
.ni-fb-hero p { max-width: 720px; margin: auto; font-size: 1.12rem; line-height: 1.7; color: #5a4852; }
.ni-fb-trust-row { display: flex; justify-content: center; gap: 16px; margin-top: 24px; flex-wrap: wrap; }
.ni-fb-badge { background: #fff; border: 1px solid #ebdce1; border-radius: 20px; padding: 8px 18px; font-weight: 600; font-size: 0.9rem; }
.ni-fb-wrap { max-width: 1120px; margin: auto; padding: 64px 24px; }
.ni-fb-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; margin-bottom: 48px; }
.ni-fb-card { padding: 32px; border: 1.5px solid #eadde1; border-radius: 22px; background: var(--cream); box-shadow: 0 10px 28px rgba(67,39,49,.04); }
.ni-fb-card h2 { font-size: 1.35rem; margin-top: 0; color: #823a54; margin-bottom: 12px; }
.ni-fb-card p { line-height: 1.7; font-size: 0.98rem; color: #4a3a42; margin: 0; }
.ni-fb-products-title { text-align: center; font-size: 2.2rem; margin-bottom: 12px; }
.ni-fb-products-sub { text-align: center; color: #665; max-width: 680px; margin: 0 auto 36px; }
.ni-fb-products-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 24px; margin-bottom: 50px; }
.ni-fb-pcard { background: #fff; border: 1px solid #ebdce1; border-radius: 16px; overflow: hidden; display: flex; flex-direction: column; transition: transform 0.2s, box-shadow 0.2s; text-decoration: none; color: inherit; }
.ni-fb-pcard:hover { transform: translateY(-4px); box-shadow: 0 12px 28px rgba(0,0,0,0.08); }
.ni-fb-pmedia { position: relative; width: 100%; aspect-ratio: 3/4; overflow: hidden; background: #faf5f7; }
.ni-fb-pmedia img { width: 100%; height: 100%; object-fit: cover; }
.ni-fb-ptag { position: absolute; top: 12px; left: 12px; background: rgba(48,37,43,0.88); color: #fff; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 20px; text-transform: uppercase; letter-spacing: 0.05em; }
.ni-fb-pbody { padding: 18px; display: flex; flex-direction: column; flex-grow: 1; }
.ni-fb-pname { font-size: 1rem; font-weight: 700; margin: 0 0 8px; line-height: 1.35; color: var(--ink); }
.ni-fb-psizes { font-size: 0.85rem; color: #823a54; font-weight: 600; margin-bottom: 12px; }
.ni-fb-pfooter { margin-top: auto; display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #f3e9ec; padding-top: 12px; }
.ni-fb-pprice { font-size: 1.15rem; font-weight: 700; color: #30252b; }
.ni-fb-pbtn { font-size: 0.85rem; font-weight: 700; color: var(--rose); text-decoration: underline; }
.ni-fb-cta { text-align: center; padding: 48px 24px; border-radius: 28px; background: var(--ink); color: #fff; margin-top: 30px; }
.ni-fb-cta h2 { font-size: 1.9rem; margin-top: 0; color: #fff; }
.ni-fb-cta a { display: inline-block; margin-top: 14px; padding: 14px 28px; border-radius: 999px; background: #fff; color: var(--ink) !important; text-decoration: none; font-weight: 700; }
@media (max-width: 820px) {
  .ni-fb-grid { grid-template-columns: 1fr; }
  .ni-fb-wrap { padding: 44px 20px; }
}
</style>

<main class="ni-fb">
<section class="ni-fb-hero">
  <div class="ni-fb-kicker">Dedicated Full-Bust & Plus-Cup Collection</div>
  <h1>European Full-Bust Bras: Engineered DD+ Support & Uncompromising Lift</h1>
  <p>Say goodbye to digging wires, overflowing cups, and flimsy bands. Discover handcrafted European bra engineering featuring multi-part seamed cups, firm supportive wings, and sizes reaching US 32G, 34H, 36I, 38J, up to 46 band.</p>
  <div class="ni-fb-trust-row">
    <span class="ni-fb-badge">✨ Cup Sizes B through K (US DD–M)</span>
    <span class="ni-fb-badge">📐 European Centimeter Precision Fit</span>
    <span class="ni-fb-badge">✈️ DHL Express DDP Pre-Cleared</span>
  </div>
</section>

<section class="ni-fb-wrap">
  <div class="ni-fb-grid">
    <article class="ni-fb-card">
      <h2>Why Polish Full-Bust Engineering?</h2>
      <p>Boutique ateliers like Gorsenia, Ava, and Gaia are celebrated globally by bra fitters for their specialized cup architecture. Rather than scaling up standard cups, they engineer deep, narrow-underwire cups that lift projected tissue forward without east-west spillage.</p>
    </article>
    <article class="ni-fb-card">
      <h2>Multi-Part Supportive Construction</h2>
      <p>Featuring 3- and 4-piece cups with integrated side support slings, reinforced lower cup laminates, and firm powernet back wings. Every detail is balanced to transfer breast weight comfortably from delicate shoulders to the ribcage.</p>
    </article>
    <article class="ni-fb-card">
      <h2>Finding Your Standard US Equivalent</h2>
      <p>European sizing increments by true centimetre intervals. For example, EU 75G corresponds to US 34G (UK 34F), and EU 80I translates to US 36I. Visit our interactive <a href="/size-guide/">Size Guide & Converter</a> for instant translations.</p>
    </article>
  </div>

  <h2 class="ni-fb-products-title">Featured Full-Bust & Full-Cup Styles</h2>
  <p class="ni-fb-products-sub">Hand-selected bestsellers engineered for full-bust projection, all-day stability, and breathtaking European aesthetics.</p>

  <div class="ni-fb-products-grid">
    <a href="/produkt/bra-soft-gorsenia-g-014-nadine/" class="ni-fb-pcard">
      <div class="ni-fb-pmedia">
        <span class="ni-fb-ptag">Full Cup K-630</span>
        <img src="https://naturaintimo.com/wp-content/uploads/2026/09/414790.jpg" alt="Gorsenia Nadine Soft Bra" loading="lazy" />
      </div>
      <div class="ni-fb-pbody">
        <h3 class="ni-fb-pname">Gorsenia Nadine Soft Bra Multicolor</h3>
        <div class="ni-fb-psizes">Sizes: 65F – 115D (US 30G – 50D)</div>
        <div class="ni-fb-pfooter">
          <span class="ni-fb-pprice">$95.99</span>
          <span class="ni-fb-pbtn">View Details →</span>
        </div>
      </div>
    </a>

    <a href="/produkt/bra-soft-gorsenia-k-441-1-luisse-2/" class="ni-fb-pcard">
      <div class="ni-fb-pmedia">
        <span class="ni-fb-ptag">Full Cup K-441</span>
        <img src="https://naturaintimo.com/wp-content/uploads/2026/09/359218.jpg" alt="Gorsenia Luisse Soft Bra" loading="lazy" />
      </div>
      <div class="ni-fb-pbody">
        <h3 class="ni-fb-pname">Gorsenia Luisse Soft Bra Black</h3>
        <div class="ni-fb-psizes">Sizes: 65F – 110D (US 30G – 48D)</div>
        <div class="ni-fb-pfooter">
          <span class="ni-fb-pprice">$88.99</span>
          <span class="ni-fb-pbtn">View Details →</span>
        </div>
      </div>
    </a>

    <a href="/produkt/bra-semi-soft-ava-2110-maxi/" class="ni-fb-pcard">
      <div class="ni-fb-pmedia">
        <span class="ni-fb-ptag">Maxi Semi-Soft</span>
        <img src="https://naturaintimo.com/wp-content/uploads/2026/09/349767.jpg" alt="Ava 2110 Maxi Semi-Soft Bra" loading="lazy" />
      </div>
      <div class="ni-fb-pbody">
        <h3 class="ni-fb-pname">Ava 2110 Maxi Semi-Soft Bra</h3>
        <div class="ni-fb-psizes">Sizes: 75L – 105E (US 34L – 46DD)</div>
        <div class="ni-fb-pfooter">
          <span class="ni-fb-pprice">$76.99</span>
          <span class="ni-fb-pbtn">View Details →</span>
        </div>
      </div>
    </a>

    <a href="/produkt/bra-soft-gorsenia-k-496-paradise/" class="ni-fb-pcard">
      <div class="ni-fb-pmedia">
        <span class="ni-fb-ptag">Full Cup K-496</span>
        <img src="https://naturaintimo.com/wp-content/uploads/2026/09/368817.jpg" alt="Gorsenia Paradise Soft Bra" loading="lazy" />
      </div>
      <div class="ni-fb-pbody">
        <h3 class="ni-fb-pname">Gorsenia Paradise Soft Bra Black</h3>
        <div class="ni-fb-psizes">Sizes: 70I – 100G (US 32I – 44G)</div>
        <div class="ni-fb-pfooter">
          <span class="ni-fb-pprice">$87.99</span>
          <span class="ni-fb-pbtn">View Details →</span>
        </div>
      </div>
    </a>
  </div>

  <div class="ni-fb-cta">
    <h2>Need Personal Full-Bust Fit Guidance?</h2>
    <p>Tell us your snug underbust measurement and fullest bust reading in inches or centimeters. Our master fit specialists will pinpoint your optimal European cup and sister size.</p>
    <a href="mailto:support@naturaintimo.com">Email Our Fit Specialists</a>
  </div>
</section>
</main>`;

  console.log('Creating Landing Page: Full Bust Bras (DD+)...');
  const res = await axios.post('https://naturaintimo.com/wp-json/wp/v2/pages', {
    title: 'Full Bust Bras (DD+)',
    slug: 'full-bust-bras',
    content: content,
    status: 'publish'
  }, { headers });

  console.log('Created page successfully! ID:', res.data.id, 'URL: https://naturaintimo.com/full-bust-bras/');

  // Add to main menu 40
  const menuRes = await axios.post('https://naturaintimo.com/wp-json/wp/v2/menu-items', {
    menus: 40,
    title: 'Full Bust Bras (DD+)',
    url: 'https://naturaintimo.com/full-bust-bras/',
    status: 'publish'
  }, { headers });
  console.log('Added Full Bust Bras to main menu: ID', menuRes.data.id);
}

createFullBustLanding().catch(console.error);
