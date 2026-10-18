// backend/categorize_all_products.js
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const TRACKER_FILE = path.join(process.cwd(), 'google_merchant_tracker.json');

async function categorizeAllProducts() {
  const ck = process.env.WOOCOMMERCE_CONSUMER_KEY;
  const cs = process.env.WOOCOMMERCE_CONSUMER_SECRET;

  if (!fs.existsSync(TRACKER_FILE)) {
    console.error("❌ Brak pliku google_merchant_tracker.json!");
    return;
  }

  const tracker = JSON.parse(fs.readFileSync(TRACKER_FILE, 'utf-8'));
  const productIds = tracker.processedIds || [];

  console.log("=================================================");
  console.log(`🚀 WDROŻENIE ARCHITEKTURY KATEGORII WOOCOMMERCE (FILAR II) 🚀`);
  console.log(`📋 Liczba produktów do przemapowania: ${productIds.length}`);
  console.log("=================================================\n");

  let updatedCount = 0;

  for (let i = 0; i < productIds.length; i++) {
    const id = productIds[i];
    try {
      const getUrl = `https://naturaintimo.com/wp-json/wc/v3/products/${id}`;
      const res = await fetch(getUrl);
      if (!res.ok) continue;

      const p = await res.json();
      const name = (p.name || "").toLowerCase();
      const desc = (p.description || "").toLowerCase();
      const currentCatIds = new Set(p.categories ? p.categories.map(c => c.id) : []);

      let changed = false;

      // 1. Semi-Soft Bras (id 54)
      if (name.includes('semi-soft') || name.includes('semi soft') || desc.includes('semi-soft')) {
        if (!currentCatIds.has(54)) { currentCatIds.add(54); changed = true; }
        if (!currentCatIds.has(48)) { currentCatIds.add(48); changed = true; } // Bras
      }
      // 2. Soft Bras (id 53)
      else if (name.includes('soft bra') || (name.includes('soft') && !name.includes('semi')) || desc.includes('soft bra')) {
        if (!currentCatIds.has(53)) { currentCatIds.add(53); changed = true; }
        if (!currentCatIds.has(48)) { currentCatIds.add(48); changed = true; } // Bras
      }
      // 3. Push Up Bras (id 55)
      else if (name.includes('push-up') || name.includes('push up') || desc.includes('push-up')) {
        if (!currentCatIds.has(55)) { currentCatIds.add(55); changed = true; }
        if (!currentCatIds.has(48)) { currentCatIds.add(48); changed = true; } // Bras
      }

      // 4. Plus Size (id 52)
      const sizeOpt = p.attributes?.find(a => a.name?.toLowerCase() === 'size' || a.name?.toLowerCase() === 'rozmiar')?.options || [];
      const sizeStr = sizeOpt.join(' ').toUpperCase();
      if (name.includes('3xl') || name.includes('4xl') || name.includes('2xl') ||
          sizeStr.includes('2XL') || sizeStr.includes('3XL') || sizeStr.includes('4XL') ||
          name.includes('100') || name.includes('105') || name.includes('110') || name.includes('115') ||
          name.includes('95') || name.includes('maxi')) {
        if (!currentCatIds.has(52)) { currentCatIds.add(52); changed = true; }
      }

      // 5. Best Sellers (id 56) for top flagship models
      if (name.includes('luisse') || name.includes('mary') || name.includes('infinity') ||
          name.includes('divine') || name.includes('petra') || name.includes('yoko')) {
        if (!currentCatIds.has(56)) { currentCatIds.add(56); changed = true; }
      }

      if (changed) {
        const updatePayload = {
          categories: Array.from(currentCatIds).map(catId => ({ id: catId }))
        };
        const putUrl = `https://naturaintimo.com/wp-json/wc/v3/products/${id}`;
        const putRes = await fetch(putUrl, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatePayload)
        });

        if (putRes.ok) {
          const updatedProduct = await putRes.json();
          updatedCount++;
          console.log(`✅ [KATEGORIE] ID ${id} ("${updatedProduct.name}") ➔ Przypisane kategorie:`, updatedProduct.categories.map(c => c.name));
        }
      } else {
        console.log(`⏩ [Bez zmian] ID ${id} ("${p.name}") zachowuje dotychczasowe kategorie.`);
      }

    } catch (err) {
      console.error(`❌ Błąd przypisywania kategorii dla ID ${id}:`, err.message);
    }
  }

  console.log("\n=================================================");
  console.log(`🎉 ZAKOŃCZONO RE-ARCHITEKTURĘ KATEGORII (FILAR II):`);
  console.log(`✅ Zaktualizowano kategorie dla ${updatedCount} z ${productIds.length} produktów.`);
  console.log("=================================================");
}

categorizeAllProducts();
