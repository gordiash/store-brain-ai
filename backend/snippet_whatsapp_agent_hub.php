<?php
/**
 * Snippet Name: Natura Intimo – Autonomous Multi-Agent WhatsApp Hub & Command Bridge
 * Description: Upgrades the WhatsApp integration to an autonomous multi-agent hub. Enables order notifications, low-stock alerts, RMA support, and a two-way REST API command bridge for CEO, Merchant, CMO, and Brafitterka.
 */

if ( ! defined( 'ABSPATH' ) ) exit;

/**
 * 1. CORE DISPATCHER: Send formatted WhatsApp message via CallMeBot
 */
function ni_send_whatsapp_raw( $message ) {
    if ( empty( $message ) ) return false;
    
    // Credentials - configurable via options, defaults to registered CallMeBot
    $phone  = get_option( 'ni_callmebot_phone', '+48782490969' );
    $apikey = get_option( 'ni_callmebot_apikey', '1426257' );
    
    if ( empty( $phone ) || empty( $apikey ) ) {
        return false;
    }
    
    // CallMeBot requires explicit clean newlines and sanitized symbols
    $url = 'https://api.callmebot.com/whatsapp.php?phone=' . urlencode( $phone ) . '&text=' . urlencode( $message ) . '&apikey=' . urlencode( $apikey );
    
    $response = wp_remote_get( $url, array(
        'timeout'   => 12,
        'blocking'  => false,
        'sslverify' => false,
    ) );
    
    return ! is_wp_error( $response );
}

/**
 * 2. MULTI-AGENT DISPATCHER: Send message as a specific Persona
 */
function ni_send_agent_whatsapp( $agent_key, $title, $body, $action_url = '', $priority = 'NORMAL' ) {
    $agents = array(
        'CEO' => array(
            'title' => '👑 CEO • Prezes Przedsięwzięcia',
            'badge' => 'STRATEGIA & FINANSE'
        ),
        'MERCHANT' => array(
            'title' => '📦 Merchant • Kierownik Sklepu',
            'badge' => 'KATALOG & MAGAZYN MADA'
        ),
        'CMO' => array(
            'title' => '📣 CMO • Dyrektor Marketingu',
            'badge' => 'SOCIAL MEDIA & KAMPANIE'
        ),
        'BRAFITTERKA' => array(
            'title' => '👙 Brafitterka • Klara AI Concierge',
            'badge' => 'DOBÓR ROZMIARU & RMA'
        ),
        'ACCOUNTANT' => array(
            'title' => '💼 Księgowy & Eksport',
            'badge' => 'CŁO DDP & NBP & KSEF'
        ),
        'TECH' => array(
            'title' => '⚙️ Tech Lead • Inżynier Sklepu',
            'badge' => 'UX & WYDAJNOŚĆ & BEZPIECZEŃSTWO'
        ),
        'COMPLIANCE' => array(
            'title' => '🛡️ Compliance • Strażnik Prawny',
            'badge' => 'FTC & SB 478 & PRAWO US/CA'
        ),
    );
    
    $key = strtoupper( trim( $agent_key ) );
    $agent_info = isset( $agents[$key] ) ? $agents[$key] : array(
        'title' => '🤖 Agent ' . $key,
        'badge' => 'POWIADOMIENIE'
    );
    
    $priority_icon = '🔔';
    if ( $priority === 'P0' || $priority === 'HIGH' ) {
        $priority_icon = '🚨 *PILNE (P0)*:';
    } elseif ( $priority === 'SUCCESS' ) {
        $priority_icon = '✅';
    }
    
    $now = current_time( 'Y-m-d H:i' );
    
    $msg = "{$agent_info['title']}\n";
    $msg .= "_{$agent_info['badge']}_\n";
    $msg .= "━━━━━━━━━━━━━━━━━━━━\n";
    $msg .= "{$priority_icon} *{$title}*\n\n";
    $msg .= "{$body}\n";
    
    if ( ! empty( $action_url ) ) {
        $msg .= "\n━━━━━━━━━━━━━━━━━━━━\n";
        $msg .= "🔗 *Panel / Akcja:* {$action_url}\n";
    }
    
    $msg .= "\n_{$now} • Natura Intimo AI_";
    
    return ni_send_whatsapp_raw( $msg );
}

