import dotenv from 'dotenv';
dotenv.config();
import axios from 'axios';

async function main() {
  const wpUser = process.env.WP_ADMIN_USER;
  const wpPass = process.env.WP_APP_PASSWORD;
  const auth = Buffer.from(`${wpUser}:${wpPass}`).toString('base64');
  const headers = { Authorization: `Basic ${auth}` };

  const phpSnippet = `/**
 * Snippet Name: Natura Intimo – SEO & GSC Redirection & Sitemap Sanitizer
 * Description: 
 * 1. 301 redirects old Polish static pages & legacy shop URLs to active English USA/CA pages.
 * 2. Excludes cart, checkout, and my-account from XML sitemaps to prevent GSC noindex warnings.
 * 3. 301 redirects /shop/ to /new-arrivals/ (preventing 404).
 */

if (!defined('ABSPATH')) {
    exit;
}

// 1. Exclude Cart, Checkout, My Account from WordPress XML Sitemaps
add_filter('wp_sitemaps_posts_query_args', function($args, $post_type) {
    if ($post_type === 'page') {
        // Find IDs of cart, checkout, my-account
        $exclude_slugs = ['cart-usa-canada', 'checkout-usa-canada', 'my-account-usa-canada', 'koszyk', 'zamowienie', 'moje-konto'];
        $exclude_ids = [];
        foreach ($exclude_slugs as $slug) {
            $p = get_page_by_path($slug);
            if ($p) {
                $exclude_ids[] = $p->ID;
            }
        }
        if (!empty($exclude_ids)) {
            $args['post__not_in'] = array_merge($args['post__not_in'] ?? [], $exclude_ids);
        }
    }
    return $args;
}, 10, 2);

// 2. 301 Redirects for Legacy Polish & 404 Pages
add_action('template_redirect', function() {
    if (is_admin() || (defined('DOING_CRON') && DOING_CRON) || (defined('REST_REQUEST') && REST_REQUEST)) {
        return;
    }

    $uri = untrailingslashit(strtok($_SERVER['REQUEST_URI'], '?'));

    $redirect_map = [
        '/shop' => '/new-arrivals/',
        '/sklep' => '/new-arrivals/',
        '/o-nas' => '/about-natura-intimo/',
        '/tabele-rozmiarow' => '/size-guide/',
        '/dostawa-i-platnosci' => '/shipping-delivery/',
        '/zwroty-i-reklamacje' => '/refund-policy/',
        '/kontakt' => '/contact-customer-care/',
        '/regulamin' => '/terms-conditions-usa-canada/',
        '/polityka-prywatnosci' => '/privacy-policy-usa-canada/'
    ];

    if (isset($redirect_map[$uri])) {
        wp_safe_redirect(home_url($redirect_map[$uri]), 301);
        exit;
    }

    // Redirect legacy /produkt/... to /product/...
    if (strpos($uri, '/produkt/') === 0) {
        $new_path = str_replace('/produkt/', '/product/', $uri);
        wp_safe_redirect(home_url($new_path . '/'), 301);
        exit;
    }

    // Redirect legacy /kategoria-produktu/... to /product-category/...
    if (strpos($uri, '/kategoria-produktu/') === 0) {
        $new_path = str_replace('/kategoria-produktu/', '/product-category/', $uri);
        wp_safe_redirect(home_url($new_path . '/'), 301);
        exit;
    }
}, 1);
`;

  console.log('Deploying GSC SEO & Sitemap Sanitizer Snippet...');
  const res = await axios.get('https://naturaintimo.com/wp-json/code-snippets/v1/snippets', { headers });
  const existing = res.data.find(s => s.name && s.name.includes('SEO & GSC Redirection & Sitemap Sanitizer'));

  const payload = {
    name: 'Natura Intimo – SEO & GSC Redirection & Sitemap Sanitizer',
    code: phpSnippet,
    scope: 'global',
    active: true
  };

  if (existing) {
    console.log(`Updating Snippet #${existing.id}...`);
    await axios.put(`https://naturaintimo.com/wp-json/code-snippets/v1/snippets/${existing.id}`, payload, { headers });
    console.log(`Snippet #${existing.id} updated!`);
  } else {
    console.log('Creating new snippet...');
    const createRes = await axios.post('https://naturaintimo.com/wp-json/code-snippets/v1/snippets', payload, { headers });
    console.log(`Snippet #${createRes.data.id} created and activated!`);
  }

  // Purge LiteSpeed Cache
  try {
    await axios.post('https://naturaintimo.com/wp-json/code-snippets/v1/snippets', {
      name: 'Temp Flush LS',
      code: `add_action('init', function() { if (defined('LSCWP_V')) { do_action('litespeed_purge_all'); } });`,
      scope: 'global', active: true
    }, { headers }).then(async (temp) => {
      await axios.get('https://naturaintimo.com/');
      await axios.delete(`https://naturaintimo.com/wp-json/code-snippets/v1/snippets/${temp.data.id}`, { headers });
    });
  } catch (e) {}

  // Verify redirects and sitemap
  console.log('\n--- Verifying Redirects ---');
  const urlsToTest = [
    'https://naturaintimo.com/shop',
    'https://naturaintimo.com/sklep',
    'https://naturaintimo.com/o-nas',
    'https://naturaintimo.com/tabele-rozmiarow',
    'https://naturaintimo.com/zwroty-i-reklamacje'
  ];

  for (const u of urlsToTest) {
    const r = await axios.get(u, { maxRedirects: 0, validateStatus: () => true });
    console.log(`${u} -> Status: ${r.status}, Redirects to: ${r.headers.location || 'NONE'}`);
  }

  console.log('\n--- Verifying XML Sitemap Exclusions ---');
  const smCheck = await axios.get('https://naturaintimo.com/wp-sitemap-posts-page-1.xml?nocache=' + Date.now());
  const hasCart = smCheck.data.includes('cart-usa-canada');
  const hasCheckout = smCheck.data.includes('checkout-usa-canada');
  console.log('Cart page in sitemap:', hasCart ? 'STILL PRESENT' : 'EXCLUDED (CLEAN)');
  console.log('Checkout page in sitemap:', hasCheckout ? 'STILL PRESENT' : 'EXCLUDED (CLEAN)');
}

main().catch(console.error);
