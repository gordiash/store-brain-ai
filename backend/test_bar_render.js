async function inspectCart() {
  const addRes = await fetch('https://naturaintimo.com/?add-to-cart=4710&quantity=2', { redirect: 'manual' });
  const cookies = addRes.headers.getSetCookie ? addRes.headers.getSetCookie() : [addRes.headers.get('set-cookie')];
  const cookieHeader = cookies.map(c => c.split(';')[0]).join('; ');

  const cartRes = await fetch('https://naturaintimo.com/cart-usa-canada/', {
    headers: { 'Cookie': cookieHeader }
  });
  const html = await cartRes.text();
  console.log('Cart HTML length:', html.length);

  // Look for any hooks or shortcodes
  console.log('Has woocommerce-cart-form:', html.includes('woocommerce-cart-form'));
  console.log('Has [woocommerce_cart]:', html.includes('[woocommerce_cart]'));
  console.log('Has "VIP Status":', html.includes('VIP Status'));
  console.log('Has "Free DHL Express":', html.includes('Free DHL Express'));

  // If there's "VIP Status", find where it is!
  const vipIdx = html.indexOf('VIP Status');
  if (vipIdx !== -1) {
    console.log('VIP snippet:', html.substring(vipIdx - 100, vipIdx + 200));
  }
}
inspectCart().catch(console.error);
