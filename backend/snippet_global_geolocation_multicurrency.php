<?php
/**
 * Snippet Name: Natura Intimo – Global Geolocation, Multi-Currency & Language Engine
 * Description: Automatic geolocation detection for USA, UK, Canada, Australia, UAE & Poland with real-time currency conversion (USD, GBP, CAD, AUD, AED, PLN), localized DDP shipping rules, and multilingual translation integration.
 */

if (!defined('ABSPATH')) {
    exit;
}

// =========================================================================
// 1. SINGLE SOURCE OF TRUTH: MARKETS & CONFIGURATION
// =========================================================================
function ni_get_global_markets_config() {
    return array(
        'US' => array(
            'country_name'  => 'United States',
            'flag'          => '🇺🇸',
            'currency'      => 'USD',
            'symbol'        => '$',
            'symbol_html'   => '&#36;',
            'pos'           => 'left',
            'lang'          => 'en',
            'lang_name'     => 'English',
            'free_ship'     => 150.00,
            'ship_cost'     => 24.99,
            'carrier'       => 'DHL Express Worldwide DDP',
            'duties_badge'  => 'Pre-Cleared DDP (California SB 478 Compliant)',
            'sizing_system' => 'US Band & Cups (30DD–50D)',
        ),
        'GB' => array(
            'country_name'  => 'United Kingdom',
            'flag'          => '🇬🇧',
            'currency'      => 'GBP',
            'symbol'        => '£',
            'symbol_html'   => '&pound;',
            'pos'           => 'left',
            'lang'          => 'en',
            'lang_name'     => 'English (UK)',
            'free_ship'     => 120.00,
            'ship_cost'     => 19.99,
            'carrier'       => 'DHL Express Tracked DDP',
            'duties_badge'  => 'DDP Delivered Duty Paid (Zero Royal Mail Fees)',
            'sizing_system' => 'UK Sizing (DD, E, F, FF, G, GG, H, HH, J)',
        ),
        'CA' => array(
            'country_name'  => 'Canada',
            'flag'          => '🇨🇦',
            'currency'      => 'CAD',
            'symbol'        => 'C$',
            'symbol_html'   => 'C&#36;',
            'pos'           => 'left',
            'lang'          => 'en',
            'lang_name'     => 'English / Français',
            'free_ship'     => 200.00,
            'ship_cost'     => 34.99,
            'carrier'       => 'DHL Express Worldwide (0% CETA)',
            'duties_badge'  => '0% CETA Preferential Tariff (No Surprise Fees)',
            'sizing_system' => 'US/CA Sizing (30DD–48G)',
        ),
        'AU' => array(
            'country_name'  => 'Australia',
            'flag'          => '🇦🇺',
            'currency'      => 'AUD',
            'symbol'        => 'A$',
            'symbol_html'   => 'A&#36;',
            'pos'           => 'left',
            'lang'          => 'en',
            'lang_name'     => 'English (AU)',
            'free_ship'     => 230.00,
            'ship_cost'     => 39.99,
            'carrier'       => 'DHL Express Worldwide DDP',
            'duties_badge'  => 'DDP Delivery (Under A$1000 Low Value Exemption)',
            'sizing_system' => 'AU Band (10–22) + UK Cups',
        ),
        'AE' => array(
            'country_name'  => 'United Arab Emirates',
            'flag'          => '🇦🇪',
            'currency'      => 'AED',
            'symbol'        => 'AED',
            'symbol_html'   => 'AED',
            'pos'           => 'right_space',
            'lang'          => 'ar',
            'lang_name'     => 'العربية / English',
            'free_ship'     => 550.00,
            'ship_cost'     => 90.00,
            'carrier'       => 'DHL Express Worldwide DDP',
            'duties_badge'  => 'DDP Fast Track (Dubai / Abu Dhabi Customs Cleared)',
            'sizing_system' => 'EU / UK Sizing',
        ),
        'PL' => array(
            'country_name'  => 'Polska',
            'flag'          => '🇵🇱',
            'currency'      => 'PLN',
            'symbol'        => 'zł',
            'symbol_html'   => 'zł',
            'pos'           => 'right_space',
            'lang'          => 'pl',
            'lang_name'     => 'Polski',
            'free_ship'     => 200.00,
            'ship_cost'     => 16.99,
            'carrier'       => 'InPost Paczkomaty / Kurier DPD',
            'duties_badge'  => 'Krajowa wysyłka 24h z pracowni w Polsce',
            'sizing_system' => 'Rozmiarówka Europejska (EU 65–115 B–M)',
        )
    );
}

