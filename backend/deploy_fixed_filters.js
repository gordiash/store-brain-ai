import dotenv from 'dotenv';
dotenv.config();

const wpUser = process.env.WP_ADMIN_USER;
const wpPass = process.env.WP_APP_PASSWORD;
const siteUrl = process.env.WOOCOMMERCE_URL || 'https://naturaintimo.com';

if (!wpUser || !wpPass) {
  throw new Error('Missing WP_ADMIN_USER or WP_APP_PASSWORD in .env');
}

const wpAuth = 'Basic ' + Buffer.from(`${wpUser}:${wpPass}`).toString('base64');

// Snippet 91 PHP Code
const snippet91Php = `/**
 * Snippet Name: Natura Intimo – Luxury Catalog & Brafitting Product Filter Engine
 * Description: Instant interactive filters by Bra Band & Cup, Panty Size, Brand, Color, Category and Price on all shop and archive pages.
 */

if (!defined('ABSPATH')) {
    exit;
}

// 0. Cache Purge Trigger for instant updates
add_action('init', function() {
    if (isset($_GET['purge_cache'])) {
        do_action('litespeed_purge_all');
    }
});

// 1. Ensure all products in catalog are loaded for seamless filtering (no page cut-offs)
add_filter('loop_shop_per_page', function($cols) {
    return 60;
}, 999);

// 1b. Ensure Astra product card category label always displays the primary garment type ('Panties' or 'Bras') instead of 'Lingerie Sets' or 'New Arrivals'
add_filter('astra_woo_shop_product_categories', function($parent_cat, $product_id = 0) {
    $id = $product_id ? $product_id : get_the_ID();
    if (!$id) return $parent_cat;
    if (has_term('panties', 'product_cat', $id)) {
        return 'Panties';
    }
    if (has_term('bras', 'product_cat', $id)) {
        return 'Bras';
    }
    return $parent_cat;
}, 20, 2);

// 2. Tag each product in the catalog with filter classes based on real variations and attributes
add_filter('woocommerce_post_class', 'ni_enrich_product_card_classes', 25, 2);
function ni_enrich_product_card_classes($classes, $product) {
    if (!$product) return $classes;

    $name = $product->get_name();

    // Brand detection (Core European Makers)
    $brands = array('Ava' => 'ava', 'Gaia' => 'gaia', 'Gorsenia' => 'gorsenia', 'Mefemi' => 'mefemi', 'Alles' => 'alles');
    foreach ($brands as $needle => $slug) {
        if (stripos($name, $needle) !== false) {
            $classes[] = 'ni-f-brand-' . $slug;
        }
    }

    // Size detection from attributes
    $raw_sizes = array();

    if (method_exists($product, 'get_attributes')) {
        $attributes = $product->get_attributes();
        foreach ($attributes as $attr) {
            $attr_name = is_object($attr) ? $attr->get_name() : (isset($attr['name']) ? $attr['name'] : '');
            if (strcasecmp($attr_name, 'size') === 0 || strcasecmp($attr_name, 'rozmiar') === 0 || strcasecmp($attr_name, 'pa_size') === 0) {
                if (is_object($attr) && method_exists($attr, 'is_taxonomy') && $attr->is_taxonomy()) {
                    $terms = wc_get_product_terms($product->get_id(), $attr->get_name(), array('fields' => 'names'));
                    if (!empty($terms) && !is_wp_error($terms)) {
                        $raw_sizes = array_merge($raw_sizes, $terms);
                    }
                } elseif (is_object($attr) && method_exists($attr, 'get_options')) {
                    $opts = $attr->get_options();
                    if (is_array($opts)) {
                        $raw_sizes = array_merge($raw_sizes, $opts);
                    }
                } elseif (is_array($attr) && !empty($attr['value'])) {
                    $parts = preg_split('/[|,\\/\\r\\n]+/', $attr['value']);
                    $raw_sizes = array_merge($raw_sizes, $parts);
                }
            }
        }
    }

    // Fallback: check get_attribute('Size')
    if (empty($raw_sizes) && method_exists($product, 'get_attribute')) {
        foreach (array('Size', 'size', 'pa_size', 'Rozmiar') as $key) {
            $val = $product->get_attribute($key);
            if (!empty($val)) {
                $parts = preg_split('/[|,;\\/\\r\\n]+/', $val);
                $raw_sizes = array_merge($raw_sizes, $parts);
                break;
            }
        }
    }

    // Also parse title for boundary sizes e.g. 70D-95G
    if (preg_match_all('~([0-9]{2,3})([a-zA-Z])~i', $name, $matches, PREG_SET_ORDER)) {
        foreach ($matches as $match) {
            $b = $match[1];
            $c = strtolower($match[2]);
            $classes[] = 'ni-f-band-' . $b;
            $classes[] = 'ni-f-cup-' . $c;
            $classes[] = 'ni-f-bra-' . $b . $c;
        }
    }

    // Process all extracted sizes
    foreach ($raw_sizes as $raw_s) {
        $s = trim($raw_s);
        if (empty($s)) continue;

        // Clean slug for panties/general size: e.g. s, m, l, xl, 2xl, 3xl, 4xl
        $slug = strtolower(preg_replace('/[^a-zA-Z0-9]/', '', $s));
        if (!empty($slug)) {
            $classes[] = 'ni-f-size-' . $slug;
        }

        // Bra band and cup extraction: e.g. 75F or 75-F or 75 F
        if (preg_match('~^([0-9]{2,3})[ -]*([a-zA-Z]+)$~i', $s, $m)) {
            $band = $m[1];
            $cup = strtolower($m[2]);
            $classes[] = 'ni-f-band-' . $band;
            $classes[] = 'ni-f-cup-' . $cup;
            $classes[] = 'ni-f-bra-' . $band . $cup;
        }
    }

    // Color detection
    $raw_colors = array();
    if (method_exists($product, 'get_attributes')) {
        $attributes = $product->get_attributes();
        foreach ($attributes as $attr) {
            $attr_name = is_object($attr) ? $attr->get_name() : (isset($attr['name']) ? $attr['name'] : '');
            if (strcasecmp($attr_name, 'color') === 0 || strcasecmp($attr_name, 'kolor') === 0 || strcasecmp($attr_name, 'pa_color') === 0) {
                if (is_object($attr) && method_exists($attr, 'is_taxonomy') && $attr->is_taxonomy()) {
                    $terms = wc_get_product_terms($product->get_id(), $attr->get_name(), array('fields' => 'names'));
                    if (!empty($terms) && !is_wp_error($terms)) {
                        $raw_colors = array_merge($raw_colors, $terms);
                    }
                } elseif (is_object($attr) && method_exists($attr, 'get_options')) {
                    $opts = $attr->get_options();
                    if (is_array($opts)) {
                        $raw_colors = array_merge($raw_colors, $opts);
                    }
                }
            }
        }
    }
    if (empty($raw_colors) && method_exists($product, 'get_attribute')) {
        foreach (array('Color', 'color', 'pa_color', 'Kolor') as $key) {
            $val = $product->get_attribute($key);
            if (!empty($val)) {
                $parts = preg_split('/[|,;\\/\\r\\n]+/', $val);
                $raw_colors = array_merge($raw_colors, $parts);
                break;
            }
        }
    }

    $search_color_text = strtolower($name . ' ' . implode(' ', $raw_colors));

    if (strpos($search_color_text, 'black') !== false || strpos($search_color_text, 'czarn') !== false) {
        $classes[] = 'ni-f-color-black';
    }
    if (strpos($search_color_text, 'beige') !== false || strpos($search_color_text, 'beż') !== false || strpos($search_color_text, 'natural') !== false || strpos($search_color_text, 'nude') !== false) {
        $classes[] = 'ni-f-color-beige';
    }
    if (strpos($search_color_text, 'mocha') !== false || strpos($search_color_text, 'mocc') !== false || strpos($search_color_text, 'cappuccino') !== false) {
        $classes[] = 'ni-f-color-mocha';
        $classes[] = 'ni-f-color-beige';
    }
    if (strpos($search_color_text, 'white') !== false || strpos($search_color_text, 'biał') !== false || strpos($search_color_text, 'milk') !== false) {
        $classes[] = 'ni-f-color-white';
    }
    if (strpos($search_color_text, 'navy') !== false || strpos($search_color_text, 'granat') !== false || strpos($search_color_text, 'blue') !== false) {
        $classes[] = 'ni-f-color-navy';
    }
    if (strpos($search_color_text, 'pink') !== false || strpos($search_color_text, 'róż') !== false) {
        $classes[] = 'ni-f-color-pink';
    }
    if (strpos($search_color_text, 'burgundy') !== false || strpos($search_color_text, 'bordo') !== false || strpos($search_color_text, 'wine') !== false || strpos($search_color_text, 'red') !== false || strpos($search_color_text, 'champagne') !== false) {
        $classes[] = 'ni-f-color-burgundy';
    }

    // Price bracket
    $price = (float) $product->get_price();
    if ($price > 0) {
        if ($price < 75.0) {
            $classes[] = 'ni-f-price-under-75';
        } elseif ($price <= 90.0) {
            $classes[] = 'ni-f-price-75-90';
        } else {
            $classes[] = 'ni-f-price-over-90';
        }
    }

    return array_unique($classes);
}

// 3. Render the Luxury Filter Bar above the product grid
add_action('woocommerce_before_shop_loop', 'ni_render_catalog_filter_bar', 12);
add_action('woocommerce_shortcode_before_products_loop', 'ni_render_catalog_filter_bar', 10);
add_action('woocommerce_shortcode_before_product_cat_loop', 'ni_render_catalog_filter_bar', 10);
add_shortcode('ni_filter_bar', 'ni_render_catalog_filter_bar_shortcode');
add_action('wp_footer', 'ni_inject_filter_bar_script');

function ni_render_catalog_filter_bar_shortcode() {
    ob_start();
    ni_render_catalog_filter_bar();
    return ob_get_clean();
}

function ni_render_catalog_filter_bar() {
    static $rendered = false;
    if ($rendered) return;
    $rendered = true;

    ?>
    <div id="ni-luxury-filter-bar" class="ni-filter-bar" style="background:#fffcf9; border:1px solid #ebdcd5; border-radius:12px; padding:18px 20px; margin:0 0 24px 0; box-shadow:0 3px 10px rgba(130,58,84,0.03); font-family:inherit;">
        
        <!-- Header & Quick Categories -->
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; margin-bottom:14px; border-bottom:1px solid #f3eae6; padding-bottom:12px;">
            <div style="display:flex; align-items:center; gap:8px;">
                <span style="font-size:16px;">🔍</span>
                <span style="font-weight:700; color:#2d1e26; font-size:14px; letter-spacing:0.02em; text-transform:uppercase;">Filter & Refine</span>
                <span id="ni-filter-count-badge" style="background:#823a54; color:#fff; font-size:11px; font-weight:700; padding:2px 8px; border-radius:12px; display:none;">0</span>
            </div>
            <div style="display:flex; align-items:center; gap:10px;">
                <span id="ni-matching-results-text" style="font-size:13px; color:#5c4752; font-weight:500;">Showing all styles</span>
                <button type="button" id="ni-reset-filters-btn" style="background:transparent; border:1px solid #ebdcd5; color:#823a54; font-size:11px; font-weight:600; padding:4px 10px; border-radius:6px; cursor:pointer; display:none;">
                    ✕ Clear All
                </button>
            </div>
        </div>

        <!-- Filter Dropdown Trigger Pills -->
        <div class="ni-filter-pills-row" style="display:flex; flex-wrap:wrap; gap:8px;">
            
            <!-- Filter: Bra Size (Band & Cup) -->
            <div class="ni-filter-dropdown" style="position:relative;">
                <button type="button" class="ni-pill-btn" data-target="ni-panel-size" style="background:#fff; border:1px solid #d8c2b8; color:#2d1e26; padding:7px 14px; border-radius:20px; font-size:12px; font-weight:600; cursor:pointer; display:flex; align-items:center; gap:6px; transition:all 0.2s;">
                    📏 <span>Bra Size (Band & Cup)</span> <small style="font-size:9px;">▼</small>
                </button>
                <div id="ni-panel-size" class="ni-filter-panel" style="display:none; position:absolute; top:calc(100% + 6px); left:0; z-index:9999; background:#fff; border:1px solid #ebdcd5; border-radius:12px; box-shadow:0 8px 24px rgba(45,30,38,0.12); padding:16px; width:340px;">
                    <div style="font-size:11px; font-weight:700; color:#823a54; text-transform:uppercase; margin-bottom:6px;">Select Cup:</div>
                    <div class="ni-btn-group" data-filter="cup" style="display:flex; flex-wrap:wrap; gap:5px; margin-bottom:12px;">
                        <?php foreach (['B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M'] as $c): ?>
                            <button type="button" class="ni-opt-btn" data-val="<?php echo strtolower($c); ?>" style="background:#faf5f2; border:1px solid #e2d2cb; padding:4px 9px; border-radius:6px; font-size:11px; font-weight:600; cursor:pointer; color:#30252b;">
                                <?php echo $c === 'E' ? 'DD (E)' : ($c === 'F' ? 'DDD (F)' : $c); ?>
                            </button>
                        <?php endforeach; ?>
                    </div>
                    <div style="font-size:11px; font-weight:700; color:#823a54; text-transform:uppercase; margin-bottom:6px;">Select Band (US / EU):</div>
                    <div class="ni-btn-group" data-filter="band" style="display:flex; flex-wrap:wrap; gap:5px;">
                        <?php 
                        $bands = [
                            '65' => '30 (65)',
                            '70' => '32 (70)',
                            '75' => '34 (75)',
                            '80' => '36 (80)',
                            '85' => '38 (85)',
                            '90' => '40 (90)',
                            '95' => '42 (95)',
                            '100' => '44 (100)',
                            '105' => '46 (105)',
                            '110' => '48 (110)',
                            '115' => '50 (115)'
                        ];
                        foreach ($bands as $val => $lbl): ?>
                            <button type="button" class="ni-opt-btn" data-val="<?php echo $val; ?>" style="background:#faf5f2; border:1px solid #e2d2cb; padding:4px 9px; border-radius:6px; font-size:11px; font-weight:600; cursor:pointer; color:#30252b;">
                                <?php echo $lbl; ?>
                            </button>
                        <?php endforeach; ?>
                    </div>
                </div>
            </div>

            <!-- Filter: Panty Size -->
            <div class="ni-filter-dropdown" style="position:relative;">
                <button type="button" class="ni-pill-btn" data-target="ni-panel-panties" style="background:#fff; border:1px solid #d8c2b8; color:#2d1e26; padding:7px 14px; border-radius:20px; font-size:12px; font-weight:600; cursor:pointer; display:flex; align-items:center; gap:6px;">
                    🩲 <span>Brief Size</span> <small style="font-size:9px;">▼</small>
                </button>
                <div id="ni-panel-panties" class="ni-filter-panel" style="display:none; position:absolute; top:calc(100% + 6px); left:0; z-index:9999; background:#fff; border:1px solid #ebdcd5; border-radius:12px; box-shadow:0 8px 24px rgba(45,30,38,0.12); padding:16px; width:260px;">
                    <div style="font-size:11px; font-weight:700; color:#823a54; text-transform:uppercase; margin-bottom:8px;">Select Panty Size:</div>
                    <div class="ni-btn-group" data-filter="size" style="display:flex; flex-wrap:wrap; gap:6px;">
                        <?php foreach (['S', 'M', 'L', 'XL', '2XL', '3XL', '4XL'] as $pz): ?>
                            <button type="button" class="ni-opt-btn" data-val="<?php echo strtolower($pz); ?>" style="background:#faf5f2; border:1px solid #e2d2cb; padding:6px 12px; border-radius:6px; font-size:12px; font-weight:600; cursor:pointer; color:#30252b;">
                                <?php echo $pz; ?>
                            </button>
                        <?php endforeach; ?>
                    </div>
                </div>
            </div>

            <!-- Filter: Brand -->
            <div class="ni-filter-dropdown" style="position:relative;">
                <button type="button" class="ni-pill-btn" data-target="ni-panel-brand" style="background:#fff; border:1px solid #d8c2b8; color:#2d1e26; padding:7px 14px; border-radius:20px; font-size:12px; font-weight:600; cursor:pointer; display:flex; align-items:center; gap:6px;">
                    🏷️ <span>Brand</span> <small style="font-size:9px;">▼</small>
                </button>
                <div id="ni-panel-brand" class="ni-filter-panel" style="display:none; position:absolute; top:calc(100% + 6px); left:0; z-index:9999; background:#fff; border:1px solid #ebdcd5; border-radius:12px; box-shadow:0 8px 24px rgba(45,30,38,0.12); padding:16px; width:220px;">
                    <div style="font-size:11px; font-weight:700; color:#823a54; text-transform:uppercase; margin-bottom:8px;">European Makers:</div>
                    <div class="ni-btn-group" data-filter="brand" style="display:flex; flex-direction:column; gap:5px;">
                        <?php foreach (['Ava' => 'Ava Lingerie', 'Gaia' => 'Gaia Intimates', 'Gorsenia' => 'Gorsenia Full Bust', 'Mefemi' => 'Mefemi (by Nipplex)', 'Alles' => 'Alles Lingerie'] as $bKey => $bName): ?>
                            <button type="button" class="ni-opt-btn" data-val="<?php echo strtolower($bKey); ?>" style="text-align:left; background:#faf5f2; border:1px solid #e2d2cb; padding:6px 12px; border-radius:6px; font-size:12px; font-weight:600; cursor:pointer; color:#30252b;">
                                <?php echo $bName; ?>
                            </button>
                        <?php endforeach; ?>
                    </div>
                </div>
            </div>

            <!-- Filter: Color -->
            <div class="ni-filter-dropdown" style="position:relative;">
                <button type="button" class="ni-pill-btn" data-target="ni-panel-color" style="background:#fff; border:1px solid #d8c2b8; color:#2d1e26; padding:7px 14px; border-radius:20px; font-size:12px; font-weight:600; cursor:pointer; display:flex; align-items:center; gap:6px;">
                    🎨 <span>Color</span> <small style="font-size:9px;">▼</small>
                </button>
                <div id="ni-panel-color" class="ni-filter-panel" style="display:none; position:absolute; top:calc(100% + 6px); left:0; z-index:9999; background:#fff; border:1px solid #ebdcd5; border-radius:12px; box-shadow:0 8px 24px rgba(45,30,38,0.12); padding:16px; width:220px;">
                    <div style="font-size:11px; font-weight:700; color:#823a54; text-transform:uppercase; margin-bottom:8px;">Palette:</div>
                    <div class="ni-btn-group" data-filter="color" style="display:flex; flex-direction:column; gap:5px;">
                        <button type="button" class="ni-opt-btn" data-val="black" style="text-align:left; background:#faf5f2; border:1px solid #e2d2cb; padding:6px 12px; border-radius:6px; font-size:12px; font-weight:600; cursor:pointer; color:#30252b;">
                            ⚫ Black
                        </button>
                        <button type="button" class="ni-opt-btn" data-val="beige" style="text-align:left; background:#faf5f2; border:1px solid #e2d2cb; padding:6px 12px; border-radius:6px; font-size:12px; font-weight:600; cursor:pointer; color:#30252b;">
                            🟤 Beige
                        </button>
                        <button type="button" class="ni-opt-btn" data-val="white" style="text-align:left; background:#faf5f2; border:1px solid #e2d2cb; padding:6px 12px; border-radius:6px; font-size:12px; font-weight:600; cursor:pointer; color:#30252b;">
                            ⚪ White
                        </button>
                        <button type="button" class="ni-opt-btn" data-val="navy" style="text-align:left; background:#faf5f2; border:1px solid #e2d2cb; padding:6px 12px; border-radius:6px; font-size:12px; font-weight:600; cursor:pointer; color:#30252b;">
                            🔵 Navy Blue
                        </button>
                        <button type="button" class="ni-opt-btn" data-val="burgundy" style="text-align:left; background:#faf5f2; border:1px solid #e2d2cb; padding:6px 12px; border-radius:6px; font-size:12px; font-weight:600; cursor:pointer; color:#30252b;">
                            🍷 Burgundy
                        </button>
                        <button type="button" class="ni-opt-btn" data-val="mocha" style="text-align:left; background:#faf5f2; border:1px solid #e2d2cb; padding:6px 12px; border-radius:6px; font-size:12px; font-weight:600; cursor:pointer; color:#30252b;">
                            ☕ Mocha
                        </button>
                    </div>
                </div>
            </div>

            <!-- Filter: Price -->
            <div class="ni-filter-dropdown" style="position:relative;">
                <button type="button" class="ni-pill-btn" data-target="ni-panel-price" style="background:#fff; border:1px solid #d8c2b8; color:#2d1e26; padding:7px 14px; border-radius:20px; font-size:12px; font-weight:600; cursor:pointer; display:flex; align-items:center; gap:6px;">
                    💰 <span>Price</span> <small style="font-size:9px;">▼</small>
                </button>
                <div id="ni-panel-price" class="ni-filter-panel" style="display:none; position:absolute; top:calc(100% + 6px); left:0; z-index:9999; background:#fff; border:1px solid #ebdcd5; border-radius:12px; box-shadow:0 8px 24px rgba(45,30,38,0.12); padding:16px; width:220px;">
                    <div style="font-size:11px; font-weight:700; color:#823a54; text-transform:uppercase; margin-bottom:8px;">Price Range:</div>
                    <div class="ni-btn-group" data-filter="price" style="display:flex; flex-direction:column; gap:5px;">
                        <button type="button" class="ni-opt-btn" data-val="under-75" style="text-align:left; background:#faf5f2; border:1px solid #e2d2cb; padding:6px 12px; border-radius:6px; font-size:12px; font-weight:600; cursor:pointer; color:#30252b;">
                            Under $75
                        </button>
                        <button type="button" class="ni-opt-btn" data-val="75-90" style="text-align:left; background:#faf5f2; border:1px solid #e2d2cb; padding:6px 12px; border-radius:6px; font-size:12px; font-weight:600; cursor:pointer; color:#30252b;">
                            $75 – $90
                        </button>
                        <button type="button" class="ni-opt-btn" data-val="over-90" style="text-align:left; background:#faf5f2; border:1px solid #e2d2cb; padding:6px 12px; border-radius:6px; font-size:12px; font-weight:600; cursor:pointer; color:#30252b;">
                            Over $90
                        </button>
                    </div>
                </div>
            </div>

        </div>

        <!-- Active Filter Tags Display -->
        <div id="ni-active-chips-container" style="display:flex; flex-wrap:wrap; gap:6px; margin-top:12px; padding-top:10px; border-top:1px dashed #eee; display:none;">
            <!-- Injected via JS -->
        </div>

    </div>
    <?php
}

function ni_inject_filter_bar_script() {
    ?>
    <style>
    .ni-pill-btn.is-active, .ni-opt-btn.is-active {
        background: #823a54 !important;
        color: #fff !important;
        border-color: #823a54 !important;
    }
    .ni-chip-badge {
        background: #f4e9ed;
        color: #823a54;
        border: 1px solid #ebd2dc;
        border-radius: 14px;
        padding: 3px 10px;
        font-size: 11px;
        font-weight: 600;
        display: inline-flex;
        align-items: center;
        gap: 5px;
    }
    .ni-chip-remove {
        cursor: pointer;
        font-weight: 700;
        opacity: 0.7;
    }
    .ni-chip-remove:hover {
        opacity: 1;
    }
    li.product.ni-filter-hidden {
        display: none !important;
    }
    #ni-no-results-msg {
        grid-column: 1 / -1;
        width: 100%;
        text-align: center;
        padding: 40px 20px;
        background: #fffcf9;
        border: 1px dashed #ebdcd5;
        border-radius: 12px;
        color: #5c4752;
    }
    </style>

    <script type="text/javascript">
    (function($){
        function niEnsureFilterBarPlacement() {
            var $bar = $('#ni-luxury-filter-bar');
            var $products = $('ul.products');
            if ($bar.length && $products.length) {
                if (!$bar.next().is($products) && !$bar.parent().find('ul.products').length) {
                    $bar.insertBefore($products);
                }
            }
        }

        var activeFilters = {
            cup: null,
            band: null,
            size: null,
            brand: null,
            color: null,
            price: null
        };

        // Toggle Dropdown Panels
        $(document).on('click', '.ni-pill-btn', function(e){
            e.stopPropagation();
            var target = $(this).data('target');
            var $panel = $('#' + target);
            var isVisible = $panel.is(':visible');
            $('.ni-filter-panel').hide();
            if (!isVisible) {
                $panel.show();
            }
        });

        // Close panels when clicking outside
        $(document).on('click', function(e){
            if (!$(e.target).closest('.ni-filter-dropdown').length) {
                $('.ni-filter-panel').hide();
            }
        });

        // Click on Option Button inside panel
        $(document).on('click', '.ni-opt-btn', function(e){
            e.preventDefault();
            var $group = $(this).closest('.ni-btn-group');
            var fType = $group.data('filter');
            var val = $(this).data('val');

            if ($(this).hasClass('is-active')) {
                $(this).removeClass('is-active');
                activeFilters[fType] = null;
            } else {
                $group.find('.ni-opt-btn').removeClass('is-active');
                $(this).addClass('is-active');
                activeFilters[fType] = val;

                // Smart Mode Switching: Bra Size vs Panty Size
                if (fType === 'size') {
                    activeFilters.cup = null;
                    activeFilters.band = null;
                    $('.ni-btn-group[data-filter="cup"] .ni-opt-btn, .ni-btn-group[data-filter="band"] .ni-opt-btn').removeClass('is-active');
                } else if (fType === 'cup' || fType === 'band') {
                    activeFilters.size = null;
                    $('.ni-btn-group[data-filter="size"] .ni-opt-btn').removeClass('is-active');
                }
            }

            niApplyFilters();
        });

        // Reset all filters
        $(document).on('click', '#ni-reset-filters-btn, #ni-empty-reset-btn', function(){
            for (var k in activeFilters) {
                activeFilters[k] = null;
            }
            $('.ni-opt-btn').removeClass('is-active');
            $('.ni-pill-btn').removeClass('is-active');
            niApplyFilters();
        });

        // Remove single chip
        $(document).on('click', '.ni-chip-remove', function(){
            var fType = $(this).data('type');
            activeFilters[fType] = null;
            $('.ni-btn-group[data-filter="' + fType + '"]').find('.ni-opt-btn').removeClass('is-active');
            niApplyFilters();
        });

        function niApplyFilters() {
            var $products = $('ul.products li.product');
            var totalCount = $products.length;
            var visibleCount = 0;
            var activeFilterCount = 0;

            // Update Trigger Pill Active State
            $('.ni-pill-btn').each(function(){
                var target = $(this).data('target');
                var $panel = $('#' + target);
                var hasActive = $panel.find('.ni-opt-btn.is-active').length > 0;
                $(this).toggleClass('is-active', hasActive);
            });

            // Build chips HTML
            var chipsHtml = '';
            for (var type in activeFilters) {
                var v = activeFilters[type];
                if (v) {
                    activeFilterCount++;
                    var label = v.toUpperCase();
                    if (type === 'cup') label = 'Cup: ' + (v === 'e' ? 'DD (E)' : (v === 'f' ? 'DDD (F)' : v.toUpperCase()));
                    if (type === 'band') label = 'Band: ' + v;
                    if (type === 'size') label = 'Brief Size: ' + v.toUpperCase();
                    if (type === 'brand') label = 'Brand: ' + (v.charAt(0).toUpperCase() + v.slice(1));
                    if (type === 'color') {
                        var cMap = { 'black': 'Black', 'beige': 'Beige', 'white': 'White', 'navy': 'Navy Blue', 'burgundy': 'Burgundy', 'mocha': 'Mocha' };
                        label = 'Color: ' + (cMap[v] || (v.charAt(0).toUpperCase() + v.slice(1)));
                    }
                    if (type === 'price') label = 'Price: ' + v;
                    chipsHtml += '<span class="ni-chip-badge">' + label + ' <span class="ni-chip-remove" data-type="' + type + '">✕</span></span>';
                }
            }

            if (activeFilterCount > 0) {
                $('#ni-active-chips-container').html(chipsHtml).show();
                $('#ni-reset-filters-btn').show();
                $('#ni-filter-count-badge').text(activeFilterCount).show();
            } else {
                $('#ni-active-chips-container').hide().empty();
                $('#ni-reset-filters-btn').hide();
                $('#ni-filter-count-badge').hide();
            }

            // Filter each product
            $products.each(function(){
                var $p = $(this);
                var match = true;

                // Brand
                if (activeFilters.brand && !$p.hasClass('ni-f-brand-' + activeFilters.brand)) {
                    match = false;
                }

                // Bra Size: Band & Cup
                if (activeFilters.band && activeFilters.cup) {
                    var exactBraClass = 'ni-f-bra-' + activeFilters.band + activeFilters.cup;
                    if (!$p.hasClass(exactBraClass)) {
                        match = false;
                    }
                } else {
                    if (activeFilters.band && !$p.hasClass('ni-f-band-' + activeFilters.band)) {
                        match = false;
                    }
                    if (activeFilters.cup && !$p.hasClass('ni-f-cup-' + activeFilters.cup)) {
                        match = false;
                    }
                }

                // Panty / Brief Size
                if (activeFilters.size && !$p.hasClass('ni-f-size-' + activeFilters.size)) {
                    match = false;
                }

                // Color
                if (activeFilters.color && !$p.hasClass('ni-f-color-' + activeFilters.color)) {
                    match = false;
                }

                // Price
                if (activeFilters.price && !$p.hasClass('ni-f-price-' + activeFilters.price)) {
                    match = false;
                }

                if (match) {
                    $p.removeClass('ni-filter-hidden').fadeIn(150);
                    visibleCount++;
                } else {
                    $p.addClass('ni-filter-hidden').hide();
                }
            });

            // Update matching count text
            if (activeFilterCount > 0) {
                $('#ni-matching-results-text').html('Showing <strong>' + visibleCount + '</strong> of ' + totalCount + ' styles');
            } else {
                $('#ni-matching-results-text').text('Showing all ' + totalCount + ' styles');
            }

            // Empty state handling
            $('#ni-no-results-msg').remove();
            if (visibleCount === 0 && totalCount > 0) {
                $('ul.products').append('<li id="ni-no-results-msg"><div style="font-size:24px; margin-bottom:8px;">👙</div><div style="font-weight:700; font-size:16px; margin-bottom:4px; color:#2d1e26;">No matching styles found</div><div style="font-size:13px; color:#5c4752; margin-bottom:14px;">Try selecting a different sister size, cup, or band.</div><button type="button" class="ni-pill-btn" id="ni-empty-reset-btn" style="background:#823a54; color:#fff; border:none; padding:8px 16px; border-radius:20px; font-size:12px; font-weight:600; cursor:pointer;">Reset All Filters</button></li>');
            }
        }

        $(document).ready(function(){
            niEnsureFilterBarPlacement();
            $(window).on('load', niEnsureFilterBarPlacement);
        });

    })(jQuery);
    </script>
    <?php
}
`;

