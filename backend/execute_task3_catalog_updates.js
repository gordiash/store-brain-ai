import dotenv from 'dotenv';
import fs from 'fs';
dotenv.config();

const ck = process.env.WOOCOMMERCE_CONSUMER_KEY;
const cs = process.env.WOOCOMMERCE_CONSUMER_SECRET;
const url = process.env.WOOCOMMERCE_URL || 'https://naturaintimo.com';

if (!ck || !cs) {
  throw new Error('Brak wymaganych poświadczeń WooCommerce w .env');
}

const authHeader = 'Basic ' + Buffer.from(`${ck}:${cs}`).toString('base64');
const headers = {
  'Authorization': authHeader,
  'Content-Type': 'application/json'
};

const marketConfig = JSON.parse(fs.readFileSync('market_config.json', 'utf-8'));
const BRA_HTS = marketConfig.customsAndHts.componentHtsMapping.bra_synthetic.htsUs; // 6212.10.9020
const PANTY_HTS = marketConfig.customsAndHts.componentHtsMapping.panty_synthetic_knit.htsUs; // 6108.22.9020

// Dokładna mapa ujednoliconych tytułów Title Case + en-dash
const TITLE_OVERRIDES = {
  3570: 'Gorsenia Luisse Bikini Briefs Black M–2XL',
  3494: "Julimex Infinity Maxi Women's Briefs Black M–XL",
  3485: 'Julimex Soft Infinity Soft Bra Beige M–L',
  3474: "Gaia Mary Women's Bikini Briefs Burgundy S–3XL",
  3442: 'Gaia Mary Semi-Soft Bra Burgundy 70D–95D',
  3601: 'Ava 2271 Divine Bikini Briefs Champagne Wine S',
  3579: 'Ava 2271 Divine Soft Bra Champagne Wine 65I–95B',
  3507: 'Gorsenia Luisse Soft Bra Black 65F–110D',
  3674: 'Gorsenia Paradise Brazilian Briefs Black M–2XL',
  3607: 'Gorsenia K 496 Paradise Soft Bra Black 70I–100G',
  3864: 'Gaia GFB 1135 Brazilian Briefs Beige S–2XL',
  3819: 'Gaia BS 1135 Soft Bra Beige 65E–95E',
  3810: 'Gaia Isla Bikini Briefs White S–L',
  3777: 'Gaia Isla Semi-Soft Bra White 65F–95I',
  3772: 'Gaia Aina Panties Navy S',
  3762: 'Gaia Aina Semi-Soft Bra Navy and Pink 70E–70H',
  3744: 'Gaia Isla Panties Black M–3XL',
  3684: 'Gaia Isla Semi-Soft Bra Black 65J–80B',
  3932: 'Gorsenia Nadine Panties Multicolor M–3XL',
  3874: 'Gorsenia Nadine Soft Bra Multicolor 65F–115D',
  2471: 'Mefemi Petra Brazilian Briefs Black S–XL',
  2399: 'Mefemi Petra BP16 Push-Up Bra Black 65D–95B',
  2378: 'Ava 2110 Panties Beige Black White S–3XL',
  2315: 'Ava 2110 Maxi Semi-Soft Bra Beige Black White 75L–105E',
  2298: 'Ava 2106 Bikini Briefs Beige and Black S–3XL',
  2209: 'Ava 2106 Soft Bra Beige and Black 65I–105C',
  2198: 'Gaia Keto GFP 1134 Bikini Briefs White S–3XL',
  2154: 'Gaia Keto Semi-Soft Bra White 65E–95E',
  2144: 'Mefemi Anita II Panties Mocha S–2XL',
  2044: 'Mefemi Anita Full Cup Bra Navy 70D–90E',
  2030: 'Gaia Ariarosa Sara Bikini Briefs Black S–2XL',
  1973: 'Gaia Ariarosa Semi-Soft Bra Black 65E–95E',
  1963: 'Gorsenia K 811 Yoko Bikini Briefs Black M–2XL',
  1850: 'Gorsenia K 810 Yoko Soft Bra Black 65F–95J',
  1833: 'Gaia Veronika 2 Bikini Briefs Black XL–2XL',
  1735: 'Gaia Veronika 2 Semi-Soft Bra Black 65H–95B',
  1720: 'Ava 2111 Panties Black White S–3XL',
  1631: 'Ava 2111 SSS Soft Bra Black White 65I–100D',
  1616: 'Ava 2103 Bikini Briefs Beige Black S–3XL',
  1523: 'Ava 2103 Soft Bra Beige Black 65F–105C',
  1253: 'Gaia Ariarosa Charlotte Bikini Briefs Beige S–3XL',
  1193: 'Gaia Ariarosa BS 005 Charlotte Soft Bra Beige 80L–100C',
  1178: 'Mefemi Ida Bikini Briefs Black S–XL',
  1135: 'Mefemi Ida Push-Up Bra White 65C–85C',
  1118: 'Ava 1396 Panties Black S–XL',
  974: 'Ava 1396 Soft Bra Black 65E–105C',
  951: 'Gaia Ariarosa Julia Panties Black L–XL',
  828: 'Gaia Ariarosa Semi-Soft Bra Black 70J–95B',
  808: 'Ava 2110/B Brazilian Briefs Beige, Black, White S–2XL',
  675: 'Ava 2110 Semi-Soft Bra Beige, Black, White 65B–95I',
  659: 'Ava 1030 Bikini Briefs Black S–XL',
  562: 'Ava 1030 Semi-Soft Bra Black 65E–100D',
  551: 'Gorsenia K 442/1 Luisse Bikini Briefs Beige S–3XL',
  492: 'Gorsenia Luisse Soft Bra Beige 90J–105D',
  475: 'Gaia Sonia Bikini Briefs Black XL–2XL',
  379: 'Gaia Sonia Semi-Soft Bra Black 70D–95E',
  1517: 'Gorsenia K 649 Alicante Brazilian Briefs Beige 2XL',
  1376: 'Gorsenia K 647 Alicante Semi-Soft Bra Black 75K–95H',
  1364: 'Alles FK 01 Bikini Briefs Black L–2XL',
  // Również produkty Gaia 1135 w koszu (4340, 4381)
  4340: 'Gaia BS 1135 Soft Bra White 65G–95E',
  4381: 'Gaia GFB 1135 Brazilian Briefs White S–2XL'
};