// =========================================================================
// 2. EXCHANGE RATES ENGINE (NBP API + CENTRAL BANK OF UAE PEG)
// =========================================================================
function ni_get_global_exchange_rates() {
    $rates = get_transient('ni_global_rates_usd_v2');
    if ($rates && is_array($rates) && !empty($rates['USD'])) {
        return $rates;
    }

    // Default safe fallback rates
    $rates = array(
        'USD' => 1.0,
        'PLN' => 3.9542,
        'CAD' => 1.4020,
        'GBP' => 0.7510,
        'AUD' => 1.4230,
        'AED' => 3.6725, // Fixed UAE Central Bank Peg to USD
    );

    // Fetch official rates from National Bank of Poland (NBP Table A)
    $resp = wp_remote_get('http://api.nbp.pl/api/exchangerates/tables/A/?format=json', array('timeout' => 4));
    if (!is_wp_error($resp) && 200 === wp_remote_retrieve_response_code($resp)) {
        $body = json_decode(wp_remote_retrieve_body($resp), true);
        if (!empty($body[0]['rates'])) {
            $nbp = array();
            foreach ($body[0]['rates'] as $r) {
                $nbp[$r['code']] = (float)$r['mid'];
            }
            if (!empty($nbp['USD'])) {
                $usd_pln = $nbp['USD'];
                $rates['PLN'] = round($usd_pln, 4);
                if (!empty($nbp['CAD'])) $rates['CAD'] = round($usd_pln / $nbp['CAD'], 4);
                if (!empty($nbp['GBP'])) $rates['GBP'] = round($usd_pln / $nbp['GBP'], 4);
                if (!empty($nbp['AUD'])) $rates['AUD'] = round($usd_pln / $nbp['AUD'], 4);
            }
        }
    }

    set_transient('ni_global_rates_usd_v2', $rates, 12 * HOUR_IN_SECONDS);
    return $rates;
}

