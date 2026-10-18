import https from 'https';

https.get('https://naturaintimo.com/product/bra-soft-ava-2271-divine-champagne-wine/', (res) => {
  let data = '';
  res.on('data', (chunk) => (data += chunk));
  res.on('end', () => {
    console.log('--- PRODUCT PAGE AUDIT ---');
    console.log('Status:', res.statusCode);
    console.log('LiteSpeed Cache:', res.headers['x-litespeed-cache']);
    const preloads = data.match(/<link [^>]*rel=['"]preload['"][^>]*>/gi) || [];
    console.log('\nPreload tags (' + preloads.length + '):');
    preloads.forEach((p) => console.log('  ', p));

    const mainImg = data.match(/<img[^>]*wp-post-image[^>]*>/i);
    console.log('\nMain Product Image Tag:');
    console.log(mainImg ? mainImg[0] : 'Not found');
  });
});
