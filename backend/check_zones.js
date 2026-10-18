import dotenv from 'dotenv';
dotenv.config();

const ck = process.env.WOOCOMMERCE_CONSUMER_KEY;
const cs = process.env.WOOCOMMERCE_CONSUMER_SECRET;
const url = process.env.WOOCOMMERCE_URL;

async function checkZones() {
  const res = await fetch(`${url}/wp-json/wc/v3/shipping/zones`);
  const zones = await res.json();
  console.log('ZONES:', JSON.stringify(zones, null, 2));

  for (const z of zones) {
    const locRes = await fetch(`${url}/wp-json/wc/v3/shipping/zones/${z.id}/locations`);
    const locs = await locRes.json();
    console.log(`Zone ${z.id} (${z.name}) LOCATIONS:`, JSON.stringify(locs, null, 2));

    const methRes = await fetch(`${url}/wp-json/wc/v3/shipping/zones/${z.id}/methods`);
    const meths = await methRes.json();
    console.log(`Zone ${z.id} (${z.name}) METHODS:`, JSON.stringify(meths, null, 2));
  }
}

checkZones().catch(console.error);
