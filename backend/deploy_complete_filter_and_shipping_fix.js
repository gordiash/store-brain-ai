import dotenv from 'dotenv';
dotenv.config();

const wpUser = process.env.WP_ADMIN_USER;
const wpPass = process.env.WP_APP_PASSWORD;
const siteUrl = process.env.WOOCOMMERCE_URL || 'https://naturaintimo.com';

if (!wpUser || !wpPass) {
  throw new Error('Missing WP_ADMIN_USER or WP_APP_PASSWORD in .env');
}

const wpAuth = 'Basic ' + Buffer.from(`${wpUser}:${wpPass}`).toString('base64');

// =========================================================================
// 1. ZAKTUALIZOWANY SNIPPET #7: BEZWZGLĘDNE WYMUSZENIE $24.99 W CHECKOUT
// =========================================================================
const snippet7Php = `/**
 * Snippet Name: Natura Intimo – USA DDP Shipping & Minimum Order Engine (Option C2 Reactive Bar)
 * Description: All-Inclusive DHL Express DDP shipping ($24.99 flat / $150 free), $0 extra checkout fees, dynamic AJAX perks bar, checkout trust badges, customs fields, and US/CA payment filtering.
 */

if (!defined('ABSPATH')) {
    exit;
}

// Helper: Safely get cart subtotal as a float
function ni_get_cart_subtotal_amount() {
    if (!function_exists('WC') || !WC()->cart) {
        return 0.0;
    }
    return (float) WC()->cart->subtotal;
}

// 1. Minimum Order: NO BLOCKING (per market_config.json minimumOrderAmount = 0).
// Single bra purchases under $99 USD are fully supported and welcomed.

// 2. Dynamic DDP Customs Fee: REMOVED / ABSORBED BY STORE (Option C2).
// Store covers all customs clearance and duties directly. No surprise extra fee line in cart or checkout!

// 3. ENFORCE $24.99 FLAT RATE SHIPPING IN CART & CHECKOUT (Zero old 19.99 leaks)
add_filter('woocommerce_package_rates', 'ni_enforce_dhl_flat_rate_cost', 100, 2);
function ni_enforce_dhl_flat_rate_cost($rates, $package) {
    if (empty($rates)) return $rates;

    $country = isset($package['destination']['country']) ? $package['destination']['country'] : '';
    if (empty($country) && function_exists('WC') && WC()->customer) {
        $country = WC()->customer->get_shipping_country() ?: WC()->customer->get_billing_country();
    }

    $subtotal = ni_get_cart_subtotal_amount();
    $has_free_shipping = false;

    // Check if free shipping is already available ($150+ threshold)
    foreach ($rates as $rate_id => $rate) {
        if ($rate->method_id === 'free_shipping') {
            $has_free_shipping = true;
            $rates[$rate_id]->label = 'FREE DHL Express Worldwide (Duties & Taxes Pre-Paid)';
        }
    }

    foreach ($rates as $rate_id => $rate) {
        if ($rate->method_id === 'flat_rate') {
            $rates[$rate_id]->cost = 24.99;
            if ($country === 'CA') {
                $rates[$rate_id]->label = 'DHL Express Tracked to Canada (0% CETA Duty)';
            } else {
                $rates[$rate_id]->label = 'DHL Express Worldwide (Pre-Cleared DDP — All Duties & Taxes Included)';
            }
            if (isset($rates[$rate_id]->taxes) && is_array($rates[$rate_id]->taxes)) {
                $rates[$rate_id]->taxes = array_map(function() { return 0; }, $rates[$rate_id]->taxes);
            }
        }
    }

    return $rates;
}

// 4. Reactive Perks Progress Bar in Cart & Checkout ($150 Free DHL Express Worldwide)
add_action('woocommerce_before_cart', 'ni_render_usa_progress_bar', 10);
add_action('woocommerce_before_checkout_form', 'ni_render_usa_progress_bar', 5);
function ni_render_usa_progress_bar() {
    $country = (WC()->customer && method_exists(WC()->customer, 'get_shipping_country')) 
        ? WC()->customer->get_shipping_country() 
        : '';
    if (empty($country) && WC()->customer && method_exists(WC()->customer, 'get_billing_country')) {
        $country = WC()->customer->get_billing_country();
    }

    // Only hide if customer has explicitly selected Canada (CA has its own $200 CAD rules)
    if ($country === 'CA') {
        return;
    }

    $subtotal = ni_get_cart_subtotal_amount();
    $free_ship_threshold = 150.00;
    $pct = min(100, round(($subtotal / $free_ship_threshold) * 100));

    ?>
    <div id="ni-usa-perks-bar" class="ni-perks-container" style="background:#fffaf7; border:1px solid #ebdcd5; border-radius:10px; padding:16px 20px; margin-bottom:24px; box-shadow:0 2px 6px rgba(130,58,84,0.04); font-family:inherit;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
            <span class="ni-status-text" style="font-size:14px; font-weight:500; color:#2d3748;">
                Calculating delivery perks...
            </span>
            <span class="ni-pct-text" style="font-size:12px; font-weight:700; color:#823a54;">
                <?php echo $pct; ?>%
            </span>
        </div>

        <div style="background:#eee5e1; height:8px; border-radius:4px; overflow:hidden; position:relative; margin-bottom:10px;">
            <div class="ni-bar-fill" style="width:<?php echo $pct; ?>%; height:100%; background:linear-gradient(90deg, #d4a373, #823a54); border-radius:4px; transition:width 0.4s ease, background 0.4s ease;"></div>
        </div>

        <div style="display:flex; justify-content:space-between; font-size:12px; color:#5c4752;">
            <span class="ni-step-base" style="font-weight:600; color:#5c4752;">No Minimum Order</span>
            <span class="ni-step-150" style="color:<?php echo $subtotal >= 150 ? '#27ae60' : '#823a54'; ?>; font-weight:<?php echo $subtotal >= 150 ? '700' : '600'; ?>;">
                ✈️ $150 Free DHL Express (Duties Included)
            </span>
        </div>
        <div style="margin-top:10px; font-size:11px; color:#5c4752; line-height:1.45; border-top:1px dashed #eeded6; padding-top:8px;">
            🛡️ <strong>California SB 478 Honest Pricing:</strong> All orders ship <strong>DDP (Delivery Duty Paid)</strong> via DHL Express directly from Poland (EU) with pre-cleared customs. Standard flat rate is $24.99, and orders $150+ receive <strong>100% FREE express shipping</strong>. Zero surprise fees upon delivery.
        </div>
    </div>

    <script type="text/javascript">
    (function($){
        var freeShipThreshold = 150.00;

        function niExtractCartSubtotal() {
            var rawText = $('.cart-subtotal .woocommerce-Price-amount bdi, .cart-subtotal .woocommerce-Price-amount, .order-total .woocommerce-Price-amount bdi').first().text();
            if (!rawText) return <?php echo json_encode($subtotal); ?>;
            var clean = rawText.replace(/[^0-9.]/g, '');
            var val = parseFloat(clean);
            return isNaN(val) ? <?php echo json_encode($subtotal); ?> : val;
        }

        function niUpdatePerksBarRealtime() {
            var subtotal = niExtractCartSubtotal();
            var pct = Math.min(100, Math.round((subtotal / freeShipThreshold) * 100));

            var statusHtml = '';
            var barColor = '';

            if (subtotal < freeShipThreshold) {
                var diff = (freeShipThreshold - subtotal).toFixed(2);
                statusHtml = '✈️ Add <strong>$' + diff + '</strong> more to unlock <strong>FREE DHL Express Worldwide Shipping</strong> ($150+)!';
                barColor = 'linear-gradient(90deg, #d4a373, #823a54)';
            } else {
                statusHtml = '🎉 <strong>VIP Status Unlocked:</strong> You unlocked <strong>100% FREE DHL Express Delivery</strong> & <strong>All U.S. Duties Pre-Paid</strong>!';
                barColor = 'linear-gradient(90deg, #d4af37, #27ae60)';
            }

            $('.ni-status-text').html(statusHtml);
            $('.ni-pct-text').text(pct + '%');
            $('.ni-bar-fill').css({ 'width': pct + '%', 'background': barColor });

            $('.ni-step-150').css({ 
                'color': subtotal >= 150 ? '#27ae60' : '#823a54', 
                'font-weight': subtotal >= 150 ? '700' : '600' 
            });
        }

        $(document).ready(function() {
            niUpdatePerksBarRealtime();
        });
        $(document.body).on('updated_wc_div updated_cart_totals updated_checkout', function() {
            setTimeout(niUpdatePerksBarRealtime, 60);
        });
    })(jQuery);
    </script>
    <?php
}

// 5. Guaranteed DDP Trust Badge on Checkout
add_action('woocommerce_review_order_after_shipping', 'ni_render_checkout_trust_badge');
function ni_render_checkout_trust_badge() {
    $country = (WC()->customer && method_exists(WC()->customer, 'get_shipping_country')) 
        ? WC()->customer->get_shipping_country() 
        : '';
    if (empty($country) && WC()->customer && method_exists(WC()->customer, 'get_billing_country')) {
        $country = WC()->customer->get_billing_country();
    }
    if ($country !== 'CA') {
        ?>
        <tr class="ni-ddp-guarantee-row">
            <td colspan="2" style="padding:14px; background:#fbfcfe; border:1px solid #e1e8ed; border-radius:8px; margin:8px 0;">
                <div style="display:flex; align-items:flex-start; gap:10px;">
                    <div style="font-size:20px; line-height:1;">🛡️</div>
                    <div style="font-size:12px; line-height:1.5; color:#4a5568;">
                        <strong style="color:#2d3748;">Guaranteed DDP (Delivery Duty Paid) to the USA:</strong><br/>
                        All orders are shipped directly from Poland (EU) via DHL Express with pre-cleared customs. All duties & import clearance are 100% covered. Zero additional carrier fees or taxes upon delivery.
                    </div>
                </div>
            </td>
        </tr>
        <?php
    }
}

// 6. Store DDP Metadata on order creation
add_action('woocommerce_checkout_create_order', 'ni_attach_ddp_meta_to_order', 10, 2);
function ni_attach_ddp_meta_to_order($order, $data) {
    if (!$order) return;
    $country = $order->get_shipping_country();
    if ($country === 'US') {
        $order->update_meta_data('_shipping_incoterms', 'DDP');
        $order->update_meta_data('_carrier_service', 'DHL Express Worldwide');
        $order->update_meta_data('_ddp_duty_status', 'Pre-cleared DDP - 100% Covered by Natura Intimo');
    }
}

// 7. Hide Polish payment gateways for US & CA customers
add_filter('woocommerce_available_payment_gateways', 'ni_filter_us_ca_payment_gateways');
function ni_filter_us_ca_payment_gateways($gateways) {
    if (is_admin()) return $gateways;
    $country = '';
    if (function_exists('WC') && WC()->customer) {
        $country = WC()->customer->get_shipping_country() ?: WC()->customer->get_billing_country();
    }
    if ($country === 'US' || $country === 'CA') {
        $polish_gateways = ['blik', 'przelewy24', 'p24', 'tpay', 'payu'];
        foreach ($polish_gateways as $pg) {
            if (isset($gateways[$pg])) {
                unset($gateways[$pg]);
            }
        }
    }
    return $gateways;
}

// 8. Custom Admin Product Fields for US Customs (Component classification only - HTS 6212.10 and 6108.22)
if (is_admin()) {
    add_action('woocommerce_product_options_general_product_data', 'ni_add_customs_product_fields');
    function ni_add_customs_product_fields() {
        if (!function_exists('woocommerce_wp_text_input')) return;
        echo '<div class="options_group" style="background:#fdfcfb; border-top:1px solid #eee; padding-top:12px;">';
        echo '<h4 style="margin:0 0 10px 12px; color:#823a54;">U.S. Customs & HTS Classification</h4>';

        woocommerce_wp_text_input(array(
            'id'          => '_hts_code',
            'label'       => __('US HTS Code', 'naturaintimo'),
            'placeholder' => '6212.10.9020',
            'desc_tip'    => true,
            'description' => __('Harmonized Tariff Schedule code (6212.10 for bras, 6108.22 for panties).', 'naturaintimo')
        ));

        woocommerce_wp_text_input(array(
            'id'          => '_country_of_origin',
            'label'       => __('Country of Origin', 'naturaintimo'),
            'placeholder' => 'PL',
            'desc_tip'    => true,
            'description' => __('2-letter ISO country code of manufacturing (default: PL - Poland).', 'naturaintimo')
        ));

        woocommerce_wp_text_input(array(
            'id'          => '_material_composition',
            'label'       => __('Material Composition', 'naturaintimo'),
            'placeholder' => '88% Polyamide, 12% Elastane',
            'desc_tip'    => true,
            'description' => __('Precise textile composition required for U.S. customs commercial invoice.', 'naturaintimo')
        ));

        woocommerce_wp_select(array(
            'id'          => '_customs_category',
            'label'       => __('Customs Category', 'naturaintimo'),
            'options'     => array(
                'bra'       => __('Brassiere / Bra (HTS 6212.10)', 'naturaintimo'),
                'panty'     => __('Briefs / Panties (HTS 6108.22)', 'naturaintimo'),
                'nightwear' => __('Nightwear / Chemise (HTS 6108.32)', 'naturaintimo'),
                'other'     => __('Other Apparel', 'naturaintimo')
            )
        ));

        woocommerce_wp_checkbox(array(
            'id'          => '_requires_customs_review',
            'label'       => __('Customs Review Required', 'naturaintimo'),
            'description' => __('Check if this product requires manual classification review prior to export.', 'naturaintimo')
        ));

        echo '</div>';
    }

    add_action('woocommerce_process_product_meta', 'ni_save_customs_product_fields');
    function ni_save_customs_product_fields($post_id) {
        if (isset($_POST['_hts_code'])) {
            update_post_meta($post_id, '_hts_code', sanitize_text_field($_POST['_hts_code']));
        }
        if (isset($_POST['_country_of_origin'])) {
            update_post_meta($post_id, '_country_of_origin', sanitize_text_field($_POST['_country_of_origin']));
        }
        if (isset($_POST['_material_composition'])) {
            update_post_meta($post_id, '_material_composition', sanitize_text_field($_POST['_material_composition']));
        }
        if (isset($_POST['_customs_category'])) {
            update_post_meta($post_id, '_customs_category', sanitize_text_field($_POST['_customs_category']));
        }
        $review = isset($_POST['_requires_customs_review']) ? 'yes' : 'no';
        update_post_meta($post_id, '_requires_customs_review', $review);
    }
}
`;

