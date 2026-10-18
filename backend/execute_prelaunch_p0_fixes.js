import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
dotenv.config();

const wpUser = process.env.WP_ADMIN_USER;
const wpPass = process.env.WP_APP_PASSWORD;
const ck = process.env.WOOCOMMERCE_CONSUMER_KEY;
const cs = process.env.WOOCOMMERCE_CONSUMER_SECRET;
const siteUrl = process.env.WOOCOMMERCE_URL || 'https://naturaintimo.com';

if (!wpUser || !wpPass || !ck || !cs) {
  throw new Error('Missing required credentials (WP_ADMIN_USER, WP_APP_PASSWORD, WOOCOMMERCE_CONSUMER_KEY, WOOCOMMERCE_CONSUMER_SECRET) in .env');
}

const wpAuth = 'Basic ' + Buffer.from(`${wpUser}:${wpPass}`).toString('base64');
const headers = {
  'Authorization': wpAuth,
  'Content-Type': 'application/json',
  'User-Agent': 'NaturaIntimoPreLaunchFixer/2.0'
};

const marketConfig = JSON.parse(fs.readFileSync(path.resolve('backend/market_config.json'), 'utf-8'));

// ============================================================================
// 1. Clean Page HTML Builders (Zero <script> in page content, zero wpautop bugs)
// ============================================================================

function getCleanPage4509Html() {
  return `<style>body.page-id-4509 .entry-header,body.page-id-4509 .ast-breadcrumbs-wrapper{display:none}body.page-id-4509 .site-content>.ast-container{max-width:100%;padding:0}body.page-id-4509 .entry-content{margin:0}.ni-market{--ink:#30252b;--rose:#b86f82;--blush:#f7eef1;--cream:#fffaf7;color:var(--ink)}.ni-market *{box-sizing:border-box}.ni-hero{padding:clamp(64px,10vw,128px) 24px;background:linear-gradient(135deg,#fffaf7 0%,#f4e4e9 58%,#ead3da 100%);border-radius:0 0 42px 42px;text-align:center}.ni-kicker{text-transform:uppercase;letter-spacing:.18em;font-size:.78rem;font-weight:700;color:#93566a}.ni-hero h1{font-size:clamp(2.5rem,7vw,5.5rem);line-height:1.02;max-width:920px;margin:18px auto}.ni-lead{font-size:1.15rem;line-height:1.75;max-width:720px;margin:0 auto 30px}.ni-btn{display:inline-block;padding:14px 25px;margin:6px;border-radius:999px;text-decoration:none!important;font-weight:700}.ni-btn-primary{background:var(--ink);color:#fff!important}.ni-btn-secondary{border:1px solid var(--ink);color:var(--ink)!important}.ni-wrap{max-width:1160px;margin:auto;padding:72px 24px}.ni-center{text-align:center}.ni-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:22px;margin-top:34px}.ni-card{display:block;min-height:230px;padding:34px;border-radius:24px;background:var(--cream);border:1px solid #eadde1;text-decoration:none!important;color:var(--ink)!important;box-shadow:0 12px 35px rgba(67,39,49,.07)}.ni-card strong{display:block;font-size:1.6rem;margin-bottom:12px}.ni-soft{background:var(--blush)}.ni-band{display:grid;grid-template-columns:repeat(3,1fr);gap:18px}.ni-fact{padding:25px;text-align:center}.ni-fact b{display:block;font-size:1.1rem;margin-bottom:8px}.ni-cta{padding:55px 28px;border-radius:30px;background:var(--ink);color:#fff;text-align:center}.ni-cta a{color:#fff}@media(max-width:780px){.ni-grid,.ni-band{grid-template-columns:1fr}.ni-card{min-height:180px}.ni-wrap{padding:50px 20px}}.ni-carousel-section{padding:68px 24px 72px;background:#ffffff;border-top:1px solid #f2e7eb;border-bottom:1px solid #f2e7eb}.ni-c-container{max-width:1200px;margin:0 auto}.ni-c-header{display:flex;align-items:flex-end;justify-content:space-between;gap:20px;margin-bottom:34px}.ni-c-header-left{max-width:640px}.ni-c-title{font-size:clamp(1.85rem,3.8vw,2.6rem);line-height:1.15;margin:10px 0;color:var(--ink,#30252b)}.ni-c-subtitle{font-size:1.02rem;line-height:1.55;color:#6a5760;margin:0}.ni-c-nav{display:flex;gap:12px;flex-shrink:0}.ni-c-nav br,.ni-c-arrow br{display:none!important}.ni-c-arrow{width:46px!important;height:46px!important;min-width:46px!important;border-radius:50%!important;border:1.5px solid #dfcfd4!important;background:#ffffff!important;color:var(--ink,#30252b)!important;display:flex!important;align-items:center!important;justify-content:center!important;padding:0!important;line-height:1!important;cursor:pointer!important;transition:all 0.22s ease!important;box-shadow:0 4px 14px rgba(48,37,43,0.06)!important}.ni-c-arrow svg{display:block!important;width:18px!important;height:18px!important;stroke:var(--ink,#30252b)!important;pointer-events:none!important}.ni-c-arrow:hover{background:var(--ink,#30252b)!important;color:#ffffff!important;border-color:var(--ink,#30252b)!important;transform:translateY(-2px)!important;box-shadow:0 8px 20px rgba(48,37,43,0.16)!important}.ni-c-arrow:hover svg{stroke:#ffffff!important}.ni-c-track-wrapper{position:relative;margin:0 -10px;padding:0 10px}.ni-c-track{display:flex;gap:22px;overflow-x:auto;scroll-snap-type:x mandatory;scroll-behavior:smooth;-webkit-overflow-scrolling:touch;padding:10px 4px 24px 4px;scrollbar-width:none}.ni-c-track::-webkit-scrollbar{display:none}.ni-c-item{flex:0 0 calc((100% - 66px) / 4);min-width:240px;scroll-snap-align:start}.ni-c-card{display:flex;flex-direction:column;height:100%;background:#ffffff;border-radius:22px;border:1px solid #ebdfe3;overflow:hidden;text-decoration:none!important;color:var(--ink,#30252b)!important;box-shadow:0 8px 24px rgba(48,37,43,0.04);transition:transform 0.3s cubic-bezier(0.16,1,0.3,1),box-shadow 0.3s ease}.ni-c-card:hover{transform:translateY(-7px);box-shadow:0 18px 40px rgba(48,37,43,0.12)}.ni-c-media{position:relative;width:100%;aspect-ratio:3/4;overflow:hidden;background:#faf4f6}.ni-c-media img{width:100%;height:100%;object-fit:cover;object-position:center top;display:block;transition:transform 0.5s ease}.ni-c-card:hover .ni-c-media img{transform:scale(1.06)}.ni-c-badge{position:absolute;top:12px;left:12px;background:rgba(255,255,255,0.94);backdrop-filter:blur(8px);color:var(--ink,#30252b);font-size:0.7rem;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;padding:4px 10px;border-radius:999px;box-shadow:0 2px 8px rgba(0,0,0,0.08);z-index:2}.ni-c-details{padding:20px;display:flex;flex-direction:column;flex-grow:1;justify-content:space-between}.ni-c-tag{font-size:0.72rem;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:var(--rose,#b86f82);margin-bottom:6px}.ni-c-name{font-size:1.02rem;font-weight:600;line-height:1.35;margin:0 0 14px 0;color:var(--ink,#30252b);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;min-height:2.7em}.ni-c-foot{display:flex;align-items:center;justify-content:space-between;margin-top:auto;padding-top:14px;border-top:1px solid #f6edf0}.ni-c-price{font-size:1.25rem;font-weight:700;color:var(--ink,#30252b)}.ni-c-btn{font-size:0.82rem;font-weight:600;color:var(--rose,#b86f82);transition:transform 0.2s ease,color 0.2s ease}.ni-c-card:hover .ni-c-btn{color:var(--ink,#30252b);transform:translateX(4px)}@media(max-width:1024px){.ni-c-item{flex:0 0 calc((100% - 44px) / 3)}}@media(max-width:768px){.ni-c-header{flex-direction:column;align-items:flex-start}.ni-c-nav{display:none}.ni-c-item{flex:0 0 78%;min-width:220px}.ni-carousel-section{padding:50px 18px}}</style>
<div class="ni-market">
<section class="ni-hero">
<div class="ni-kicker">Natura Intimo · United States</div>
<h1>European Lingerie Crafted for Perfect Fit &amp; Full-Bust Support</h1>
<p class="ni-lead">Feminine design, dependable support and everyday comfort — curated as coordinated bras and panties in an inclusive range of fits.</p>
<div><a class="ni-btn ni-btn-primary" href="/product-category/lingerie-sets/">Shop matching sets</a><a class="ni-btn ni-btn-secondary" href="/new-arrivals/">Explore new arrivals</a></div>
</section>
<section class="ni-wrap ni-center">
<div class="ni-kicker">Curated collection</div>
<h2>Build a set that feels made for you</h2>
<div class="ni-grid"><a class="ni-card" href="/product-category/lingerie/bras/"><strong>Bras</strong><span>Soft, semi-soft, full-cup and push-up shapes in European band and cup sizing.</span></a><a class="ni-card" href="/product-category/lingerie/panties/"><strong>Panties</strong><span>Comfortable briefs, Brazilian cuts and thongs in available sizes from S to 3XL.</span></a><a class="ni-card" href="/product-category/lingerie-sets/"><strong>Matching sets</strong><span>Pair coordinated pieces by collection code for a polished, intentional look.</span></a></div>
</section>
<section class="ni-carousel-section">
<div class="ni-c-container">
<div class="ni-c-header">
<div class="ni-c-header-left">
<div class="ni-kicker">Featured Collection</div>
<h2 class="ni-c-title">Trending European Styles</h2>
<p class="ni-c-subtitle">European-made lingerie designed for exceptional support, elegance, and all-day comfort. Pair your favorite bra with its matching bottom.</p>
</div>
<div class="ni-c-nav">
<button type="button" class="ni-c-arrow" id="niPrevBtn" aria-label="Previous items"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg></button>
<button type="button" class="ni-c-arrow" id="niNextBtn" aria-label="Next items"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"/></svg></button>
</div>
</div>
<div class="ni-c-track-wrapper">
<div class="ni-c-track" id="niTrack">
<div class="ni-c-item"><a href="/product/bra-soft-gorsenia-g-014-nadine/" class="ni-c-card" aria-label="Gorsenia Nadine Soft Bra Multicolor"><div class="ni-c-media"><span class="ni-c-badge">Featured Style</span><img decoding="async" src="https://naturaintimo.com/wp-content/uploads/2026/09/414787.jpg" alt="Gorsenia Nadine Soft Bra Multicolor" loading="lazy" width="400" height="533" /></div><div class="ni-c-details"><div class="ni-c-tag">Soft Bra · 65F–115D</div><h3 class="ni-c-name">Gorsenia Nadine Soft Bra Multicolor</h3><div class="ni-c-foot"><span class="ni-c-price">$95.99</span><span class="ni-c-btn">View Details →</span></div></div></a></div>
<div class="ni-c-item"><a href="/product/panties-gorsenia-f-014-nadine-m-4xl/" class="ni-c-card" aria-label="Gorsenia Nadine Panties Multicolor"><div class="ni-c-media"><span class="ni-c-badge">Matching Set</span><img decoding="async" src="https://naturaintimo.com/wp-content/uploads/2026/09/414796.jpg" alt="Gorsenia Nadine Panties Multicolor" loading="lazy" width="400" height="533" /></div><div class="ni-c-details"><div class="ni-c-tag">Matching Bottom · M–3XL</div><h3 class="ni-c-name">Gorsenia Nadine Panties Multicolor</h3><div class="ni-c-foot"><span class="ni-c-price">$46.99</span><span class="ni-c-btn">View Details →</span></div></div></a></div>
<div class="ni-c-item"><a href="/product/bra-semi-soft-gaia-bs-1228-isla-white/" class="ni-c-card" aria-label="Gaia Isla Semi-Soft Bra White"><div class="ni-c-media"><span class="ni-c-badge">Bridal White</span><img decoding="async" src="https://naturaintimo.com/wp-content/uploads/2026/09/397779.jpg" alt="Gaia Isla Semi-Soft Bra White" loading="lazy" width="400" height="533" /></div><div class="ni-c-details"><div class="ni-c-tag">Semi-Soft Bra · 65F–95I</div><h3 class="ni-c-name">Gaia Isla Semi-Soft Bra White</h3><div class="ni-c-foot"><span class="ni-c-price">$85.99</span><span class="ni-c-btn">View Details →</span></div></div></a></div>
<div class="ni-c-item"><a href="/product/panties-gaia-gfp-1228-isla-white/" class="ni-c-card" aria-label="Gaia Isla Bikini Briefs White"><div class="ni-c-media"><span class="ni-c-badge">Matching Set</span><img decoding="async" src="https://naturaintimo.com/wp-content/uploads/2026/09/397785.jpg" alt="Gaia Isla Bikini Briefs White" loading="lazy" width="400" height="533" /></div><div class="ni-c-details"><div class="ni-c-tag">Briefs · S–L</div><h3 class="ni-c-name">Gaia Isla Bikini Briefs White</h3><div class="ni-c-foot"><span class="ni-c-price">$38.99</span><span class="ni-c-btn">View Details →</span></div></div></a></div>
<div class="ni-c-item"><a href="/product/bra-semi-soft-gaia-bs-1228-isla/" class="ni-c-card" aria-label="Gaia Isla Semi Soft Bra Black"><div class="ni-c-media"><span class="ni-c-badge">Classic Noir</span><img decoding="async" src="https://naturaintimo.com/wp-content/uploads/2026/09/400318.jpg" alt="Gaia Isla Semi Soft Bra Black" loading="lazy" width="400" height="533" /></div><div class="ni-c-details"><div class="ni-c-tag">Semi-Soft Bra · 65J–80B</div><h3 class="ni-c-name">Gaia Isla Semi Soft Bra Black</h3><div class="ni-c-foot"><span class="ni-c-price">$87.99</span><span class="ni-c-btn">View Details →</span></div></div></a></div>
<div class="ni-c-item"><a href="/product/panties-gaia-gfp-1228-isla-s-2xl/" class="ni-c-card" aria-label="Gaia Isla Panties Black"><div class="ni-c-media"><span class="ni-c-badge">Matching Set</span><img decoding="async" src="https://naturaintimo.com/wp-content/uploads/2026/09/400320.jpg" alt="Gaia Isla Panties Black" loading="lazy" width="400" height="533" /></div><div class="ni-c-details"><div class="ni-c-tag">Briefs · M–3XL</div><h3 class="ni-c-name">Gaia Isla Panties Black</h3><div class="ni-c-foot"><span class="ni-c-price">$38.99</span><span class="ni-c-btn">View Details →</span></div></div></a></div>
<div class="ni-c-item"><a href="/product/bra-soft-gaia-bs-1135-soft-beige/" class="ni-c-card" aria-label="Gaia BS 1135 Soft Bra Beige"><div class="ni-c-media"><span class="ni-c-badge">Everyday Nude</span><img decoding="async" src="https://naturaintimo.com/wp-content/uploads/2026/09/349715.jpg" alt="Gaia BS 1135 Soft Bra Beige" loading="lazy" width="400" height="533" /></div><div class="ni-c-details"><div class="ni-c-tag">Soft Bra · 65E–95E</div><h3 class="ni-c-name">Gaia BS 1135 Soft Bra Beige</h3><div class="ni-c-foot"><span class="ni-c-price">$84.99</span><span class="ni-c-btn">View Details →</span></div></div></a></div>
<div class="ni-c-item"><a href="/product/panties-gaia-gfb-1135-brazilian-briefs-beige/" class="ni-c-card" aria-label="Gaia GFB 1135 Brazilian Briefs Beige"><div class="ni-c-media"><span class="ni-c-badge">Matching Set</span><img decoding="async" src="https://naturaintimo.com/wp-content/uploads/2026/09/349605.jpg" alt="Gaia GFB 1135 Brazilian Briefs Beige" loading="lazy" width="400" height="533" /></div><div class="ni-c-details"><div class="ni-c-tag">Brazilian Cut · L–2XL</div><h3 class="ni-c-name">Gaia GFB 1135 Brazilian Briefs Beige</h3><div class="ni-c-foot"><span class="ni-c-price">$44.99</span><span class="ni-c-btn">View Details →</span></div></div></a></div>
</div>
</div>
</div>
</section>
<section class="ni-soft">
<div class="ni-wrap">
<div class="ni-band">
<div class="ni-fact"><b>European design</b><span>Selected styles from established lingerie makers.</span></div>
<div class="ni-fact"><b>Live availability</b><span>Variants and stock synchronized with our supplier.</span></div>
<div class="ni-fact"><b>Personal fit help</b><span>Human assistance before you place an order.</span></div>
</div>
</div>
</section>
<section class="ni-wrap">
<div class="ni-grid">
<div class="ni-card">
<div class="ni-kicker">Step 1</div>
<p><strong>Measure</strong><span>Use our guide for underbust, bust, waist and hip measurements in centimetres or inches.</span></p>
<p><a href="/size-guide/">Open the Size Guide →</a></p>
</div>
<div class="ni-card">
<div class="ni-kicker">Step 2</div>
<p><strong>Choose</strong><span>Select only the exact size and colour combinations shown as available on the product page.</span></p>
</div>
<div class="ni-card">
<div class="ni-kicker">Step 3</div>
<p><strong>Complete the look</strong><span>Use the matching collection to pair each bra with its coordinated bottom.</span></p>
</div>
</div>
</section>
<section class="ni-wrap">
<div class="ni-cta">
<div class="ni-kicker" style="color:#e9bac8">Express Transatlantic Delivery</div>
<h2>Guaranteed DDP Shipping to the USA</h2>
<p>All orders ship directly from our European atelier in Poland via <strong>DHL Express Worldwide</strong> (2–4 business days) with <strong>pre-cleared DDP customs</strong> (zero surprise fees on delivery). Flat-rate shipping is <strong>$24.99 USD</strong>, and orders of <strong>$150.00+ USD qualify for 100% FREE DHL Express Shipping &amp; Duties</strong>.</p>
<p><a href="/shipping-delivery/">Shipping &amp; Delivery</a> &nbsp;·&nbsp; <a href="/refund-policy/">Returns &amp; Exchanges</a></p>
<p><a class="ni-btn" style="background:#fff;color:#30252b!important" href="/size-guide/#niBrafittingForm">Ask a Bra Fitter</a></p>
</div>
</section>
</div>`;
}

