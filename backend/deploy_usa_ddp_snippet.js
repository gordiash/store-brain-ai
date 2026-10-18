import https from 'https';
import dotenv from 'dotenv';
dotenv.config();

const wpUser = process.env.WP_ADMIN_USER;
const wpPass = process.env.WP_APP_PASSWORD;
const wpAuth = Buffer.from(`${wpUser}:${wpPass}`).toString('base64');

const snippetPhp = `<?php
/**
 * Snippet Name: Natura Intimo – USA DDP Shipping & Minimum Order Engine
 * Description: Enforces $99 USD minimum order for USA, dynamic $14.99 DDP customs fee, cart progress bar, checkout trust badges, and customs administration fields.
 */

if (!defined('ABSPATH')) {
    exit;
}

// 1. Enforce Minimum Order ($99.00 USD) for United States shipping
add_action('woocommerce_check_cart_items', 'ni_validate_usa_minimum_order');
add_action('woocommerce_checkout_process', 'ni_validate_usa_minimum_order');
function ni_validate_usa_minimum_order() {
    if (!WC()->cart || WC()->cart->is_empty()) {
        return;
    }

    $country = WC()->customer ? WC()->customer->get_shipping_country() : '';
    if (empty($country) && WC()->customer) {
        $country = WC()->customer->get_billing_country();
    }

    if ($country === 'US') {
        $subtotal = WC()->cart->get_subtotal();
        $min_order = 99.00;

        if ($subtotal < $min_order) {
            $diff = $min_order - $subtotal;
            wc_add_notice(
                sprintf(
                    __( 'The minimum order amount for shipping to the United States is <strong>%s</strong>. Your current subtotal is %s. Please add <strong>%s</strong> more to proceed to checkout.', 'naturaintimo' ),
                    wc_price($min_order),
                    wc_price($subtotal),
                    wc_price($diff)
                ),
                'error'
            );
        }
    }
}

// 2. Dynamic DDP Customs Processing Fee on Checkout
add_action('woocommerce_cart_calculate_fees', 'ni_calculate_usa_ddp_fee');
function ni_calculate_usa_ddp_fee($cart) {
    if (is_admin() && !defined('DOING_AJAX')) {
        return;
    }
    if (!$cart || $cart->is_empty()) {
        return;
    }

    $country = WC()->customer ? WC()->customer->get_shipping_country() : '';
    if (empty($country) && WC()->customer) {
        $country = WC()->customer->get_billing_country();
    }

    if ($country === 'US') {
        $subtotal = $cart->get_subtotal();
        // Tier 1 ($99.00 to $198.99): $14.99 flat DDP customs & import fee
        if ($subtotal >= 99.00 && $subtotal < 199.00) {
            $cart->add_fee(
                __( 'U.S. Customs & Import Processing (DDP)', 'naturaintimo' ),
                14.99,
                false // not taxable in checkout
            );
        }
        // Tier 2 ($199.00+): 100% Free Duties & All-Inclusive Delivery (covered by store)
    }
}

// 3. Dynamic Luxury Progress Bar in Cart & Checkout
add_action('woocommerce_before_cart', 'ni_render_usa_progress_bar', 10);
add_action('woocommerce_before_checkout_form', 'ni_render_usa_progress_bar', 5);
function ni_render_usa_progress_bar() {
    if (!WC()->cart || WC()->cart->is_empty()) {
        return;
    }

    $country = WC()->customer ? WC()->customer->get_shipping_country() : '';
    if (empty($country) && WC()->customer) {
        $country = WC()->customer->get_billing_country();
    }
    if (!empty($country) && $country !== 'US') {
        return;
    }

    $subtotal = WC()->cart->get_subtotal();
    $min_threshold = 99.00;
    $free_ship_threshold = 150.00;
    $free_duty_threshold = 199.00;

    $pct = min(100, round(($subtotal / $free_duty_threshold) * 100));

    if ($subtotal < $min_threshold) {
        $diff = $min_threshold - $subtotal;
        $status_text = sprintf(
            '📦 Add <strong>%s</strong> more to reach the <strong>$99.00 minimum order</strong> for U.S. Express delivery.',
            wc_price($diff)
        );
        $bar_color = 'linear-gradient(90deg, #d4a373, #e07a5f)';
    } elseif ($subtotal < $free_ship_threshold) {
        $diff = $free_ship_threshold - $subtotal;
        $status_text = sprintf(
            '✈️ U.S. Delivery Unlocked! Add <strong>%s</strong> more to unlock <strong>FREE DHL Express Shipping</strong> ($150+)!',
            wc_price($diff)
        );
        $bar_color = 'linear-gradient(90deg, #d4af37, #f39c12)';
    } elseif ($subtotal < $free_duty_threshold) {
        $diff = $free_duty_threshold - $subtotal;
        $status_text = sprintf(
            '🎉 <strong>FREE DHL Express Unlocked!</strong> Add <strong>%s</strong> more to get <strong>100% FREE U.S. Duties & All-Inclusive Delivery</strong> ($199+)!',
            wc_price($diff)
        );
        $bar_color = 'linear-gradient(90deg, #27ae60, #2ecc71)';
    } else {
        $status_text = '👑 <strong>VIP Status:</strong> You unlocked <strong>100% FREE DHL Express Delivery</strong> and <strong>ALL U.S. Customs Duties Pre-Paid</strong>!';
        $bar_color = 'linear-gradient(90deg, #d4af37, #27ae60)';
    }

    ?>
    <div class="ni-usa-perks-bar" style="background:#fffcf9; border:1px solid #ebd9c8; border-radius:10px; padding:16px 20px; margin:0 0 24px 0; box-shadow:0 2px 8px rgba(0,0,0,0.03); font-family:inherit;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; font-size:14px; color:#2c3e50;">
            <div style="font-weight:500;"><?php echo $status_text; ?></div>
            <div style="font-weight:700; color:#d4af37; margin-left:12px;"><?php echo $pct; ?>%</div>
        </div>
        <div style="background:#f0e6dc; height:8px; border-radius:4px; overflow:hidden; position:relative;">
            <div style="width:<?php echo $pct; ?>%; height:100%; background:<?php echo $bar_color; ?>; border-radius:4px; transition:width 0.4s ease;"></div>
        </div>
        <div style="display:flex; justify-content:space-between; margin-top:8px; font-size:11px; color:#888;">
            <span style="<?php echo $subtotal >= 99 ? 'color:#27ae60; font-weight:600;' : ''; ?>">● $99 Min. Delivery</span>
            <span style="<?php echo $subtotal >= 150 ? 'color:#27ae60; font-weight:600;' : ''; ?>">● $150 Free DHL Express</span>
            <span style="<?php echo $subtotal >= 199 ? 'color:#27ae60; font-weight:600;' : ''; ?>">● $199 100% Free Duties (DDP)</span>
        </div>
    </div>
    <?php
}

// 4. Guaranteed DDP Trust Badge on Checkout
add_action('woocommerce_review_order_after_shipping', 'ni_render_checkout_trust_badge');
function ni_render_checkout_trust_badge() {
    $country = WC()->customer ? WC()->customer->get_shipping_country() : '';
    if (empty($country) && WC()->customer) {
        $country = WC()->customer->get_billing_country();
    }
    if ($country === 'US' || empty($country)) {
        ?>
        <tr class="ni-ddp-guarantee-row">
            <td colspan="2" style="padding:14px; background:#fbfcfe; border:1px solid #e1e8ed; border-radius:8px; margin:8px 0;">
                <div style="display:flex; align-items:flex-start; gap:10px;">
                    <div style="font-size:20px; line-height:1;">🛡️</div>
                    <div style="font-size:12px; line-height:1.5; color:#4a5568;">
                        <strong style="color:#2d3748;">Guaranteed DDP (Delivery Duty Paid) to the USA:</strong><br/>
                        All orders are shipped directly from Poland (EU) via DHL Express with pre-cleared customs. No additional import duties, taxes, or carrier fees upon delivery.
                    </div>
                </div>
            </td>
        </tr>
        <?php
    }
}

// 5. Store DDP Metadata on order creation
add_action('woocommerce_checkout_create_order', 'ni_attach_ddp_meta_to_order', 10, 2);
function ni_attach_ddp_meta_to_order($order, $data) {
    $country = $order->get_shipping_country();
    if ($country === 'US') {
        $subtotal = $order->get_subtotal();
        $order->update_meta_data('_shipping_incoterms', 'DDP');
        $order->update_meta_data('_carrier_service', 'DHL Express Worldwide');
        if ($subtotal >= 199.00) {
            $order->update_meta_data('_ddp_duty_status', 'Covered 100% by Natura Intimo (VIP)');
        } else {
            $order->update_meta_data('_ddp_duty_status', 'Pre-paid $14.99 DDP Processing');
        }
    }
}

// 6. Custom Admin Product Fields for US Customs (HTS, Origin, Materials)
add_action('woocommerce_product_options_general_product_data', 'ni_add_customs_product_fields');
function ni_add_customs_product_fields() {
    echo '<div class="options_group" style="background:#fdfcfb; border-top:1px solid #eee; padding-top:12px;">';
    echo '<h4 style="margin:0 0 10px 12px; color:#823a54;">U.S. Customs & HTS Classification</h4>';

    woocommerce_wp_text_input(array(
        'id'          => '_hts_code',
        'label'       => __('US HTS Code', 'naturaintimo'),
        'placeholder' => '6212.10.90',
        'desc_tip'    => true,
        'description' => __('Harmonized Tariff Schedule code (e.g. 6212.10.90 for bras, 6108.22.00 for panties).', 'naturaintimo')
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
            'set'       => __('Lingerie Set (HTS 6212.90)', 'naturaintimo'),
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
`;

