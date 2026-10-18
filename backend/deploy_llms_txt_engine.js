import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
dotenv.config();

const wpUser = process.env.WP_ADMIN_USER;
const wpPass = process.env.WP_APP_PASSWORD;
if (!wpUser || !wpPass) {
  throw new Error('Brak poświadczeń WP_ADMIN_USER lub WP_APP_PASSWORD w .env');
}

const auth = Buffer.from(`${wpUser}:${wpPass}`).toString('base64');
const url = process.env.WOOCOMMERCE_URL || 'https://naturaintimo.com';

// Wczytanie Single Source of Truth (backend/market_config.json)
const configPath = fs.existsSync('market_config.json')
  ? 'market_config.json'
  : path.resolve('backend/market_config.json');
const mc = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

const us = mc.markets.US;
const ca = mc.markets.CA;
const pl = mc.markets.PL;
const seller = mc.seller;
const hts = mc.customsAndHts.componentHtsMapping;

const bandLines = Object.entries(mc.sizeConversionReference.bandEuToUsUk)
  .map(([eu, usBand]) => `  - EU ${eu} = US ${usBand} / UK ${usBand}`)
  .join('\n');

const cupLines = Object.entries(mc.sizeConversionReference.cupEuToUsAndUk)
  .map(([euCup, eq]) => `  - EU ${euCup} = US ${eq.us} | UK ${eq.uk}`)
  .join('\n');

