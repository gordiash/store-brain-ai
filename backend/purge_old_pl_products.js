import dotenv from 'dotenv';
dotenv.config();
import axios from 'axios';

async function main() {
  const wpUser = process.env.WP_ADMIN_USER;
  const wpPass = process.env.WP_APP_PASSWORD;
  const auth = Buffer.from(`${wpUser}:${wpPass}`).toString('base64');
  const headers = { Authorization: `Basic ${auth}` };

  const php = `add_action('wp_loaded', function() {
    if (isset($_GET['purge_old_pl_products'])) {
        try {
            $container = woogle_get_container();
            $client = $container->get(\\Automattic\\WooCommerce\\GoogleListingsAndAds\\API\\Google\\Mapi\\MerchantApiClient::class);
            $merchant_id = get_option('gla_merchant_id');
            
            $next_page = '';
            $deleted = [];
            $errors = [];
            
            do {
                $endpoint = sprintf('%s/accounts/%s/products?pageSize=250%s', 
                    \\Automattic\\WooCommerce\\GoogleListingsAndAds\\API\\Google\\Mapi\\MapiPaths::PRODUCTS, 
                    $merchant_id,
                    $next_page ? '&pageToken=' . urlencode($next_page) : ''
                );
                $res = $client->get($endpoint);
                if (!empty($res['products'])) {
                    foreach ($res['products'] as $p) {
                        if (($p['contentLanguage'] ?? '') === 'pl') {
                            $name = $p['base64EncodedName'] ?? $p['name'];
                            // Extract just the part after products/
                            $parts = explode('/products/', $name);
                            $prod_id = end($parts);
                            try {
                                $client->delete(sprintf('%s/accounts/%s/products/%s', 
                                    \\Automattic\\WooCommerce\\GoogleListingsAndAds\\API\\Google\\Mapi\\MapiPaths::PRODUCTS, 
                                    $merchant_id, 
                                    $prod_id
                                ));
                                $deleted[] = $p['offerId'] ?? $prod_id;
                            } catch (\\Throwable $e) {
                                $errors[] = [
                                    'offerId' => $p['offerId'] ?? $prod_id,
                                    'error' => $e->getMessage()
                                ];
                            }
                        }
                    }
                }
                $next_page = $res['nextPageToken'] ?? '';
            } while (!empty($next_page));
            
            header('Content-Type: application/json');
            echo json_encode([
                'deleted_count' => count($deleted),
                'deleted' => $deleted,
                'errors' => $errors
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
    name: 'Purge Old PL Products',
    code: php,
    scope: 'global',
    active: true
  }, { headers });

  try {
    const res = await axios.get('https://naturaintimo.com/?purge_old_pl_products=1');
    console.log(JSON.stringify(res.data, null, 2));
  } finally {
    await axios.delete(`https://naturaintimo.com/wp-json/code-snippets/v1/snippets/${s.data.id}`, { headers });
  }
}

main().catch(console.error);
