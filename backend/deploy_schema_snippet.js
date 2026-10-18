import dotenv from 'dotenv';
dotenv.config();
import axios from 'axios';

async function deploySchemaSnippet() {
  const wpUser = process.env.WP_ADMIN_USER;
  const wpPass = process.env.WP_APP_PASSWORD;
  const auth = Buffer.from(`${wpUser}:${wpPass}`).toString('base64');
  const headers = { Authorization: `Basic ${auth}` };

  const snippetCode = `/**
 * Snippet Name: Natura Intimo – Enhanced Google Merchant & Schema.org Structured Data
 * Description: Injects shippingDetails (DHL Express Worldwide DDP) and hasMerchantReturnPolicy (30-day returns) into Product schema for Google Merchant & Rich Results.
 */

if (!defined('ABSPATH')) {
    exit;
}

add_filter('woocommerce_structured_data_product_offer', 'ni_enrich_schema_product_offer', 20, 2);
function ni_enrich_schema_product_offer($offer, $product) {
    if (!$offer || !is_array($offer)) {
        return $offer;
    }

    // 1. Shipping Details: DHL Express Worldwide DDP
    $offer['shippingDetails'] = array(
        '@type' => 'OfferShippingDetails',
        'shippingRate' => array(
            '@type' => 'MonetaryAmount',
            'value' => '19.99',
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

    // 2. Merchant Return Policy: 30-day window
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
`;

  console.log('Creating Snippet #14: Enhanced Google Merchant & Schema.org Structured Data...');
  const res = await axios.post('https://naturaintimo.com/wp-json/code-snippets/v1/snippets', {
    name: 'Natura Intimo – Enhanced Google Merchant & Schema.org Structured Data',
    code: snippetCode,
    active: true,
    scope: 'global'
  }, { headers });

  console.log('Snippet created successfully! ID:', res.data.id, 'Active:', res.data.active);
}

deploySchemaSnippet().catch(console.error);
