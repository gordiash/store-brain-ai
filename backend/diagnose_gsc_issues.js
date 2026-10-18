import dotenv from 'dotenv';
dotenv.config();
import axios from 'axios';

async function main() {
  const wpUser = process.env.WP_ADMIN_USER;
  const wpPass = process.env.WP_APP_PASSWORD;
  const auth = Buffer.from(`${wpUser}:${wpPass}`).toString('base64');
  const headers = { Authorization: `Basic ${auth}` };

  console.log('=== GSC DIAGNOSTICS & AUDIT ===\n');

  // 1. Check Permalink Settings in WP
  const php = `add_action('wp_loaded', function() {
    if (isset($_GET['check_permalink_seo'])) {
      $permalinks = get_option('woocommerce_permalinks');
      $site_url = get_option('siteurl');
      $home_url = get_option('home');
      $blog_public = get_option('blog_public');
      header('Content-Type: application/json');
      echo json_encode([
        'permalinks' => $permalinks,
        'site_url' => $site_url,
        'home_url' => $home_url,
        'blog_public' => $blog_public
      ]);
      exit;
    }
  });`;

  const s = await axios.post('https://naturaintimo.com/wp-json/code-snippets/v1/snippets', {
    name: 'Check Permalink SEO', code: php, scope: 'global', active: true
  }, { headers });

  try {
    const res = await axios.get('https://naturaintimo.com/?check_permalink_seo=1');
    console.log('1. WooCommerce Permalinks & Core SEO settings:');
    console.log(JSON.stringify(res.data, null, 2));
  } finally {
    await axios.delete(`https://naturaintimo.com/wp-json/code-snippets/v1/snippets/${s.data.id}`, { headers });
  }

  // 2. Inspect Sitemap Index and child sitemaps
  console.log('\n2. Inspecting wp-sitemap.xml...');
  try {
    const smRes = await axios.get('https://naturaintimo.com/wp-sitemap.xml');
    console.log('wp-sitemap.xml content snippet:');
    console.log(smRes.data.slice(0, 800));
  } catch (e) {
    console.log('wp-sitemap error:', e.message);
  }

  // 3. Test Product & Category Canonicals and Redirects
  console.log('\n3. Testing Sample URLs for Canonicals, Robots, and Status:');
  const testUrls = [
    'https://naturaintimo.com/',
    'https://naturaintimo.com/product/bra-semi-soft-ava-2110/',
    'https://naturaintimo.com/produkt/bra-semi-soft-ava-2110/', // Old Polish URL
    'https://naturaintimo.com/shop/',
    'https://naturaintimo.com/product-category/bras/',
    'https://naturaintimo.com/cart-usa-canada/',
    'https://naturaintimo.com/checkout-usa-canada/',
    'https://naturaintimo.com/privacy-policy-usa-canada/',
    'https://naturaintimo.com/refund-policy/'
  ];

  for (const url of testUrls) {
    try {
      const res = await axios.get(url, { maxRedirects: 0, validateStatus: () => true });
      const html = typeof res.data === 'string' ? res.data : '';
      const canonicalMatch = html.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/i);
      const robotsMatch = html.match(/<meta\s+name=["']robots["']\s+content=["']([^"']+)["']/i);
      const location = res.headers.location || '';
      console.log(`URL: ${url}`);
      console.log(`  -> Status: ${res.status} ${location ? 'Redirects to: ' + location : ''}`);
      if (canonicalMatch) console.log(`  -> Canonical: ${canonicalMatch[1]}`);
      if (robotsMatch) console.log(`  -> Robots: ${robotsMatch[1]}`);
    } catch (err) {
      console.log(`URL: ${url} -> Error: ${err.message}`);
    }
  }
}

main().catch(console.error);
