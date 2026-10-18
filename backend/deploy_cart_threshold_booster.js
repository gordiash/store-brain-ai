import dotenv from 'dotenv';
dotenv.config();

const wpUser = process.env.WP_ADMIN_USER;
const wpPass = process.env.WP_APP_PASSWORD;
const auth = Buffer.from(`${wpUser}:${wpPass}`).toString('base64');
const url = process.env.WOOCOMMERCE_URL || 'https://naturaintimo.com';

const snippetPhp = `/**
 * Snippet Name: Natura Intimo – Cart Threshold Booster (Smart Upsell)
 * Description: Displays a smart recommended product to reach the $99, $150, or $199 thresholds in the cart collaterals area (left of cart totals).
 */

if (!defined('ABSPATH')) {
    exit;
}

add_action( 'woocommerce_cart_collaterals', 'ni_render_cart_threshold_booster', 5 );
function ni_render_cart_threshold_booster() {
    if ( ! function_exists( 'WC' ) || ! WC()->cart || WC()->cart->is_empty() ) {
        return;
    }

    $subtotal = (float) WC()->cart->subtotal;
    $min_threshold       = 99.00;
    $free_ship_threshold = 150.00;
    $free_duty_threshold = 199.00;

    // Collect all product IDs in cart
    $cart_product_ids = array();
    foreach ( WC()->cart->get_cart() as $cart_item ) {
        $cart_product_ids[] = (int) $cart_item['product_id'];
    }

    // 1. Find best recommended product
    $recommended_product = null;
    $is_matching_set_deal = false;

    // Priority A: Matching counterpart of any item in cart that is not yet in cart
    foreach ( $cart_product_ids as $pid ) {
        $matching_id = (int) get_post_meta( $pid, '_matching_product_id', true );
        if ( ! $matching_id ) {
            $p_obj = wc_get_product( $pid );
            if ( $p_obj ) {
                $upsells = $p_obj->get_upsell_ids();
                if ( ! empty( $upsells ) ) {
                    $matching_id = (int) reset( $upsells );
                }
            }
        }

        if ( $matching_id && ! in_array( $matching_id, $cart_product_ids, true ) ) {
            $cand = wc_get_product( $matching_id );
            if ( $cand && $cand->get_status() === 'publish' && $cand->is_in_stock() ) {
                $recommended_product = $cand;
                $is_matching_set_deal = true;
                break;
            }
        }
    }

    // Priority B: Fallbacks (Top bestsellers)
    if ( ! $recommended_product ) {
        $fallback_ids = array( 3810, 3744, 3932, 2298, 2378, 3777 );
        foreach ( $fallback_ids as $f_id ) {
            if ( ! in_array( $f_id, $cart_product_ids, true ) ) {
                $cand = wc_get_product( $f_id );
                if ( $cand && $cand->get_status() === 'publish' && $cand->is_in_stock() ) {
                    $recommended_product = $cand;
                    break;
                }
            }
        }
    }

    if ( ! $recommended_product ) {
        return;
    }

    // 2. Gather in-stock variations for recommended product
    $variations_list = array();
    if ( $recommended_product->is_type( 'variable' ) ) {
        foreach ( $recommended_product->get_available_variations() as $var ) {
            if ( ! empty( $var['is_in_stock'] ) ) {
                $size_str = '';
                foreach ( $var['attributes'] as $attr_k => $attr_v ) {
                    if ( stripos( $attr_k, 'size' ) !== false || stripos( $attr_k, 'rozmiar' ) !== false ) {
                        $size_str = strtoupper( $attr_v );
                    }
                }
                if ( empty( $size_str ) ) {
                    $size_str = implode( ' / ', array_values( $var['attributes'] ) );
                }
                $variations_list[] = array(
                    'id'    => $var['variation_id'],
                    'label' => $size_str,
                    'price' => (float) $var['display_price']
                );
            }
        }
    }

    // 3. Determine Threshold Status and Motivator Copy
    if ( $subtotal < $min_threshold ) {
        $diff = wc_price( $min_threshold - $subtotal );
        $tier_kicker = __( '🎯 REACH $99.00 MINIMUM ORDER', 'naturaintimo' );
        $tier_title  = sprintf( __( 'Add this item to unlock U.S. checkout (%s away)', 'naturaintimo' ), $diff );
        $tier_sub    = __( 'Orders to the United States require a $99 USD minimum cart. Add this piece to proceed to checkout!', 'naturaintimo' );
        $badge_color = '#e07a5f';
    } elseif ( $subtotal < $free_ship_threshold ) {
        $diff = wc_price( $free_ship_threshold - $subtotal );
        $tier_kicker = __( '✈️ UNLOCK 100% FREE DHL EXPRESS SHIPPING', 'naturaintimo' );
        $tier_title  = sprintf( __( 'You are only %s away from FREE Shipping!', 'naturaintimo' ), $diff );
        $tier_sub    = __( 'Add this piece to qualify for 100% FREE DHL Express delivery direct from Europe.', 'naturaintimo' );
        $badge_color = '#d4af37';
    } elseif ( $subtotal < $free_duty_threshold ) {
        $diff = wc_price( $free_duty_threshold - $subtotal );
        $tier_kicker = __( '🛡️ UNLOCK 100% FREE DUTIES & TAXES (DDP)', 'naturaintimo' );
        $tier_title  = sprintf( __( 'Upgrade to VIP: %s away from Free Duties!', 'naturaintimo' ), $diff );
        $tier_sub    = __( 'Reach $199 USD for all U.S. import fees and customs pre-cleared at zero charge.', 'naturaintimo' );
        $badge_color = '#27ae60';
    } else {
        $tier_kicker = __( '👑 VIP STATUS: ALL PERKS UNLOCKED', 'naturaintimo' );
        $tier_title  = __( 'Recommended to complete your luxury wardrobe', 'naturaintimo' );
        $tier_sub    = __( 'You have unlocked Free DHL Express and Free Customs Duties!', 'naturaintimo' );
        $badge_color = '#27ae60';
    }

    $rec_name  = $recommended_product->get_name();
    $rec_url   = esc_url( $recommended_product->get_permalink() );
    $rec_price = $recommended_product->get_price_html();
    $image_id  = $recommended_product->get_image_id();
    $image_src = $image_id ? wp_get_attachment_image_url( $image_id, 'woocommerce_thumbnail' ) : wc_placeholder_img_src();

    $rec_is_bra = ( preg_match( '/\\b(bra|biustonosz|semi-soft|soft|full cup|push-up)\\b/i', $rec_name ) && ! preg_match( '/brazilian|brazyliany/i', $rec_name ) );
    $tag_label = $is_matching_set_deal 
        ? ( $rec_is_bra ? __( '✨ Matching Bra · Save $10 on Set', 'naturaintimo' ) : __( '✨ Matching Bottom · Save $10 on Set', 'naturaintimo' ) )
        : ( $rec_is_bra ? __( 'Customer Favorite Bra', 'naturaintimo' ) : __( 'Bestseller Luxury Bottom', 'naturaintimo' ) );

    ?>
    <div class="ni-cart-booster-box" id="niCartBoosterBox" data-product-id="<?php echo esc_attr( $recommended_product->get_id() ); ?>">
        <div class="ni-booster-header">
            <span class="ni-booster-kicker" style="color:<?php echo esc_attr( $badge_color ); ?>;">
                <?php echo esc_html( $tier_kicker ); ?>
            </span>
            <h4 class="ni-booster-title"><?php echo wp_kses_post( $tier_title ); ?></h4>
            <p class="ni-booster-subtitle"><?php echo esc_html( $tier_sub ); ?></p>
        </div>

        <div class="ni-booster-card">
            <a href="<?php echo $rec_url; ?>" class="ni-booster-thumb" aria-label="<?php echo esc_attr( $rec_name ); ?>">
                <img src="<?php echo esc_url( $image_src ); ?>" alt="<?php echo esc_attr( $rec_name ); ?>" loading="lazy" />
            </a>

            <div class="ni-booster-info">
                <span class="ni-booster-tag"><?php echo esc_html( $tag_label ); ?></span>
                <a href="<?php echo $rec_url; ?>" class="ni-booster-name"><?php echo esc_html( $rec_name ); ?></a>
                <div class="ni-booster-price"><?php echo $rec_price; ?></div>

                <?php if ( ! empty( $variations_list ) ) : ?>
                <div class="ni-booster-size-wrap">
                    <select class="ni-booster-select" id="niBoosterSizeSelect">
                        <option value="">-- Select Size --</option>
                        <?php foreach ( $variations_list as $v_item ) : ?>
                            <option value="<?php echo esc_attr( $v_item['id'] ); ?>">
                                Size: <?php echo esc_html( $v_item['label'] ); ?> (In Stock)
                            </option>
                        <?php endforeach; ?>
                    </select>
                </div>
                <?php endif; ?>

                <div class="ni-booster-btn-row">
                    <button type="button" class="ni-btn-booster-add" id="niBtnBoosterAdd">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                        <span>Add to Bag &amp; Reach Goal</span>
                    </button>
                    <a href="<?php echo $rec_url; ?>" class="ni-booster-details-link">Details →</a>
                </div>

                <div id="niBoosterFeedback" class="ni-booster-feedback" style="display:none;"></div>
            </div>
        </div>
    </div>

    <style>
    .ni-cart-booster-box {
        float: left;
        width: 48%;
        box-sizing: border-box;
        background: #fffcf9;
        border: 1.5px solid #ebd9c8;
        border-radius: 16px;
        padding: 22px;
        margin-bottom: 30px;
        box-shadow: 0 4px 18px rgba(48,37,43,0.04);
        font-family: inherit;
    }
    .ni-booster-header {
        margin-bottom: 14px;
    }
    .ni-booster-kicker {
        display: block;
        font-size: 0.72rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        margin-bottom: 4px;
    }
    .ni-booster-title {
        font-size: 1.05rem;
        font-weight: 700;
        color: #30252b;
        margin: 0 0 4px 0;
        line-height: 1.35;
    }
    .ni-booster-subtitle {
        font-size: 0.8rem;
        color: #6a5760;
        margin: 0;
        line-height: 1.4;
    }
    .ni-booster-card {
        display: flex;
        align-items: flex-start;
        gap: 16px;
        background: #ffffff;
        border: 1px solid #f0e6e8;
        border-radius: 14px;
        padding: 14px;
        margin-top: 12px;
    }
    .ni-booster-thumb {
        width: 76px;
        height: 102px;
        min-width: 76px;
        border-radius: 10px;
        overflow: hidden;
        background: #faf4f6;
        display: block;
        flex-shrink: 0;
    }
    .ni-booster-thumb img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        object-position: center top;
        display: block;
        transition: transform 0.3s ease;
    }
    .ni-booster-thumb:hover img {
        transform: scale(1.06);
    }
    .ni-booster-info {
        flex-grow: 1;
        min-width: 0;
    }
    .ni-booster-tag {
        display: inline-block;
        font-size: 0.68rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: #93566a;
        margin-bottom: 2px;
    }
    .ni-booster-name {
        font-size: 0.95rem;
        font-weight: 600;
        line-height: 1.35;
        color: #30252b !important;
        text-decoration: none !important;
        display: block;
        margin-bottom: 4px;
    }
    .ni-booster-price {
        font-size: 1.15rem;
        font-weight: 700;
        color: #30252b;
        margin-bottom: 10px;
    }
    .ni-booster-size-wrap {
        margin-bottom: 12px;
    }
    .ni-booster-select {
        width: 100%;
        max-width: 260px;
        padding: 8px 10px;
        font-size: 0.85rem;
        border: 1.5px solid #dfcfd4;
        border-radius: 8px;
        background: #fff;
        color: #30252b;
        outline: none;
        transition: border-color 0.2s ease;
    }
    .ni-booster-select:focus {
        border-color: #30252b;
    }
    .ni-booster-btn-row {
        display: flex;
        align-items: center;
        gap: 12px;
        flex-wrap: wrap;
    }
    .ni-btn-booster-add {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 10px 18px;
        border-radius: 999px;
        background: #30252b;
        color: #ffffff !important;
        font-size: 0.82rem;
        font-weight: 600;
        border: none;
        cursor: pointer;
        transition: all 0.2s ease;
        box-shadow: 0 4px 12px rgba(48,37,43,0.15);
    }
    .ni-btn-booster-add:hover {
        background: #b86f82;
        transform: translateY(-2px);
        box-shadow: 0 6px 16px rgba(184,111,130,0.3);
    }
    .ni-btn-booster-add:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
    .ni-booster-details-link {
        font-size: 0.8rem;
        color: #93566a !important;
        text-decoration: underline !important;
    }
    .ni-booster-feedback {
        margin-top: 8px;
        padding: 6px 10px;
        border-radius: 6px;
        font-size: 0.78rem;
        font-weight: 600;
    }
    .ni-booster-feedback.error {
        background: #fde8e8;
        color: #9b1c1c;
    }
    .ni-booster-feedback.success {
        background: #def7ec;
        color: #03543f;
    }
    @media (max-width: 768px) {
        .ni-cart-booster-box {
            float: none;
            width: 100%;
        }
        .ni-booster-card {
            flex-direction: column;
            align-items: flex-start;
        }
        .ni-booster-thumb {
            width: 100%;
            height: 160px;
        }
        .ni-booster-select {
            max-width: 100%;
        }
        .ni-btn-booster-add {
            width: 100%;
            justify-content: center;
        }
    }
    </style>

    <script>
    document.addEventListener('DOMContentLoaded', function() {
        var box = document.getElementById('niCartBoosterBox');
        var btn = document.getElementById('niBtnBoosterAdd');
        var select = document.getElementById('niBoosterSizeSelect');
        var fb = document.getElementById('niBoosterFeedback');
        if (!box || !btn) return;

        function showFeedback(text, type) {
            fb.className = 'ni-booster-feedback ' + type;
            fb.innerHTML = text;
            fb.style.display = 'block';
        }

        btn.addEventListener('click', function(e) {
            e.preventDefault();

            var prodId = parseInt(box.getAttribute('data-product-id'), 10);
            var varId = select ? parseInt(select.value, 10) : 0;

            if (select && (!varId || varId <= 0)) {
                showFeedback('⚠️ Please select your size first.', 'error');
                select.focus();
                return;
            }

            btn.disabled = true;
            btn.innerHTML = '<span>Adding to bag...</span>';
            showFeedback('Updating your cart...', 'success');

            var params = new URLSearchParams();
            params.append('product_id', prodId);
            if (varId > 0) {
                params.append('variation_id', varId);
            }
            params.append('quantity', 1);

            fetch('/?wc-ajax=ni_cart_booster_add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: params
            })
            .then(function(r) { return r.json(); })
            .then(function(res) {
                if (res.success) {
                    showFeedback('✓ Added! Refreshing cart...', 'success');
                    window.location.reload();
                } else {
                    btn.disabled = false;
                    btn.innerHTML = '<span>Add to Bag &amp; Reach Goal</span>';
                    showFeedback(res.data && res.data.message ? res.data.message : 'Error adding item.', 'error');
                }
            })
            .catch(function(err) {
                window.location.reload();
            });
        });
    });
    </script>
    <?php
}

// 2. AJAX Handler for 1-Click Booster Addition
add_action( 'wc_ajax_ni_cart_booster_add', 'ni_ajax_cart_booster_add' );
add_action( 'wp_ajax_ni_cart_booster_add', 'ni_ajax_cart_booster_add' );
add_action( 'wp_ajax_nopriv_ni_cart_booster_add', 'ni_ajax_cart_booster_add' );
function ni_ajax_cart_booster_add() {
    $product_id   = isset( $_POST['product_id'] ) ? absint( $_POST['product_id'] ) : 0;
    $variation_id = isset( $_POST['variation_id'] ) ? absint( $_POST['variation_id'] ) : 0;
    $quantity     = isset( $_POST['quantity'] ) ? absint( $_POST['quantity'] ) : 1;

    if ( ! $product_id ) {
        wp_send_json_error( array( 'message' => 'Missing product ID.' ) );
    }

    if ( ! function_exists( 'WC' ) || ! WC()->cart ) {
        wp_send_json_error( array( 'message' => 'Cart not initialized.' ) );
    }

    if ( $variation_id > 0 ) {
        $added = WC()->cart->add_to_cart( $product_id, $quantity, $variation_id );
    } else {
        $added = WC()->cart->add_to_cart( $product_id, $quantity );
    }

    if ( $added ) {
        wp_send_json_success( array( 'message' => 'Added to cart successfully!' ) );
    } else {
        wp_send_json_error( array( 'message' => 'Could not add to cart.' ) );
    }
}
`;

async function deploy() {
  console.log('1. Checking Code Snippets for Snippet #11...');
  const res = await fetch(`${url}/wp-json/code-snippets/v1/snippets`, {
    headers: { 'Authorization': 'Basic ' + auth }
  });
  const snippets = await res.json();
  const existing = snippets.find(s => s.name && s.name.includes('Cart Threshold Booster'));

  const payload = {
    name: 'Natura Intimo – Cart Threshold Booster (Smart Upsell)',
    code: snippetPhp,
    active: true
  };

  if (existing) {
    console.log(`Updating Snippet #${existing.id}...`);
    const updateRes = await fetch(`${url}/wp-json/code-snippets/v1/snippets/${existing.id}`, {
      method: 'PUT',
      headers: {
        'Authorization': 'Basic ' + auth,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    const data = await updateRes.json();
    console.log(`Snippet #${existing.id} updated! Active:`, data.active);
  } else {
    console.log('Creating new Snippet #11...');
    const createRes = await fetch(`${url}/wp-json/code-snippets/v1/snippets`, {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + auth,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    const data = await createRes.json();
    console.log(`Snippet #${data.id} created and activated!`);
  }
}

deploy().catch(console.error);
