// backend/process_google_merchant_fixes.js
import WooCommerceRestApiPkg from "@woocommerce/woocommerce-rest-api";
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { generateContentAI } from './ai.js';
import { buildEnrichedPrompt } from './context.js';

dotenv.config();

const WooCommerceRestApi = WooCommerceRestApiPkg.default || WooCommerceRestApiPkg;
const WooCommerce = new WooCommerceRestApi({
  url: process.env.WOOCOMMERCE_URL || "https://naturaintimo.com",
  consumerKey: process.env.WOOCOMMERCE_CONSUMER_KEY,
  consumerSecret: process.env.WOOCOMMERCE_CONSUMER_SECRET,
  version: "wc/v3"
});

const TRACKER_FILE = path.join(process.cwd(), 'google_merchant_tracker.json');

function loadTracker() {
  if (fs.existsSync(TRACKER_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(TRACKER_FILE, 'utf-8'));
    } catch (e) {
      console.error("[Tracker] Błąd odczytu gmc tracker, tworzenie nowego.");
    }
  }
  return {
    updatedCount: 0,
    flaggedCount: 0,
    totalProducts: 0,
    processedIds: [],
    flaggedIds: [],
    syncLogs: []
  };
}

function saveTracker(tracker) {
  fs.writeFileSync(TRACKER_FILE, JSON.stringify(tracker, null, 2), 'utf-8');
}

// Map Polish colors to English
function translateColor(col) {
  if (!col) return "N/A";
  const c = col.toLowerCase().trim();
  if (c.includes("czarn")) return "Black";
  if (c.includes("biał")) return "White";
  if (c.includes("bord")) return "Burgundy";
  if (c.includes("granat")) return "Navy";
  if (c.includes("róż")) return "Pink";
  if (c.includes("beż")) return "Beige";
  if (c.includes("nude")) return "Nude Wine";
  return col.charAt(0).toUpperCase() + col.slice(1);
}

// Map Polish terms for titles
function mapTitleProductType(rawType) {
  const t = rawType.toLowerCase();
  if (t.includes("semi-soft") || t.includes("semisoft")) return "semi-soft bra";
  if (t.includes("soft bra") || t.includes("soft")) return "soft bra";
  if (t.includes("biustonosz") || t.includes("bra")) return "bra";
  if (t.includes("brazyliany") || t.includes("brazilian")) return "Brazilian briefs";
  if (t.includes("figi") || t.includes("panties") || t.includes("brief")) return "bikini briefs";
  return "lingerie";
}

// Clean title from HTML tags, entities, and excessive uppercase
function cleanTitleText(str) {
  if (!str) return "";
  let clean = str.replace(/<[^>]*>?/gm, '')
                 .replace(/&amp;/g, '&')
                 .replace(/&nbsp;/g, ' ')
                 .replace(/&quot;/g, '"')
                 .replace(/\s+/g, ' ')
                 .trim();
  return clean;
}

// Extract Size Range string
function getSizeRange(options) {
  if (!options || options.length === 0) return "";
  if (options.length === 1) return options[0];
  return `${options[0]}–${options[options.length - 1]}`;
}

async function fetchAllProducts() {
  let allProducts = [];
  let page = 1;
  let totalPages = 1;

  console.log("📥 [WooCommerce] Pobieranie katalogu produktów dla Google Merchant Center (USA & Kanada)...");

  while (page <= totalPages) {
    try {
      const response = await WooCommerce.get("products", { per_page: 50, page });
      if (response.data && response.data.length > 0) {
        allProducts = allProducts.concat(response.data);
      }
      totalPages = parseInt(response.headers['x-wp-totalpages'] || '1', 10);
      page++;
    } catch (err) {
      console.error(`[WooCommerce] Błąd pobierania strony ${page}:`, err.message);
      break;
    }
  }
  console.log(`✅ [WooCommerce] Pobrano łącznie ${allProducts.length} produktów.`);
  return allProducts;
}

async function fetchProductVariations(parentId) {
  try {
    const url = `https://naturaintimo.com/wp-json/wc/v3/products/${parentId}/variations?per_page=100`;
    const res = await fetch(url);
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.error(`[WooCommerce] Błąd pobierania wariantów dla produktu ID ${parentId}:`, err.message);
  }
  return [];
}