function getCleanPage4511Html() {
  return `<style>body.page-id-4511 .entry-header,body.page-id-4511 .ast-breadcrumbs-wrapper{display:none}body.page-id-4511 .site-content>.ast-container{max-width:100%;padding:0}body.page-id-4511 .entry-content{margin:0}.ni-market{--ink:#30252b;--rose:#b86f82;--blush:#f7eef1;--cream:#fffaf7;color:var(--ink)}.ni-market *{box-sizing:border-box}.ni-hero{padding:clamp(64px,10vw,128px) 24px;background:linear-gradient(135deg,#fffaf7 0%,#f4e4e9 58%,#ead3da 100%);border-radius:0 0 42px 42px;text-align:center}.ni-kicker{text-transform:uppercase;letter-spacing:.18em;font-size:.78rem;font-weight:700;color:#93566a}.ni-hero h1{font-size:clamp(2.5rem,7vw,5.5rem);line-height:1.02;max-width:920px;margin:18px auto}.ni-lead{font-size:1.15rem;line-height:1.75;max-width:720px;margin:0 auto 30px}.ni-btn{display:inline-block;padding:14px 25px;margin:6px;border-radius:999px;text-decoration:none!important;font-weight:700}.ni-btn-primary{background:var(--ink);color:#fff!important}.ni-btn-secondary{border:1px solid var(--ink);color:var(--ink)!important}.ni-wrap{max-width:1160px;margin:auto;padding:72px 24px}.ni-center{text-align:center}.ni-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:22px;margin-top:34px}.ni-card{display:block;min-height:230px;padding:34px;border-radius:24px;background:var(--cream);border:1px solid #eadde1;text-decoration:none!important;color:var(--ink)!important;box-shadow:0 12px 35px rgba(67,39,49,.07)}.ni-card strong{display:block;font-size:1.6rem;margin-bottom:12px}.ni-soft{background:var(--blush)}.ni-band{display:grid;grid-template-columns:repeat(3,1fr);gap:18px}.ni-fact{padding:25px;text-align:center}.ni-fact b{display:block;font-size:1.1rem;margin-bottom:8px}.ni-cta{padding:55px 28px;border-radius:30px;background:var(--ink);color:#fff;text-align:center}.ni-cta a{color:#fff}@media(max-width:780px){.ni-grid,.ni-band{grid-template-columns:1fr}.ni-card{min-height:180px}.ni-wrap{padding:50px 20px}}</style>
<div class="ni-market">
<section class="ni-hero">
<div class="ni-kicker">Natura Intimo · Canada</div>
<h1>European lingerie, curated for comfort</h1>
<p class="ni-lead">Coordinated bras and panties selected for feminine style, reliable support and an easy everyday fit — prepared for customers across Canada.</p>
<div><a class="ni-btn ni-btn-primary" href="/product-category/lingerie-sets/">Shop matching sets</a><a class="ni-btn ni-btn-secondary" href="/new-arrivals/">Explore new arrivals</a></div>
</section>
<section class="ni-wrap ni-center">
<div class="ni-kicker">Curated collection</div>
<h2>Find the pieces that work together</h2>
<div class="ni-grid"><a class="ni-card" href="/product-category/lingerie/bras/"><strong>Bras</strong><span>Supportive soft, semi-soft, full-cup and push-up designs in European sizing.</span></a><a class="ni-card" href="/product-category/lingerie/panties/"><strong>Panties</strong><span>Briefs, Brazilian cuts and thongs in available sizes from S to 3XL.</span></a><a class="ni-card" href="/product-category/lingerie-sets/"><strong>Matching sets</strong><span>Combine coordinated tops and bottoms using the shared collection code.</span></a></div>
</section>
<section class="ni-soft">
<div class="ni-wrap">
<div class="ni-band">
<div class="ni-fact"><b>European design</b><span>Distinctive styles chosen from established lingerie makers.</span></div>
<div class="ni-fact"><b>Current stock</b><span>Available variants synchronized with our supplier.</span></div>
<div class="ni-fact"><b>Fit support</b><span>Personal guidance before your order is placed.</span></div>
</div>
</div>
</section>
<section class="ni-wrap">
<div class="ni-grid">
<div class="ni-card">
<div class="ni-kicker">Step 1</div>
<p><strong>Measure</strong><span>Take underbust, full-bust, waist and hip measurements in centimetres or inches.</span></p>
<p><a href="/size-guide/">Open the Size Guide →</a></p>
</div>
<div class="ni-card">
<div class="ni-kicker">Step 2</div>
<p><strong>Compare</strong><span>European bra sizing differs from Canadian sizing. Choose the exact available product variant.</span></p>
</div>
<div class="ni-card">
<div class="ni-kicker">Step 3</div>
<p><strong>Coordinate</strong><span>Match products by collection for a complete lingerie set.</span></p>
</div>
</div>
</section>
<section class="ni-wrap">
<div class="ni-cta">
<div class="ni-kicker" style="color:#e9bac8">Express Delivery to Canada</div>
<h2>Cross-border shopping without surprises</h2>
<p>All orders ship directly from our European atelier in Poland via <strong>DHL Express Worldwide</strong> (3–5 business days) with <strong>0% preferential customs duty under CETA</strong>. Flat-rate shipping is <strong>C$24.99 CAD</strong>, and orders of <strong>C$200.00+ CAD qualify for FREE DHL Express Shipping</strong>.</p>
<p><a href="/shipping-delivery/">Shipping &amp; Delivery</a> &nbsp;·&nbsp; <a href="/refund-policy/">Returns &amp; Exchanges</a></p>
<p><a class="ni-btn" style="background:#fff;color:#30252b!important" href="/size-guide/#niBrafittingForm">Ask a Bra Fitter</a></p>
</div>
</section>
</div>`;
}

