import dotenv from 'dotenv';
dotenv.config();

const url = process.env.WOOCOMMERCE_URL || 'https://naturaintimo.com';

async function runTest() {
  console.log('Testing fresh cart session...');
  const addRes = await fetch(url + '/cart/?add-to-cart=4710', {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
    },
    redirect: 'manual'
  });
  const cookies = addRes.headers.getSetCookie ? addRes.headers.getSetCookie() : [addRes.headers.get('set-cookie')];
  const cookieHeader = cookies.map(c => c.split(';')[0]).join('; ');

  const cartRes = await fetch(url + '/cart/', {
    headers: {
      'Cookie': cookieHeader,
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
    }
  });
  const html = await cartRes.text();

  console.log('Contains 19.99 in cart HTML:', html.includes('19.99'));
  console.log('Contains 24.99 in cart HTML:', html.includes('24.99'));

  if (html.includes('19.99')) {
    let pos = 0;
    while ((pos = html.indexOf('19.99', pos)) !== -1) {
      console.log('\nFound 19.99 at pos', pos, ':');
      console.log(html.substring(Math.max(0, pos - 200), Math.min(html.length, pos + 200)).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' '));
      pos += 5;
    }
  }

  const shippingMatch = html.match(/<tr class="woocommerce-shipping-totals[\s\S]*?<\/tr>/);
  if (shippingMatch) {
    console.log('\nShipping row:\n', shippingMatch[0]);
  } else {
    const totalsMatch = html.match(/<div class="cart_totals[\s\S]*?<\/div>/);
    console.log('\nTotals snippet:\n', totalsMatch ? totalsMatch[0].substring(0, 1500) : 'Cart totals not found');
  }

  // Also test checkout page
  const checkoutRes = await fetch(url + '/checkout/', {
    headers: {
      'Cookie': cookieHeader,
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
    }
  });
  const checkoutHtml = await checkoutRes.text();
  const coShippingMatch = checkoutHtml.match(/<tr class="woocommerce-shipping-totals[\s\S]*?<\/tr>/);
  if (coShippingMatch) {
    console.log('\nCheckout shipping row:\n', coShippingMatch[0]);
  } else {
    console.log('\nCheckout shipping not found directly in initial HTML');
  }
}

runTest().catch(console.error);
