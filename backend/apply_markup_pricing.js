import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();

const ck = process.env.WOOCOMMERCE_CONSUMER_KEY;
const cs = process.env.WOOCOMMERCE_CONSUMER_SECRET;
const url = process.env.WOOCOMMERCE_URL || 'https://naturaintimo.com';

const AUDIT_FILE = 'mada_stock_audit.json';
const USD_PLN_RATE = 3.9022; // Średni kurs NBP
const MARKUP_MULTIPLIER = 2.6; // Przelicznik narzutowy 2.6 (zaktualizowany)

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Obliczenie ceny detalicznej USD na podstawie ceny hurtowej netto z MADA
function calculateRetailPriceUSD(madaNetPln) {
  const grossPln = madaNetPln * 1.23; // Brutto 23% VAT w hurtowni
  const costUsd = grossPln / USD_PLN_RATE; // Koszt zakupu w USD
  const targetPrice = costUsd * MARKUP_MULTIPLIER; // Zastosowanie narzutu 2.4

  // Psychologiczne zaokrąglenie do końcówki .99 (np. 68.99, 34.99)
  const rounded = Math.round(targetPrice);
  const finalPrice = (rounded - 0.01).toFixed(2);
  return finalPrice;
}

async function applyMarkupPricing() {
  if (!fs.existsSync(AUDIT_FILE)) {
    console.error(`Brak pliku ${AUDIT_FILE}!`);
    return;
  }

  const audit = JSON.parse(fs.readFileSync(AUDIT_FILE, 'utf-8'));
  console.log("==========================================================");
  console.log(`💵 AKTUALIZACJA CEN PRODUKTÓW I WARIANTÓW W SKLEPIE (NARZUT 2.4)`);
  console.log(`Kurs USD/PLN: ${USD_PLN_RATE} | Mnożnik narzutu: ${MARKUP_MULTIPLIER}x`);
  console.log(`Liczba produktów: ${audit.length}`);
  console.log("==========================================================\n");

  let updatedProducts = 0;
  let totalVariationsUpdated = 0;

  for (let i = 0; i < audit.length; i++) {
    const item = audit[i];
    const pId = item.wcId;
    const madaNetPrice = parseFloat(item.madaPrice);

    if (!madaNetPrice || isNaN(madaNetPrice) || madaNetPrice <= 0) {
      console.log(`[${i + 1}/${audit.length}] Pomijam ID ${pId} - brak ceny w MADA`);
      continue;
    }

    const calculatedPriceUSD = calculateRetailPriceUSD(madaNetPrice);

    console.log(`[${i + 1}/${audit.length}] ID ${pId} ("${item.wcName}"):`);
    console.log(`   Hurt MADA netto: ${madaNetPrice.toFixed(2)} PLN ➔ Nowa cena sprzedaży: $${calculatedPriceUSD}`);

    // 1. Zaktualizuj cenę produktu głównego
    try {
      await fetch(`${url}/wp-json/wc/v3/products/${pId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          regular_price: String(calculatedPriceUSD)
        })
      });
    } catch (err) {
      console.error(`   ❌ Błąd aktualizacji produktu ${pId}:`, err.message);
      continue;
    }

    // 2. Pobierz wszystkie warianty produktu
    let allVars = [];
    let vPage = 1;
    while (true) {
      try {
        const vRes = await fetch(`${url}/wp-json/wc/v3/products/${pId}/variations?page=${vPage}&per_page=100`);
        if (!vRes.ok) break;
        const vData = await vRes.json();
        if (!vData.length) break;
        allVars.push(...vData);
        vPage++;
      } catch (e) {
        break;
      }
    }

    if (allVars.length > 0) {
      const updateList = allVars.map(v => ({
        id: v.id,
        regular_price: String(calculatedPriceUSD)
      }));

      // Paczki po 50 wariantów
      const BATCH_SIZE = 50;
      for (let b = 0; b < updateList.length; b += BATCH_SIZE) {
        const chunk = updateList.slice(b, b + BATCH_SIZE);
        try {
          await fetch(`${url}/wp-json/wc/v3/products/${pId}/variations/batch`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ update: chunk })
          });
          totalVariationsUpdated += chunk.length;
        } catch (err) {
          console.error(`   ❌ Błąd aktualizacji batch wariantów dla ${pId}:`, err.message);
        }
        await sleep(200);
      }
      console.log(`   ✅ Zaktualizowano produkt oraz ${allVars.length} wariantów do ceny $${calculatedPriceUSD}`);
    } else {
      console.log(`   ✅ Zaktualizowano produkt do ceny $${calculatedPriceUSD}`);
    }

    updatedProducts++;
    await sleep(200);
  }

  console.log("\n==========================================================");
  console.log(`🎉 ZAKOŃCZONO AKTUALIZACJĘ CEN!`);
  console.log(`✅ Zaktualizowano produkty: ${updatedProducts} / ${audit.length}`);
  console.log(`✅ Zaktualizowano warianty: ${totalVariationsUpdated}`);
  console.log("==========================================================");
}

applyMarkupPricing().catch(console.error);