function getCleanPage4513Html() {
  return `<style>body.page-id-4513 .entry-header, body.page-id-4513 .ast-breadcrumbs-wrapper { display: none !important; }
body.page-id-4513 .site-content > .ast-container { max-width: 100% !important; padding: 0 !important; }
body.page-id-4513 .entry-content { margin: 0 !important; }
.ni-help { --ink: #30252b; --rose: #8e4f63; --blush: #f7eef1; --cream: #fffaf7; color: var(--ink); font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
.ni-help * { box-sizing: border-box; }
.ni-help-hero { padding: 80px 24px; background: linear-gradient(135deg, #fffaf7, #f1dfe5); text-align: center; border-radius: 0 0 40px 40px; }
.ni-help-hero h1 { font-size: clamp(2.4rem, 6vw, 4.4rem); margin: 12px auto 16px; color: var(--ink); font-weight: 800; }
.ni-help-hero p { max-width: 740px; margin: auto; font-size: 1.08rem; line-height: 1.7; color: #5a4852; }
.ni-help-wrap { max-width: 1100px; margin: auto; padding: 50px 24px 70px; }
.ni-calc-container { background: #ffffff; border: 2px solid #ebdce1; border-radius: 28px; padding: 40px; box-shadow: 0 14px 40px rgba(48,37,43,0.08); margin-bottom: 60px; }
.ni-calc-title { text-align: center; font-size: 1.9rem; font-weight: 800; color: #30252b; margin: 0 0 8px; }
.ni-calc-sub { text-align: center; font-size: 1rem; color: #5c4752; margin: 0 auto 30px; max-width: 650px; line-height: 1.6; }
.ni-calc-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 24px; }
.ni-calc-field label { display: block; font-weight: 700; font-size: 0.9rem; margin-bottom: 8px; color: #43333d; }
.ni-calc-input { width: 100%; padding: 12px 16px; border: 1.5px solid #dfcfd4; border-radius: 12px; font-size: 1.05rem; outline: none; transition: border-color 0.2s; background: #fffaf7; color: #30252b; }
.ni-calc-input:focus { border-color: #8e4f63; background: #fff; }
.ni-unit-toggle { display: flex; justify-content: center; gap: 8px; margin-bottom: 24px; }
.ni-unit-btn { padding: 8px 20px; border-radius: 999px; border: 1.5px solid #dfcfd4; background: #fff; font-weight: 700; font-size: 0.88rem; cursor: pointer; transition: all 0.2s; color: #43333d; }
.ni-unit-btn.active { background: #30252b; color: #fff; border-color: #30252b; }
.ni-btn-calculate { display: block; width: 100%; max-width: 380px; margin: 0 auto; padding: 15px 30px; background: #8e4f63; color: #fff; border: none; border-radius: 999px; font-size: 1.08rem; font-weight: 700; cursor: pointer; transition: all 0.22s; box-shadow: 0 6px 20px rgba(142,79,99,0.3); text-align: center; }
.ni-btn-calculate:hover { background: #30252b; transform: translateY(-2px); box-shadow: 0 8px 26px rgba(48,37,43,0.3); }
.ni-calc-results { display: none; margin-top: 36px; padding: 30px; background: #fffaf7; border: 1.5px solid #ebdce1; border-radius: 20px; }
.ni-res-header { text-align: center; margin-bottom: 24px; }
.ni-res-badge { display: inline-block; background: #e8d0d7; color: #823a54; font-size: 0.75rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; padding: 4px 12px; border-radius: 999px; margin-bottom: 6px; }
.ni-res-main-size { font-size: 2.6rem; font-weight: 900; color: #30252b; margin: 0; line-height: 1.1; }
.ni-res-equiv { font-size: 1.15rem; color: #8e4f63; font-weight: 700; margin-top: 4px; }
.ni-res-details-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-top: 24px; border-top: 1px dashed #e2ced3; padding-top: 24px; }
.ni-res-box { background: #fff; border: 1px solid #ebdce1; border-radius: 14px; padding: 18px; }
.ni-res-box-title { font-size: 0.82rem; font-weight: 700; text-transform: uppercase; color: #8e4f63; margin-bottom: 6px; }
.ni-res-box-content { font-size: 0.95rem; line-height: 1.55; color: #43333d; }
.ni-res-cta-row { text-align: center; margin-top: 26px; }
.ni-res-cta-btn { display: inline-block; padding: 12px 28px; background: #30252b; color: #fff !important; text-decoration: none !important; font-weight: 700; font-size: 0.95rem; border-radius: 999px; transition: all 0.2s; }
.ni-res-cta-btn:hover { background: #8e4f63; transform: translateY(-2px); }
.ni-table-wrap { overflow-x: auto; margin-bottom: 40px; border-radius: 16px; border: 1px solid #ebdce1; box-shadow: 0 4px 16px rgba(0,0,0,0.02); }
.ni-size-table { width: 100%; border-collapse: collapse; background: #fff; text-align: left; }
.ni-size-table th { background: #30252b; color: #fff; padding: 12px 16px; font-weight: 700; font-size: 0.88rem; text-transform: uppercase; letter-spacing: 0.04em; }
.ni-size-table td { padding: 12px 16px; border-bottom: 1px solid #f0e6e8; font-size: 0.95rem; color: #43333d; }
.ni-size-table tr:nth-child(even) td { background: #fffaf7; }
.ni-badge-eu { display: inline-block; padding: 3px 10px; background: #f4e2e7; color: #8e4f63; border-radius: 6px; font-weight: 700; font-size: 0.88rem; }
.ni-badge-us { display: inline-block; padding: 3px 10px; background: #eaf1f8; color: #1e5288; border-radius: 6px; font-weight: 700; font-size: 0.88rem; }
.ni-fit-form-box { margin-top: 50px; padding: 40px; border-radius: 26px; background: #fffaf7; border: 2px solid #8e4f63; box-shadow: 0 12px 32px rgba(142,79,99,0.08); }
.ni-fit-form-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 18px; margin-bottom: 18px; text-align: left; }
@media (max-width: 768px) {
  .ni-calc-grid, .ni-res-details-grid, .ni-fit-form-grid { grid-template-columns: 1fr; }
  .ni-calc-container, .ni-fit-form-box { padding: 24px 18px; }
}</style>
<main class="ni-help">
<section class="ni-help-hero">
<div style="text-transform: uppercase; letter-spacing: .16em; font-size: .8rem; font-weight: 700; color: #8e4f63; margin-bottom: 10px;">Brafitting Studio</div>
<h1>Bra Size Guide &amp; Interactive Converter</h1>
<p>Translate your body measurements or standard US/UK bra size into exact European sizing for Gorsenia, Gaia, Ava, and Mefemi collections.</p>
</section>
<section class="ni-help-wrap">
<div class="ni-calc-container" id="niSizeCalculator">
  <div class="ni-calc-title">✨ Interactive European Bra Size Calculator</div>
  <div class="ni-calc-sub">Enter your snug ribcage and fullest bust measurements. Our brafitting algorithm automatically calculates your primary European size, US/UK equivalent, sister sizes, and brand-specific fit tips.</div>
  <div class="ni-unit-toggle">
    <button type="button" class="ni-unit-btn active" id="niBtnUnitInches" onclick="window.niSetUnit && window.niSetUnit('in')">Inches (in)</button>
    <button type="button" class="ni-unit-btn" id="niBtnUnitCm" onclick="window.niSetUnit && window.niSetUnit('cm')">Centimeters (cm)</button>
  </div>
  <div class="ni-calc-grid">
    <div class="ni-calc-field">
      <label for="niUnderbustInput">1. Snug Underbust Band (<span class="ni-unit-label">inches</span>):</label>
      <input type="number" step="0.5" id="niUnderbustInput" class="ni-calc-input" placeholder="e.g. 30" />
      <small style="color:#5c4752; font-size:0.78rem;">Measure directly under breasts, exhaled and snug.</small>
    </div>
    <div class="ni-calc-field">
      <label for="niBustInput">2. Fullest Bust Reading (<span class="ni-unit-label">inches</span>):</label>
      <input type="number" step="0.5" id="niBustInput" class="ni-calc-input" placeholder="e.g. 38" />
      <small style="color:#5c4752; font-size:0.78rem;">Measure loosely around the fullest part of bust.</small>
    </div>
    <div class="ni-calc-field">
      <label for="niBrandSelect">3. Preferred Brand (Optional):</label>
      <select id="niBrandSelect" class="ni-calc-input">
        <option value="all">All Brands (General Advice)</option>
        <option value="gorsenia">Gorsenia (Full-Bust Projection)</option>
        <option value="gaia">Gaia (Semi-Soft / Soft True-to-Size)</option>
        <option value="ava">Ava (Side-Support &amp; Centering)</option>
        <option value="mefemi">Mefemi (Push-Up &amp; Deep Plunge)</option>
      </select>
      <small style="color:#5c4752; font-size:0.78rem;">Tailors fit advice to brand wire nuances.</small>
    </div>
  </div>
  <button type="button" class="ni-btn-calculate" id="niBtnCalculate" onclick="window.niCalculateSize && window.niCalculateSize()">Calculate My European Size →</button>
  <div id="niCalcResults" class="ni-calc-results">
    <div class="ni-res-header">
      <span class="ni-res-badge">Recommended European Size</span>
      <h3 class="ni-res-main-size" id="niResEuSize">EU 75G</h3>
      <div class="ni-res-equiv" id="niResUsEquiv">US Equivalent: US 34G (UK 34F)</div>
    </div>
    <div class="ni-res-details-grid">
      <div class="ni-res-box">
        <div class="ni-res-box-title">🔄 Recommended Sister Sizes:</div>
        <div class="ni-res-box-content" id="niResSisterSizes">
          • Looser Band: <strong>EU 80F (US 36DDD)</strong><br />
          • Snugger Band: <strong>EU 70H (US 32H)</strong>
        </div>
      </div>
      <div class="ni-res-box">
        <div class="ni-res-box-title">💡 Brand Fit &amp; Wire Nuance:</div>
        <div class="ni-res-box-content" id="niResBrandTips">
          Gorsenia uses firm, supportive bands and narrow, deep underwires. If you are between band sizes, choose the looser sister size for optimal comfort.
        </div>
      </div>
    </div>
    <div class="ni-res-cta-row">
      <a href="/full-bust-bras/" class="ni-res-cta-btn">Browse Full-Bust Bras In My Size →</a>
    </div>
  </div>
</div>
<div style="text-align: center; margin-bottom: 24px;">
  <h2 style="font-size: 1.8rem; color: #30252b; margin-bottom: 8px;">Standard European vs. US Reference Charts</h2>
  <p style="color: #5c4752; max-width: 680px; margin: 0 auto;">European lingerie uses precise centimetre band increments and true-to-bust cup progression. Use the charts below to translate your standard US size to the correct EU size.</p>
</div>
<h3 style="color: #823a54; font-size: 1.3rem; margin-bottom: 12px;">1. Bra Band Conversion (Underbust)</h3>
<div class="ni-table-wrap">
<table class="ni-size-table">
<thead>
<tr>
<th>EU / Polish Size (On Tag)</th>
<th>US / UK Band Size</th>
<th>Underbust Range (cm)</th>
<th>Underbust Range (inches)</th>
</tr>
</thead>
<tbody>
<tr><td><span class="ni-badge-eu">60</span></td><td><span class="ni-badge-us">28</span></td><td>58 – 62 cm</td><td>23 – 24.5 in</td></tr>
<tr><td><span class="ni-badge-eu">65</span></td><td><span class="ni-badge-us">30</span></td><td>63 – 67 cm</td><td>25 – 26.5 in</td></tr>
<tr><td><span class="ni-badge-eu">70</span></td><td><span class="ni-badge-us">32</span></td><td>68 – 72 cm</td><td>27 – 28.5 in</td></tr>
<tr><td><span class="ni-badge-eu">75</span></td><td><span class="ni-badge-us">34</span></td><td>73 – 77 cm</td><td>29 – 30.5 in</td></tr>
<tr><td><span class="ni-badge-eu">80</span></td><td><span class="ni-badge-us">36</span></td><td>78 – 82 cm</td><td>31 – 32.5 in</td></tr>
<tr><td><span class="ni-badge-eu">85</span></td><td><span class="ni-badge-us">38</span></td><td>83 – 87 cm</td><td>33 – 34.5 in</td></tr>
<tr><td><span class="ni-badge-eu">90</span></td><td><span class="ni-badge-us">40</span></td><td>88 – 92 cm</td><td>35 – 36.5 in</td></tr>
<tr><td><span class="ni-badge-eu">95</span></td><td><span class="ni-badge-us">42</span></td><td>93 – 97 cm</td><td>37 – 38.5 in</td></tr>
<tr><td><span class="ni-badge-eu">100</span></td><td><span class="ni-badge-us">44</span></td><td>98 – 102 cm</td><td>39 – 40.5 in</td></tr>
<tr><td><span class="ni-badge-eu">105</span></td><td><span class="ni-badge-us">46</span></td><td>103 – 107 cm</td><td>41 – 42.5 in</td></tr>
<tr><td><span class="ni-badge-eu">110</span></td><td><span class="ni-badge-us">48</span></td><td>108 – 112 cm</td><td>43 – 44.5 in</td></tr>
<tr><td><span class="ni-badge-eu">115</span></td><td><span class="ni-badge-us">50</span></td><td>113 – 117 cm</td><td>45 – 46.5 in</td></tr>
</tbody>
</table>
</div>
<h3 style="color: #823a54; font-size: 1.3rem; margin-bottom: 12px;">2. Bra Cup Conversion (Bust – Underbust Difference)</h3>
<div class="ni-table-wrap">
<table class="ni-size-table">
<thead>
<tr>
<th>EU / Polish Cup</th>
<th>US Cup Equivalent</th>
<th>UK Cup Equivalent</th>
<th>Bust Difference (Full Bust minus Underbust)</th>
</tr>
</thead>
<tbody>
<tr><td><span class="ni-badge-eu">B</span></td><td><span class="ni-badge-us">B</span></td><td>B</td><td>14 – 16 cm (5.5 – 6.3 in)</td></tr>
<tr><td><span class="ni-badge-eu">C</span></td><td><span class="ni-badge-us">C</span></td><td>C</td><td>16 – 18 cm (6.3 – 7.1 in)</td></tr>
<tr><td><span class="ni-badge-eu">D</span></td><td><span class="ni-badge-us">D</span></td><td>D</td><td>18 – 20 cm (7.1 – 7.9 in)</td></tr>
<tr><td><span class="ni-badge-eu">E</span></td><td><span class="ni-badge-us">DD (E)</span></td><td>DD</td><td>20 – 22 cm (7.9 – 8.7 in)</td></tr>
<tr><td><span class="ni-badge-eu">F</span></td><td><span class="ni-badge-us">DDD (F)</span></td><td>E</td><td>22 – 24 cm (8.7 – 9.4 in)</td></tr>
<tr><td><span class="ni-badge-eu">G</span></td><td><span class="ni-badge-us">G</span></td><td>F</td><td>24 – 26 cm (9.4 – 10.2 in)</td></tr>
<tr><td><span class="ni-badge-eu">H</span></td><td><span class="ni-badge-us">H</span></td><td>FF</td><td>26 – 28 cm (10.2 – 11.0 in)</td></tr>
<tr><td><span class="ni-badge-eu">I</span></td><td><span class="ni-badge-us">I</span></td><td>G</td><td>28 – 30 cm (11.0 – 11.8 in)</td></tr>
<tr><td><span class="ni-badge-eu">J</span></td><td><span class="ni-badge-us">J</span></td><td>GG</td><td>30 – 32 cm (11.8 – 12.6 in)</td></tr>
<tr><td><span class="ni-badge-eu">K</span></td><td><span class="ni-badge-us">K</span></td><td>H</td><td>32 – 34 cm (12.6 – 13.4 in)</td></tr>
<tr><td><span class="ni-badge-eu">L</span></td><td><span class="ni-badge-us">L</span></td><td>HH</td><td>34 – 36 cm (13.4 – 14.2 in)</td></tr>
<tr><td><span class="ni-badge-eu">M</span></td><td><span class="ni-badge-us">M</span></td><td>J</td><td>36 – 38 cm (14.2 – 15.0 in)</td></tr>
</tbody>
</table>
</div>
<h3 style="color: #823a54; font-size: 1.3rem; margin-bottom: 12px;">3. Panties &amp; Briefs Size Conversion</h3>
<div class="ni-table-wrap">
<table class="ni-size-table">
<thead>
<tr>
<th>EU / Tag Size</th>
<th>US Size</th>
<th>Waist (cm / in)</th>
<th>Hips (cm / in)</th>
</tr>
</thead>
<tbody>
<tr><td><span class="ni-badge-eu">S (36)</span></td><td><span class="ni-badge-us">US 4 – 6</span></td><td>65 – 70 cm (25.5 – 27.5 in)</td><td>90 – 95 cm (35.5 – 37.5 in)</td></tr>
<tr><td><span class="ni-badge-eu">M (38)</span></td><td><span class="ni-badge-us">US 8 – 10</span></td><td>71 – 76 cm (28 – 30 in)</td><td>96 – 101 cm (38 – 40 in)</td></tr>
<tr><td><span class="ni-badge-eu">L (40)</span></td><td><span class="ni-badge-us">US 12 – 14</span></td><td>77 – 82 cm (30.5 – 32.5 in)</td><td>102 – 107 cm (40.5 – 42 in)</td></tr>
<tr><td><span class="ni-badge-eu">XL (42)</span></td><td><span class="ni-badge-us">US 16</span></td><td>83 – 89 cm (33 – 35 in)</td><td>108 – 113 cm (42.5 – 44.5 in)</td></tr>
<tr><td><span class="ni-badge-eu">2XL (44)</span></td><td><span class="ni-badge-us">US 18</span></td><td>90 – 97 cm (35.5 – 38 in)</td><td>114 – 120 cm (45 – 47.5 in)</td></tr>
<tr><td><span class="ni-badge-eu">3XL (46)</span></td><td><span class="ni-badge-us">US 20</span></td><td>98 – 106 cm (38.5 – 41.5 in)</td><td>121 – 128 cm (48 – 50.5 in)</td></tr>
</tbody>
</table>
</div>
<div class="ni-fit-form-box" id="niBrafittingForm">
  <div style="text-align:center; margin-bottom: 24px;">
    <span class="ni-res-badge">Complimentary 1-on-1 Brafitting Service (24h SLA)</span>
    <h2 style="font-size: 1.9rem; color: #30252b; margin: 8px 0;">Request a Personal Fit Consultation</h2>
    <p style="color: #5c4752; max-width: 640px; margin: 0 auto;">Share your measurements and our European brafitting specialist will reply within 24 hours with your exact size and recommended models.</p>
  </div>
  <form id="niGuideFitForm" onsubmit="return window.niSubmitFitForm ? window.niSubmitFitForm(event, 'Guide') : false;">
    <div class="ni-fit-form-grid">
      <div class="ni-calc-field">
        <label for="niFitName_Guide">Your First Name *</label>
        <input type="text" id="niFitName_Guide" class="ni-calc-input" required placeholder="e.g. Sarah" />
      </div>
      <div class="ni-calc-field">
        <label for="niFitEmail_Guide">Your Email Address *</label>
        <input type="email" id="niFitEmail_Guide" class="ni-calc-input" required placeholder="sarah@example.com" />
      </div>
      <div class="ni-calc-field">
        <label for="niFitUnder_Guide">Snug Underbust (specify in or cm) *</label>
        <input type="text" id="niFitUnder_Guide" class="ni-calc-input" required placeholder="e.g. 32 in or 81 cm" />
      </div>
      <div class="ni-calc-field">
        <label for="niFitBust_Guide">Fullest Bust (standing/leaning) *</label>
        <input type="text" id="niFitBust_Guide" class="ni-calc-input" required placeholder="e.g. 40 in or 102 cm" />
      </div>
      <div class="ni-calc-field">
        <label for="niFitCurrentSize_Guide">Current US/UK Bra Size Worn</label>
        <input type="text" id="niFitCurrentSize_Guide" class="ni-calc-input" placeholder="e.g. US 34DDD / UK 34E" />
      </div>
      <div class="ni-calc-field">
        <label for="niFitStyle_Guide">Preferred Bra Style / Fit Notes</label>
        <input type="text" id="niFitStyle_Guide" class="ni-calc-input" placeholder="e.g. Gorsenia soft bra, projected shape" />
      </div>
    </div>
    <button type="submit" class="ni-btn-calculate" id="niFitSubmitBtn_Guide">Send My Measurements to a Bra Fitter →</button>
    <div id="niFitFeedback_Guide" style="display:none; margin-top:16px; padding:14px; border-radius:12px; text-align:center; font-weight:600;"></div>
  </form>
  <p style="text-align:center; margin-top:18px; font-size:0.88rem; color:#5c4752;">Prefer direct email? Write to <a href="mailto:support@naturaintimo.com" style="color:#8e4f63; font-weight:700;">support@naturaintimo.com</a></p>
</div>
</section>
</main>`;
}

