import dotenv from 'dotenv';
dotenv.config();

const ck = process.env.WOOCOMMERCE_CONSUMER_KEY;
const cs = process.env.WOOCOMMERCE_CONSUMER_SECRET;
const url = process.env.WOOCOMMERCE_URL;

async function setupUsaShipping() {
  console.log('=== Konfiguracja Strefy Dostawy USA w WooCommerce ===');

  // 1. Zaktualizuj Strefę 2 na dedykowaną tylko dla USA
  const updateZoneRes = await fetch(`${url}/wp-json/wc/v3/shipping/zones/2`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'United States'
    })
  });
  console.log('Aktualizacja nazwy strefy:', updateZoneRes.status);

  // 2. Ustaw lokalizację wyłącznie na US (obejmuje wszystkie stany USA)
  const locRes = await fetch(`${url}/wp-json/wc/v3/shipping/zones/2/locations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify([
      { code: 'US', type: 'country' }
    ])
  });
  console.log('Aktualizacja lokalizacji (US only):', locRes.status);

  // 3. Zaktualizuj metodę Flat Rate (Instance 5) do DHL Express Worldwide
  const method5Res = await fetch(`${url}/wp-json/wc/v3/shipping/zones/2/methods/5`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: 'DHL Express Worldwide',
      settings: {
        title: 'DHL Express Worldwide',
        cost: '19.99'
      }
    })
  });
  console.log('Aktualizacja metody DHL Express ($19.99):', method5Res.status);

  // 4. Zaktualizuj metodę Free Shipping (Instance 9) do Free DHL Express Delivery
  const method9Res = await fetch(`${url}/wp-json/wc/v3/shipping/zones/2/methods/9`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: 'Free DHL Express Delivery (Orders over $150)',
      settings: {
        title: 'Free DHL Express Delivery (Orders over $150)',
        requires: 'min_amount',
        min_amount: '150'
      }
    })
  });
  console.log('Aktualizacja darmowej dostawy ($150):', method9Res.status);

  // 5. Utwórz osobną strefę dla Kanady (jeśli nie istnieje)
  const zonesRes = await fetch(`${url}/wp-json/wc/v3/shipping/zones`);
  const zones = await zonesRes.json();
  const hasCanada = zones.some(z => z.name === 'Canada');
  if (!hasCanada) {
    console.log('Tworzenie osobnej strefy dla Kanady...');
    const createCaRes = await fetch(`${url}/wp-json/wc/v3/shipping/zones`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Canada' })
    });
    if (createCaRes.ok) {
      const caZone = await createCaRes.json();
      await fetch(`${url}/wp-json/wc/v3/shipping/zones/${caZone.id}/locations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify([{ code: 'CA', type: 'country' }])
      });
      // Metoda płaska dla Kanady
      await fetch(`${url}/wp-json/wc/v3/shipping/zones/${caZone.id}/methods`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          method_id: 'flat_rate',
          settings: { title: 'Standard Tracked Shipping to Canada', cost: '19.99' }
        })
      });
      console.log('✅ Utworzono osobną strefę Canada (ID:', caZone.id, ')');
    }
  }

  console.log('=== Zakończono konfigurację stref dostawy ===');
}

setupUsaShipping().catch(console.error);