async function deploySnippet() {
  console.log('--- Wdrażanie zaktualizowanego Snippetu DDP w Code Snippets ---');

  const listReq = () => new Promise((resolve, reject) => {
    const req = https.request('https://naturaintimo.com/wp-json/code-snippets/v1/snippets', {
      headers: { 'Authorization': 'Basic ' + wpAuth }
    }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve(JSON.parse(data)));
    });
    req.on('error', reject);
    req.end();
  });

  const snippets = await listReq();
  const existing = snippets.find(s => s.name && s.name.includes('USA DDP Shipping'));

  const payload = JSON.stringify({
    name: 'Natura Intimo – USA DDP Shipping & Minimum Order Engine',
    code: snippetPhp.replace(/^<\?php\s*/, ''),
    scope: 'global',
    active: true
  });

  const targetUrl = existing 
    ? `https://naturaintimo.com/wp-json/code-snippets/v1/snippets/${existing.id}`
    : 'https://naturaintimo.com/wp-json/code-snippets/v1/snippets';
  const method = existing ? 'PUT' : 'POST';

  console.log(`Zapisywanie (${method} do ${targetUrl})...`);

  const saveReq = () => new Promise((resolve, reject) => {
    const req = https.request(targetUrl, {
      method: method,
      headers: {
        'Authorization': 'Basic ' + wpAuth,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch(e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });

  const result = await saveReq();
  console.log('Status wdrożenia:', result.status);
  console.log('✅ Snippet zaktualizowany z polami celnymi i DDP engine!');
}

deploySnippet().catch(console.error);
