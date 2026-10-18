import axios from 'axios';

async function test() {
  const r = await axios.get('https://naturaintimo.com/produkt/bra-semi-soft-ava-2110/?attribute_color=White&attribute_size=95D&nocache=' + Date.now());
  const dlMatches = r.data.match(/dataLayer\.push\(([\s\S]*?)\);/g);
  console.log('DataLayer pushes found on product page:', dlMatches ? dlMatches.length : 0);
  if (dlMatches) {
    dlMatches.forEach(m => console.log(m.slice(0, 200)));
  }
}
test().catch(console.error);
