import dotenv from 'dotenv';
dotenv.config();
import axios from 'axios';

async function main() {
  const wpUser = process.env.WP_ADMIN_USER;
  const wpPass = process.env.WP_APP_PASSWORD;
  const auth = Buffer.from(`${wpUser}:${wpPass}`).toString('base64');
  const headers = { Authorization: `Basic ${auth}` };

  const php = `add_action('wp_loaded', function() {
    if (isset($_GET['debug_gla_payload'])) {
        $product = wc_get_product(3674);
        if (!$product) {
            echo json_encode(array('error' => 'Product not found'));
            exit;
        }

        // Test GLA container & product syncer
        $container = \\Automattic\\WooCommerce\\GoogleListingsAndAds\\Plugin::instance()->get_container();
        $builder = $container->get(\\Automattic\\WooCommerce\\GoogleListingsAndAds\\Product\\ProductHelper::class);
        $wc_product_adapter = $container->get(\\Automattic\\WooCommerce\\GoogleListingsAndAds\\Product\\WCProductAdapter::class);
        $google_product = $wc_product_adapter->get_google_product($product);

        $price_obj = null;
        if ($google_product && method_exists($google_product, 'getPrice')) {
            $price_obj = $google_product->getPrice();
        }

        // Check variation 4990 as well
        $var = wc_get_product(4990);
        $var_google = $var ? $wc_product_adapter->get_google_product($var) : null;
        $var_price_obj = ($var_google && method_exists($var_google, 'getPrice')) ? $var_google->getPrice() : null;

        // Check default currency and filters
        $out = array(
            'wc_currency' => get_woocommerce_currency(),
            'parent_price_raw' => $product->get_price(),
            'parent_google_price' => $price_obj ? array('value' => $price_obj->getValue(), 'currency' => $price_obj->getCurrency()) : null,
            'var_price_raw' => $var ? $var->get_price() : null,
            'var_google_price' => $var_price_obj ? array('value' => $var_price_obj->getValue(), 'currency' => $var_price_obj->getCurrency()) : null,
            'target_audience' => get_option('gla_target_audience'),
            'mc_markets' => get_option('gla_mc_markets')
        );

        header('Content-Type: application/json');
        echo json_encode($out);
        exit;
    }
});`;

  const s = await axios.post('https://naturaintimo.com/wp-json/code-snippets/v1/snippets', {
    name: 'Debug GLA Payload',
    code: php,
    scope: 'global',
    active: true
  }, { headers });

  try {
    const res = await axios.get('https://naturaintimo.com/?debug_gla_payload=1');
    console.log('GLA Payload Result:', JSON.stringify(res.data, null, 2));
  } finally {
    await axios.delete(`https://naturaintimo.com/wp-json/code-snippets/v1/snippets/${s.data.id}`, { headers });
  }
}

main().catch(console.error);
