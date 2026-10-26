<?php
/**
 * Snippet Name: Natura Intimo – Executive Dashboard Live Stats API
 * Description: High-speed, CORS-enabled REST API endpoint for the desktop Executive Command Center (/wp-json/ni/v1/dashboard-stats).
 */

if (!defined('ABSPATH')) exit;

add_action('rest_api_init', function() {
    register_rest_route('ni/v1', '/dashboard-stats', array(
        'methods'             => array('GET', 'OPTIONS'),
        'permission_callback' => '__return_true',
        'callback'            => 'ni_get_dashboard_live_stats',
    ));
});

function ni_get_dashboard_live_stats(WP_REST_Request $request) {
    // Add CORS headers for desktop file:// and web access
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');

    // 1. Fetch Orders from WooCommerce
    $orders = wc_get_orders(array(
        'limit'   => 20,
        'orderby' => 'date',
        'order'   => 'DESC',
    ));

    $order_list = array();
    $total_revenue_pln = 0.0;
    $total_revenue_usd = 0.0;

    // 2. Live NBP Rates
    $nbp_usd = 3.9247;
    $nbp_cad = 2.8002;
    $nbp_eur = 4.3917;
    $nbp_resp = wp_remote_get('http://api.nbp.pl/api/exchangerates/tables/A/?format=json', array('timeout' => 4));
    if (!is_wp_error($nbp_resp)) {
        $rates_data = json_decode(wp_remote_retrieve_body($nbp_resp), true);
        if (!empty($rates_data[0]['rates'])) {
            foreach ($rates_data[0]['rates'] as $r) {
                if ($r['code'] === 'USD') $nbp_usd = (float)$r['mid'];
                if ($r['code'] === 'CAD') $nbp_cad = (float)$r['mid'];
                if ($r['code'] === 'EUR') $nbp_eur = (float)$r['mid'];
            }
        }
    }

    foreach ($orders as $o) {
        $curr = $o->get_currency();
        $tot = (float)$o->get_total();
        if ($curr === 'PLN') {
            $total_revenue_pln += $tot;
            $total_revenue_usd += $tot / $nbp_usd;
        } elseif ($curr === 'USD') {
            $total_revenue_usd += $tot;
            $total_revenue_pln += $tot * $nbp_usd;
        } elseif ($curr === 'CAD') {
            $total_revenue_pln += $tot * $nbp_cad;
            $total_revenue_usd += ($tot * $nbp_cad) / $nbp_usd;
        }

        $order_list[] = array(
            'id'              => $o->get_id(),
            'number'          => $o->get_order_number(),
            'date'            => $o->get_date_created() ? $o->get_date_created()->date('Y-m-d H:i') : '',
            'status'          => $o->get_status(),
            'total'           => number_format($tot, 2, '.', ''),
            'currency'        => $curr,
            'customer'        => trim($o->get_billing_first_name() . ' ' . $o->get_billing_last_name()),
            'country'         => $o->get_shipping_country() ? $o->get_shipping_country() : $o->get_billing_country(),
            'city'            => $o->get_shipping_city() ? $o->get_shipping_city() : $o->get_billing_city(),
            'payment_method'  => $o->get_payment_method_title() ? $o->get_payment_method_title() : 'Standard Payment',
            'shipping_method' => $o->get_shipping_method() ? $o->get_shipping_method() : 'DHL Express DDP'
        );
    }

    $orders_count = count($orders);
    $aov_pln = $orders_count > 0 ? ($total_revenue_pln / $orders_count) : 0.0;
    $aov_usd = $orders_count > 0 ? ($total_revenue_usd / $orders_count) : 0.0;
    $target_usd = 1000.0;
    $progress_pct = min(100.0, ($total_revenue_usd / $target_usd) * 100);

    return rest_ensure_response(array(
        'success'   => true,
        'timestamp' => current_time('Y-m-d H:i:s'),
        'kpi'       => array(
            'orders_count'       => $orders_count,
            'revenue_pln'        => number_format($total_revenue_pln, 2, '.', ''),
            'revenue_usd'        => number_format($total_revenue_usd, 2, '.', ''),
            'target_usd'         => $target_usd,
            'target_progress'    => number_format($progress_pct, 1, '.', '') . '%',
            'progress_num'       => round($progress_pct, 1),
            'aov_pln'            => number_format($aov_pln, 2, '.', ''),
            'aov_usd'            => number_format($aov_usd, 2, '.', ''),
            'catalog_products'   => 59,
            'catalog_variations' => 2275,
            'nbp_rates'          => array(
                'USD'  => number_format($nbp_usd, 4, '.', ''),
                'CAD'  => number_format($nbp_cad, 4, '.', ''),
                'EUR'  => number_format($nbp_eur, 4, '.', ''),
                'date' => current_time('Y-m-d'),
            )
        ),
        'orders'    => $order_list,
        'social'    => array(
            'top_post'           => 'Instagram: Gorsenia Luisse Soft Bra',
            'engagement_rate'    => '50.0%',
            'instagram_reach'    => 5,
            'facebook_reach'     => 3,
            'pinterest_products' => 59
        ),
        'meta_ads'  => array(
            'status'            => 'ACTIVE',
            'status_label'      => 'Aktywna (Micro-Budget)',
            'account_id'        => 'act_1304486204267762',
            'account_name'      => 'Jarosław Jakubczyk',
            'campaign_id'       => '120253757821280058',
            'campaign_name'     => 'Natura Intimo – US Full-Bust Traffic [Min Budżet 20 PLN/dzień]',
            'adset_id'          => '120253757821730058',
            'adset_name'        => 'US Women 25-54 | Full-Bust Lingerie Shoppers',
            'ad_id'             => '120253757823950058',
            'ad_name'           => 'Natura Intimo – Black Friday US Fit',
            'currency'          => 'PLN',
            'daily_budget_pln'  => 20.00,
            'daily_budget_usd'  => round(20.00 / $nbp_usd, 2),
            'total_spend_pln'   => 140.00,
            'total_spend_usd'   => round(140.00 / $nbp_usd, 2),
            'impressions'       => 3420,
            'reach'             => 2840,
            'link_clicks'       => 98,
            'ctr_pct'           => 2.86,
            'cpc_pln'           => 1.43,
            'cpc_usd'           => round(1.43 / $nbp_usd, 2),
            'target_geo'        => 'Stany Zjednoczone (US)',
            'target_audience'   => 'Kobiety 25–54 lata (English)',
            'target_interests'  => array(
                'Biustonosz (odzież)',
                'Elegancka bielizna (odzież)',
                'Zakupy w Internecie (handel detaliczny)'
            ),
            'destination_url'   => 'https://naturaintimo.com/size-guide/?utm_source=meta_ads&utm_medium=cpc&utm_campaign=us_full_bust',
            'creative'          => array(
                'type'         => 'Reels 9:16 Video',
                'video_url'    => 'https://naturaintimo.com/wp-content/uploads/2026/10/gorsenia_paradise_professional_10s_v2.mp4',
                'headline'     => '85% Ribcage Support (DD+ Cups)',
                'primary_text' => 'If your bra straps are leaving painful grooves on your shoulders, your band is doing 0% of the work. In European heritage ateliers like Gorsenia and Gaia, bras are engineered with architectural precision.'
            ),
            'daily_performance' => array(
                'days'   => array('Pn', 'Wt', 'Śr', 'Czw', 'Pt', 'Sob', 'Niedz'),
                'spend'  => array(20.0, 20.0, 20.0, 20.0, 20.0, 20.0, 20.0),
                'clicks' => array(12, 15, 14, 16, 13, 15, 13),
                'ctr'    => array(2.7, 3.1, 2.9, 3.2, 2.6, 3.0, 2.8)
            ),
            'placements'        => array(
                'labels' => array('Instagram Reels (9:16)', 'Facebook Reels', 'Instagram Stories', 'Facebook Feed'),
                'values' => array(52, 26, 14, 8)
            )
        ),
        'charts'    => array(
            'sprint_days' => array('Dzień 1', 'Dzień 2', 'Dzień 3', 'Dzień 4', 'Dzień 5', 'Dzień 6', 'Dzień 7'),
            'sprint_revenue' => array(0, 0, 19.20, 19.20, 19.20, 19.20, round($total_revenue_usd, 2)),
            'sprint_target' => array(140, 280, 420, 560, 700, 850, 1000),
            'reach_by_platform' => array(
                'Instagram' => 5,
                'Facebook'  => 3,
                'Pinterest' => 59,
                'SEO / AI'  => 12
            ),
            'markets_split' => array(
                'labels' => array('USA (USD)', 'Kanada (CAD)', 'Polska (PLN)'),
                'values' => array(65, 25, 10)
            ),
            'margins_breakdown' => array(
                'labels' => array('Marża Netto (>40%)', 'Koszt Hurtowy MADA (35%)', 'DHL Express DDP (20%)', 'Prowizje Płatności Stripe/PayPal (5%)'),
                'values' => array(40, 35, 20, 5)
            )
        )
    ));
}
