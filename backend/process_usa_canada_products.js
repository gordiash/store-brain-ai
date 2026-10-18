// backend/process_usa_canada_products.js
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

const TRACKER_FILE = path.join(process.cwd(), 'usa_canada_tracker.json');

// Helper to load or initialize tracker state
function loadTracker() {
  if (fs.existsSync(TRACKER_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(TRACKER_FILE, 'utf-8'));
    } catch (e) {
      console.error("[Tracker] Błąd odczytu pliku śledzenia, tworzenie nowego.");
    }
  }
  return {
    updatedCount: 0,
    flaggedCount: 0,
    processedIds: [],
    flaggedIds: [],
    logs: []
  };
}

function saveTracker(tracker) {
  fs.writeFileSync(TRACKER_FILE, JSON.stringify(tracker, null, 2), 'utf-8');
}

// Translate Polish colors & product type terms explicitly
function translateTerms(text) {
  if (!text) return "";
  let res = text;
  const map = [
    { pl: /figi/gi, en: "bikini briefs" },
    { pl: /majtki/gi, en: "briefs" },
    { pl: /biustonosz/gi, en: "bra" },
    { pl: /stanik/gi, en: "bra" },
    { pl: /czarny|czarne|czarna/gi, en: "black" },
    { pl: /biały|białe|biała/gi, en: "white" },
    { pl: /bordowy|bordowe|bordowa/gi, en: "burgundy" },
    { pl: /granatowy|granatowe|granatowa/gi, en: "navy" },
    { pl: /różowy|różowe|różowa/gi, en: "pink" },
    { pl: /beżowy|beżowe|beżowa/gi, en: "beige" }
  ];
  for (const m of map) {
    res = res.replace(m.pl, m.en);
  }
  return res;
}

// Format size range string from options array
function formatSizeRange(sizes) {
  if (!sizes || sizes.length === 0) return "";
  if (sizes.length === 1) return sizes[0];
  return `${sizes[0]}–${sizes[sizes.length - 1]}`;
}

