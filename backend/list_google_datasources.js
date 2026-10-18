import dotenv from 'dotenv';
dotenv.config();
import axios from 'axios';

async function main() {
  const wpUser = process.env.WP_ADMIN_USER;
  const wpPass = process.env.WP_APP_PASSWORD;
  const auth = Buffer.from(`${wpUser}:${wpPass}`).toString('base64');
  const headers = { Authorization: `Basic ${auth}` };

  const php = `add_action('wp_loaded', function() {
    if (isset($_GET['list_google_datasources'])) {
        try {
            $container = \\Automattic\\WooCommerce\\GoogleListingsAndAds\\Plugin::instance()->get_container();
            $client = $container->get(\\Automattic\\WooCommerce\\GoogleListingsAndAds\\API\\Google\\Mapi\\MerchantApiClient::class);
            $merchant_id = get_option('gla_merchant_id');
            $parent = "accounts/{$merchant_id}";
            
            $service = $client->get_data_sources_service();
            $res = $service->listDataSources($parent);
            
            $sources = [];
            foreach ($res->getDataSources() as $ds) {
                $sources[] = [
                    'name' => $ds->getName(),
                    'displayName' => $ds->getDisplayName(),
                    'primary' => $ds->getPrimaryProductDataSource() ? [
                        'channel' => $ds->getPrimaryProductDataSource()->getChannel(),
                        'feedLabel' => $ds->getPrimaryProductDataSource()->getFeedLabel(),
                        'contentLanguage' => $ds->getPrimaryProductDataSource()->getContentLanguage(),
                        'countries' => $ds->getPrimaryProductDataSource()->getCountries(),
                        'defaultRule' => $ds->getPrimaryProductDataSource()->getDefaultRule()
                    ] : null
                ];
            }
            
            header('Content-Type: application/json');
            echo json_encode($sources);
            exit;
        } catch (\\Throwable $e) {
            header('Content-Type: application/json');
            echo json_encode(['error' => $e->getMessage()]);
            exit;
        }
    }
});`;

  const s = await axios.post('https://naturaintimo.com/wp-json/code-snippets/v1/snippets', {
    name: 'List Google DataSources',
    code: php,
    scope: 'global',
    active: true
  }, { headers });

  try {
    const res = await axios.get('https://naturaintimo.com/?list_google_datasources=1');
    console.log('Google DataSources in Merchant Center:');
    console.log(JSON.stringify(res.data, null, 2));
  } finally {
    await axios.delete(`https://naturaintimo.com/wp-json/code-snippets/v1/snippets/${s.data.id}`, { headers });
  }
}

main().catch(console.error);