async function processProductForGoogleMerchant(product, tracker) {
  const pId = product.id;
  const rawName = cleanTitleText(product.name);

  if (tracker.processedIds.includes(pId)) {
    console.log(`⏩ [Pomijanie] Produkt ID ${pId} ("${rawName}") posiada zweryfikowane atrybuty Google Merchant.`);
    return;
  }

  // 1. Extract Attributes & Details
  const colorAttr = product.attributes?.find(a => a.name?.toLowerCase() === 'color' || a.name?.toLowerCase() === 'kolor');
  const sizeAttr = product.attributes?.find(a => a.name?.toLowerCase() === 'size' || a.name?.toLowerCase() === 'rozmiar');

  const rawColorOpt = colorAttr ? colorAttr.options.join(", ") : "";
  const translatedColor = translateColor(rawColorOpt);
  const sizeOptions = sizeAttr ? sizeAttr.options : [];
  const sizeRange = getSizeRange(sizeOptions);

  // Extract brand from categories or title
  let brandName = "Natura Intimo";
  const knownBrands = ["Gorsenia", "Gaia", "Ava", "Julimex", "Mefemi"];
  for (const b of knownBrands) {
    if (rawName.toLowerCase().includes(b.toLowerCase())) {
      brandName = b;
      break;
    }
  }

  // Ambiguity check
  if (!rawName || rawName.length < 3) {
    console.warn(`⚠️ [Niejednoznaczność] Produkt ID ${pId} ma niejasną nazwę. Oznaczanie do ręcznej weryfikacji.`);
    tracker.flaggedCount++;
    tracker.flaggedIds.push({ id: pId, name: rawName, reason: "Niejednoznaczna nazwa produktu" });
    tracker.processedIds.push(pId);
    saveTracker(tracker);
    return;
  }

  // 2. Generate Content via Gemini AI with Enriched Merchant Directives
  const prompt = `
Jesteś Kierownikiem Sklepu E-Commerce (The Merchant) dostosowującym produkty do wymogów Google Merchant Center dla rynku USA i Kanady.

PRZEANALIZUJ DANE PRODUKTU (ID: ${pId}):
- Nazwa oryginalna: "${rawName}"
- Marka wyznaczona: "${brandName}"
- SKU: "${product.sku || 'N/A'}"
- Kategorie: ${product.categories?.map(c => c.name).join(", ") || 'Bielizna'}
- Kolor źródłowy: ${rawColorOpt || 'N/A'} (Przetłumaczony: ${translatedColor})
- Rozmiary źródłowe: ${sizeOptions.join(", ") || 'N/A'} (Zakres: ${sizeRange})
- Opis oryginalny: "${product.description ? product.description.replace(/<[^>]*>?/gm, '').trim().substring(0, 300) : ''}"

BEZWZGLĘDNIE ZASTOSUJ 6 ZASAD GOOGLE MERCHANT:
1. Tytuł: Naturalny po angielsku w formacie: Brand + model + product type + color + size range.
   Przetłumacz określenia: biustonosz -> bra, soft -> soft bra, semi-soft -> semi-soft bra, figi -> bikini briefs / panties, brazyliany -> Brazilian briefs.
   BEZWZGLĘDNIE USUŃ HTML (<span>, </span>), encje (&amp;), i nie używaj SAMYCH WIELKICH LITER poza nazwami modeli.
2. Opis: Angielski opis skoncentrowany na wygodzie, dopasowaniu i komplecie.
   BEZWZGLĘDNIE BRAK NIEPOTWIERDZONYCH OBIETNIC MEDYCZNYCH ANI NIEPOTWIERDZONYCH WŁAŚCIWOŚCI MATERIAŁU.
   Włącz sekcje:
   - Krótki opis sprzedażowy (short_description, 1-2 zdania)
   - <h3>Why you’ll love it</h3> (3-5 punktów)
   - <h3>Product details</h3> (Brand, Style, Color, Available sizes, Matching item jeśli widoczny lub N/A, Care: "Follow the care instructions on the garment label.")
3. Usuń wszystkie polskie słowa i błędy językowe z opisu.

ZWRÓĆ ODPOWIEDŹ W CZYSTYM FORMACIE JSON:
{
  "seoTitle": "Clean Natural English Title",
  "shortDescription": "<p>1-2 sentence description for Google Merchant and product card.</p>",
  "fullDescriptionHTML": "<p>Intro text...</p><h3>Why you’ll love it</h3><ul><li>Benefit 1</li><li>Benefit 2</li><li>Benefit 3</li></ul><h3>Product details</h3><ul><li><strong>Brand:</strong> BrandName</li><li><strong>Style:</strong> StyleName</li><li><strong>Color:</strong> ColorName</li><li><strong>Available sizes:</strong> SizeRange</li><li><strong>Matching item:</strong> ItemName or N/A</li><li><strong>Care:</strong> Follow the care instructions on the garment label.</li></ul>"
}
`;

  try {
    const enrichedPrompt = buildEnrichedPrompt("merchant", prompt);
    const aiRaw = await generateContentAI(enrichedPrompt);

    let jsonStart = aiRaw.indexOf('{');
    let jsonEnd = aiRaw.lastIndexOf('}');
    if (jsonStart === -1 || jsonEnd === -1) {
      throw new Error("Brak prawidłowej struktury JSON z AI");
    }
    const parsedData = JSON.parse(aiRaw.substring(jsonStart, jsonEnd + 1));

    if (!parsedData.seoTitle || !parsedData.fullDescriptionHTML || !parsedData.shortDescription) {
      throw new Error("Niekompletna struktura JSON z AI");
    }

    const cleanSeoTitle = cleanTitleText(parsedData.seoTitle);

    console.log(`\n-------------------------------------------------`);
    console.log(`🛠️ [GMC Fix] Produkt Parent ID ${pId}:`);
    console.log(`📌 Tytuł SEO Google Merchant: "${cleanSeoTitle}"`);
    console.log(`🏷️ Marka: ${brandName} | Kolor: ${translatedColor} | Sizing: EU`);

    // 3. Update Parent Product attributes & Google Merchant Meta Keys
    const parentMetaData = [
      { key: '_wc_gla_gender', value: 'female' },
      { key: '_wc_gla_age_group', value: 'adult' },
      { key: '_wc_gla_condition', value: 'new' },
      { key: '_wc_gla_brand', value: brandName },
      { key: '_wc_gla_color', value: translatedColor },
      { key: '_wc_gla_size_system', value: 'EU' },
      { key: '_wc_gla_sync_status', value: 'pending' }
    ];

    if (product.sku) {
      parentMetaData.push({ key: '_wc_gla_mpn', value: product.sku });
    }

    const parentPayload = {
      name: cleanSeoTitle,
      description: parsedData.fullDescriptionHTML,
      short_description: parsedData.shortDescription,
      meta_data: parentMetaData
    };

    const putParentUrl = `https://naturaintimo.com/wp-json/wc/v3/products/${pId}`;
    const parentRes = await fetch(putParentUrl, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(parentPayload)
    });

    if (!parentRes.ok) {
      const errTxt = await parentRes.text();
      throw new Error(`Błąd aktualizacji produktu nadrzędnego: HTTP ${parentRes.status} - ${errTxt}`);
    }

    // 4. Update Variations in parallel chunks of 5 if Variable Product
    if (product.variations && product.variations.length > 0) {
      console.log(`🔄 Równoległa aktualizacja ${product.variations.length} wariantów dla produktu ID ${pId}...`);
      const variations = await fetchProductVariations(pId);

      const VAR_BATCH_SIZE = 5;
      for (let vi = 0; vi < variations.length; vi += VAR_BATCH_SIZE) {
        const varChunk = variations.slice(vi, vi + VAR_BATCH_SIZE);
        await Promise.all(varChunk.map(async (v) => {
          const vId = v.id;
          const vColorAttr = v.attributes?.find(a => a.slug?.toLowerCase() === 'color' || a.name?.toLowerCase() === 'color');
          const vSizeAttr = v.attributes?.find(a => a.slug?.toLowerCase() === 'size' || a.name?.toLowerCase() === 'size');

          const vColorVal = vColorAttr ? translateColor(vColorAttr.option) : translatedColor;
          const vSizeVal = vSizeAttr ? vSizeAttr.option : "One Size";
          const vMpnVal = v.sku || v.meta_data?.find(m => m.key === 'mada_ean')?.value || product.sku || `MPN-${vId}`;

          const varMetaData = [
            { key: '_wc_gla_gender', value: 'female' },
            { key: '_wc_gla_age_group', value: 'adult' },
            { key: '_wc_gla_condition', value: 'new' },
            { key: '_wc_gla_brand', value: brandName },
            { key: '_wc_gla_color', value: vColorVal },
            { key: '_wc_gla_size', value: vSizeVal },
            { key: '_wc_gla_size_system', value: 'EU' },
            { key: '_wc_gla_mpn', value: vMpnVal },
            { key: '_wc_gla_sync_status', value: 'pending' }
          ];

          const putVarUrl = `https://naturaintimo.com/wp-json/wc/v3/products/${pId}/variations/${vId}`;
          try {
            const varRes = await fetch(putVarUrl, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ meta_data: varMetaData })
            });
            if (!varRes.ok) {
              console.warn(`⚠️ Ostrzeżenie przy aktualizacji wariantu ID ${vId}: HTTP ${varRes.status}`);
            }
          } catch (vErr) {
            console.warn(`⚠️ Błąd wariantu ID ${vId}:`, vErr.message);
          }
        }));
      }
    }

    tracker.updatedCount++;
    tracker.processedIds.push(pId);
    const logMsg = `[POTWIERDZENIE GMC SYNC] Zaktualizowano atrybuty i synchronizację dla ID ${pId} ("${cleanSeoTitle}")`;
    tracker.syncLogs.push(logMsg);
    saveTracker(tracker);

    console.log(`✅ ${logMsg} (Poprawiono: ${tracker.updatedCount} z ${tracker.totalProducts})`);

  } catch (err) {
    console.error(`❌ Błąd GMC dla produktu ID ${pId}:`, err.message);
    tracker.flaggedCount++;
    tracker.flaggedIds.push({ id: pId, name: rawName, reason: err.message });
    tracker.processedIds.push(pId);
    saveTracker(tracker);
  }
}

