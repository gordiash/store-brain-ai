import dotenv from 'dotenv';
dotenv.config();
import axios from 'axios';

async function main() {
  const wpUser = process.env.WP_ADMIN_USER;
  const wpPass = process.env.WP_APP_PASSWORD;
  const auth = Buffer.from(`${wpUser}:${wpPass}`).toString('base64');
  const headers = { Authorization: `Basic ${auth}` };

  const snippetCode = `/**
 * Snippet Name: Natura Intimo – Enhanced Google Merchant & Schema.org Structured Data
 * Description: Injects shippingDetails (DHL Express Worldwide DDP) and hasMerchantReturnPolicy (30-day returns) into Product schema for Google Merchant & Rich Results.
 */

if (!defined('ABSPATH')) {
    exit;
}

// 0. Automatic 301 redirect for any legacy Polish /produkt/ URLs to /product/
add_action('init', 'ni_redirect_legacy_produkt_urls', 1);
function ni_redirect_legacy_produkt_urls() {
    $uri = $_SERVER['REQUEST_URI'] ?? '';
    if (strpos($uri, '/produkt/') !== false) {
        $clean_path = str_replace('/produkt/', '/product/', $uri);
        wp_safe_redirect(home_url($clean_path), 301);
        exit;
    }
}

add_filter('woocommerce_structured_data_product_offer', 'ni_enrich_schema_product_offer', 20, 2);
function ni_enrich_schema_product_offer($offer, $product) {
    if (!$offer || !is_array($offer)) {
        return $offer;
    }

    // 1. Shipping Details: DHL Express Worldwide DDP
    $offer['shippingDetails'] = array(
        '@type' => 'OfferShippingDetails',
        'shippingRate' => array(
            '@type' => 'MonetaryAmount',
            'value' => '19.99',
            'currency' => 'USD'
        ),
        'shippingDestination' => array(
            '@type' => 'DefinedRegion',
            'addressCountry' => 'US'
        ),
        'deliveryTime' => array(
            '@type' => 'ShippingDeliveryTime',
            'handlingTime' => array(
                '@type' => 'QuantitativeValue',
                'minValue' => 1,
                'maxValue' => 2,
                'unitCode' => 'DAY'
            ),
            'transitTime' => array(
                '@type' => 'QuantitativeValue',
                'minValue' => 2,
                'maxValue' => 4,
                'unitCode' => 'DAY'
            )
        )
    );

    // 2. Merchant Return Policy: 30-day window
    $offer['hasMerchantReturnPolicy'] = array(
        '@type' => 'MerchantReturnPolicy',
        'applicableCountry' => 'US',
        'returnPolicyCategory' => 'https://schema.org/MerchantReturnFiniteReturnWindow',
        'merchantReturnDays' => 30,
        'returnMethod' => 'https://schema.org/ReturnByMail',
        'returnFees' => 'https://schema.org/FreeReturn',
        'merchantReturnLink' => 'https://naturaintimo.com/refund-policy/'
    );

    return $offer;
}

// 3. Inject Meta Description & Hreflang SEO tags into wp_head (T-01 / T-02)
add_action('wp_head', 'ni_inject_seo_meta_tags', 1);
function ni_inject_seo_meta_tags() {
    if (is_front_page()) {
        ?>
<meta name="description" content="Shop authentic European lingerie crafted for full-bust fit, everyday elegance, and unmatched support. Express DHL shipping with guaranteed DDP duties pre-cleared." />
<link rel="alternate" hreflang="en-US" href="https://naturaintimo.com/" />
<link rel="alternate" hreflang="pl-PL" href="https://naturaintimo.com/pl/" />
<link rel="alternate" hreflang="x-default" href="https://naturaintimo.com/" />
        <?php
    }
}
`;

  const res = await axios.post('https://naturaintimo.com/wp-json/code-snippets/v1/snippets/14', { code: snippetCode }, { headers });
  console.log('Snippet 14 updated with 301 legacy redirect handler! Status:', res.status);
}

main().catch(console.error);