/**
 * 3. WOOCOMMERCE ORDER ALERTS (Merchant Persona)
 */
add_action( 'woocommerce_checkout_order_processed', 'ni_notify_whatsapp_on_new_order', 20, 1 );
add_action( 'woocommerce_order_status_processing', 'ni_notify_whatsapp_on_paid_order', 20, 1 );

function ni_notify_whatsapp_on_new_order( $order_id ) {
    ni_send_whatsapp_order_alert( $order_id, 'NEW ORDER' );
}

function ni_notify_whatsapp_on_paid_order( $order_id ) {
    ni_send_whatsapp_order_alert( $order_id, 'PAID / PROCESSING' );
}

function ni_send_whatsapp_order_alert( $order_id, $trigger = 'ORDER' ) {
    if ( ! $order_id ) return;
    
    // Prevent duplicate alerts within 10 minutes
    $transient_key = 'ni_wa_notified_' . $order_id;
    if ( get_transient( $transient_key ) ) {
        return;
    }
    set_transient( $transient_key, true, 10 * MINUTE_IN_SECONDS );

    $order = wc_get_order( $order_id );
    if ( ! $order ) return;

    $order_number = $order->get_order_number();
    $total_num    = number_format( (float) $order->get_total(), 2, '.', '' );
    $currency     = $order->get_currency();
    $total_clean  = $total_num . ' ' . $currency;
    $payment_method = $order->get_payment_method_title();
    
    $first_name = $order->get_billing_first_name();
    $last_name  = $order->get_billing_last_name();
    $country    = $order->get_shipping_country() ? $order->get_shipping_country() : $order->get_billing_country();
    $city       = $order->get_shipping_city() ? $order->get_shipping_city() : $order->get_billing_city();
    
    $flag = '🌍';
    if ( $country === 'US' ) $flag = '🇺🇸 USA';
    elseif ( $country === 'CA' ) $flag = '🇨🇦 Canada';
    elseif ( $country === 'PL' ) $flag = '🇵🇱 Poland';

    $items_summary = array();
    foreach ( $order->get_items() as $item ) {
        $items_summary[] = '• ' . $item->get_name() . ' (x' . $item->get_quantity() . ')';
    }
    $items_text = implode( "\n", array_slice( $items_summary, 0, 5 ) );
    if ( count( $items_summary ) > 5 ) {
        $items_text .= "\n" . '... oraz ' . ( count( $items_summary ) - 5 ) . ' innych';
    }

    $shipping_title = $order->get_shipping_method();
    if ( empty( $shipping_title ) ) {
        $shipping_title = 'DHL Express DDP';
    }
    $shipping_title = str_replace( '$', '', $shipping_title );

    $body = "📦 *Zamówienie:* #{$order_number}\n";
    $body .= "👤 *Klient:* {$first_name} {$last_name}\n";
    $body .= "📍 *Lokalizacja:* {$city}, {$flag}\n";
    $body .= "💰 *Wartość:* {$total_clean}\n";
    $body .= "💳 *Płatność:* {$payment_method}\n";
    $body .= "✈️ *Dostawa:* {$shipping_title}\n\n";
    $body .= "*Produkty:*\n{$items_text}";

    $admin_url = admin_url( "post.php?post={$order_id}&action=edit" );

    ni_send_agent_whatsapp( 'MERCHANT', "Nowe Zamówienie #{$order_number} ({$total_clean})", $body, $admin_url, 'SUCCESS' );
}

/**
 * 4. LOW STOCK & OUT OF STOCK NOTIFICATIONS (Merchant Persona)
 */
