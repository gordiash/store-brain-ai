import dotenv from 'dotenv';
dotenv.config();

const ck = process.env.WOOCOMMERCE_CONSUMER_KEY;
const cs = process.env.WOOCOMMERCE_CONSUMER_SECRET;
const url = process.env.WOOCOMMERCE_URL || 'https://naturaintimo.com';

const COLOR_MAP = {
  'czarny': 'Black',
  'czarna': 'Black',
  'czarne': 'Black',
  'black': 'Black',
  'biały': 'White',
  'biała': 'White',
  'białe': 'White',
  'white': 'White',
  'beżowy': 'Beige',
  'beżowa': 'Beige',
  'beżowe': 'Beige',
  'beige': 'Beige',
  'bordowy': 'Burgundy',
  'bordowa': 'Burgundy',
  'bordowe': 'Burgundy',
  'granatowy': 'Navy',
  'granatowa': 'Navy',
  'granatowe': 'Navy',
  'granatowy-różowy': 'Navy-Pink',
  'mocca': 'Mocha',
  'mokka': 'Mocha',
  'nude wine': 'Nude Wine',
  'multicolor': 'Multicolor',
  'naturalny 02': 'Natural Nude'
};

function translateColor(col) {
  if (!col) return col;
  const key = col.toLowerCase().trim();
  if (COLOR_MAP[key]) return COLOR_MAP[key];
  return col.charAt(0).toUpperCase() + col.slice(1);
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function translateAllStoreColors() {
  console.log("==========================================================");
  console.log("🎨 TŁUMACZENIE KOLORÓW NA JĘZYK ANGIELSKI WE WSZYSTKICH PRODUKTACH");
  console.log("==========================================================\n");

  // 1. Pobierz wszystkie produkty
  let allProducts = [];
  let page = 1;
  while (true) {
    const res = await fetch(`${url}/wp-json/wc/v3/products?page=${page}&per_page=100`);
    if (!res.ok) break;
    const data = await res.json();
    if (!data.length) break;
    allProducts.push(...data);
    page++;
  }

  console.log(`Pobrano ${allProducts.length} produktów do weryfikacji kolorów.\n`);

  let updatedProductsCount = 0;
  let totalVariationsUpdated = 0;

  for (let i = 0; i < allProducts.length; i++) {
    const p = allProducts[i];
    const colorAttr = p.attributes?.find(a => a.name.toLowerCase() === 'color');
    if (!colorAttr) continue;

    const oldOptions = colorAttr.options || [];
    const newOptions = oldOptions.map(translateColor);

    const hasChanged = JSON.stringify(oldOptions) !== JSON.stringify(newOptions);

    if (hasChanged) {
      console.log(`[${i + 1}/${allProducts.length}] ID ${p.id} ("${p.name}"):`);
      console.log(`  Stare kolory: ${oldOptions.join(', ')} ➔ Nowe: ${newOptions.join(', ')}`);

      // Aktualizuj atrybuty produktu głównego
      const updatedAttributes = p.attributes.map(a => {
        if (a.name.toLowerCase() === 'color') {
          return { ...a, options: newOptions };
        }
        return a;
      });

      try {
        await fetch(`${url}/wp-json/wc/v3/products/${p.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ attributes: updatedAttributes })
        });
      } catch (err) {
        console.error(`  ❌ Błąd aktualizacji atrybutów produktu ${p.id}:`, err.message);
        continue;
      }

      // Aktualizuj warianty
      try {
        let vPage = 1;
        let allVars = [];
        while (true) {
          const vRes = await fetch(`${url}/wp-json/wc/v3/products/${p.id}/variations?page=${vPage}&per_page=100`);
          if (!vRes.ok) break;
          const vData = await vRes.json();
          if (!vData.length) break;
          allVars.push(...vData);
          vPage++;
        }

        const variationsToUpdate = allVars.map(v => {
          const newAttrs = v.attributes.map(attr => {
            if (attr.name.toLowerCase() === 'color') {
              return { ...attr, option: translateColor(attr.option) };
            }
            return attr;
          });
          return { id: v.id, attributes: newAttrs };
        });

        // Batch update po 50
        const BATCH_SIZE = 50;
        for (let b = 0; b < variationsToUpdate.length; b += BATCH_SIZE) {
          const chunk = variationsToUpdate.slice(b, b + BATCH_SIZE);
          await fetch(`${url}/wp-json/wc/v3/products/${p.id}/variations/batch`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ update: chunk })
          });
          totalVariationsUpdated += chunk.length;
          await sleep(200);
        }

        console.log(`  ✅ Zaktualizowano atrybuty i ${variationsToUpdate.length} wariantów.`);
        updatedProductsCount++;
      } catch (err) {
        console.error(`  ❌ Błąd aktualizacji wariantów dla ${p.id}:`, err.message);
      }
    }
  }

  console.log("\n==========================================================");
  console.log(`🎉 ZAKOŃCZONO TŁUMACZENIE KOLORÓW!`);
  console.log(`✅ Zaktualizowano produkty: ${updatedProductsCount}`);
  console.log(`✅ Zaktualizowano warianty: ${totalVariationsUpdated}`);
  console.log("==========================================================");
}

translateAllStoreColors().catch(console.error);
