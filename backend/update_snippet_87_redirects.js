import dotenv from 'dotenv';
dotenv.config();

const wpUser = process.env.WP_ADMIN_USER;
const wpPass = process.env.WP_APP_PASSWORD;
if (!wpUser || !wpPass) {
  throw new Error('Brak poświadczeń WP_ADMIN_USER lub WP_APP_PASSWORD w .env');
}

const auth = Buffer.from(`${wpUser}:${wpPass}`).toString('base64');
const url = process.env.WOOCOMMERCE_URL || 'https://naturaintimo.com';

const updatedCode = `/**
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

// 2. 301 Redirects for Legacy Polish, Aliases & 404 Pages
add_action('init', function() {
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
        '/returns-exchanges' => '/refund-policy/',
        '/returns' => '/refund-policy/',
        '/kontakt' => '/contact-customer-care/',
        '/contact' => '/contact-customer-care/',
        '/faq' => '/frequently-asked-questions/',
        '/regulamin' => '/terms-conditions-usa-canada/',
        '/terms' => '/terms-conditions-usa-canada/',
        '/terms-and-conditions' => '/terms-conditions-usa-canada/',
        '/polityka-prywatnosci' => '/privacy-policy-usa-canada/',
        '/privacy-policy' => '/privacy-policy-usa-canada/'
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

async function updateSnippet() {
  const res = await fetch(`${url}/wp-json/code-snippets/v1/snippets/87`, {
    method: 'PUT',
    headers: {
      'Authorization': 'Basic ' + auth,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: 'Natura Intimo – SEO & GSC Redirection & Sitemap Sanitizer',
      code: updatedCode,
      active: true
    })
  });
  const data = await res.json();
  console.log('Snippet #87 updated successfully! Active:', data.active);
}

updateSnippet().catch(console.error);