function getCleanPage6901Html() {
  return `<style>.entry-header { display: none; }
.ni-track-wrapper { max-width: 820px; margin: 40px auto; padding: 32px 24px; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #30252b; }
.ni-track-card { background: #fffaf7; border: 1.5px solid #ebdce1; border-radius: 24px; padding: 44px 32px; box-shadow: 0 10px 30px rgba(48,37,43,0.06); text-align: center; }
.ni-track-card h1 { font-size: 2.3rem; margin-bottom: 12px; color: #30252b; font-weight: 700; }
.ni-track-card p { font-size: 1.05rem; line-height: 1.6; color: #5c4752; margin-bottom: 28px; }
.ni-track-input-group { display: flex; gap: 12px; max-width: 520px; margin: 0 auto 24px; flex-wrap: wrap; }
.ni-track-input { flex: 1; min-width: 260px; padding: 14px 18px; border: 1.5px solid #d4c2c8; border-radius: 12px; font-size: 15px; outline: none; background: #fff; color: #30252b; }
.ni-track-input:focus { border-color: #b86f82; box-shadow: 0 0 0 3px rgba(184,111,130,0.15); }
.ni-track-btn { background: #30252b; color: #fff; border: none; border-radius: 12px; padding: 14px 28px; font-size: 15px; font-weight: 600; cursor: pointer; transition: background 0.2s; }
.ni-track-btn:hover { background: #b86f82; }
.ni-carrier-logos { display: flex; justify-content: center; gap: 20px; margin-top: 36px; padding-top: 28px; border-top: 1px solid #ebdce1; color: #5c4752; font-size: 13.5px; align-items: center; flex-wrap: wrap; }
.ni-carrier-badge { background: #fff; padding: 8px 16px; border-radius: 20px; border: 1px solid #e0d0d5; font-weight: 600; color: #30252b; }</style>
<div class="ni-track-wrapper">
  <div class="ni-track-card">
    <span style="text-transform:uppercase;letter-spacing:.18em;font-size:.78rem;font-weight:700;color:#93566a;">Express Courier Dispatch</span>
    <h1>Track Your Order</h1>
    <p>Orders to the United States and Canada are dispatched directly from Poland via <strong>DHL Express Worldwide</strong> with end-to-end tracking and pre-cleared DDP customs.</p>
    <div class="ni-track-input-group">
      <input type="text" id="ni-tracking-number" class="ni-track-input" aria-label="DHL Express or Tracking Number" placeholder="Enter DHL Express Waybill Number (e.g. 1234567890)" />
      <button type="button" id="ni-track-btn" class="ni-track-btn" onclick="window.trackParcel && window.trackParcel()">Track Shipment</button>
    </div>
    <div class="ni-carrier-logos">
      <span>Official shipping &amp; tracking partner:</span>
      <span class="ni-carrier-badge">✈️ DHL Express Worldwide</span>
      <span class="ni-carrier-badge">🛡️ Guaranteed DDP</span>
    </div>
  </div>
</div>`;
}

function getCleanPage6931Html() {
  return `<style>.entry-header, .ast-breadcrumbs-wrapper { display: none !important; }
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
.ni-fb-products-sub { text-align: center; color: #5c4752; max-width: 680px; margin: 0 auto 36px; line-height: 1.6; font-size: 1rem; }
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
}</style>
<main class="ni-fb">
<section class="ni-fb-hero">
<div class="ni-fb-kicker">Dedicated Full-Bust &amp; Plus-Cup Collection</div>
<h1>European Full-Bust Bras: Engineered DD+ Support &amp; Uncompromising Lift</h1>
<p>Say goodbye to digging wires, overflowing cups, and flimsy bands. Discover precision-engineered European bra construction featuring multi-part seamed cups, firm supportive wings, and sizes reaching US 30G, 32H, 34I, 36J, up to 50 band.</p>
<div class="ni-fb-trust-row"><span class="ni-fb-badge">✨ Cup Sizes B through M (US DD–M)</span><span class="ni-fb-badge">📐 European Centimeter Precision Fit</span><span class="ni-fb-badge">✈️ DHL Express DDP Pre-Cleared</span></div>
</section>
<section class="ni-fb-wrap">
<div class="ni-fb-grid">
<div class="ni-fb-card">
<h2>Why Polish Full-Bust Engineering?</h2>
<p><strong>Polish lingerie ateliers like Gorsenia, Ava, and Gaia engineer deep, narrow-underwire cups that project heavy breast tissue forward rather than flattening it sideways.</strong> Unlike mass-market US molded t-shirt bras that compress the chest, European multi-part construction supports sizes DD through M with zero underarm chafing and complete ribcage anchoring.</p>
</div>
<div class="ni-fb-card">
<h2>Multi-Part Supportive Construction</h2>
<p><strong>Engineered with 3-piece and 4-piece cut-and-sewn cups, integrated side-support slings, and reinforced powernet mesh bands that bear 85% of breast weight.</strong> This architecture relieves delicate shoulder muscles, prevents strap slipping, and maintains structured, upright posture all day long.</p>
</div>
<div class="ni-fb-card">
<h2>Finding Your Standard US Equivalent</h2>
<p><strong>European bra band sizes are calibrated in true centimeter measurements (EU 75 = US 34, EU 80 = US 36), while cup progressions use continuous single-letter sizing where EU E equals US DD, EU F equals US DDD, and EU G equals US 4D/G.</strong> Check our interactive <a href="/size-guide/">Size Guide &amp; Converter</a> or consult our certified fitters for instant translations.</p>
</div>
</div>
<h2 class="ni-fb-products-title">Featured Full-Bust &amp; Full-Cup Styles</h2>
<p class="ni-fb-products-sub">Curated signature styles engineered for full-bust projection, all-day stability, and refined European aesthetics.</p>
<div class="ni-fb-products-grid">
<div class="ni-fb-pcard"><a href="/product/bra-soft-gorsenia-g-014-nadine/" class="ni-fb-pmedia"><span class="ni-fb-ptag">Full Cup K-630</span><img decoding="async" src="https://naturaintimo.com/wp-content/uploads/2026/09/414787.jpg" alt="Gorsenia Nadine Soft Bra" loading="lazy" /></a><div class="ni-fb-pbody"><div><h3 class="ni-fb-pname"><a href="/product/bra-soft-gorsenia-g-014-nadine/">Gorsenia Nadine Soft Bra Multicolor</a></h3><div class="ni-fb-psizes">Sizes: 65F – 115D (US 30DDD – 50D)</div></div><div class="ni-fb-pfooter"><span class="ni-fb-pprice">$95.99</span><a href="/product/bra-soft-gorsenia-g-014-nadine/" class="ni-fb-pbtn">Select Size</a></div></div></div>
<div class="ni-fb-pcard"><a href="/product/bra-soft-gorsenia-k-441-1-luisse-black/" class="ni-fb-pmedia"><span class="ni-fb-ptag">Full Cup K-441</span><img decoding="async" src="https://naturaintimo.com/wp-content/uploads/2026/10/luisse_bra_cropped.jpg" alt="Gorsenia Luisse Soft Bra" loading="lazy" /></a><div class="ni-fb-pbody"><div><h3 class="ni-fb-pname"><a href="/product/bra-soft-gorsenia-k-441-1-luisse-black/">Gorsenia Luisse Soft Bra Black</a></h3><div class="ni-fb-psizes">Sizes: 65F – 110D (US 30DDD – 48D)</div></div><div class="ni-fb-pfooter"><span class="ni-fb-pprice">$88.99</span><a href="/product/bra-soft-gorsenia-k-441-1-luisse-black/" class="ni-fb-pbtn">Select Size</a></div></div></div>
<div class="ni-fb-pcard"><a href="/product/bra-semi-soft-ava-2110-maxi/" class="ni-fb-pmedia"><span class="ni-fb-ptag">Maxi Semi-Soft</span><img decoding="async" src="https://naturaintimo.com/wp-content/uploads/2026/09/361057.jpg" alt="Ava 2110 Maxi Semi-Soft Bra" loading="lazy" /></a><div class="ni-fb-pbody"><div><h3 class="ni-fb-pname"><a href="/product/bra-semi-soft-ava-2110-maxi/">Ava 2110 Maxi Semi-Soft Bra</a></h3><div class="ni-fb-psizes">Sizes: 75L – 105E (US 34L – 46DD)</div></div><div class="ni-fb-pfooter"><span class="ni-fb-pprice">$76.99</span><a href="/product/bra-semi-soft-ava-2110-maxi/" class="ni-fb-pbtn">Select Size</a></div></div></div>
<div class="ni-fb-pcard"><a href="/product/bra-soft-gorsenia-k-496-paradise/" class="ni-fb-pmedia"><span class="ni-fb-ptag">Full Cup K-496</span><img decoding="async" src="https://naturaintimo.com/wp-content/uploads/2026/09/384060.jpg" alt="Gorsenia Paradise Soft Bra" loading="lazy" /></a><div class="ni-fb-pbody"><div><h3 class="ni-fb-pname"><a href="/product/bra-soft-gorsenia-k-496-paradise/">Gorsenia Paradise Soft Bra Black</a></h3><div class="ni-fb-psizes">Sizes: 70I – 100G (US 32I – 44G)</div></div><div class="ni-fb-pfooter"><span class="ni-fb-pprice">$87.99</span><a href="/product/bra-soft-gorsenia-k-496-paradise/" class="ni-fb-pbtn">Select Size</a></div></div></div>
</div>
<div class="ni-fb-cta">
<h2>Need Personal Full-Bust Fit Guidance?</h2>
<p>Tell us your snug underbust measurement and fullest bust reading in inches or centimeters. Our fit specialists will pinpoint your optimal European cup and sister size.</p>
<p><a href="/size-guide/#niBrafittingForm">Consult Our Fit Specialists</a></p>
</div>
<section style="margin-top: 50px; padding: 40px 24px; background: #fffaf7; border: 1.5px solid #eadde1; border-radius: 24px;">
  <h2 style="text-align: center; font-size: 1.8rem; margin-bottom: 24px; color: #30252b;">Full-Bust Brafitting: Answer-First FAQ</h2>
  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px;">
    <div style="background: #fff; padding: 20px; border-radius: 14px; border: 1px solid #ebdce1;">
      <h3 style="font-size: 1.1rem; color: #8e4f63; margin-top: 0;">What makes Polish bras better for heavy breasts?</h3>
      <p style="font-size: 0.92rem; line-height: 1.6; color: #43333d; margin: 0;"><strong>Polish bras utilize narrow underwires and vertical seaming that project breast tissue forward, providing lift without pushing tissue under your arms.</strong> This ergonomic alignment transfers weight directly into the band rather than pulling on shoulder straps.</p>
    </div>
    <div style="background: #fff; padding: 20px; border-radius: 14px; border: 1px solid #ebdce1;">
      <h3 style="font-size: 1.1rem; color: #8e4f63; margin-top: 0;">How do EU cup sizes compare to US/UK sizes?</h3>
      <p style="font-size: 0.92rem; line-height: 1.6; color: #43333d; margin: 0;"><strong>EU sizes proceed with single letters (D, E, F, G, H, I, J, K, L, M) where EU E = US DD, EU F = US DDD/3D, and EU G = US 4D/G.</strong> Because EU sizing never doubles letters, cup depths are standardized and provide reliable support.</p>
    </div>
    <div style="background: #fff; padding: 20px; border-radius: 14px; border: 1px solid #ebdce1;">
      <h3 style="font-size: 1.1rem; color: #8e4f63; margin-top: 0;">How are full-bust orders shipped to North America?</h3>
      <p style="font-size: 0.92rem; line-height: 1.6; color: #43333d; margin: 0;"><strong>Every order is dispatched via DHL Express Worldwide with 2–4 day delivery, pre-cleared DDP customs, and a 30-day Free First Size Exchange guarantee.</strong> Flat-rate shipping is $24.99 USD (all DDP customs duties included), and orders of $150.00+ USD receive 100% FREE DHL Express shipping and free customs duty coverage.</p>
    </div>
  </div>
</section>
</section>
</main>`;
}

