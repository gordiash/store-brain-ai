import axios from 'axios';

async function main() {
  const plPages = [
    'https://naturaintimo.com/sklep/',
    'https://naturaintimo.com/o-nas/',
    'https://naturaintimo.com/tabele-rozmiarow/',
    'https://naturaintimo.com/dostawa-i-platnosci/',
    'https://naturaintimo.com/zwroty-i-reklamacje/',
    'https://naturaintimo.com/kontakt/',
    'https://naturaintimo.com/privacy-policy/'
  ];

  console.log('--- Inspecting Old Polish Pages ---');
  for (const u of plPages) {
    try {
      const res = await axios.get(u);
      const html = res.data;
      const canMatch = html.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/i);
      const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
      const robotsMatch = html.match(/<meta\s+name=["']robots["']\s+content=["']([^"']+)["']/i);
      console.log(`URL: ${u}`);
      console.log(`  Title: ${titleMatch ? titleMatch[1] : 'NONE'}`);
      console.log(`  Canonical: ${canMatch ? canMatch[1] : 'NONE'}`);
      console.log(`  Robots: ${robotsMatch ? robotsMatch[1] : 'NONE'}`);
    } catch (e) {
      console.log(`URL: ${u} -> Error: ${e.message}`);
    }
  }

  // Check product sitemap
  console.log('\n--- Checking Product Sitemap (first 5 items) ---');
  const pSm = await axios.get('https://naturaintimo.com/wp-sitemap-posts-product-1.xml');
  const pLocs = (pSm.data.match(/<loc>([^<]+)<\/loc>/g) || []).map(l => l.replace(/<\/?loc>/g, ''));
  console.log(`Total products in sitemap: ${pLocs.length}`);
  for (const pu of pLocs.slice(0, 5)) {
    const pr = await axios.get(pu, { maxRedirects: 0, validateStatus: () => true });
    console.log(`Product: ${pu} -> Status: ${pr.status}`);
  }
}

main().catch(console.error);