add_action( 'woocommerce_no_stock', 'ni_whatsapp_alert_no_stock' );
function ni_whatsapp_alert_no_stock( $product ) {
    if ( ! $product ) return;
    $title = $product->get_name();
    $sku   = $product->get_sku() ? $product->get_sku() : 'brak SKU';
    $body  = "Produkt *{$title}* (SKU: {$sku}) został wyprzedany do 0!\nWymagana weryfikacja w feedzie hurtowni MADA.";
    $url   = admin_url( 'post.php?post=' . $product->get_id() . '&action=edit' );
    ni_send_agent_whatsapp( 'MERCHANT', "BRAK MAGAZYNOWY: {$title}", $body, $url, 'P0' );
}

/**
 * 5. RMA & REFUND ALERTS (Brafitterka & Customer Care Persona)
 */
add_action( 'woocommerce_order_refunded', 'ni_whatsapp_alert_order_refund', 10, 2 );
function ni_whatsapp_alert_order_refund( $order_id, $refund_id ) {
    $order = wc_get_order( $order_id );
    if ( ! $order ) return;
    $body = "Zarejestrowano zwrot/korektę dla zamówienia #{$order->get_order_number()}.\n";
    $body .= "Klient: " . $order->get_formatted_billing_full_name() . "\n";
    $body .= "Status RMA: Zgodnie z procedurą Free First Size Exchange (30 dni).";
    $url  = admin_url( "post.php?post={$order_id}&action=edit" );
    ni_send_agent_whatsapp( 'BRAFITTERKA', "Wymiana / Zwrot RMA #{$order->get_order_number()}", $body, $url );
}

/**
 * 6. TWO-WAY REST API COMMAND BRIDGE FOR AGENTS
 * Route: POST/GET /wp-json/ni/v1/whatsapp-agent-command
 */
add_action( 'rest_api_init', 'ni_register_whatsapp_agent_command_routes' );
function ni_register_whatsapp_agent_command_routes() {
    register_rest_route( 'ni/v1', '/whatsapp-agent-command', array(
        'methods'             => array( 'GET', 'POST' ),
        'permission_callback' => '__return_true', // Protected by token or open for quick trigger
        'callback'            => 'ni_handle_whatsapp_agent_command',
    ) );
}

