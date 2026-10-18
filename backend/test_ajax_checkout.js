import dotenv from 'dotenv';
dotenv.config();

const url = process.env.WOOCOMMERCE_URL || 'https://naturaintimo.com';

async function testAjaxCheckout() {
  console.log('--- Testing AJAX Checkout update_order_review ---');

  // 1. Add item to cart to create session
  const addRes = await fetch(url + '/cart/?add-to-cart=4710', {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
    redirect: 'manual'
  });
  const cookies = addRes.headers.getSetCookie ? addRes.headers.getSetCookie() : [addRes.headers.get('set-cookie')];
  const cookieHeader = cookies.map(c => c.split(';')[0]).join('; ');

  // 1b. Fetch checkout to get nonce
  const coRes = await fetch(url + '/checkout/', {
    headers: { 'Cookie': cookieHeader, 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
  });
  const coHtml = await coRes.text();
  const nonceMatch = coHtml.match(/update_order_review_nonce":"([a-f0-9]+)"/);
  const nonce = nonceMatch ? nonceMatch[1] : '';
  console.log('Found nonce:', nonce);

  // 2. Simulate US address in checkout
  const formDataUS = new URLSearchParams({
    security: nonce,
    payment_method: 'ppcp-gateway',
    country: 'US',
    state: 'NY',
    postcode: '10001',
    city: 'New York',
    address: '5th Ave',
    address_2: '',
    s_country: 'US',
    s_state: 'NY',
    s_postcode: '10001',
    s_city: 'New York',
    s_address: '5th Ave',
    s_address_2: '',
    has_full_address: 'true',
    post_data: 'billing_country=US&billing_state=NY&billing_postcode=10001&billing_city=New+York&shipping_country=US&shipping_state=NY&shipping_postcode=10001&shipping_city=New+York'
  });

  const ajaxResUS = await fetch(url + '/?wc-ajax=update_order_review', {
    method: 'POST',
    headers: {
      'Cookie': cookieHeader,
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'X-Requested-With': 'XMLHttpRequest',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
    },
    body: formDataUS.toString()
  });

  const ajaxDataUS = await ajaxResUS.json();
  const fragmentsUS = ajaxDataUS.fragments || {};
  const orderReviewUS = fragmentsUS['.woocommerce-checkout-review-order-table'] || JSON.stringify(fragmentsUS);

  console.log('US Checkout fragments contains 19.99:', orderReviewUS.includes('19.99'));
  console.log('US Checkout fragments contains 24.99:', orderReviewUS.includes('24.99'));

  const matchLinesUS = orderReviewUS.match(/<ul id="shipping_method"[\s\S]*?<\/ul>/);
  if (matchLinesUS) {
    console.log('\nShipping methods rendered for US:\n', matchLinesUS[0].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' '));
  }

  // 3. Simulate Canada (CA) address
  const formDataCA = new URLSearchParams({
    security: nonce,
    country: 'CA',
    state: 'ON',
    postcode: 'M5V 2T6',
    city: 'Toronto',
    address: 'Bay St',
    s_country: 'CA',
    s_state: 'ON',
    s_postcode: 'M5V 2T6',
    s_city: 'Toronto',
    s_address: 'Bay St',
    has_full_address: 'true',
    post_data: 'billing_country=CA&billing_state=ON&billing_postcode=M5V+2T6&billing_city=Toronto&shipping_country=CA&shipping_state=ON&shipping_postcode=M5V+2T6&shipping_city=Toronto'
  });

  const ajaxResCA = await fetch(url + '/?wc-ajax=update_order_review', {
    method: 'POST',
    headers: {
      'Cookie': cookieHeader,
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'X-Requested-With': 'XMLHttpRequest',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
    },
    body: formDataCA.toString()
  });
  const ajaxDataCA = await ajaxResCA.json();
  const orderReviewCA = (ajaxDataCA.fragments || {})['.woocommerce-checkout-review-order-table'] || '';
  console.log('\nCA Checkout fragments contains 19.99:', orderReviewCA.includes('19.99'));
  console.log('CA Checkout fragments contains 24.99:', orderReviewCA.includes('24.99'));
  const matchLinesCA = orderReviewCA.match(/<ul id="shipping_method"[\s\S]*?<\/ul>/);
  if (matchLinesCA) {
    console.log('Shipping methods rendered for CA:\n', matchLinesCA[0].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' '));
  }

  // 4. Simulate Poland (PL) address
  const formDataPL = new URLSearchParams({
    security: nonce,
    country: 'PL',
    state: '',
    postcode: '10-747',
    city: 'Olsztyn',
    address: 'Tuwima 26',
    s_country: 'PL',
    s_state: '',
    s_postcode: '10-747',
    s_city: 'Olsztyn',
    s_address: 'Tuwima 26',
    has_full_address: 'true',
    post_data: 'billing_country=PL&billing_postcode=10-747&billing_city=Olsztyn&shipping_country=PL&shipping_postcode=10-747&shipping_city=Olsztyn'
  });

  const ajaxResPL = await fetch(url + '/?wc-ajax=update_order_review', {
    method: 'POST',
    headers: {
      'Cookie': cookieHeader,
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'X-Requested-With': 'XMLHttpRequest',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
    },
    body: formDataPL.toString()
  });
  const ajaxDataPL = await ajaxResPL.json();
  const orderReviewPL = (ajaxDataPL.fragments || {})['.woocommerce-checkout-review-order-table'] || '';
  console.log('\nPL Checkout fragments contains 19.99:', orderReviewPL.includes('19.99'));
  console.log('PL Checkout fragments contains 24.99:', orderReviewPL.includes('24.99'));
  const matchLinesPL = orderReviewPL.match(/<ul id="shipping_method"[\s\S]*?<\/ul>/);
  if (matchLinesPL) {
    console.log('Shipping methods rendered for PL:\n', matchLinesPL[0].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' '));
  }
}

testAjaxCheckout().catch(console.error);
