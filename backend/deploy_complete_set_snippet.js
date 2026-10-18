import https from 'https';
import dotenv from 'dotenv';
dotenv.config();

const wpUser = process.env.WP_ADMIN_USER;
const wpPass = process.env.WP_APP_PASSWORD;
const wpAuth = Buffer.from(`${wpUser}:${wpPass}`).toString('base64');
const url = process.env.WOOCOMMERCE_URL || 'https://naturaintimo.com';

const snippetCode = `/**
 * Snippet Name: Natura Intimo – Complete the Set Engine (Product Card)
 * Description: Displays the matching set item (Bra <-> Panties) directly on the single product page below the add-to-cart form and in the upsell area.
 */

if (!defined('ABSPATH')) {
    exit;
}

// 1. Helper: Resolve matching product ID
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

    // A. Check explicit meta '_matching_product_id'
    $matching_id = get_post_meta( $product_id, '_matching_product_id', true );

    // B. Check WooCommerce native upsells
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

// 2. Render "Complete the Set" card directly after the Add to Cart form
add_action( 'woocommerce_after_add_to_cart_form', 'ni_render_complete_set_summary_box', 15 );
function ni_render_complete_set_summary_box() {
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

    $kicker = __( '✨ Coordinated Lingerie Set', 'naturaintimo' );
    $heading = $is_bra 
        ? __( 'Complete the Set: Pair with Matching Bottom', 'naturaintimo' ) 
        : __( 'Complete the Set: Pair with Matching Bra', 'naturaintimo' );
    $type_label = $is_bra ? __( 'Matching Bottom', 'naturaintimo' ) : __( 'Matching Bra', 'naturaintimo' );

    $matching_name  = $matching->get_name();
    $matching_url   = esc_url( $matching->get_permalink() );
    $matching_price = $matching->get_price_html();
    $image_id       = $matching->get_image_id();
    $image_src      = $image_id ? wp_get_attachment_image_url( $image_id, 'woocommerce_thumbnail' ) : wc_placeholder_img_src();

    ?>
    <div class="ni-set-widget" id="niSetWidget">
        <div class="ni-set-header">
            <span class="ni-set-kicker"><?php echo esc_html( $kicker ); ?></span>
            <h4 class="ni-set-title"><?php echo esc_html( $heading ); ?></h4>
        </div>

        <div class="ni-set-card">
            <a href="<?php echo $matching_url; ?>" class="ni-set-thumb" aria-label="<?php echo esc_attr( $matching_name ); ?>">
                <img src="<?php echo esc_url( $image_src ); ?>" alt="<?php echo esc_attr( $matching_name ); ?>" loading="lazy" />
            </a>

            <div class="ni-set-details">
                <span class="ni-set-tag"><?php echo esc_html( $type_label ); ?></span>
                <a href="<?php echo $matching_url; ?>" class="ni-set-name"><?php echo esc_html( $matching_name ); ?></a>
                <div class="ni-set-price-wrap">
                    <span class="ni-set-price"><?php echo $matching_price; ?></span>
                </div>
                <div class="ni-set-perk-hint">
                    💡 <em>Add both pieces to reach the <strong>$99 USD minimum order</strong> &amp; free shipping over $150!</em>
                </div>
            </div>

            <div class="ni-set-cta-col">
                <a href="<?php echo $matching_url; ?>" class="ni-set-btn">
                    <span><?php esc_html_e( 'View Matching Item', 'naturaintimo' ); ?></span>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </a>
            </div>
        </div>
    </div>

    <style>
    .ni-set-widget {
        margin: 22px 0 18px 0;
        padding: 18px 20px;
        background: #fffaf7;
        border: 1.5px solid #ebdce1;
        border-radius: 18px;
        box-shadow: 0 4px 18px rgba(48,37,43,0.04);
        clear: both;
    }
    .ni-set-header {
        margin-bottom: 12px;
    }
    .ni-set-kicker {
        display: block;
        font-size: 0.72rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.12em;
        color: #b86f82;
        margin-bottom: 3px;
    }
    .ni-set-title {
        font-size: 1.05rem;
        font-weight: 700;
        color: #30252b;
        margin: 0;
        line-height: 1.3;
    }
    .ni-set-card {
        display: flex;
        align-items: center;
        gap: 16px;
        background: #ffffff;
        border: 1px solid #f0e6e8;
        border-radius: 14px;
        padding: 12px 14px;
        transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
    .ni-set-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 20px rgba(48,37,43,0.08);
    }
    .ni-set-thumb {
        width: 72px;
        height: 96px;
        min-width: 72px;
        border-radius: 10px;
        overflow: hidden;
        background: #faf4f6;
        display: block;
        flex-shrink: 0;
    }
    .ni-set-thumb img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        object-position: center top;
        display: block;
        transition: transform 0.3s ease;
    }
    .ni-set-card:hover .ni-set-thumb img {
        transform: scale(1.05);
    }
    .ni-set-details {
        flex-grow: 1;
        min-width: 0;
    }
    .ni-set-tag {
        display: inline-block;
        font-size: 0.68rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: #93566a;
        margin-bottom: 3px;
    }
    .ni-set-name {
        font-size: 0.95rem;
        font-weight: 600;
        line-height: 1.35;
        color: #30252b !important;
        text-decoration: none !important;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
        margin-bottom: 6px;
    }
    .ni-set-name:hover {
        color: #b86f82 !important;
    }
    .ni-set-price-wrap {
        font-size: 1.15rem;
        font-weight: 700;
        color: #30252b;
        line-height: 1.2;
    }
    .ni-set-price-wrap .woocommerce-Price-amount {
        color: #30252b;
    }
    .ni-set-perk-hint {
        font-size: 0.76rem;
        line-height: 1.35;
        color: #6a545e;
        margin-top: 5px;
    }
    .ni-set-cta-col {
        flex-shrink: 0;
    }
    .ni-set-btn {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 10px 16px;
        border-radius: 999px;
        background: #30252b;
        color: #ffffff !important;
        font-size: 0.82rem;
        font-weight: 600;
        text-decoration: none !important;
        transition: all 0.2s ease;
        white-space: nowrap;
        box-shadow: 0 4px 12px rgba(48,37,43,0.15);
    }
    .ni-set-btn svg {
        transition: transform 0.2s ease;
        display: block;
    }
    .ni-set-btn:hover {
        background: #b86f82;
        color: #ffffff !important;
        transform: translateY(-2px);
        box-shadow: 0 6px 16px rgba(184,111,130,0.3);
    }
    .ni-set-btn:hover svg {
        transform: translateX(3px);
    }
    @media (max-width: 600px) {
        .ni-set-card {
            flex-direction: column;
            align-items: flex-start;
        }
        .ni-set-thumb {
            width: 100%;
            height: 160px;
        }
        .ni-set-cta-col {
            width: 100%;
        }
        .ni-set-btn {
            width: 100%;
            justify-content: center;
        }
    }
    </style>
    <?php
}
`;

async function deploy() {
  console.log('Fetching snippets to create or update Snippet #9...');
  const res = await fetch(`${url}/wp-json/code-snippets/v1/snippets`, {
    headers: { 'Authorization': 'Basic ' + wpAuth }
  });
  const snippets = await res.json();
  const existing = snippets.find(s => s.name && s.name.includes('Complete the Set Engine'));

  const payload = {
    name: 'Natura Intimo – Complete the Set Engine (Product Card)',
    code: snippetCode,
    active: true
  };

  if (existing) {
    console.log(`Updating existing Snippet #${existing.id}...`);
    const updateRes = await fetch(`${url}/wp-json/code-snippets/v1/snippets/${existing.id}`, {
      method: 'PUT',
      headers: {
        'Authorization': 'Basic ' + wpAuth,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    const data = await updateRes.json();
    console.log(`Snippet #${existing.id} updated! Active:`, data.active);
  } else {
    console.log('Creating new Snippet...');
    const createRes = await fetch(`${url}/wp-json/code-snippets/v1/snippets`, {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + wpAuth,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    const data = await createRes.json();
    console.log(`Snippet #${data.id} created and activated!`);
  }
}

deploy().catch(console.error);
