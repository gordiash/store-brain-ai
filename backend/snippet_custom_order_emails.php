<?php
/**
 * Snippet Name: Natura Intimo – Automated Post-Purchase & Cross-Border Email Customizer
 * Description: Wzbogaca transakcyjne maile WooCommerce (Processing, Completed, Customer Invoice)
 *              o sekcje wsparcia brafittingowego, zasady pielęgnacji bielizny,
 *              gwarancję Free First Size Exchange (30 dni) oraz tracking DHL Express DDP dla USA i Kanady.
 * Author: Natura Intimo Tech & Retention Team
 */

if (!defined('ABSPATH')) {
    exit;
}

// 1. Dodanie dedykowanej sekcji brafittingowej i pielęgnacyjnej do maili zamówień (Processing i Completed)
add_action('woocommerce_email_after_order_table', 'natura_intimo_custom_order_email_sections', 20, 4);

function natura_intimo_custom_order_email_sections($order, $sent_to_admin, $plain_text, $email) {
    if ($sent_to_admin) {
        return; // Tylko maile dla klientów
    }

    $email_id = isset($email->id) ? $email->id : '';
    $country = $order->get_shipping_country();
    if (empty($country)) {
        $country = $order->get_billing_country();
    }
    $is_na = in_array($country, array('US', 'CA'));

    // Sekcja 1: Śledzenie i Informacje Celne (DHL Express DDP)
    if ($email_id === 'customer_completed_order') {
        ?>
        <div style="margin: 25px 0 15px 0; padding: 18px 20px; background-color: #faf6f7; border-left: 4px solid #b86f82; border-radius: 4px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
            <h3 style="margin: 0 0 10px 0; color: #2c2523; font-size: 16px; font-weight: 600;">
                ✈️ <?php echo $is_na ? 'Direct European Air Transit & Pre-Cleared Customs' : 'Status Wysyłki'; ?>
            </h3>
            <p style="margin: 0 0 8px 0; color: #5a5250; font-size: 14px; line-height: 1.5;">
                <?php if ($is_na): ?>
                    Your order has been hand-inspected at our atelier in Poland and dispatched via <strong>DHL Express Worldwide</strong>.
                    All US/Canadian customs duties and import fees are <strong>pre-cleared (DDP)</strong> — you will never be asked for surprise delivery charges.
                <?php else: ?>
                    Twoje zamówienie zostało skompletowane i wysłane bezpośrednio z naszego atelier.
                <?php endif; ?>
            </p>
            <p style="margin: 0; color: #7a706e; font-size: 13px;">
                ⏱️ <?php echo $is_na ? 'Expected North American transit: 2–4 business days.' : 'Czas dostawy: 1-2 dni robocze.'; ?>
            </p>
        </div>
        <?php
    }

    // Sekcja 2: Gwarancja Pierwszej Darmowej Wymiany Rozmiaru (30-Day Free First Size Exchange)
    ?>
    <div style="margin: 20px 0; padding: 18px 20px; background-color: #fdfbfb; border: 1px solid #eee4e6; border-radius: 6px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
        <h3 style="margin: 0 0 8px 0; color: #2c2523; font-size: 15px; font-weight: 600;">
            ✨ <?php echo $is_na ? 'Our Perfect Fit Promise (30-Day Free Size Exchange)' : 'Gwarancja Dopasowania (Wymiana Rozmiaru)'; ?>
        </h3>
        <p style="margin: 0 0 10px 0; color: #5a5250; font-size: 13px; line-height: 1.5;">
            <?php if ($is_na): ?>
                Ordering European heritage lingerie across continents should feel effortless. If your bra band feels too snug or the cups need fine-tuning, you are covered by our <strong>Complimentary First Size Exchange</strong> within 30 days of delivery.
            <?php else: ?>
                Zależy nam na Twojej idealnej wygodzie. Jeśli potrzebujesz innego rozmiaru miseczki lub obwodu, skontaktuj się z nami w ciągu 30 dni.
            <?php endif; ?>
        </p>
        <p style="margin: 0; font-size: 13px;">
            📧 <?php echo $is_na ? 'Need a brafitting consultation? Reply to this email or reach us at' : 'Potrzebujesz konsultacji brafitterki? Napisz:'; ?>
            <a href="mailto:support@naturaintimo.com" style="color: #b86f82; font-weight: 600; text-decoration: none;">support@naturaintimo.com</a>
        </p>
    </div>

    // Sekcja 3: Poradnik Pielęgnacji Delikatnej Bielizny (Lingerie Longevity Guide)
    <div style="margin: 15px 0 25px 0; padding: 15px 20px; background-color: #ffffff; border-left: 3px solid #d4a5b0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
        <h4 style="margin: 0 0 6px 0; color: #2c2523; font-size: 14px; font-weight: 600;">
            🧼 <?php echo $is_na ? 'Atelier Care: Preserve Your Underwires & Embroidery' : 'Jak dbać o bieliznę z atelier'; ?>
        </h4>
        <ul style="margin: 0; padding-left: 18px; color: #6b6361; font-size: 12px; line-height: 1.6;">
            <li><?php echo $is_na ? 'Hand wash in lukewarm water with mild liquid detergent (or gentle cycle in a protective wash bag).' : 'Zalecamy pranie ręczne w letniej wodzie z delikatnym płynem do prania.'; ?></li>
            <li><?php echo $is_na ? 'Never tumble dry — air dry flat to maintain powernet elasticity and wire curvature.' : 'Unikaj suszarek bębnowych — susz na płasko, aby chronić fiszbiny i koronki.'; ?></li>
            <li><?php echo $is_na ? 'Store seamed and molded cups nested naturally without folding one cup inside out.' : 'Przechowuj biustonosze ułożone jeden za drugim, nie wywijając miseczek.'; ?></li>
        </ul>
    </div>
    <?php
}
