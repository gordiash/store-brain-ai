<?php
/**
 * Snippet Name: WooCommerce GA4 / GTM E-commerce DataLayer & Consent Mode v2 Engine
 * Description: Pushes enhanced GA4 e-commerce events (view_item, add_to_cart, view_cart, begin_checkout, purchase) with bundle discounts, coupons, and size/variant attributes to window.dataLayer, plus a lightweight, elegant Consent Banner updating Google Consent Mode v2.
 */

if (!defined('ABSPATH')) {
    exit;
}

// 1. Google Consent Mode v2 & Cookie Privacy Banner
add_action('wp_footer', function() {
    ?>
    <style>
    #ni-consent-banner {
        position: fixed;
        bottom: 20px;
        left: 20px;
        right: 20px;
        max-width: 580px;
        background: #2d1e26;
        color: #ffffff;
        padding: 18px 24px;
        border-radius: 16px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.25);
        z-index: 9999999;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        font-size: 13.5px;
        line-height: 1.55;
        display: none;
        box-sizing: border-box;
        border: 1px solid rgba(255,255,255,0.12);
    }
    #ni-consent-banner a {
        color: #f1dfe5;
        text-decoration: underline;
    }
    .ni-consent-actions {
        display: flex;
        gap: 10px;
        margin-top: 14px;
        flex-wrap: wrap;
        align-items: center;
    }
    .ni-consent-btn {
        border: none;
        border-radius: 8px;
        padding: 9px 18px;
        font-size: 13px;
        font-weight: 700;
        cursor: pointer;
        transition: opacity 0.2s;
    }
    .ni-consent-accept {
        background: #8e4f63;
        color: #ffffff;
    }
    .ni-consent-decline {
        background: rgba(255,255,255,0.15);
        color: #ffffff;
    }
    .ni-consent-btn:hover {
        opacity: 0.9;
    }
    @media (max-width: 600px) {
        #ni-consent-banner {
            left: 12px;
            right: 12px;
            bottom: 12px;
            padding: 16px;
        }
    }
    </style>
    <div id="ni-consent-banner" role="region" aria-label="Privacy and Cookie Consent">
        <div>
            We use essential and analytics cookies to ensure seamless checkout, calibrate personalized brafitting recommendations, and analyze store traffic. Review our <a href="/privacy-policy-usa-canada/" target="_blank">Privacy Policy</a>.
        </div>
        <div class="ni-consent-actions">
            <button class="ni-consent-btn ni-consent-accept" id="ni-accept-cookies">Accept All</button>
            <button class="ni-consent-btn ni-consent-decline" id="ni-decline-cookies">Essential Only</button>
        </div>
    </div>
    <script>
    (function() {
        var consentChoice = localStorage.getItem('ni_cookie_consent');
        var banner = document.getElementById('ni-consent-banner');
        
        function updateGtag(granted) {
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            if (granted) {
                gtag('consent', 'update', {
                    'analytics_storage': 'granted',
                    'ad_storage': 'granted',
                    'ad_user_data': 'granted',
                    'ad_personalization': 'granted'
                });
                dataLayer.push({ event: 'consent_granted' });
            } else {
                gtag('consent', 'update', {
                    'analytics_storage': 'denied',
                    'ad_storage': 'denied',
                    'ad_user_data': 'denied',
                    'ad_personalization': 'denied'
                });
                dataLayer.push({ event: 'consent_denied' });
            }
        }

        if (consentChoice === 'granted') {
            updateGtag(true);
        } else if (consentChoice === 'denied') {
            updateGtag(false);
        } else {
            // Respect Global Privacy Control (GPC) if enabled in browser
            if (navigator.globalPrivacyControl) {
                localStorage.setItem('ni_cookie_consent', 'denied');
                updateGtag(false);
            } else if (banner) {
                banner.style.display = 'block';
            }
        }

        var btnAccept = document.getElementById('ni-accept-cookies');
        if (btnAccept) {
            btnAccept.addEventListener('click', function() {
                localStorage.setItem('ni_cookie_consent', 'granted');
                if (banner) banner.style.display = 'none';
                updateGtag(true);
            });
        }

        var btnDecline = document.getElementById('ni-decline-cookies');
        if (btnDecline) {
            btnDecline.addEventListener('click', function() {
                localStorage.setItem('ni_cookie_consent', 'denied');
                if (banner) banner.style.display = 'none';
                updateGtag(false);
            });
        }
    })();
    </script>
    <?php
}, 1);

