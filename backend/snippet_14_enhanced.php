<?php
/**
 * Snippet Name: Natura Intimo – Enhanced Google Merchant, OpenGraph & Schema.org Structured Data
 * Description: Injects shippingDetails ($24.99 DHL Express Worldwide DDP), hasMerchantReturnPolicy (30-day returns), English tagline filter, OpenGraph social meta tags, and FAQPage JSON-LD across key pages (Home, Size Guide, FAQ, Full-Bust).
 */

if (!defined('ABSPATH')) {
    exit;
}

// 0. Enforce English Tagline for US/CA Global Storefront
add_filter('option_blogdescription', 'ni_enforce_english_tagline', 99);
function ni_enforce_english_tagline($desc) {
    if (is_admin()) {
        return $desc;
    }
    return 'European Full-Bust Lingerie & Coordinated Sets';
}

// 1. Automatic 301 redirect for any legacy Polish /produkt/ URLs to /product/
add_action('init', 'ni_redirect_legacy_produkt_urls', 1);
function ni_redirect_legacy_produkt_urls() {
    $uri = $_SERVER['REQUEST_URI'] ?? '';
    if (strpos($uri, '/produkt/') !== false) {
        $clean_path = str_replace('/produkt/', '/product/', $uri);
        wp_safe_redirect(home_url($clean_path), 301);
        exit;
    }
}

// 2. Product Offer Structured Data ($24.99 USD flat-rate DDP per market_config.json)
add_filter('woocommerce_structured_data_product_offer', 'ni_enrich_schema_product_offer', 20, 2);
function ni_enrich_schema_product_offer($offer, $product) {
    if (!$offer || !is_array($offer)) {
        return $offer;
    }

    $offer['shippingDetails'] = array(
        '@type' => 'OfferShippingDetails',
        'shippingRate' => array(
            '@type' => 'MonetaryAmount',
            'value' => '24.99',
            'currency' => 'USD'
        ),
        'shippingDestination' => array(
            '@type' => 'DefinedRegion',
            'addressCountry' => 'US'
        ),
        'deliveryTime' => array(
            '@type' => 'ShippingDeliveryTime',
            'handlingTime' => array(
                '@type' => 'QuantitativeValue',
                'minValue' => 1,
                'maxValue' => 2,
                'unitCode' => 'DAY'
            ),
            'transitTime' => array(
                '@type' => 'QuantitativeValue',
                'minValue' => 2,
                'maxValue' => 4,
                'unitCode' => 'DAY'
            )
        )
    );

    $offer['hasMerchantReturnPolicy'] = array(
        '@type' => 'MerchantReturnPolicy',
        'applicableCountry' => 'US',
        'returnPolicyCategory' => 'https://schema.org/MerchantReturnFiniteReturnWindow',
        'merchantReturnDays' => 30,
        'returnMethod' => 'https://schema.org/ReturnByMail',
        'returnFees' => 'https://schema.org/FreeReturn',
        'merchantReturnLink' => 'https://naturaintimo.com/refund-policy/'
    );

    return $offer;
}

// Filter to enrich WooCommerce Schema.org Product data for Google Merchant / Google Search
add_filter('woocommerce_structured_data_product', 'ni_enrich_schema_product_data', 20, 2);
function ni_enrich_schema_product_data($markup, $product) {
    if (!$markup || !is_array($markup) || !$product) {
        return $markup;
    }

    // 1. Ensure Brand is structured object
    $parent_id = $product->is_type('variation') ? $product->get_parent_id() : $product->get_id();
    $brand_terms = wp_get_post_terms($parent_id, 'pa_brand', ['fields' => 'names']);
    $brand_name = !empty($brand_terms) && !is_wp_error($brand_terms) ? $brand_terms[0] : '';
    if (!$brand_name) {
        // Fallback detection from title
        $title = $product->get_name();
        foreach (['Gorsenia', 'Gaia', 'Ava', 'Mefemi', 'Alles'] as $b) {
            if (stripos($title, $b) !== false) {
                $brand_name = $b;
                break;
            }
        }
    }
    if ($brand_name) {
        $markup['brand'] = [
            '@type' => 'Brand',
            'name' => $brand_name
        ];
    }

    // 2. Country of Origin (Poland, European Union)
    $markup['countryOfOrigin'] = [
        '@type' => 'Country',
        'name' => 'Poland'
    ];

    // 3. Category
    $cats = wp_get_post_terms($parent_id, 'product_cat', ['fields' => 'names']);
    if (!empty($cats) && !is_wp_error($cats)) {
        $markup['category'] = implode(' > ', $cats);
    }

    return $markup;
}

