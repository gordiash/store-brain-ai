import dotenv from 'dotenv';
dotenv.config();

const wpUser = process.env.WP_ADMIN_USER;
const wpPass = process.env.WP_APP_PASSWORD;
const ck = process.env.WOOCOMMERCE_CONSUMER_KEY;
const cs = process.env.WOOCOMMERCE_CONSUMER_SECRET;
const siteUrl = process.env.WOOCOMMERCE_URL || 'https://naturaintimo.com';

if (!wpUser || !wpPass || !ck || !cs) {
  throw new Error('Missing credentials in .env');
}

const wpAuth = 'Basic ' + Buffer.from(`${wpUser}:${wpPass}`).toString('base64');
const wcAuth = 'Basic ' + Buffer.from(`${ck}:${cs}`).toString('base64');

async function updateWooCommerceShippingMethods() {
  console.log('--- 1. Aktualizacja metod wysyłki w strefie USA (Zone 2) ---');

  // 1. Zaktualizuj Method 5 (Flat rate: $24.99 DHL Express DDP)
  const resMethod5 = await fetch(`${siteUrl}/wp-json/wc/v3/shipping/zones/2/methods/5`, {
    method: 'PUT',
    headers: {
      'Authorization': wcAuth,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      title: 'DHL Express Worldwide (Pre-Cleared DDP — All Duties & Taxes Included)',
      settings: {
        title: 'DHL Express Worldwide (Pre-Cleared DDP — All Duties & Taxes Included)',
        cost: '24.99',
        tax_status: 'none'
      }
    })
  });

  if (!resMethod5.ok) {
    const errText = await resMethod5.text();
    throw new Error(`Błąd aktualizacji metody 5: ${resMethod5.status} ${errText}`);
  }
  const m5 = await resMethod5.json();
  console.log('✅ Zaktualizowano Metodę 5 (Flat rate):', {
    id: m5.id,
    title: m5.title,
    cost: m5.settings?.cost?.value || m5.settings?.cost
  });

  // 2. Zaktualizuj Method 9 (Free shipping: $150 min amount)
  const resMethod9 = await fetch(`${siteUrl}/wp-json/wc/v3/shipping/zones/2/methods/9`, {
    method: 'PUT',
    headers: {
      'Authorization': wcAuth,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      title: 'FREE DHL Express Worldwide (Duties & Taxes Pre-Paid)',
      settings: {
        title: 'FREE DHL Express Worldwide (Duties & Taxes Pre-Paid)',
        requires: 'min_amount',
        min_amount: '150',
        ignore_discounts: 'no'
      }
    })
  });

  if (!resMethod9.ok) {
    const errText = await resMethod9.text();
    throw new Error(`Błąd aktualizacji metody 9: ${resMethod9.status} ${errText}`);
  }
  const m9 = await resMethod9.json();
  console.log('✅ Zaktualizowano Metodę 9 (Free shipping):', {
    id: m9.id,
    title: m9.title,
    min_amount: m9.settings?.min_amount?.value || m9.settings?.min_amount
  });
}

const updatedSnippetPhp = `/**
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

// 3. Reactive Perks Progress Bar in Cart & Checkout ($150 Free DHL Express Worldwide)
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

// 4. Guaranteed DDP Trust Badge on Checkout
add_action('woocommerce_review_order_after_shipping', 'ni_render_checkout_trust_badge');
function ni_render_checkout_trust_badge() {
    $country = (WC()->customer && method_exists(WC()->customer, 'get_shipping_country')) 
        ? WC()->customer->get_shipping_country() 
        : '';
    if (empty($country) && WC()->customer && method_exists(WC()->customer, 'get_billing_country')) {
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
                        All orders are shipped directly from Poland (EU) via DHL Express with pre-cleared customs. All duties & import clearance are 100% covered. Zero additional carrier fees or taxes upon delivery.
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
    if (!$order) return;
    $country = $order->get_shipping_country();
    if ($country === 'US') {
        $order->update_meta_data('_shipping_incoterms', 'DDP');
        $order->update_meta_data('_carrier_service', 'DHL Express Worldwide');
        $order->update_meta_data('_ddp_duty_status', 'Pre-cleared DDP - 100% Covered by Natura Intimo');
    }
}

// 6. Hide Polish payment gateways for US & CA customers
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

// 7. Custom Admin Product Fields for US Customs (Component classification only - HTS 6212.10 and 6108.22)
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

async function updateSnippet7() {
  console.log('\n--- 2. Aktualizacja Snippetu 7 w WordPress Code Snippets ---');

  const payload = JSON.stringify({
    name: 'Natura Intimo – USA DDP Shipping & Minimum Order Engine (Option C2 Reactive Bar)',
    code: updatedSnippetPhp.replace(/^<\?php\s*/, ''),
    scope: 'global',
    active: true
  });

  const res = await fetch(`${siteUrl}/wp-json/code-snippets/v1/snippets/7`, {
    method: 'PUT',
    headers: {
      'Authorization': wpAuth,
      'Content-Type': 'application/json'
    },
    body: payload
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Błąd aktualizacji Snippetu 7: ${res.status} ${errText}`);
  }

  const snipData = await res.json();
  console.log('✅ Snippet 7 pomyślnie zaktualizowany:', {
    id: snipData.id,
    name: snipData.name,
    active: snipData.active
  });
}

async function verifySiteHealth() {
  console.log('\n--- 3. Weryfikacja działania strony (Site Health Check) ---');
  const urls = [
    `${siteUrl}/en/`,
    `${siteUrl}/cart/`,
    `${siteUrl}/checkout/`,
    `${siteUrl}/accessibility-statement/`
  ];

  for (const u of urls) {
    try {
      const resp = await fetch(u, {
        headers: { 'User-Agent': 'NaturaIntimoHealthChecker/1.0' }
      });
      console.log(`URL: ${u} ➔ Status: ${resp.status} ${resp.statusText}`);
      if (resp.status !== 200) {
        console.warn(`⚠️ Ostrzeżenie: Status ${resp.status} dla ${u}`);
      }
    } catch (e) {
      console.error(`❌ Błąd połączenia z ${u}:`, e.message);
    }
  }
}

async function main() {
  console.log('=== WDRAŻANIE OPCJI C2: $24.99 FLAT DHL DDP + $150 PROG FREE SHIPPING ===\n');
  await updateWooCommerceShippingMethods();
  await updateSnippet7();
  await verifySiteHealth();
  console.log('\n🎉 SUKCES! Model C2 oraz poprawiony pasek postępu ($150) zostały pomyślnie wdrożone.');
}

main().catch(err => {
  console.error('\n❌ BŁĄD KRYTYCZNY:', err);
  process.exit(1);
});