export const llmsTxtContent = `# ${seller.brandName} – European Luxury Lingerie & Full-Bust Brafitting
> ${seller.brandName} (https://${seller.domain}) is an authorized European lingerie retailer specializing in precision brafitting for full-bust sizes (EU cups B through M, EU band sizes 60 to 115 / US band sizes 28 to 50). All orders are dispatched directly from ${seller.address.city}, ${seller.address.country} to customers in the United States, Canada, and Poland via ${us.carrier} under ${us.incoterms} (Delivered Duty Paid) terms with zero surprise fees at delivery.

## Brand Profile & Entity Information
- Legal Operator: ${seller.legalName} (NIP: PL${seller.taxIdNip}, EORI: PL${seller.taxIdNip}00000)
- Headquarters: ${seller.address.street}, ${seller.address.postalCode} ${seller.address.city}, ${seller.address.country} (${seller.countryCode})
- Customer Support: ${seller.contact.supportEmail} (Response SLA: within ${seller.contact.responseSlaHours} hours, ${seller.contact.businessHoursCet})
- Official Store: https://${seller.domain}

## Core Assortment & Verified Polish Manufacturers
${seller.brandName} sources exclusively from verified Polish lingerie manufacturers renowned globally for multi-part cut-and-sewn architectural support (Country of Origin: Poland / EU):
- Gorsenia: World-renowned for deep cup projection, firm narrow underwires, and structural support for heavy busts up to EU M cup (US M / UK J).
- Gaia: Specialized in ergonomic semi-soft and soft bras (including Gaia BS 1135 & GFB 1135), soft cotton/microfiber linings, and everyday comfort.
- Ava: Renowned for side-support panels (SSS construction) that center breast tissue and eliminate underarm spillage.
- Mefemi: Modern European luxury aesthetics with supportive wire framing, full-cup, and push-up constructions.
- Alles: European lace and fine microfiber craftsmanship manufactured in Poland.

## Bra Styles & Construction
- Soft Bras (Unpadded Underwire): Multi-part sheer mesh and embroidered lace cups with narrow underwires providing forward projection, lift, and breathability.
- Semi-Soft Bras: Lower cup lightly padded with thin ergonomic foam for gentle vertical support; upper cup in flexible lace that adapts to breast asymmetry without cutting in.
- Full Cup Bras: Maximum coverage and side reinforcement for complete bust enclosure and shoulder posture relief.
- Push-Up Bras: Supportive plunge framing with removable or integrated pads for contoured lift.
- Coordinated Panties & Briefs: Matching Brazilian briefs, bikini briefs, and maxi briefs (Sizes S through 3XL). Pairing any bra with its matching panties automatically unlocks a US$10.00 Set Savings bundle discount.

## European to US/UK Size Conversion Reference
European bra sizing uses centimeters for band sizes and continuous single-letter cup progressions:
- Band Size Conversion (EU cm to US/UK inches):
${bandLines}
- Cup Size Progression (EU vs US & UK Equivalent):
${cupLines}

## Shipping, Customs & Honest Pricing Policy (California SB 478 & Canadian Competition Act Compliant)
- United States (${us.currency} / ${us.displaySymbol}):
  - Carrier: ${us.carrier} (${us.incoterms} – Delivered Duty Paid).
  - Preparation Time: ${us.preparationDays.min}–${us.preparationDays.max} business days; Air Transit Time: ${us.transitBusinessDays.min}–${us.transitBusinessDays.max} business days.
  - Minimum Order Amount: ${us.displaySymbol}${us.minimumOrderAmount.toFixed(2)} ${us.currency} (No minimum order required).
  - Standard Flat-Rate Shipping: ${us.displaySymbol}${us.standardShippingCost.toFixed(2)} ${us.currency} for orders under ${us.displaySymbol}${us.freeShippingThreshold.toFixed(2)} ${us.currency}.
  - Free Express Shipping & Free Duties Threshold: 100% Free ${us.carrier} (${us.incoterms}) on all orders of ${us.displaySymbol}${us.freeShippingThreshold.toFixed(2)} ${us.currency} and above.
  - DDP Customs Processing Fee: ${us.displaySymbol}${us.ddpCustomsProcessingFee.toFixed(2)} ${us.currency}. ${us.pricingTransparencyRule}
- Canada (${ca.currency} / ${ca.displaySymbol}):
  - Carrier: ${ca.carrier} (${ca.incoterms}), supported locales: ${ca.locales.join(', ')}.
  - Preparation Time: ${ca.preparationDays.min}–${ca.preparationDays.max} business days; Air Transit Time: ${ca.transitBusinessDays.min}–${ca.transitBusinessDays.max} business days.
  - Minimum Order Amount: ${ca.displaySymbol}${ca.minimumOrderAmount.toFixed(2)} ${ca.currency}.
  - Standard Flat-Rate Shipping: ${ca.displaySymbol}${ca.standardShippingCost.toFixed(2)} ${ca.currency} for orders under ${ca.displaySymbol}${ca.freeShippingThreshold.toFixed(2)} ${ca.currency}.
  - Free Express Shipping Threshold: 100% Free ${ca.carrier} on all orders of ${ca.displaySymbol}${ca.freeShippingThreshold.toFixed(2)} ${ca.currency} and above.
  - Preferential CETA Duty: 0% customs import duty under the Canada–EU Comprehensive Economic and Trade Agreement (CETA Origin Declaration included on every Commercial Invoice as all garments are manufactured in Poland, EU).
- Poland (${pl.currency} / ${pl.displaySymbol}):
  - Domestic Delivery: InPost Paczkomat / DPD Courier (1–2 business days), standard VAT rate ${(pl.vatRateStandard * 100).toFixed(0)}%, ${pl.returnWindowDays}-day statutory return window.

## Return Policy & Fit Promise
- ${us.returnWindowDays}-Day Return Window (US & Canada): North American customers have ${us.returnWindowDays} days from physical delivery to request a return or exchange.
- Free First Size Exchange: Complimentary first size exchange (${us.freeFirstSizeExchange ? 'Enabled' : 'N/A'}) if your bra band or cup size needs adjustment.
- Discreet Luxury Packaging: Every order is hand-inspected and shipped in unmarked, discreet outer protective packaging.

## Canonical Link Directory
- Shop All Lingerie: https://${seller.domain}/shop/
- Full Bust Bras (DD–M Cup): https://${seller.domain}/full-bust-bras/
- Bras Category: https://${seller.domain}/product-category/bras/
- Panties & Briefs Category: https://${seller.domain}/product-category/panties/
- Coordinated Lingerie Sets: https://${seller.domain}/product-category/lingerie-sets/
- Interactive Bra Size Guide & Calculator: https://${seller.domain}/size-guide/
- Frequently Asked Questions (FAQ): https://${seller.domain}/frequently-asked-questions/
- Shipping & DDP Delivery Policy: https://${seller.domain}/shipping-delivery/
- Returns & 30-Day Size Exchange Policy: https://${seller.domain}/refund-policy/
- Terms & Conditions (US/CA): https://${seller.domain}/terms-and-conditions/
- Privacy Policy (GDPR, CCPA/GPC, PIPEDA, Law 25): https://${seller.domain}/privacy-policy/
- Accessibility Statement (ADA / WCAG 2.2 AA): https://${seller.domain}/accessibility-statement/
`;