// 3. Inject OpenGraph Tags, Meta Description, Hreflang & FAQPage JSON-LD in wp_head
add_action('wp_head', 'ni_inject_seo_and_jsonld_head', 1);
function ni_inject_seo_and_jsonld_head() {
    $site_name = 'Natura Intimo';
    $default_og_image = 'https://naturaintimo.com/wp-content/uploads/2026/09/414787.jpg';

    if (is_front_page()) {
        ?>
<meta name="description" content="Shop authentic European lingerie engineered for full-bust support, everyday elegance, and coordinated sets. Express DHL shipping with guaranteed DDP duties pre-cleared." />
<meta property="og:type" content="website" />
<meta property="og:site_name" content="<?php echo esc_attr($site_name); ?>" />
<meta property="og:title" content="Natura Intimo – European Full-Bust Lingerie & Coordinated Sets" />
<meta property="og:description" content="Authentic European lingerie engineered for full-bust support (EU 65–115 / US 30–50, Cups B–M). Direct express air delivery via DHL Express DDP." />
<meta property="og:url" content="<?php echo esc_url(home_url('/')); ?>" />
<meta property="og:image" content="<?php echo esc_url($default_og_image); ?>" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="Natura Intimo – European Full-Bust Lingerie & Coordinated Sets" />
<meta name="twitter:description" content="European lingerie engineered for full-bust support. Express DHL shipping with pre-cleared DDP duties." />
<meta name="twitter:image" content="<?php echo esc_url($default_og_image); ?>" />
<link rel="alternate" hreflang="en-US" href="https://naturaintimo.com/" />
<link rel="alternate" hreflang="en-CA" href="https://naturaintimo.com/natura-intimo-canada/" />
<link rel="alternate" hreflang="pl-PL" href="https://naturaintimo.com/pl/" />
<link rel="alternate" hreflang="x-default" href="https://naturaintimo.com/" />
        <?php
    } elseif (is_singular('product')) {
        global $post;
        $product = wc_get_product($post->ID);
        if ($product) {
            $img_id = $product->get_image_id();
            $img_url = $img_id ? wp_get_attachment_image_url($img_id, 'full') : $default_og_image;
            $short_desc = wp_strip_all_tags($product->get_short_description() ?: $product->get_description());
            $clean_desc = substr(preg_replace('/\s+/', ' ', $short_desc), 0, 160);
            $curr = get_woocommerce_currency();
            $price = $product->get_price();
            ?>
<meta property="og:type" content="og:product" />
<meta property="og:site_name" content="<?php echo esc_attr($site_name); ?>" />
<meta property="og:title" content="<?php echo esc_attr($product->get_name()); ?> | Natura Intimo" />
<meta property="og:description" content="<?php echo esc_attr($clean_desc); ?>" />
<meta property="og:url" content="<?php echo esc_url(get_permalink($post->ID)); ?>" />
<meta property="og:image" content="<?php echo esc_url($img_url); ?>" />
<meta property="product:price:amount" content="<?php echo esc_attr($price); ?>" />
<meta property="product:price:currency" content="<?php echo esc_attr($curr); ?>" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="<?php echo esc_attr($product->get_name()); ?>" />
<meta name="twitter:description" content="<?php echo esc_attr($clean_desc); ?>" />
<meta name="twitter:image" content="<?php echo esc_url($img_url); ?>" />
            <?php
        }
    } elseif (is_page('size-guide') || is_page(4515)) {
        ?>
<meta property="og:type" content="article" />
<meta property="og:site_name" content="<?php echo esc_attr($site_name); ?>" />
<meta property="og:title" content="European to US/UK Bra Size Conversion & Fit Guide | Natura Intimo" />
<meta property="og:description" content="Calculate your exact European bra band and cup size from US inches or centimeters. Learn Polish lingerie fit nuances and find your sister size." />
<meta property="og:url" content="<?php echo esc_url(home_url('/size-guide/')); ?>" />
<meta property="og:image" content="<?php echo esc_url($default_og_image); ?>" />
<meta name="twitter:card" content="summary_large_image" />
<script type="application/ld+json">{"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "How do European bra band sizes convert to US sizes?", "acceptedAnswer": {"@type": "Answer", "text": "European bra bands are sized in metric centimeters. EU 65 equals US 30, EU 70 equals US 32, EU 75 equals US 34, EU 80 equals US 36, EU 85 equals US 38, EU 90 equals US 40, and EU 95 equals US 42."}}, {"@type": "Question", "name": "What is the difference between European and US bra cup progressions?", "acceptedAnswer": {"@type": "Answer", "text": "European manufacturers use single sequential letter steps (A, B, C, D, E, F, G, H, I, J, K), whereas US brands use repeating letters (DD, DDD/F, G/4D). For instance, an EU F cup is equivalent to a US DDD, and an EU G cup corresponds to a US 4D/G."}}, {"@type": "Question", "name": "Why do Polish bras offer superior support for fuller busts?", "acceptedAnswer": {"@type": "Answer", "text": "Polish brands such as Gorsenia, Gaia, and Ava design structured multi-part seamed cups with firm underwires and reinforced side slings. This architecture projects breast tissue forward, giving all-day lift without slipping bands or digging shoulder straps."}}, {"@type": "Question", "name": "What if my European bra does not fit perfectly when it arrives?", "acceptedAnswer": {"@type": "Answer", "text": "Natura Intimo provides a 30-day return window and a complimentary Free First Size Exchange on coordinated sets for all customers in the United States and Canada."}}]}</script>
        <?php
    }

    if (is_page(4530) || is_page('frequently-asked-questions')) {
        ?>
<script type="application/ld+json">{"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "Where does Natura Intimo ship from, and what is the delivery time?", "acceptedAnswer": {"@type": "Answer", "text": "All Natura Intimo orders are prepared in and dispatched directly from our European atelier in Olsztyn, Poland, and delivered to the United States and Canada via DHL Express Worldwide within 2 to 4 business days."}}, {"@type": "Question", "name": "How do European bra sizes compare to US sizes?", "acceptedAnswer": {"@type": "Answer", "text": "European bra band sizes are measured in centimeters and run 4 to 6 numbers higher than US band sizes (for example, EU 75 is equivalent to US 34, EU 80 to US 36), while cup progressions use continuous single-letter sizing where EU E equals US DD, EU F equals US DDD, and EU G equals US 4D/G."}}, {"@type": "Question", "name": "Are there any surprise customs duties or import fees upon delivery in the United States?", "acceptedAnswer": {"@type": "Answer", "text": "No, U.S. customers never pay surprise customs duties or carrier COD fees upon delivery because all shipments are processed under Delivered Duty Paid (DDP) terms. Standard flat-rate shipping is $24.99 USD (all duties included), and orders of $150.00 USD or more qualify for 100% free DHL Express shipping and free customs duty coverage."}}, {"@type": "Question", "name": "How does customs work for Canadian orders under the CETA agreement?", "acceptedAnswer": {"@type": "Answer", "text": "Canadian customers pay 0% preferential customs import duty on all Natura Intimo lingerie under the Canada–European Union Comprehensive Economic and Trade Agreement (CETA) because every garment is certified as manufactured in Poland (European Union)."}}, {"@type": "Question", "name": "What is Natura Intimo's return policy and size exchange guarantee?", "acceptedAnswer": {"@type": "Answer", "text": "Natura Intimo offers a 30-day return window from physical delivery for all U.S. and Canadian orders, including a complimentary Free First Size Exchange on coordinated lingerie sets to guarantee your perfect fit."}}, {"@type": "Question", "name": "Can I purchase a matching bra and panties set with a bundle discount?", "acceptedAnswer": {"@type": "Answer", "text": "Yes, pairing any bra with its matching coordinated bottoms automatically applies an instant $10.00 Set Savings discount at checkout and qualifies your order towards our Free DHL Express shipping threshold ($150.00 USD / C$200.00 CAD)."}}, {"@type": "Question", "name": "Which payment methods are accepted for US and Canadian customers?", "acceptedAnswer": {"@type": "Answer", "text": "Customers in the United States and Canada can pay securely using Visa, Mastercard, American Express, Apple Pay, and Google Pay, with transactions processed transparently in USD or CAD without hidden surcharges."}}, {"@type": "Question", "name": "How do I choose the correct European bra size before ordering?", "acceptedAnswer": {"@type": "Answer", "text": "Measure your snug underbust and fullest bust reading in inches or centimeters, then reference our interactive Size Guide & Calculator or submit our Brafitting Consultation Form for custom sister-size advice."}}]}</script>
        <?php
    }
    if (is_page(6931) || is_page('full-bust-bras')) {
        ?>
<script type="application/ld+json">{"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "Why is Polish bra engineering preferred for full-bust DD+ sizes?", "acceptedAnswer": {"@type": "Answer", "text": "Polish bra engineering utilizes deep, narrow underwires and multi-part cut-and-sewn cups that lift projected breast tissue forward, eliminating underarm spillage and painful shoulder strap digging."}}, {"@type": "Question", "name": "What is the US equivalent of European bra sizes like 75G or 80I?", "acceptedAnswer": {"@type": "Answer", "text": "An EU 75G corresponds to US 34G (UK 34F), and an EU 80I corresponds to US 36I (UK 36G). European bands are measured in centimeters, running 4 to 6 numbers higher than US band inches."}}, {"@type": "Question", "name": "How fast is DHL Express delivery for full-bust bras to the US and Canada?", "acceptedAnswer": {"@type": "Answer", "text": "All bras are dispatched directly from Poland and delivered via DHL Express Worldwide in 2 to 4 business days with DDP pre-cleared customs ($24.99 USD flat rate, 100% free at $150.00+ USD)."}}]}</script>
        <?php
    }
}

// 4. REST route for instant cache flush
add_action('rest_api_init', function() {
    register_rest_route('ni/v1', '/purge-cache', array(
        'methods' => 'POST',
        'permission_callback' => function() {
            return current_user_can('manage_options');
        },
        'callback' => function() {
            if (class_exists('LiteSpeed\Purge')) {
                \LiteSpeed\Purge::purge_all();
                return array('success' => true, 'purged' => 'LiteSpeed Purge::purge_all()');
            }
            if (has_action('litespeed_purge_all')) {
                do_action('litespeed_purge_all');
                return array('success' => true, 'purged' => 'do_action(litespeed_purge_all)');
            }
            return array('success' => false, 'message' => 'No litespeed purge found');
        }
    ));
});

// 5. Inject Pinterest Social Icon & Link into Astra Footer Social Icons
add_action('wp_footer', 'ni_inject_pinterest_social_icon', 99);
function ni_inject_pinterest_social_icon() {
    ?>
    <script>
    (function() {
        function addPinterest() {
            var wrap = document.querySelector('.ast-footer-social-wrap .footer-social-inner-wrap');
            if (!wrap || wrap.querySelector('.ni-pinterest-item')) return;
            var a = document.createElement('a');
            a.className = 'ast-builder-social-element ast-inline-flex footer-social-item ni-pinterest-item';
            a.href = 'https://www.pinterest.com/naturaintimo/';
            a.target = '_blank';
            a.rel = 'noopener noreferrer';
            a.setAttribute('aria-label', 'Pinterest');
            a.style.cssText = '--color: #e60023; --background-color: transparent; display: inline-flex; align-items: center; justify-content: center; text-decoration: none;';
            a.innerHTML = '<span aria-hidden="true" class="ahfb-svg-iconset ast-inline-flex svg-baseline" style="display:inline-flex; width:18px; height:18px;"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 496 512" fill="currentColor"><path d="M496 256c0 137-111 248-248 248-25.6 0-50.2-3.9-73.4-11.1 10.1-16.5 25.2-43.5 30.8-65 3-11.6 15.4-59 15.4-59s4.8 9.6 17.2 9.6c51.9 0 88.5-47.8 88.5-110.1 0-58.1-41.4-101.4-108.6-101.4-78.2 0-126.9 56-126.9 123.5 0 26.6 14.1 60 36.4 70.3 4 1.9 6.2 1 7.2-2.9 0.7-2.9 2.5-9.9 3.2-12.9 1.1-4.2 0.7-5.7-2.4-9.5-13.6-16.4-19.8-38.3-19.8-61.9 0-50.1 37.6-98.6 102.7-98.6 55.9 0 87.2 34.2 87.2 79.9 0 60.1-26.6 99.3-61.7 99.3-19.3 0-33.8-15.9-29.1-35.5 5.5-23.4 16.3-48.6 16.3-65.5 0-15.1-8.1-27.7-24.9-27.7-19.7 0-35.6 20.4-35.6 47.7 0 17.4 5.9 29.2 5.9 29.2s-20.2 85.5-23.8 100.9c-7.1 29.9-1.1 66.5-0.5 70.2-114.6-44.5-195.9-156.4-195.9-287.6 0-137 111-248 248-248s248 111 248 248z"/></svg></span><span class="social-item-label" style="margin-left:6px;">Pinterest</span>';
            wrap.appendChild(a);
        }
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', addPinterest);
        } else {
            addPinterest();
        }
    })();
    </script>
    <?php
}
