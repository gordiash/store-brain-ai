import https from 'https';

https.get('https://naturaintimo.com/', (res) => {
  let data = '';
  res.on('data', (chunk) => (data += chunk));
  res.on('end', () => {
    console.log('--- HOMEPAGE AUDIT ---');
    console.log('HTTP Status:', res.statusCode);
    console.log('LiteSpeed Cache:', res.headers['x-litespeed-cache']);
    console.log('Content-Encoding:', res.headers['content-encoding']);

    // Check Preconnects
    const preconnects = data.match(/<link [^>]*rel=['"]preconnect['"][^>]*>/gi) || [];
    console.log('\nPreconnect tags found (' + preconnects.length + '):');
    preconnects.forEach((t) => console.log('  ', t));

    // Check Preloads
    const preloads = data.match(/<link [^>]*rel=['"]preload['"][^>]*>/gi) || [];
    console.log('\nPreload tags found (' + preloads.length + '):');
    preloads.forEach((t) => console.log('  ', t));

    // Check Logo
    const logo = data.match(/<img[^>]*custom-logo[^>]*>/i);
    console.log('\nLogo Tag:');
    console.log('  ', logo ? logo[0] : 'Not found');

    // Check Deferred Scripts
    const deferred = data.match(/<script [^>]*defer[^>]*>/gi) || [];
    console.log('\nDeferred Scripts count:', deferred.length);
    deferred.slice(0, 5).forEach((t) => console.log('  ', t.slice(0, 100) + '...'));

    // Check Cart Fragments
    const hasCartFragments = data.includes('cart-fragments');
    console.log('\nCart fragments enqueued on homepage:', hasCartFragments ? 'YES' : 'NO (Successfully Dequeued!)');
  });
});