async function fetchAllProducts() {
  let allProducts = [];
  let page = 1;
  let totalPages = 1;

  console.log("📥 [WooCommerce] Pobieranie pełnego katalogu produktów dla rynku USA/Kanada...");

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

async function processProductForUSACanada(product, tracker) {
  const pId = product.id;
  const rawName = product.name;

  if (tracker.processedIds.includes(pId)) {
    console.log(`⏩ [Pomijanie] Produkt ID ${pId} ("${rawName}") został już wcześniej zaktualizowany.`);
    return;
  }

  // 1. Extract attributes
  const colorAttr = product.attributes?.find(a => a.name?.toLowerCase() === 'color' || a.name?.toLowerCase() === 'kolor');
  const sizeAttr = product.attributes?.find(a => a.name?.toLowerCase() === 'size' || a.name?.toLowerCase() === 'rozmiar');

  const colorOptions = colorAttr ? colorAttr.options.join(", ") : "";
  const sizeOptions = sizeAttr ? sizeAttr.options : [];
  const sizeRange = formatSizeRange(sizeOptions);

  // Check if data is ambiguous
  if (!rawName || rawName.trim().length < 3) {
    console.warn(`⚠️ [Niejednoznaczność] Produkt ID ${pId} ma niejednoznaczną nazwę. Oznaczanie do ręcznej weryfikacji.`);
    tracker.flaggedCount++;
    tracker.flaggedIds.push({ id: pId, name: rawName, reason: "Niejednoznaczna nazwa produktu" });
    tracker.processedIds.push(pId);
    saveTracker(tracker);
    return;
  }

  // 2. Generate Prompt for Merchant Agent with 12 Strict Directives
  const prompt = `
Jesteś Kierownikiem Sklepu E-Commerce (The Merchant) optymalizującym kartę produktu dla rynku USA i Kanady w sklepie Natura Intimo.

PRZEANALIZUJ DANE ŹRÓDŁOWE PRODUKTU (ID: ${pId}):
- Nazwa oryginalna: "${rawName}"
- SKU: "${product.sku || 'N/A'}"
- Kategorie: ${product.categories?.map(c => c.name).join(", ") || 'Bielizna'}
- Kolory źródłowe: ${colorOptions || 'N/A'}
- Rozmiary źródłowe: ${sizeOptions.join(", ") || 'N/A'} (Zakres: ${sizeRange})
- Opis oryginalny: "${product.description ? product.description.replace(/<[^>]*>?/gm, '').trim().substring(0, 300) : ''}"

BEZWZGLĘDNIE PRZESTRZEGAJ 12 ZASAD OPTYMALIZACJI USA/KANADA:
1. Przeanalizuj markę, model, typ produktu, kolor i rozmiary. NIE DOPISUJ CECH, których nie ma w danych źródłowych.
2. Utwórz naturalny angielski tytuł SEO w formacie: Brand + model + product type + color + size range.
   Przetłumacz pojęcia: figi -> bikini briefs / panties, biustonosz -> bra, czarny -> black, biały -> white, bordowy -> burgundy, granatowy -> navy, różowy -> pink, beżowy -> beige / nude.
3. Napisz opis skoncentrowany na klientce: komfort noszenia, dopasowanie i krój, sytuacje użycia, wygląd i pewność siebie, możliwość stworzenia kompletu.
4. UŻYWAJ WYŁĄCZNIE OSTROŻNYCH, WIARYGODNYCH SFORMUŁOWAŃ. BEZWZGLĘDNIE NIE TWORZ OBIETNIC MEDYCZNYCH ANI NIEPOTWIERDZONYCH WŁAŚCIWOŚCI, takich jak „gwarantuje idealne dopasowanie”, „modeluje ciało” czy „zapobiega podrażnieniom”.
5. Dodaj sekcję "Why you'll love it" z 3-5 punktowymi korzyściami.
6. Dodaj sekcję "Product details" z polami: Brand, Style, Color, Available sizes, Matching item (jeśli widoczny w danych lub N/A), Care: "Follow the care instructions on the garment label."
7. Przygotuj krótki opis (1-2 zdania) dla karty produktu i Google Merchant.

ZWRÓĆ ODPOWIEDŹ WYŁĄCZNIE W CZYSTYM FORMACIE JSON (BEZ BLOKÓW MARKDOWN) WG SCHEMATU:
{
  "seoTitle": "English SEO Title",
  "shortDescription": "1-2 sentence Google Merchant description in HTML <p>",
  "fullDescriptionHTML": "<p>Customer-focused introduction text...</p><h3>Why you'll love it</h3><ul><li>Benefit 1</li><li>Benefit 2</li><li>Benefit 3</li></ul><h3>Product details</h3><ul><li><strong>Brand:</strong> BrandName</li><li><strong>Style:</strong> StyleName</li><li><strong>Color:</strong> ColorName</li><li><strong>Available sizes:</strong> SizesRange</li><li><strong>Matching item:</strong> ItemName or N/A</li><li><strong>Care:</strong> Follow the care instructions on the garment label.</li></ul>"
}
`;

  try {
    const enrichedPrompt = buildEnrichedPrompt("merchant", prompt);
    const aiRaw = await generateContentAI(enrichedPrompt);
    
    // Parse JSON from AI response robustly
    let jsonStart = aiRaw.indexOf('{');
    let jsonEnd = aiRaw.lastIndexOf('}');
    if (jsonStart === -1 || jsonEnd === -1) {
      throw new Error("Brak prawidłowej struktury JSON w odpowiedzi AI");
    }
    let cleanJsonStr = aiRaw.substring(jsonStart, jsonEnd + 1);
    const parsedData = JSON.parse(cleanJsonStr);

    if (!parsedData.seoTitle || !parsedData.fullDescriptionHTML || !parsedData.shortDescription) {
      throw new Error("Niekompletna odpowiedź AI JSON");
    }

    console.log(`\n-------------------------------------------------`);
    console.log(`🛠️ [USA/CAN Opt] Produkt ID ${pId}:`);
    console.log(`📌 Nowy Tytuł SEO: "${parsedData.seoTitle}"`);
    console.log(`📝 Krótki Opis Google Merchant: "${parsedData.shortDescription.replace(/<[^>]*>?/gm, '').trim()}"`);

    // 3. Update WooCommerce via REST API using direct fetch (preserving price, stock, images, SKU, variations)
    const updatePayload = {
      name: parsedData.seoTitle,
      description: parsedData.fullDescriptionHTML,
      short_description: parsedData.shortDescription
    };

    const putUrl = `https://naturaintimo.com/wp-json/wc/v3/products/${pId}`;
    const response = await fetch(putUrl, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatePayload)
    });

    if (response.ok) {
      const updateRes = await response.json();
      tracker.updatedCount++;
      tracker.processedIds.push(pId);
      const logEntry = `[POTWIERDZENIE WOOCOMMERCE] Zaktualizowano produkt ID ${pId} ("${updateRes.name || parsedData.seoTitle}")`;
      tracker.logs.push(logEntry);
      saveTracker(tracker);
      console.log(`✅ ${logEntry} (Suma zaktualizowanych: ${tracker.updatedCount})`);
    } else {
      const errText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errText}`);
    }

  } catch (err) {
    const errorDetails = err.response?.data ? JSON.stringify(err.response.data) : err.message;
    console.error(`❌ Błąd aktualizacji WooCommerce dla ID ${pId}:`, errorDetails);
    tracker.flaggedCount++;
    tracker.flaggedIds.push({ id: pId, name: rawName, reason: errorDetails });
    tracker.processedIds.push(pId);
    saveTracker(tracker);
  }
}

async function runBatchProcessor() {
  console.log("=================================================");
  console.log("🚀 AGENT MERCHANT: PROCESOR OPISÓW WOOCOMMERCE USA/KANADA 🚀");
  console.log("=================================================\n");

  const tracker = loadTracker();
  console.log(`📊 Stan początkowy: Zaktualizowano ${tracker.updatedCount} unikalnych produktów, Oznaczono do weryfikacji: ${tracker.flaggedCount}`);

  const products = await fetchAllProducts();
  if (!products || products.length === 0) {
    console.error("❌ Brak produktów do przetworzenia.");
    return;
  }

  // Filter products that are not yet processed
  const pendingProducts = products.filter(p => !tracker.processedIds.includes(p.id));
  console.log(`📋 Liczba produktów oczekujących na optymalizację: ${pendingProducts.length} z ${products.length}\n`);

  if (pendingProducts.length === 0) {
    console.log("🎉 Wszystkie produkty zostały już zaktualizowane i są zgodne z rynkiem USA/Kanada!");
    return;
  }

  // Process in batches of 5 with status output
  const BATCH_SIZE = 5;
  for (let i = 0; i < pendingProducts.length; i += BATCH_SIZE) {
    const batch = pendingProducts.slice(i, i + BATCH_SIZE);
    console.log(`\n⚡ [Partia ${Math.floor(i / BATCH_SIZE) + 1} / ${Math.ceil(pendingProducts.length / BATCH_SIZE)}] Przetwarzanie produktów ${i + 1} - ${i + batch.length}...`);
    
    for (const p of batch) {
      await processProductForUSACanada(p, tracker);
    }
  }

  console.log("\n=================================================");
  console.log("🎉 PODSUMOWANIE PROCESU USA/KANADA:");
  console.log(`✅ Łącznie unikalnie zaktualizowanych produktów: ${tracker.updatedCount}`);
  console.log(`⚠️ Produkty oznaczone do ręcznej weryfikacji: ${tracker.flaggedCount}`);
  console.log("=================================================");
}

runBatchProcessor();