function sanitizeGaia1135Text(html, isBraProduct, colorLabel) {
  if (!html) return '';
  let out = html;
  if (isBraProduct) {
    out = out.replace(/Gaia\s+soft\s+bra\s+BS\s*1135\s+Nike/gi, 'Gaia BS 1135 Soft Bra');
    out = out.replace(/Gaia\s+BS\s*1135\s+Nike\s+soft\s+bra/gi, 'Gaia BS 1135 Soft Bra');
    out = out.replace(/BS\s*1135\s+Nike/gi, 'BS 1135');
    out = out.replace(/<li><strong>Style:<\/strong>\s*.*?<\/li>/i, '<li><strong>Style:</strong> BS 1135</li>');
    out = out.replace(/<li><strong>Available sizes:<\/strong>\s*65E to 95E<\/li>/i, '<li><strong>Available sizes:</strong> 65E–95E</li>');
  } else {
    out = out.replace(/Gaia\s+Nike\s+Brazilian\s+briefs/gi, 'Gaia GFB 1135 Brazilian Briefs');
    out = out.replace(/GFB\s*1135\s+Nike/gi, 'GFB 1135');
    out = out.replace(/Nike\s+Brazilian\s+briefs/gi, 'GFB 1135');
    out = out.replace(/<li><strong>Style:<\/strong>\s*.*?<\/li>/i, '<li><strong>Style:</strong> GFB 1135</li>');
    out = out.replace(/<li><strong>Available sizes:<\/strong>\s*2XL,\s*XL,\s*L,\s*M,\s*S<\/li>/i, '<li><strong>Available sizes:</strong> S–2XL (S, M, L, XL, 2XL)</li>');
  }
  // Dodatkowe zabezpieczenie: usuń jakiekolwiek pozostałe wystąpienie słowa Nike
  out = out.replace(/\bNike\b/gi, isBraProduct ? 'BS 1135' : 'GFB 1135');
  return out;
}

