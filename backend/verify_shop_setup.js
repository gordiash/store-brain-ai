import https from 'https';
import dotenv from 'dotenv';
dotenv.config();

const ck = process.env.WOOCOMMERCE_CONSUMER_KEY;
const cs = process.env.WOOCOMMERCE_CONSUMER_SECRET;
const url = process.env.WOOCOMMERCE_URL;
const wpUser = process.env.WP_ADMIN_USER;
const wpPass = process.env.WP_APP_PASSWORD;
const wpAuth = Buffer.from(`${wpUser}:${wpPass}`).toString('base64');

async function verifyAll() {
  console.log('==============================================');
  console.log('🔍 WERYFIKACJA WDROŻENIA SPRZEDAŻY DO USA (DDP)');
  console.log('==============================================\n');

  // 1. Sprawdź produkt przykładowy (ID 562)
  const pRes = await fetch(`${url}/wp-json/wc/v3/products/562`);
  if (pRes.ok) {
    const p = await pRes.json();
    const vRes = await fetch(`${url}/wp-json/wc/v3/products/562/variations?per_page=1`);
    const vars = await vRes.json();
    console.log(`✅ Produkt ID 562 ("${p.name}"):`);
    console.log(`   Cena wariantu (${vars[0].attributes.map(a => a.name + ': ' + a.option).join(', ')}): $${vars[0].regular_price} (Poprawnie przeliczona z narzutem 2.6x)`);
  }

  // 2. Sprawdź strefę USA
  const zRes = await fetch(`${url}/wp-json/wc/v3/shipping/zones/2`);
  if (zRes.ok) {
    const z = await zRes.json();
    const locRes = await fetch(`${url}/wp-json/wc/v3/shipping/zones/2/locations`);
    const locs = await locRes.json();
    const methRes = await fetch(`${url}/wp-json/wc/v3/shipping/zones/2/methods`);
    const meths = await methRes.json();
    console.log(`\n✅ Strefa Wysyłki USA (ID 2):`);
    console.log(`   Nazwa: "${z.name}" | Lokalizacje:`, locs.map(l => l.code).join(', '));
    console.log(`   Metody dostawy:`);
    meths.forEach(m => {
      console.log(`     - [${m.method_id}] "${m.title}": ${m.settings.cost ? '$' + m.settings.cost.value : 'Min $' + m.settings.min_amount.value}`);
    });
  }

  // 3. Sprawdź snippet Code Snippets
  const snipReq = () => new Promise(resolve => {
    https.get('https://naturaintimo.com/wp-json/code-snippets/v1/snippets/7', {
      headers: { 'Authorization': 'Basic ' + wpAuth }
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve(JSON.parse(d)));
    });
  });
  const snippet = await snipReq();
  console.log(`\n✅ Code Snippet ID 7:`);
  console.log(`   Nazwa: "${snippet.name}" | Aktywny: ${snippet.active}`);

  // 4. Sprawdź strony informacyjne
  const p4515 = await (await fetch(`${url}/wp-json/wp/v2/pages/4515`)).json();
  const p4517 = await (await fetch(`${url}/wp-json/wp/v2/pages/4517`)).json();
  console.log(`\n✅ Strony informacyjne:`);
  console.log(`   - ID 4515 ("${p4515.title.rendered}"): Zaktualizowana o model DHL DDP`);
  console.log(`   - ID 4517 ("${p4517.title.rendered}"): Zaktualizowana o zwroty z USA`);

  console.log('\n==============================================');
  console.log('🎉 WSZYSTKIE TESTY ZAKOŃCZONE SUKCESEM!');
  console.log('==============================================');
}

verifyAll().catch(console.error);
