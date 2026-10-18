import dotenv from 'dotenv';
dotenv.config();
import axios from 'axios';

async function main() {
  const wpUser = process.env.WP_ADMIN_USER;
  const wpPass = process.env.WP_APP_PASSWORD;
  const auth = Buffer.from(`${wpUser}:${wpPass}`).toString('base64');
  const headers = { Authorization: `Basic ${auth}` };

  const php = `add_action('wp_loaded', function() {
    if (isset($_GET['debug_real_mapi_input'])) {
        try {
            $container = woogle_get_container();
            $var = wc_get_product(4990);
            $parent = wc_get_product(3674);
            $market_service = $container->get(\\Automattic\\WooCommerce\\GoogleListingsAndAds\\MerchantCenter\\MarketService::class);
            $mapping_rules_query = $container->get(\\Automattic\\WooCommerce\\GoogleListingsAndAds\\DB\\Query\\AttributeMappingRulesQuery::class);
            $factory = $container->get(\\Automattic\\WooCommerce\\GoogleListingsAndAds\\Product\\ProductFactory::class);
            
            $google_product = $factory->create($var, 'US', $mapping_rules_query->get_results(), 'US', '');
            
            $price = $google_product->getPrice();
            $sale_price = $google_product->getSalePrice();
            
            $out = [
                'target_country' => $google_product->getTargetCountry(),
                'content_language' => $google_product->getContentLanguage(),
                'offer_id' => $google_product->getOfferId(),
                'price' => $price ? [
                    'value' => $price->getValue(),
                    'currency' => $price->getCurrency()
                ] : null,
                'sale_price' => $sale_price ? [
                    'value' => $sale_price->getValue(),
                    'currency' => $sale_price->getCurrency()
                ] : null,
                'title' => $google_product->getTitle()
            ];
            
            header('Content-Type: application/json');
            echo json_encode($out);
            exit;
        } catch (\\Throwable $e) {
            header('Content-Type: application/json');
            echo json_encode(['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            exit;
        }
    }
});`;

  const s = await axios.post('https://naturaintimo.com/wp-json/code-snippets/v1/snippets', {
    name: 'Debug Mapi Input',
    code: php,
    scope: 'global',
    active: true
  }, { headers });

  try {
    const res = await axios.get('https://naturaintimo.com/?debug_real_mapi_input=1');
    console.log('Real Mapi Input for variation 4990:');
    console.log(JSON.stringify(res.data, null, 2));
  } finally {
    await axios.delete(`https://naturaintimo.com/wp-json/code-snippets/v1/snippets/${s.data.id}`, { headers });
  }
}

main().catch(console.error);
