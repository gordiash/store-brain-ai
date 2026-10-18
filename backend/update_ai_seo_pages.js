import dotenv from 'dotenv';
import fs from 'fs';
dotenv.config();

const wpUser = process.env.WP_ADMIN_USER;
const wpPass = process.env.WP_APP_PASSWORD;
if (!wpUser || !wpPass) {
  throw new Error('Brak poświadczeń WP_ADMIN_USER lub WP_APP_PASSWORD w .env');
}

const auth = Buffer.from(`${wpUser}:${wpPass}`).toString('base64');
const url = process.env.WOOCOMMERCE_URL || 'https://naturaintimo.com';
const headers = {
  'Authorization': 'Basic ' + auth,
  'Content-Type': 'application/json'
};

// 1. Treść dla strony FAQ (ID 4530)
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
        "text": "Yes, pairing any bra with its matching coordinated bottoms automatically applies an instant $10.00 Set Savings discount at checkout and qualifies your order towards our Free DHL Express shipping threshold ($150 USD)."
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
        "text": "Measure your snug underbust and fullest bust reading in inches or centimeters, then reference our interactive Size Guide & Calculator or email our brafitting specialists at support@naturaintimo.com for custom sister-size advice."
      }
    }
  ]
};

const faqContentHtml = `<style>
.entry-header, .ast-breadcrumbs-wrapper { display: none !important; }
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
}
</style>
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

// 2. Treść dla strony Full-Bust Bras (ID 6931)
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

async function updatePages() {
  console.log('--- Aktualizacja stron FAQ (#4530) oraz Full Bust (#6931) z Answer-First (JSON-LD via Snippet #14) ---');

  // 1. Aktualizacja FAQ (4530)
  console.log('Aktualizuję stronę FAQ (#4530)...');
  const resFaq = await fetch(`${url}/wp-json/wp/v2/pages/4530`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({
      content: faqContentHtml
    })
  });
  if (!resFaq.ok) {
    throw new Error(`Błąd aktualizacji FAQ: HTTP ${resFaq.status}`);
  }
  const dataFaq = await resFaq.json();
  console.log(`Sukces! Zaktualizowano stronę FAQ (#4530): "${dataFaq.title.rendered}"`);

  // 2. Aktualizacja Full Bust (6931)
  console.log('Pobieram stronę Full Bust (#6931) do semantycznego wzbogacenia...');
  const resGet6931 = await fetch(`${url}/wp-json/wp/v2/pages/6931`, { headers });
  const page6931 = await resGet6931.json();
  let content6931 = page6931.content.rendered || page6931.content.raw;

  // Wzbogacenie kart o format Answer-First
  content6931 = content6931.replace(
    /<h2>Why Polish Full-Bust Engineering\?<\/h2>[\s\S]*?<p>([\s\S]*?)<\/p>/,
    `<h2>Why Polish Full-Bust Engineering?</h2>
<p><strong>Polish lingerie ateliers like Gorsenia, Ava, and Gaia engineer deep, narrow-underwire cups that project heavy breast tissue forward rather than flattening it sideways.</strong> Unlike mass-market US molded t-shirt bras that compress the chest, European multi-part construction supports sizes DD through M with zero underarm chafing and complete ribcage anchoring.</p>`
  );

  content6931 = content6931.replace(
    /<h2>Multi-Part Supportive Construction<\/h2>[\s\S]*?<p>([\s\S]*?)<\/p>/,
    `<h2>Multi-Part Supportive Construction</h2>
<p><strong>Engineered with 3-piece and 4-piece cut-and-sewn cups, integrated side-support slings, and reinforced powernet mesh bands that bear 85% of breast weight.</strong> This architecture relieves delicate shoulder muscles, prevents strap slipping, and maintains structured, upright posture all day long.</p>`
  );

  content6931 = content6931.replace(
    /<h2>Finding Your Standard US Equivalent<\/h2>[\s\S]*?<p>([\s\S]*?)<\/p>/,
    `<h2>Finding Your Standard US Equivalent</h2>
<p><strong>European bra band sizes are calibrated in true centimeter measurements (EU 75 = US 34, EU 80 = US 36), while cup progressions use continuous single-letter sizing where EU E equals US DD, EU F equals US DDD, and EU G equals US 4D/G.</strong> Check our interactive <a href="/size-guide/">Size Guide & Converter</a> or email our certified fitters for instant translations.</p>`
  );

  // Dodanie dedykowanego FAQ Answer-First na dole strony Full Bust (JSON-LD wstrzykiwane w wp_head przez Snippet #14)
  const fbFaqSection = `
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
`;

  // Wstaw lub zaktualizuj sekcję przed kończącym </main>
  if (content6931.includes('Full-Bust Brafitting: Answer-First FAQ')) {
    content6931 = content6931.replace(/<section[^>]*>[\s\S]*?Full-Bust Brafitting: Answer-First FAQ[\s\S]*?<\/section>/, fbFaqSection.trim());
  } else if (content6931.includes('</main>')) {
    content6931 = content6931.replace('</main>', fbFaqSection + '\n</main>');
  } else {
    content6931 += fbFaqSection;
  }

  const resPut6931 = await fetch(`${url}/wp-json/wp/v2/pages/6931`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({
      content: content6931
    })
  });
  if (!resPut6931.ok) {
    throw new Error(`Błąd aktualizacji Full Bust: HTTP ${resPut6931.status}`);
  }
  const data6931 = await resPut6931.json();
  console.log(`Sukces! Zaktualizowano stronę Full Bust (#6931): "${data6931.title.rendered}"`);
}

updatePages().catch(console.error);
