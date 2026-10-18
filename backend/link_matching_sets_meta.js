import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();

const url = process.env.WOOCOMMERCE_URL || 'https://naturaintimo.com';
const ck = process.env.WOOCOMMERCE_CONSUMER_KEY;
const cs = process.env.WOOCOMMERCE_CONSUMER_SECRET;
const auth = Buffer.from(`${ck}:${cs}`).toString('base64');

const audit = JSON.parse(fs.readFileSync('mada_stock_audit.json', 'utf-8'));

const collections = [
  { name: 'Nadine', pattern: /nadine/i },
  { name: 'Isla White', pattern: /isla.*(white|bia\w+)|(white|bia\w+).*isla/i },
  { name: 'Isla Black', pattern: /isla/i },
  { name: 'Nike', pattern: /nike|1135/i },
  { name: 'Ava 1030', pattern: /1030/i },
  { name: 'Ava 1396', pattern: /1396/i },
  { name: 'Ava 2103', pattern: /2103/i },
  { name: 'Ava 2106', pattern: /2106/i },
  { name: 'Ava 2110', pattern: /2110/i },
  { name: 'Ava 2111', pattern: /2111/i },
  { name: 'Ava 2271 Divine', pattern: /2271|divine/i },
  { name: 'Mefemi Anita', pattern: /anita/i },
  { name: 'Mefemi Ida', pattern: /ida/i },
  { name: 'Mefemi Petra', pattern: /petra/i },
  { name: 'Gorsenia Paradise', pattern: /paradise|496/i },
  { name: 'Gorsenia Alicante', pattern: /alicante|647|649/i },
  { name: 'Gorsenia Yoko', pattern: /yoko|810|811/i },
  { name: 'Gorsenia Luisse Black', pattern: /luisse.*(black|czar\w+)|(black|czar\w+).*luisse/i },
  { name: 'Gorsenia Luisse Beige', pattern: /luisse/i },
  { name: 'Gaia Sonia', pattern: /sonia/i },
  { name: 'Gaia Veronika', pattern: /veronika/i },
  { name: 'Gaia Keto', pattern: /keto/i },
  { name: 'Gaia Aina', pattern: /aina/i },
  { name: 'Gaia Mary', pattern: /mary/i },
  { name: 'Gaia Charlotte', pattern: /charlotte/i },
  { name: 'Gaia Ariarosa Black', pattern: /ariarosa/i },
  { name: 'Julimex Infinity', pattern: /infinity/i }
];

function isBra(name) {
  if (/brazilian|brazyliany/i.test(name)) return false;
  return /\b(bra|biustonosz|semi-soft|soft|full cup|push-up)\b/i.test(name);
}

function isBottom(name) {
  return /panties|briefs|brazilian|majtki|figi|brazyliany/i.test(name);
}

const productMap = audit.map(p => ({
  id: p.wcId,
  name: p.wcName,
  isBra: isBra(p.wcName),
  isBottom: isBottom(p.wcName)
}));

async function linkSets() {
  console.log('Resolving pairs for all products...');
  const batchUpdates = [];

  for (const p of productMap) {
    let matchedCol = null;
    for (const col of collections) {
      if (col.pattern.test(p.name)) {
        matchedCol = col;
        break;
      }
    }

    let counterpart = null;
    if (matchedCol) {
      const candidates = productMap.filter(c => c.id !== p.id && matchedCol.pattern.test(c.name));
      if (p.isBra) {
        counterpart = candidates.find(c => c.isBottom) || candidates[0];
      } else {
        counterpart = candidates.find(c => c.isBra) || candidates[0];
      }
    }

    if (counterpart) {
      batchUpdates.push({
        id: p.id,
        upsell_ids: [counterpart.id],
        meta_data: [
          { key: '_matching_product_id', value: String(counterpart.id) }
        ]
      });
    }
  }

  console.log(`Found ${batchUpdates.length} products to update with matching sets.`);

  // WooCommerce REST API batch update supports max 100 items per batch
  const BATCH_SIZE = 50;
  for (let i = 0; i < batchUpdates.length; i += BATCH_SIZE) {
    const chunk = batchUpdates.slice(i, i + BATCH_SIZE);
    console.log(`Updating batch ${i / BATCH_SIZE + 1} (${chunk.length} items)...`);
    
    const res = await fetch(`${url}/wp-json/wc/v3/products/batch`, {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + auth,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ update: chunk })
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Batch update failed: ${res.status} ${err}`);
    }

    const data = await res.json();
    console.log(`Batch updated! Updated count: ${data.update ? data.update.length : 'unknown'}`);
  }

  console.log('ALL PRODUCTS SUCCESSFULLY LINKED WITH MATCHING SETS!');
}

linkSets().catch(console.error);
