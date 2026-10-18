import dotenv from 'dotenv';
dotenv.config();
import axios from 'axios';

async function main() {
  const wpUser = process.env.WP_ADMIN_USER;
  const wpPass = process.env.WP_APP_PASSWORD;
  const auth = Buffer.from(`${wpUser}:${wpPass}`).toString('base64');
  const headers = { Authorization: `Basic ${auth}` };

  const phpCode = `/**
 * Snippet Name: WooCommerce GA4 / GTM E-commerce DataLayer
 * Description: Pushes standard GA4 e-commerce events (view_item, add_to_cart, view_cart, begin_checkout, purchase) to window.dataLayer for GTM.
 */

if (!defined('ABSPATH')) {
    exit;
}

// 1. Helper to format a product for GA4 items array
function ni_gtm_format_item($product, $quantity = 1) {
    if (!$product) return null;
    
    $categories = wp_get_post_terms($product->is_type('variation') ? $product->get_parent_id() : $product->get_id(), 'product_cat', ['fields' => 'names']);
    $cat_name = !empty($categories) && !is_wp_error($categories) ? $categories[0] : 'Lingerie';
    
    $brand = '';
    $brand_terms = wp_get_post_terms($product->is_type('variation') ? $product->get_parent_id() : $product->get_id(), 'pa_brand', ['fields' => 'names']);
    if (!empty($brand_terms) && !is_wp_error($brand_terms)) {
        $brand = $brand_terms[0];
    }
    
    return [
        'item_id' => (string) $product->get_sku() ?: (string) $product->get_id(),
        'item_name' => $product->get_name(),
        'price' => (float) wc_format_decimal($product->get_price(), 2),
        'currency' => 'USD',
        'item_brand' => $brand,
        'item_category' => $cat_name,
        'quantity' => (int) $quantity
    ];
}

// 2. View Item (Single Product Page)
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
                        currency: "USD",
                        value: <?php echo json_encode($item['price']); ?>,
                        items: [<?php echo json_encode($item); ?>]
                    }
                });
                </script>
                <?php
            }
        }
    }
    
    // 3. View Cart Page
    if (is_cart() && WC()->cart && !WC()->cart->is_empty()) {
        $items = [];
        foreach (WC()->cart->get_cart() as $cart_item) {
            $prod = $cart_item['data'];
            $fmt = ni_gtm_format_item($prod, $cart_item['quantity']);
            if ($fmt) {
                $items[] = $fmt;
            }
        }
        ?>
        <script>
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({ ecommerce: null });
        window.dataLayer.push({
            event: "view_cart",
            ecommerce: {
                currency: "USD",
                value: <?php echo json_encode((float) WC()->cart->get_total('edit')); ?>,
                items: <?php echo json_encode($items); ?>
            }
        });
        </script>
        <?php
    }

    // 4. Begin Checkout Page
    if (is_checkout() && !is_order_received_page() && WC()->cart && !WC()->cart->is_empty()) {
        $items = [];
        foreach (WC()->cart->get_cart() as $cart_item) {
            $prod = $cart_item['data'];
            $fmt = ni_gtm_format_item($prod, $cart_item['quantity']);
            if ($fmt) {
                $items[] = $fmt;
            }
        }
        ?>
        <script>
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({ ecommerce: null });
        window.dataLayer.push({
            event: "begin_checkout",
            ecommerce: {
                currency: "USD",
                value: <?php echo json_encode((float) WC()->cart->get_total('edit')); ?>,
                items: <?php echo json_encode($items); ?>
            }
        });
        </script>
        <?php
    }
});

// 5. Purchase Event on Thank You Page
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
    
    $purchase_data = [
        'event' => 'purchase',
        'ecommerce' => [
            'transaction_id' => (string) $order->get_order_number(),
            'value' => (float) wc_format_decimal($order->get_total(), 2),
            'tax' => (float) wc_format_decimal($order->get_total_tax(), 2),
            'shipping' => (float) wc_format_decimal($order->get_shipping_total(), 2),
            'currency' => 'USD',
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

// 6. Client-Side AJAX Add to Cart listener
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
`;

  console.log('Deploying WooCommerce GA4/GTM DataLayer Snippet...');
  const res = await axios.get('https://naturaintimo.com/wp-json/code-snippets/v1/snippets', { headers });
  const snippets = res.data;
  const existing = snippets.find(s => s.name && s.name.includes('WooCommerce GA4 / GTM E-commerce DataLayer'));

  const payload = {
    name: 'WooCommerce GA4 / GTM E-commerce DataLayer',
    code: phpCode,
    scope: 'global',
    active: true
  };

  if (existing) {
    console.log(`Updating snippet #${existing.id}...`);
    await axios.put(`https://naturaintimo.com/wp-json/code-snippets/v1/snippets/${existing.id}`, payload, { headers });
    console.log(`Snippet #${existing.id} updated!`);
  } else {
    console.log('Creating new snippet...');
    const createRes = await axios.post('https://naturaintimo.com/wp-json/code-snippets/v1/snippets', payload, { headers });
    console.log(`Snippet #${createRes.data.id} created and activated!`);
  }
}

main().catch(console.error);
