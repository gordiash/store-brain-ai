import dotenv from 'dotenv';
import fs from 'fs';
dotenv.config();

const ck = process.env.WOOCOMMERCE_CONSUMER_KEY;
const cs = process.env.WOOCOMMERCE_CONSUMER_SECRET;
const url = process.env.WOOCOMMERCE_URL || 'https://naturaintimo.com';

if (!ck || !cs) {
  throw new Error('Brak wymaganych poświadczeń WooCommerce (WOOCOMMERCE_CONSUMER_KEY / WOOCOMMERCE_CONSUMER_SECRET w .env)');
}

const authHeader = 'Basic ' + Buffer.from(`${ck}:${cs}`).toString('base64');
const headers = { Authorization: authHeader };

async function makeBackup() {
  console.log('--- Rozpoczynam tworzenie kopii zapasowej cen i strefy dostawy ---');
  const backupDir = 'backups';
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  // 1. Kopia stref dostawy
  const zonesRes = await fetch(`${url}/wp-json/wc/v3/shipping/zones`, { headers });
  const zones = await zonesRes.json();
  const zonesData = [];
  for (const z of zones) {
    const locRes = await fetch(`${url}/wp-json/wc/v3/shipping/zones/${z.id}/locations`, { headers });
    const locs = await locRes.json();
    const methRes = await fetch(`${url}/wp-json/wc/v3/shipping/zones/${z.id}/methods`, { headers });
    const meths = await methRes.json();
    zonesData.push({ zone: z, locations: locs, methods: meths });
  }

  // 2. Kopia cen produktów i wariantów
  console.log('Pobieram listę produktów do backupu...');
  let products = [];
  let page = 1;
  while (true) {
    console.log(`Pobieram stronę ${page}...`);
    const res = await fetch(`${url}/wp-json/wc/v3/products?page=${page}&per_page=100`, { headers });
    if (!res.ok) break;
    const batch = await res.json();
    if (!batch.length) break;
    for (const p of batch) {
      products.push({
        id: p.id,
        name: p.name,
        regular_price: p.regular_price,
        price: p.price,
        variations: p.variations
      });
    }
    if (batch.length < 100) break;
    page++;
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupData = {
    timestamp: new Date().toISOString(),
    store: url,
    shipping_zones: zonesData,
    products_count: products.length,
    products: products
  };

  const backupPath = `${backupDir}/backup_${timestamp}.json`;
  fs.writeFileSync(backupPath, JSON.stringify(backupData, null, 2));
  console.log(`✅ Kopia zapasowa zapisana: ${backupPath} (Produktów: ${products.length})`);
}

makeBackup().catch(console.error);
