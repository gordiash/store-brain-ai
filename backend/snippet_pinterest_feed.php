<?php
/**
 * Snippet Name: Natura Intimo – Pinterest Product Catalog XML & CSV Feed Engine
 * Description: Generates a high-performance, fully-compliant RSS 2.0 / Google Merchant XML and CSV product feed for Pinterest Catalogs.
 * Routes product image requests through WordPress Global Edge CDN (i0.wp.com / i1.wp.com / i2.wp.com) to eliminate HTTP 429 rate limiting on Pinterestbot.
 * Accessible at: 
 *   - XML: https://naturaintimo.com/pinterest-feed.xml (or /?pinterest_feed=xml)
 *   - CSV: https://naturaintimo.com/pinterest-feed.csv (or /?pinterest_feed=csv)
 */

if (!defined('ABSPATH')) {
    exit;
}

// 1. Maintain clean URLs and LiteSpeed rules in .htaccess
add_action('init', 'ni_pinterest_catalog_htaccess_maintainer', 1);
function ni_pinterest_catalog_htaccess_maintainer() {
    $marker = '### BEGIN LiteSpeed Bot Exemption ###';
    $ht_path = ABSPATH . '.htaccess';
    if (file_exists($ht_path) && is_writable($ht_path)) {
        $ht_content = file_get_contents($ht_path);
        if (strpos($ht_content, 'RewriteRule ^pinterest-feed') !== false || strpos($ht_content, '### STATIC FEED ENGINE ###') === false) {
            if (strpos($ht_content, $marker) !== false) {
                $ht_content = preg_replace('/### BEGIN LiteSpeed Bot Exemption ###.*?### END LiteSpeed Bot Exemption ###\s*/s', '', $ht_content);
            }
            $bot_rules = "### BEGIN LiteSpeed Bot Exemption ###\n" .
                         "# ### STATIC FEED ENGINE ### Direct physical static file delivery for Pinterest & Meta crawlers\n" .
                         "<IfModule LiteSpeed>\n" .
                         "RewriteEngine On\n" .
                         "RewriteCond %{HTTP_USER_AGENT} (Pinterestbot|Pinterest|facebookexternalhit|Facebot|Googlebot|bingbot|Twitterbot) [NC]\n" .
                         "RewriteRule .* - [E=nothrottle:1]\n" .
                         "</IfModule>\n" .
                         "<IfModule mod_setenvif.c>\n" .
                         "SetEnvIfNoCase User-Agent \"Pinterest\" nothrottle=1\n" .
                         "SetEnvIfNoCase User-Agent \"Pinterestbot\" nothrottle=1\n" .
                         "SetEnvIfNoCase User-Agent \"facebookexternalhit\" nothrottle=1\n" .
                         "</IfModule>\n" .
                         "### END LiteSpeed Bot Exemption ###\n\n";
            file_put_contents($ht_path, $bot_rules . $ht_content);
        }
    }
}

add_action('init', 'ni_pinterest_catalog_rewrite_rules');
function ni_pinterest_catalog_rewrite_rules() {
    add_rewrite_rule('^pinterest-feed\.xml$', 'index.php?ni_pinterest_feed=xml', 'top');
    add_rewrite_rule('^pinterest-feed\.csv$', 'index.php?ni_pinterest_feed=csv', 'top');
}

add_filter('query_vars', 'ni_pinterest_catalog_query_vars');
function ni_pinterest_catalog_query_vars($vars) {
    $vars[] = 'ni_pinterest_feed';
    return $vars;
}

// Helper: Transform image URL to WordPress Global Edge CDN (Photon) to eliminate HTTP 429
function ni_pinterest_cdn_image_url($url, $index = 0) {
    if (!$url) return '';
    $clean_domain = preg_replace('#^https?://#', '', $url);
    $subdomain = 'i' . ($index % 3);
    return 'https://' . $subdomain . '.wp.com/' . $clean_domain;
}

// Helper: Sanitize description for Pinterest (clean text, no emojis, no broken table dumps)
function ni_clean_pinterest_description($text, $title) {
    $text = wp_strip_all_tags($text);
    // Remove emojis and special unicode symbols that trigger feed parsing rejections
    $text = preg_replace('/[\x{1F600}-\x{1F64F}\x{1F300}-\x{1F5FF}\x{1F680}-\x{1F6FF}\x{2600}-\x{26FF}\x{2700}-\x{27BF}\x{1F900}-\x{1F9FF}\x{1FA70}-\x{1FAFF}]/u', '', $text);
    // Remove markdown table dumps
    $text = preg_replace('/(\n\s*\|[^\n]+\|)+/', "\n", $text);
    // Remove raw markdown arrows and symbols
    $text = str_replace(array('➔', '➜', '•', '▶', '►', '💡', '📐'), '-', $text);
    // Normalize spaces and linebreaks
    $text = preg_replace('/\s+/', ' ', $text);
    $text = trim($text);
    if (empty($text) || strlen($text) < 20) {
        $text = $title . ' - Authentic European luxury lingerie engineered for full-bust support. Premium craftsmanship, express DHL Express Worldwide delivery.';
    }
    return mb_substr($text, 0, 4900);
}

