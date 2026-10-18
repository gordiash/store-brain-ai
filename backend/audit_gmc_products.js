import dotenv from 'dotenv';
dotenv.config();
import axios from 'axios';

async function main() {
  const wpUser = process.env.WP_ADMIN_USER;
  const wpPass = process.env.WP_APP_PASSWORD;
  const auth = Buffer.from(`${wpUser}:${wpPass}`).toString('base64');
  const headers = { Authorization: `Basic ${auth}` };

  const php = `add_action('wp_loaded', function() {
    if (isset($_GET['audit_all_gmc_products'])) {
        try {
            $container = woogle_get_container();
            $client = $container->get(\\Automattic\\WooCommerce\\GoogleListingsAndAds\\API\\Google\\Mapi\\MerchantApiClient::class);
            $merchant_id = get_option('gla_merchant_id');
            
            $products = [];
            $next_page = '';
            $page_count = 0;
            
            do {
                $endpoint = sprintf('%s/accounts/%s/products?pageSize=250%s', 
                    \\Automattic\\WooCommerce\\GoogleListingsAndAds\\API\\Google\\Mapi\\MapiPaths::PRODUCTS, 
                    $merchant_id,
                    $next_page ? '&pageToken=' . urlencode($next_page) : ''
                );
                $res = $client->get($endpoint);
                if (!empty($res['products'])) {
                    foreach ($res['products'] as $p) {
                        $products[] = [
                            'name' => $p['name'] ?? '',
                            'offerId' => $p['offerId'] ?? '',
                            'contentLanguage' => $p['contentLanguage'] ?? '',
                            'feedLabel' => $p['feedLabel'] ?? '',
                            'dataSource' => $p['dataSource'] ?? '',
                            'currency' => $p['productAttributes']['price']['currencyCode'] ?? '',
                            'amount' => $p['productAttributes']['price']['amountMicros'] ?? '',
                            'title' => $p['productAttributes']['title'] ?? ''
                        ];
                    }
                }
                $next_page = $res['nextPageToken'] ?? '';
                $page_count++;
            } while (!empty($next_page) && $page_count < 10);
            
            header('Content-Type: application/json');
            echo json_encode([
                'total' => count($products),
                'by_lang' => array_count_values(array_column($products, 'contentLanguage')),
                'by_currency' => array_count_values(array_column($products, 'currency')),
                'by_datasource' => array_count_values(array_column($products, 'dataSource')),
                'sample' => array_slice($products, 0, 10)
            ]);
            exit;
        } catch (\\Throwable $e) {
            header('Content-Type: application/json');
            echo json_encode(['error' => $e->getMessage()]);
            exit;
        }
    }
});`;

  const s = await axios.post('https://naturaintimo.com/wp-json/code-snippets/v1/snippets', {
    name: 'Audit All GMC Products',
    code: php,
    scope: 'global',
    active: true
  }, { headers });

  try {
    const res = await axios.get('https://naturaintimo.com/?audit_all_gmc_products=1');
    console.log(JSON.stringify(res.data, null, 2));
  } finally {
    await axios.delete(`https://naturaintimo.com/wp-json/code-snippets/v1/snippets/${s.data.id}`, { headers });
  }
}

main().catch(console.error);