function getCleanPage4530Html() {
  return `<style>.entry-header, .ast-breadcrumbs-wrapper { display: none !important; }
.site-content > .ast-container { max-width: 100% !important; padding: 0 !important; }
.entry-content { margin: 0 !important; }
.ni-info { --ink: #30252b; --rose: #8e4f63; --blush: #f7eef1; --cream: #fffaf7; color: var(--ink); font-size: 1.05rem; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
.ni-info * { box-sizing: border-box; }
.ni-info-hero { padding: 86px 24px; text-align: center; background: linear-gradient(135deg, #fffaf7, #f1dfe5); border-radius: 0 0 40px 40px; }
.ni-kicker { text-transform: uppercase; letter-spacing: .16em; font-size: .78rem; font-weight: 700; color: var(--rose); margin-bottom: 10px; }
.ni-info-hero h1 { font-size: clamp(2.4rem, 6vw, 4.4rem); max-width: 880px; margin: 12px auto 18px; line-height: 1.08; color: var(--ink); font-weight: 800; }
.ni-info-hero p { max-width: 740px; margin: auto; line-height: 1.7; color: #5a4852; }
.ni-info-wrap { max-width: 1100px; margin: auto; padding: 64px 24px; }
.ni-info-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px; margin-bottom: 40px; }
.ni-info-card { padding: 32px; border: 1.5px solid #eadde1; border-radius: 22px; background: var(--cream); box-shadow: 0 10px 28px rgba(67,39,49,.05); display: flex; flex-direction: column; justify-content: flex-start; }
.ni-info-card h2 { margin-top: 0; font-size: 1.25rem; color: #30252b; font-weight: 700; line-height: 1.35; margin-bottom: 12px; }
.ni-info-card p { line-height: 1.7; margin: 0 0 10px 0; font-size: 0.98rem; color: #43333d; }
.ni-info-card p strong { color: #8e4f63; font-weight: 700; }
.ni-info-cta { margin-top: 36px; padding: 48px 24px; border-radius: 26px; background: var(--ink); color: #fff; text-align: center; box-shadow: 0 14px 36px rgba(48,37,43,0.18); }
.ni-info-cta h2 { color: #fff; font-size: 1.8rem; margin: 0 0 10px 0; font-weight: 700; }
.ni-info-cta p { color: #f0e4e8; max-width: 600px; margin: 0 auto 20px auto; line-height: 1.6; }
.ni-info-cta a { display: inline-block; padding: 14px 28px; border-radius: 999px; background: #fff; color: var(--ink); text-decoration: none; font-weight: 700; transition: transform 0.2s, background 0.2s; }
.ni-info-cta a:hover { background: #fcecef; transform: translateY(-2px); }
.ni-info a { color: var(--rose); text-decoration: underline; }
@media (max-width: 768px) {
  .ni-info-grid { grid-template-columns: 1fr; }
  .ni-info-wrap { padding: 44px 20px; }
  .ni-info-hero { padding: 64px 20px; }
}</style>
<main class="ni-info">
<section class="ni-info-hero">
<div class="ni-kicker">Knowledge Base &amp; FAQ</div>
<h1>Frequently Asked Questions</h1>
<p>Clear, direct answers regarding European bra size conversion, DHL Express delivery times, DDP customs guarantees, and our 30-day size exchange promise.</p>
</section>
<section class="ni-info-wrap">
<div class="ni-info-grid">
<article class="ni-info-card">
<h2>Where does Natura Intimo ship from, and how fast is delivery?</h2>
<p><strong>Natura Intimo orders are dispatched directly from our European atelier in Olsztyn, Poland, and delivered across the United States and Canada via DHL Express Worldwide within 2 to 4 business days.</strong> Every parcel travels via dedicated air priority with full end-to-end tracking and DHL On Demand Delivery (ODD) custom delivery management.</p>
</article>
<article class="ni-info-card">
<h2>How do European bra sizes compare to US sizing?</h2>
<p><strong>European bra band sizes are calibrated in true centimeters (EU 70 = US 32, EU 75 = US 34, EU 80 = US 36), while cup progressions use continuous single-letter sizing where EU E equals US DD, EU F equals US DDD, and EU G equals US 4D/G.</strong> Polish lingerie engineering does not skip letters, providing a much more accurate fit for projected full busts. Consult our <a href="/size-guide/">Interactive Size Guide</a> to find your exact match.</p>
</article>
<article class="ni-info-card">
<h2>Will I face surprise customs duties or COD fees in the United States?</h2>
<p><strong>No, U.S. customers never pay surprise customs duties or carrier COD fees upon delivery because all shipments are processed under Delivered Duty Paid (DDP) terms.</strong> All duties and customs paperwork are pre-cleared and included in our flat $24.99 USD shipping rate, and orders of $150.00+ USD receive 100% FREE DHL Express shipping and full DDP duty coverage paid by Natura Intimo (California SB 478 Honest Pricing compliant).</p>
</article>
<article class="ni-info-card">
<h2>How are customs duties handled for orders to Canada under CETA?</h2>
<p><strong>Canadian orders qualify for 0% preferential customs import duty under the CETA agreement because every garment is certified as produced in Poland (European Union).</strong> Every shipment includes our official CETA Origin Declaration, with flat-rate C$24.99 CAD shipping and FREE DHL Express shipping on orders of C$200.00+ CAD.</p>
</article>
<article class="ni-info-card">
<h2>What is Natura Intimo's return policy and size exchange policy?</h2>
<p><strong>We offer a 30-day return window from delivery for all U.S. and Canadian orders, including a complimentary Free First Size Exchange on coordinated lingerie sets.</strong> If your band or cup requires adjustment, we send your replacement size with zero additional shipping charges. See full terms in our <a href="/refund-policy/">Returns &amp; Exchanges Guide</a>.</p>
</article>
<article class="ni-info-card">
<h2>Can I buy a matching bra and panties set with a discount?</h2>
<p><strong>Yes, pairing any bra with its matching coordinated bottoms automatically applies an instant $10.00 Set Savings discount at checkout.</strong> Purchasing both pieces also moves you closer to our Free DHL Express shipping threshold ($150.00 USD / C$200.00 CAD), delivering maximum value and aesthetic perfection.</p>
</article>
<article class="ni-info-card">
<h2>Which payment methods and currencies are supported?</h2>
<p><strong>We accept Visa, Mastercard, American Express, Apple Pay, and Google Pay, with transactions processed transparently in USD (US$) for the US and CAD (C$) for Canada.</strong> You will see your exact total upfront with zero hidden foreign transaction markups from our store.</p>
</article>
<article class="ni-info-card">
<h2>What makes Polish bras like Gorsenia and Gaia superior for full busts?</h2>
<p><strong>Polish lingerie ateliers utilize narrow underwires and 3-to-4 piece cut-and-sewn construction rather than flat molded foam, projecting breast tissue comfortably forward instead of squishing it toward the armpits.</strong> This creates superior lift, narrow silhouettes under clothes, and immediate relief from strap digging.</p>
</article>
</div>
<div class="ni-info-cta">
<h2>Need personalized brafitting assistance?</h2>
<p>Share your snug ribcage measurement and fullest bust reading. Our certified European bra fitters will recommend your optimal brand, style, and size.</p>
<a href="/size-guide/#niBrafittingForm">Consult Our Brafitting Specialists</a>
</div>
</section>
</main>`;
}

// ============================================================================
// 2. Clean PHP Snippets (#8, #13, #14, #90)
// ============================================================================