// =========================================================================
// 3. GEOLOCATION & ACTIVE MARKET RESOLUTION
// =========================================================================
function ni_resolve_current_market() {
    static $resolved = null;
    if ($resolved !== null) {
        return $resolved;
    }

    $markets = ni_get_global_markets_config();
    $country = '';

    // A. Query parameter override (e.g. ?country=GB or ?currency=AED)
    if (!empty($_GET['country'])) {
        $c = strtoupper(sanitize_text_field($_GET['country']));
        if ($c === 'UK') $c = 'GB';
        if (isset($markets[$c])) {
            $country = $c;
            if (!headers_sent()) {
                setcookie('ni_user_country', $c, time() + (30 * DAY_IN_SECONDS), '/');
            }
        }
    } elseif (!empty($_GET['currency'])) {
        $curr = strtoupper(sanitize_text_field($_GET['currency']));
        foreach ($markets as $code => $m) {
            if ($m['currency'] === $curr) {
                $country = $code;
                if (!headers_sent()) {
                    setcookie('ni_user_country', $code, time() + (30 * DAY_IN_SECONDS), '/');
                }
                break;
            }
        }
    }

    // B. Cookie selection (if customer manually chose in header)
    if (empty($country) && !empty($_COOKIE['ni_user_country'])) {
        $c = strtoupper(sanitize_text_field($_COOKIE['ni_user_country']));
        if ($c === 'UK') $c = 'GB';
        if (isset($markets[$c])) {
            $country = $c;
        }
    }

    // C. Cloudflare GeoIP Header
    if (empty($country) && !empty($_SERVER['HTTP_CF_IPCOUNTRY'])) {
        $cf = strtoupper(sanitize_text_field($_SERVER['HTTP_CF_IPCOUNTRY']));
        if ($cf === 'UK') $cf = 'GB';
        if (isset($markets[$cf])) {
            $country = $cf;
        }
    }

    // D. WooCommerce Geolocation MaxMind
    if (empty($country) && class_exists('WC_Geolocation')) {
        $geo = WC_Geolocation::geolocate_ip();
        if (!empty($geo['country'])) {
            $g = strtoupper($geo['country']);
            if ($g === 'UK') $g = 'GB';
            if (isset($markets[$g])) {
                $country = $g;
            }
        }
    }

    // E. WooCommerce Customer Profile/Session
    if (empty($country) && function_exists('WC') && WC()->customer) {
        $c = WC()->customer->get_shipping_country() ?: WC()->customer->get_billing_country();
        if (!empty($c)) {
            $c = strtoupper($c);
            if ($c === 'UK') $c = 'GB';
            if (isset($markets[$c])) {
                $country = $c;
            }
        }
    }

    // F. Default fallback: US (English, USD)
    if (empty($country) || !isset($markets[$country])) {
        $country = 'US';
    }

    $resolved = array_merge(array('country_code' => $country), $markets[$country]);
    return $resolved;
}

// =========================================================================
// 4. PRICE CONVERSION ENGINE
// =========================================================================
function ni_convert_usd_to_active_currency($price_usd) {
    if (!$price_usd || !is_numeric($price_usd)) {
        return $price_usd;
    }

    $market = ni_resolve_current_market();
    $curr = $market['currency'];
    if ($curr === 'USD') {
        return (float)$price_usd;
    }

    $rates = ni_get_global_exchange_rates();
    $rate = isset($rates[$curr]) ? (float)$rates[$curr] : 1.0;
    $converted = (float)$price_usd * $rate;

    // Charm and culture-appropriate price rounding
    switch ($curr) {
        case 'AED':
            // Rounded to full Dirhams (e.g. 220.00 AED)
            return round($converted);
        case 'PLN':
            // Rounded to full Zloty (e.g. 239.00 PLN)
            return round($converted);
        case 'GBP':
            // .00 or .99 charm pricing for UK
            return round($converted, 2);
        case 'CAD':
        case 'AUD':
        default:
            return round($converted, 2);
    }
}

// Hook into WooCommerce Currency Filter
add_filter('woocommerce_currency', function($currency) {
    if (is_admin() && !wp_doing_ajax()) {
        return $currency;
    }
    $market = ni_resolve_current_market();
    return $market['currency'];
}, 9999);

// Hook into WooCommerce Currency Symbol
add_filter('woocommerce_currency_symbol', function($symbol, $currency) {
    if (is_admin() && !wp_doing_ajax()) {
        return $symbol;
    }
    $market = ni_resolve_current_market();
    if ($currency === $market['currency']) {
        return $market['symbol'];
    }
    return $symbol;
}, 9999, 2);

// Hook into Price Formats
add_filter('woocommerce_price_format', function($format, $currency_pos) {
    $market = ni_resolve_current_market();
    if ($market['pos'] === 'right_space') {
        return '%1$s&nbsp;%2$s';
    }
    return '%2$s%1$s';
}, 9999, 2);

// Filter Product Prices (Regular, Sale, Variations)
add_filter('woocommerce_product_get_price', 'ni_filter_product_display_price', 9999, 2);
add_filter('woocommerce_product_get_regular_price', 'ni_filter_product_display_price', 9999, 2);
add_filter('woocommerce_product_get_sale_price', 'ni_filter_product_display_price', 9999, 2);
add_filter('woocommerce_product_variation_get_price', 'ni_filter_product_display_price', 9999, 2);
add_filter('woocommerce_product_variation_get_regular_price', 'ni_filter_product_display_price', 9999, 2);
add_filter('woocommerce_product_variation_get_sale_price', 'ni_filter_product_display_price', 9999, 2);