export const llmsFullTxtContent = llmsTxtContent + `
## Detailed Brand Brafitting Nuances
- Gorsenia Fit Profile: Gorsenia bands run firm and supportive to anchor heavy breast tissue (85% of support comes from the band). If measuring between band sizes, consider sizing up in the band (e.g., EU 75 -> EU 80). Cups are deep and narrow-wired, engineered for projected full busts.
- Gaia Fit Profile: Gaia semi-soft and soft bras (such as BS 1135, Isla BS 1228, Keto BS 1134) run true to EU centimeter band sizing with soft cotton/microfiber inner lower cups and stretch lace upper cups that accommodate breast fullness variations.
- Ava Fit Profile: Ava Side-Support (SSS) and Maxi models (such as Ava 2110, 2111, 1396, 2271 Divine) feature an integrated lateral sling that draws tissue away from the underarms toward the center gore.
- Mefemi Fit Profile: Mefemi push-up and full-cup models (Petra, Anita, Ida) combine delicate European embroidery with contoured underwire lift.

## Customs & HTS Classification (US CBP & Canada CBSA Compliance)
- Country of Origin: PL (Republic of Poland, European Union).
- Set Splitting Rule: ${mc.customsAndHts.setSplittingRule}
- Component HTS Codes:
  - Synthetic Brassieres: HTS ${hts.bra_synthetic.htsUs} (HS6: ${hts.bra_synthetic.hs6}) — ${hts.bra_synthetic.description}
  - Cotton Brassieres: HTS ${hts.bra_cotton.htsUs} (HS6: ${hts.bra_cotton.hs6}) — ${hts.bra_cotton.description}
  - Synthetic Knitted Briefs/Panties: HTS ${hts.panty_synthetic_knit.htsUs} (HS6: ${hts.panty_synthetic_knit.hs6}) — ${hts.panty_synthetic_knit.description}
  - Cotton Knitted Briefs/Panties: HTS ${hts.panty_cotton_knit.htsUs} (HS6: ${hts.panty_cotton_knit.hs6}) — ${hts.panty_cotton_knit.description}
  - Synthetic Nightwear: HTS ${hts.nightwear_synthetic_knit.htsUs} (HS6: ${hts.nightwear_synthetic_knit.hs6}) — ${hts.nightwear_synthetic_knit.description}
`;

// Zapisz wygenerowane pliki lokalnie w backend/ dla pełnej dokumentacji i audytu
fs.writeFileSync(path.resolve( path.dirname(configPath), 'llms.txt'), llmsTxtContent.trim() + '\n', 'utf-8');
fs.writeFileSync(path.resolve(path.dirname(configPath), 'llms-full.txt'), llmsFullTxtContent.trim() + '\n', 'utf-8');

const snippetPhp = `/**
 * Snippet Name: Natura Intimo – AI SEO & LLMs.txt Responder Engine
 * Description: High-performance endpoint for /llms.txt and /llms-full.txt markdown documentation synced 100% with market_config.json for ChatGPT Search, Perplexity, Claude, and Google AI Overviews.
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

async function deploy() {
  console.log('--- Wdrażanie zsynchronizowanego z market_config.json silnika /llms.txt na naturaintimo.com ---');

  const listRes = await fetch(`${url}/wp-json/code-snippets/v1/snippets?per_page=100`, {
    headers: { Authorization: 'Basic ' + auth }
  });
  const snippets = await listRes.json();
  const existing = snippets.find(s => s.name && s.name.includes('LLMs.txt'));

  let endpoint = `${url}/wp-json/code-snippets/v1/snippets`;
  let method = 'POST';
  if (existing) {
    endpoint = `${url}/wp-json/code-snippets/v1/snippets/${existing.id}`;
    method = 'PUT';
    console.log(`Znaleziono istniejący snippet ID ${existing.id}, aktualizuję...`);
  }

  const res = await fetch(endpoint, {
    method,
    headers: {
      'Authorization': 'Basic ' + auth,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: 'Natura Intimo – AI SEO & LLMs.txt Responder Engine',
      code: snippetPhp,
      active: true
    })
  });

  if (!res.ok) {
    throw new Error(`Błąd wdrożenia snippetu LLMs.txt: HTTP ${res.status}`);
  }

  const data = await res.json();
  console.log(`✅ Sukces! Snippet ID ${data.id} wdrożony (HTTP ${res.status}) i aktywny: ${data.active}`);

  // Wyczyść cache LiteSpeed aby nowe wartości ($24.99 / $150) były natychmiast widoczne
  await fetch(`${url}/?purge_cache=1`).catch(() => {});

  const testRes = await fetch(`${url}/llms.txt?t=${Date.now()}`, {
    headers: { 'User-Agent': 'ChatGPT-User/1.0' }
  });
  const text = await testRes.text();
  console.log(`Status HTTP: ${testRes.status}, Bajtów: ${text.length}`);
  console.log('Weryfikacja kluczowych parametrów z market_config.json w /llms.txt:');
  console.log('- Zawiera US$24.99:', text.includes('US$24.99'));
  console.log('- Zawiera US$150.00:', text.includes('US$150.00'));
  console.log('- Zawiera C$200.00:', text.includes('C$200.00'));
  console.log('- Brak starego $19.99 / $199:', !text.includes('19.99') && !text.includes('$199'));
}

deploy().catch(console.error);
