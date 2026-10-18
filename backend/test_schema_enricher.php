<?php
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
