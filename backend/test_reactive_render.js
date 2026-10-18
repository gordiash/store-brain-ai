import https from 'https';

async function testOneItemCart() {
  console.log('--- Testowanie paska dla 1 sztuki ($74.99) ---');

  const addRes = await fetch('https://naturaintimo.com/?add-to-cart=4710&quantity=1', { redirect: 'manual' });
  const cookies = addRes.headers.getSetCookie ? addRes.headers.getSetCookie() : [addRes.headers.get('set-cookie')];
  const cookieHeader = cookies.map(c => c.split(';')[0]).join('; ');

  const cartRes = await fetch('https://naturaintimo.com/cart-usa-canada/', {
    headers: { 'Cookie': cookieHeader }
  });
  const html = await cartRes.text();

  const idx = html.indexOf('ni-usa-perks-bar');
  if (idx !== -1) {
    const chunk = html.substring(idx - 20, idx + 800);
    const matchPct = chunk.match(/(\d+)%/);
    if (matchPct) console.log('Procent na pasku:', matchPct[1] + '%');
    const matchText = chunk.match(/class="ni-status-text"[^>]*>([\s\S]*?)<\/div>/);
    if (matchText) console.log('Tekst na pasku:', matchText[1].replace(/<[^>]+>/g, '').trim());
  }
}

testOneItemCart().catch(console.error);