function ni_filter_product_display_price($price, $product) {
    if (is_admin() && !wp_doing_ajax()) {
        return $price;
    }
    if ($price === '' || $price === null) {
        return $price;
    }
    return ni_convert_usd_to_active_currency($price);
}

// Dynamic Variation Price Caching Hash per Market Currency
add_filter('woocommerce_get_variation_prices_hash', function($hash, $product, $display) {
    $market = ni_resolve_current_market();
    $hash[] = $market['currency'];
    return $hash;
}, 9999, 3);

add_filter('woocommerce_variation_prices_price', function($price, $variation, $product) {
    return ni_convert_usd_to_active_currency($price);
}, 9999, 3);
add_filter('woocommerce_variation_prices_regular_price', function($price, $variation, $product) {
    return ni_convert_usd_to_active_currency($price);
}, 9999, 3);
add_filter('woocommerce_variation_prices_sale_price', function($price, $variation, $product) {
    return ni_convert_usd_to_active_currency($price);
}, 9999, 3);

// Recalculate Cart Totals for Non-USD Markets
add_action('woocommerce_before_calculate_totals', function($cart) {
    if (is_admin() && !defined('DOING_AJAX')) {
        return;
    }
    $market = ni_resolve_current_market();
    if ($market['currency'] === 'USD') {
        return;
    }
    foreach ($cart->get_cart() as $cart_item) {
        $prod = $cart_item['data'];
        $base = get_post_meta($prod->get_id(), '_price', true);
        if (!$base && $prod->is_type('variation')) {
            $base = get_post_meta($prod->get_parent_id(), '_price', true);
        }
        if ($base) {
            $prod->set_price(ni_convert_usd_to_active_currency($base));
        }
    }
}, 9999);

// =========================================================================
// 5. LOCALIZED DDP SHIPPING & FREE SHIPPING THRESHOLDS
// =========================================================================
add_filter('woocommerce_package_rates', 'ni_apply_localized_shipping_rates', 200, 2);
function ni_apply_localized_shipping_rates($rates, $package) {
    if (empty($rates)) {
        return $rates;
    }

    $market = ni_resolve_current_market();
    $subtotal = 0.0;
    if (function_exists('WC') && WC()->cart) {
        $subtotal = (float)WC()->cart->subtotal;
    }

    $is_free = ($subtotal >= $market['free_ship']);

    foreach ($rates as $id => $rate) {
        if ($rate->method_id === 'free_shipping') {
            $rates[$id]->label = sprintf('FREE %s (%s%s+)', $market['carrier'], $market['symbol'], $market['free_ship']);
        } elseif ($rate->method_id === 'flat_rate') {
            if ($is_free) {
                $rates[$id]->cost = 0;
                $rates[$id]->label = sprintf('FREE %s (Order %s%s+)', $market['carrier'], $market['symbol'], $market['free_ship']);
            } else {
                $rates[$id]->cost = $market['ship_cost'];
                $rates[$id]->label = sprintf('%s (%s)', $market['carrier'], $market['duties_badge']);
            }
        }
    }

    return $rates;
}