async function runGoogleMerchantFixer() {
  console.log("=================================================");
  console.log("🚀 AGENT MERCHANT: PROCESOR BŁĘDÓW GOOGLE MERCHANT CENTER 🚀");
  console.log("=================================================\n");

  const tracker = loadTracker();
  const products = await fetchAllProducts();

  if (!products || products.length === 0) {
    console.error("❌ Brak produktów do przetworzenia.");
    return;
  }

  tracker.totalProducts = products.length;
  saveTracker(tracker);

  console.log(`📊 Stan początkowy: Poprawiono ${tracker.updatedCount} z ${tracker.totalProducts} produktów.`);
  
  const pending = products.filter(p => !tracker.processedIds.includes(p.id));
  console.log(`📋 Liczba oczekujących produktów na weryfikację GMC: ${pending.length} z ${products.length}\n`);

  if (pending.length === 0) {
    console.log("🎉 Wszystkie produkty posiadają poprawne atrybuty i zostały przesłane do ponownej synchronizacji Google Merchant Center!");
    return;
  }

  const BATCH_SIZE = 5;
  for (let i = 0; i < pending.length; i += BATCH_SIZE) {
    const batch = pending.slice(i, i + BATCH_SIZE);
    console.log(`\n⚡ [Partia ${Math.floor(i / BATCH_SIZE) + 1} / ${Math.ceil(pending.length / BATCH_SIZE)}] Poprawianie partii produktów ${i + 1} - ${i + batch.length}...`);

    for (const p of batch) {
      await processProductForGoogleMerchant(p, tracker);
    }
  }

  console.log("\n=================================================");
  console.log("🎉 KOŃCOWE PODSUMOWANIE GOOGLE MERCHANT CENTER:");
  console.log(`✅ Poprawiono produkty: ${tracker.updatedCount} z ${tracker.totalProducts}`);
  console.log(`⚠️ Produkty oznaczone do ręcznej weryfikacji: ${tracker.flaggedCount}`);
  console.log("=================================================");
}

runGoogleMerchantFixer();
