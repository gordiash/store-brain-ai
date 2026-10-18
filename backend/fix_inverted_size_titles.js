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

const updates = [
  {
    id: 3684,
    oldName: 'Gaia Isla Semi Soft Bra Black Size Range 80B-65J',
    newName: 'Gaia Isla Semi-Soft Bra Black 65J–80B'
  },
  {
    id: 1193,
    oldName: 'Gaia Ariarosa BS 005 Charlotte Soft Bra Beige 100C-80L',
    newName: 'Gaia Ariarosa BS 005 Charlotte Soft Bra Beige 80L–100C'
  },
  {
    id: 828,
    oldName: 'Gaia Ariarosa Semi-Soft Bra Black 95B-70J',
    newName: 'Gaia Ariarosa Semi-Soft Bra Black 70J–95B'
  },
  {
    id: 492,
    oldName: 'Gorsenia Luisse Soft Bra Beige 105D-90J',
    newName: 'Gorsenia Luisse Soft Bra Beige 90J–105D'
  },
  {
    id: 3674,
    oldName: 'Gorsenia Paradise Brazilian panties Black M-2XL',
    newName: 'Gorsenia Paradise Brazilian Briefs Black M–2XL'
  },
  {
    id: 2471,
    oldName: 'Mefemi Petra Brazilian panties Black XL',
    newName: 'Mefemi Petra Brazilian Briefs Black XL'
  },
  {
    id: 1517,
    oldName: 'Gorsenia K 649 Alicante Brazilian Panties Beige 2XL',
    newName: 'Gorsenia K 649 Alicante Brazilian Briefs Beige 2XL'
  }
];

async function applyTitleFixes() {
  console.log('--- Rozpoczynam korektę odwróconych zakresów rozmiarów i nazewnictwa w tytułach ---');
  const trackerFile = 'backend/usa_canada_tracker.json';
  let tracker = {};
  if (fs.existsSync(trackerFile)) {
    try {
      tracker = JSON.parse(fs.readFileSync(trackerFile, 'utf-8'));
    } catch (e) {
      console.warn('Nie udało się załadować trackera, tworzę nowy obiekt');
    }
  }
  if (!tracker.title_corrections) {
    tracker.title_corrections = [];
  }

  for (const item of updates) {
    console.log(`Aktualizuję produkt ID ${item.id}: "${item.oldName}" -> "${item.newName}"...`);
    const res = await fetch(`${url}/wp-json/wc/v3/products/${item.id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({
        name: item.newName
      })
    });

    if (!res.ok) {
      console.error(`Błąd aktualizacji produktu ID ${item.id}: HTTP ${res.status}`);
      const errText = await res.text();
      console.error(errText);
      continue;
    }

    const data = await res.json();
    console.log(`Sukces! Zaktualizowano ID ${data.id} na: "${data.name}"`);
    tracker.title_corrections.push({
      id: item.id,
      oldName: item.oldName,
      newName: data.name,
      updatedAt: new Date().toISOString()
    });
  }

  fs.writeFileSync(trackerFile, JSON.stringify(tracker, null, 2), 'utf-8');
  console.log(`Zapisano zmiany do trackera: ${trackerFile}`);
}

applyTitleFixes().catch(console.error);
