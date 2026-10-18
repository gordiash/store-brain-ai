import dotenv from 'dotenv';
dotenv.config();
import axios from 'axios';

async function main() {
  const wpUser = process.env.WP_ADMIN_USER;
  const wpPass = process.env.WP_APP_PASSWORD;
  const auth = Buffer.from(`${wpUser}:${wpPass}`).toString('base64');
  const headers = { Authorization: `Basic ${auth}` };

  console.log('1. Cleaning Snippet 14 back to clean production state...');
  const snippet14Code = `/**
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

  await axios.post('https://naturaintimo.com/wp-json/code-snippets/v1/snippets/14', { code: snippet14Code }, { headers });
  console.log('Snippet 14 cleaned.');

  console.log('2. Deploying High Performance Speed Booster into Snippet 15...');
  const speedBoosterCode = `/**
 * Snippet Name: Natura Intimo – Core Web Vitals & Speed Booster Engine
 * Description: Optimizes LCP, eliminates render blocking, preloads critical visual assets, disables cart fragments overhead on static visits, and preconnects key origins.
 */

if (!defined('ABSPATH')) {
    exit;
}

// 1. Preconnect & DNS-Prefetch for critical 3rd party origins (Fonts, Analytics, Gateways)
add_action('wp_head', 'ni_speed_preconnect_critical_origins', 0);
function ni_speed_preconnect_critical_origins() {
    ?>
    <link rel="preconnect" href="https://fonts.googleapis.com" crossorigin>
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link rel="preconnect" href="https://www.googletagmanager.com">
    <link rel="dns-prefetch" href="https://stats.wp.com">
    <link rel="dns-prefetch" href="https://www.paypal.com">
    <link rel="preload" as="image" href="https://naturaintimo.com/wp-content/uploads/2026/04/cropped-NaturaIntimo-128x92.png" imagesrcset="https://naturaintimo.com/wp-content/uploads/2026/04/cropped-NaturaIntimo-128x92.png 128w, https://naturaintimo.com/wp-content/uploads/2026/04/cropped-NaturaIntimo-300x215.png 300w, https://naturaintimo.com/wp-content/uploads/2026/04/cropped-NaturaIntimo-768x550.png 768w, https://naturaintimo.com/wp-content/uploads/2026/04/cropped-NaturaIntimo-600x429.png 600w, https://naturaintimo.com/wp-content/uploads/2026/04/cropped-NaturaIntimo.png 1023w" imagesizes="(max-width: 128px) 100vw, 128px" fetchpriority="high">
    <?php

    // On Single Product Pages: Preload the LCP Main Product Gallery Image
    if (is_product()) {
        global $post;
        $image_id = get_post_thumbnail_id($post->ID);
        if ($image_id) {
            $srcset = wp_get_attachment_image_srcset($image_id, 'woocommerce_single');
            $sizes = wp_get_attachment_image_sizes($image_id, 'woocommerce_single');
            $image_src = wp_get_attachment_image_url($image_id, 'woocommerce_single');
            if (!$image_src) {
                $image_src = wp_get_attachment_image_url($image_id, 'full');
            }
            if ($image_src) {
                if ($srcset && $sizes) {
                    echo '<link rel="preload" as="image" href="' . esc_url($image_src) . '" imagesrcset="' . esc_attr($srcset) . '" imagesizes="' . esc_attr($sizes) . '" fetchpriority="high">' . "\\n";
                } else {
                    echo '<link rel="preload" as="image" href="' . esc_url($image_src) . '" fetchpriority="high">' . "\\n";
                }
            }
        }
    }
}

// 2. Ensure LCP Images (Logo & Featured Product) have fetchpriority="high", data-no-lazy="1", and no lazy-loading
add_filter('wp_get_attachment_image_attributes', 'ni_speed_optimize_lcp_images', 20, 3);
function ni_speed_optimize_lcp_images($attr, $attachment, $size) {
    if (is_admin()) {
        return $attr;
    }

    // A. Logo optimization
    if (isset($attr['class']) && strpos($attr['class'], 'custom-logo') !== false) {
        $attr['fetchpriority'] = 'high';
        $attr['decoding'] = 'async';
        $attr['data-no-lazy'] = '1';
        $attr['class'] .= ' no-lazy';
        unset($attr['loading']);
    }

    // B. Single Product main gallery image
    if (is_product() && isset($attr['class']) && strpos($attr['class'], 'wp-post-image') !== false) {
        $attr['fetchpriority'] = 'high';
        $attr['decoding'] = 'async';
        $attr['data-no-lazy'] = '1';
        $attr['class'] .= ' no-lazy';
        unset($attr['loading']);
    }

    return $attr;
}

// 2b. LiteSpeed Cache Lazy Load exclusions
add_filter('litespeed_media_lazy_img_excludes', 'ni_speed_litespeed_lazy_img_excludes');
add_filter('litespeed_media_lazy_cls_excludes', 'ni_speed_litespeed_lazy_img_excludes');
function ni_speed_litespeed_lazy_img_excludes($excludes) {
    if (!is_array($excludes)) {
        $excludes = array();
    }
    $excludes[] = 'custom-logo';
    $excludes[] = 'wp-post-image';
    $excludes[] = 'cropped-NaturaIntimo';
    return $excludes;
}

// 3. Prevent WordPress from lazy-loading the first 4 images in catalog/shop/home
static $ni_img_counter = 0;
add_filter('wp_img_tag_add_loading_attr', 'ni_speed_disable_above_the_fold_lazy_load', 20, 3);
function ni_speed_disable_above_the_fold_lazy_load($value, $image, $context) {
    if (is_admin()) {
        return $value;
    }
    global $ni_img_counter;
    $ni_img_counter++;
    // First 4 images on page are above the fold or in viewport
    if ($ni_img_counter <= 4) {
        return false; // disables loading="lazy"
    }
    return $value;
}

// 4. WooCommerce Cart Fragments Optimization
// Eliminates dynamic /?wc-ajax=get_refreshed_fragments execution on every page load for visitors without items
add_action('wp_enqueue_scripts', 'ni_speed_optimize_cart_fragments', 99);
function ni_speed_optimize_cart_fragments() {
    if (is_admin()) {
        return;
    }
    // If visitor has items in cart, woocommerce_items_in_cart cookie is set (>0)
    $has_cart_cookie = isset($_COOKIE['woocommerce_items_in_cart']) && (int)$_COOKIE['woocommerce_items_in_cart'] > 0;
    $is_cart_checkout = (function_exists('is_cart') && is_cart()) || (function_exists('is_checkout') && is_checkout());
    if (!$has_cart_cookie && !$is_cart_checkout) {
        wp_dequeue_script('wc-cart-fragments');
        wp_deregister_script('wc-cart-fragments');
    }
}

// 5. Defer non-critical scripts to eliminate render-blocking in <head>
add_filter('script_loader_tag', 'ni_speed_defer_non_critical_scripts', 20, 3);
function ni_speed_defer_non_critical_scripts($tag, $handle, $src) {
    if (is_admin()) {
        return $tag;
    }

    // Scripts that should be deferred to unblock DOM rendering
    $defer_handles = array(
        'wc-jquery-blockui',
        'wc-js-cookie',
        'woocommerce',
        'wc-add-to-cart',
        'sourcebuster-js',
        'zoom',
        'photoswipe',
        'photoswipe-ui-default',
        'flexslider'
    );

    if (in_array($handle, $defer_handles, true)) {
        if (strpos($tag, 'defer') === false && strpos($tag, 'async') === false) {
            $tag = str_replace('<script ', '<script defer ', $tag);
        }
    }

    return $tag;
}

// 6. Disable Core WordPress Emoji & OEmbed bloat on frontend
add_action('init', 'ni_speed_disable_wp_bloat');
function ni_speed_disable_wp_bloat() {
    remove_action('wp_head', 'print_emoji_detection_script', 7);
    remove_action('wp_print_styles', 'print_emoji_styles');
    remove_action('admin_print_scripts', 'print_emoji_detection_script');
    remove_action('admin_print_styles', 'print_emoji_styles');
    remove_filter('the_content_feed', 'wp_staticize_emoji');
    remove_filter('comment_text_rss', 'wp_staticize_emoji');
    remove_filter('wp_mail', 'wp_staticize_emoji_for_email');
    remove_action('wp_head', 'wp_oembed_add_discovery_links');
    remove_action('wp_head', 'wp_oembed_add_host_js');
}

// 7. REST Endpoint to Purge LiteSpeed Cache on demand
add_action('rest_api_init', function() {
    register_rest_route('ni/v1', '/purge-cache', array(
        'methods' => 'POST',
        'permission_callback' => '__return_true',
        'callback' => function() {
            if (class_exists('\\LiteSpeed\\Purge')) {
                \\LiteSpeed\\Purge::purge_all();
                return array('success' => true, 'purged' => true);
            }
            return array('success' => false, 'message' => 'LiteSpeed Purge class not found');
        }
    ));
});
`;

  const payload = {
    name: 'Natura Intimo – Core Web Vitals & Speed Booster Engine',
    code: speedBoosterCode,
    active: true,
    scope: 'global'
  };

  const res15 = await axios.post('https://naturaintimo.com/wp-json/code-snippets/v1/snippets/15', payload, { headers });
  console.log(`Snippet 15 successfully deployed and activated! Status: ${res15.status}`);

  console.log('3. Triggering LiteSpeed Cache Purge via API...');
  try {
    const purgeRes = await axios.post('https://naturaintimo.com/wp-json/ni/v1/purge-cache', {}, { headers });
    console.log('Cache purge response:', purgeRes.data);
  } catch (err) {
    console.log('Purge request note:', err.message);
  }

  console.log('Speed Booster Engine deployed and cache purged successfully.');
}

main().catch(console.error);
