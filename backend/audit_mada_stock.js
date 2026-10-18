import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();

const ck = process.env.WOOCOMMERCE_CONSUMER_KEY;
const cs = process.env.WOOCOMMERCE_CONSUMER_SECRET;
const url = process.env.WOOCOMMERCE_URL || 'https://naturaintimo.com';

async function auditStock() {
  console.log("1. Pobieranie wszystkich produktów ze sklepu WooCommerce...");
  let page = 1;
  let allWcProducts = [];
  while (true) {
    const res = await fetch(`${url}/wp-json/wc/v3/products?page=${page}&per_page=100`);
    if (!res.ok) break;
    const data = await res.json();
    if (!data.length) break;
    allWcProducts.push(...data);
    page++;
  }
  console.log(`Pobrano ${allWcProducts.length} produktów z WooCommerce.`);

  // Mapowanie ID z MADA -> WC Product
  const madaToWc = new Map();
  for (const p of allWcProducts) {
    const madaIdMeta = p.meta_data?.find(m => m.key === 'mada_product_id');
    if (madaIdMeta && madaIdMeta.value) {
      madaToWc.set(String(madaIdMeta.value), p);
    }
  }
  console.log(`Znaleziono ${madaToWc.size} produktów z powiązanym mada_product_id.`);

  console.log("2. Analiza pliku XML z hurtowni MADA (products.xml)...");
  const xmlContent = fs.readFileSync("products.xml", "utf-8");

  // Regex do wyciągania poszczególnych produktów z XML
  const productRegex = /<PRODUCT>([\s\S]*?)<\/PRODUCT>/g;
  let match;
  let madaMatchedCount = 0;
  let inStockCount = 0;
  let outOfStockCount = 0;

  const comparisonResults = [];

  while ((match = productRegex.exec(xmlContent)) !== null) {
    const pXml = match[1];
    const idMatch = pXml.match(/<ID>(\d+)<\/ID>/);
    if (!idMatch) continue;
    const madaId = idMatch[1];

    if (madaToWc.has(madaId)) {
      madaMatchedCount++;
      const wcProd = madaToWc.get(madaId);

      const priceMatch = pXml.match(/<PRICE>([\d.]+)<\/PRICE>/);
      const madaPrice = priceMatch ? parseFloat(priceMatch[1]) : 0;

      // Parsowanie wariantów / modeli
      const modelsMatch = pXml.match(/<MODELS>([\s\S]*?)<\/MODELS>/);
      const variations = [];
      let totalStock = 0;

      if (modelsMatch) {
        const modelRegex = /<MODEL>([\s\S]*?)<\/MODEL>/g;
        let mMatch;
        while ((mMatch = modelRegex.exec(modelsMatch[1])) !== null) {
          const mContent = mMatch[1];
          const colorMatch = mContent.match(/<COLOR><!\[CDATA\[(.*?)\]\]><\/COLOR>/);
          const color = colorMatch ? colorMatch[1] : '';

          const sizeRegex = /<SIZE\s+amount="(\d+)"(?:\s+ean="([^"]*)")?(?:\s+pattern="([^"]*)")?(?:\s+pattern_img_id="([^"]*)")?>([^<]*)<\/SIZE>/g;
          let sMatch;
          while ((sMatch = sizeRegex.exec(mContent)) !== null) {
            const amount = parseInt(sMatch[1], 10);
            const ean = sMatch[2] || '';
            const size = sMatch[5] ? sMatch[5].trim() : '';
            totalStock += amount;
            variations.push({ color, size, amount, ean });
          }
        }
      }

      if (totalStock > 0) {
        inStockCount++;
      } else {
        outOfStockCount++;
      }

      comparisonResults.push({
        wcId: wcProd.id,
        wcName: wcProd.name,
        madaId,
        madaPrice,
        totalStock,
        status: totalStock > 0 ? 'INSTOCK' : 'OUTOFSTOCK',
        variations
      });
    }
  }

  console.log("\n================ WYNIKI WERYFIKACJI Z HURTOWNIĄ MADA ================");
  console.log(`Liczba produktów zmapowanych: ${madaMatchedCount} / ${madaToWc.size}`);
  console.log(`Dostępne w hurtowni MADA (stock > 0): ${inStockCount}`);
  console.log(`Brak na stanie w hurtowni (stock = 0): ${outOfStockCount}`);
  console.log("===================================================================\n");

  fs.writeFileSync("mada_stock_audit.json", JSON.stringify(comparisonResults, null, 2), "utf-8");
  console.log("Zapisano szczegółowy raport w mada_stock_audit.json");

  console.log("Przykładowe produkty i ich stany w MADA:");
  comparisonResults.slice(0, 5).forEach(r => {
    console.log(`- [WC ID: ${r.wcId} | MADA: ${r.madaId}] ${r.wcName}`);
    console.log(`  Suma sztuk w MADA: ${r.totalStock} (${r.status}), Cena hurtowa netto: ${r.madaPrice} PLN`);
    console.log(`  Rozmiary:`, r.variations.map(v => `${v.size}(${v.amount}szt)`).join(', '));
  });
}

auditStock().catch(console.error);