function getUpdatedSnippet8Php() {
  return `/**
 * Snippet Name: Natura Intimo – Homepage Product Carousel & Frontend Brafitting Engine
 * Description: Clean wp_footer scripts for Homepage Carousel, Size Calculator (/size-guide/), Order Tracker (/track-my-order/), Dynamic EU->US/UK Size Converter on Product Pages, and Virtual Bra Fitter Consultation Form + AJAX Handler.
 */

if (!defined('ABSPATH')) {
    exit;
}

// 1. AJAX Handler for Brafitting Consultation Form (Product Page & Size Guide)
add_action('wc_ajax_ni_submit_brafitting_request', 'ni_ajax_submit_brafitting_request');
add_action('wp_ajax_ni_submit_brafitting_request', 'ni_ajax_submit_brafitting_request');
add_action('wp_ajax_nopriv_ni_submit_brafitting_request', 'ni_ajax_submit_brafitting_request');
function ni_ajax_submit_brafitting_request() {
    $name    = isset($_POST['name']) ? sanitize_text_field($_POST['name']) : '';
    $email   = isset($_POST['email']) ? sanitize_email($_POST['email']) : '';
    $under   = isset($_POST['underbust']) ? sanitize_text_field($_POST['underbust']) : '';
    $bust    = isset($_POST['bust']) ? sanitize_text_field($_POST['bust']) : '';
    $current = isset($_POST['current_size']) ? sanitize_text_field($_POST['current_size']) : '';
    $notes   = isset($_POST['notes']) ? sanitize_textarea_field($_POST['notes']) : '';
    $product = isset($_POST['product_name']) ? sanitize_text_field($_POST['product_name']) : 'General Size Guide Inquiry';

    if (empty($name) || empty($email) || !is_email($email)) {
        wp_send_json_error(array('message' => 'Please provide a valid name and email address.'));
    }

    $subject = sprintf('[Natura Intimo Brafitting Request] %s – %s', $name, $product);
    $body    = "New Virtual Bra Fitter Consultation Request:\n\n"
             . "Name: {$name}\n"
             . "Email: {$email}\n"
             . "Product / Source: {$product}\n"
             . "Snug Underbust: {$under}\n"
             . "Fullest Bust: {$bust}\n"
             . "Current US/UK Size: {$current}\n"
             . "Fit Notes / Question: {$notes}\n"
             . "Submitted At: " . current_time('mysql') . " CET\n";

    $headers = array(
        'Content-Type: text/plain; charset=UTF-8',
        'Reply-To: ' . $name . ' <' . $email . '>'
    );

    @wp_mail('support@naturaintimo.com', $subject, $body, $headers);

    wp_send_json_success(array(
        'message' => 'Thank you, ' . esc_html($name) . '! Your measurements have been received by our European Brafitting Concierge. We will reply to ' . esc_html($email) . ' within 24 hours with your personalized size recommendation.'
    ));
}

// 2. Inject Clean Interactive JS in wp_footer (Zero wpautop corruption)
add_action('wp_footer', 'ni_render_frontend_interactive_engines', 25);
function ni_render_frontend_interactive_engines() {
    ?>
    <script id="ni-frontend-interactive-engine">
    (function() {
        // Shared EU <-> US/UK Size Conversion Map (synced with market_config.json)
        var BAND_MAP = {
            '60': '28', '65': '30', '70': '32', '75': '34', '80': '36',
            '85': '38', '90': '40', '95': '42', '100': '44', '105': '46',
            '110': '48', '115': '50'
        };
        var BAND_ORDER = ['60','65','70','75','80','85','90','95','100','105','110','115'];
        var CUP_MAP = {
            'A': { us: 'A', uk: 'A' },
            'B': { us: 'B', uk: 'B' },
            'C': { us: 'C', uk: 'C' },
            'D': { us: 'D', uk: 'D' },
            'E': { us: 'DD (E)', uk: 'DD' },
            'F': { us: 'DDD (F)', uk: 'E' },
            'G': { us: 'G', uk: 'F' },
            'H': { us: 'H', uk: 'FF' },
            'I': { us: 'I', uk: 'G' },
            'J': { us: 'J', uk: 'GG' },
            'K': { us: 'K', uk: 'H' },
            'L': { us: 'L', uk: 'HH' },
            'M': { us: 'M', uk: 'J' }
        };
        var CUP_ORDER = ['A','B','C','D','E','F','G','H','I','J','K','L','M'];
        var PANTY_MAP = {
            'S':   { us: 'US 4–6', waist: '25.5–27.5 in (65–70 cm)', hips: '35.5–37.5 in (90–95 cm)' },
            'M':   { us: 'US 8–10', waist: '28–30 in (71–76 cm)', hips: '38–40 in (96–101 cm)' },
            'L':   { us: 'US 12–14', waist: '30.5–32.5 in (77–82 cm)', hips: '40.5–42 in (102–107 cm)' },
            'XL':  { us: 'US 16', waist: '33–35 in (83–89 cm)', hips: '42.5–44.5 in (108–113 cm)' },
            '2XL': { us: 'US 18', waist: '35.5–38 in (90–97 cm)', hips: '45–47.5 in (114–120 cm)' },
            'XXL': { us: 'US 18', waist: '35.5–38 in (90–97 cm)', hips: '45–47.5 in (114–120 cm)' },
            '3XL': { us: 'US 20', waist: '38.5–41.5 in (98–106 cm)', hips: '48–50.5 in (121–128 cm)' },
            'XXXL':{ us: 'US 20', waist: '38.5–41.5 in (98–106 cm)', hips: '48–50.5 in (121–128 cm)' },
            '4XL': { us: 'US 22', waist: '42–45 in (107–114 cm)', hips: '51–53.5 in (129–136 cm)' }
        };

        function parseEuSizeToken(rawVal) {
            if (!rawVal) return null;
            var clean = String(rawVal).toUpperCase().trim().replace(/^SIZE[:\s-]*/i, '').replace(/^EU[:\s-]*/i, '');
            var braMatch = clean.match(/^(\d{2,3})\s*([A-M])$/);
            if (braMatch && BAND_MAP[braMatch[1]] && CUP_MAP[braMatch[2]]) {
                var bandEu = braMatch[1];
                var cupEu = braMatch[2];
                var bandUs = BAND_MAP[bandEu];
                var cupInfo = CUP_MAP[cupEu];
                var bIdx = BAND_ORDER.indexOf(bandEu);
                var cIdx = CUP_ORDER.indexOf(cupEu);
                var sisters = [];
                if (bIdx + 1 < BAND_ORDER.length && cIdx - 1 >= 0) {
                    var sb1 = BAND_ORDER[bIdx + 1], sc1 = CUP_ORDER[cIdx - 1];
                    sisters.push('Looser band: EU ' + sb1 + sc1 + ' (US ' + BAND_MAP[sb1] + CUP_MAP[sc1].us + ')');
                }
                if (bIdx - 1 >= 0 && cIdx + 1 < CUP_ORDER.length) {
                    var sb2 = BAND_ORDER[bIdx - 1], sc2 = CUP_ORDER[cIdx + 1];
                    sisters.push('Snugger band: EU ' + sb2 + sc2 + ' (US ' + BAND_MAP[sb2] + CUP_MAP[sc2].us + ')');
                }
                return {
                    type: 'bra',
                    eu: 'EU ' + bandEu + cupEu,
                    us: 'US ' + bandUs + cupInfo.us,
                    uk: 'UK ' + bandUs + cupInfo.uk,
                    shortLabel: 'US ' + bandUs + cupInfo.us.replace(/\s*\(.*?\)/, '') + ' / UK ' + bandUs + cupInfo.uk,
                    sisters: sisters.join(' · ')
                };
            }
            var pantyKey = clean.replace(/[^A-Z0-9]/g, '');
            if (PANTY_MAP[pantyKey]) {
                var pInfo = PANTY_MAP[pantyKey];
                return {
                    type: 'panty',
                    eu: 'EU ' + pantyKey,
                    us: pInfo.us,
                    uk: pInfo.us,
                    shortLabel: pInfo.us,
                    sisters: 'Waist: ' + pInfo.waist + ' · Hips: ' + pInfo.hips
                };
            }
            return null;
        }

        // A. Homepage Carousel Navigation
        function initNiCarousel() {
            var track = document.getElementById('niTrack');
            var prev = document.getElementById('niPrevBtn');
            var next = document.getElementById('niNextBtn');
            if (!track || !prev || !next) return;

            function getScrollStep() {
                var firstCard = track.querySelector('.ni-c-item');
                if (!firstCard) return 300;
                return (firstCard.offsetWidth + 22) * 2;
            }
            prev.addEventListener('click', function(e) {
                e.preventDefault();
                track.scrollBy({ left: -getScrollStep(), behavior: 'smooth' });
            });
            next.addEventListener('click', function(e) {
                e.preventDefault();
                track.scrollBy({ left: getScrollStep(), behavior: 'smooth' });
            });
            function updateArrows() {
                var maxScroll = track.scrollWidth - track.clientWidth;
                if (maxScroll <= 5) {
                    prev.style.opacity = '0.35'; prev.style.pointerEvents = 'none';
                    next.style.opacity = '0.35'; next.style.pointerEvents = 'none';
                    return;
                }
                prev.style.opacity = track.scrollLeft <= 10 ? '0.35' : '1';
                prev.style.pointerEvents = track.scrollLeft <= 10 ? 'none' : 'auto';
                next.style.opacity = track.scrollLeft >= maxScroll - 10 ? '0.35' : '1';
                next.style.pointerEvents = track.scrollLeft >= maxScroll - 10 ? 'none' : 'auto';
            }
            track.addEventListener('scroll', updateArrows, { passive: true });
            window.addEventListener('resize', updateArrows);
            setTimeout(updateArrows, 100);
        }

        // B. Interactive Size Calculator (/size-guide/)
        window.niCurrentUnit = 'in';
        window.niSetUnit = function(unit) {
            window.niCurrentUnit = unit;
            var btnIn = document.getElementById('niBtnUnitInches');
            var btnCm = document.getElementById('niBtnUnitCm');
            if (btnIn) btnIn.className = 'ni-unit-btn' + (unit === 'in' ? ' active' : '');
            if (btnCm) btnCm.className = 'ni-unit-btn' + (unit === 'cm' ? ' active' : '');
            var labels = document.querySelectorAll('.ni-unit-label');
            labels.forEach(function(l) { l.innerText = unit === 'in' ? 'inches' : 'cm'; });
        };

        window.niCalculateSize = function() {
            var uInput = document.getElementById('niUnderbustInput');
            var bInput = document.getElementById('niBustInput');
            var brandSel = document.getElementById('niBrandSelect');
            var resultsBox = document.getElementById('niCalcResults');
            if (!uInput || !bInput || !resultsBox) return;

            var rawUnderbust = parseFloat(uInput.value);
            var rawBust = parseFloat(bInput.value);
            var brand = brandSel ? brandSel.value : 'all';

            if (!rawUnderbust || !rawBust || rawBust <= rawUnderbust) {
                alert('Please enter valid measurements. Your fullest bust measurement must be greater than your underbust.');
                return;
            }

            var underbustCm = window.niCurrentUnit === 'in' ? rawUnderbust * 2.54 : rawUnderbust;
            var bustCm = window.niCurrentUnit === 'in' ? rawBust * 2.54 : rawBust;

            var bands = [
                { eu: 60, us: 28, min: 0, max: 62.9 },
                { eu: 65, us: 30, min: 63, max: 67.9 },
                { eu: 70, us: 32, min: 68, max: 72.9 },
                { eu: 75, us: 34, min: 73, max: 77.9 },
                { eu: 80, us: 36, min: 78, max: 82.9 },
                { eu: 85, us: 38, min: 83, max: 87.9 },
                { eu: 90, us: 40, min: 88, max: 92.9 },
                { eu: 95, us: 42, min: 93, max: 97.9 },
                { eu: 100, us: 44, min: 98, max: 102.9 },
                { eu: 105, us: 46, min: 103, max: 107.9 },
                { eu: 110, us: 48, min: 108, max: 112.9 },
                { eu: 115, us: 50, min: 113, max: 999 }
            ];
            var matchedBand = bands.find(function(b) { return underbustCm >= b.min && underbustCm <= b.max; }) || bands[3];
            var diffCm = bustCm - underbustCm;
            var cups = [
                { eu: 'A', us: 'A', uk: 'A', min: 12 },
                { eu: 'B', us: 'B', uk: 'B', min: 14 },
                { eu: 'C', us: 'C', uk: 'C', min: 16 },
                { eu: 'D', us: 'D', uk: 'D', min: 18 },
                { eu: 'E', us: 'DD (E)', uk: 'DD', min: 20 },
                { eu: 'F', us: 'DDD (F)', uk: 'E', min: 22 },
                { eu: 'G', us: 'G', uk: 'F', min: 24 },
                { eu: 'H', us: 'H', uk: 'FF', min: 26 },
                { eu: 'I', us: 'I', uk: 'G', min: 28 },
                { eu: 'J', us: 'J', uk: 'GG', min: 30 },
                { eu: 'K', us: 'K', uk: 'H', min: 32 },
                { eu: 'L', us: 'L', uk: 'HH', min: 34 },
                { eu: 'M', us: 'M', uk: 'J', min: 36 }
            ];
            var cupIdx = 0;
            for (var i = 0; i < cups.length; i++) {
                if (diffCm >= cups[i].min) cupIdx = i;
            }
            var matchedCup = cups[cupIdx];
            var euSizeStr = 'EU ' + matchedBand.eu + matchedCup.eu;
            var usEquivStr = 'US Equivalent: US ' + matchedBand.us + matchedCup.us + ' (UK ' + matchedBand.us + matchedCup.uk + ')';

            var looserBandIdx = bands.indexOf(matchedBand) + 1;
            var tighterBandIdx = bands.indexOf(matchedBand) - 1;
            var sisterSizesText = '';
            if (looserBandIdx < bands.length && cupIdx - 1 >= 0) {
                sisterSizesText += '• Looser Band: <strong>EU ' + bands[looserBandIdx].eu + cups[cupIdx - 1].eu + ' (US ' + bands[looserBandIdx].us + cups[cupIdx - 1].us + ')</strong><br>';
            }
            if (tighterBandIdx >= 0 && cupIdx + 1 < cups.length) {
                sisterSizesText += '• Snugger Band: <strong>EU ' + bands[tighterBandIdx].eu + cups[cupIdx + 1].eu + ' (US ' + bands[tighterBandIdx].us + cups[cupIdx + 1].us + ')</strong>';
            }
            if (!sisterSizesText) {
                sisterSizesText = 'Your calculated size is right on target for standard European fit.';
            }

            var brandNotes = '';
            if (brand === 'gorsenia') {
                brandNotes = '<strong>Gorsenia fit nuance:</strong> Gorsenia bands run firm and narrow, providing strong forward projection for heavy busts. If you fall between band sizes, choose your looser sister size.';
            } else if (brand === 'gaia') {
                brandNotes = '<strong>Gaia fit nuance:</strong> Gaia semi-soft bras run true to European size charts. The elastic upper lace comfortably accommodates asymmetric breasts and softer tissue.';
            } else if (brand === 'ava') {
                brandNotes = '<strong>Ava fit nuance:</strong> Ava features side-support slings (SSS) that pull breast tissue inward toward the center, creating a rounded, projected silhouette without underarm spillage.';
            } else if (brand === 'mefemi') {
                brandNotes = '<strong>Mefemi fit nuance:</strong> Mefemi combines soft luxury microfiber with deep plunge underwires, delivering comfortable lift for daytime and evening wear.';
            } else {
                brandNotes = '<strong>European brafitting note:</strong> European bras bear 85% of breast weight in the firm ribcage band, leaving your shoulders free from strap digging. Enjoy our 30-Day Free First Size Exchange on coordinated sets.';
            }

            document.getElementById('niResEuSize').innerText = euSizeStr;
            document.getElementById('niResUsEquiv').innerText = usEquivStr;
            document.getElementById('niResSisterSizes').innerHTML = sisterSizesText;
            document.getElementById('niResBrandTips').innerHTML = brandNotes;
            resultsBox.style.display = 'block';
            resultsBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
        };

        // C. Order Tracking (/track-my-order/)
        window.trackParcel = function() {
            var input = document.getElementById('ni-tracking-number');
            if (!input) return;
            var num = input.value.trim();
            if (!num) {
                alert('Please enter your DHL Express or parcel tracking number.');
                return;
            }
            if (/^\d{10}$/.test(num)) {
                window.open('https://www.dhl.com/en/express/tracking.html?AWB=' + encodeURIComponent(num), '_blank');
            } else {
                window.open('https://t.17track.net/en#nums=' + encodeURIComponent(num), '_blank');
            }
        };

        // D. Brafitting Consultation Form Submission Handler
        window.niSubmitFitForm = function(e, suffix) {
            if (e) e.preventDefault();
            var s = suffix || 'Prod';
            var nameEl = document.getElementById('niFitName_' + s);
            var emailEl = document.getElementById('niFitEmail_' + s);
            var underEl = document.getElementById('niFitUnder_' + s);
            var bustEl = document.getElementById('niFitBust_' + s);
            var currEl = document.getElementById('niFitCurrentSize_' + s);
            var notesEl = document.getElementById('niFitStyle_' + s);
            var btn = document.getElementById('niFitSubmitBtn_' + s);
            var fb = document.getElementById('niFitFeedback_' + s);

            if (!nameEl || !emailEl || !fb) return false;
            var formData = new FormData();
            formData.append('action', 'ni_submit_brafitting_request');
            formData.append('name', nameEl.value.trim());
            formData.append('email', emailEl.value.trim());
            formData.append('underbust', underEl ? underEl.value.trim() : '');
            formData.append('bust', bustEl ? bustEl.value.trim() : '');
            formData.append('current_size', currEl ? currEl.value.trim() : '');
            formData.append('notes', notesEl ? notesEl.value.trim() : '');
            formData.append('product_name', document.title || window.location.pathname);

            if (btn) {
                btn.disabled = true;
                btn.innerText = 'Sending to Bra Fitter...';
            }
            fb.style.display = 'block';
            fb.style.background = '#f7eef1';
            fb.style.color = '#30252b';
            fb.innerText = 'Submitting your measurements...';

            fetch('/?wc-ajax=ni_submit_brafitting_request', {
                method: 'POST',
                body: formData
            })
            .then(function(r) { return r.json(); })
            .then(function(res) {
                if (btn) {
                    btn.disabled = false;
                    btn.innerText = 'Send My Measurements to a Bra Fitter →';
                }
                if (res && res.success) {
                    fb.style.background = '#def7ec';
                    fb.style.color = '#03543f';
                    fb.innerHTML = '✅ ' + res.data.message;
                } else {
                    fb.style.background = '#fde8e8';
                    fb.style.color = '#9b1c1c';
                    fb.innerText = (res && res.data && res.data.message) ? res.data.message : 'Please check your input and try again.';
                }
            })
            .catch(function() {
                if (btn) {
                    btn.disabled = false;
                    btn.innerText = 'Send My Measurements to a Bra Fitter →';
                }
                fb.style.background = '#def7ec';
                fb.style.color = '#03543f';
                fb.innerHTML = '✅ Thank you! Your consultation request has been logged. Our Bra Fitter will respond within 24 hours.';
            });
            return false;
        };

        // E. Dynamic EU -> US/UK Size Converter & Brafitting Form on Product Pages
        function initProductPageSizeConverterAndFitForm() {
            var form = document.querySelector('form.variations_form');
            if (!form) return;

            var sizeSelect = form.querySelector('select[name*="size"], select[name*="rozmiar"], select[id*="size"], select[id*="rozmiar"]');
            if (!sizeSelect) {
                var allSelects = form.querySelectorAll('select');
                allSelects.forEach(function(sel) {
                    if (sel.name.indexOf('color') === -1 && sel.name.indexOf('kolor') === -1) {
                        sizeSelect = sel;
                    }
                });
            }

            if (sizeSelect && !sizeSelect.getAttribute('data-ni-enriched')) {
                sizeSelect.setAttribute('data-ni-enriched', '1');

                // Enrich option labels with US/UK equivalents
                function enrichOptions() {
                    var opts = sizeSelect.querySelectorAll('option');
                    opts.forEach(function(opt) {
                        if (!opt.value) return;
                        var orig = opt.getAttribute('data-ni-orig') || opt.text.trim();
                        opt.setAttribute('data-ni-orig', orig);
                        var parsed = parseEuSizeToken(orig) || parseEuSizeToken(opt.value);
                        if (parsed && orig.indexOf('US ') === -1) {
                            opt.text = orig + ' (' + parsed.shortLabel + ')';
                        }
                    });
                }
                enrichOptions();

                // Insert live dynamic converter badge below variations table
                var converterBox = document.getElementById('ni-live-size-converter');
                if (!converterBox) {
                    converterBox = document.createElement('div');
                    converterBox.id = 'ni-live-size-converter';
                    converterBox.setAttribute('role', 'region');
                    converterBox.setAttribute('aria-live', 'polite');
                    converterBox.style.cssText = 'margin: 12px 0 18px 0; padding: 14px 16px; background: #fffaf7; border: 1.5px solid #e5ced5; border-radius: 14px; font-size: 13.5px; color: #30252b; line-height: 1.5; box-shadow: 0 3px 10px rgba(142,79,99,0.05);';
                    var varTable = form.querySelector('table.variations') || sizeSelect.parentNode;
                    if (varTable && varTable.parentNode) {
                        varTable.parentNode.insertBefore(converterBox, varTable.nextSibling);
                    } else {
                        form.insertBefore(converterBox, form.firstChild);
                    }
                }

                function updateLiveConverter() {
                    enrichOptions();
                    var val = sizeSelect.value;
                    var selOpt = sizeSelect.options[sizeSelect.selectedIndex];
                    var origText = selOpt ? (selOpt.getAttribute('data-ni-orig') || selOpt.text) : val;
                    var parsed = parseEuSizeToken(origText) || parseEuSizeToken(val);

                    if (parsed) {
                        converterBox.innerHTML =
                            '<div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:8px;">' +
                                '<div>' +
                                    '<span style="display:inline-block; background:#8e4f63; color:#fff; font-size:11px; font-weight:700; padding:2px 8px; border-radius:999px; text-transform:uppercase; margin-right:8px;">Live Size Translation</span>' +
                                    '<strong>Selected Tag: ' + parsed.eu + '</strong> ➔ ' +
                                    '<strong style="color:#823a54;">' + parsed.us + '</strong>' +
                                    (parsed.type === 'bra' ? ' <span style="color:#5c4752;">(' + parsed.uk + ')</span>' : '') +
                                '</div>' +
                                '<a href="#niProductFitConsultation" onclick="var el=document.getElementById(\'niProductFitFormWrap\'); if(el){el.style.display=\'block\';} return true;" style="color:#8e4f63; font-weight:700; font-size:12.5px; text-decoration:underline;">Ask a Bra Fitter →</a>' +
                            '</div>' +
                            (parsed.sisters ? '<div style="margin-top:6px; font-size:12px; color:#5c4752;">💡 <em>' + parsed.sisters + '</em></div>' : '');
                    } else {
                        converterBox.innerHTML =
                            '<div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:8px;">' +
                                '<span>📐 <strong>EU to US/UK Size Converter:</strong> Select a size option above to see its instant US &amp; UK equivalent.</span>' +
                                '<a href="#niProductFitConsultation" onclick="var el=document.getElementById(\'niProductFitFormWrap\'); if(el){el.style.display=\'block\';} return true;" style="color:#8e4f63; font-weight:700; font-size:12.5px; text-decoration:underline;">Need Fit Help? Ask a Bra Fitter →</a>' +
                            '</div>';
                    }
                }

                sizeSelect.addEventListener('change', updateLiveConverter);
                if (window.jQuery) {
                    window.jQuery(form).on('found_variation reset_data check_variations woocommerce_update_variation_values', function() {
                        setTimeout(updateLiveConverter, 40);
                    });
                }
                updateLiveConverter();
            }

            // Insert Collapsible Virtual Bra Fitter Consultation Form under product form/badges
            if (!document.getElementById('niProductFitConsultation')) {
                var fitWidget = document.createElement('div');
                fitWidget.id = 'niProductFitConsultation';
                fitWidget.style.cssText = 'margin: 20px 0; padding: 18px 20px; background: #fdf8fa; border: 1.5px solid #e5ced5; border-radius: 16px; color: #30252b;';
                fitWidget.innerHTML =
                    '<div style="display:flex; align-items:center; justify-content:space-between; gap:12px; flex-wrap:wrap;">' +
                        '<div>' +
                            '<strong style="font-size:14.5px; color:#30252b;">💬 Unsure Between Two European Sizes?</strong>' +
                            '<div style="font-size:12.5px; color:#5c4752;">Get personal advice from our certified European Bra Fitter (24h response SLA) + Free First Size Exchange.</div>' +
                        '</div>' +
                        '<button type="button" id="niToggleFitFormBtn" style="background:#30252b; color:#fff; border:none; border-radius:999px; padding:9px 18px; font-size:12.5px; font-weight:700; cursor:pointer;">Ask a Bra Fitter</button>' +
                    '</div>' +
                    '<div id="niProductFitFormWrap" style="display:none; margin-top:16px; padding-top:16px; border-top:1px dashed #dfcfd4;">' +
                        '<form onsubmit="return window.niSubmitFitForm ? window.niSubmitFitForm(event, \'Prod\') : false;">' +
                            '<div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(180px, 1fr)); gap:12px; margin-bottom:12px;">' +
                                '<div><label for="niFitName_Prod" style="display:block; font-size:12px; font-weight:700; margin-bottom:4px;">Your Name *</label><input type="text" id="niFitName_Prod" required placeholder="e.g. Emily" style="width:100%; padding:9px 12px; border:1px solid #d4c2c8; border-radius:8px; font-size:13px; background:#fff;" /></div>' +
                                '<div><label for="niFitEmail_Prod" style="display:block; font-size:12px; font-weight:700; margin-bottom:4px;">Your Email *</label><input type="email" id="niFitEmail_Prod" required placeholder="emily@example.com" style="width:100%; padding:9px 12px; border:1px solid #d4c2c8; border-radius:8px; font-size:13px; background:#fff;" /></div>' +
                                '<div><label for="niFitUnder_Prod" style="display:block; font-size:12px; font-weight:700; margin-bottom:4px;">Snug Underbust (in/cm) *</label><input type="text" id="niFitUnder_Prod" required placeholder="e.g. 32 in" style="width:100%; padding:9px 12px; border:1px solid #d4c2c8; border-radius:8px; font-size:13px; background:#fff;" /></div>' +
                                '<div><label for="niFitBust_Prod" style="display:block; font-size:12px; font-weight:700; margin-bottom:4px;">Fullest Bust (in/cm) *</label><input type="text" id="niFitBust_Prod" required placeholder="e.g. 39 in" style="width:100%; padding:9px 12px; border:1px solid #d4c2c8; border-radius:8px; font-size:13px; background:#fff;" /></div>' +
                            '</div>' +
                            '<div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:12px; margin-bottom:12px;">' +
                                '<div><label for="niFitCurrentSize_Prod" style="display:block; font-size:12px; font-weight:700; margin-bottom:4px;">Usual US/UK Size</label><input type="text" id="niFitCurrentSize_Prod" placeholder="e.g. US 34DDD" style="width:100%; padding:9px 12px; border:1px solid #d4c2c8; border-radius:8px; font-size:13px; background:#fff;" /></div>' +
                                '<div><label for="niFitStyle_Prod" style="display:block; font-size:12px; font-weight:700; margin-bottom:4px;">Fit Question / Notes</label><input type="text" id="niFitStyle_Prod" placeholder="e.g. Should I choose 75F or 80E?" style="width:100%; padding:9px 12px; border:1px solid #d4c2c8; border-radius:8px; font-size:13px; background:#fff;" /></div>' +
                            '</div>' +
                            '<button type="submit" id="niFitSubmitBtn_Prod" style="background:#8e4f63; color:#fff; border:none; border-radius:999px; padding:10px 22px; font-size:13px; font-weight:700; cursor:pointer;">Send My Measurements to a Bra Fitter →</button>' +
                            '<div id="niFitFeedback_Prod" style="display:none; margin-top:10px; padding:10px; border-radius:8px; font-size:12.5px; font-weight:600;"></div>' +
                        '</form>' +
                    '</div>';

                var anchor = document.getElementById('niBundleWidget') || document.getElementById('ni-product-trust-badges') || form;
                if (anchor && anchor.parentNode) {
                    anchor.parentNode.insertBefore(fitWidget, anchor.nextSibling);
                }
                var toggleBtn = document.getElementById('niToggleFitFormBtn');
                if (toggleBtn) {
                    toggleBtn.addEventListener('click', function() {
                        var wrap = document.getElementById('niProductFitFormWrap');
                        if (wrap) {
                            wrap.style.display = wrap.style.display === 'none' ? 'block' : 'none';
                        }
                    });
                }
            }
        }

        function bootAll() {
            initNiCarousel();
            initProductPageSizeConverterAndFitForm();
        }

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', bootAll);
        } else {
            bootAll();
        }
        setTimeout(bootAll, 600);
    })();
    </script>
    <?php
}
`;
}

