import dotenv from 'dotenv';
dotenv.config();

const wpUser = process.env.WP_ADMIN_USER;
const wpPass = process.env.WP_APP_PASSWORD;
if (!wpUser || !wpPass) {
  throw new Error('Brak wymaganych poświadczeń WP_ADMIN_USER lub WP_APP_PASSWORD w pliku .env');
}
const auth = Buffer.from(`${wpUser}:${wpPass}`).toString('base64');
const url = process.env.WOOCOMMERCE_URL || 'https://naturaintimo.com';

const snippetPhp = `/**
 * Snippet Name: Natura Intimo – Complete the Set & Bundle Savings Engine
 * Description: Interactive "Complete the Set & Save $10" bundle builder on single product pages, 1-click add-set-to-cart AJAX, and automatic cart set discounts.
 */

if (!defined('ABSPATH')) {
    exit;
}

// 1. Helper: Resolve matching product
function ni_get_matching_product( $product_id = 0 ) {
    if ( ! $product_id ) {
        global $product;
        $product_id = $product ? $product->get_id() : get_the_ID();
    }
    if ( ! $product_id ) {
        return null;
    }

    $current_product = wc_get_product( $product_id );
    if ( ! $current_product ) {
        return null;
    }

    $matching_id = get_post_meta( $product_id, '_matching_product_id', true );
    if ( ! $matching_id ) {
        $upsells = $current_product->get_upsell_ids();
        if ( ! empty( $upsells ) ) {
            $matching_id = reset( $upsells );
        }
    }

    if ( ! $matching_id ) {
        return null;
    }

    $matching_product = wc_get_product( $matching_id );
    if ( ! $matching_product || $matching_product->get_status() !== 'publish' ) {
        return null;
    }

    return $matching_product;
}

// 2. Render Interactive "Complete the Set & Save $10" Box after Add-to-Cart form
add_action( 'woocommerce_after_add_to_cart_form', 'ni_render_complete_set_bundle_box', 15 );
function ni_render_complete_set_bundle_box() {
    global $product;
    if ( ! $product ) {
        return;
    }

    $matching = ni_get_matching_product( $product->get_id() );
    if ( ! $matching ) {
        return;
    }

    $current_title = $product->get_name();
    $is_bra = ( preg_match( '/\\b(bra|biustonosz|semi-soft|soft|full cup|push-up)\\b/i', $current_title ) && ! preg_match( '/brazilian|brazyliany/i', $current_title ) );

    $kicker = __( '✨ Coordinated Lingerie Set · Bundle & Save', 'naturaintimo' );
    $heading = $is_bra 
        ? __( 'Complete the Set: Pair with Matching Bottom & Save $10', 'naturaintimo' ) 
        : __( 'Complete the Set: Pair with Matching Bra & Save $10', 'naturaintimo' );
    $type_label = $is_bra ? __( 'Matching Bottom', 'naturaintimo' ) : __( 'Matching Bra', 'naturaintimo' );

    $matching_name  = $matching->get_name();
    $matching_url   = esc_url( $matching->get_permalink() );
    $image_id       = $matching->get_image_id();
    $image_src      = $image_id ? wp_get_attachment_image_url( $image_id, 'woocommerce_thumbnail' ) : wc_placeholder_img_src();

    // Prices
    $curr_price = (float) $product->get_price();
    $match_price = (float) $matching->get_price();
    $total_regular = $curr_price + $match_price;
    $set_discount = 10.00;
    $set_price = max( 0, $total_regular - $set_discount );

    // Gather in-stock variations for the matching item
    $matching_variations = array();
    if ( $matching->is_type( 'variable' ) ) {
        foreach ( $matching->get_available_variations() as $var ) {
            if ( ! empty( $var['is_in_stock'] ) ) {
                $size_str = '';
                $color_str = '';
                foreach ( $var['attributes'] as $attr_k => $attr_v ) {
                    if ( stripos( $attr_k, 'color' ) !== false || stripos( $attr_k, 'kolor' ) !== false ) {
                        $color_str = ucwords( trim( $attr_v ) );
                    } elseif ( stripos( $attr_k, 'size' ) !== false || stripos( $attr_k, 'rozmiar' ) !== false ) {
                        $size_str = strtoupper( trim( $attr_v ) );
                    }
                }
                if ( empty( $size_str ) && empty( $color_str ) ) {
                    $label = implode( ' / ', array_values( array_filter( $var['attributes'] ) ) );
                } elseif ( ! empty( $color_str ) && ! empty( $size_str ) ) {
                    $label = $color_str . ' – Size ' . $size_str;
                } elseif ( ! empty( $color_str ) ) {
                    $label = $color_str;
                } else {
                    $label = 'Size ' . $size_str;
                }

                $matching_variations[] = array(
                    'id'    => $var['variation_id'],
                    'label' => $label,
                    'color' => strtolower( $color_str ),
                    'size'  => $size_str,
                    'price' => (float) $var['display_price']
                );
            }
        }
    }

    ?>
    <div class="ni-bundle-widget" id="niBundleWidget" data-primary-id="<?php echo esc_attr( $product->get_id() ); ?>" data-matching-id="<?php echo esc_attr( $matching->get_id() ); ?>">
        <div class="ni-bundle-header">
            <span class="ni-bundle-badge"><?php echo esc_html( $kicker ); ?></span>
            <h4 class="ni-bundle-title"><?php echo esc_html( $heading ); ?></h4>
        </div>

        <div class="ni-bundle-card">
            <a href="<?php echo $matching_url; ?>" class="ni-bundle-thumb" aria-label="<?php echo esc_attr( $matching_name ); ?>">
                <img src="<?php echo esc_url( $image_src ); ?>" alt="<?php echo esc_attr( $matching_name ); ?>" loading="lazy" />
            </a>

            <div class="ni-bundle-content">
                <span class="ni-bundle-tag"><?php echo esc_html( $type_label ); ?></span>
                <a href="<?php echo $matching_url; ?>" class="ni-bundle-name"><?php echo esc_html( $matching_name ); ?></a>

                <div class="ni-bundle-price-row">
                    <span class="ni-price-regular">$<?php echo number_format( $total_regular, 2 ); ?></span>
                    <span class="ni-price-bundle">$<?php echo number_format( $set_price, 2 ); ?></span>
                    <span class="ni-save-tag">Save $10.00</span>
                </div>

                <?php if ( ! empty( $matching_variations ) ) : ?>
                <div class="ni-bundle-selector-wrap">
                    <label for="niMatchingVarSelect"><strong>Select <?php echo esc_html( $type_label ); ?> Size:</strong></label>
                    <select id="niMatchingVarSelect" class="ni-bundle-select">
                        <option value="">-- Choose Size --</option>
                        <?php foreach ( $matching_variations as $m_var ) : ?>
                            <option value="<?php echo esc_attr( $m_var['id'] ); ?>" data-color="<?php echo esc_attr( $m_var['color'] ); ?>">
                                <?php echo esc_html( $m_var['label'] ); ?> (In Stock)
                            </option>
                        <?php endforeach; ?>
                    </select>
                </div>
                <?php endif; ?>

                <div class="ni-bundle-actions">
                    <button type="button" class="ni-btn-add-bundle" id="niBtnAddBundle">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                        <span>Add Complete Set to Bag — $<?php echo number_format( $set_price, 2 ); ?></span>
                    </button>
                    <a href="<?php echo $matching_url; ?>" class="ni-bundle-link-details">View item details →</a>
                </div>

                <div id="niBundleMsg" class="ni-bundle-msg" style="display:none;"></div>

                <div class="ni-bundle-perk-hint">
                    ✨ <em>Pairing this coordinated set automatically saves you <strong>$10.00</strong> and brings you closer to <strong>Free DHL Express Shipping ($150 USD)</strong>!</em>
                </div>
            </div>
        </div>
    </div>

    <style>
    .ni-bundle-widget {
        margin: 24px 0 18px 0;
        padding: 20px 22px;
        background: #fffaf7;
        border: 1.5px solid #ebdce1;
        border-radius: 20px;
        box-shadow: 0 4px 20px rgba(48,37,43,0.05);
        clear: both;
    }
    .ni-bundle-header {
        margin-bottom: 14px;
    }
    .ni-bundle-badge {
        display: inline-block;
        font-size: 0.72rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        color: #b86f82;
        margin-bottom: 4px;
    }
    .ni-bundle-title {
        font-size: 1.08rem;
        font-weight: 700;
        color: #30252b;
        margin: 0;
        line-height: 1.35;
    }
    .ni-bundle-card {
        display: flex;
        align-items: flex-start;
        gap: 18px;
        background: #ffffff;
        border: 1px solid #f0e6e8;
        border-radius: 16px;
        padding: 16px;
    }
    .ni-bundle-thumb {
        width: 80px;
        height: 108px;
        min-width: 80px;
        border-radius: 12px;
        overflow: hidden;
        background: #faf4f6;
        display: block;
        flex-shrink: 0;
    }
    .ni-bundle-thumb img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        object-position: center top;
        display: block;
        transition: transform 0.3s ease;
    }
    .ni-bundle-thumb:hover img {
        transform: scale(1.06);
    }
    .ni-bundle-content {
        flex-grow: 1;
        min-width: 0;
    }
    .ni-bundle-tag {
        display: inline-block;
        font-size: 0.68rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: #93566a;
        margin-bottom: 2px;
    }
    .ni-bundle-name {
        font-size: 0.98rem;
        font-weight: 600;
        line-height: 1.35;
        color: #30252b !important;
        text-decoration: none !important;
        display: block;
        margin-bottom: 8px;
    }
    .ni-bundle-price-row {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 12px;
        flex-wrap: wrap;
    }
    .ni-price-regular {
        font-size: 0.95rem;
        color: #8c7882;
        text-decoration: line-through;
    }
    .ni-price-bundle {
        font-size: 1.25rem;
        font-weight: 700;
        color: #30252b;
    }
    .ni-save-tag {
        font-size: 0.72rem;
        font-weight: 700;
        background: #f4e2e7;
        color: #93566a;
        padding: 3px 8px;
        border-radius: 999px;
        text-transform: uppercase;
    }
    .ni-bundle-selector-wrap {
        margin-bottom: 14px;
    }
    .ni-bundle-selector-wrap label {
        display: block;
        font-size: 0.82rem;
        color: #4b3943;
        margin-bottom: 5px;
    }
    .ni-bundle-select {
        width: 100%;
        max-width: 320px;
        padding: 9px 12px;
        font-size: 0.88rem;
        border: 1.5px solid #dfcfd4;
        border-radius: 10px;
        background: #fff;
        color: #30252b;
        outline: none;
        transition: border-color 0.2s ease;
    }
    .ni-bundle-select:focus {
        border-color: #30252b;
    }
    .ni-bundle-actions {
        display: flex;
        align-items: center;
        gap: 14px;
        flex-wrap: wrap;
        margin-bottom: 10px;
    }
    .ni-btn-add-bundle {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 12px 20px;
        border-radius: 999px;
        background: #30252b;
        color: #ffffff !important;
        font-size: 0.88rem;
        font-weight: 600;
        border: none;
        cursor: pointer;
        transition: all 0.22s ease;
        box-shadow: 0 4px 14px rgba(48,37,43,0.18);
    }
    .ni-btn-add-bundle:hover {
        background: #b86f82;
        transform: translateY(-2px);
        box-shadow: 0 6px 18px rgba(184,111,130,0.32);
    }
    .ni-btn-add-bundle:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
    .ni-bundle-link-details {
        font-size: 0.82rem;
        color: #93566a !important;
        text-decoration: underline !important;
        transition: color 0.2s ease;
    }
    .ni-bundle-link-details:hover {
        color: #30252b !important;
    }
    .ni-bundle-msg {
        padding: 8px 12px;
        margin-bottom: 10px;
        border-radius: 8px;
        font-size: 0.82rem;
        font-weight: 600;
    }
    .ni-bundle-msg.error {
        background: #fde8e8;
        color: #9b1c1c;
        border: 1px solid #f8b4b4;
    }
    .ni-bundle-msg.success {
        background: #def7ec;
        color: #03543f;
        border: 1px solid #84e1bc;
    }
    .ni-bundle-perk-hint {
        font-size: 0.78rem;
        line-height: 1.4;
        color: #6a545e;
        margin-top: 6px;
    }
    @media (max-width: 600px) {
        .ni-bundle-card {
            flex-direction: column;
            align-items: flex-start;
        }
        .ni-bundle-thumb {
            width: 100%;
            height: 180px;
        }
        .ni-bundle-select {
            max-width: 100%;
        }
        .ni-btn-add-bundle {
            width: 100%;
            justify-content: center;
        }
    }
    </style>

    <script>
    document.addEventListener('DOMContentLoaded', function() {
        var widget = document.getElementById('niBundleWidget');
        var btn = document.getElementById('niBtnAddBundle');
        var msg = document.getElementById('niBundleMsg');
        var selectMatching = document.getElementById('niMatchingVarSelect');
        if (!widget || !btn) return;

        function showMsg(text, type) {
            msg.className = 'ni-bundle-msg ' + type;
            msg.innerHTML = text;
            msg.style.display = 'block';
        }

        // Color sync between main item and matching bottom
        var mainForm = document.querySelector('form.variations_form');
        if (mainForm && selectMatching) {
            function syncMatchingColor() {
                var selectedColor = '';
                var colorSelect = mainForm.querySelector('select[name*="color"], select[name*="kolor"]');
                if (colorSelect && colorSelect.value) {
                    selectedColor = colorSelect.value.toLowerCase().trim();
                }
                if (!selectedColor) {
                    var checkedColorRadio = mainForm.querySelector('input[name*="color"]:checked, input[name*="kolor"]:checked');
                    if (checkedColorRadio) {
                        selectedColor = checkedColorRadio.value.toLowerCase().trim();
                    }
                }
                if (selectedColor) {
                    var options = selectMatching.querySelectorAll('option[data-color]');
                    var matchFound = false;
                    options.forEach(function(opt) {
                        var optColor = (opt.getAttribute('data-color') || '').toLowerCase().trim();
                        if (!optColor || optColor === selectedColor || optColor.indexOf(selectedColor) !== -1 || selectedColor.indexOf(optColor) !== -1) {
                            opt.style.display = '';
                            matchFound = true;
                        } else {
                            opt.style.display = 'none';
                        }
                    });
                    if (!matchFound) {
                        options.forEach(function(opt) { opt.style.display = ''; });
                    }
                }
            }
            mainForm.addEventListener('change', syncMatchingColor);
            if (window.jQuery) {
                jQuery(mainForm).on('found_variation reset_data check_variations', syncMatchingColor);
            }
            syncMatchingColor();
        }

        btn.addEventListener('click', function(e) {
            e.preventDefault();

            // 1. Get primary variation id
            var form = document.querySelector('form.variations_form');
            var primaryVarId = 0;
            if (form) {
                var inputVar = form.querySelector('input[name="variation_id"]');
                if (inputVar && inputVar.value && parseInt(inputVar.value, 10) > 0) {
                    primaryVarId = parseInt(inputVar.value, 10);
                }
            }

            if (!primaryVarId) {
                showMsg('⚠️ Please select your size in the main options above first.', 'error');
                if (form) {
                    form.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
                return;
            }

            // 2. Get matching variation id
            var matchingVarId = selectMatching ? parseInt(selectMatching.value, 10) : 0;
            if (selectMatching && (!matchingVarId || matchingVarId <= 0)) {
                showMsg('⚠️ Please select the size for the matching bottom above.', 'error');
                selectMatching.focus();
                return;
            }

            btn.disabled = true;
            btn.innerHTML = '<span>Adding Set to Bag...</span>';
            showMsg('Adding your coordinated set to bag...', 'success');

            var primaryProductId = parseInt(widget.getAttribute('data-primary-id'), 10);
            var matchingProductId = parseInt(widget.getAttribute('data-matching-id'), 10);

            var formData = new FormData();
            formData.append('action', 'ni_add_set_to_cart');
            formData.append('primary_product_id', primaryProductId);
            formData.append('primary_variation_id', primaryVarId);
            formData.append('matching_product_id', matchingProductId);
            formData.append('matching_variation_id', matchingVarId);

            var ajaxUrl = '/?wc-ajax=ni_add_set_to_cart';

            fetch(ajaxUrl, {
                method: 'POST',
                body: formData
            })
            .then(function(r) { return r.json(); })
            .then(function(res) {
                if (res.success) {
                    showMsg('✨ Set added to bag! Redirecting to cart...', 'success');
                    window.location.href = res.data.cart_url || '/koszyk/';
                } else {
                    btn.disabled = false;
                    btn.innerHTML = '<span>Add Complete Set to Bag</span>';
                    showMsg(res.data && res.data.message ? res.data.message : 'Error adding to cart. Please try again.', 'error');
                }
            })
            .catch(function(err) {
                btn.disabled = false;
                btn.innerHTML = '<span>Add Complete Set to Bag</span>';
                showMsg('Connection error. Please try again.', 'error');
            });
        });
    });
    </script>
    <?php
}

// 3. AJAX Handler: Add Complete Set to Cart
add_action( 'wc_ajax_ni_add_set_to_cart', 'ni_ajax_add_set_to_cart' );
add_action( 'wp_ajax_ni_add_set_to_cart', 'ni_ajax_add_set_to_cart' );
add_action( 'wp_ajax_nopriv_ni_add_set_to_cart', 'ni_ajax_add_set_to_cart' );
function ni_ajax_add_set_to_cart() {
    $primary_pid  = isset( $_POST['primary_product_id'] ) ? absint( $_POST['primary_product_id'] ) : 0;
    $primary_vid  = isset( $_POST['primary_variation_id'] ) ? absint( $_POST['primary_variation_id'] ) : 0;
    $matching_pid = isset( $_POST['matching_product_id'] ) ? absint( $_POST['matching_product_id'] ) : 0;
    $matching_vid = isset( $_POST['matching_variation_id'] ) ? absint( $_POST['matching_variation_id'] ) : 0;

    if ( ! $primary_pid || ! $matching_pid ) {
        wp_send_json_error( array( 'message' => 'Missing product ID.' ) );
    }

    if ( ! function_exists( 'WC' ) || ! WC()->cart ) {
        wp_send_json_error( array( 'message' => 'Cart not initialized.' ) );
    }

    // Add primary item
    if ( $primary_vid > 0 ) {
        WC()->cart->add_to_cart( $primary_pid, 1, $primary_vid );
    } else {
        WC()->cart->add_to_cart( $primary_pid, 1 );
    }

    // Add matching item
    if ( $matching_vid > 0 ) {
        WC()->cart->add_to_cart( $matching_pid, 1, $matching_vid );
    } else {
        WC()->cart->add_to_cart( $matching_pid, 1 );
    }

    wp_send_json_success( array(
        'cart_url' => wc_get_cart_url()
    ) );
}

// 4. Cart Discount Engine: -$10.00 for every matched Coordinated Set
add_action( 'woocommerce_cart_calculate_fees', 'ni_apply_matching_set_discount', 25, 1 );
function ni_apply_matching_set_discount( $cart ) {
    if ( is_admin() && ! defined( 'DOING_AJAX' ) ) {
        return;
    }

    $cart_product_ids = array();
    foreach ( $cart->get_cart() as $cart_item ) {
        $parent_id = $cart_item['product_id'];
        $qty = $cart_item['quantity'];
        if ( ! isset( $cart_product_ids[ $parent_id ] ) ) {
            $cart_product_ids[ $parent_id ] = 0;
        }
        $cart_product_ids[ $parent_id ] += $qty;
    }

    $set_pairs_matched = 0;
    $processed_pairs = array();

    foreach ( $cart_product_ids as $pid => $qty ) {
        if ( in_array( $pid, $processed_pairs, true ) ) {
            continue;
        }
        $matching_id = (int) get_post_meta( $pid, '_matching_product_id', true );
        if ( $matching_id && isset( $cart_product_ids[ $matching_id ] ) && ! in_array( $matching_id, $processed_pairs, true ) ) {
            $matching_qty = $cart_product_ids[ $matching_id ];
            $complete_sets = min( $qty, $matching_qty );
            if ( $complete_sets > 0 ) {
                $set_pairs_matched += $complete_sets;
                $processed_pairs[] = $pid;
                $processed_pairs[] = $matching_id;
            }
        }
    }

    if ( $set_pairs_matched > 0 ) {
        $discount_amount = -10.00 * $set_pairs_matched;
        $label = $set_pairs_matched > 1 
            ? sprintf( __( '✨ Coordinated Set Savings (%d sets)', 'naturaintimo' ), $set_pairs_matched )
            : __( '✨ Coordinated Set Savings ($10 Off)', 'naturaintimo' );
        $cart->add_fee( $label, $discount_amount );
    }
}
`;

async function deploy() {
  console.log('Deploying Complete the Set & Bundle Savings Engine to Snippet #9...');
  const res = await fetch(`${url}/wp-json/code-snippets/v1/snippets/9`, {
    method: 'PUT',
    headers: {
      'Authorization': 'Basic ' + auth,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: 'Natura Intimo – Complete the Set & Bundle Savings Engine',
      code: snippetPhp,
      active: true
    })
  });

  const data = await res.json();
  console.log('Snippet #9 updated successfully! Active:', data.active);
}

deploy().catch(console.error);