// 2. Helper to format a product for GA4 items array with variant attributes
function ni_gtm_format_item($product, $quantity = 1) {
    if (!$product) return null;
    
    $parent_id = $product->is_type('variation') ? $product->get_parent_id() : $product->get_id();
    $categories = wp_get_post_terms($parent_id, 'product_cat', ['fields' => 'names']);
    $cat_name = !empty($categories) && !is_wp_error($categories) ? $categories[0] : 'Lingerie';
    
    $brand = '';
    $brand_terms = wp_get_post_terms($parent_id, 'pa_brand', ['fields' => 'names']);
    if (!empty($brand_terms) && !is_wp_error($brand_terms)) {
        $brand = $brand_terms[0];
    }

    $variant = '';
    if ($product->is_type('variation')) {
        $attrs = $product->get_attributes();
        $variant_parts = [];
        foreach ($attrs as $k => $v) {
            $variant_parts[] = str_replace('attribute_', '', $k) . ': ' . $v;
        }
        $variant = implode(' | ', $variant_parts);
    }
    
    $curr = function_exists('get_woocommerce_currency') ? get_woocommerce_currency() : 'USD';
    
    return [
        'item_id' => (string) ($product->get_sku() ?: $product->get_id()),
        'item_name' => $product->get_name(),
        'price' => (float) wc_format_decimal($product->get_price(), 2),
        'currency' => $curr,
        'item_brand' => $brand,
        'item_category' => $cat_name,
        'item_variant' => $variant,
        'quantity' => (int) $quantity
    ];
}

// 3. Helper to detect active Bundle Savings ($10 Set Savings) or coupons
function ni_gtm_get_cart_coupon_and_discount($cart) {
    if (!$cart) return ['coupon' => '', 'discount' => 0.0];
    
    $applied_coupons = $cart->get_applied_coupons();
    $coupon_name = !empty($applied_coupons) ? implode(', ', $applied_coupons) : '';
    $total_discount = (float) $cart->get_discount_total();

    // Check Set Savings fee
    foreach ($cart->get_fees() as $fee) {
        if ($fee->amount < 0) {
            $total_discount += abs((float) $fee->amount);
            if (empty($coupon_name)) {
                $coupon_name = 'SET_SAVINGS_10';
            } else {
                $coupon_name .= ', SET_SAVINGS_10';
            }
        }
    }

    return [
        'coupon' => $coupon_name,
        'discount' => round($total_discount, 2)
    ];
}

// 4. View Item (Single Product Page)
add_action('wp_footer', function() {
    if (is_product()) {
        global $product;
        if (!$product) {
            $product = wc_get_product(get_the_ID());
        }
        if ($product) {
            $item = ni_gtm_format_item($product, 1);
            if ($item) {
                ?>
                <script>
                window.dataLayer = window.dataLayer || [];
                window.dataLayer.push({ ecommerce: null });
                window.dataLayer.push({
                    event: "view_item",
                    ecommerce: {
                        currency: <?php echo json_encode($item['currency']); ?>,
                        value: <?php echo json_encode($item['price']); ?>,
                        items: [<?php echo json_encode($item); ?>]
                    }
                });
                </script>
                <?php
            }
        }
    }
    
    // 5. View Cart Page with Discount & Coupon
    if (is_cart() && WC()->cart && !WC()->cart->is_empty()) {
        $items = [];
        foreach (WC()->cart->get_cart() as $cart_item) {
            $prod = $cart_item['data'];
            $fmt = ni_gtm_format_item($prod, $cart_item['quantity']);
            if ($fmt) {
                $items[] = $fmt;
            }
        }
        $curr = get_woocommerce_currency();
        $discounts = ni_gtm_get_cart_coupon_and_discount(WC()->cart);
        ?>
        <script>
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({ ecommerce: null });
        window.dataLayer.push({
            event: "view_cart",
            ecommerce: {
                currency: <?php echo json_encode($curr); ?>,
                value: <?php echo json_encode((float) WC()->cart->get_total('edit')); ?>,
                coupon: <?php echo json_encode($discounts['coupon']); ?>,
                discount: <?php echo json_encode($discounts['discount']); ?>,
                items: <?php echo json_encode($items); ?>
            }
        });
        </script>
        <?php
    }

    // 6. Begin Checkout Page with Coupon & Discount
    if (is_checkout() && !is_order_received_page() && WC()->cart && !WC()->cart->is_empty()) {
        $items = [];
        foreach (WC()->cart->get_cart() as $cart_item) {
            $prod = $cart_item['data'];
            $fmt = ni_gtm_format_item($prod, $cart_item['quantity']);
            if ($fmt) {
                $items[] = $fmt;
            }
        }
        $curr = get_woocommerce_currency();
        $discounts = ni_gtm_get_cart_coupon_and_discount(WC()->cart);
        ?>
        <script>
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({ ecommerce: null });
        window.dataLayer.push({
            event: "begin_checkout",
            ecommerce: {
                currency: <?php echo json_encode($curr); ?>,
                value: <?php echo json_encode((float) WC()->cart->get_total('edit')); ?>,
                coupon: <?php echo json_encode($discounts['coupon']); ?>,
                discount: <?php echo json_encode($discounts['discount']); ?>,
                items: <?php echo json_encode($items); ?>
            }
        });
        </script>
        <?php
    }
});