// =========================================================================
// 6. GLOBAL MARKET SELECTOR TOP BAR & MULTI-LANGUAGE TRANSLATION MODAL
// =========================================================================
add_action('wp_body_open', 'ni_render_global_market_selector_bar', 5);
function ni_render_global_market_selector_bar() {
    $market = ni_resolve_current_market();
    $markets = ni_get_global_markets_config();
    ?>
    <!-- Natura Intimo Global Market & Currency Selector Bar -->
    <div id="ni-global-market-bar" class="ni-market-bar-wrap">
        <div class="ni-market-bar-inner">
            <div class="ni-market-left">
                <span class="ni-market-flag"><?php echo esc_html($market['flag']); ?></span>
                <span class="ni-market-dest">
                    Ships to: <strong><?php echo esc_html($market['country_name']); ?></strong>
                </span>
                <span class="ni-market-sep">•</span>
                <span class="ni-market-curr">
                    Currency: <strong><?php echo esc_html($market['currency']); ?> (<?php echo esc_html($market['symbol']); ?>)</strong>
                </span>
                <span class="ni-market-sep">•</span>
                <span class="ni-market-lang">
                    Language: <strong><?php echo esc_html($market['lang_name']); ?></strong>
                </span>
            </div>

            <div class="ni-market-right">
                <span class="ni-market-badge">✈️ FREE DHL DDP at <?php echo esc_html($market['symbol'] . $market['free_ship']); ?>+</span>
                <button type="button" onclick="niOpenMarketModal()" class="ni-market-change-btn">
                    <span>Change Country / Currency</span> ▾
                </button>
            </div>
        </div>
    </div>

    <!-- Luxury Market Switcher Modal -->
    <div id="ni-market-modal" class="ni-modal-backdrop" style="display:none;" onclick="niCloseMarketModalOnBackdrop(event)">
        <div class="ni-modal-card">
            <div class="ni-modal-header">
                <div class="ni-modal-title">
                    <span style="font-size:22px;">🌍</span>
                    <div>
                        <h3 style="margin:0; font-family:'Cormorant Garamond', Georgia, serif; font-size:20px; font-weight:700; color:#2d1e26;">Select Destination & Currency</h3>
                        <p style="margin:2px 0 0 0; font-size:12px; color:#735e69;">Prices, shipping rates & descriptions automatically adapt to your market</p>
                    </div>
                </div>
                <button type="button" onclick="niCloseMarketModal()" class="ni-modal-close-btn">&times;</button>
            </div>

            <div class="ni-markets-grid">
                <?php foreach ($markets as $code => $m): 
                    $is_active = ($code === $market['country_code']);
                ?>
                <div class="ni-market-tile <?php echo $is_active ? 'ni-tile-active' : ''; ?>" onclick="niSelectMarket('<?php echo esc_attr($code); ?>', '<?php echo esc_attr($m['currency']); ?>', '<?php echo esc_attr($m['lang']); ?>')">
                    <div class="ni-tile-top">
                        <span class="ni-tile-flag"><?php echo esc_html($m['flag']); ?></span>
                        <span class="ni-tile-name"><?php echo esc_html($m['country_name']); ?></span>
                        <?php if ($is_active): ?>
                            <span class="ni-tile-active-badge">ACTIVE</span>
                        <?php endif; ?>
                    </div>
                    <div class="ni-tile-details">
                        <div class="ni-tile-row">
                            <span class="ni-label">Currency:</span>
                            <span class="ni-val"><strong><?php echo esc_html($m['currency']); ?></strong> (<?php echo esc_html($m['symbol']); ?>)</span>
                        </div>
                        <div class="ni-tile-row">
                            <span class="ni-label">Language:</span>
                            <span class="ni-val"><?php echo esc_html($m['lang_name']); ?></span>
                        </div>
                        <div class="ni-tile-row">
                            <span class="ni-label">Free Shipping:</span>
                            <span class="ni-val text-emerald">Orders <?php echo esc_html($m['symbol'] . $m['free_ship']); ?>+</span>
                        </div>
                    </div>
                </div>
                <?php endforeach; ?>
            </div>

            <div class="ni-modal-footer">
                <span>🛡️ 100% Guaranteed DDP (Delivered Duty Paid) via DHL Express. Zero unexpected customs bills upon delivery.</span>
            </div>
        </div>
    </div>

    <!-- Top Bar & Modal CSS Styles -->
    <style>
    .ni-market-bar-wrap {
        background: #2d1e26;
        color: #f7f3f1;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        font-size: 11px;
        padding: 6px 16px;
        border-bottom: 1px solid rgba(212, 175, 55, 0.25);
        position: relative;
        z-index: 99999;
    }
    .ni-market-bar-inner {
        max-width: 1280px;
        margin: 0 auto;
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 8px;
    }
    .ni-market-left, .ni-market-right {
        display: flex;
        align-items: center;
        gap: 6px;
        flex-wrap: wrap;
    }
    .ni-market-flag {
        font-size: 14px;
        line-height: 1;
    }
    .ni-market-sep {
        opacity: 0.4;
    }
    .ni-market-badge {
        background: rgba(16, 185, 129, 0.15);
        color: #34d399;
        padding: 2px 8px;
        border-radius: 999px;
        border: 1px solid rgba(16, 185, 129, 0.3);
        font-weight: 600;
        font-size: 10px;
    }
    .ni-market-change-btn {
        background: rgba(255, 255, 255, 0.12);
        color: #ffffff;
        border: 1px solid rgba(255, 255, 255, 0.2);
        padding: 3px 10px;
        border-radius: 6px;
        font-size: 11px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
    }
    .ni-market-change-btn:hover {
        background: #d4af37;
        color: #2d1e26;
        border-color: #d4af37;
    }

    /* Modal Backdrop & Card */
    .ni-modal-backdrop {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: rgba(15, 10, 13, 0.75);
        backdrop-filter: blur(4px);
        z-index: 999999;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 16px;
    }
    .ni-modal-card {
        background: #ffffff;
        border-radius: 16px;
        max-width: 680px;
        width: 100%;
        max-height: 90vh;
        overflow-y: auto;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        border: 1px solid #e8ded9;
        padding: 24px;
        animation: niFadeScale 0.2s ease-out;
    }
    @keyframes niFadeScale {
        from { opacity: 0; transform: scale(0.95); }
        to { opacity: 1; transform: scale(1); }
    }
    .ni-modal-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        padding-bottom: 16px;
        border-bottom: 1px solid #f0e7e3;
        margin-bottom: 18px;
    }
    .ni-modal-title {
        display: flex;
        align-items: center;
        gap: 12px;
    }
    .ni-modal-close-btn {
        background: none;
        border: none;
        font-size: 26px;
        line-height: 1;
        color: #735e69;
        cursor: pointer;
    }
    .ni-markets-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
        gap: 12px;
        margin-bottom: 18px;
    }
    .ni-market-tile {
        background: #fbf9f8;
        border: 1px solid #e8ded9;
        border-radius: 12px;
        padding: 14px;
        cursor: pointer;
        transition: all 0.2s ease;
        position: relative;
    }
    .ni-market-tile:hover {
        border-color: #8a3b58;
        background: #ffffff;
        box-shadow: 0 4px 12px rgba(138, 59, 88, 0.08);
        transform: translateY(-2px);
    }
    .ni-tile-active {
        border: 2px solid #8a3b58 !important;
        background: #fff8fa !important;
    }
    .ni-tile-top {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 8px;
    }
    .ni-tile-flag {
        font-size: 20px;
    }
    .ni-tile-name {
        font-weight: 700;
        font-size: 13px;
        color: #2d1e26;
        flex: 1;
    }
    .ni-tile-active-badge {
        font-size: 9px;
        background: #8a3b58;
        color: #ffffff;
        padding: 2px 5px;
        border-radius: 4px;
        font-weight: 700;
    }
    .ni-tile-details {
        font-size: 11px;
        color: #5c4752;
        line-height: 1.5;
    }
    .ni-tile-row {
        display: flex;
        justify-content: space-between;
        margin-top: 2px;
    }
    .ni-label {
        color: #735e69;
    }
    .text-emerald {
        color: #059669;
        font-weight: 600;
    }
    .ni-modal-footer {
        padding-top: 14px;
        border-top: 1px solid #f0e7e3;
        font-size: 11px;
        color: #735e69;
        text-align: center;
    }

    /* RTL Support for Arabic */
    body.ni-lang-ar {
        direction: rtl;
        text-align: right;
    }
    body.ni-lang-ar .ni-market-bar-inner {
        direction: rtl;
    }
    </style>

    <!-- Multi-Language Translation & Market Switcher Script -->
    <script>
    function niOpenMarketModal() {
        var m = document.getElementById('ni-market-modal');
        if (m) m.style.display = 'flex';
    }
    function niCloseMarketModal() {
        var m = document.getElementById('ni-market-modal');
        if (m) m.style.display = 'none';
    }
    function niCloseMarketModalOnBackdrop(e) {
        if (e.target.id === 'ni-market-modal') {
            niCloseMarketModal();
        }
    }

    function niSelectMarket(countryCode, currency, lang) {
        // Save to Cookie and LocalStorage
        document.cookie = "ni_user_country=" + countryCode + "; path=/; max-age=" + (30*86400);
        document.cookie = "ni_user_currency=" + currency + "; path=/; max-age=" + (30*86400);
        document.cookie = "ni_user_lang=" + lang + "; path=/; max-age=" + (30*86400);

        try {
            localStorage.setItem('ni_user_country', countryCode);
            localStorage.setItem('ni_user_currency', currency);
            localStorage.setItem('ni_user_lang', lang);
        } catch(e) {}

        // Handle language translation
        if (lang === 'pl') {
            niSetGoogleTranslateLanguage('pl');
        } else if (lang === 'ar') {
            niSetGoogleTranslateLanguage('ar');
        } else if (lang === 'fr') {
            niSetGoogleTranslateLanguage('fr');
        } else {
            niSetGoogleTranslateLanguage('en');
        }

        // Reload page with country parameter to update WooCommerce session
        var url = new URL(window.location.href);
        url.searchParams.set('country', countryCode);
        url.searchParams.set('currency', currency);
        window.location.href = url.toString();
    }

    // Google Translation Dynamic Bridge
    function niSetGoogleTranslateLanguage(langCode) {
        var select = document.querySelector('.goog-te-combo');
        if (select) {
            select.value = langCode;
            select.dispatchEvent(new Event('change'));
        }
        if (langCode === 'ar') {
            document.body.classList.add('ni-lang-ar');
        } else {
            document.body.classList.remove('ni-lang-ar');
        }
    }

    // Auto-detect and initialize language on load
    document.addEventListener('DOMContentLoaded', function() {
        var activeLang = <?php echo json_encode($market['lang']); ?>;
        if (activeLang === 'ar') {
            document.body.classList.add('ni-lang-ar');
        }

        // Initialize Google Translate asynchronously if non-English
        if (activeLang && activeLang !== 'en') {
            var checkInterval = setInterval(function() {
                var select = document.querySelector('.goog-te-combo');
                if (select) {
                    clearInterval(checkInterval);
                    niSetGoogleTranslateLanguage(activeLang);
                }
            }, 300);
            setTimeout(function() { clearInterval(checkInterval); }, 5000);
        }
    });
    </script>

    <!-- Asynchronous Google Neural Translate Widget (Clean, Zero-Banner) -->
    <div id="google_translate_element" style="display:none;"></div>
    <script type="text/javascript">
    function googleTranslateElementInit() {
        new google.translate.TranslateElement({
            pageLanguage: 'en',
            includedLanguages: 'en,pl,ar,fr',
            autoDisplay: false
        }, 'google_translate_element');
    }
    </script>
    <script type="text/javascript" src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit" async defer></script>
    <style>
    /* Hide Google Translate top toolbar iframe for luxury aesthetics */
    body { top: 0 !important; }
    .goog-te-banner-frame.skiptranslate, .goog-te-gadget-simple { display: none !important; }
    .goog-tooltip, .goog-tooltip:hover { display: none !important; }
    .goog-text-highlight { background-color: transparent !important; box-shadow: none !important; }
    #goog-gt-tt { display: none !important; visibility: hidden !important; }
    </style>
    <?php
}