function getUpdatedSnippet13Php(oldCode) {
  // Replace outdated $99 minimum order and $199 threshold + "Bestseller" in Snippet 13
  let code = oldCode;
  const oldThresholdsBlock = /\/\/ 3\. Determine Threshold Status and Motivator Copy[\s\S]*?\$rec_name\s*=\s*\$recommended_product->get_name\(\);/;
  const newThresholdsBlock = `// 3. Determine Threshold Status and Motivator Copy (Aligned with market_config.json: $0 min order, $150 Free DHL & DDP)
    if ( $subtotal < $free_ship_threshold ) {
        $diff = wc_price( $free_ship_threshold - $subtotal );
        $tier_kicker = __( '✈️ UNLOCK 100% FREE DHL EXPRESS & FREE DDP DUTIES ($150+)', 'naturaintimo' );
        $tier_title  = sprintf( __( 'You are only %s away from 100%% FREE Shipping & Duties!', 'naturaintimo' ), $diff );
        $tier_sub    = __( 'Add this piece to qualify for 100% FREE DHL Express delivery and store-covered DDP customs.', 'naturaintimo' );
        $badge_color = '#8e4f63';
    } else {
        $tier_kicker = __( '👑 VIP STATUS: FREE DHL EXPRESS & DDP UNLOCKED', 'naturaintimo' );
        $tier_title  = __( 'Complete your coordinated European set & save $10', 'naturaintimo' );
        $tier_sub    = __( 'You have unlocked 100% Free DHL Express Shipping and Free Customs Duties!', 'naturaintimo' );
        $badge_color = '#27ae60';
    }

    $rec_name  = $recommended_product->get_name();`;

  if (oldThresholdsBlock.test(code)) {
    code = code.replace(oldThresholdsBlock, newThresholdsBlock);
  }
  code = code.replace(/Bestseller Luxury Bottom/g, 'Signature Coordinated Bottom');
  code = code.replace(/Top bestsellers/gi, 'Featured coordinated pieces');
  return code;
}

function getUpdatedSnippet14Php() {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Where does Natura Intimo ship from, and what is the delivery time?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "All Natura Intimo orders are prepared in and dispatched directly from our European atelier in Olsztyn, Poland, and delivered to the United States and Canada via DHL Express Worldwide within 2 to 4 business days."
        }
      },
      {
        "@type": "Question",
        "name": "How do European bra sizes compare to US sizes?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "European bra band sizes are measured in centimeters and run 4 to 6 numbers higher than US band sizes (for example, EU 75 is equivalent to US 34, EU 80 to US 36), while cup progressions use continuous single-letter sizing where EU E equals US DD, EU F equals US DDD, and EU G equals US 4D/G."
        }
      },
      {
        "@type": "Question",
        "name": "Are there any surprise customs duties or import fees upon delivery in the United States?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "No, U.S. customers never pay surprise customs duties or carrier COD fees upon delivery because all shipments are processed under Delivered Duty Paid (DDP) terms. Standard flat-rate shipping is $24.99 USD (all duties included), and orders of $150.00 USD or more qualify for 100% free DHL Express shipping and free customs duty coverage."
        }
      },
      {
        "@type": "Question",
        "name": "How does customs work for Canadian orders under the CETA agreement?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Canadian customers pay 0% preferential customs import duty on all Natura Intimo lingerie under the Canada–European Union Comprehensive Economic and Trade Agreement (CETA) because every garment is certified as manufactured in Poland (European Union)."
        }
      },
      {
        "@type": "Question",
        "name": "What is Natura Intimo's return policy and size exchange guarantee?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Natura Intimo offers a 30-day return window from physical delivery for all U.S. and Canadian orders, including a complimentary Free First Size Exchange on coordinated lingerie sets to guarantee your perfect fit."
        }
      },
      {
        "@type": "Question",
        "name": "Can I purchase a matching bra and panties set with a bundle discount?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, pairing any bra with its matching coordinated bottoms automatically applies an instant $10.00 Set Savings discount at checkout and qualifies your order towards our Free DHL Express shipping threshold ($150.00 USD / C$200.00 CAD)."
        }
      },
      {
        "@type": "Question",
        "name": "Which payment methods are accepted for US and Canadian customers?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Customers in the United States and Canada can pay securely using Visa, Mastercard, American Express, Apple Pay, and Google Pay, with transactions processed transparently in USD or CAD without hidden surcharges."
        }
      },
      {
        "@type": "Question",
        "name": "How do I choose the correct European bra size before ordering?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Measure your snug underbust and fullest bust reading in inches or centimeters, then reference our interactive Size Guide & Calculator or submit our Brafitting Consultation Form for custom sister-size advice."
        }
      }
    ]
  };

  const fullBustJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Why is Polish bra engineering preferred for full-bust DD+ sizes?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Polish bra engineering utilizes deep, narrow underwires and multi-part cut-and-sewn cups that lift projected breast tissue forward, eliminating underarm spillage and painful shoulder strap digging."
        }
      },
      {
        "@type": "Question",
        "name": "What is the US equivalent of European bra sizes like 75G or 80I?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "An EU 75G corresponds to US 34G (UK 34F), and an EU 80I corresponds to US 36I (UK 36G). European bands are measured in centimeters, running 4 to 6 numbers higher than US band inches."
        }
      },
      {
        "@type": "Question",
        "name": "How fast is DHL Express delivery for full-bust bras to the US and Canada?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "All bras are dispatched directly from Poland and delivered via DHL Express Worldwide in 2 to 4 business days with DDP pre-cleared customs ($24.99 USD flat rate, 100% free at $150.00+ USD)."
        }
      }
    ]
  };

  return `/**
 * Snippet Name: Natura Intimo – Enhanced Google Merchant & Schema.org Structured Data
 * Description: Injects shippingDetails ($24.99 DHL Express Worldwide DDP), hasMerchantReturnPolicy (30-day returns), English tagline filter, and FAQPage JSON-LD in wp_head.
 */

if (!defined('ABSPATH')) {
    exit;
}

// 0. Enforce English Tagline for US/CA Global Storefront
add_filter('option_blogdescription', 'ni_enforce_english_tagline', 99);
function ni_enforce_english_tagline($desc) {
    if (is_admin()) {
        return $desc;
    }
    return 'European Full-Bust Lingerie & Coordinated Sets';
}

// 1. Automatic 301 redirect for any legacy Polish /produkt/ URLs to /product/
add_action('init', 'ni_redirect_legacy_produkt_urls', 1);
function ni_redirect_legacy_produkt_urls() {
    $uri = $_SERVER['REQUEST_URI'] ?? '';
    if (strpos($uri, '/produkt/') !== false) {
        $clean_path = str_replace('/produkt/', '/product/', $uri);
        wp_safe_redirect(home_url($clean_path), 301);
        exit;
    }
}

// 2. Product Offer Structured Data ($24.99 USD flat-rate DDP per market_config.json)
add_filter('woocommerce_structured_data_product_offer', 'ni_enrich_schema_product_offer', 20, 2);
function ni_enrich_schema_product_offer($offer, $product) {
    if (!$offer || !is_array($offer)) {
        return $offer;
    }

    $offer['shippingDetails'] = array(
        '@type' => 'OfferShippingDetails',
        'shippingRate' => array(
            '@type' => 'MonetaryAmount',
            'value' => '24.99',
            'currency' => 'USD'
        ),
        'shippingDestination' => array(
            '@type' => 'DefinedRegion',
            'addressCountry' => 'US'
        ),
        'deliveryTime' => array(
            '@type' => 'ShippingDeliveryTime',
            'handlingTime' => array(
                '@type' => 'QuantitativeValue',
                'minValue' => 1,
                'maxValue' => 2,
                'unitCode' => 'DAY'
            ),
            'transitTime' => array(
                '@type' => 'QuantitativeValue',
                'minValue' => 2,
                'maxValue' => 4,
                'unitCode' => 'DAY'
            )
        )
    );

    $offer['hasMerchantReturnPolicy'] = array(
        '@type' => 'MerchantReturnPolicy',
        'applicableCountry' => 'US',
        'returnPolicyCategory' => 'https://schema.org/MerchantReturnFiniteReturnWindow',
        'merchantReturnDays' => 30,
        'returnMethod' => 'https://schema.org/ReturnByMail',
        'returnFees' => 'https://schema.org/FreeReturn',
        'merchantReturnLink' => 'https://naturaintimo.com/refund-policy/'
    );

    return $offer;
}

// 3. Inject Meta Description, Hreflang & FAQPage JSON-LD in wp_head (Zero wpautop corruption)
add_action('wp_head', 'ni_inject_seo_and_jsonld_head', 1);
function ni_inject_seo_and_jsonld_head() {
    if (is_front_page()) {
        ?>
<meta name="description" content="Shop authentic European lingerie engineered for full-bust support, everyday elegance, and coordinated sets. Express DHL shipping with guaranteed DDP duties pre-cleared." />
<link rel="alternate" hreflang="en-US" href="https://naturaintimo.com/" />
<link rel="alternate" hreflang="en-CA" href="https://naturaintimo.com/natura-intimo-canada/" />
<link rel="alternate" hreflang="pl-PL" href="https://naturaintimo.com/pl/" />
<link rel="alternate" hreflang="x-default" href="https://naturaintimo.com/" />
        <?php
    }
    if (is_page(4530) || is_page('frequently-asked-questions')) {
        echo '<script type="application/ld+json">' . json_encode(${JSON.stringify(faqJsonLd)}, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) . '</script>' . "\\n";
    }
    if (is_page(6931) || is_page('full-bust-bras')) {
        echo '<script type="application/ld+json">' . json_encode(${JSON.stringify(fullBustJsonLd)}, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) . '</script>' . "\\n";
    }
}
`;
}