// 7. Purchase Event on Thank You Page with Bundle Discount Tracking
add_action('woocommerce_thankyou', function($order_id) {
    if (!$order_id) return;
    $order = wc_get_order($order_id);
    if (!$order) return;
    
    // Avoid double firing
    if ($order->get_meta('_gtm_purchase_tracked')) {
        return;
    }
    $order->update_meta_data('_gtm_purchase_tracked', '1');
    $order->save();
    
    $items = [];
    foreach ($order->get_items() as $item_id => $item) {
        $prod = $item->get_product();
        if ($prod) {
            $fmt = ni_gtm_format_item($prod, $item->get_quantity());
            if ($fmt) {
                $fmt['price'] = (float) wc_format_decimal($order->get_item_subtotal($item, false, true), 2);
                $items[] = $fmt;
            }
        }
    }

    $coupon_codes = $order->get_coupon_codes();
    $coupon_str = !empty($coupon_codes) ? implode(', ', $coupon_codes) : '';
    $total_discount = (float) $order->get_discount_total();

    // Check Set Savings fee in order
    foreach ($order->get_fees() as $fee) {
        if ($fee->get_amount() < 0) {
            $total_discount += abs((float) $fee->get_amount());
            if (empty($coupon_str)) {
                $coupon_str = 'SET_SAVINGS_10';
            } else {
                $coupon_str .= ', SET_SAVINGS_10';
            }
        }
    }
    
    $purchase_data = [
        'event' => 'purchase',
        'ecommerce' => [
            'transaction_id' => (string) $order->get_order_number(),
            'value' => (float) wc_format_decimal($order->get_total(), 2),
            'tax' => (float) wc_format_decimal($order->get_total_tax(), 2),
            'shipping' => (float) wc_format_decimal($order->get_shipping_total(), 2),
            'currency' => $order->get_currency() ?: 'USD',
            'coupon' => $coupon_str,
            'discount' => round($total_discount, 2),
            'items' => $items
        ]
    ];
    ?>
    <script>
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ ecommerce: null });
    window.dataLayer.push(<?php echo json_encode($purchase_data); ?>);
    </script>
    <?php
}, 10, 1);

// 8. Client-Side AJAX Add to Cart listener
add_action('wp_footer', function() {
    ?>
    <script>
    (function($) {
        if (typeof $ === 'undefined') return;
        $(document).on('added_to_cart', function(event, fragments, cart_hash, $button) {
            if (!$button) return;
            var productId = $button.data('product_id');
            var quantity = $button.data('quantity') || 1;
            window.dataLayer = window.dataLayer || [];
            window.dataLayer.push({ ecommerce: null });
            window.dataLayer.push({
                event: 'add_to_cart',
                ecommerce: {
                    currency: 'USD',
                    items: [{
                        item_id: String(productId),
                        quantity: Number(quantity)
                    }]
                }
            });
        });
        
        $('form.cart').on('submit', function() {
            var $form = $(this);
            var qty = $form.find('input[name="quantity"]').val() || 1;
            var prodId = $form.find('[name="add-to-cart"]').val() || $('[name="product_id"]').val();
            if (prodId) {
                window.dataLayer = window.dataLayer || [];
                window.dataLayer.push({ ecommerce: null });
                window.dataLayer.push({
                    event: 'add_to_cart',
                    ecommerce: {
                        currency: 'USD',
                        items: [{
                            item_id: String(prodId),
                            quantity: Number(qty)
                        }]
                    }
                });
            }
        });
    })(jQuery);
    </script>
    <?php
}, 99);
