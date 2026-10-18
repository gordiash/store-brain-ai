import dotenv from 'dotenv';
dotenv.config();

const ck = process.env.WOOCOMMERCE_CONSUMER_KEY;
const cs = process.env.WOOCOMMERCE_CONSUMER_SECRET;
const url = process.env.WOOCOMMERCE_URL || 'https://naturaintimo.com';

async function testCartWithItems() {
  console.log('--- Testowanie koszyka z dodanymi produktami ---');

  // 1. Pobierz wariant produktu 562 (biustonosz za $74.99)
  const vRes = await fetch(`${url}/wp-json/wc/v3/products/562/variations?per_page=1`);
  const vars = await vRes.json();
  const varId = vars[0].id;
  console.log(`Pobrano wariant ID ${varId} (Cena: $${vars[0].regular_price})`);

  // 2. Dodaj 2 sztuki do koszyka (2 x $74.99 = $149.98 lub 3 sztuki = $224.97)
  const addUrl = `${url}/?add-to-cart=${varId}&quantity=3`;
  const addRes = await fetch(addUrl, {
    redirect: 'manual'
  });

  const cookies = addRes.headers.getSetCookie ? addRes.headers.getSetCookie() : [addRes.headers.get('set-cookie')];
  const cookieHeader = cookies.map(c => c.split(';')[0]).join('; ');
  console.log('Dodano produkty do koszyka, status:', addRes.status);
  console.log('Otrzymane cookies sesji:', cookieHeader ? 'TAK' : 'BRAK');

  // 3. Pobierz stronę koszyka z tą sesją
  const cartRes = await fetch(`${url}/cart-usa-canada/`, {
    headers: {
      'Cookie': cookieHeader,
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
    }
  });

  console.log('Odpowiedź koszyka status:', cartRes.status);
  const html = await cartRes.text();

  if (html.includes('There has been a critical error on this website')) {
    console.error('❌ BŁĄD KRYTYCZNY NADAL WYSTĘPUJE W KOSZYKU!');
    const match = html.match(/class="wp-die-message">([^<]+)/);
    if (match) console.error('Komunikat:', match[1]);
  } else {
    console.log('✅ SUKCES! Koszyk załadował się całkowicie bez błędów!');
    if (html.includes('ni-usa-perks-bar')) {
      console.log('✅ Pasek postępu (ni-usa-perks-bar) renderuje się poprawnie z produktami w koszyku!');
    }
    if (html.includes('cart_item')) {
      console.log('✅ Pozycje w koszyku są widoczne!');
    }
  }

  // 4. Pobierz stronę kasy z tą sesją
  const chRes = await fetch(`${url}/checkout-usa-canada/`, {
    headers: {
      'Cookie': cookieHeader,
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
    }
  });
  console.log('Odpowiedź kasy status:', chRes.status);
  const chHtml = await chRes.text();
  if (chHtml.includes('There has been a critical error on this website')) {
    console.error('❌ BŁĄD KRYTYCZNY NA STRONIE KASY!');
  } else {
    console.log('✅ SUKCES! Kasa ładuje się czysto i poprawnie!');
  }
}

testCartWithItems().catch(console.error);