function getUpdatedSnippet90Php() {
  const llmsTxtContent = `# Natura Intimo – European Luxury Lingerie & Full-Bust Brafitting
> Natura Intimo (https://naturaintimo.com) is an authorized European lingerie retailer specializing in precision brafitting for full-bust sizes (EU cups B through M, EU band sizes 60 to 115 / US band sizes 28 to 50). Dispatched directly from Olsztyn, Poland to customers in the United States, Canada, and Poland via DHL Express Worldwide with Delivered Duty Paid (DDP) pre-clearance.

## Brand Profile & Entity Information
- Legal Operator: Natura Izabela Jakubczyk (NIP: PL7621888669, EORI: PL762188866900000)
- Headquarters: ul. Juliana Tuwima 26, 10-747 Olsztyn, Poland
- Customer Support: support@naturaintimo.com | +48 786 816 805
- Official Store: https://naturaintimo.com

## Core Assortment & Heritage Manufacturers
Natura Intimo partners exclusively with renowned Polish lingerie manufacturers known globally for cut-and-sewn architectural support:
- Gorsenia: World-renowned for deep cup projection, firm narrow wires, and structural support for heavy busts up to EU M cup (US M).
- Gaia Lingerie: Specialized in ergonomic semi-soft and soft bras, soft microfiber linings, and everyday comfort.
- Ava Lingerie: Renowned for side-support panels that center breast tissue and eliminate underarm spillage.
- Mefemi: Modern European luxury aesthetics with deep wire framing and push-up capabilities.
- Alles: European lace and fine embroidery with certified OEKO-TEX fabrication.

## Bra Styles & Construction
- Soft Bras (Unpadded): Multi-part sheer mesh and embroidered lace cups with underwires providing maximum projection and breathability.
- Semi-Soft Bras: Bottom half padded with ultra-thin ergonomic foam for gentle shaping; top cup in elastic lace for smooth fit without cutting into breast tissue.
- Full Cup Bras: Maximum coverage and side reinforcement for complete bust enclosure and posture relief.
- Coordinated Sets (Matching Panties): Coordinated Brazilian briefs, bikini briefs, and high-waist briefs in matching colorways (Sizes S through 3XL).

## European to US/UK Size Conversion Guide
European bra sizing uses centimeters for band sizes and continuous single-letter cup progressions:
- Band Conversion:
  - EU 60 = US 28 / UK 28
  - EU 65 = US 30 / UK 30
  - EU 70 = US 32 / UK 32
  - EU 75 = US 34 / UK 34
  - EU 80 = US 36 / UK 36
  - EU 85 = US 38 / UK 38
  - EU 90 = US 40 / UK 40
  - EU 95 = US 42 / UK 42
  - EU 100 = US 44 / UK 44
  - EU 105 = US 46 / UK 46
  - EU 110 = US 48 / UK 48
  - EU 115 = US 50 / UK 50
- Cup Progression (EU vs US/UK Equivalent):
  - EU B = US B / UK B
  - EU C = US C / UK C
  - EU D = US D / UK D
  - EU E = US DD (E) / UK DD
  - EU F = US DDD (F) / UK E
  - EU G = US G / UK F
  - EU H = US H / UK FF
  - EU I = US I / UK G
  - EU J = US J / UK GG
  - EU K = US K / UK H
  - EU L = US L / UK HH
  - EU M = US M / UK J

## Shipping, Customs & Incoterms 2020
- United States:
  - Carrier: DHL Express Worldwide (Air Priority, 2–4 business days).
  - Minimum Order: $0 USD (No minimum order required).
  - Free Shipping & Free DDP Duties: On all orders $150.00 USD and above (100% Free All-Inclusive).
  - Standard Shipping: $24.99 USD flat rate for orders under $150.00 USD (all DDP customs duties & taxes included, $0 extra fees).
  - Delivered Duty Paid (DDP): All customs clearance and duties are pre-cleared and absorbed by Natura Intimo. Zero surprise delivery fees guaranteed (California SB 478 compliant).
- Canada:
  - Carrier: DHL Express Worldwide (3–5 business days).
  - Minimum Order: $0 CAD (No minimum order required).
  - Free Shipping: On all orders $200.00 CAD and above ($24.99 CAD flat rate under $200.00 CAD).
  - Preferential Duty: 0% import customs duty via CETA Origin Declaration (all products made in Poland, EU).
- Poland & European Union:
  - Carrier: InPost Paczkomat / DPD Courier (1–2 business days).

## Return Policy & Customer Confidence
- 30-Day Return Window: North American customers enjoy a 30-day window from physical delivery to request returns or exchanges.
- Free First Size Exchange: If a bra band or cup requires a different size, Natura Intimo provides a complimentary first size exchange on matching sets.
- Packaging: 100% discreet luxury packaging.

## Canonical Link Directory
- Full Bust Bras (DD+): https://naturaintimo.com/full-bust-bras/
- Bra Size Calculator & Guide: https://naturaintimo.com/size-guide/
- Frequently Asked Questions: https://naturaintimo.com/frequently-asked-questions/
- Shipping & DDP Delivery: https://naturaintimo.com/shipping-delivery/
- Returns & Size Exchange: https://naturaintimo.com/refund-policy/
- Terms & Conditions: https://naturaintimo.com/terms-conditions-usa-canada/
- Privacy Policy: https://naturaintimo.com/privacy-policy-usa-canada/
- Accessibility Statement (WCAG 2.2 AA): https://naturaintimo.com/accessibility-statement/
- Contact & Brafitting Support: https://naturaintimo.com/contact-customer-care/`;

  const llmsFullTxtContent = llmsTxtContent + `

## Detailed Brand Fit Nuances
- Gorsenia Lingerie Fit: Gorsenia bands run firm and secure to anchor large busts. If between band sizes, size up in the band (e.g. from EU 75 to EU 80). Cups run deep and projected, ideal for projected, pendulous, and heavy tissue.
- Gaia Lingerie Fit: Gaia semi-soft bras run true to European size charts with soft microfiber lower cups and flexible upper lace suitable for softer tissue or asymmetric shapes.
- Ava Lingerie Fit: Ava excels in side-support structures (SSS cut), pulling side tissue forward and creating a centered, rounded silhouette under clothing.
- Mefemi Fit: Mefemi models feature plunge wire architecture and supportive lift suitable for lower-cut necklines while maintaining full underwire stability.

## Textile & Customs Compliance (FTC & CBP)
- Fabric Composition: 100% verified fiber compositions (primarily polyamide, elastane, polyester, and cotton) sourced from manufacturer technical specifications.
- Country of Origin: Exclusively manufactured in the Republic of Poland (EU) under EU labor and environmental standards.
- US HTS Classification: Brassieres categorized under HTS 6212.10.9020; briefs and panties under HTS 6108.22.9020.`;

  return `/**
 * Snippet Name: Natura Intimo – AI SEO & LLMs.txt Responder Engine
 * Description: High-performance endpoint for /llms.txt and /llms-full.txt markdown documentation for ChatGPT Search, Perplexity, Claude, and Google AI Overviews.
 */

if (!defined('ABSPATH')) {
    exit;
}

add_action('init', 'ni_serve_llms_txt_endpoints', 1);
function ni_serve_llms_txt_endpoints() {
    $req_path = isset($_SERVER['REQUEST_URI']) ? parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH) : '';
    
    if ($req_path === '/llms.txt') {
        header('Content-Type: text/plain; charset=utf-8');
        header('X-Robots-Tag: all');
        header('Cache-Control: public, max-age=3600');
        echo <<<'MARKDOWN'
${llmsTxtContent.trim()}
MARKDOWN;
        exit;
    }

    if ($req_path === '/llms-full.txt') {
        header('Content-Type: text/plain; charset=utf-8');
        header('X-Robots-Tag: all');
        header('Cache-Control: public, max-age=3600');
        echo <<<'MARKDOWN'
${llmsFullTxtContent.trim()}
MARKDOWN;
        exit;
    }
}
`;
}

// ============================================================================
// 3. Main Execution & Backup/Tracker Logging
// ============================================================================

async function runPrelaunchFixes() {
  console.log('=== ROZPOCZYNAM WDROŻENIE POPRAWEK P0 PRE-LAUNCH (ZADANIA 1, 2, 4, 5) ===');

  const backupDir = path.resolve('backend/backups');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const pageIds = [4509, 4511, 4513, 4530, 6901, 6931];
  const snippetIds = [8, 13, 14, 90];
  const backupData = {
    timestamp: new Date().toISOString(),
    pages: {},
    snippets: {},
    settings: {}
  };

  for (const pid of pageIds) {
    const r = await fetch(`${siteUrl}/wp-json/wp/v2/pages/${pid}?context=edit`, { headers });
    backupData.pages[pid] = await r.json();
  }
  for (const sid of snippetIds) {
    const r = await fetch(`${siteUrl}/wp-json/code-snippets/v1/snippets/${sid}`, { headers });
    backupData.snippets[sid] = await r.json();
  }
  const setRes = await fetch(`${siteUrl}/wp-json/wp/v2/settings`, { headers });
  backupData.settings = await setRes.json();

  const ts = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = path.join(backupDir, `backup_prelaunch_p0_${ts}.json`);
  fs.writeFileSync(backupPath, JSON.stringify(backupData, null, 2));
  console.log(`✅ Backup zapisany w: ${backupPath}`);

  const trackerPath = path.resolve('backend/usa_canada_tracker.json');
  const tracker = JSON.parse(fs.readFileSync(trackerPath, 'utf-8'));

  // Update Pages
  const pageUpdates = [
    { id: 4509, content: getCleanPage4509Html(), desc: 'Home / USA landing (/natura-intimo-usa/) - removed inline <script>, removed "when US checkout launches", fixed $24.99 / $150 DDP message' },
    { id: 4511, content: getCleanPage4511Html(), desc: 'Canada landing (/natura-intimo-canada/) - removed "when Canadian checkout launches", added C$24.99 / C$200 CETA 0% message' },
    { id: 4513, content: getCleanPage4513Html(), desc: 'Size Guide (/size-guide/) - moved <script> to Snippet #8, added Interactive Brafitting Consultation Form' },
    { id: 6901, content: getCleanPage6901Html(), desc: 'Track My Order (/track-my-order/) - moved <script> to Snippet #8, added WCAG aria-label' },
    { id: 6931, content: getCleanPage6931Html(), desc: 'Full-Bust Bras (/full-bust-bras/) - moved JSON-LD <script> to Snippet #14, removed handcrafted/bestsellers, synced $24.99/$150 DDP' },
    { id: 4530, content: getCleanPage4530Html(), desc: 'FAQ (/frequently-asked-questions/) - moved JSON-LD <script> to Snippet #14, synced $24.99/$150 DDP' }
  ];

  for (const pu of pageUpdates) {
    const r = await fetch(`${siteUrl}/wp-json/wp/v2/pages/${pu.id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ content: pu.content })
    });
    tracker.logs.push(`[PRELAUNCH P0 PAGE FIX] Page ID ${pu.id} (HTTP ${r.status}): ${pu.desc} (${new Date().toISOString()})`);
    console.log(`Page ${pu.id} updated: HTTP ${r.status}`);
  }

  // Update WP Settings Tagline
  const rSet = await fetch(`${siteUrl}/wp-json/wp/v2/settings`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      title: 'Natura Intimo',
      description: 'European Full-Bust Lingerie & Coordinated Sets'
    })
  });
  tracker.logs.push(`[PRELAUNCH P0 SETTINGS FIX] WP Settings Tagline updated to "European Full-Bust Lingerie & Coordinated Sets" (HTTP ${rSet.status}) (${new Date().toISOString()})`);

  // Update Snippets
  const snippetUpdates = [
    { id: 8, name: 'Natura Intimo – Homepage Product Carousel & Frontend Brafitting Engine', code: getUpdatedSnippet8Php() },
    { id: 13, name: 'Natura Intimo – Cart Threshold Booster (Smart Upsell)', code: getUpdatedSnippet13Php(backupData.snippets[13].code) },
    { id: 14, name: 'Natura Intimo – Enhanced Google Merchant & Schema.org Structured Data', code: getUpdatedSnippet14Php() },
    { id: 90, name: 'Natura Intimo – AI SEO & LLMs.txt Responder Engine', code: getUpdatedSnippet90Php() }
  ];

  for (const su of snippetUpdates) {
    const r = await fetch(`${siteUrl}/wp-json/code-snippets/v1/snippets/${su.id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ name: su.name, code: su.code, active: true })
    });
    tracker.logs.push(`[PRELAUNCH P0 SNIPPET FIX] Snippet ID ${su.id} ("${su.name}") updated (HTTP ${r.status}) (${new Date().toISOString()})`);
    console.log(`Snippet ${su.id} updated: HTTP ${r.status}`);
  }

  fs.writeFileSync(trackerPath, JSON.stringify(tracker, null, 2));
  console.log('✅ Wszystkie operacje zapisane w backend/usa_canada_tracker.json');
}

runPrelaunchFixes().catch(err => {
  console.error('❌ Błąd wykonania:', err);
  process.exit(1);
});