// =========================================================================
// 2. NOWY SNIPPET #91: SILNIK FILTRÓW PRODUKTOWYCH I BRAFITTINGU
// =========================================================================
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
        if (class_exists('\\LiteSpeed\\Purge')) {
            \\LiteSpeed\\Purge::purge_all();
        }
        do_action('litespeed_purge_all');
    }
});

// 1. Ensure all products in catalog are loaded for seamless filtering (no page cut-offs)
add_filter('loop_shop_per_page', function($cols) {
    return 60;
}, 999);

// 2. Tag each product in the catalog with filter classes based on real variations and attributes
add_filter('woocommerce_post_class', 'ni_enrich_product_card_classes', 25, 2);
function ni_enrich_product_card_classes($classes, $product) {
    if (!$product) return $classes;

    $name = $product->get_name();

    // Brand detection (Natura Intimo Core European Makers)
    $brands = ['Ava', 'Gaia', 'Gorsenia'];
    foreach ($brands as $b) {
        if (stripos($name, $b) !== false) {
            $classes[] = 'ni-f-brand-' . strtolower($b);
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
add_action('wp_footer', 'ni_inject_filter_bar_script');

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
                            '110' => '48 (110)'
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
                        <?php foreach (['Ava' => 'Ava Lingerie', 'Gaia' => 'Gaia Intimates', 'Gorsenia' => 'Gorsenia Full Bust'] as $bKey => $bName): ?>
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
                    💰 <span>Price Range</span> <small style="font-size:9px;">▼</small>
                </button>
                <div id="ni-panel-price" class="ni-filter-panel" style="display:none; position:absolute; top:calc(100% + 6px); left:0; z-index:9999; background:#fff; border:1px solid #ebdcd5; border-radius:12px; box-shadow:0 8px 24px rgba(45,30,38,0.12); padding:16px; width:200px;">
                    <div style="font-size:11px; font-weight:700; color:#823a54; text-transform:uppercase; margin-bottom:8px;">Price (USD):</div>
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
        // Move filter bar above products on pages like /new-arrivals/ if not naturally hooked
        function niEnsureFilterBarPlacement() {
            var $bar = $('#ni-luxury-filter-bar');
            var $products = $('ul.products');
            if ($bar.length && $products.length) {
                if (!$bar.next().is($products) && !$bar.parent().find('ul.products').length) {
                    $bar.insertBefore($products);
                }
            } else if (!$bar.length && $products.length) {
                // If hooked to before_shop_loop didn't fire (e.g. custom template)
                // Clone/re-render if needed
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
        $(document).on('click', '#ni-reset-filters-btn', function(){
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
                if (activeFilters.size && !$p.hasClass('ni-f-size-' + activeFilters.size)) {
                    match = false;
                }
                if (activeFilters.color && !$p.hasClass('ni-f-color-' + activeFilters.color)) {
                    match = false;
                }
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
                $('ul.products').append('<li id="ni-no-results-msg"><div style="font-size:24px; margin-bottom:8px;">👙</div><div style="font-weight:700; font-size:16px; margin-bottom:4px; color:#2d1e26;">No matching styles found</div><div style="font-size:13px; color:#5c4752; margin-bottom:14px;">Try selecting a different sister size, cup, or band.</div><button type="button" class="ni-pill-btn" onclick="jQuery(\\'#ni-reset-filters-btn\\').click()" style="background:#823a54; color:#fff; border:none; padding:8px 16px; border-radius:20px; font-size:12px; font-weight:600; cursor:pointer;">Reset All Filters</button></li>');
            }
        }

        $(document).ready(function(){
            niEnsureFilterBarPlacement();
            // Also ensure on window load or AJAX complete
            $(window).on('load', niEnsureFilterBarPlacement);
        });

    })(jQuery);
    </script>
    <?php
}
`;

async function deployUpdates() {
  console.log('=== WDRAŻANIE POPRAWKI KOSZYKA ($24.99) ORAZ FILTRA PRODUKTÓW W SKLEPIE ===\n');

  // 1. Aktualizacja Snippetu #7
  console.log('1. Aktualizacja Snippetu #7 (Wymuszenie $24.99 we wszystkich strefach i koszyku)...');
  const payload7 = JSON.stringify({
    name: 'Natura Intimo – USA DDP Shipping & Minimum Order Engine (Option C2 Reactive Bar)',
    code: snippet7Php.replace(/^<\?php\s*/, ''),
    scope: 'global',
    active: true
  });

  const res7 = await fetch(`${siteUrl}/wp-json/code-snippets/v1/snippets/7`, {
    method: 'PUT',
    headers: { Authorization: wpAuth, 'Content-Type': 'application/json' },
    body: payload7
  });
  console.log('Status Snippet #7:', res7.status);

  // 2. Wdrożenie Snippetu #91 (Filtr Produktów)
  console.log('\n2. Wdrożenie Snippetu #91 (Silnik Filtrów Brafittingowych & Katalogu)...');
  const listSnips = await (await fetch(`${siteUrl}/wp-json/code-snippets/v1/snippets`, { headers: { Authorization: wpAuth } })).json();
  const existing91 = listSnips.find(s => s.name && s.name.includes('Luxury Catalog & Brafitting Product Filter'));

  const payload91 = JSON.stringify({
    name: 'Natura Intimo – Luxury Catalog & Brafitting Product Filter Engine',
    code: snippet91Php.replace(/^<\?php\s*/, ''),
    scope: 'global',
    active: true
  });

  const targetUrl91 = `${siteUrl}/wp-json/code-snippets/v1/snippets/91`;
  const method91 = 'PUT';

  const res91 = await fetch(targetUrl91, {
    method: method91,
    headers: { Authorization: wpAuth, 'Content-Type': 'application/json' },
    body: payload91
  });

  console.log('Status Snippet #91:', res91.status);
  const data91 = await res91.json();
  console.log('✅ Snippet Filtrów ID:', data91.id, data91.name, 'Active:', data91.active);

  // 3. Purge LiteSpeed cache
  console.log('\n3. Czyszczenie pamięci podręcznej LiteSpeed...');
  try {
    await fetch(`${siteUrl}/?purge_cache=1`);
    // Touch pages to clear archive cache
    for (const pageId of [6896, 6931]) {
      await fetch(`${siteUrl}/wp-json/wp/v2/pages/${pageId}`, {
        method: 'POST',
        headers: { Authorization: wpAuth, 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
    }
    console.log('✅ Pamięć podręczna została wyczyszczona!');
  } catch (e) {
    console.warn('Uwaga przy czyszczeniu cache:', e.message);
  }
}

deployUpdates().catch(err => {
  console.error('❌ Błąd krytyczny:', err);
  process.exit(1);
});
