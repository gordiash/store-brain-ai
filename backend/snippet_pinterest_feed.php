<?php
/**
 * Snippet Name: Natura Intimo – Pinterest Product Catalog XML Feed Engine
 * Description: Generates a high-performance, compliant RSS 2.0 / Google Merchant XML product feed for Pinterest Catalogs.
 * Accessible at: https://naturaintimo.com/?pinterest_feed=1 and https://naturaintimo.com/pinterest-feed.xml
 */

if (!defined('ABSPATH')) {
    exit;
}

// 1. Rewrite rule for clean URL: /pinterest-feed.xml
add_action('init', 'ni_pinterest_catalog_rewrite_rule');
function ni_pinterest_catalog_rewrite_rule() {
    add_rewrite_rule('^pinterest-feed\.xml$', 'index.php?ni_pinterest_feed=1', 'top');
}

add_filter('query_vars', 'ni_pinterest_catalog_query_vars');
function ni_pinterest_catalog_query_vars($vars) {
    $vars[] = 'ni_pinterest_feed';
    return $vars;
}

// 2. Feed Generator Handler
add_action('template_redirect', 'ni_render_pinterest_catalog_feed');
function ni_render_pinterest_catalog_feed() {
    $is_feed_request = false;
    $uri = $_SERVER['REQUEST_URI'] ?? '';
    
    if (isset($_GET['pinterest_catalog']) || isset($_GET['pinterest_feed']) || get_query_var('ni_pinterest_feed') || strpos($uri, 'pinterest-feed.xml') !== false) {
        $is_feed_request = true;
    }

    if (!$is_feed_request) {
        return;
    }

    status_header(200);

    $include_variants = isset($_GET['variants']) && $_GET['variants'] == '1';
    $force_refresh = isset($_GET['refresh']) && $_GET['refresh'] == '1';
    $transient_key = $include_variants ? 'ni_pinterest_feed_variants' : 'ni_pinterest_feed_parent';

    if (!$force_refresh) {
        $cached_xml = get_transient($transient_key);
        if ($cached_xml) {
            header('Content-Type: application/xml; charset=utf-8');
            header('X-Robots-Tag: noindex, follow');
            header('X-Pinterest-Feed-Cache: HIT');
            echo $cached_xml;
            exit;
        }
    }

    // Build XML feed
    $output = '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
    $output .= '<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">' . "\n";
    $output .= '<channel>' . "\n";
    $output .= '  <title>' . esc_xml('Natura Intimo – European Full-Bust Lingerie') . '</title>' . "\n";
    $output .= '  <link>' . esc_url(home_url('/')) . '</link>' . "\n";
    $output .= '  <description>' . esc_xml('Official Pinterest Product Catalog for Natura Intimo. Authentic European full-bust bras, plus size lingerie and coordinated sets.') . '</description>' . "\n";

    $args = array(
        'status' => 'publish',
        'limit' => -1,
        'type' => array('simple', 'variable'),
        'orderby' => 'date',
        'order' => 'DESC'
    );
    $products = wc_get_products($args);

    foreach ($products as $product) {
        $product_id = $product->get_id();
        $title = $product->get_name();
        $description = wp_strip_all_tags($product->get_description() ?: $product->get_short_description());
        if (empty($description)) {
            $description = $title . ' - Authentic European luxury lingerie engineered for full-bust support.';
        }
        $permalink = $product->get_permalink();
        
        // Brand detection
        $brand = '';
        $brand_terms = wp_get_post_terms($product_id, 'pa_brand', array('fields' => 'names'));
        if (!empty($brand_terms) && !is_wp_error($brand_terms)) {
            $brand = $brand_terms[0];
        } else {
            foreach (array('Gorsenia', 'Gaia', 'Ava', 'Mefemi', 'Alles', 'Julimex') as $b) {
                if (stripos($title, $b) !== false) {
                    $brand = $b;
                    break;
                }
            }
        }
        if (empty($brand)) {
            $brand = 'Natura Intimo';
        }

        // Category
        $cats = wp_get_post_terms($product_id, 'product_cat', array('fields' => 'names'));
        $cat_name = (!empty($cats) && !is_wp_error($cats)) ? implode(' > ', $cats) : 'Lingerie';
        
        $google_cat = 'Apparel & Accessories > Clothing > Underwear & Socks > Lingerie';
        if (stripos($title, 'bra') !== false || stripos($cat_name, 'bra') !== false) {
            $google_cat = 'Apparel & Accessories > Clothing > Underwear & Socks > Lingerie > Bras';
        } elseif (stripos($title, 'brief') !== false || stripos($title, 'panties') !== false || stripos($cat_name, 'panties') !== false) {
            $google_cat = 'Apparel & Accessories > Clothing > Underwear & Socks > Lingerie > Panties';
        }

        // Images
        $img_id = $product->get_image_id();
        $image_link = $img_id ? wp_get_attachment_image_url($img_id, 'full') : '';
        if (!$image_link) {
            continue; // Skip products without images
        }

        $gallery_ids = $product->get_gallery_image_ids();
        $additional_images = array();
        if (!empty($gallery_ids)) {
            foreach (array_slice($gallery_ids, 0, 5) as $gid) {
                $url = wp_get_attachment_image_url($gid, 'full');
                if ($url && $url !== $image_link) {
                    $additional_images[] = $url;
                }
            }
        }

        $price = $product->get_price();
        if (!$price) {
            $price = $product->get_regular_price();
        }
        $price_formatted = number_format((float)$price, 2, '.', '') . ' USD';

        // Color attribute
        $color = $product->get_attribute('color') ?: $product->get_attribute('pa_color');
        if (!$color) {
            foreach (array('Black', 'White', 'Beige', 'Burgundy', 'Navy', 'Pink', 'Red', 'Emerald', 'Wine') as $c) {
                if (stripos($title, $c) !== false) {
                    $color = $c;
                    break;
                }
            }
        }

        if ($include_variants && $product->is_type('variable')) {
            $variations = $product->get_available_variations();
            foreach ($variations as $var) {
                $var_id = $var['variation_id'];
                $var_sku = $var['sku'] ?: 'NI-' . $var_id;
                $var_price = $var['display_price'];
                $var_price_formatted = number_format((float)$var_price, 2, '.', '') . ' USD';
                $var_avail = $var['is_in_stock'] ? 'in stock' : 'out of stock';
                $var_img = !empty($var['image']['url']) ? $var['image']['url'] : $image_link;
                
                $size = '';
                if (!empty($var['attributes'])) {
                    foreach ($var['attributes'] as $attr_k => $attr_v) {
                        if (stripos($attr_k, 'size') !== false) {
                            $size = $attr_v;
                        }
                    }
                }

                $output .= '  <item>' . "\n";
                $output .= '    <g:id>' . esc_xml($var_sku) . '</g:id>' . "\n";
                $output .= '    <g:item_group_id>NI-' . esc_xml($product_id) . '</g:item_group_id>' . "\n";
                $output .= '    <g:title>' . esc_xml($title . ($size ? ' - ' . $size : '')) . '</g:title>' . "\n";
                $output .= '    <g:description>' . esc_xml(mb_substr($description, 0, 4900)) . '</g:description>' . "\n";
                $output .= '    <g:link>' . esc_url($permalink) . '</g:link>' . "\n";
                $output .= '    <g:image_link>' . esc_url($var_img) . '</g:image_link>' . "\n";
                $output .= '    <g:price>' . esc_xml($var_price_formatted) . '</g:price>' . "\n";
                $output .= '    <g:availability>' . esc_xml($var_avail) . '</g:availability>' . "\n";
                $output .= '    <g:condition>new</g:condition>' . "\n";
                $output .= '    <g:brand>' . esc_xml($brand) . '</g:brand>' . "\n";
                $output .= '    <g:google_product_category>' . esc_xml($google_cat) . '</g:google_product_category>' . "\n";
                $output .= '    <g:product_type>' . esc_xml($cat_name) . '</g:product_type>' . "\n";
                if ($color) $output .= '    <g:color>' . esc_xml($color) . '</g:color>' . "\n";
                if ($size) $output .= '    <g:size>' . esc_xml($size) . '</g:size>' . "\n";
                $output .= '    <g:gender>female</g:gender>' . "\n";
                $output .= '    <g:age_group>adult</g:age_group>' . "\n";
                $output .= '    <g:shipping>' . "\n";
                $output .= '      <g:country>US</g:country>' . "\n";
                $output .= '      <g:service>DHL Express Worldwide</g:service>' . "\n";
                $output .= '      <g:price>24.99 USD</g:price>' . "\n";
                $output .= '    </g:shipping>' . "\n";
                $output .= '  </item>' . "\n";
            }
        } else {
            // Parent level item
            $sku = $product->get_sku() ?: 'NI-' . $product_id;
            $avail = $product->is_in_stock() ? 'in stock' : 'out of stock';

            $output .= '  <item>' . "\n";
            $output .= '    <g:id>' . esc_xml($sku) . '</g:id>' . "\n";
            $output .= '    <g:title>' . esc_xml($title) . '</g:title>' . "\n";
            $output .= '    <g:description>' . esc_xml(mb_substr($description, 0, 4900)) . '</g:description>' . "\n";
            $output .= '    <g:link>' . esc_url($permalink) . '</g:link>' . "\n";
            $output .= '    <g:image_link>' . esc_url($image_link) . '</g:image_link>' . "\n";
            foreach ($additional_images as $add_img) {
                $output .= '    <g:additional_image_link>' . esc_url($add_img) . '</g:additional_image_link>' . "\n";
            }
            $output .= '    <g:price>' . esc_xml($price_formatted) . '</g:price>' . "\n";
            $output .= '    <g:availability>' . esc_xml($avail) . '</g:availability>' . "\n";
            $output .= '    <g:condition>new</g:condition>' . "\n";
            $output .= '    <g:brand>' . esc_xml($brand) . '</g:brand>' . "\n";
            $output .= '    <g:google_product_category>' . esc_xml($google_cat) . '</g:google_product_category>' . "\n";
            $output .= '    <g:product_type>' . esc_xml($cat_name) . '</g:product_type>' . "\n";
            if ($color) $output .= '    <g:color>' . esc_xml($color) . '</g:color>' . "\n";
            $output .= '    <g:gender>female</g:gender>' . "\n";
            $output .= '    <g:age_group>adult</g:age_group>' . "\n";
            $output .= '    <g:shipping>' . "\n";
            $output .= '      <g:country>US</g:country>' . "\n";
            $output .= '      <g:service>DHL Express Worldwide</g:service>' . "\n";
            $output .= '      <g:price>24.99 USD</g:price>' . "\n";
            $output .= '    </g:shipping>' . "\n";
            $output .= '  </item>' . "\n";
        }
    }

    $output .= '</channel>' . "\n";
    $output .= '</rss>' . "\n";

    set_transient($transient_key, $output, 6 * HOUR_IN_SECONDS);

    header('Content-Type: application/xml; charset=utf-8');
    header('X-Robots-Tag: noindex, follow');
    header('X-Pinterest-Feed-Cache: MISS');
    echo $output;
    exit;
}
