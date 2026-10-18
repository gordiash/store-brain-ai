import https from 'https';

https.get('https://naturaintimo.com/product/bra-soft-gorsenia-k-441-1-luisse-black/', (res) => {
  let data = '';
  res.on('data', (chunk) => (data += chunk));
  res.on('end', () => {
    const jsonLdMatches = data.match(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi) || [];
    console.log('Total JSON-LD blocks found:', jsonLdMatches.length);
    jsonLdMatches.forEach((m, idx) => {
      console.log(`\n--- Block ${idx + 1} ---`);
      console.log(m);
    });
  });
});