// 2. Feed Generator Handler (runs at init 15 after WooCommerce is loaded, and on template_redirect)
add_action('init', 'ni_render_pinterest_catalog_feed', 15);
add_action('template_redirect', 'ni_render_pinterest_catalog_feed');
function ni_render_pinterest_catalog_feed() {
    $uri = $_SERVER['REQUEST_URI'] ?? '';
    $path = parse_url($uri, PHP_URL_PATH);
    $query_feed = get_query_var('ni_pinterest_feed') ?: ($_GET['pinterest_feed'] ?? ($_GET['pinterest_catalog'] ?? ''));
    
    $format = '';
    if ($query_feed === 'csv' || $path === '/pinterest-feed.csv' || strpos($uri, 'pinterest-feed.csv') !== false) {
        $format = 'csv';
    } elseif ($query_feed === 'xml' || $query_feed === '1' || $path === '/pinterest-feed.xml' || strpos($uri, 'pinterest-feed.xml') !== false || isset($_GET['pinterest_catalog'])) {
        $format = 'xml';
    }

    if (isset($_GET['sync_disk'])) {
        $xml_data = get_transient('ni_pinterest_cdn_catalog_xml_main');
        $csv_data = get_transient('ni_pinterest_cdn_catalog_csv_main');
        
        $p1 = ABSPATH . 'pinterest-feed.xml';
        $p2 = ($_SERVER['DOCUMENT_ROOT'] ?? '') . '/pinterest-feed.xml';
        $csv1 = ABSPATH . 'pinterest-feed.csv';
        $csv2 = ($_SERVER['DOCUMENT_ROOT'] ?? '') . '/pinterest-feed.csv';
        
        $written = [
            'p1' => file_put_contents($p1, $xml_data),
            'p2' => ($p2 !== $p1 && is_dir($_SERVER['DOCUMENT_ROOT'])) ? file_put_contents($p2, $xml_data) : 'same',
            'csv1' => file_put_contents($csv1, $csv_data),
            'csv2' => ($csv2 !== $csv1 && is_dir($_SERVER['DOCUMENT_ROOT'])) ? file_put_contents($csv2, $csv_data) : 'same',
        ];
        
        header('Content-Type: application/json');
        echo json_encode($written);
        exit;
    }

    if (!$format) {
        return;
    }

    status_header(200);
    header('X-LiteSpeed-Cache-Control: public,max-age=86400');

    $force_refresh = isset($_GET['refresh']) && $_GET['refresh'] == '1';
    $include_variants = isset($_GET['variants']) && $_GET['variants'] == '1';
    $transient_key = 'ni_pinterest_cdn_catalog_' . $format . ($include_variants ? '_var' : '_main');

    if (!$force_refresh) {
        $cached = get_transient($transient_key);
        if ($cached) {
            if ($format === 'csv') {
                header('Content-Type: text/csv; charset=utf-8');
                header('Content-Disposition: inline; filename="pinterest-catalog.csv"');
            } else {
                header('Content-Type: application/xml; charset=utf-8');
            }
            header('Cache-Control: public, max-age=86400, stale-while-revalidate=43200');
            header('X-Robots-Tag: noindex, follow');
            header('Access-Control-Allow-Origin: *');
            header('X-Pinterest-Feed-Cache: HIT');
            header('X-Pinterest-CDN: ENABLED');
            echo $cached;
            exit;
        }
    }

    // Query published products
    $args = array(
        'status' => 'publish',
        'limit' => -1,
        'type' => array('simple', 'variable'),
        'orderby' => 'date',
        'order' => 'DESC'
    );
    $products = wc_get_products($args);

    if ($format === 'csv') {
        // Build CSV Feed
        $fp = fopen('php://temp', 'r+');
        fputcsv($fp, array(
            'id',
            'title',
            'description',
            'link',
            'image_link',
            'additional_image_link',
            'price',
            'availability',
            'condition',
            'brand',
            'google_product_category',
            'product_type',
            'color',
            'gender',
            'age_group',
            'shipping'
        ));

        $item_idx = 0;
        foreach ($products as $product) {
            $item_idx++;
            $product_id = $product->get_id();
            $sku = $product->get_sku() ?: 'NI-' . $product_id;
            $title = $product->get_name();
            $description = ni_clean_pinterest_description($product->get_description() ?: $product->get_short_description(), $title);
            $permalink = $product->get_permalink();

            $img_id = $product->get_image_id();
            $raw_image_link = $img_id ? wp_get_attachment_image_url($img_id, 'full') : '';
            if (!$raw_image_link) continue;
            $image_link = ni_pinterest_cdn_image_url($raw_image_link, $item_idx);

            $gallery_ids = $product->get_gallery_image_ids();
            $add_imgs = array();
            if (!empty($gallery_ids)) {
                // Limit to 1 primary alternative view to avoid crawler concurrency exhaustion
                foreach (array_slice($gallery_ids, 0, 1) as $idx => $gid) {
                    $u = wp_get_attachment_image_url($gid, 'full');
                    if ($u && $u !== $raw_image_link) {
                        $add_imgs[] = ni_pinterest_cdn_image_url($u, $item_idx + $idx + 1);
                    }
                }
            }

            $price = $product->get_price() ?: $product->get_regular_price();
            $price_formatted = number_format((float)$price, 2, '.', '') . ' USD';
            $avail = $product->is_in_stock() ? 'in stock' : 'out of stock';

            // Brand
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
            if (!$brand) $brand = 'Natura Intimo';

            // Categories
            $cats = wp_get_post_terms($product_id, 'product_cat', array('fields' => 'names'));
            $cat_name = (!empty($cats) && !is_wp_error($cats)) ? implode(' > ', $cats) : 'Lingerie';

            // Accurate Category Matching
            $google_cat = 'Apparel & Accessories > Clothing > Underwear & Socks > Lingerie';
            if (preg_match('/\b(briefs?|panties|thong|thongs|brazilian|shorts?|figi|szorty)\b/i', $title) || preg_match('/\b(briefs?|panties|thong|thongs|shorts?)\b/i', $cat_name)) {
                $google_cat = 'Apparel & Accessories > Clothing > Underwear & Socks > Lingerie > Panties';
            } elseif (preg_match('/\b(bra|bras|biustonosz)\b/i', $title) || preg_match('/\b(bra|bras)\b/i', $cat_name)) {
                $google_cat = 'Apparel & Accessories > Clothing > Underwear & Socks > Lingerie > Bras';
            }

            $color = $product->get_attribute('color') ?: $product->get_attribute('pa_color');
            if (!$color) {
                foreach (array('Black', 'White', 'Beige', 'Burgundy', 'Navy', 'Pink', 'Red', 'Emerald', 'Wine') as $c) {
                    if (stripos($title, $c) !== false) {
                        $color = $c;
                        break;
                    }
                }
            }

            $shipping = 'US:DHL Express Worldwide:24.99 USD';

            fputcsv($fp, array(
                $sku,
                $title,
                $description,
                $permalink,
                $image_link,
                implode(',', $add_imgs),
                $price_formatted,
                $avail,
                'new',
                $brand,
                $google_cat,
                $cat_name,
                $color ?: '',
                'female',
                'adult',
                $shipping
            ));
        }

        rewind($fp);
        $csv_data = stream_get_contents($fp);
        fclose($fp);

        @file_put_contents(ABSPATH . 'pinterest-feed.csv', $csv_data);
        set_transient($transient_key, $csv_data, 12 * HOUR_IN_SECONDS);

        header('Content-Type: text/csv; charset=utf-8');
        header('Content-Disposition: inline; filename="pinterest-catalog.csv"');
        header('Cache-Control: public, max-age=86400, stale-while-revalidate=43200');
        header('X-Robots-Tag: noindex, follow');
        header('Access-Control-Allow-Origin: *');
        header('X-Pinterest-Feed-Cache: MISS');
        header('X-Pinterest-CDN: ENABLED');
        echo $csv_data;
        exit;
    }

    // Build XML RSS 2.0 Feed
    $output = '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
    $output .= '<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0" xmlns:media="http://search.yahoo.com/mrss/">' . "\n";
    $output .= '<channel>' . "\n";
    $output .= '  <title>' . esc_xml('Natura Intimo – European Full-Bust Lingerie & Coordinated Sets') . '</title>' . "\n";
    $output .= '  <link>' . esc_url(home_url('/')) . '</link>' . "\n";
    $output .= '  <description>' . esc_xml('Official Pinterest Product Catalog for Natura Intimo. Authentic European full-bust bras, plus size lingerie and coordinated sets.') . '</description>' . "\n";

    $item_idx = 0;
    foreach ($products as $product) {
        $item_idx++;
        $product_id = $product->get_id();
        $sku = $product->get_sku() ?: 'NI-' . $product_id;
        $title = $product->get_name();
        $description = ni_clean_pinterest_description($product->get_description() ?: $product->get_short_description(), $title);
        $permalink = $product->get_permalink();

        $img_id = $product->get_image_id();
        $raw_image_link = $img_id ? wp_get_attachment_image_url($img_id, 'full') : '';
        if (!$raw_image_link) continue;
        $image_link = ni_pinterest_cdn_image_url($raw_image_link, $item_idx);

        $gallery_ids = $product->get_gallery_image_ids();
        $additional_images = array();
        if (!empty($gallery_ids)) {
            // Limit to 1 primary alternative view to avoid crawler concurrency exhaustion
            foreach (array_slice($gallery_ids, 0, 1) as $idx => $gid) {
                $u = wp_get_attachment_image_url($gid, 'full');
                if ($u && $u !== $raw_image_link) {
                    $additional_images[] = ni_pinterest_cdn_image_url($u, $item_idx + $idx + 1);
                }
            }
        }

        $price = $product->get_price() ?: $product->get_regular_price();
        $price_formatted = number_format((float)$price, 2, '.', '') . ' USD';
        $avail = $product->is_in_stock() ? 'in stock' : 'out of stock';

        // Brand
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
        if (!$brand) $brand = 'Natura Intimo';

        // Categories
        $cats = wp_get_post_terms($product_id, 'product_cat', array('fields' => 'names'));
        $cat_name = (!empty($cats) && !is_wp_error($cats)) ? implode(' > ', $cats) : 'Lingerie';

        // Accurate Category Matching
        $google_cat = 'Apparel & Accessories > Clothing > Underwear & Socks > Lingerie';
        if (preg_match('/\b(briefs?|panties|thong|thongs|brazilian|shorts?|figi|szorty)\b/i', $title) || preg_match('/\b(briefs?|panties|thong|thongs|shorts?)\b/i', $cat_name)) {
            $google_cat = 'Apparel & Accessories > Clothing > Underwear & Socks > Lingerie > Panties';
        } elseif (preg_match('/\b(bra|bras|biustonosz)\b/i', $title) || preg_match('/\b(bra|bras)\b/i', $cat_name)) {
            $google_cat = 'Apparel & Accessories > Clothing > Underwear & Socks > Lingerie > Bras';
        }

        $color = $product->get_attribute('color') ?: $product->get_attribute('pa_color');
        if (!$color) {
            foreach (array('Black', 'White', 'Beige', 'Burgundy', 'Navy', 'Pink', 'Red', 'Emerald', 'Wine') as $c) {
                if (stripos($title, $c) !== false) {
                    $color = $c;
                    break;
                }
            }
        }

        $output .= '  <item>' . "\n";
        // 1. Standard RSS 2.0 tags required by RSS parsers
        $output .= '    <title>' . esc_xml($title) . '</title>' . "\n";
        $output .= '    <link>' . esc_url($permalink) . '</link>' . "\n";
        $output .= '    <description>' . esc_xml($description) . '</description>' . "\n";
        $output .= '    <guid isPermaLink="true">' . esc_url($permalink) . '</guid>' . "\n";
        $output .= '    <enclosure url="' . esc_url($image_link) . '" length="150000" type="image/jpeg" />' . "\n";
        
        // 2. Google Merchant & Pinterest Catalogs namespace tags
        $output .= '    <g:id>' . esc_xml($sku) . '</g:id>' . "\n";
        $output .= '    <g:title>' . esc_xml($title) . '</g:title>' . "\n";
        $output .= '    <g:description>' . esc_xml($description) . '</g:description>' . "\n";
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

    $output .= '</channel>' . "\n";
    $output .= '</rss>' . "\n";

    @file_put_contents(ABSPATH . 'pinterest-feed.xml', $output);
    set_transient($transient_key, $output, 12 * HOUR_IN_SECONDS);

    header('Content-Type: application/xml; charset=utf-8');
    header('Cache-Control: public, max-age=86400, stale-while-revalidate=43200');
    header('X-Robots-Tag: noindex, follow');
    header('Access-Control-Allow-Origin: *');
    header('X-Pinterest-Feed-Cache: MISS');
    header('X-Pinterest-CDN: ENABLED');
    echo $output;
    exit;
}