async function runCatalogUpdates() {
  console.log('--- Rozpoczynam kompleksową aktualizację katalogu (Zadanie 3: Gaia 1135, Mefemi/Alles, Panties vs Lingerie Sets, Title Case, Matching Item, HTS 10-digit) ---');

  const backupRaw = JSON.parse(fs.readFileSync('backups/backup_full_catalog_pre_tasks356.json', 'utf-8'));
  const publishedProducts = backupRaw.all;
  const trashedGaia = backupRaw.trash.filter(p => [4340, 4381].includes(p.id));

  // Mapa ID -> { name, permalink } dla uzupełniania Matching item
  const productLookup = new Map();
  for (const p of [...publishedProducts, ...trashedGaia]) {
    productLookup.set(p.id, {
      id: p.id,
      name: TITLE_OVERRIDES[p.id] || p.name,
      permalink: p.permalink,
      status: p.status
    });
  }

  const batchUpdates = [];

  for (const p of [...publishedProducts, ...trashedGaia]) {
    const newName = TITLE_OVERRIDES[p.id] || p.name;
    const isBottom = /panties|brief|brazilian/i.test(newName);
    const isBra = !isBottom;

    let shortDesc = p.short_description || '';
    let fullDesc = p.description || '';

    // 1. Specjalne czyszczenie Gaia 1135 (3819, 3864, 4340, 4381) ze słowa "Nike"
    if ([3819, 3864, 4340, 4381].includes(p.id) || /nike/i.test(shortDesc) || /nike/i.test(fullDesc)) {
      const colorLbl = (p.id === 4340 || p.id === 4381) ? 'White' : 'Beige';
      shortDesc = sanitizeGaia1135Text(shortDesc, isBra, colorLbl);
      fullDesc = sanitizeGaia1135Text(fullDesc, isBra, colorLbl);
    }

    // 2. Uzupełnienie Matching item w opisie długim
    let counterpartId = p.upsell_ids?.[0] || null;
    if (!counterpartId) {
      const mMeta = p.meta_data?.find(m => m.key === '_matching_product_id');
      if (mMeta && mMeta.value) counterpartId = parseInt(mMeta.value, 10);
    }
    if (p.id === 4340) counterpartId = 4381;
    if (p.id === 4381) counterpartId = 4340;

    if (counterpartId && productLookup.has(counterpartId)) {
      const cp = productLookup.get(counterpartId);
      const matchingHtml = cp.status === 'publish'
        ? `<a href="${cp.permalink}">${cp.name}</a>`
        : cp.name;

      if (/<li><strong>Matching item:<\/strong>\s*(N\/A|None|-|.*?Nike.*?)<\/li>/i.test(fullDesc)) {
        fullDesc = fullDesc.replace(
          /<li><strong>Matching item:<\/strong>\s*.*?<\/li>/i,
          `<li><strong>Matching item:</strong> ${matchingHtml}</li>`
        );
      }
    }

    // 3. Poprawa marki w Alles FK 01 (ID 1364)
    if (p.id === 1364) {
      fullDesc = fullDesc.replace(/<li><strong>Brand:<\/strong>\s*Natura Intimo<\/li>/i, '<li><strong>Brand:</strong> Alles</li>');
    }

    // 4. Porządek w kategoriach: Panties vs Lingerie Sets
    // Majtki: kategoria Panties (49), New Arrivals (51) oraz Plus Size (52 jeśli 2XL/3XL) — BEZ Lingerie Sets (50) i BEZ Bras (48)!
    // Biustonosze: Bras (48), podkategoria kroju (53/54/55), Lingerie Sets (50 jeśli ma parę), New Arrivals (51), Plus Size (52 jeśli dotyczy)
    const currentCatIds = new Set((p.categories || []).map(c => c.id));
    if (p.status === 'publish') {
      if (isBottom) {
        currentCatIds.delete(50); // Usuń Lingerie Sets z pojedynczych majtek
        currentCatIds.delete(48); // Nigdy Bras dla majtek
        currentCatIds.add(49);    // Zawsze Panties
        currentCatIds.add(51);    // New Arrivals
        if (/2XL|3XL|4XL|XXL/i.test(newName)) {
          currentCatIds.add(52);  // Plus Size
        }
      } else {
        currentCatIds.delete(49); // Nigdy Panties dla biustonosza
        currentCatIds.add(48);    // Zawsze Bras
        currentCatIds.add(51);    // New Arrivals
        if (counterpartId) {
          currentCatIds.add(50);  // Lingerie Sets dla biustonosza tworzącego komplet
        }
      }
    }

    // 5. Aktualizacja metadanych (_hts_code 10-cyfrowy oraz _wc_gla_brand dla Alles)
    const metaUpdates = [
      { key: '_hts_code', value: isBra ? BRA_HTS : PANTY_HTS },
      { key: '_customs_category', value: isBra ? 'bra' : 'panty' }
    ];
    if (p.id === 1364) {
      metaUpdates.push({ key: '_wc_gla_brand', value: 'Alles' });
    }
    if (p.id === 4340) {
      metaUpdates.push({ key: '_matching_product_id', value: '4381' });
    }
    if (p.id === 4381) {
      metaUpdates.push({ key: '_matching_product_id', value: '4340' });
    }

    const updateObj = {
      id: p.id,
      name: newName,
      short_description: shortDesc,
      description: fullDesc,
      categories: Array.from(currentCatIds).map(id => ({ id })),
      meta_data: metaUpdates
    };
    if (p.id === 4340) updateObj.upsell_ids = [4381];
    if (p.id === 4381) updateObj.upsell_ids = [4340];

    batchUpdates.push(updateObj);
  }

  console.log(`Przygotowano ${batchUpdates.length} produktów do aktualizacji batchowej.`);

  const BATCH_SIZE = 25;
  const updatedLogs = [];

  for (let i = 0; i < batchUpdates.length; i += BATCH_SIZE) {
    const chunk = batchUpdates.slice(i, i + BATCH_SIZE);
    console.log(`Wysyłanie paczki ${Math.floor(i / BATCH_SIZE) + 1} (${chunk.length} produktów)...`);
    const res = await fetch(`${url}/wp-json/wc/v3/products/batch`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ update: chunk })
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Błąd batch update HTTP ${res.status}: ${errText}`);
    }

    const data = await res.json();
    for (const u of (data.update || [])) {
      console.log(`✅ Zaktualizowano ID ${u.id}: "${u.name}" | Cats: ${u.categories.map(c => c.name).join(', ')}`);
      updatedLogs.push({
        id: u.id,
        name: u.name,
        categories: u.categories.map(c => c.name),
        httpStatus: res.status,
        updatedAt: new Date().toISOString()
      });
    }
  }

  // Zapis do usa_canada_tracker.json
  const trackerPath = 'usa_canada_tracker.json';
  const tracker = JSON.parse(fs.readFileSync(trackerPath, 'utf-8'));
  tracker.logs.push(
    `[POTWIERDZENIE ZADANIE 3 - CATALOG & TRADEMARK CLEANUP] Zaktualizowano ${updatedLogs.length} produktów (HTTP 200): całkowite usunięcie słowa "Nike" z tytułów, krótkich i długich opisów modeli Gaia BS 1135 / GFB 1135 (ID 3819, 3864, 4340, 4381), uzupełnienie Matching item w opisach kompletów, ujednolicenie Title Case i en-dash w tytułach, korekta marki Alles (ID 1364) i Mefemi (ID 2144, 2471), separacja kategorii Panties (49) od Lingerie Sets (50) dla majtek oraz aktualizacja 10-cyfrowych kodów HTS (6212.10.9020 / 6108.22.9020) (${new Date().toISOString()})`
  );
  tracker.task3_catalog_updates = updatedLogs;
  fs.writeFileSync(trackerPath, JSON.stringify(tracker, null, 2), 'utf-8');
  console.log('✅ Zapisano logi w usa_canada_tracker.json.');
}

runCatalogUpdates().catch(err => {
  console.error('Błąd aktualizacji katalogu:', err);
  process.exit(1);
});
