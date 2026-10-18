/**
 * Snippet Name: Natura Intimo – Enhanced Google Merchant & Schema.org Structured Data
 * Description: Injects shippingDetails ($24.99 DHL Express Worldwide DDP), hasMerchantReturnPolicy (30-day returns), English tagline filter, and FAQPage JSON-LD in wp_head.
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

// 3. Inject Meta Description, Hreflang & FAQPage JSON-LD in wp_head (Zero wpautop corruption)
add_action('wp_head', 'ni_inject_seo_and_jsonld_head', 1);
function ni_inject_seo_and_jsonld_head() {
    if (is_front_page()) {
        ?>
<meta name="description" content="Shop authentic European lingerie engineered for full-bust support, everyday elegance, and coordinated sets. Express DHL shipping with guaranteed DDP duties pre-cleared." />
<link rel="alternate" hreflang="en-US" href="https://naturaintimo.com/" />
<link rel="alternate" hreflang="en-CA" href="https://naturaintimo.com/natura-intimo-canada/" />
<link rel="alternate" hreflang="pl-PL" href="https://naturaintimo.com/pl/" />
<link rel="alternate" hreflang="x-default" href="https://naturaintimo.com/" />
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