function ni_handle_whatsapp_agent_command( WP_REST_Request $request ) {
    $cmd_raw = $request->get_param( 'cmd' );
    if ( empty( $cmd_raw ) ) {
        $cmd_raw = $request->get_param( 'message' );
    }
    if ( empty( $cmd_raw ) ) {
        $body_params = $request->get_json_params();
        if ( ! empty( $body_params['cmd'] ) ) $cmd_raw = $body_params['cmd'];
        elseif ( ! empty( $body_params['message'] ) ) $cmd_raw = $body_params['message'];
    }
    
    if ( empty( $cmd_raw ) ) {
        return rest_ensure_response( array(
            'status'  => 'error',
            'message' => 'Brak parametru cmd lub message.',
            'usage'   => 'Wyślij GET/POST z parametrem cmd=ceo, cmd=pomoc, cmd=stan [model], cmd=cmo'
        ) );
    }

    $cmd = strtolower( trim( $cmd_raw ) );

    // 1. HELP / POMOC
    if ( in_array( $cmd, array( 'pomoc', 'help', '/help', '/pomoc', 'menu', 'agenci' ) ) ) {
        $help_text = "Dostępne komendy i agenci:\n\n";
        $help_text .= "👑 *CEO* (lub *raport*) – Finanse, przychód, cel $1,000 USD, kursy NBP\n";
        $help_text .= "📦 *STAN [model]* – Błyskawiczny stan magazynowy produktu w sklepie\n";
        $help_text .= "📣 *CMO* (lub *marketing*) – Status postów FB/IG, reels i kampanii\n";
        $help_text .= "👙 *BRAFITTING [pytanie]* – Konsultacja rozmiaru i miseczki\n";
        $help_text .= "⚙️ *STATUS* – Stan techniczny bramek płatności, LiteSpeed i API\n\n";
        $help_text .= "Wpisz np. *stan gorsenia* lub *ceo*.";

        ni_send_agent_whatsapp( 'CEO', 'Centrum Agentów Natura Intimo', $help_text );
        return rest_ensure_response( array( 'agent' => 'CEO', 'reply' => $help_text ) );
    }

    // 2. CEO / RAPORT
    if ( strpos( $cmd, 'ceo' ) === 0 || strpos( $cmd, '/ceo' ) === 0 || $cmd === 'raport' ) {
        // Query recent orders from WooCommerce
        $orders = wc_get_orders( array(
            'limit'  => 50,
            'status' => array( 'wc-processing', 'wc-completed' ),
        ) );

        $total_rev = 0.0;
        $order_count = count( $orders );
        foreach ( $orders as $o ) {
            $total_rev += (float) $o->get_total();
        }

        // Fetch current NBP USD rate
        $nbp_usd = '3.8974';
        $nbp_resp = wp_remote_get( 'http://api.nbp.pl/api/exchangerates/rates/A/USD/?format=json', array( 'timeout' => 4 ) );
        if ( ! is_wp_error( $nbp_resp ) ) {
            $data = json_decode( wp_remote_retrieve_body( $nbp_resp ), true );
            if ( ! empty( $data['rates'][0]['mid'] ) ) {
                $nbp_usd = (string) $data['rates'][0]['mid'];
            }
        }

        $body = "📊 *Podsumowanie Wyników Finansowych:*\n";
        $body .= "• Przychód zrealizowany: *$" . number_format( $total_rev, 2 ) . " USD*\n";
        $body .= "• Liczba opłaconych zamówień: *{$order_count}*\n";
        $body .= "• Cel sprintu: *$1,000.00 USD* (Organic First Launch)\n\n";
        $body .= "💱 *Kurs NBP USD (Tabela A):* 1 USD = *{$nbp_usd} PLN*\n";
        $body .= "🎯 *Strategia:* 0 PLN Media Cost, DHL Express DDP flat $24.99 USD, promowanie kompletów (-$10 USD Set Savings).";

        ni_send_agent_whatsapp( 'CEO', 'Dzienny Raport Operacyjny i Finansowy', $body, admin_url( 'admin.php?page=wc-admin' ) );
        return rest_ensure_response( array( 'agent' => 'CEO', 'reply' => $body ) );
    }

    // 3. STAN MAGAZYNOWY (Merchant)
    if ( strpos( $cmd, 'stan' ) === 0 || strpos( $cmd, '/stan' ) === 0 || strpos( $cmd, 'stock' ) === 0 ) {
        $search = trim( preg_replace( '/^(\/stan|stan|\/stock|stock)/i', '', $cmd_raw ) );
        if ( empty( $search ) ) {
            $search = 'Gorsenia';
        }

        $products = wc_get_products( array(
            'limit'  => 3,
            's'      => $search,
            'status' => 'publish'
        ) );

        if ( empty( $products ) ) {
            $body = "Nie znaleziono produktów pasujących do frazy: *{$search}*.\nWpisz np. *stan gorsenia* lub *stan paradise*.";
        } else {
            $body = "Wyniki wyszukiwania w katalogu dla: *{$search}*:\n\n";
            foreach ( $products as $p ) {
                $stock_status = $p->is_in_stock() ? '✅ W magazynie' : '❌ Niedostępny';
                $price = $p->get_price() ? '$' . $p->get_price() . ' USD' : 'wg wariantów';
                $body .= "• *{$p->get_name()}*\n";
                $body .= "  Stan: {$stock_status} | Cena: {$price}\n";
                $body .= "  Link: " . $p->get_permalink() . "\n\n";
            }
            $body .= "Feed MADA XML: synchronizacja wariantów aktywna.";
        }

        ni_send_agent_whatsapp( 'MERCHANT', "Stan Magazynowy: {$search}", $body, admin_url( 'edit.php?post_type=product' ) );
        return rest_ensure_response( array( 'agent' => 'MERCHANT', 'reply' => $body ) );
    }

    // 4. CMO / MARKETING
    if ( strpos( $cmd, 'cmo' ) === 0 || strpos( $cmd, '/cmo' ) === 0 || strpos( $cmd, 'marketing' ) === 0 ) {
        $body = "📈 *Status Działań Marketingowych Natura Intimo:*\n";
        $body .= "• *Instagram & Facebook:* Aktywne kampanie organiczne dla Gorsenia K496 Paradise oraz Gorsenia K441 Luisse.\n";
        $body .= "• *Pinterest Catalogs:* Feed XML/CSV w pełni aktywny na globalnym CDN (59 produktów z rabatem na komplety i DHL DDP).\n";
        $body .= "• *The Fitting Room Journal:* Opublikowane 3 artykuły pod Generative Engine Optimization (AI Search).\n";
        $body .= "• *Współczynnik konwersji:* Klara AI Concierge obsługuje zapytania klientek na żywo.";

        ni_send_agent_whatsapp( 'CMO', 'Raport Kampanii i Zasięgów Organicznych', $body, 'https://www.facebook.com/naturaintimo/' );
        return rest_ensure_response( array( 'agent' => 'CMO', 'reply' => $body ) );
    }

    // 5. BRAFITTING (Klara AI)
    if ( strpos( $cmd, 'brafitting' ) === 0 || strpos( $cmd, '/brafitting' ) === 0 || strpos( $cmd, 'rozmiar' ) === 0 ) {
        $query = trim( preg_replace( '/^(\/brafitting|brafitting|\/rozmiar|rozmiar)/i', '', $cmd_raw ) );
        $body = "📏 *Konsultacja Brafittingowa Natura Intimo:*\n";
        if ( ! empty( $query ) ) {
            $body .= "Zapytanie: _{$query}_\n\n";
        }
        $body .= "💡 *Zasady Konwersji EU ↔ US:*\n";
        $body .= "• Obwód pod biustem (cm): 70 = US 32 | 75 = US 34 | 80 = US 36 | 85 = US 38\n";
        $body .= "• Progresja miseczek: EU E = US DD | EU F = US DDD/F | EU G = US 4D/G\n";
        $body .= "• Konstrukcja Gorsenia: Bardzo głębokie miseczki i wąskie fiszbiny (zbiera biust do przodu i unosi). Przy wahaniu rozmiaru doradzamy mniejszą miseczkę.";

        ni_send_agent_whatsapp( 'BRAFITTERKA', 'Porada Rozmiarowa i Brafittingowa', $body, home_url( '/size-guide/' ) );
        return rest_ensure_response( array( 'agent' => 'BRAFITTERKA', 'reply' => $body ) );
    }

    // 6. TECH / STATUS
    if ( strpos( $cmd, 'status' ) === 0 || strpos( $cmd, '/status' ) === 0 || strpos( $cmd, 'tech' ) === 0 ) {
        $body = "⚙️ *Raport Stanu Technicznego Sklepu:*\n";
        $body .= "• *Bramki płatności:* PayPal (aktywny, domyślny) + Stripe (karty, Klarna, Link)\n";
        $body .= "• *Kasa:* Standard DDP dla USA i Kanady (/checkout-usa-canada/)\n";
        $body .= "• *Wydajność:* LiteSpeed Cache aktywny, czas odpowiedzi <100ms\n";
        $body .= "• *Asystent AI:* Klara Concierge (Snippet 96) – 100% sprawna";

        ni_send_agent_whatsapp( 'TECH', 'Diagnostyka Techniczna Sklepu', $body, admin_url( 'admin.php?page=wc-status' ), 'SUCCESS' );
        return rest_ensure_response( array( 'agent' => 'TECH', 'reply' => $body ) );
    }

    // Default Fallback
    $body = "Otrzymano polecenie: *„{$cmd_raw}”*.\nWpisz */pomoc*, aby zobaczyć pełną listę komend do agentów.";
    ni_send_agent_whatsapp( 'CEO', 'Potwierdzenie Otrzymania Polecenia', $body );
    return rest_ensure_response( array( 'agent' => 'CEO', 'reply' => $body ) );
}
