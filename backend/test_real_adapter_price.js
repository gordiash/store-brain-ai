import dotenv from 'dotenv';
dotenv.config();
import axios from 'axios';

async function main() {
  const wpUser = process.env.WP_ADMIN_USER;
  const wpPass = process.env.WP_APP_PASSWORD;
  const auth = Buffer.from(`${wpUser}:${wpPass}`).toString('base64');
  const headers = { Authorization: `Basic ${auth}` };

  const php = `add_action('wp_loaded', function() {
    if (isset($_GET['test_real_adapter_price'])) {
        $parent = wc_get_product(3674);
        $variation = wc_get_product(4990);
        
        // Find how GLA creates Google product
        $adapter = new \\Automattic\\WooCommerce\\GoogleListingsAndAds\\Product\\WCProductAdapter();
        $adapter->mapTypes([
            'wc_product' => $variation,
            'parent_wc_product' => $parent,
            'targetCountry' => 'US'
        ]);
        
        $price = $adapter->getPrice();
        $sale_price = $adapter->getSalePrice();
        
        $res = [
            'store_currency' => get_woocommerce_currency(),
            'var_price' => $variation ? $variation->get_price() : null,
            'gla_price_value' => $price ? $price->getValue() : null,
            'gla_price_currency' => $price ? $price->getCurrency() : null,
            'gla_sale_price_value' => $sale_price ? $sale_price->getValue() : null,
            'gla_sale_price_currency' => $sale_price ? $sale_price->getCurrency() : null,
        ];

        header('Content-Type: application/json');
        echo json_encode($res);
        exit;
    }
});`;

  const s = await axios.post('https://naturaintimo.com/wp-json/code-snippets/v1/snippets', {
    name: 'Test Real Adapter Price',
    code: php,
    scope: 'global',
    active: true
  }, { headers });

  try {
    const res = await axios.get('https://naturaintimo.com/?test_real_adapter_price=1');
    console.log('Real Adapter Output:\n', JSON.stringify(res.data, null, 2));
  } finally {
    await axios.delete(`https://naturaintimo.com/wp-json/code-snippets/v1/snippets/${s.data.id}`, { headers });
  }
}

main().catch(console.error);
