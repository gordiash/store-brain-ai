import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();

const ck = process.env.WOOCOMMERCE_CONSUMER_KEY;
const cs = process.env.WOOCOMMERCE_CONSUMER_SECRET;
const url = process.env.WOOCOMMERCE_URL || 'https://naturaintimo.com';

const AUDIT_FILE = 'mada_stock_audit.json';
const PROGRESS_FILE = 'sync_variations_progress.json';

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function syncVariations() {
  if (!fs.existsSync(AUDIT_FILE)) {
    console.error(`Brak pliku ${AUDIT_FILE}! Uruchom najpierw audit_mada_stock.js`);
    return;
  }

  const audit = JSON.parse(fs.readFileSync(AUDIT_FILE, 'utf-8'));
  console.log(`=======================================================`);
  console.log(`🚀 SYNCHRONIZACJA WARIANTÓW I STANÓW Z HURTOWNIĄ MADA 🚀`);
  console.log(`📦 Liczba produktów: ${audit.length}`);
  console.log(`=======================================================\n`);

  let progress = { completedProductIds: [], totalVariationsCreated: 0 };
  if (fs.existsSync(PROGRESS_FILE)) {
    try {
      progress = JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf-8'));
      console.log(`Wczytano postęp: ukończono już ${progress.completedProductIds.length} produktów.`);
    } catch (e) {}
  }

  for (let i = 0; i < audit.length; i++) {
    const item = audit[i];
    const pId = item.wcId;

    if (progress.completedProductIds.includes(pId)) {
      console.log(`[${i + 1}/${audit.length}] Produkt ID ${pId} ("${item.wcName}") - już przetworzony, pomijam.`);
      continue;
    }

    console.log(`\n-------------------------------------------------------`);
    console.log(`[${i + 1}/${audit.length}] Przetwarzanie ID ${pId}: "${item.wcName}"`);
    console.log(`MADA ID: ${item.madaId} | Łączny stan MADA: ${item.totalStock} sztuk`);

    // 1. Pobierz aktualne dane produktu z WooCommerce
    let p;
    try {
      const pRes = await fetch(`${url}/wp-json/wc/v3/products/${pId}`);
      if (!pRes.ok) {
        console.error(`❌ Błąd pobierania produktu ${pId}: HTTP ${pRes.status}`);
        continue;
      }
      p = await pRes.json();
    } catch (err) {
      console.error(`❌ Błąd sieci dla produktu ${pId}:`, err.message);
      continue;
    }

    const basePrice = p.price && parseFloat(p.price) > 0 ? p.price : (p.regular_price || "129.00");
    const colorAttr = p.attributes?.find(a => a.name.toLowerCase() === 'color');
    const sizeAttr = p.attributes?.find(a => a.name.toLowerCase() === 'size');

    // 2. Zagreguj warianty z MADA
    const combMap = new Map();
    item.variations.forEach(v => {
      // Dopasuj wielkość liter koloru do opcji w WooCommerce jeśli to możliwe
      let cVal = v.color;
      if (colorAttr && colorAttr.options) {
        const foundC = colorAttr.options.find(o => o.toLowerCase() === v.color.toLowerCase());
        if (foundC) cVal = foundC;
      }

      // Dopasuj wielkość liter rozmiaru
      let sVal = v.size;
      if (sizeAttr && sizeAttr.options) {
        const foundS = sizeAttr.options.find(o => o.toLowerCase() === v.size.toLowerCase());
        if (foundS) sVal = foundS;
      }

      const key = `${cVal}___${sVal}`;
      if (!combMap.has(key)) {
        combMap.set(key, { color: cVal, size: sVal, amount: 0, ean: v.ean });
      }
      const existing = combMap.get(key);
      existing.amount += v.amount;
      if (!existing.ean && v.ean) existing.ean = v.ean;
    });

    const variationsToCreate = [];
    for (const [_, comb] of combMap.entries()) {
      const attrs = [];
      if (colorAttr && comb.color) {
        attrs.push({ name: "Color", option: comb.color });
      }
      if (sizeAttr && comb.size) {
        attrs.push({ name: "Size", option: comb.size });
      }

      variationsToCreate.push({
        regular_price: String(basePrice),
        manage_stock: true,
        stock_quantity: comb.amount,
        stock_status: comb.amount > 0 ? "instock" : "outofstock",
        attributes: attrs,
        sku: comb.ean ? String(comb.ean) : undefined
      });
    }

    console.log(`📦 Przygotowano ${variationsToCreate.length} wariantów do utworzenia w WooCommerce.`);

    // 3. Utwórz warianty w paczkach po 50 (limit WooCommerce batch API wynosi zazwyczaj 100)
    const BATCH_SIZE = 50;
    let createdForProduct = 0;

    for (let b = 0; b < variationsToCreate.length; b += BATCH_SIZE) {
      const chunk = variationsToCreate.slice(b, b + BATCH_SIZE);
      try {
        const batchRes = await fetch(`${url}/wp-json/wc/v3/products/${pId}/variations/batch`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ create: chunk })
        });

        if (!batchRes.ok) {
          console.error(`❌ Błąd batch variations dla ${pId}: HTTP ${batchRes.status}`);
          continue;
        }

        const bData = await batchRes.json();
        const successCount = (bData.create || []).filter(c => c.id).length;
        createdForProduct += successCount;
        console.log(`  ➕ Paczka ${Math.floor(b / BATCH_SIZE) + 1}: utworzono ${successCount} / ${chunk.length} wariantów.`);
      } catch (err) {
        console.error(`❌ Błąd sieci podczas batch variations dla ${pId}:`, err.message);
      }
      await sleep(300);
    }

    // 4. Uaktualnij główny produkt (status = publish, catalog_visibility = visible, stock_status = instock)
    try {
      const updateProdRes = await fetch(`${url}/wp-json/wc/v3/products/${pId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "publish",
          catalog_visibility: "visible",
          stock_status: "instock"
        })
      });
      if (updateProdRes.ok) {
        console.log(`✅ Produkt ID ${pId} uaktualniony: status=publish, stock_status=instock, visibility=visible`);
      }
    } catch (e) {
      console.error(`Błąd aktualizacji statusu produktu ${pId}:`, e.message);
    }

    progress.completedProductIds.push(pId);
    progress.totalVariationsCreated += createdForProduct;
    fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2), "utf-8");

    await sleep(200);
  }

  console.log(`\n=======================================================`);
  console.log(`🎉 ZAKOŃCZONO SYNCHRONIZACJĘ ZE STANAMI MADA!`);
  console.log(`✅ Zsynchronizowano ${progress.completedProductIds.length} produktów.`);
  console.log(`✅ Utworzono łącznie ${progress.totalVariationsCreated} wariantów z realnymi stanami magazynowymi.`);
  console.log(`=======================================================`);
}

syncVariations().catch(console.error);