async function deployFixedFilters() {
  console.log('=== WDRAŻANIE KOMPLEKSOWEJ POPRAWKI SILNIKA FILTRÓW ROZMIARÓW ===\n');

  // 1. Zaktualizuj Snippet #91
  console.log('1. Aktualizacja Snippetu #91 przez WordPress REST API...');
  const payload91 = JSON.stringify({
    name: 'Natura Intimo – Luxury Catalog & Brafitting Product Filter Engine',
    code: snippet91Php.replace(/^<\?php\s*/, ''),
    scope: 'global',
    active: true
  });

  const res91 = await fetch(`${siteUrl}/wp-json/code-snippets/v1/snippets/91`, {
    method: 'PUT',
    headers: { Authorization: wpAuth, 'Content-Type': 'application/json' },
    body: payload91
  });

  console.log('Status Snippet #91:', res91.status);
  const data91 = await res91.json();
  console.log('Snippet #91 Active:', data91.active);
  if (data91.code_error) {
    console.error('❌ CODE ERROR IN SNIPPET 91:', data91.code_error);
    process.exit(1);
  }

  // 2. Aktualizacja Page ID 6896 (/new-arrivals/) na limit 60 produktów
  console.log('\n2. Aktualizacja strony /new-arrivals/ (Page ID 6896) na limit="60"...');
  const resPage = await fetch(`${siteUrl}/wp-json/wp/v2/pages/6896`, {
    method: 'POST',
    headers: { Authorization: wpAuth, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      content: '[ni_filter_bar]\n[products category="new-arrivals" limit="60" columns="4"]'
    })
  });
  console.log('Status Page 6896 update:', resPage.status);

  // 3. Czyszczenie pamięci podręcznej LiteSpeed
  console.log('\n3. Czyszczenie pamięci podręcznej LiteSpeed...');
  try {
    await fetch(`${siteUrl}/?purge_cache=1`);
    for (const pageId of [6896, 6931]) {
      await fetch(`${siteUrl}/wp-json/wp/v2/pages/${pageId}`, {
        method: 'POST',
        headers: { Authorization: wpAuth, 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
    }
    console.log('✅ LiteSpeed Cache wyczyszczony!');
  } catch (e) {
    console.warn('Uwaga cache:', e.message);
  }
}

deployFixedFilters().catch(err => {
  console.error('Błąd:', err);
  process.exit(1);
});
